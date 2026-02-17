import type { Pool } from 'pg';

export interface SystemAlert {
  id: string;
  alertType: string;
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  metadata?: any;
}

export interface CreateAlertInput {
  alertType: string;
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: any;
}

export interface AlertsResult {
  alerts: SystemAlert[];
  total: number;
}

/**
 * SystemAlertService - Gestion de la table system_alerts
 * Auto-création d'alertes basées sur seuils (DB lente, memory haute, etc.)
 */
export class SystemAlertService {
  constructor(private pool: Pool) {}

  /**
   * Créer une alerte
   */
  async createAlert(data: CreateAlertInput): Promise<string> {
    try {
      const result = await this.pool.query<{ id: string }>(
        `INSERT INTO system_alerts (
          alert_type, title, description, severity, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          data.alertType,
          data.title,
          data.description || null,
          data.severity,
          'active',
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('[SystemAlertService] Failed to create alert:', error);
      throw error;
    }
  }

  /**
   * Récupérer les alertes avec filtres
   */
  async getAlerts(params: {
    status?: 'active' | 'acknowledged' | 'resolved';
    severity?: 'info' | 'warning' | 'critical';
    limit?: number;
    offset?: number;
  }): Promise<AlertsResult> {
    const { status, severity, limit = 50, offset = 0 } = params;

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM system_alerts
      WHERE ($1::VARCHAR IS NULL OR status = $1)
        AND ($2::VARCHAR IS NULL OR severity = $2)
    `;

    const countResult = await this.pool.query<{ total: string }>(countQuery, [
      status || null,
      severity || null,
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    // Get alerts
    const alertsQuery = `
      SELECT
        id, alert_type as "alertType", title, description, severity, status,
        created_at as "createdAt", acknowledged_at as "acknowledgedAt",
        resolved_at as "resolvedAt", resolved_by as "resolvedBy",
        resolution_notes as "resolutionNotes", metadata
      FROM system_alerts
      WHERE ($1::VARCHAR IS NULL OR status = $1)
        AND ($2::VARCHAR IS NULL OR severity = $2)
      ORDER BY
        CASE status
          WHEN 'active' THEN 1
          WHEN 'acknowledged' THEN 2
          WHEN 'resolved' THEN 3
        END,
        created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const alertsResult = await this.pool.query<SystemAlert>(alertsQuery, [
      status || null,
      severity || null,
      limit,
      offset,
    ]);

    return {
      alerts: alertsResult.rows,
      total,
    };
  }

  /**
   * Acquitter une alerte
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE system_alerts
         SET status = 'acknowledged', acknowledged_at = NOW()
         WHERE id = $1 AND status = 'active'
         RETURNING id`,
        [alertId]
      );

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('[SystemAlertService] Failed to acknowledge alert:', error);
      return false;
    }
  }

  /**
   * Résoudre une alerte
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE system_alerts
         SET status = 'resolved',
             resolved_at = NOW(),
             resolved_by = $2,
             resolution_notes = $3
         WHERE id = $1 AND status IN ('active', 'acknowledged')
         RETURNING id`,
        [alertId, resolvedBy, resolutionNotes || null]
      );

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('[SystemAlertService] Failed to resolve alert:', error);
      return false;
    }
  }

  /**
   * Vérifier et créer alertes basées sur seuils
   * Appelé périodiquement ou après health check
   */
  async checkThresholdsAndCreateAlerts(healthData: {
    dbResponseTime: number;
    memoryPercent: number;
    cpuPercent: number;
  }): Promise<void> {
    // DB lente > 1000ms
    if (healthData.dbResponseTime > 1000) {
      await this.createAlertIfNotExists('database_slow', {
        alertType: 'database_slow',
        title: 'Base de données lente',
        description: `Temps de réponse: ${healthData.dbResponseTime}ms (seuil: 1000ms)`,
        severity: 'warning',
        metadata: { responseTime: healthData.dbResponseTime },
      });
    }

    // Memory > 80%
    if (healthData.memoryPercent > 80) {
      await this.createAlertIfNotExists('memory_high', {
        alertType: 'memory_high',
        title: 'Mémoire élevée',
        description: `Utilisation: ${healthData.memoryPercent}% (seuil: 80%)`,
        severity: healthData.memoryPercent > 90 ? 'critical' : 'warning',
        metadata: { percent: healthData.memoryPercent },
      });
    }

    // CPU > 80%
    if (healthData.cpuPercent > 80) {
      await this.createAlertIfNotExists('cpu_high', {
        alertType: 'cpu_high',
        title: 'CPU élevé',
        description: `Utilisation: ${healthData.cpuPercent}% (seuil: 80%)`,
        severity: healthData.cpuPercent > 90 ? 'critical' : 'warning',
        metadata: { percent: healthData.cpuPercent },
      });
    }
  }

  /**
   * Créer une alerte seulement si elle n'existe pas déjà en status active
   */
  private async createAlertIfNotExists(
    alertType: string,
    data: CreateAlertInput
  ): Promise<void> {
    try {
      // Check si alerte active existe
      const existing = await this.pool.query(
        `SELECT id FROM system_alerts
         WHERE alert_type = $1 AND status = 'active'
         LIMIT 1`,
        [alertType]
      );

      if (existing.rows.length === 0) {
        await this.createAlert(data);
      }
    } catch (error) {
      console.error('[SystemAlertService] Failed to check/create alert:', error);
    }
  }

  /**
   * Nettoyer les alertes résolues > 30 jours
   */
  async cleanup(): Promise<number> {
    try {
      const result = await this.pool.query(
        `DELETE FROM system_alerts
         WHERE status = 'resolved'
           AND resolved_at < NOW() - INTERVAL '30 days'
         RETURNING id`
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('[SystemAlertService] Cleanup failed:', error);
      return 0;
    }
  }
}
