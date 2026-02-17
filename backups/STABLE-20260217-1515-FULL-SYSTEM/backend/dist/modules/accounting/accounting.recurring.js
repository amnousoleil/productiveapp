"use strict";
/**
 * Module Comptabilite - Service Factures Recurrentes
 * @description Gestion des templates de factures recurrentes et generation automatique
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRecurringInvoices = exports.deleteRecurring = exports.updateRecurring = exports.getRecurringById = exports.listRecurring = exports.createRecurring = exports.initRecurringService = void 0;
const accounting_service_js_1 = require("./accounting.service.js");
let pool;
const initRecurringService = (dbPool) => {
    pool = dbPool;
};
exports.initRecurringService = initRecurringService;
// ============================================
// CRUD
// ============================================
/**
 * Cree un template de facture recurrente
 */
const createRecurring = async (workspaceId, data) => {
    const nextDate = calculateNextDate(data.start_date, data.frequency, data.day_of_month, data.day_of_week);
    const result = await pool.query(`INSERT INTO recurring_invoices (
      workspace_id, contact_id, category_id, department_id, member_id,
      type, fournisseur, reference_prefix, notes, currency, tva_rate, line_items,
      frequency, day_of_month, day_of_week, payment_terms_days,
      auto_validate, auto_send,
      next_generation_date, start_date, end_date, max_occurrences
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *`, [
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
    ]);
    return result.rows[0];
};
exports.createRecurring = createRecurring;
/**
 * Liste les templates recurrents
 */
