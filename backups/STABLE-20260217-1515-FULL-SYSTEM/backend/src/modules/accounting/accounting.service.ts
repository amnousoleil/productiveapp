/**
 * Module Comptabilité - Service Principal
 * @description Logique métier et requêtes SQL pour les factures et catégories
 */

import { Pool } from 'pg';
import {
  Invoice, AccountingCategory, LineItem, InvoiceFilters,
  CreateInvoiceDTO, UpdateInvoiceDTO, CreateCategoryDTO,
  PaginatedResponse, InvoiceStatus
} from './accounting.types.js';

// Pool PostgreSQL - à adapter lors de l'intégration
let pool: Pool;

export const initAccountingService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// GESTION DES FACTURES
// ============================================

export const createInvoice = async (
  workspaceId: string,
  data: CreateInvoiceDTO
): Promise<Invoice> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query<Invoice>(
      `INSERT INTO invoices (
        workspace_id, category_id, type, fournisseur, reference,
        montant_ht, montant_tva, montant_ttc, tva_rate,
        date_facture, date_echeance, notes, source, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'manual', 'draft')
      RETURNING *`,
      [
        workspaceId, data.category_id || null, data.type, data.fournisseur,
        data.reference || null, data.montant_ht, data.montant_tva, data.montant_ttc,
        data.tva_rate || 20, data.date_facture, data.date_echeance || null,
        data.notes || null
      ]
    );

    const invoice = result.rows[0];

    if (data.line_items?.length) {
      for (const item of data.line_items) {
        await client.query(
          `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tva_rate, amount)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [invoice.id, item.description, item.quantity, item.unit_price, item.tva_rate,
           item.quantity * item.unit_price]
        );
      }
    }

    await client.query('COMMIT');
    return invoice;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getInvoiceById = async (
  workspaceId: string,
  invoiceId: string
): Promise<Invoice | null> => {
  const result = await pool.query<Invoice>(
    `SELECT i.*, c.name as category_name, c.slug as category_slug
     FROM invoices i
     LEFT JOIN accounting_categories c ON i.category_id = c.id
     WHERE i.id = $1 AND i.workspace_id = $2`,
    [invoiceId, workspaceId]
  );

  if (!result.rows[0]) return null;

  const lineItems = await pool.query<LineItem>(
    'SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY created_at',
    [invoiceId]
  );

  return { ...result.rows[0], line_items: lineItems.rows };
};

export const listInvoices = async (
  workspaceId: string,
  filters: InvoiceFilters
): Promise<PaginatedResponse<Invoice>> => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE i.workspace_id = $1';
  const params: (string | number)[] = [workspaceId];
  let paramIndex = 2;

  if (filters.type) {
    whereClause += ` AND i.type = $${paramIndex++}`;
    params.push(filters.type);
  }
  if (filters.status) {
    whereClause += ` AND i.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters.category_id) {
    whereClause += ` AND i.category_id = $${paramIndex++}`;
    params.push(filters.category_id);
  }
  if (filters.date_from) {
    whereClause += ` AND i.date_facture >= $${paramIndex++}`;
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    whereClause += ` AND i.date_facture <= $${paramIndex++}`;
    params.push(filters.date_to);
  }
  if (filters.search) {
    whereClause += ` AND (i.fournisseur ILIKE $${paramIndex} OR i.reference ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM invoices i ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const result = await pool.query<Invoice>(
    `SELECT i.*, c.name as category_name
     FROM invoices i
     LEFT JOIN accounting_categories c ON i.category_id = c.id
     ${whereClause}
     ORDER BY i.date_facture DESC, i.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  return {
    data: result.rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

export const updateInvoice = async (
  workspaceId: string,
  invoiceId: string,
  data: UpdateInvoiceDTO
): Promise<Invoice | null> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'category_id', 'fournisseur', 'reference', 'montant_ht', 'montant_tva',
    'montant_ttc', 'tva_rate', 'date_facture', 'date_echeance', 'notes', 'status'
  ];

  for (const field of allowedFields) {
    if (data[field as keyof UpdateInvoiceDTO] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(data[field as keyof UpdateInvoiceDTO] as string | number | null);
    }
  }

  if (fields.length === 0) return getInvoiceById(workspaceId, invoiceId);

  values.push(invoiceId, workspaceId);
  const result = await pool.query<Invoice>(
    `UPDATE invoices SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

export const deleteInvoice = async (
  workspaceId: string,
  invoiceId: string
): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM invoices WHERE id = $1 AND workspace_id = $2',
    [invoiceId, workspaceId]
  );
  return (result.rowCount ?? 0) > 0;
};

export const validateInvoice = async (
  workspaceId: string,
  invoiceId: string
): Promise<Invoice | null> => {
  return updateInvoice(workspaceId, invoiceId, { status: 'validated' as InvoiceStatus });
};

// ============================================
// GESTION DES CATÉGORIES
// ============================================

export const listCategories = async (workspaceId: string): Promise<AccountingCategory[]> => {
  const result = await pool.query<AccountingCategory>(
    `SELECT * FROM accounting_categories
     WHERE workspace_id = $1
     ORDER BY type, is_default DESC, name`,
    [workspaceId]
  );
  return result.rows;
};

export const createCategory = async (
  workspaceId: string,
  data: CreateCategoryDTO
): Promise<AccountingCategory> => {
  const slug = data.slug || data.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const result = await pool.query<AccountingCategory>(
    `INSERT INTO accounting_categories (workspace_id, slug, name, type, icon, color, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, false)
     RETURNING *`,
    [workspaceId, slug, data.name, data.type, data.icon || 'folder', data.color || '#6B7280']
  );
  return result.rows[0];
};

export const seedDefaultCategories = async (workspaceId: string): Promise<void> => {
  await pool.query('SELECT seed_default_accounting_categories($1)', [workspaceId]);
};
