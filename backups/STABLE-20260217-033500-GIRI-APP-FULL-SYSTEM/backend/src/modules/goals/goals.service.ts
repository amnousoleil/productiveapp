/**
 * Module Objectifs Financiers - Service
 * @description Objectifs CA, depenses, epargne avec suivi progression
 */
import { Pool } from 'pg';

let pool: Pool;
export const initGoalsService = (p: Pool): void => { pool = p; };

export const listGoals = async (wid: string, filters: { type?: string; status?: string }) => {
  let wc = 'WHERE workspace_id = $1'; const p: any[] = [wid]; let pi = 2;
  if (filters.type) { wc += ` AND type = $${pi++}`; p.push(filters.type); }
  if (filters.status) { wc += ` AND status = $${pi++}`; p.push(filters.status); }
  return (await pool.query(`SELECT * FROM financial_goals ${wc} ORDER BY target_date ASC NULLS LAST`, p)).rows;
};

export const createGoal = async (wid: string, mid: string, data: { title: string; type: string; target_amount: number; current_amount?: number; currency?: string; target_date?: string; description?: string }) => {
  return (await pool.query(
    `INSERT INTO financial_goals (workspace_id, member_id, title, type, target_amount, current_amount, currency, target_date, description, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') RETURNING *`,
    [wid, mid, data.title, data.type, data.target_amount, data.current_amount ?? 0, data.currency || 'EUR', data.target_date || null, data.description || null]
  )).rows[0];
};

export const getGoal = async (wid: string, id: string) => {
  return (await pool.query('SELECT * FROM financial_goals WHERE id=$1 AND workspace_id=$2', [id, wid])).rows[0] || null;
};

export const updateGoal = async (wid: string, id: string, data: Record<string, any>) => {
  const allowed = ['title', 'type', 'target_amount', 'current_amount', 'currency', 'target_date', 'description', 'status'];
  const fields: string[] = []; const vals: any[] = []; let pi = 1;
  for (const f of allowed) { if (data[f] !== undefined) { fields.push(`${f} = $${pi++}`); vals.push(data[f]); } }
  if (!fields.length) return getGoal(wid, id);
  vals.push(id, wid);
  const r = (await pool.query(`UPDATE financial_goals SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${pi++} AND workspace_id=$${pi} RETURNING *`, vals)).rows[0];
  if (r && r.current_amount >= r.target_amount && r.status === 'active') {
    await pool.query(`UPDATE financial_goals SET status='completed', updated_at=NOW() WHERE id=$1`, [r.id]);
    r.status = 'completed';
  }
  return r || null;
};

export const deleteGoal = async (wid: string, id: string) => {
  return ((await pool.query('DELETE FROM financial_goals WHERE id=$1 AND workspace_id=$2', [id, wid])).rowCount ?? 0) > 0;
};

export const refreshGoalProgress = async (wid: string, id: string) => {
  const goal = await getGoal(wid, id);
  if (!goal) return null;
  let currentAmount = 0;
  if (goal.type === 'revenue') {
    const r = await pool.query(`SELECT COALESCE(SUM(montant_ttc),0) AS total FROM invoices WHERE workspace_id=$1 AND type='income' AND status='paid' AND date_facture >= $2 AND ($3::date IS NULL OR date_facture <= $3)`, [wid, goal.created_at, goal.target_date]);
    currentAmount = parseFloat(r.rows[0].total);
  } else if (goal.type === 'savings') {
    const income = await pool.query(`SELECT COALESCE(SUM(montant_ttc),0) AS total FROM invoices WHERE workspace_id=$1 AND type='income' AND status='paid'`, [wid]);
    const expense = await pool.query(`SELECT COALESCE(SUM(montant_ttc),0) AS total FROM invoices WHERE workspace_id=$1 AND type='expense' AND status='paid'`, [wid]);
    currentAmount = parseFloat(income.rows[0].total) - parseFloat(expense.rows[0].total);
  } else if (goal.type === 'expense_limit') {
    const r = await pool.query(`SELECT COALESCE(SUM(montant_ttc),0) AS total FROM invoices WHERE workspace_id=$1 AND type='expense' AND status='paid' AND date_facture >= $2 AND ($3::date IS NULL OR date_facture <= $3)`, [wid, goal.created_at, goal.target_date]);
    currentAmount = parseFloat(r.rows[0].total);
  }
  return updateGoal(wid, id, { current_amount: currentAmount });
};

export const getDashboard = async (wid: string) => {
  const goals = await listGoals(wid, {});
  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  return {
    total: goals.length, active: active.length, completed: completed.length,
    goals: goals.map(g => ({ ...g, progress: g.target_amount > 0 ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 10000) / 100) : 0 }))
  };
};
