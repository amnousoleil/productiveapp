/**
 * Module Comptabilité - Service Alertes
 * @description Génération et gestion des alertes comptables
 * (factures en retard, échéances, dépassements budgétaires)
 */
import { Pool } from 'pg';
import { AccountingAlert, AlertCounts } from './accounting.types.js';
export declare const initAlertsService: (dbPool: Pool) => void;
/**
 * Analyse les données et génère les alertes pertinentes:
 * - Factures en retard de paiement
 * - Échéances à venir (J-7, J-3)
 * - Dépassements budgétaires (80%, 100%)
 * - Paiements importants reçus
 *
 * Les alertes ne sont créées que si elles n'existent pas déjà (dédoublonnage)
 */
export declare const generateAlerts: (workspaceId: string) => Promise<AccountingAlert[]>;
/**
 * Récupère les alertes, optionnellement filtrées sur les non-lues
 */
export declare const listAlerts: (workspaceId: string, unreadOnly?: boolean) => Promise<AccountingAlert[]>;
/**
 * Marque une alerte comme lue
 */
export declare const markAlertRead: (workspaceId: string, alertId: string) => Promise<boolean>;
/**
 * Rejette/masque une alerte (is_dismissed = true)
 */
export declare const dismissAlert: (workspaceId: string, alertId: string) => Promise<boolean>;
/**
 * Retourne le nombre d'alertes par sévérité
 */
export declare const getAlertCounts: (workspaceId: string) => Promise<AlertCounts>;
//# sourceMappingURL=accounting.alerts.d.ts.map