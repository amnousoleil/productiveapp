/**
 * Module Comptabilité - Service Contacts
 * @description CRUD et gestion des contacts (clients, fournisseurs)
 * avec calcul automatique des totaux facturés/payés
 */
import { Pool } from 'pg';
import { Contact, CreateContactDTO, UpdateContactDTO, ContactFilters, Invoice, PaginatedResponse } from './accounting.types.js';
export declare const initContactsService: (dbPool: Pool) => void;
/**
 * Crée un nouveau contact avec auto-slugging à partir du nom
 */
export declare const createContact: (workspaceId: string, data: CreateContactDTO) => Promise<Contact>;
/**
 * Liste les contacts avec pagination et filtres (type, recherche nom/email)
 */
export declare const listContacts: (workspaceId: string, filters: ContactFilters) => Promise<PaginatedResponse<Contact>>;
/**
 * Récupère un contact par ID avec total_invoiced et total_paid recalculés
 */
export declare const getContactById: (workspaceId: string, contactId: string) => Promise<Contact | null>;
/**
 * Met à jour un contact avec des champs dynamiques
 */
export declare const updateContact: (workspaceId: string, contactId: string, data: UpdateContactDTO) => Promise<Contact | null>;
/**
 * Désactive un contact (soft delete via is_active = false)
 */
export declare const deleteContact: (workspaceId: string, contactId: string) => Promise<boolean>;
/**
 * Récupère toutes les factures associées à un contact
 */
export declare const getContactInvoices: (workspaceId: string, contactId: string) => Promise<Invoice[]>;
/**
 * Recalcule total_invoiced et total_paid à partir des factures
 */
export declare const updateContactTotals: (workspaceId: string, contactId: string) => Promise<void>;
//# sourceMappingURL=accounting.contacts.d.ts.map