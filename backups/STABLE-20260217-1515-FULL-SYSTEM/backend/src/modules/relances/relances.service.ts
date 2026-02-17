/**
 * Module Auto-Relances - Service
 * @description Relances automatiques factures impayees (3 niveaux)
 */
import { Pool } from 'pg';

let pool: Pool;
export const initRelancesService = (p: Pool): void => { pool = p; };

const DEFAULT_SUBJECTS = [
  'Rappel - Facture {{reference}} en attente de paiement',
  'Second rappel - Facture {{reference}} impayee',
  'Dernier rappel - Facture {{reference}}'
];
const DEFAULT_BODIES = [
  'Bonjour {{client_name}},\n\nNous vous rappelons que la facture {{reference}} de {{amount}} EUR (echeance: {{due_date}}) reste impayee depuis {{days_overdue}} jour(s).\n\nCordialement, {{company_name}}',
  'Bonjour {{client_name}},\n\nMalgre notre precedent rappel, la facture {{reference}} de {{amount}} EUR reste impayee ({{days_overdue}} jours de retard).\n\nCordialement, {{company_name}}',
  'Bonjour {{client_name}},\n\nDernier rappel pour la facture {{reference}} de {{amount}} EUR impayee depuis {{days_overdue}} jours. Sans reglement sous 8 jours, nous engagerons une procedure de recouvrement.\n\nCordialement, {{company_name}}'
];

export const getSettings = async (wid: string) => {
  const r = await pool.query('SELECT * FROM reminder_settings WHERE workspace_id = $1', [wid]);
  if (r.rows[0]) return r.rows[0];
  return (await pool.query(
    `INSERT INTO reminder_settings (workspace_id, enabled, level1_days, level1_subject, level1_template, level2_days, level2_subject, level2_template, level3_days, level3_subject, level3_template, sender_name, sender_email, auto_schedule)
     VALUES ($1, true, 7, $2, $3, 15, $4, $5, 30, $6, $7, 'Service Comptabilite', '', true) ON CONFLICT (workspace_id) DO UPDATE SET updated_at=NOW() RETURNING *`,
    [wid, DEFAULT_SUBJECTS[0], DEFAULT_BODIES[0], DEFAULT_SUBJECTS[1], DEFAULT_BODIES[1], DEFAULT_SUBJECTS[2], DEFAULT_BODIES[2]]
  )).rows[0];
};

export const updateSettings = async (wid: string, data: Record<string, any>) => {
  const allowed = ['enabled', 'level1_days', 'level1_subject', 'level1_template', 'level2_days', 'level2_subject', 'level2_template', 'level3_days', 'level3_subject', 'level3_template', 'sender_name', 'sender_email', 'cc_email', 'include_invoice_pdf', 'auto_schedule'];
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  for (const f of allowed) { if (data[f] !== undefined) { fields.push(`${f} = $${pi++}`); vals.push(data[f]); } }
  if (!fields.length) return getSettings(wid);
  vals.push(wid);
  return (await pool.query(`UPDATE reminder_settings SET ${fields.join(', ')}, updated_at=NOW() WHERE workspace_id=$${pi} RETURNING *`, vals)).rows[0] || (await getSettings(wid));
};

export const scheduleReminders = async (wid: string) => {
  const settings = await getSettings(wid);
  if (!settings.enabled) return { scheduled: 0, skipped: 0 };
  const overdue = (await pool.query(
    `SELECT i.id, i.reference, i.montant_ttc, i.date_echeance, i.client_email, c.email AS contact_email,
     EXTRACT(DAY FROM NOW() - i.date_echeance)::int AS days_overdue,
     (SELECT MAX(level) FROM invoice_reminders WHERE invoice_id=i.id AND status IN ('sent','pending')) AS max_level
     FROM invoices i LEFT JOIN contacts c ON i.contact_id = c.id
     WHERE i.workspace_id=$1 AND i.type='income' AND i.status NOT IN ('paid','cancelled','draft') AND i.date_echeance < NOW()`,
    [wid]
  )).rows;
  let scheduled = 0, skipped = 0;
  for (const inv of overdue) {
    const maxLvl = inv.max_level || 0;
    for (const { level, days } of [{ level: 1, days: settings.level1_days }, { level: 2, days: settings.level2_days }, { level: 3, days: settings.level3_days }]) {
      if (level <= maxLvl || inv.days_overdue < days) continue;
      const exists = (await pool.query('SELECT id FROM invoice_reminders WHERE invoice_id=$1 AND level=$2 AND status IN (\'pending\',\'sent\')', [inv.id, level])).rows;
      if (exists.length) { skipped++; continue; }
      const sa = new Date(inv.date_echeance); sa.setDate(sa.getDate() + days);
      await pool.query(`INSERT INTO invoice_reminders (workspace_id, invoice_id, level, status, scheduled_at, email_to) VALUES ($1,$2,$3,'pending',$4,$5)`, [wid, inv.id, level, sa, inv.client_email || inv.contact_email]);
      scheduled++;
    }
  }
  return { scheduled, skipped };
};

