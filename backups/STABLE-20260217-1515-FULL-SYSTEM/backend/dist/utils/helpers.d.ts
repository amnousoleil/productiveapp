import type { UUID, ApiResponse, PaginationParams } from '../types/index.js';
export declare function generateUUID(): UUID;
export declare function generateSlug(name: string): string;
export declare function generateUniqueSlug(name: string): string;
export declare function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T>;
export declare function errorResponse(code: string, message: string, details?: unknown): ApiResponse;
export declare function paginatedResponse<T>(data: T[], params: PaginationParams, total: number): ApiResponse<T[]>;
export declare function calculateOffset(page: number, limit: number): number;
export declare function parseBoolean(value: unknown): boolean | undefined;
export declare function parseNumber(value: unknown): number | undefined;
export declare function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T>;
export declare function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function sleep(ms: number): Promise<void>;
export declare function isValidUUID(str: string): boolean;
export declare function sanitizeHtml(html: string): string;
export declare function truncateString(str: string, maxLength: number): string;
export declare function calculateWordCount(text: string): number;
export declare function extractMentions(content: string): UUID[];
export declare function formatDateForDB(date: Date | string): string;
export declare function groupBy<T, K extends string | number | symbol>(array: T[], keyFn: (item: T) => K): Record<K, T[]>;
export declare function uniqueBy<T>(array: T[], keyFn: (item: T) => unknown): T[];
export declare function sortBy<T>(array: T[], keyFn: (item: T) => string | number | Date, order?: 'asc' | 'desc'): T[];
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
    static badRequest(message: string, details?: unknown): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(resource?: string): AppError;
    static conflict(message: string): AppError;
    static tooManyRequests(message?: string): AppError;
    static internal(message?: string): AppError;
}
//# sourceMappingURL=helpers.d.ts.map