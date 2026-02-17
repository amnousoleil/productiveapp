/**
 * Module Comptabilité - Service Prédictions IA
 * @description Prédictions de trésorerie, détection d'anomalies et catégorisation intelligente
 * Utilise GPT-4o-mini pour le rapport coût/efficacité
 */
import { Pool } from 'pg';
import { CashFlowForecast, AnomalyDetectionResult, SmartCategorization } from './accounting.types.js';
export declare const initPredictionsService: (dbPool: Pool, openaiApiKey?: string) => void;
/**
 * Prédit les flux de trésorerie pour les N prochains mois
 * Utilise les données historiques + OpenAI pour une analyse contextuelle
 */
export declare const predictCashFlow: (workspaceId: string, months?: number) => Promise<CashFlowForecast>;
/**
 * Analyse statistique + IA pour détecter des anomalies dans les données comptables
 * (montants inhabituels, doublons suspects, tendances anormales)
 */
export declare const detectAnomalies: (workspaceId: string) => Promise<AnomalyDetectionResult>;
/**
 * Suggère une catégorie comptable pour une dépense/revenu
 * Utilise l'IA pour analyser la description et le montant
 */
export declare const smartCategorize: (description: string, amount: number, categories: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
}>) => Promise<SmartCategorization>;
//# sourceMappingURL=accounting.predictions.d.ts.map