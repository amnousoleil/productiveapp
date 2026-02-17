"use strict";
/**
 * Module Comptabilité - Service Contacts
 * @description CRUD et gestion des contacts (clients, fournisseurs)
 * avec calcul automatique des totaux facturés/payés
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactTotals = exports.getContactInvoices = exports.deleteContact = exports.updateContact = exports.getContactById = exports.listContacts = exports.createContact = exports.initContactsService = void 0;
let pool;
const initContactsService = (dbPool) => {
    pool = dbPool;
};
exports.initContactsService = initContactsService;
// ============================================
// CRÉATION
// ============================================
/**
 * Crée un nouveau contact avec auto-slugging à partir du nom
 */
const createContact = async (workspaceId, data) => {
    try {
        const result = await pool.query(`INSERT INTO contacts (
        workspace_id, type, name, company,
        email, phone, address, postal_code,
        city, country, siret, tva_number, default_payment_terms,
        notes, total_invoiced, total_paid,
        is_active
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, 0, 0, true
      ) RETURNING *`, [
            workspaceId,
            data.type,
            data.name || data.company || null,
            data.company || null,
            data.email || null,
            data.phone || null,
            data.address || null,
            data.postal_code || null,
            data.city || null,
            data.country || 'FR',
            data.siret || null,
            data.tva_number || null,
            data.default_payment_terms ?? null,
            data.notes || null
        ]);
        return result.rows[0];
    }
    catch (error) {
        throw new Error(`Erreur création contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.createContact = createContact;
// ============================================
// LISTE PAGINÉE
// ============================================
/**
 * Liste les contacts avec pagination et filtres (type, recherche nom/email)
 */
const listContacts = async (workspaceId, filters) => {
    try {
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 20, 100);
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
        if (filters.type) {
            whereClause += ` AND type = $${paramIndex++}`;
            params.push(filters.type);
        }
        if (filters.is_active !== undefined) {
            whereClause += ` AND is_active = $${paramIndex++}`;
            params.push(filters.is_active);
        }
        else {
            // Par défaut, ne retourner que les contacts actifs
            whereClause += ' AND is_active = true';
        }
        if (filters.search) {
            whereClause += ` AND (
        company ILIKE $${paramIndex}
        OR name ILIKE $${paramIndex}
        OR email ILIKE $${paramIndex}
      )`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        // Compter le total
        const countResult = await pool.query(`SELECT COUNT(*) FROM contacts ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        // Récupérer les contacts
        params.push(limit, offset);
        const result = await pool.query(`SELECT * FROM contacts
       ${whereClause}
       ORDER BY COALESCE(company, name) ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`, params);
        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        throw new Error(`Erreur liste contacts: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.listContacts = listContacts;
// ============================================
// DÉTAIL AVEC TOTAUX CALCULÉS
// ============================================
/**
 * Récupère un contact par ID avec total_invoiced et total_paid recalculés
 */
const getContactById = async (workspaceId, contactId) => {
    try {
        const result = await pool.query(`SELECT c.*,
        COALESCE((
          SELECT SUM(i.montant_ttc)
          FROM invoices i
          WHERE i.contact_id = c.id AND i.workspace_id = c.workspace_id
        ), 0) as total_invoiced,
        COALESCE((
          SELECT SUM(i.montant_ttc)
          FROM invoices i
          WHERE i.contact_id = c.id AND i.workspace_id = c.workspace_id AND i.status = 'paid'
        ), 0) as total_paid
       FROM contacts c
       WHERE c.id = $1 AND c.workspace_id = $2`, [contactId, workspaceId]);
        if (!result.rows[0])
            return null;
        return {
            ...result.rows[0],
            total_invoiced: parseFloat(result.rows[0].total_invoiced),
            total_paid: parseFloat(result.rows[0].total_paid)
        };
    }
    catch (error) {
        throw new Error(`Erreur récupération contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getContactById = getContactById;
// ============================================
// MISE À JOUR DYNAMIQUE
// ============================================
/**
 * Met à jour un contact avec des champs dynamiques
 */
const updateContact = async (workspaceId, contactId, data) => {
    try {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'type', 'company', 'name', 'email',
            'phone', 'address', 'postal_code',
            'city', 'country', 'siret', 'tva_number', 'default_payment_terms',
            'notes', 'is_active'
        ];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(data[field]);
            }
        }
        if (fields.length === 0) {
            return (0, exports.getContactById)(workspaceId, contactId);
        }
        values.push(contactId, workspaceId);
        const result = await pool.query(`UPDATE contacts
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`, values);
        return result.rows[0] || null;
    }
    catch (error) {
        throw new Error(`Erreur mise à jour contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.updateContact = updateContact;
// ============================================
// SUPPRESSION (Soft Delete)
// ============================================
/**
 * Désactive un contact (soft delete via is_active = false)
 */
const deleteContact = async (workspaceId, contactId) => {
    try {
        const result = await pool.query(`UPDATE contacts
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`, [contactId, workspaceId]);
        return (result.rowCount ?? 0) > 0;
    }
    catch (error) {
        throw new Error(`Erreur suppression contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.deleteContact = deleteContact;
// ============================================
// FACTURES D'UN CONTACT
// ============================================
/**
 * Récupère toutes les factures associées à un contact
 */
const getContactInvoices = async (workspaceId, contactId) => {
    try {
        const result = await pool.query(`SELECT i.*, c.name as category_name, c.slug as category_slug
       FROM invoices i
       LEFT JOIN accounting_categories c ON i.category_id = c.id
       WHERE i.contact_id = $1 AND i.workspace_id = $2
       ORDER BY i.date_facture DESC, i.created_at DESC`, [contactId, workspaceId]);
        return result.rows;
    }
    catch (error) {
        throw new Error(`Erreur récupération factures contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getContactInvoices = getContactInvoices;
// ============================================
// RECALCUL DES TOTAUX
// ============================================
/**
 * Recalcule total_invoiced et total_paid à partir des factures
 */
const updateContactTotals = async (workspaceId, contactId) => {
    try {
        await pool.query(`UPDATE contacts
       SET
         total_invoiced = COALESCE((
           SELECT SUM(montant_ttc)
           FROM invoices
           WHERE contact_id = $1 AND workspace_id = $2
         ), 0),
         total_paid = COALESCE((
           SELECT SUM(montant_ttc)
           FROM invoices
           WHERE contact_id = $1 AND workspace_id = $2 AND status = 'paid'
         ), 0),
         updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`, [contactId, workspaceId]);
    }
    catch (error) {
        throw new Error(`Erreur recalcul totaux contact: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.updateContactTotals = updateContactTotals;
//# sourceMappingURL=accounting.contacts.js.map