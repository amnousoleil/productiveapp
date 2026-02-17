/**
 * Module Comptabilité - Analytics et Dashboard
 * @description Statistiques, dashboard et résumé TVA
 */

import { Pool } from 'pg';
import {
  DashboardStats, MonthlyAnalytics, TVAAnalytics,
  CategoryStats, MonthlyTrend
} from './accounting.types.js';

let pool: Pool;

export const initAnalyticsService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = async (
  workspaceId: string,
  year?: number
): Promise<DashboardStats> => {
  const targetYear = year || new Date().getFullYear();

  // Totaux globaux
  const totalsResult = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN montant_ttc ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END), 0) as total_expense,
      COUNT(*) as invoice_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
     FROM invoices
     WHERE workspace_id = $1 AND EXTRACT(YEAR FROM date_facture) = $2`,
    [workspaceId, targetYear]
  );

  const totals = totalsResult.rows[0];
  const totalIncome = parseFloat(totals.total_income);
  const totalExpense = parseFloat(totals.total_expense);

  // Top catégories
  const topCategoriesResult = await pool.query<CategoryStats>(
    `SELECT
      c.id as category_id,
      c.name as category_name,
      c.type,
      COALESCE(SUM(i.montant_ttc), 0) as total,
      COUNT(i.id) as count
     FROM accounting_categories c
     LEFT JOIN invoices i ON c.id = i.category_id
       AND EXTRACT(YEAR FROM i.date_facture) = $2
     WHERE c.workspace_id = $1
     GROUP BY c.id, c.name, c.type
     HAVING COUNT(i.id) > 0
     ORDER BY total DESC
     LIMIT 10`,
    [workspaceId, targetYear]
  );

  // Tendance mensuelle
  const trendResult = await pool.query<MonthlyTrend>(
    `SELECT
      EXTRACT(MONTH FROM date_facture)::int as month,
      EXTRACT(YEAR FROM date_facture)::int as year,
      COALESCE(SUM(CASE WHEN type = 'income' THEN montant_ttc ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END), 0) as expense
     FROM invoices
     WHERE workspace_id = $1 AND EXTRACT(YEAR FROM date_facture) = $2
     GROUP BY EXTRACT(MONTH FROM date_facture), EXTRACT(YEAR FROM date_facture)
     ORDER BY year, month`,
    [workspaceId, targetYear]
  );

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: totalIncome - totalExpense,
    invoice_count: parseInt(totals.invoice_count, 10),
    pending_count: parseInt(totals.pending_count, 10),
    top_categories: topCategoriesResult.rows.map(row => ({
      ...row,
      total: parseFloat(row.total as unknown as string),
      count: parseInt(row.count as unknown as string, 10)
    })),
    monthly_trend: trendResult.rows.map(row => ({
      ...row,
      income: parseFloat(row.income as unknown as string),
      expense: parseFloat(row.expense as unknown as string)
    }))
  };
};

// ============================================
// ANALYTICS MENSUEL
// ============================================

export const getMonthlyAnalytics = async (
  workspaceId: string,
  month: number,
  year: number
): Promise<MonthlyAnalytics> => {
  // Revenus par catégorie
  const incomeResult = await pool.query<CategoryStats>(
    `SELECT
      c.id as category_id, c.name as category_name, c.type,
      COALESCE(SUM(i.montant_ttc), 0) as total,
      COUNT(i.id) as count
     FROM accounting_categories c
     LEFT JOIN invoices i ON c.id = i.category_id
       AND EXTRACT(MONTH FROM i.date_facture) = $2
       AND EXTRACT(YEAR FROM i.date_facture) = $3
     WHERE c.workspace_id = $1 AND c.type = 'income'
     GROUP BY c.id, c.name, c.type`,
    [workspaceId, month, year]
  );

  // Dépenses par catégorie
  const expenseResult = await pool.query<CategoryStats>(
    `SELECT
      c.id as category_id, c.name as category_name, c.type,
      COALESCE(SUM(i.montant_ttc), 0) as total,
      COUNT(i.id) as count
     FROM accounting_categories c
     LEFT JOIN invoices i ON c.id = i.category_id
       AND EXTRACT(MONTH FROM i.date_facture) = $2
       AND EXTRACT(YEAR FROM i.date_facture) = $3
     WHERE c.workspace_id = $1 AND c.type = 'expense'
     GROUP BY c.id, c.name, c.type`,
    [workspaceId, month, year]
  );

  // TVA par taux
  const tvaResult = await pool.query<TVAAnalytics>(
    `SELECT
      tva_rate as taux,
      SUM(montant_ht) as base_ht,
      SUM(CASE WHEN type = 'income' THEN montant_tva ELSE 0 END) as montant_collecte,
      SUM(CASE WHEN type = 'expense' THEN montant_tva ELSE 0 END) as montant_deductible
     FROM invoices
     WHERE workspace_id = $1
       AND EXTRACT(MONTH FROM date_facture) = $2
       AND EXTRACT(YEAR FROM date_facture) = $3
     GROUP BY tva_rate`,
    [workspaceId, month, year]
  );

  // Mois précédent pour comparaison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const prevResult = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN montant_ttc ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END), 0) as expense
     FROM invoices
     WHERE workspace_id = $1
       AND EXTRACT(MONTH FROM date_facture) = $2
       AND EXTRACT(YEAR FROM date_facture) = $3`,
    [workspaceId, prevMonth, prevYear]
  );

  const totalIncome = incomeResult.rows.reduce((sum, r) =>
    sum + parseFloat(r.total as unknown as string), 0);
  const totalExpense = expenseResult.rows.reduce((sum, r) =>
    sum + parseFloat(r.total as unknown as string), 0);
  const prevIncome = parseFloat(prevResult.rows[0].income);
  const prevExpense = parseFloat(prevResult.rows[0].expense);

  return {
    period: { month, year },
    income: {
      total: totalIncome,
      by_category: incomeResult.rows.map(r => ({
        ...r,
        total: parseFloat(r.total as unknown as string),
        count: parseInt(r.count as unknown as string, 10)
      }))
    },
    expense: {
      total: totalExpense,
      by_category: expenseResult.rows.map(r => ({
        ...r,
        total: parseFloat(r.total as unknown as string),
        count: parseInt(r.count as unknown as string, 10)
      }))
    },
    tva: tvaResult.rows.map(r => ({
      taux: parseFloat(r.taux as unknown as string),
      base_ht: parseFloat(r.base_ht as unknown as string),
      montant_collecte: parseFloat(r.montant_collecte as unknown as string),
      montant_deductible: parseFloat(r.montant_deductible as unknown as string),
      solde: parseFloat(r.montant_collecte as unknown as string) -
             parseFloat(r.montant_deductible as unknown as string)
    })),
    comparison: {
      previous_month: { income: prevIncome, expense: prevExpense },
      variation_income: prevIncome ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0,
      variation_expense: prevExpense ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0
    }
  };
};

