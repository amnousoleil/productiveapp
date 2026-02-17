/**
 * Module URSSAF - Service
 * @description Simulation cotisations, declarations trimestrielles, alertes
 */
import { Pool } from 'pg';
export declare const initURSSAFService: (p: Pool) => void;
export declare const simulateCotisations: (_wid: string, params: {
    ca: number;
    activity_type: string;
    acre?: boolean;
    quarter?: number;
    year?: number;
}) => Promise<{
    chiffre_affaires: number;
    activity_type: string;
    acre: boolean;
    cotisations: {
        base: number;
        formation: number;
        cfe: number;
        total: number;
    };
    net_after_cotisations: number;
    taux_effectif: number;
    quarter: number | undefined;
    year: number | undefined;
}>;
export declare const getDeclarations: (wid: string) => Promise<any[]>;
export declare const createDeclaration: (wid: string, mid: string, data: {
    quarter: number;
    year: number;
    activity_type: string;
    chiffre_affaires: number;
    acre?: boolean;
}) => Promise<any>;
export declare const updateDeclaration: (wid: string, id: string, data: {
    status?: string;
    notes?: string;
}) => Promise<any>;
export declare const getAnnualSummary: (wid: string, year: number) => Promise<{
    year: number;
    declarations: any[];
    quarters_declared: number;
    total_ca: number;
    total_cotisations: number;
    total_net: number;
    plafond: number;
    plafond_utilise: number;
    alert: string | null;
}>;
export declare const autoCalculateFromInvoices: (wid: string, quarter: number, year: number) => Promise<{
    quarter: number;
    year: number;
    chiffre_affaires: number;
    start_date: string;
    end_date: string;
}>;
//# sourceMappingURL=urssaf.service.d.ts.map