"use strict";
/**
 * AI Controller
 * ProductiveApp v4.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AiController = void 0;
const ai_service_js_1 = require("./ai.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const zod_1 = require("zod");
const generateSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(50000),
    max_tokens: zod_1.z.number().int().min(100).max(4000).optional(),
    system: zod_1.z.string().max(10000).optional()
});
const chatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(10000),
    context: zod_1.z.object({
        tasks: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            title: zod_1.z.string(),
            status: zod_1.z.string(),
            priority: zod_1.z.number(),
            project: zod_1.z.string().optional()
        })).optional(),
        projects: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string()
        })).optional(),
        currentUser: zod_1.z.string().optional()
    }).optional(),
    history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string()
    })).optional()
});
const correctSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(5000),
    mode: zod_1.z.enum(['ortho', 'all']).optional()
});
class AiController {
    async generate(req, res, next) {
        try {
            const input = generateSchema.parse(req.body);
            console.log(`🤖 AI Generate request from user ${req.user?.id}, prompt length: ${input.prompt.length}`);
            const result = await ai_service_js_1.aiService.generate(input);
            res.json((0, helpers_js_1.successResponse)({ content: result.content }));
        }
        catch (error) {
            next(error);
        }
    }
    async chat(req, res, next) {
        try {
            const input = chatSchema.parse(req.body);
            console.log(`💬 AI Chat request from user ${req.user?.id}: "${input.message.substring(0, 50)}..."`);
            const result = await ai_service_js_1.aiService.chat(input);
            res.json((0, helpers_js_1.successResponse)({
                content: result.content,
                model: result.model,
                tokens: result.tokens,
                cost: result.cost,
                actions: result.actions
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async correct(req, res, next) {
        try {
            const input = correctSchema.parse(req.body);
            console.log(`✏️ AI Correct request from user ${req.user?.id}, text length: ${input.text.length}`);
            const corrected = await ai_service_js_1.aiService.correctText(input.text, input.mode);
            res.json((0, helpers_js_1.successResponse)({ corrected }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AiController = AiController;
exports.aiController = new AiController();
//# sourceMappingURL=ai.controller.js.map