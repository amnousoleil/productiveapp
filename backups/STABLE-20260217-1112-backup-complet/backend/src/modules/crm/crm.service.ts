/**
 * Module CRM Pipeline - Service
 * @description Pipelines, deals, activites, statistiques
 */
import { Pool } from 'pg';

let pool: Pool;
export const initCRMService = (p: Pool): void => { pool = p; };

const DEFAULT_STAGES = [
  { key: 'lead', label: 'Prospect', order: 1, color: '#6B7280', probability: 10 },
  { key: 'qualified', label: 'Qualifie', order: 2, color: '#3B82F6', probability: 25 },
  { key: 'proposal', label: 'Proposition', order: 3, color: '#F59E0B', probability: 50 },
  { key: 'negotiation', label: 'Negociation', order: 4, color: '#8B5CF6', probability: 75 },
  { key: 'won', label: 'Gagne', order: 5, color: '#10B981', probability: 100 },
  { key: 'lost', label: 'Perdu', order: 6, color: '#EF4444', probability: 0 },
];

export const getDefaultPipeline = async (wid: string) => {
  const r = await pool.query('SELECT * FROM crm_pipelines WHERE workspace_id = $1 AND is_default = true LIMIT 1', [wid]);
  if (r.rows[0]) return { ...r.rows[0], stages: typeof r.rows[0].stages === 'string' ? JSON.parse(r.rows[0].stages) : r.rows[0].stages };
  const c = await pool.query(`INSERT INTO crm_pipelines (workspace_id, name, stages, is_default) VALUES ($1, 'Pipeline principal', $2::jsonb, true) RETURNING *`, [wid, JSON.stringify(DEFAULT_STAGES)]);
  return { ...c.rows[0], stages: DEFAULT_STAGES };
};

export const getPipelines = async (wid: string) => {
  const r = await pool.query('SELECT * FROM crm_pipelines WHERE workspace_id = $1 ORDER BY created_at', [wid]);
  if (!r.rows.length) { await getDefaultPipeline(wid); return (await pool.query('SELECT * FROM crm_pipelines WHERE workspace_id = $1 ORDER BY created_at', [wid])).rows.map(p => ({ ...p, stages: typeof p.stages === 'string' ? JSON.parse(p.stages) : p.stages })); }
  return r.rows.map(p => ({ ...p, stages: typeof p.stages === 'string' ? JSON.parse(p.stages) : p.stages }));
};

export const createPipeline = async (wid: string, data: { name: string; stages?: any[]; is_default?: boolean }) => {
  const stages = data.stages || DEFAULT_STAGES;
  if (data.is_default) await pool.query('UPDATE crm_pipelines SET is_default = false WHERE workspace_id = $1', [wid]);
  const r = await pool.query(`INSERT INTO crm_pipelines (workspace_id, name, stages, is_default) VALUES ($1, $2, $3::jsonb, $4) RETURNING *`, [wid, data.name, JSON.stringify(stages), data.is_default ?? false]);
  return { ...r.rows[0], stages };
};

export const updatePipeline = async (wid: string, id: string, data: { name?: string; stages?: any[]; is_default?: boolean }) => {
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  if (data.name !== undefined) { fields.push(`name = $${pi++}`); vals.push(data.name); }
  if (data.stages !== undefined) { fields.push(`stages = $${pi++}::jsonb`); vals.push(JSON.stringify(data.stages)); }
  if (data.is_default !== undefined) { fields.push(`is_default = $${pi++}`); vals.push(data.is_default); if (data.is_default) await pool.query('UPDATE crm_pipelines SET is_default = false WHERE workspace_id = $1 AND id != $2', [wid, id]); }
  if (!fields.length) return (await pool.query('SELECT * FROM crm_pipelines WHERE id = $1 AND workspace_id = $2', [id, wid])).rows[0];
  vals.push(id, wid);
  const r = await pool.query(`UPDATE crm_pipelines SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${pi++} AND workspace_id = $${pi} RETURNING *`, vals);
  if (!r.rows[0]) return null;
  return { ...r.rows[0], stages: typeof r.rows[0].stages === 'string' ? JSON.parse(r.rows[0].stages) : r.rows[0].stages };
};

