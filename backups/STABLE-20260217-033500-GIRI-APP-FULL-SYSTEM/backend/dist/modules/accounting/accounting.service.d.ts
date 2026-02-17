/**
 * Module Comptabilité - Service Principal
 * @description Logique métier et requêtes SQL pour les factures et catégories
 */
import { Pool } from 'pg';
import { Invoice, AccountingCategory, InvoiceFilters, CreateInvoiceDTO, UpdateInvoiceDTO, CreateCategoryDTO, PaginatedResponse } from './accounting.types.js';
export declare const initAccountingService: (dbPool: Pool) => void;
export declare const createInvoice: (workspaceId: string, data: CreateInvoiceDTO) => Promise<Invoice>;
export declare const getInvoiceById: (workspaceId: string, invoiceId: string) => Promise<Invoice | null>;
export declare const listInvoices: (workspaceId: string, filters: InvoiceFilters) => Promise<PaginatedResponse<Invoice>>;
export declare const updateInvoice: (workspaceId: string, invoiceId: string, data: UpdateInvoiceDTO) => Promise<Invoice | null>;
export declare const deleteInvoice: (workspaceId: string, invoiceId: string) => Promise<boolean>;
export declare const validateInvoice: (workspaceId: string, invoiceId: string) => Promise<Invoice | null>;
export declare const listCategories: (workspaceId: string) => Promise<AccountingCategory[]>;
export declare const createCategory: (workspaceId: string, data: CreateCategoryDTO) => Promise<AccountingCategory>;
export declare const seedDefaultCategories: (workspaceId: string) => Promise<void>;
//# sourceMappingURL=accounting.service.d.ts.map