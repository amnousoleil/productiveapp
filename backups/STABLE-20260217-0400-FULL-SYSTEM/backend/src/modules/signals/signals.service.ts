/**
 * Behavioral Signals Service
 * Records user behavioral signals for analytics
 * ProductiveApp v4.0
 */

import { sql } from '../../config/database.js';
import { generateUUID } from '../../utils/helpers.js';

export interface Signal {
  id: string;
  user_id: string;
  workspace_id: string;
  signal_type: string;
  source_module: string;
  source_id?: string;
  payload: Record<string, unknown>;
  created_at: Date;
}

export interface SignalFilters {
  type?: string;
  source?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export async function recordSignal(
  userId: string,
  workspaceId: string,
  signalType: string,
  sourceModule: string,
  sourceId: string | null,
  payload: Record<string, unknown> = {},
  occurredAt?: Date
): Promise<Signal> {
  const id = generateUUID();
  const timestamp = occurredAt || new Date();
  const result = await sql`
    INSERT INTO behavioral_signals (id, user_id, workspace_id, signal_type, source_module, source_id, payload, created_at)
    VALUES (${id}, ${userId}, ${workspaceId}, ${signalType}, ${sourceModule}, ${sourceId}, ${JSON.stringify(payload)}, ${timestamp})
    RETURNING *
  `;
  return result[0] as Signal;
}

/**
 * Fire-and-forget signal recording - never blocks main flow
 */
export function recordSignalAsync(
  userId: string,
  workspaceId: string,
  signalType: string,
  sourceModule: string,
  sourceId: string | null,
  payload: Record<string, unknown> = {}
): void {
  recordSignal(userId, workspaceId, signalType, sourceModule, sourceId, payload).catch((error) => {
    console.error('⚠️ Failed to record signal:', signalType, error instanceof Error ? error.message : error);
  });
}

export async function getSignals(userId: string, filters: SignalFilters = {}): Promise<Signal[]> {
  const limit = filters.limit || 100;

  let result;
  if (filters.type && filters.source) {
    result = await sql`
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND signal_type = ${filters.type} AND source_module = ${filters.source}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  } else if (filters.type) {
    result = await sql`
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND signal_type = ${filters.type}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  } else if (filters.source) {
    result = await sql`
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND source_module = ${filters.source}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  } else {
    result = await sql`
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  }

  return result as unknown as Signal[];
}

export async function deleteSignal(signalId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM behavioral_signals WHERE id = ${signalId} AND user_id = ${userId}
  `;
  return result.count > 0;
}

export interface SignalStats {
  total_signals: number;
  signals_by_type: Record<string, number>;
  signals_by_source: Record<string, number>;
  recent_activity: { date: string; count: number }[];
}

export async function getSignalStats(userId: string): Promise<SignalStats> {
  const [totalResult, byTypeResult, bySourceResult, recentResult] = await Promise.all([
    sql`SELECT COUNT(*) as total FROM behavioral_signals WHERE user_id = ${userId}`,
    sql`SELECT signal_type, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} GROUP BY signal_type`,
    sql`SELECT source_module, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} GROUP BY source_module`,
    sql`SELECT DATE(created_at) as date, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date DESC`
  ]);

  const signals_by_type: Record<string, number> = {};
  for (const row of byTypeResult) {
    signals_by_type[row.signal_type as string] = Number(row.count);
  }

  const signals_by_source: Record<string, number> = {};
  for (const row of bySourceResult) {
    signals_by_source[row.source_module as string] = Number(row.count);
  }

  const recent_activity = recentResult.map(row => ({
    date: String(row.date),
    count: Number(row.count)
  }));

  return {
    total_signals: Number(totalResult[0]?.total || 0),
    signals_by_type,
    signals_by_source,
    recent_activity
  };
}

export interface UserProfile {
  user_id: string;
  total_signals: number;
  first_signal_at: Date | null;
  last_signal_at: Date | null;
  most_active_module: string | null;
  most_common_signal: string | null;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const result = await sql`
    SELECT
      user_id,
      COUNT(*) as total_signals,
      MIN(created_at) as first_signal_at,
      MAX(created_at) as last_signal_at,
      MODE() WITHIN GROUP (ORDER BY source_module) as most_active_module,
      MODE() WITHIN GROUP (ORDER BY signal_type) as most_common_signal
    FROM behavioral_signals
    WHERE user_id = ${userId}
    GROUP BY user_id
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    user_id: row.user_id as string,
    total_signals: Number(row.total_signals),
    first_signal_at: row.first_signal_at as Date | null,
    last_signal_at: row.last_signal_at as Date | null,
    most_active_module: row.most_active_module as string | null,
    most_common_signal: row.most_common_signal as string | null
  };
}