export const createDeal = async (wid: string, data: { pipeline_id?: string; contact_id?: string; member_id?: string; title: string; description?: string; amount?: number; currency?: string; stage?: string; probability?: number; expected_close_date?: string; tags?: string }) => {
  let pid = data.pipeline_id;
  if (!pid) { const dp = await getDefaultPipeline(wid); pid = dp.id; }
  return (await pool.query(
    `INSERT INTO crm_deals (workspace_id, pipeline_id, contact_id, member_id, title, description, amount, currency, stage, probability, expected_close_date, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [wid, pid, data.contact_id || null, data.member_id || null, data.title, data.description || null, data.amount ?? 0, data.currency || 'EUR', data.stage || 'lead', data.probability ?? 10, data.expected_close_date || null, data.tags || null]
  )).rows[0];
};

export const getDeal = async (wid: string, id: string) => {
  const r = await pool.query(`SELECT d.*, c.name AS contact_name, c.email AS contact_email, c.company AS contact_company FROM crm_deals d LEFT JOIN contacts c ON d.contact_id = c.id WHERE d.id = $1 AND d.workspace_id = $2`, [id, wid]);
  if (!r.rows[0]) return null;
  const acts = await pool.query('SELECT * FROM crm_activities WHERE deal_id = $1 AND workspace_id = $2 ORDER BY created_at DESC', [id, wid]);
  return { ...r.rows[0], activities: acts.rows };
};

export const updateDeal = async (wid: string, id: string, data: Record<string, any>) => {
  const allowed = ['contact_id', 'member_id', 'title', 'description', 'amount', 'currency', 'stage', 'probability', 'expected_close_date', 'closed_at', 'lost_reason', 'tags'];
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  for (const f of allowed) { if (data[f] !== undefined) { fields.push(`${f} = $${pi++}`); vals.push(data[f]); } }
  if (!fields.length) return getDeal(wid, id);
  vals.push(id, wid);
  return (await pool.query(`UPDATE crm_deals SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${pi++} AND workspace_id = $${pi} RETURNING *`, vals)).rows[0] || null;
};

export const deleteDeal = async (wid: string, id: string) => {
  await pool.query('DELETE FROM crm_activities WHERE deal_id = $1 AND workspace_id = $2', [id, wid]);
  return ((await pool.query('DELETE FROM crm_deals WHERE id = $1 AND workspace_id = $2', [id, wid])).rowCount ?? 0) > 0;
};

export const listDeals = async (wid: string, filters: { stage?: string; contactId?: string; memberId?: string; search?: string; page?: number; limit?: number }) => {
  const page = filters.page || 1, limit = Math.min(filters.limit || 20, 100), offset = (page - 1) * limit;
  let wc = 'WHERE d.workspace_id = $1'; const p: any[] = [wid]; let pi = 2;
  if (filters.stage) { wc += ` AND d.stage = $${pi++}`; p.push(filters.stage); }
  if (filters.contactId) { wc += ` AND d.contact_id = $${pi++}`; p.push(filters.contactId); }
  if (filters.memberId) { wc += ` AND d.member_id = $${pi++}`; p.push(filters.memberId); }
  if (filters.search) { wc += ` AND (d.title ILIKE $${pi} OR c.name ILIKE $${pi})`; p.push(`%${filters.search}%`); pi++; }
  const cnt = parseInt((await pool.query(`SELECT COUNT(*) FROM crm_deals d LEFT JOIN contacts c ON d.contact_id = c.id ${wc}`, p)).rows[0].count, 10);
  p.push(limit, offset);
  const r = await pool.query(`SELECT d.*, c.name AS contact_name, c.email AS contact_email FROM crm_deals d LEFT JOIN contacts c ON d.contact_id = c.id ${wc} ORDER BY d.updated_at DESC LIMIT $${pi++} OFFSET $${pi}`, p);
  return { data: r.rows, pagination: { page, limit, total: cnt, total_pages: Math.ceil(cnt / limit) } };
};

export const moveDeal = async (wid: string, id: string, stage: string, probability?: number) => {
  const cur = await pool.query('SELECT * FROM crm_deals WHERE id = $1 AND workspace_id = $2', [id, wid]);
  if (!cur.rows[0]) return null;
  const oldStage = cur.rows[0].stage;
  const sets = ['stage = $1']; const vals: any[] = [stage]; let pi = 2;
  if (probability !== undefined) { sets.push(`probability = $${pi++}`); vals.push(probability); }
  if (stage === 'won' || stage === 'lost') { sets.push(`closed_at = $${pi++}`); vals.push(new Date().toISOString()); }
  vals.push(id, wid);
  const r = await pool.query(`UPDATE crm_deals SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${pi++} AND workspace_id = $${pi} RETURNING *`, vals);
  await pool.query(`INSERT INTO crm_activities (workspace_id, deal_id, type, title, description) VALUES ($1, $2, 'stage_change', $3, $4)`, [wid, id, `${oldStage} -> ${stage}`, `Deal deplace de "${oldStage}" vers "${stage}"`]);
  return r.rows[0] || null;
};

export const getDealBoard = async (wid: string, pipelineId?: string) => {
  let pid = pipelineId;
  if (!pid) { const dp = await getDefaultPipeline(wid); pid = dp.id; }
  const pr = await pool.query('SELECT * FROM crm_pipelines WHERE id = $1 AND workspace_id = $2', [pid, wid]);
  if (!pr.rows[0]) return [];
  const stages = typeof pr.rows[0].stages === 'string' ? JSON.parse(pr.rows[0].stages) : pr.rows[0].stages;
  const dr = await pool.query(`SELECT d.*, c.name AS contact_name FROM crm_deals d LEFT JOIN contacts c ON d.contact_id = c.id WHERE d.workspace_id = $1 AND d.pipeline_id = $2 ORDER BY d.updated_at DESC`, [wid, pid]);
  const grouped: Record<string, any[]> = {};
  for (const d of dr.rows) { if (!grouped[d.stage]) grouped[d.stage] = []; grouped[d.stage].push(d); }
  return stages.map((s: any) => ({ stage: s.key, label: s.label, color: s.color, probability: s.probability, deals: grouped[s.key] || [], total_value: (grouped[s.key] || []).reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0), count: (grouped[s.key] || []).length }));
};

export const addActivity = async (wid: string, dealId: string, data: { type: string; title: string; description?: string; scheduled_at?: string; created_by?: string }) => {
  const check = await pool.query('SELECT id FROM crm_deals WHERE id = $1 AND workspace_id = $2', [dealId, wid]);
  if (!check.rows[0]) throw new Error('Deal non trouve');
  const r = await pool.query(`INSERT INTO crm_activities (workspace_id, deal_id, type, title, description, scheduled_at, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [wid, dealId, data.type, data.title, data.description || null, data.scheduled_at || null, data.created_by || null]);
  await pool.query('UPDATE crm_deals SET updated_at = NOW() WHERE id = $1', [dealId]);
  return r.rows[0];
};

export const listActivities = async (wid: string, dealId: string) => {
  return (await pool.query('SELECT * FROM crm_activities WHERE deal_id = $1 AND workspace_id = $2 ORDER BY created_at DESC', [dealId, wid])).rows;
};

export const getStats = async (wid: string) => {
  const g = (await pool.query(`SELECT COUNT(*)::int AS total, COALESCE(SUM(amount),0) AS total_val, COUNT(*) FILTER (WHERE stage='won')::int AS won_cnt, COALESCE(SUM(amount) FILTER (WHERE stage='won'),0) AS won_val, COUNT(*) FILTER (WHERE stage='lost')::int AS lost_cnt, COUNT(*) FILTER (WHERE stage NOT IN ('won','lost'))::int AS open_cnt, COALESCE(SUM(amount) FILTER (WHERE stage NOT IN ('won','lost')),0) AS open_val FROM crm_deals WHERE workspace_id = $1`, [wid])).rows[0];
  const closed = parseInt(g.won_cnt) + parseInt(g.lost_cnt);
  const bs = await pool.query(`SELECT stage, COUNT(*)::int AS count, COALESCE(SUM(amount),0) AS total_val FROM crm_deals WHERE workspace_id = $1 GROUP BY stage`, [wid]);
  return { total_deals: parseInt(g.total), total_value: parseFloat(g.total_val), won_count: parseInt(g.won_cnt), won_value: parseFloat(g.won_val), lost_count: parseInt(g.lost_cnt), open_count: parseInt(g.open_cnt), open_value: parseFloat(g.open_val), conversion_rate: closed > 0 ? Math.round((parseInt(g.won_cnt) / closed) * 10000) / 100 : 0, by_stage: bs.rows };
};

export const convertDeal = async (wid: string, dealId: string) => {
  const dr = await pool.query(`SELECT d.*, c.name AS contact_name, c.email AS contact_email, c.company AS contact_company FROM crm_deals d LEFT JOIN contacts c ON d.contact_id = c.id WHERE d.id = $1 AND d.workspace_id = $2`, [dealId, wid]);
  if (!dr.rows[0]) throw new Error('Deal non trouve');
  const deal = dr.rows[0];
  if (deal.stage !== 'won') throw new Error('Seuls les deals gagnes peuvent etre convertis');
  const ht = parseFloat(deal.amount || 0); const tva = Math.round(ht * 20) / 100; const ttc = ht + tva;
  const ir = await pool.query(`INSERT INTO invoices (workspace_id, type, fournisseur, reference, montant_ht, montant_tva, montant_ttc, tva_rate, date_facture, contact_id, client_name, client_email, source, status, document_type, currency) VALUES ($1,'income',$2,$3,$4,$5,$6,20,$7,$8,$9,$10,'manual','draft','invoice',$11) RETURNING id`,
    [wid, deal.contact_company || deal.contact_name || deal.title, `CRM-${deal.id.substring(0, 8).toUpperCase()}`, ht, tva, ttc, new Date().toISOString().split('T')[0], deal.contact_id, deal.contact_name, deal.contact_email, deal.currency || 'EUR']);
  await pool.query(`INSERT INTO crm_activities (workspace_id, deal_id, type, title) VALUES ($1, $2, 'invoice_created', 'Facture creee')`, [wid, dealId]);
  return { invoice_id: ir.rows[0].id, deal_id: dealId };
};
