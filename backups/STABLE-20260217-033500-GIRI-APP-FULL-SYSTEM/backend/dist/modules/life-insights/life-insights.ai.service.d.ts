import { AnalyzeUserRequest, AnalyzeUserResponse } from './life-insights.types';
export declare class LifeInsightsAIService {
    private static OPENAI_API_KEY;
    private static OPENAI_MODEL;
    /**
     * Analyse complète de l'utilisateur
     */
    static analyzeUser(request: AnalyzeUserRequest): Promise<AnalyzeUserResponse>;
    /**
     * Génère un profil psychologique complet via GPT-4
     */
    private static generatePsychologicalProfile;
    /**
     * Génère des insights comportementaux
     */
    private static generateBehavioralInsights;
    /**
     * Détecte les patterns comportementaux
     */
    private static detectPatterns;
    /**
     * Génère le snapshot quotidien avec analyse IA
     */
    private static generateDailySnapshot;
    /**
     * Génère des recommandations personnalisées
     */
    private static generateRecommendations;
    /**
     * Construit le contexte d'activité pour l'IA
     */
    private static buildActivityContext;
    /**
     * Calcule le score de confiance basé sur la quantité de données
     */
    private static calculateConfidenceScore;
    /**
     * Appelle l'API OpenAI
     */
    private static callOpenAI;
}
//# sourceMappingURL=life-insights.ai.service.d.ts.map