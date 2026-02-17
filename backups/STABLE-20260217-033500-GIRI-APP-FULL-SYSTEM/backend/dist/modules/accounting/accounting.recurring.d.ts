/**
 * Module Comptabilite - Service Factures Recurrentes
 * @description Gestion des templates de factures recurrentes et generation automatique
 */
import { Pool } from 'pg';
export declare const initRecurringService: (dbPool: Pool) => void;
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
    line_items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tva_rate: number;
    }>;
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
    line_items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tva_rate: number;
    }>;
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
/**
 * Cree un template de facture recurrente
 */
export declare const createRecurring: (workspaceId: string, data: CreateRecurringDTO) => Promise<RecurringInvoice>;
/**
 * Liste les templates recurrents
 */
export declare const listRecurring: (workspaceId: string, filters?: {
    is_active?: boolean;
    page?: number;
    limit?: number;
}) => Promise<{
    data: RecurringInvoice[];
    total: number;
}>;
/**
 * Detail d'un template recurrent avec historique
 */
export declare const getRecurringById: (workspaceId: string, recurringId: string) => Promise<(RecurringInvoice & {
    history: unknown[];
}) | null>;
/**
 * Met a jour un template recurrent
 */
export declare const updateRecurring: (workspaceId: string, recurringId: string, data: UpdateRecurringDTO) => Promise<RecurringInvoice | null>;
/**
 * Supprime un template recurrent
 */
export declare const deleteRecurring: (workspaceId: string, recurringId: string) => Promise<boolean>;
/**
 * Genere toutes les factures recurrentes en retard
 * A appeler periodiquement (cron, ou au demarrage)
 */
export declare const processRecurringInvoices: () => Promise<{
    generated: number;
    errors: string[];
}>;
//# sourceMappingURL=accounting.recurring.d.ts.map