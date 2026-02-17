"use strict";
/**
 * CONFIG MODULE - TYPES
 * Configuration globale de l'application (singleton)
 * Lecture publique, modification super-admin uniquement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAppConfigSchema = exports.AppConfigSchema = exports.PricingPlanSchema = void 0;
const zod_1 = require("zod");
// ===== PRICING PLAN =====
exports.PricingPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    price: zod_1.z.string().max(20), // "0€/mois", "9.99€/mois", etc.
    features: zod_1.z.array(zod_1.z.string().max(200)),
    highlighted: zod_1.z.boolean().optional().default(false),
});
// ===== APP CONFIG =====
exports.AppConfigSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    // Branding
    logo_url: zod_1.z.string().max(500).nullable().optional(),
    app_name: zod_1.z.string().min(1).max(100).optional(),
    creator_signature: zod_1.z.string().max(100).optional(),
    brand_color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide (#RRGGBB)').optional(),
    // Textes
    welcome_text: zod_1.z.string().max(500).optional(),
    login_subtitle: zod_1.z.string().max(200).optional(),
    // Contact & Support
    support_email: zod_1.z.string().email().max(100).optional(),
    custom_domain: zod_1.z.string().max(200).optional(),
    // Plans tarifaires
    pricing_plans: zod_1.z.array(exports.PricingPlanSchema).optional(),
    // Métadonnées
    created_at: zod_1.z.date().optional(),
    updated_at: zod_1.z.date().optional(),
});
// ===== UPDATE DTO =====
exports.UpdateAppConfigSchema = exports.AppConfigSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).partial();
//# sourceMappingURL=config.types.js.map