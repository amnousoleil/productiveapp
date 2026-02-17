/**
 * AI Service - OpenAI API with Smart Routing
 * ProductiveApp v4.0
 *
 * Uses gpt-4o-mini by default (cheap & fast)
 * Escalates to gpt-4o for complex requests
 */
import type { GenerateRequest, GenerateResponse, ChatRequest, ChatResponse } from './ai.types.js';
export declare class AiService {
    private getApiKey;
    /**
     * Analyze message complexity (0-10 scale)
     */
    private analyzeComplexity;
    /**
     * Select model based on complexity
     */
    private selectModel;
    /**
     * Calculate cost in USD
     */
    private calculateCost;
    /**
     * Call OpenAI API
     */
    private callOpenAI;
    /**
     * Generate content (simple API)
     */
    generate(request: GenerateRequest): Promise<GenerateResponse>;
    /**
     * Chat with context (smart routing)
     */
    chat(request: ChatRequest): Promise<ChatResponse>;
    /**
     * Parse ACTION: commands from response
     */
    private parseActions;
    /**
     * Correct text (spell check)
     */
    correctText(text: string, mode?: string): Promise<string>;
}
export declare const aiService: AiService;
//# sourceMappingURL=ai.service.d.ts.map