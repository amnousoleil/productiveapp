/**
 * Module Comptabilité - Service IA
 * @description Extraction automatique de factures via GPT-4 Vision
 */
import { AIExtractionResult } from './accounting.types.js';
export declare const initAIService: (apiKey: string) => void;
export declare const extractInvoiceFromImage: (imagePath: string) => Promise<AIExtractionResult>;
export declare const extractInvoiceFromUrl: (imageUrl: string) => Promise<AIExtractionResult>;
export declare const reprocessInvoice: (imageUrl: string) => Promise<AIExtractionResult>;
//# sourceMappingURL=accounting.ai.d.ts.map