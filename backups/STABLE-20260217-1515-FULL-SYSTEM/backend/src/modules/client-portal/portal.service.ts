/**
 * Module Portail Client - Service
 * @description Acces client securise aux factures/devis via token unique
 */
import { Pool } from 'pg';
import crypto from 'crypto';

let pool: Pool;
export const initPortalService = (p: Pool): void => { pool = p; };

export const generateToken = async (wid: string, contactId: string, expiresInDays = 90) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(); expires.setDate(expires.getDate() + expiresInDays);
  // Deactivate old tokens
  await pool.query(`UPDATE client_portal_tokens SET is_active=false, updated_at=NOW() WHERE workspace_id=$1 AND contact_id=$2 AND is_active=true`, [wid, contactId]);
  return (await pool.query(
    `INSERT INTO client_portal_tokens (workspace_id, contact_id, token, expires_at, is_active) VALUES ($1,$2,$3,$4,true) RETURNING *`,
    [wid, contactId, token, expires]
  )).rows[0];
};

export const validateToken = async (token: string) => {
  const r = await pool.query(
    `SELECT t.*, c.name AS contact_name, c.email AS contact_email, c.company AS contact_company
     FROM client_portal_tokens t JOIN contacts c ON t.contact_id = c.id
     WHERE t.token=$1 AND t.is_active=true AND t.expires_at > NOW()`, [token]
  );
  if (!r.rows[0]) return null;
  await pool.query('UPDATE client_portal_tokens SET last_accessed_at=NOW() WHERE id=$1', [r.rows[0].id]);
  return r.rows[0];
};

export const getClientInvoices = async (wid: string, contactId: string) => {
  return (await pool.query(
    `SELECT id, reference, type, document_type, fournisseur, montant_ht, montant_tva, montant_ttc, tva_rate, date_facture, date_echeance, status, currency, notes, created_at
     FROM invoices WHERE workspace_id=$1 AND contact_id=$2 AND status != 'draft' ORDER BY date_facture DESC`,
    [wid, contactId]
  )).rows;
};

export const getClientContracts = async (wid: string, contactId: string) => {
  return (await pool.query(
    `SELECT id, title, status, start_date, end_date, value, currency, signed_at, created_at
     FROM contracts WHERE workspace_id=$1 AND contact_id=$2 AND status != 'draft' ORDER BY created_at DESC`,
    [wid, contactId]
  )).rows;
};

export const getPortalDashboard = async (wid: string, contactId: string) => {
  const invoices = await getClientInvoices(wid, contactId);
  const contracts = await getClientContracts(wid, contactId);
  const totalOwed = invoices.filter(i => i.type === 'income' && !['paid', 'cancelled'].includes(i.status)).reduce((s: number, i: any) => s + parseFloat(i.montant_ttc), 0);
  const totalPaid = invoices.filter(i => i.type === 'income' && i.status === 'paid').reduce((s: number, i: any) => s + parseFloat(i.montant_ttc), 0);
  const overdue = invoices.filter(i => i.status !== 'paid' && i.date_echeance && new Date(i.date_echeance) < new Date());
  return { contact_id: contactId, total_owed: totalOwed, total_paid: totalPaid, overdue_count: overdue.length, invoices, contracts };
};

export const listPortalTokens = async (wid: string) => {
  return (await pool.query(
    `SELECT t.*, c.name AS contact_name, c.email AS contact_email
     FROM client_portal_tokens t JOIN contacts c ON t.contact_id = c.id
     WHERE t.workspace_id=$1 ORDER BY t.created_at DESC`, [wid]
  )).rows;
};

export const revokeToken = async (wid: string, tokenId: string) => {
  return (await pool.query(`UPDATE client_portal_tokens SET is_active=false, updated_at=NOW() WHERE id=$1 AND workspace_id=$2 RETURNING *`, [tokenId, wid])).rows[0] || null;
};
