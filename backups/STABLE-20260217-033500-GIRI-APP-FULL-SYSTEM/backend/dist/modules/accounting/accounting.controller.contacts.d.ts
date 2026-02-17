/**
 * Module Comptabilite - Controller Contacts
 * @description Handlers Express pour les endpoints contacts (clients, fournisseurs)
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    id?: string;
}>;
/**
 * GET /contacts
 * Liste des contacts avec filtres : type, search, page, limit
 */
export declare const listContacts: (req: Req, res: Response) => Promise<void>;
/**
 * POST /contacts
 * Creer un nouveau contact
 * Body: { type, name?, company?, email?, ... }
 */
export declare const createContact: (req: Req, res: Response) => Promise<void>;
/**
 * GET /contacts/:id
 * Detail d'un contact avec totaux recalcules
 */
export declare const getContact: (req: Req, res: Response) => Promise<void>;
/**
 * PUT /contacts/:id
 * Modifier un contact
 */
export declare const updateContact: (req: Req, res: Response) => Promise<void>;
/**
 * DELETE /contacts/:id
 * Desactiver un contact (soft delete)
 */
export declare const deleteContact: (req: Req, res: Response) => Promise<void>;
/**
 * GET /contacts/:id/invoices
 * Factures associees a un contact
 */
export declare const getContactInvoices: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=accounting.controller.contacts.d.ts.map