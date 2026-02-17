/**
 * Module Comptabilité - Service Export
 * @description Export des données en CSV, PDF et Excel
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  Invoice, ExportFilters, ExportFormat, ExportType, TVAAnalytics
} from './accounting.types.js';

let pool: Pool;
let exportDir: string = './exports';

export const initExportService = (dbPool: Pool, exportDirectory?: string): void => {
  pool = dbPool;
  if (exportDirectory) exportDir = exportDirectory;
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
};

// ============================================
// EXPORT CSV (Fonctionnel)
// ============================================

export const exportInvoicesToCSV = async (
  workspaceId: string,
  filters: ExportFilters
): Promise<string> => {
  const invoices = await fetchInvoicesForExport(workspaceId, filters);

  const headers = [
    'ID', 'Type', 'Statut', 'Fournisseur', 'Référence',
    'Date Facture', 'Date Échéance', 'Montant HT', 'TVA', 'Montant TTC',
    'Taux TVA', 'Catégorie', 'Source', 'Notes'
  ];

  const rows = invoices.map(inv => [
    inv.id,
    inv.type,
    inv.status,
    escapeCsvField(inv.fournisseur),
    inv.reference || '',
    formatDate(inv.date_facture),
    inv.date_echeance ? formatDate(inv.date_echeance) : '',
    inv.montant_ht.toFixed(2),
    inv.montant_tva.toFixed(2),
    inv.montant_ttc.toFixed(2),
    `${inv.tva_rate}%`,
    (inv as Invoice & { category_name?: string }).category_name || '',
    inv.source,
    escapeCsvField(inv.notes || '')
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const filename = `factures_${workspaceId}_${Date.now()}.csv`;
  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, '\ufeff' + csvContent, 'utf8'); // BOM pour Excel

  await saveExportRecord(workspaceId, 'invoices', 'csv', filePath, filters);
  return filePath;
};

export const exportTVAToCSV = async (
  workspaceId: string,
  year: number,
  quarter?: number
): Promise<string> => {
  const tvaData = await fetchTVAForExport(workspaceId, year, quarter);

  const headers = ['Taux TVA', 'Base HT', 'TVA Collectée', 'TVA Déductible', 'Solde'];
  const rows = tvaData.map(t => [
    `${t.taux}%`,
    t.base_ht.toFixed(2),
    t.montant_collecte.toFixed(2),
    t.montant_deductible.toFixed(2),
    t.solde.toFixed(2)
  ]);

  // Totaux
  const totals = tvaData.reduce((acc, t) => ({
    base_ht: acc.base_ht + t.base_ht,
    collecte: acc.collecte + t.montant_collecte,
    deductible: acc.deductible + t.montant_deductible,
    solde: acc.solde + t.solde
  }), { base_ht: 0, collecte: 0, deductible: 0, solde: 0 });

  rows.push([
    'TOTAL',
    totals.base_ht.toFixed(2),
    totals.collecte.toFixed(2),
    totals.deductible.toFixed(2),
    totals.solde.toFixed(2)
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const filename = `tva_${workspaceId}_${year}${quarter ? `_Q${quarter}` : ''}_${Date.now()}.csv`;
  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, '\ufeff' + csvContent, 'utf8');

  await saveExportRecord(workspaceId, 'tva', 'csv', filePath, { date_from: `${year}-01-01` });
  return filePath;
};

// ============================================
// EXPORT PDF (Structure prête)
// ============================================

export const exportInvoicesToPDF = async (
  workspaceId: string,
  filters: ExportFilters
): Promise<string> => {
  const invoices = await fetchInvoicesForExport(workspaceId, filters);

  // Structure pour génération PDF (à implémenter avec pdfkit ou puppeteer)
  const pdfData = {
    title: 'Export Factures',
    generated_at: new Date().toISOString(),
    workspace_id: workspaceId,
    filters,
    invoices: invoices.map(inv => ({
      ...inv,
      date_facture: formatDate(inv.date_facture),
      date_echeance: inv.date_echeance ? formatDate(inv.date_echeance) : null
    })),
    summary: {
      total_count: invoices.length,
      total_ht: invoices.reduce((sum, i) => sum + i.montant_ht, 0),
      total_tva: invoices.reduce((sum, i) => sum + i.montant_tva, 0),
      total_ttc: invoices.reduce((sum, i) => sum + i.montant_ttc, 0)
    }
  };

  // Placeholder: écrire JSON en attendant l'implémentation PDF
  const filename = `factures_${workspaceId}_${Date.now()}.pdf.json`;
  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(pdfData, null, 2));

  await saveExportRecord(workspaceId, 'invoices', 'pdf', filePath, filters);
  return filePath;
};

// ============================================
// EXPORT EXCEL (Structure prête)
// ============================================

export const exportInvoicesToExcel = async (
  workspaceId: string,
  filters: ExportFilters
): Promise<string> => {
  const invoices = await fetchInvoicesForExport(workspaceId, filters);

  // Structure pour génération Excel (à implémenter avec exceljs)
  const excelData = {
    sheets: [
      {
        name: 'Factures',
        columns: [
          { header: 'ID', key: 'id', width: 36 },
          { header: 'Type', key: 'type', width: 10 },
          { header: 'Statut', key: 'status', width: 12 },
          { header: 'Fournisseur', key: 'fournisseur', width: 30 },
          { header: 'Référence', key: 'reference', width: 20 },
          { header: 'Date', key: 'date_facture', width: 12 },
          { header: 'Montant HT', key: 'montant_ht', width: 15 },
          { header: 'TVA', key: 'montant_tva', width: 12 },
          { header: 'Montant TTC', key: 'montant_ttc', width: 15 }
        ],
        rows: invoices.map(inv => ({
          ...inv,
          date_facture: formatDate(inv.date_facture)
        }))
      }
    ]
  };

  // Placeholder: écrire JSON en attendant l'implémentation Excel
  const filename = `factures_${workspaceId}_${Date.now()}.xlsx.json`;
  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(excelData, null, 2));

  await saveExportRecord(workspaceId, 'invoices', 'excel', filePath, filters);
  return filePath;
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

const fetchInvoicesForExport = async (
  workspaceId: string,
  filters: ExportFilters
): Promise<Invoice[]> => {
  let query = `
    SELECT i.*, c.name as category_name
    FROM invoices i
    LEFT JOIN accounting_categories c ON i.category_id = c.id
    WHERE i.workspace_id = $1
  `;
  const params: (string | number)[] = [workspaceId];
  let paramIndex = 2;

  if (filters.date_from) {
    query += ` AND i.date_facture >= $${paramIndex++}`;
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    query += ` AND i.date_facture <= $${paramIndex++}`;
    params.push(filters.date_to);
  }
  if (filters.type) {
    query += ` AND i.type = $${paramIndex++}`;
    params.push(filters.type);
  }
  if (filters.status) {
    query += ` AND i.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters.category_id) {
    query += ` AND i.category_id = $${paramIndex++}`;
    params.push(filters.category_id);
  }

  query += ' ORDER BY i.date_facture DESC';

  const result = await pool.query<Invoice>(query, params);
  return result.rows;
};

const fetchTVAForExport = async (
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

  const result = await pool.query(
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
    taux: parseFloat(r.taux),
    base_ht: parseFloat(r.base_ht),
    montant_collecte: parseFloat(r.montant_collecte),
    montant_deductible: parseFloat(r.montant_deductible),
    solde: parseFloat(r.montant_collecte) - parseFloat(r.montant_deductible)
  }));
};

const saveExportRecord = async (
  workspaceId: string,
  type: ExportType,
  format: ExportFormat,
  filePath: string,
  filters: ExportFilters
): Promise<void> => {
  await pool.query(
    `INSERT INTO accounting_exports (workspace_id, type, format, file_url, filters, status)
     VALUES ($1, $2, $3, $4, $5, 'completed')`,
    [workspaceId, type, format, filePath, JSON.stringify(filters)]
  );
};

const escapeCsvField = (field: string): string => {
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
