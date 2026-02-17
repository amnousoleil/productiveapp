"use strict";
// =============================================
// MAIL TYPES
// Types et interfaces pour le module mail
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateSchema = exports.SaveDraftSchema = exports.SendMailSchema = void 0;
const zod_1 = require("zod");
// ===== SCHEMAS DE VALIDATION =====
exports.SendMailSchema = zod_1.z.object({
    to: zod_1.z.array(zod_1.z.string().email()).min(1, 'Au moins un destinataire requis'),
    cc: zod_1.z.array(zod_1.z.string().email()).optional(),
    bcc: zod_1.z.array(zod_1.z.string().email()).optional(),
    fromName: zod_1.z.string().max(100).optional(), // Nom d'expéditeur personnalisé
    subject: zod_1.z.string().min(1, 'Sujet requis').max(200),
    body: zod_1.z.string().min(1, 'Corps du message requis'),
    isHtml: zod_1.z.boolean().optional().default(true),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        content: zod_1.z.string(), // base64
        contentType: zod_1.z.string()
    })).optional(),
    templateId: zod_1.z.string().optional(),
    context: zod_1.z.record(zod_1.z.any()).optional() // Variables pour template
});
exports.SaveDraftSchema = zod_1.z.object({
    to: zod_1.z.array(zod_1.z.string().email()).optional(),
    cc: zod_1.z.array(zod_1.z.string().email()).optional(),
    bcc: zod_1.z.array(zod_1.z.string().email()).optional(),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    isHtml: zod_1.z.boolean().optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        content: zod_1.z.string(),
        contentType: zod_1.z.string()
    })).optional()
});
exports.CreateTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    subject: zod_1.z.string().min(1).max(200),
    body: zod_1.z.string().min(1),
    isHtml: zod_1.z.boolean().optional().default(true),
    category: zod_1.z.string().optional(),
    variables: zod_1.z.array(zod_1.z.string()).optional() // Liste des variables {{var}}
});
//# sourceMappingURL=mail.types.js.map