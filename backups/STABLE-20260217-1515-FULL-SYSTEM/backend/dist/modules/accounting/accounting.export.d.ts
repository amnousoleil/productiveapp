/**
 * Module Comptabilité - Service Export
 * @description Export des données en CSV, PDF et Excel
 */
import { Pool } from 'pg';
import { ExportFilters } from './accounting.types.js';
export declare const initExportService: (dbPool: Pool, exportDirectory?: string) => void;
export declare const exportInvoicesToCSV: (workspaceId: string, filters: ExportFilters) => Promise<string>;
export declare const exportTVAToCSV: (workspaceId: string, year: number, quarter?: number) => Promise<string>;
export declare const exportInvoicesToPDF: (workspaceId: string, filters: ExportFilters) => Promise<string>;
export declare const exportInvoicesToExcel: (workspaceId: string, filters: ExportFilters) => Promise<string>;
//# sourceMappingURL=accounting.export.d.ts.map