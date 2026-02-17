/**
 * Module Comptabilite - Service Factures Recurrentes
 * @description Gestion des templates de factures recurrentes et generation automatique
 */

import { Pool } from 'pg';
import { CreateInvoiceDTO } from './accounting.types.js';
import { createInvoice, updateInvoice } from './accounting.service.js';

let pool: Pool;

export const initRecurringService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// TYPES
// ============================================

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface RecurringInvoice {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  category_id: string | null;
  department_id: string | null;
  member_id: string | null;
  type: 'expense' | 'income';
  fournisseur: string;
  reference_prefix: string | null;
  notes: string | null;
  currency: string;
  tva_rate: number;
  line_items: Array<{ description: string; quantity: number; unit_price: number; tva_rate: number }>;
  frequency: RecurringFrequency;
  day_of_month: number | null;
  day_of_week: number | null;
  payment_terms_days: number;
  auto_validate: boolean;
  auto_send: boolean;
  next_generation_date: string;
  last_generated_at: string | null;
  generated_count: number;
  max_occurrences: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringDTO {
  contact_id?: string;
  category_id?: string;
  department_id?: string;
  member_id?: string;
  type: 'expense' | 'income';
  fournisseur: string;
  reference_prefix?: string;
  notes?: string;
  currency?: string;
  tva_rate?: number;
  line_items: Array<{ description: string; quantity: number; unit_price: number; tva_rate: number }>;
  frequency: RecurringFrequency;
  day_of_month?: number;
  day_of_week?: number;
  payment_terms_days?: number;
  auto_validate?: boolean;
  auto_send?: boolean;
  start_date: string;
  end_date?: string;
  max_occurrences?: number;
}

export interface UpdateRecurringDTO extends Partial<CreateRecurringDTO> {
  is_active?: boolean;
  is_paused?: boolean;
}

// ============================================
// CRUD
// ============================================

/**
 * Cree un template de facture recurrente
 */
export const createRecurring = async (
  workspaceId: string,
  data: CreateRecurringDTO
): Promise<RecurringInvoice> => {
  const nextDate = calculateNextDate(data.start_date, data.frequency, data.day_of_month, data.day_of_week);

  const result = await pool.query<RecurringInvoice>(
    `INSERT INTO recurring_invoices (
      workspace_id, contact_id, category_id, department_id, member_id,
      type, fournisseur, reference_prefix, notes, currency, tva_rate, line_items,
      frequency, day_of_month, day_of_week, payment_terms_days,
      auto_validate, auto_send,
      next_generation_date, start_date, end_date, max_occurrences
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *`,
    [
      workspaceId,
      data.contact_id || null,
      data.category_id || null,
      data.department_id || null,
      data.member_id || null,
      data.type,
      data.fournisseur,
      data.reference_prefix || null,
      data.notes || null,
      data.currency || 'EUR',
      data.tva_rate ?? 20,
      JSON.stringify(data.line_items),
      data.frequency,
      data.day_of_month || null,
      data.day_of_week || null,
      data.payment_terms_days ?? 30,
      data.auto_validate ?? false,
      data.auto_send ?? false,
      nextDate,
      data.start_date,
      data.end_date || null,
      data.max_occurrences || null,
    ]
  );

  return result.rows[0];
};

/**
 * Liste les templates recurrents
 */
export const listRecurring = async (
  workspaceId: string,
  filters?: { is_active?: boolean; page?: number; limit?: number }
): Promise<{ data: RecurringInvoice[]; total: number }> => {
  const page = (filters?.page) || 1;
  const limit = Math.min((filters?.limit) || 20, 100);
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE ri.workspace_id = $1';
  const params: (string | number | boolean)[] = [workspaceId];
  let paramIndex = 2;

  if (filters?.is_active !== undefined) {
    whereClause += ` AND ri.is_active = $${paramIndex++}`;
    params.push(filters.is_active);
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM recurring_invoices ri ${whereClause}`, params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const result = await pool.query<RecurringInvoice>(
    `SELECT ri.*, c.name as contact_name, cat.name as category_name
     FROM recurring_invoices ri
     LEFT JOIN contacts c ON ri.contact_id = c.id
     LEFT JOIN accounting_categories cat ON ri.category_id = cat.id
     ${whereClause}
     ORDER BY ri.next_generation_date ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  return { data: result.rows, total };
};

/**
 * Detail d'un template recurrent avec historique
 */
export const getRecurringById = async (
  workspaceId: string,
  recurringId: string
): Promise<RecurringInvoice & { history: unknown[] } | null> => {
  const result = await pool.query<RecurringInvoice>(
    `SELECT ri.*, c.name as contact_name, cat.name as category_name
     FROM recurring_invoices ri
     LEFT JOIN contacts c ON ri.contact_id = c.id
     LEFT JOIN accounting_categories cat ON ri.category_id = cat.id
     WHERE ri.id = $1 AND ri.workspace_id = $2`,
    [recurringId, workspaceId]
  );

  if (!result.rows[0]) return null;

  const historyResult = await pool.query(
    `SELECT rih.*, i.reference, i.montant_ttc, i.status as invoice_status
     FROM recurring_invoice_history rih
     JOIN invoices i ON rih.invoice_id = i.id
     WHERE rih.recurring_invoice_id = $1
     ORDER BY rih.occurrence_number DESC
     LIMIT 20`,
    [recurringId]
  );

  return { ...result.rows[0], history: historyResult.rows };
};

/**
 * Met a jour un template recurrent
 */
export const updateRecurring = async (
  workspaceId: string,
  recurringId: string,
  data: UpdateRecurringDTO
): Promise<RecurringInvoice | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields: Record<string, string> = {
    contact_id: 'contact_id', category_id: 'category_id', department_id: 'department_id',
    member_id: 'member_id', type: 'type', fournisseur: 'fournisseur',
    reference_prefix: 'reference_prefix', notes: 'notes', currency: 'currency',
    tva_rate: 'tva_rate', frequency: 'frequency', day_of_month: 'day_of_month',
    day_of_week: 'day_of_week', payment_terms_days: 'payment_terms_days',
    auto_validate: 'auto_validate', auto_send: 'auto_send',
    end_date: 'end_date', max_occurrences: 'max_occurrences',
    is_active: 'is_active', is_paused: 'is_paused',
  };

  for (const [key, col] of Object.entries(allowedFields)) {
    if ((data as Record<string, unknown>)[key] !== undefined) {
      fields.push(`${col} = $${paramIndex++}`);
      values.push((data as Record<string, unknown>)[key]);
    }
  }

  if (data.line_items !== undefined) {
    fields.push(`line_items = $${paramIndex++}`);
    values.push(JSON.stringify(data.line_items));
  }

  if (fields.length === 0) return getRecurringById(workspaceId, recurringId);

  // Recalculer next_generation_date si frequence change
  if (data.frequency || data.day_of_month !== undefined || data.day_of_week !== undefined) {
    const current = await getRecurringById(workspaceId, recurringId);
    if (current) {
      const freq = data.frequency || current.frequency;
      const dom = data.day_of_month !== undefined ? data.day_of_month : current.day_of_month;
      const dow = data.day_of_week !== undefined ? data.day_of_week : current.day_of_week;
      const nextDate = calculateNextDate(new Date().toISOString().split('T')[0], freq, dom, dow);
      fields.push(`next_generation_date = $${paramIndex++}`);
      values.push(nextDate);
    }
  }

  values.push(recurringId, workspaceId);
  const result = await pool.query<RecurringInvoice>(
    `UPDATE recurring_invoices SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Supprime un template recurrent
 */
export const deleteRecurring = async (
  workspaceId: string,
  recurringId: string
): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM recurring_invoices WHERE id = $1 AND workspace_id = $2',
    [recurringId, workspaceId]
  );
  return (result.rowCount ?? 0) > 0;
};

// ============================================
// GENERATION AUTOMATIQUE
// ============================================

/**
 * Genere toutes les factures recurrentes en retard
 * A appeler periodiquement (cron, ou au demarrage)
 */
export const processRecurringInvoices = async (): Promise<{
  generated: number;
  errors: string[];
}> => {
  const today = new Date().toISOString().split('T')[0];
  let generated = 0;
  const errors: string[] = [];

  // Trouver tous les templates a generer
  const result = await pool.query<RecurringInvoice>(
    `SELECT * FROM recurring_invoices
     WHERE is_active = TRUE AND is_paused = FALSE
       AND next_generation_date <= $1
       AND (end_date IS NULL OR end_date >= $1)
       AND (max_occurrences IS NULL OR generated_count < max_occurrences)`,
    [today]
  );

  for (const recurring of result.rows) {
    try {
      await generateInvoiceFromRecurring(recurring);
      generated++;
    } catch (error) {
      const msg = `Erreur generation recurrente ${recurring.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  if (generated > 0) {
    console.log(`[Recurring] ${generated} factures generees`);
  }

  return { generated, errors };
};

/**
 * Genere une facture a partir d'un template recurrent
 */
async function generateInvoiceFromRecurring(recurring: RecurringInvoice): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const items = typeof recurring.line_items === 'string'
      ? JSON.parse(recurring.line_items)
      : recurring.line_items;

    let totalHt = 0;
    let totalTva = 0;
    for (const item of items) {
      const lineHt = item.quantity * item.unit_price;
      totalHt += lineHt;
      totalTva += lineHt * (item.tva_rate / 100);
    }
    totalHt = Math.round(totalHt * 100) / 100;
    totalTva = Math.round(totalTva * 100) / 100;

    const occurrenceNum = recurring.generated_count + 1;
    const reference = recurring.reference_prefix
      ? `${recurring.reference_prefix}-${String(occurrenceNum).padStart(4, '0')}`
      : null;

    const dueDate = new Date(recurring.next_generation_date);
    dueDate.setDate(dueDate.getDate() + recurring.payment_terms_days);

    const invoiceData: CreateInvoiceDTO = {
      type: recurring.type,
      fournisseur: recurring.fournisseur,
      reference: reference || undefined,
      montant_ht: totalHt,
      montant_tva: totalTva,
      montant_ttc: totalHt + totalTva,
      tva_rate: recurring.tva_rate,
      date_facture: recurring.next_generation_date,
      date_echeance: dueDate.toISOString().split('T')[0],
      notes: recurring.notes || undefined,
      line_items: items,
      category_id: recurring.category_id || undefined,
      contact_id: recurring.contact_id || undefined,
      department_id: recurring.department_id || undefined,
      currency: recurring.currency || 'EUR',
    };

    const invoice = await createInvoice(recurring.workspace_id, invoiceData);

    // Lier la facture au template recurrent
    await client.query(
      `UPDATE invoices SET recurring_invoice_id = $1, source = 'recurring' WHERE id = $2`,
      [recurring.id, invoice.id]
    );

    // Auto-valider si configure
    if (recurring.auto_validate) {
      await updateInvoice(recurring.workspace_id, invoice.id, { status: 'validated' as any });
    }

    // Enregistrer dans l'historique
    await client.query(
      `INSERT INTO recurring_invoice_history (recurring_invoice_id, invoice_id, occurrence_number)
       VALUES ($1, $2, $3)`,
      [recurring.id, invoice.id, occurrenceNum]
    );

    // Calculer la prochaine date et mettre a jour le template
    const nextDate = calculateNextDate(
      recurring.next_generation_date,
      recurring.frequency,
      recurring.day_of_month,
      recurring.day_of_week
    );

    // Verifier si on a atteint max_occurrences
    const shouldDeactivate = recurring.max_occurrences && occurrenceNum >= recurring.max_occurrences;
    const shouldEnd = recurring.end_date && nextDate > recurring.end_date;

    await client.query(
      `UPDATE recurring_invoices
       SET generated_count = $1,
           last_generated_at = NOW(),
           next_generation_date = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [occurrenceNum, nextDate, !(shouldDeactivate || shouldEnd), recurring.id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Calcule la prochaine date de generation
 */
function calculateNextDate(
  fromDate: string,
  frequency: RecurringFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): string {
  const date = new Date(fromDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const currentDay = date.getDay();
        const diff = dayOfWeek - currentDay;
        if (diff !== 0) date.setDate(date.getDate() + (diff > 0 ? diff : diff + 7));
      }
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
      break;
    case 'semiannual':
      date.setMonth(date.getMonth() + 6);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
      break;
  }

  return date.toISOString().split('T')[0];
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
