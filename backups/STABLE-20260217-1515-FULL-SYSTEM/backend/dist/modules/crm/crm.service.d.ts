/**
 * Module CRM Pipeline - Service
 * @description Pipelines, deals, activites, statistiques
 */
import { Pool } from 'pg';
export declare const initCRMService: (p: Pool) => void;
export declare const getDefaultPipeline: (wid: string) => Promise<any>;
export declare const getPipelines: (wid: string) => Promise<any[]>;
export declare const createPipeline: (wid: string, data: {
    name: string;
    stages?: any[];
    is_default?: boolean;
}) => Promise<any>;
export declare const updatePipeline: (wid: string, id: string, data: {
    name?: string;
    stages?: any[];
    is_default?: boolean;
}) => Promise<any>;
export declare const createDeal: (wid: string, data: {
    pipeline_id?: string;
    contact_id?: string;
    member_id?: string;
    title: string;
    description?: string;
    amount?: number;
    currency?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    tags?: string;
}) => Promise<any>;
export declare const getDeal: (wid: string, id: string) => Promise<any>;
export declare const updateDeal: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteDeal: (wid: string, id: string) => Promise<boolean>;
export declare const listDeals: (wid: string, filters: {
    stage?: string;
    contactId?: string;
    memberId?: string;
    search?: string;
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
export declare const moveDeal: (wid: string, id: string, stage: string, probability?: number) => Promise<any>;
export declare const getDealBoard: (wid: string, pipelineId?: string) => Promise<any>;
export declare const addActivity: (wid: string, dealId: string, data: {
    type: string;
    title: string;
    description?: string;
    scheduled_at?: string;
    created_by?: string;
}) => Promise<any>;
export declare const listActivities: (wid: string, dealId: string) => Promise<any[]>;
export declare const getStats: (wid: string) => Promise<{
    total_deals: number;
    total_value: number;
    won_count: number;
    won_value: number;
    lost_count: number;
    open_count: number;
    open_value: number;
    conversion_rate: number;
    by_stage: any[];
}>;
export declare const convertDeal: (wid: string, dealId: string) => Promise<{
    invoice_id: any;
    deal_id: string;
}>;
//# sourceMappingURL=crm.service.d.ts.map