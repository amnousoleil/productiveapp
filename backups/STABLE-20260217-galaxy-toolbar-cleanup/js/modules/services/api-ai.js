/**
 * API AI Module
 * ProductiveApp v4.0
 *
 * Connects to the backend AI service with smart routing
 */

const ApiAi = (function() {
    'use strict';

    /**
     * Send a chat message to the AI
     * @param {Object} options - Chat options
     * @param {string} options.message - User message
     * @param {Array} options.history - Chat history (optional)
     * @returns {Promise<Object>} - AI response with content, model, tokens, cost, actions
     */
    async function chat(options) {
        const { message, history } = options;

        // Build context from current app state
        const context = buildContext();

        const response = await Api.post('/ai/chat', {
            message,
            context,
            history
        });

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'AI chat failed');
    }

    /**
     * Build context for AI from current state
     */
    function buildContext() {
        const context = {
            currentUser: AppState.currentUser?.name || 'Unknown'
        };

        // Add tasks (limited to 20)
        if (AppState.tasks && AppState.tasks.length > 0) {
            context.tasks = AppState.tasks.slice(0, 20).map(t => ({
                id: t.id,
                title: t.text || t.title,
                status: t.status,
                priority: t.priority?.level || t.priority || 2,
                project: t.project || 'general'
            }));
        }

        // Add projects
        if (AppState.projects && AppState.projects.length > 0) {
            context.projects = AppState.projects.map(p => ({
                id: p.id,
                name: p.name
            }));
        }

        return context;
    }

    /**
     * Correct text using AI
     * @param {string} text - Text to correct
     * @param {string} mode - 'ortho' or 'all'
     * @returns {Promise<string>} - Corrected text
     */
    async function correct(text, mode = 'all') {
        const response = await Api.post('/ai/correct', {
            text,
            mode
        });

        if (response.success && response.data) {
            return response.data.corrected;
        }

        throw new Error(response.error?.message || 'Text correction failed');
    }

    /**
     * Generate AI content
     * @param {string} prompt - Prompt for generation
     * @param {string} system - System prompt (optional)
     * @returns {Promise<string>} - Generated content
     */
    async function generate(prompt, system) {
        const response = await Api.post('/ai/generate', {
            prompt,
            system
        });

        if (response.success && response.data) {
            return response.data.content;
        }

        throw new Error(response.error?.message || 'AI generation failed');
    }

    /**
     * Check if AI API is available
     */
    function isAvailable() {
        return typeof Api !== 'undefined' && typeof ApiTokens !== 'undefined' && ApiTokens.isAuthenticated();
    }

    return {
        chat,
        correct,
        generate,
        isAvailable,
        buildContext
    };
})();

if (typeof window !== 'undefined') {
    window.ApiAi = ApiAi;
}
