"use strict";
/**
 * OpenAI SDK Configuration
 * ProductiveApp v5.0 - Notes Intelligence
 *
 * Used by:
 * - notes-vocal.service.ts (Whisper STT)
 * - notes-embed.service.ts (Embeddings)
 * - notes-cluster.service.ts (GPT cluster naming)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_PRICING = exports.OPENAI_MODELS = exports.openai = void 0;
exports.isOpenAIAvailable = isOpenAIAvailable;
const openai_1 = __importDefault(require("openai"));
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Get OpenAI API key from environment
 * @throws AppError if key not configured
 */
function getOpenAIKey() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key_here' || apiKey.trim() === '') {
        throw helpers_js_1.AppError.internal('OPENAI_API_KEY not configured in .env file. ' +
            'Please set a valid OpenAI API key to use AI features.');
    }
    return apiKey;
}
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
exports.openai = new openai_1.default({
    apiKey: getOpenAIKey(),
    timeout: 60000, // 60s timeout for large audio files
    maxRetries: 2 // Retry failed requests twice
});
/**
 * Check if OpenAI API is available and configured
 * @returns true if API key is valid, false otherwise
 */
async function isOpenAIAvailable() {
    try {
        getOpenAIKey();
        // Test API connection with a minimal request
        await exports.openai.models.list();
        return true;
    }
    catch (error) {
        console.warn('OpenAI API not available:', error);
        return false;
    }
}
/**
 * Models configuration
 */
exports.OPENAI_MODELS = {
    // Audio
    WHISPER: 'whisper-1',
    // Embeddings
    EMBEDDING_ADA_002: 'text-embedding-ada-002',
    // Chat
    GPT_4O_MINI: 'gpt-4o-mini',
    GPT_4O: 'gpt-4o'
};
/**
 * Pricing per 1M tokens (USD)
 */
exports.OPENAI_PRICING = {
    // Audio (per minute)
    whisper: 0.006,
    // Embeddings (per 1M tokens)
    'text-embedding-ada-002': 0.10,
    // Chat models (per 1M tokens)
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 }
};
//# sourceMappingURL=openai.js.map