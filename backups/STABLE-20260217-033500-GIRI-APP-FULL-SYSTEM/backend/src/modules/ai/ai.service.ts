/**
 * AI Service - OpenAI API with Smart Routing
 * ProductiveApp v4.0
 *
 * Uses gpt-4o-mini by default (cheap & fast)
 * Escalates to gpt-4o for complex requests
 */

import { AppError } from '../../utils/helpers.js';
import type {
  GenerateRequest,
  GenerateResponse,
  OpenAIApiResponse,
  ChatRequest,
  ChatResponse,
  ChatAction,
  ModelType
} from './ai.types.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30000;

// Model configuration
const MODELS = {
  MINI: 'gpt-4o-mini' as ModelType,
  FULL: 'gpt-4o' as ModelType
};

// Pricing per 1M tokens (USD)
const PRICING: Record<ModelType, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 }
};

// Complexity detection keywords
const COMPLEX_KEYWORDS = [
  'analyse', 'analyze', 'stratégie', 'strategy', 'compare', 'comparaison',
  'optimise', 'optimize', 'améliore', 'improve', 'refactor', 'architecture',
  'planifie', 'plan', 'organise', 'organize', 'productivité', 'productivity',
  'détaillé', 'detailed', 'approfondi', 'in-depth', 'complexe', 'complex'
];

