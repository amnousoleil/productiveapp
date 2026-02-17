/**
 * Module Portail Client - Service
 * @description Acces client securise aux factures/devis via token unique
 */
import { Pool } from 'pg';
export declare const initPortalService: (p: Pool) => void;
export declare const generateToken: (wid: string, contactId: string, expiresInDays?: number) => Promise<any>;
export declare const validateToken: (token: string) => Promise<any>;
export declare const getClientInvoices: (wid: string, contactId: string) => Promise<any[]>;
export declare const getClientContracts: (wid: string, contactId: string) => Promise<any[]>;
export declare const getPortalDashboard: (wid: string, contactId: string) => Promise<{
    contact_id: string;
    total_owed: number;
    total_paid: number;
    overdue_count: number;
    invoices: any[];
    contracts: any[];
}>;
export declare const listPortalTokens: (wid: string) => Promise<any[]>;
export declare const revokeToken: (wid: string, tokenId: string) => Promise<any>;
//# sourceMappingURL=portal.service.d.ts.map