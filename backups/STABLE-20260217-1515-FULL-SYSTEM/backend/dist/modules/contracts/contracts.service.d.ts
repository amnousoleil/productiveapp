/**
 * Module Contrats - Service
 * @description Templates, contrats, signatures
 */
import { Pool } from 'pg';
export declare const initContractsService: (p: Pool) => void;
export declare const listTemplates: (wid: string) => Promise<any[]>;
export declare const createTemplate: (wid: string, data: {
    name: string;
    content: string;
    category?: string;
    variables?: any;
}) => Promise<any>;
export declare const updateTemplate: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteTemplate: (wid: string, id: string) => Promise<boolean>;
export declare const listContracts: (wid: string, filters: {
    status?: string;
    contactId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}>;
export declare const createContract: (wid: string, data: {
    template_id?: string;
    contact_id?: string;
    title: string;
    content: string;
    start_date?: string;
    end_date?: string;
    value?: number;
    currency?: string;
}) => Promise<any>;
export declare const getContract: (wid: string, id: string) => Promise<any>;
export declare const updateContract: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteContract: (wid: string, id: string) => Promise<boolean>;
export declare const sendForSignature: (wid: string, id: string, signerEmail: string, signerName: string) => Promise<any>;
export declare const signContract: (token: string) => Promise<{
    signed: boolean;
    all_signed: boolean;
}>;
//# sourceMappingURL=contracts.service.d.ts.map