export const processReminders = async () => {
  const pending = (await pool.query(
    `SELECT ir.*, i.reference, i.montant_ttc, i.date_echeance, i.client_name, i.client_email, c.name AS contact_name,
     rs.level1_subject, rs.level1_template, rs.level2_subject, rs.level2_template, rs.level3_subject, rs.level3_template, rs.sender_name
     FROM invoice_reminders ir JOIN invoices i ON ir.invoice_id=i.id LEFT JOIN contacts c ON i.contact_id=c.id LEFT JOIN reminder_settings rs ON rs.workspace_id=ir.workspace_id
     WHERE ir.status='pending' AND ir.scheduled_at <= NOW() LIMIT 50`
  )).rows;
  let sent = 0, failed = 0;
  for (const r of pending) {
    const email = r.email_to || r.client_email;
    if (!email) { await pool.query(`UPDATE invoice_reminders SET status='failed', error_message='Pas d''email', updated_at=NOW() WHERE id=$1`, [r.id]); failed++; continue; }
    const lvl = r.level - 1;
    let subj = [r.level1_subject, r.level2_subject, r.level3_subject][lvl] || DEFAULT_SUBJECTS[lvl];
    let body = [r.level1_template, r.level2_template, r.level3_template][lvl] || DEFAULT_BODIES[lvl];
    const vars: Record<string, string> = { '{{reference}}': r.reference || 'N/A', '{{amount}}': parseFloat(r.montant_ttc || 0).toFixed(2), '{{due_date}}': new Date(r.date_echeance).toLocaleDateString('fr-FR'), '{{client_name}}': r.client_name || r.contact_name || 'Client', '{{company_name}}': r.sender_name || 'Notre societe', '{{days_overdue}}': String(Math.floor((Date.now() - new Date(r.date_echeance).getTime()) / 86400000)) };
    for (const [k, v] of Object.entries(vars)) { subj = subj.replaceAll(k, v); body = body.replaceAll(k, v); }
    console.log(`[Relances] Email simule -> ${email}: ${subj}`);
    await pool.query(`UPDATE invoice_reminders SET status='sent', sent_at=NOW(), email_subject=$2, email_body=$3, updated_at=NOW() WHERE id=$1`, [r.id, subj, body]);
    sent++;
  }
  return { sent, failed };
};

export const listReminders = async (wid: string, filters: { invoiceId?: string; status?: string; page?: number; limit?: number }) => {
  const page = filters.page || 1, limit = Math.min(filters.limit || 20, 100), offset = (page - 1) * limit;
  let wc = 'WHERE ir.workspace_id = $1'; const p: any[] = [wid]; let pi = 2;
  if (filters.invoiceId) { wc += ` AND ir.invoice_id=$${pi++}`; p.push(filters.invoiceId); }
  if (filters.status) { wc += ` AND ir.status=$${pi++}`; p.push(filters.status); }
  const cnt = parseInt((await pool.query(`SELECT COUNT(*) FROM invoice_reminders ir ${wc}`, p)).rows[0].count, 10);
  p.push(limit, offset);
  const r = await pool.query(`SELECT ir.*, i.reference, i.montant_ttc, i.client_name FROM invoice_reminders ir JOIN invoices i ON ir.invoice_id=i.id ${wc} ORDER BY ir.scheduled_at DESC LIMIT $${pi++} OFFSET $${pi}`, p);
  return { data: r.rows, pagination: { page, limit, total: cnt, total_pages: Math.ceil(cnt / limit) } };
};

export const cancelReminder = async (wid: string, id: string) => {
  return (await pool.query(`UPDATE invoice_reminders SET status='cancelled', updated_at=NOW() WHERE id=$1 AND workspace_id=$2 AND status='pending' RETURNING *`, [id, wid])).rows[0] || null;
};

export const getOverdueReport = async (wid: string) => {
  const invs = (await pool.query(
    `SELECT i.id, i.reference, i.fournisseur, i.client_name, i.montant_ttc, i.date_echeance,
     EXTRACT(DAY FROM NOW()-i.date_echeance)::int AS days_overdue,
     (SELECT COUNT(*) FROM invoice_reminders ir WHERE ir.invoice_id=i.id AND ir.status='sent')::int AS reminder_count
     FROM invoices i WHERE i.workspace_id=$1 AND i.type='income' AND i.status NOT IN ('paid','cancelled','draft') AND i.date_echeance < NOW() ORDER BY i.date_echeance`,
    [wid]
  )).rows;
  const total = invs.reduce((s: number, i: any) => s + parseFloat(i.montant_ttc), 0);
  return { total_overdue: invs.length, total_amount: total, invoices: invs };
};
