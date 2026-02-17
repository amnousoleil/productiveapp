/**
 * AI Module Types - OpenAI
 * ProductiveApp v4.0
 */
export interface GenerateRequest {
    prompt: string;
    max_tokens?: number;
    system?: string;
}
export interface GenerateResponse {
    content: string;
}
export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface OpenAIApiResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface ChatRequest {
    message: string;
    context?: TaskContext;
    history?: ChatMessage[];
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface TaskContext {
    tasks?: Array<{
        id: string;
        title: string;
        status: string;
        priority: number;
        project?: string;
    }>;
    projects?: Array<{
        id: string;
        name: string;
    }>;
    currentUser?: string;
}
export interface ChatResponse {
    content: string;
    model: string;
    tokens: {
        input: number;
        output: number;
        total: number;
    };
    cost: number;
    actions?: ChatAction[];
}
export interface ChatAction {
    type: 'CREATE_TASK' | 'COMPLETE_TASK' | 'DELETE_TASK' | 'UPDATE_TASK';
    data: Record<string, unknown>;
}
export type ModelType = 'gpt-4o-mini' | 'gpt-4o';
export interface ModelPricing {
    inputPer1M: number;
    outputPer1M: number;
}
export declare const MODEL_PRICING: Record<ModelType, ModelPricing>;
//# sourceMappingURL=ai.types.d.ts.map