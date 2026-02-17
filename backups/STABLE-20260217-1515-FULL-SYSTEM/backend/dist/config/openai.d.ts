/**
 * OpenAI SDK Configuration
 * ProductiveApp v5.0 - Notes Intelligence
 *
 * Used by:
 * - notes-vocal.service.ts (Whisper STT)
 * - notes-embed.service.ts (Embeddings)
 * - notes-cluster.service.ts (GPT cluster naming)
 */
import OpenAI from 'openai';
/**
 * OpenAI SDK client instance
 * Configured with API key from environment
 *
 * Features:
 * - Audio transcriptions (Whisper)
 * - Text embeddings (ada-002)
 * - Chat completions (GPT-4o/mini)
 *
 * Pricing (as of 2024):
 * - Whisper STT: $0.006/minute
 * - ada-002 embeddings: $0.10/1M tokens
 * - GPT-4o-mini: $0.15/1M input, $0.60/1M output
 * - GPT-4o: $2.50/1M input, $10.00/1M output
 */
export declare const openai: OpenAI;
/**
 * Check if OpenAI API is available and configured
 * @returns true if API key is valid, false otherwise
 */
export declare function isOpenAIAvailable(): Promise<boolean>;
/**
 * Models configuration
 */
export declare const OPENAI_MODELS: {
    readonly WHISPER: "whisper-1";
    readonly EMBEDDING_ADA_002: "text-embedding-ada-002";
    readonly GPT_4O_MINI: "gpt-4o-mini";
    readonly GPT_4O: "gpt-4o";
};
/**
 * Pricing per 1M tokens (USD)
 */
export declare const OPENAI_PRICING: {
    readonly whisper: 0.006;
    readonly 'text-embedding-ada-002': 0.1;
    readonly 'gpt-4o-mini': {
        readonly input: 0.15;
        readonly output: 0.6;
    };
    readonly 'gpt-4o': {
        readonly input: 2.5;
        readonly output: 10;
    };
};
//# sourceMappingURL=openai.d.ts.map