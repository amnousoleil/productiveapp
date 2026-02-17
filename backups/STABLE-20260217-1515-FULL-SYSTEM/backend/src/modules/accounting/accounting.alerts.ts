/**
 * Module Comptabilité - Service Alertes
 * @description Génération et gestion des alertes comptables
 * (factures en retard, échéances, dépassements budgétaires)
 */

import { Pool } from 'pg';
import {
  AccountingAlert,
  AlertType,
  AlertSeverity,
  AlertCounts
} from './accounting.types.js';

let pool: Pool;

export const initAlertsService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// GÉNÉRATION AUTOMATIQUE DES ALERTES
// ============================================

/**
 * Analyse les données et génère les alertes pertinentes:
 * - Factures en retard de paiement
 * - Échéances à venir (J-7, J-3)
 * - Dépassements budgétaires (80%, 100%)
 * - Paiements importants reçus
 *
 * Les alertes ne sont créées que si elles n'existent pas déjà (dédoublonnage)
 */
export const generateAlerts = async (
  workspaceId: string
): Promise<AccountingAlert[]> => {
  const generatedAlerts: AccountingAlert[] = [];

  try {
    // 1. Factures en retard (date_echeance dépassée, statut != paid)
    const overdueResult = await pool.query(
      `SELECT id, fournisseur, reference, montant_ttc, date_echeance,
              EXTRACT(DAY FROM NOW() - date_echeance)::int as days_overdue
       FROM invoices
       WHERE workspace_id = $1
         AND status NOT IN ('paid', 'cancelled')
         AND date_echeance IS NOT NULL
         AND date_echeance < CURRENT_DATE
       ORDER BY date_echeance ASC`,
      [workspaceId]
    );

    for (const inv of overdueResult.rows) {
      const severity: AlertSeverity = inv.days_overdue > 30 ? 'critical' : inv.days_overdue > 7 ? 'warning' : 'info';
      const alert = await createAlertIfNotExists(workspaceId, {
        type: 'overdue_invoice',
        severity,
        title: `Facture en retard: ${inv.fournisseur}`,
        message: `La facture ${inv.reference || inv.id.substring(0, 8)} de ${inv.fournisseur} (${parseFloat(inv.montant_ttc).toFixed(2)} EUR) est en retard de ${inv.days_overdue} jour(s).`,
        related_entity_id: inv.id,
        related_entity_type: 'invoice',
        metadata: {
          days_overdue: inv.days_overdue,
          amount: parseFloat(inv.montant_ttc),
          fournisseur: inv.fournisseur
        }
      });
      if (alert) generatedAlerts.push(alert);
    }

    // 2. Échéances à venir (dans les 7 prochains jours)
    const upcomingResult = await pool.query(
      `SELECT id, fournisseur, reference, montant_ttc, date_echeance,
              EXTRACT(DAY FROM date_echeance - NOW())::int as days_until
       FROM invoices
       WHERE workspace_id = $1
         AND status NOT IN ('paid', 'cancelled')
         AND date_echeance IS NOT NULL
         AND date_echeance >= CURRENT_DATE
         AND date_echeance <= CURRENT_DATE + INTERVAL '7 days'
       ORDER BY date_echeance ASC`,
      [workspaceId]
    );

    for (const inv of upcomingResult.rows) {
      const severity: AlertSeverity = inv.days_until <= 1 ? 'warning' : 'info';
      const alert = await createAlertIfNotExists(workspaceId, {
        type: 'upcoming_deadline',
        severity,
        title: `Échéance proche: ${inv.fournisseur}`,
        message: `La facture ${inv.reference || inv.id.substring(0, 8)} de ${inv.fournisseur} (${parseFloat(inv.montant_ttc).toFixed(2)} EUR) arrive à échéance dans ${inv.days_until} jour(s).`,
        related_entity_id: inv.id,
        related_entity_type: 'invoice',
        metadata: {
          days_until: inv.days_until,
          amount: parseFloat(inv.montant_ttc),
          fournisseur: inv.fournisseur
        }
      });
      if (alert) generatedAlerts.push(alert);
    }

    // 3. Dépassements budgétaires
    const currentYear = new Date().getFullYear();
    const budgetResult = await pool.query(
      `SELECT
        bl.id as budget_id,
        bl.department_id,
        d.name as department_name,
        bl.budget_amount as allocated_amount,
        COALESCE(actual.total, 0) as actual_amount
       FROM budget_lines bl
       JOIN departments d ON bl.department_id = d.id
       LEFT JOIN LATERAL (
         SELECT SUM(i.montant_ttc) as total
         FROM invoices i
         WHERE i.workspace_id = bl.workspace_id
           AND i.type = 'expense'
           AND i.department_id = bl.department_id
           AND EXTRACT(YEAR FROM i.date_facture) = bl.year
       ) actual ON true
       WHERE bl.workspace_id = $1 AND bl.year = $2 AND bl.month IS NULL`,
      [workspaceId, currentYear]
    );

    for (const budget of budgetResult.rows) {
      const allocated = parseFloat(budget.allocated_amount);
      const actual = parseFloat(budget.actual_amount);

      if (allocated <= 0) continue;

      const utilization = (actual / allocated) * 100;

      if (utilization >= 100) {
        const alert = await createAlertIfNotExists(workspaceId, {
          type: 'budget_exceeded',
          severity: 'critical',
          title: `Budget dépassé: ${budget.department_name}`,
          message: `Le département ${budget.department_name} a dépassé son budget annuel: ${actual.toFixed(2)} EUR dépensés sur ${allocated.toFixed(2)} EUR alloués (${utilization.toFixed(1)}%).`,
          related_entity_id: budget.budget_id,
          related_entity_type: 'budget_line',
          metadata: {
            department_id: budget.department_id,
            allocated: allocated,
            actual: actual,
            utilization_pct: utilization
          }
        });
        if (alert) generatedAlerts.push(alert);
      } else if (utilization >= 80) {
        const alert = await createAlertIfNotExists(workspaceId, {
          type: 'budget_warning',
          severity: 'warning',
          title: `Budget en alerte: ${budget.department_name}`,
          message: `Le département ${budget.department_name} a utilisé ${utilization.toFixed(1)}% de son budget annuel (${actual.toFixed(2)} EUR / ${allocated.toFixed(2)} EUR).`,
          related_entity_id: budget.budget_id,
          related_entity_type: 'budget_line',
          metadata: {
            department_id: budget.department_id,
            allocated: allocated,
            actual: actual,
            utilization_pct: utilization
          }
        });
        if (alert) generatedAlerts.push(alert);
      }
    }

    return generatedAlerts;
  } catch (error) {
    throw new Error(`Erreur génération alertes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// LISTE DES ALERTES
// ============================================

/**
 * Récupère les alertes, optionnellement filtrées sur les non-lues
 */
export const listAlerts = async (
  workspaceId: string,
  unreadOnly?: boolean
): Promise<AccountingAlert[]> => {
  try {
    let whereClause = 'WHERE workspace_id = $1 AND is_dismissed = false';

    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    const result = await pool.query<AccountingAlert>(
      `SELECT * FROM accounting_alerts
       ${whereClause}
       ORDER BY
         CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
         created_at DESC`,
      [workspaceId]
    );

    return result.rows;
  } catch (error) {
    throw new Error(`Erreur liste alertes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// MARQUER COMME LU
// ============================================

/**
 * Marque une alerte comme lue
 */
export const markAlertRead = async (
  workspaceId: string,
  alertId: string
): Promise<boolean> => {
  try {
    const result = await pool.query(
      `UPDATE accounting_alerts
       SET is_read = true, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [alertId, workspaceId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    throw new Error(`Erreur marquage alerte lue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// REJETER UNE ALERTE
// ============================================

/**
 * Rejette/masque une alerte (is_dismissed = true)
 */
export const dismissAlert = async (
  workspaceId: string,
  alertId: string
): Promise<boolean> => {
  try {
    const result = await pool.query(
      `UPDATE accounting_alerts
       SET is_dismissed = true, is_read = true, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [alertId, workspaceId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    throw new Error(`Erreur rejet alerte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// COMPTEURS PAR SÉVÉRITÉ
// ============================================

/**
 * Retourne le nombre d'alertes par sévérité
 */
export const getAlertCounts = async (
  workspaceId: string
): Promise<AlertCounts> => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN severity = 'info' AND is_dismissed = false THEN 1 END) as info,
        COUNT(CASE WHEN severity = 'warning' AND is_dismissed = false THEN 1 END) as warning,
        COUNT(CASE WHEN severity = 'critical' AND is_dismissed = false THEN 1 END) as critical
       FROM accounting_alerts
       WHERE workspace_id = $1 AND is_dismissed = false`,
      [workspaceId]
    );

    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      unread: parseInt(row.unread, 10),
      info: parseInt(row.info, 10),
      warning: parseInt(row.warning, 10),
      critical: parseInt(row.critical, 10)
    };
  } catch (error) {
    throw new Error(`Erreur comptage alertes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// UTILITAIRES INTERNES
// ============================================

interface CreateAlertData {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Crée une alerte uniquement si une alerte similaire n'existe pas déjà
 * (dédoublonnage par type + related_entity_id dans les 24 dernières heures)
 */
const createAlertIfNotExists = async (
  workspaceId: string,
  data: CreateAlertData
): Promise<AccountingAlert | null> => {
  // Vérifier si une alerte similaire existe déjà (non rejetée, < 24h)
  const existing = await pool.query(
    `SELECT id FROM accounting_alerts
     WHERE workspace_id = $1
       AND type = $2
       AND related_entity_id = $3
       AND is_dismissed = false
       AND created_at > NOW() - INTERVAL '24 hours'`,
    [workspaceId, data.type, data.related_entity_id]
  );

  if (existing.rows.length > 0) {
    return null; // Alerte déjà existante
  }

  const result = await pool.query<AccountingAlert>(
    `INSERT INTO accounting_alerts (
      workspace_id, type, severity, title, message,
      related_entity_id, related_entity_type, is_read, is_dismissed, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, $8)
    RETURNING *`,
    [
      workspaceId,
      data.type,
      data.severity,
      data.title,
      data.message,
      data.related_entity_id,
      data.related_entity_type,
      data.metadata ? JSON.stringify(data.metadata) : null
    ]
  );

  return result.rows[0];
};