const listRecurring = async (workspaceId, filters) => {
    const page = (filters?.page) || 1;
    const limit = Math.min((filters?.limit) || 20, 100);
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE ri.workspace_id = $1';
    const params = [workspaceId];
    let paramIndex = 2;
    if (filters?.is_active !== undefined) {
        whereClause += ` AND ri.is_active = $${paramIndex++}`;
        params.push(filters.is_active);
    }
    const countResult = await pool.query(`SELECT COUNT(*) FROM recurring_invoices ri ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    params.push(limit, offset);
    const result = await pool.query(`SELECT ri.*, c.name as contact_name, cat.name as category_name
     FROM recurring_invoices ri
     LEFT JOIN contacts c ON ri.contact_id = c.id
     LEFT JOIN accounting_categories cat ON ri.category_id = cat.id
     ${whereClause}
     ORDER BY ri.next_generation_date ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`, params);
    return { data: result.rows, total };
};
exports.listRecurring = listRecurring;
/**
 * Detail d'un template recurrent avec historique
 */
const getRecurringById = async (workspaceId, recurringId) => {
    const result = await pool.query(`SELECT ri.*, c.name as contact_name, cat.name as category_name
     FROM recurring_invoices ri
     LEFT JOIN contacts c ON ri.contact_id = c.id
     LEFT JOIN accounting_categories cat ON ri.category_id = cat.id
     WHERE ri.id = $1 AND ri.workspace_id = $2`, [recurringId, workspaceId]);
    if (!result.rows[0])
        return null;
    const historyResult = await pool.query(`SELECT rih.*, i.reference, i.montant_ttc, i.status as invoice_status
     FROM recurring_invoice_history rih
     JOIN invoices i ON rih.invoice_id = i.id
     WHERE rih.recurring_invoice_id = $1
     ORDER BY rih.occurrence_number DESC
     LIMIT 20`, [recurringId]);
    return { ...result.rows[0], history: historyResult.rows };
};
exports.getRecurringById = getRecurringById;
/**
 * Met a jour un template recurrent
 */
const updateRecurring = async (workspaceId, recurringId, data) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    const allowedFields = {
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
        if (data[key] !== undefined) {
            fields.push(`${col} = $${paramIndex++}`);
            values.push(data[key]);
        }
    }
    if (data.line_items !== undefined) {
        fields.push(`line_items = $${paramIndex++}`);
        values.push(JSON.stringify(data.line_items));
    }
    if (fields.length === 0)
        return (0, exports.getRecurringById)(workspaceId, recurringId);
    // Recalculer next_generation_date si frequence change
    if (data.frequency || data.day_of_month !== undefined || data.day_of_week !== undefined) {
        const current = await (0, exports.getRecurringById)(workspaceId, recurringId);
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
    const result = await pool.query(`UPDATE recurring_invoices SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
     RETURNING *`, values);
    return result.rows[0] || null;
};
exports.updateRecurring = updateRecurring;
/**
 * Supprime un template recurrent
 */
const deleteRecurring = async (workspaceId, recurringId) => {
    const result = await pool.query('DELETE FROM recurring_invoices WHERE id = $1 AND workspace_id = $2', [recurringId, workspaceId]);
    return (result.rowCount ?? 0) > 0;
};
exports.deleteRecurring = deleteRecurring;
// ============================================
// GENERATION AUTOMATIQUE
// ============================================
/**
 * Genere toutes les factures recurrentes en retard
 * A appeler periodiquement (cron, ou au demarrage)
 */
const processRecurringInvoices = async () => {
    const today = new Date().toISOString().split('T')[0];
    let generated = 0;
    const errors = [];
    // Trouver tous les templates a generer
    const result = await pool.query(`SELECT * FROM recurring_invoices
     WHERE is_active = TRUE AND is_paused = FALSE
       AND next_generation_date <= $1
       AND (end_date IS NULL OR end_date >= $1)
       AND (max_occurrences IS NULL OR generated_count < max_occurrences)`, [today]);
    for (const recurring of result.rows) {
        try {
            await generateInvoiceFromRecurring(recurring);
            generated++;
        }
        catch (error) {
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
exports.processRecurringInvoices = processRecurringInvoices;
/**
 * Genere une facture a partir d'un template recurrent
 */
async function generateInvoiceFromRecurring(recurring) {
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
        const invoiceData = {
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
        const invoice = await (0, accounting_service_js_1.createInvoice)(recurring.workspace_id, invoiceData);
        // Lier la facture au template recurrent
        await client.query(`UPDATE invoices SET recurring_invoice_id = $1, source = 'recurring' WHERE id = $2`, [recurring.id, invoice.id]);
        // Auto-valider si configure
        if (recurring.auto_validate) {
            await (0, accounting_service_js_1.updateInvoice)(recurring.workspace_id, invoice.id, { status: 'validated' });
        }
        // Enregistrer dans l'historique
        await client.query(`INSERT INTO recurring_invoice_history (recurring_invoice_id, invoice_id, occurrence_number)
       VALUES ($1, $2, $3)`, [recurring.id, invoice.id, occurrenceNum]);
        // Calculer la prochaine date et mettre a jour le template
        const nextDate = calculateNextDate(recurring.next_generation_date, recurring.frequency, recurring.day_of_month, recurring.day_of_week);
        // Verifier si on a atteint max_occurrences
        const shouldDeactivate = recurring.max_occurrences && occurrenceNum >= recurring.max_occurrences;
        const shouldEnd = recurring.end_date && nextDate > recurring.end_date;
        await client.query(`UPDATE recurring_invoices
       SET generated_count = $1,
           last_generated_at = NOW(),
           next_generation_date = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $4`, [occurrenceNum, nextDate, !(shouldDeactivate || shouldEnd), recurring.id]);
        await client.query('COMMIT');
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
// ============================================
// UTILITAIRES
// ============================================
/**
 * Calcule la prochaine date de generation
 */
function calculateNextDate(fromDate, frequency, dayOfMonth, dayOfWeek) {
    const date = new Date(fromDate);
    switch (frequency) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            if (dayOfWeek !== null && dayOfWeek !== undefined) {
                const currentDay = date.getDay();
                const diff = dayOfWeek - currentDay;
                if (diff !== 0)
                    date.setDate(date.getDate() + (diff > 0 ? diff : diff + 7));
            }
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            if (dayOfMonth)
                date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            if (dayOfMonth)
                date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
            break;
        case 'semiannual':
            date.setMonth(date.getMonth() + 6);
            if (dayOfMonth)
                date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
            break;
        case 'annual':
            date.setFullYear(date.getFullYear() + 1);
            if (dayOfMonth)
                date.setDate(Math.min(dayOfMonth, daysInMonth(date)));
            break;
    }
    return date.toISOString().split('T')[0];
}
function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
//# sourceMappingURL=accounting.recurring.js.map