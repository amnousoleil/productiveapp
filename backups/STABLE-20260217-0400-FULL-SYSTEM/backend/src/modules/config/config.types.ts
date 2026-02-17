/**
 * CONFIG MODULE - TYPES
 * Configuration globale de l'application (singleton)
 * Lecture publique, modification super-admin uniquement
 */

import { z } from 'zod';

// ===== PRICING PLAN =====

export const PricingPlanSchema = z.object({
  name: z.string().min(1).max(50),
  price: z.string().max(20), // "0€/mois", "9.99€/mois", etc.
  features: z.array(z.string().max(200)),
  highlighted: z.boolean().optional().default(false),
});

export type PricingPlan = z.infer<typeof PricingPlanSchema>;

// ===== APP CONFIG =====

export const AppConfigSchema = z.object({
  id: z.string().uuid(),

  // Branding
  logo_url: z.string().max(500).nullable().optional(),
  app_name: z.string().min(1).max(100).optional(),
  creator_signature: z.string().max(100).optional(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide (#RRGGBB)').optional(),

  // Textes
  welcome_text: z.string().max(500).optional(),
  login_subtitle: z.string().max(200).optional(),

  // Contact & Support
  support_email: z.string().email().max(100).optional(),
  custom_domain: z.string().max(200).optional(),

  // Plans tarifaires
  pricing_plans: z.array(PricingPlanSchema).optional(),

  // Métadonnées
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// ===== UPDATE DTO =====

export const UpdateAppConfigSchema = AppConfigSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdateAppConfigDTO = z.infer<typeof UpdateAppConfigSchema>;

// ===== PUBLIC CONFIG (sans métadonnées sensibles) =====

export interface PublicAppConfig {
  logo_url: string | null;
  app_name: string;
  creator_signature: string;
  brand_color: string;
  welcome_text: string;
  login_subtitle: string;
  support_email: string;
  custom_domain: string;
  pricing_plans: PricingPlan[];
}
