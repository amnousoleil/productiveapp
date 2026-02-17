/**
 * CONFIG MODULE - TYPES
 * Configuration globale de l'application (singleton)
 * Lecture publique, modification super-admin uniquement
 */
import { z } from 'zod';
export declare const PricingPlanSchema: z.ZodObject<{
    name: z.ZodString;
    price: z.ZodString;
    features: z.ZodArray<z.ZodString, "many">;
    highlighted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    features: string[];
    price: string;
    highlighted: boolean;
}, {
    name: string;
    features: string[];
    price: string;
    highlighted?: boolean | undefined;
}>;
export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export declare const AppConfigSchema: z.ZodObject<{
    id: z.ZodString;
    logo_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    app_name: z.ZodOptional<z.ZodString>;
    creator_signature: z.ZodOptional<z.ZodString>;
    brand_color: z.ZodOptional<z.ZodString>;
    welcome_text: z.ZodOptional<z.ZodString>;
    login_subtitle: z.ZodOptional<z.ZodString>;
    support_email: z.ZodOptional<z.ZodString>;
    custom_domain: z.ZodOptional<z.ZodString>;
    pricing_plans: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodString;
        features: z.ZodArray<z.ZodString, "many">;
        highlighted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        features: string[];
        price: string;
        highlighted: boolean;
    }, {
        name: string;
        features: string[];
        price: string;
        highlighted?: boolean | undefined;
    }>, "many">>;
    created_at: z.ZodOptional<z.ZodDate>;
    updated_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    logo_url?: string | null | undefined;
    app_name?: string | undefined;
    creator_signature?: string | undefined;
    brand_color?: string | undefined;
    welcome_text?: string | undefined;
    login_subtitle?: string | undefined;
    support_email?: string | undefined;
    custom_domain?: string | undefined;
    pricing_plans?: {
        name: string;
        features: string[];
        price: string;
        highlighted: boolean;
    }[] | undefined;
}, {
    id: string;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    logo_url?: string | null | undefined;
    app_name?: string | undefined;
    creator_signature?: string | undefined;
    brand_color?: string | undefined;
    welcome_text?: string | undefined;
    login_subtitle?: string | undefined;
    support_email?: string | undefined;
    custom_domain?: string | undefined;
    pricing_plans?: {
        name: string;
        features: string[];
        price: string;
        highlighted?: boolean | undefined;
    }[] | undefined;
}>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export declare const UpdateAppConfigSchema: z.ZodObject<{
    logo_url: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    app_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    creator_signature: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    brand_color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    welcome_text: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    login_subtitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    support_email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    custom_domain: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pricing_plans: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodString;
        features: z.ZodArray<z.ZodString, "many">;
        highlighted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        features: string[];
        price: string;
        highlighted: boolean;
    }, {
        name: string;
        features: string[];
        price: string;
        highlighted?: boolean | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    logo_url?: string | null | undefined;
    app_name?: string | undefined;
    creator_signature?: string | undefined;
    brand_color?: string | undefined;
    welcome_text?: string | undefined;
    login_subtitle?: string | undefined;
    support_email?: string | undefined;
    custom_domain?: string | undefined;
    pricing_plans?: {
        name: string;
        features: string[];
        price: string;
        highlighted: boolean;
    }[] | undefined;
}, {
    logo_url?: string | null | undefined;
    app_name?: string | undefined;
    creator_signature?: string | undefined;
    brand_color?: string | undefined;
    welcome_text?: string | undefined;
    login_subtitle?: string | undefined;
    support_email?: string | undefined;
    custom_domain?: string | undefined;
    pricing_plans?: {
        name: string;
        features: string[];
        price: string;
        highlighted?: boolean | undefined;
    }[] | undefined;
}>;
export type UpdateAppConfigDTO = z.infer<typeof UpdateAppConfigSchema>;
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
//# sourceMappingURL=config.types.d.ts.map