export class AiService {
  private getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'placeholder_key_here') {
      throw AppError.internal('OPENAI_API_KEY not configured');
    }
    return apiKey;
  }

  /**
   * Analyze message complexity (0-10 scale)
   */
  private analyzeComplexity(message: string): number {
    let score = 0;
    const lowerMessage = message.toLowerCase();

    // Length factor
    if (message.length > 500) score += 2;
    if (message.length > 1000) score += 2;

    // Complex keywords
    for (const keyword of COMPLEX_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
        score += 2;
        break; // Only count once
      }
    }

    // Multiple questions
    const questionCount = (message.match(/\?/g) || []).length;
    if (questionCount > 2) score += 2;

    // Code-related
    if (lowerMessage.includes('code') || lowerMessage.includes('script') ||
        lowerMessage.includes('function') || lowerMessage.includes('programme')) {
      score += 3;
    }

    // Analysis/report request
    if (lowerMessage.includes('rapport') || lowerMessage.includes('report') ||
        lowerMessage.includes('bilan') || lowerMessage.includes('synthèse')) {
      score += 2;
    }

    return Math.min(score, 10);
  }

  /**
   * Select model based on complexity
   */
  private selectModel(message: string): ModelType {
    const complexity = this.analyzeComplexity(message);
    console.log(`🧠 Complexity score: ${complexity}/10`);

    // Use full model if complexity >= 7
    if (complexity >= 7) {
      console.log('🚀 Using gpt-4o (complex request)');
      return MODELS.FULL;
    }

    console.log('⚡ Using gpt-4o-mini (standard request)');
    return MODELS.MINI;
  }

  /**
   * Calculate cost in USD
   */
  private calculateCost(model: ModelType, inputTokens: number, outputTokens: number): number {
    const pricing = PRICING[model];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    model: ModelType,
    messages: Array<{ role: string; content: string }>,
    maxTokens: number = 1024
  ): Promise<{ content: string; usage: OpenAIApiResponse['usage'] }> {
    const apiKey = this.getApiKey();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('OpenAI API error:', response.status, errorBody);

        if (response.status === 401) {
          throw AppError.unauthorized('Invalid API key');
        } else if (response.status === 429) {
          throw AppError.tooManyRequests('Rate limit exceeded');
        } else if (response.status >= 500) {
          throw AppError.internal('OpenAI API temporarily unavailable');
        } else {
          throw AppError.internal(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json() as OpenAIApiResponse;

      if (!data.choices || data.choices.length === 0) {
        throw AppError.internal('Empty response from OpenAI API');
      }

      const content = data.choices[0].message?.content;
      if (!content) {
        throw AppError.internal('No content in OpenAI API response');
      }

      return { content, usage: data.usage };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw AppError.internal('OpenAI API request timed out');
      }

      if (error instanceof AppError) {
        throw error;
      }

      console.error('AI Service error:', error);
      throw AppError.internal('Failed to generate AI response');
    }
  }

  /**
   * Generate content (simple API)
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const messages: Array<{ role: string; content: string }> = [];

    if (request.system) {
      messages.push({ role: 'system', content: request.system });
    }
    messages.push({ role: 'user', content: request.prompt });

    const model = this.selectModel(request.prompt);
    const { content } = await this.callOpenAI(model, messages, request.max_tokens);

    return { content };
  }

  /**
   * Chat with context (smart routing)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages: Array<{ role: string; content: string }> = [];

    // Build system prompt with context
    let systemPrompt = `Tu es Giri, l'assistant IA de ProductiveApp. Tu aides l'équipe à gérer leurs tâches et projets.

RÈGLES:
- Réponds toujours en français
- Sois concis et efficace
- Tu peux créer, modifier ou supprimer des tâches
- Pour les actions, utilise le format: ACTION:TYPE|param1|param2

ACTIONS DISPONIBLES:
- ACTION:CREATE|titre|priorité|projet - Créer une tâche
- ACTION:DONE|taskId - Marquer comme terminée
- ACTION:DELETE|taskId - Supprimer une tâche

`;

    // Add context if available
    if (request.context) {
      if (request.context.currentUser) {
        systemPrompt += `\nUTILISATEUR ACTUEL: ${request.context.currentUser}\n`;
      }

      if (request.context.tasks && request.context.tasks.length > 0) {
        systemPrompt += `\nTÂCHES EN COURS:\n`;
        for (const task of request.context.tasks.slice(0, 20)) {
          const priority = task.priority === 1 ? '🔥' : task.priority === 2 ? '⚡' : '💤';
          const status = task.status === 'done' ? '✅' : task.status === 'in_progress' ? '🔄' : '📋';
          systemPrompt += `- [${task.id}] ${status} ${priority} ${task.title}\n`;
        }
      }

      if (request.context.projects && request.context.projects.length > 0) {
        systemPrompt += `\nPROJETS:\n`;
        for (const project of request.context.projects) {
          systemPrompt += `- ${project.name} (${project.id})\n`;
        }
      }
    }

    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history
    if (request.history && request.history.length > 0) {
      for (const msg of request.history.slice(-10)) { // Last 10 messages
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: request.message });

    // Select model based on complexity
    let model = this.selectModel(request.message);
    let result: { content: string; usage: OpenAIApiResponse['usage'] };

    try {
      result = await this.callOpenAI(model, messages, 1024);
    } catch (error) {
      // If mini fails, try with full model
      if (model === MODELS.MINI) {
        console.log('⚠️ Mini failed, escalating to gpt-4o');
        model = MODELS.FULL;
        result = await this.callOpenAI(model, messages, 1024);
      } else {
        throw error;
      }
    }

    // Parse actions from response
    const actions = this.parseActions(result.content);

    // Calculate cost
    const cost = this.calculateCost(
      model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );

    console.log(`💰 Cost: $${cost.toFixed(6)} (${model})`);

    return {
      content: result.content,
      model,
      tokens: {
        input: result.usage.prompt_tokens,
        output: result.usage.completion_tokens,
        total: result.usage.total_tokens
      },
      cost,
      actions
    };
  }

  /**
   * Parse ACTION: commands from response
   */
  private parseActions(content: string): ChatAction[] {
    const actions: ChatAction[] = [];
    const actionRegex = /ACTION:(CREATE|DONE|DELETE|UPDATE)\|([^\n]+)/g;

    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      const [, type, params] = match;
      const parts = params.split('|');

      switch (type) {
        case 'CREATE':
          actions.push({
            type: 'CREATE_TASK',
            data: {
              title: parts[0],
              priority: parseInt(parts[1]) || 2,
              project: parts[2] || 'general'
            }
          });
          break;
        case 'DONE':
          actions.push({
            type: 'COMPLETE_TASK',
            data: { taskId: parts[0] }
          });
          break;
        case 'DELETE':
          actions.push({
            type: 'DELETE_TASK',
            data: { taskId: parts[0] }
          });
          break;
        case 'UPDATE':
          actions.push({
            type: 'UPDATE_TASK',
            data: {
              taskId: parts[0],
              updates: parts.slice(1)
            }
          });
          break;
      }
    }

    return actions;
  }

  /**
   * Correct text (spell check)
   */
  async correctText(text: string, mode: string = 'all'): Promise<string> {
    const systemPrompt = mode === 'ortho'
      ? 'Corrige uniquement l\'orthographe et la grammaire. Garde le même style et sens. Réponds UNIQUEMENT avec le texte corrigé, sans explication.'
      : 'Corrige et améliore ce texte (orthographe, grammaire, style). Réponds UNIQUEMENT avec le texte corrigé, sans explication.';

    const { content } = await this.generate({
      prompt: text,
      system: systemPrompt,
      max_tokens: 500
    });

    return content.trim();
  }
}

export const aiService = new AiService();
