/**
 * Module Time Tracking - Service
 * @description Suivi du temps, chronometre, feuilles de temps, rapports
 */
import { Pool } from 'pg';

let pool: Pool;
export const initTimeTrackingService = (p: Pool): void => { pool = p; };

export const startTimer = async (wid: string, mid: string, data: { taskId?: string; projectId?: string; description?: string; isBillable?: boolean; hourlyRate?: number }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Stop any running timer
    const running = await client.query(
      `UPDATE time_entries SET end_time = NOW(), duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60, is_running = false, updated_at = NOW()
       WHERE workspace_id = $1 AND member_id = $2 AND is_running = true RETURNING id, duration_minutes, hourly_rate, is_billable`,
      [wid, mid]
    );
    for (const r of running.rows) {
      if (r.is_billable && r.hourly_rate) {
        await client.query('UPDATE time_entries SET billable_amount = ROUND((duration_minutes / 60.0) * hourly_rate, 2) WHERE id = $1', [r.id]);
      }
    }
    const result = await client.query(
      `INSERT INTO time_entries (workspace_id, member_id, task_id, project_id, description, start_time, is_running, is_billable, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, NOW(), true, $6, $7) RETURNING *`,
      [wid, mid, data.taskId || null, data.projectId || null, data.description || null, data.isBillable ?? false, data.hourlyRate || null]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
};

export const stopTimer = async (wid: string, mid: string) => {
  const result = await pool.query(
    `UPDATE time_entries SET end_time = NOW(), duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60, is_running = false, updated_at = NOW()
     WHERE workspace_id = $1 AND member_id = $2 AND is_running = true RETURNING *`,
    [wid, mid]
  );
  if (!result.rows[0]) return null;
  const e = result.rows[0];
  if (e.is_billable && e.hourly_rate) {
    const amt = Math.round((e.duration_minutes / 60.0) * e.hourly_rate * 100) / 100;
    return (await pool.query('UPDATE time_entries SET billable_amount = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [amt, e.id])).rows[0];
  }
  return e;
};

export const getRunningTimer = async (wid: string, mid: string) => {
  const r = await pool.query(
    `SELECT te.*, t.title AS task_name, p.name AS project_name, EXTRACT(EPOCH FROM (NOW() - te.start_time)) / 60 AS elapsed_minutes
     FROM time_entries te LEFT JOIN tasks t ON te.task_id = t.id LEFT JOIN projects p ON te.project_id = p.id
     WHERE te.workspace_id = $1 AND te.member_id = $2 AND te.is_running = true LIMIT 1`,
    [wid, mid]
  );
  return r.rows[0] || null;
};

export const createManualEntry = async (wid: string, mid: string, data: { taskId?: string; projectId?: string; description?: string; startTime: string; endTime: string; durationMinutes?: number; isBillable?: boolean; hourlyRate?: number }) => {
  const dur = data.durationMinutes || (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 60000;
  const amt = (data.isBillable && data.hourlyRate) ? Math.round((dur / 60.0) * data.hourlyRate * 100) / 100 : null;
  const r = await pool.query(
    `INSERT INTO time_entries (workspace_id, member_id, task_id, project_id, description, start_time, end_time, duration_minutes, is_running, is_billable, hourly_rate, billable_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10, $11) RETURNING *`,
    [wid, mid, data.taskId || null, data.projectId || null, data.description || null, data.startTime, data.endTime, dur, data.isBillable ?? false, data.hourlyRate || null, amt]
  );
  return r.rows[0];
};

export const updateEntry = async (wid: string, id: string, data: Record<string, any>) => {
  const map: Record<string, string> = { taskId: 'task_id', projectId: 'project_id', description: 'description', startTime: 'start_time', endTime: 'end_time', durationMinutes: 'duration_minutes', isBillable: 'is_billable', hourlyRate: 'hourly_rate' };
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  for (const [k, col] of Object.entries(map)) { if (data[k] !== undefined) { fields.push(`${col} = $${pi++}`); vals.push(data[k]); } }
  if (!fields.length) return (await pool.query('SELECT * FROM time_entries WHERE id = $1 AND workspace_id = $2', [id, wid])).rows[0];
  vals.push(id, wid);
  const r = await pool.query(`UPDATE time_entries SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${pi++} AND workspace_id = $${pi} RETURNING *`, vals);
  if (!r.rows[0]) return null;
  const e = r.rows[0];
  if (e.is_billable && e.hourly_rate && e.duration_minutes) {
    const amt = Math.round((e.duration_minutes / 60.0) * e.hourly_rate * 100) / 100;
    return (await pool.query('UPDATE time_entries SET billable_amount = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [amt, e.id])).rows[0];
  }
  return e;
};

export const deleteEntry = async (wid: string, id: string) => {
  return ((await pool.query('DELETE FROM time_entries WHERE id = $1 AND workspace_id = $2', [id, wid])).rowCount ?? 0) > 0;
};

export const listEntries = async (wid: string, filters: { memberId?: string; taskId?: string; projectId?: string; dateFrom?: string; dateTo?: string; isBillable?: boolean; page?: number; limit?: number }) => {
  const page = filters.page || 1, limit = Math.min(filters.limit || 20, 100), offset = (page - 1) * limit;
  let wc = 'WHERE te.workspace_id = $1'; const p: any[] = [wid]; let pi = 2;
  if (filters.memberId) { wc += ` AND te.member_id = $${pi++}`; p.push(filters.memberId); }
  if (filters.taskId) { wc += ` AND te.task_id = $${pi++}`; p.push(filters.taskId); }
  if (filters.projectId) { wc += ` AND te.project_id = $${pi++}`; p.push(filters.projectId); }
  if (filters.dateFrom) { wc += ` AND te.start_time >= $${pi++}`; p.push(filters.dateFrom); }
  if (filters.dateTo) { wc += ` AND te.start_time <= $${pi++}`; p.push(filters.dateTo); }
  if (filters.isBillable !== undefined) { wc += ` AND te.is_billable = $${pi++}`; p.push(filters.isBillable); }
  const cnt = parseInt((await pool.query(`SELECT COUNT(*) FROM time_entries te ${wc}`, p)).rows[0].count, 10);
  p.push(limit, offset);
  const r = await pool.query(`SELECT te.*, t.title AS task_name, p.name AS project_name FROM time_entries te LEFT JOIN tasks t ON te.task_id = t.id LEFT JOIN projects p ON te.project_id = p.id ${wc} ORDER BY te.start_time DESC LIMIT $${pi++} OFFSET $${pi}`, p);
  return { data: r.rows, pagination: { page, limit, total: cnt, total_pages: Math.ceil(cnt / limit) } };
};

export const getTimeReport = async (wid: string, filters: { memberId?: string; projectId?: string; dateFrom?: string; dateTo?: string; groupBy?: 'project' | 'member' | 'day' }) => {
  let wc = 'WHERE te.workspace_id = $1 AND te.is_running = false'; const p: any[] = [wid]; let pi = 2;
  if (filters.memberId) { wc += ` AND te.member_id = $${pi++}`; p.push(filters.memberId); }
  if (filters.projectId) { wc += ` AND te.project_id = $${pi++}`; p.push(filters.projectId); }
  if (filters.dateFrom) { wc += ` AND te.start_time >= $${pi++}`; p.push(filters.dateFrom); }
  if (filters.dateTo) { wc += ` AND te.start_time <= $${pi++}`; p.push(filters.dateTo); }
  const totals = (await pool.query(`SELECT COALESCE(SUM(duration_minutes),0) AS total_min, COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END),0) AS bill_min, COALESCE(SUM(billable_amount),0) AS total_amt, COUNT(*) AS cnt FROM time_entries te ${wc}`, p)).rows[0];
  const gb = filters.groupBy || 'project';
  let groupCol = 'te.project_id'; let nameJoin = 'LEFT JOIN projects p ON te.project_id = p.id'; let nameCol = "COALESCE(p.name, 'Sans projet') AS group_name";
  if (gb === 'member') { groupCol = 'te.member_id'; nameJoin = ''; nameCol = 'te.member_id AS group_name'; }
  else if (gb === 'day') { groupCol = 'DATE(te.start_time)'; nameJoin = ''; nameCol = 'DATE(te.start_time)::text AS group_name'; }
  const bd = await pool.query(`SELECT ${groupCol} AS group_key, ${nameCol}, COALESCE(SUM(duration_minutes),0) AS total_min, COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END),0) AS bill_min, COALESCE(SUM(billable_amount),0) AS total_amt, COUNT(*) AS cnt FROM time_entries te ${nameJoin} ${wc} GROUP BY ${groupCol}${gb !== 'day' && gb !== 'member' ? ', p.name' : ''} ORDER BY total_min DESC`, p);
  return {
    summary: { total_hours: Math.round(parseFloat(totals.total_min) / 60 * 100) / 100, billable_hours: Math.round(parseFloat(totals.bill_min) / 60 * 100) / 100, total_amount: parseFloat(totals.total_amt), entry_count: parseInt(totals.cnt, 10) },
    breakdown: bd.rows.map(r => ({ group_key: r.group_key, group_name: r.group_name, total_hours: Math.round(parseFloat(r.total_min) / 60 * 100) / 100, billable_hours: Math.round(parseFloat(r.bill_min) / 60 * 100) / 100, total_amount: parseFloat(r.total_amt), entry_count: parseInt(r.cnt, 10) })),
    group_by: gb
  };
};

export const getMemberRate = async (wid: string, mid: string) => {
  return (await pool.query('SELECT * FROM member_rates WHERE workspace_id = $1 AND member_id = $2', [wid, mid])).rows[0] || null;
};

export const setMemberRate = async (wid: string, mid: string, rate: number, currency = 'EUR') => {
  return (await pool.query(
    `INSERT INTO member_rates (workspace_id, member_id, hourly_rate, currency) VALUES ($1, $2, $3, $4)
     ON CONFLICT (workspace_id, member_id) DO UPDATE SET hourly_rate = EXCLUDED.hourly_rate, currency = EXCLUDED.currency, updated_at = NOW() RETURNING *`,
    [wid, mid, rate, currency]
  )).rows[0];
};

export const getUnbilledEntries = async (wid: string, filters: { memberId?: string; projectId?: string }) => {
  let wc = 'WHERE te.workspace_id = $1 AND te.is_running = false AND te.is_billable = true AND te.invoice_id IS NULL';
  const p: any[] = [wid]; let pi = 2;
  if (filters.memberId) { wc += ` AND te.member_id = $${pi++}`; p.push(filters.memberId); }
  if (filters.projectId) { wc += ` AND te.project_id = $${pi++}`; p.push(filters.projectId); }
  return (await pool.query(`SELECT te.*, t.title AS task_name, p.name AS project_name FROM time_entries te LEFT JOIN tasks t ON te.task_id = t.id LEFT JOIN projects p ON te.project_id = p.id ${wc} ORDER BY te.start_time DESC`, p)).rows;
};

export const linkEntriesToInvoice = async (wid: string, entryIds: string[], invoiceId: string) => {
  if (!entryIds.length) return 0;
  const ph = entryIds.map((_, i) => `$${i + 3}`).join(', ');
  return (await pool.query(`UPDATE time_entries SET invoice_id = $1, updated_at = NOW() WHERE workspace_id = $2 AND id IN (${ph}) AND is_billable = true AND is_running = false`, [invoiceId, wid, ...entryIds])).rowCount ?? 0;
};
