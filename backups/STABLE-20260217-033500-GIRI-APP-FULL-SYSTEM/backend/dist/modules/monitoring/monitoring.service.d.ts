/**
 * MONITORING SERVICE - Simplified version
 */
export declare class MonitoringService {
    logError(data: any): Promise<{
        id: any;
    }>;
    getErrors(_filters?: any): Promise<import("postgres").RowList<import("postgres").Row[]>>;
    resolveError(id: string): Promise<boolean>;
    getStats(): Promise<{
        errors: number;
        warnings: number;
        resolved: number;
        today: number;
    }>;
    exportCSV(): Promise<string>;
}
export declare const monitoringService: MonitoringService;
//# sourceMappingURL=monitoring.service.d.ts.map