// ============================================
// RÉSUMÉ TVA
// ============================================

export const getTVASummary = async (
  workspaceId: string,
  year: number,
  quarter?: number
): Promise<TVAAnalytics[]> => {
  let dateFilter = `EXTRACT(YEAR FROM date_facture) = $2`;
  const params: (string | number)[] = [workspaceId, year];

  if (quarter) {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    dateFilter += ` AND EXTRACT(MONTH FROM date_facture) BETWEEN $3 AND $4`;
    params.push(startMonth, endMonth);
  }

  const result = await pool.query<TVAAnalytics>(
    `SELECT
      tva_rate as taux,
      SUM(montant_ht) as base_ht,
      SUM(CASE WHEN type = 'income' THEN montant_tva ELSE 0 END) as montant_collecte,
      SUM(CASE WHEN type = 'expense' THEN montant_tva ELSE 0 END) as montant_deductible
     FROM invoices
     WHERE workspace_id = $1 AND ${dateFilter}
     GROUP BY tva_rate
     ORDER BY tva_rate DESC`,
    params
  );

  return result.rows.map(r => ({
    taux: parseFloat(r.taux as unknown as string),
    base_ht: parseFloat(r.base_ht as unknown as string),
    montant_collecte: parseFloat(r.montant_collecte as unknown as string),
    montant_deductible: parseFloat(r.montant_deductible as unknown as string),
    solde: parseFloat(r.montant_collecte as unknown as string) -
           parseFloat(r.montant_deductible as unknown as string)
  }));
};
