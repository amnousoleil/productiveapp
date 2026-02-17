/**
 * Module Calendrier - Service
 * @description Evenements, synchro taches/factures
 */
import { Pool } from 'pg';

let pool: Pool;
export const initCalendarService = (p: Pool): void => { pool = p; };

// Map DB columns (start_at/end_at) to API (start_date/end_date) for compatibility
const mapEventToApi = (row: any) => {
  if (!row) return null;
  const { start_at, end_at, ...rest } = row;
  return { ...rest, start_date: start_at, end_date: end_at };
};

export const createEvent = async (wid: string, mid: string, data: { title: string; description?: string; event_type?: string; start_date: string; end_date?: string; all_day?: boolean; location?: string; color?: string; is_private?: boolean; recurrence_rule?: string; task_id?: string; project_id?: string; reminder_minutes?: number; attendees?: any[] }) => {
  const row = (await pool.query(
    `INSERT INTO calendar_events (workspace_id, member_id, title, description, event_type, start_at, end_at, all_day, location, color, is_private, recurrence_rule, task_id, project_id, reminder_minutes, attendees)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [wid, mid, data.title, data.description || null, data.event_type || 'meeting', data.start_date, data.end_date || null, data.all_day ?? false, data.location || null, data.color || null, data.is_private ?? false, data.recurrence_rule || null, data.task_id || null, data.project_id || null, data.reminder_minutes ?? null, JSON.stringify(data.attendees || [])]
  )).rows[0];
  return mapEventToApi(row);
};

export const updateEvent = async (wid: string, id: string, data: Record<string, any>) => {
  const apiToDbMap: Record<string, string> = { start_date: 'start_at', end_date: 'end_at' };
  const allowed = ['title', 'description', 'event_type', 'start_date', 'end_date', 'all_day', 'location', 'color', 'is_private', 'recurrence_rule', 'reminder_minutes', 'attendees'];
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  for (const f of allowed) {
    if (data[f] !== undefined) {
      const dbField = apiToDbMap[f] || f;
      const val = f === 'attendees' ? JSON.stringify(data[f]) : data[f];
      fields.push(`${dbField} = $${pi++}`);
      vals.push(val);
    }
  }
  if (!fields.length) return mapEventToApi((await pool.query('SELECT * FROM calendar_events WHERE id = $1 AND workspace_id = $2', [id, wid])).rows[0]);
  vals.push(id, wid);
  const row = (await pool.query(`UPDATE calendar_events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${pi++} AND workspace_id = $${pi} RETURNING *`, vals)).rows[0] || null;
  return row ? mapEventToApi(row) : null;
};

export const deleteEvent = async (wid: string, id: string) => {
  return ((await pool.query('DELETE FROM calendar_events WHERE id = $1 AND workspace_id = $2', [id, wid])).rowCount ?? 0) > 0;
};

export const getEvent = async (wid: string, id: string) => {
  const row = (await pool.query('SELECT * FROM calendar_events WHERE id = $1 AND workspace_id = $2', [id, wid])).rows[0];
  return row ? mapEventToApi(row) : null;
};

export const listEvents = async (wid: string, filters: { memberId?: string; startDate: string; endDate: string; eventType?: string }) => {
  let wc = 'WHERE workspace_id = $1 AND start_at <= $3 AND (end_at >= $2 OR (end_at IS NULL AND start_at >= $2))';
  const p: any[] = [wid, filters.startDate, filters.endDate]; let pi = 4;
  if (filters.memberId) { wc += ` AND member_id = $${pi++}`; p.push(filters.memberId); }
  if (filters.eventType) { wc += ` AND event_type = $${pi++}`; p.push(filters.eventType); }
  const rows = (await pool.query(`SELECT * FROM calendar_events ${wc} ORDER BY start_at ASC`, p)).rows;
  return rows.map(mapEventToApi);
};

export const getUpcoming = async (wid: string, mid: string, days = 7) => {
  const rows = (await pool.query(
    `SELECT * FROM calendar_events WHERE workspace_id = $1 AND (member_id = $2 OR is_private = false) AND start_at >= NOW() AND start_at <= NOW() + INTERVAL '1 day' * $3 ORDER BY start_at ASC LIMIT 50`,
    [wid, mid, days]
  )).rows;
  return rows.map(mapEventToApi);
};

export const syncTaskDeadlines = async (wid: string) => {
  const tasks = (await pool.query('SELECT id, title, due_date, status, assignee_id FROM tasks WHERE workspace_id = $1 AND due_date IS NOT NULL', [wid])).rows;
  let created = 0, updated = 0, removed = 0;
  for (const t of tasks) {
    const ex = (await pool.query(`SELECT id FROM calendar_events WHERE workspace_id = $1 AND task_id = $2`, [wid, t.id])).rows;
    if (t.status === 'done' || t.status === 'cancelled') { if (ex.length) { await pool.query('DELETE FROM calendar_events WHERE id = $1', [ex[0].id]); removed++; } continue; }
    if (ex.length) { await pool.query('UPDATE calendar_events SET title = $1, start_at = $2, member_id = $3, updated_at = NOW() WHERE id = $4', [`[Tâche] ${t.title}`, t.due_date, t.assignee_id, ex[0].id]); updated++; }
    else { await pool.query(`INSERT INTO calendar_events (workspace_id, member_id, title, event_type, start_at, all_day, color, task_id) VALUES ($1,$2,$3,'task_deadline',$4,true,'#EF4444',$5)`, [wid, t.assignee_id, `[Tâche] ${t.title}`, t.due_date, t.id]); created++; }
  }
  return { created, updated, removed };
};

export const syncInvoiceDueDates = async (wid: string) => {
  const invs = (await pool.query('SELECT id, fournisseur, montant_ttc, date_echeance, status, type FROM invoices WHERE workspace_id = $1 AND date_echeance IS NOT NULL', [wid])).rows;
  let created = 0, updated = 0, removed = 0;
  for (const inv of invs) {
    const ex = (await pool.query(`SELECT id FROM calendar_events WHERE workspace_id = $1 AND invoice_id = $2`, [wid, inv.id])).rows;
    if (inv.status === 'paid' || inv.status === 'cancelled') { if (ex.length) { await pool.query('DELETE FROM calendar_events WHERE id = $1', [ex[0].id]); removed++; } continue; }
    const label = inv.type === 'income' ? `[Facture] ${inv.fournisseur} - ${inv.montant_ttc}€` : `[Dépense] ${inv.fournisseur} - ${inv.montant_ttc}€`;
    const color = inv.type === 'income' ? '#10B981' : '#F59E0B';
    if (ex.length) { await pool.query('UPDATE calendar_events SET title=$1, start_at=$2, color=$3, updated_at=NOW() WHERE id=$4', [label, inv.date_echeance, color, ex[0].id]); updated++; }
    else { await pool.query(`INSERT INTO calendar_events (workspace_id, member_id, title, event_type, start_at, all_day, color, invoice_id) VALUES ($1,NULL,$2,'invoice_due',$3,true,$4,$5)`, [wid, label, inv.date_echeance, color, inv.id]); created++; }
  }
  return { created, updated, removed };
};
