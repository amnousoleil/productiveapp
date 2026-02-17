"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchema = exports.paginationSchema = exports.createConversationSchema = exports.createMessageSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.updateNoteSchema = exports.createNoteSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.inviteToWorkspaceSchema = exports.updateWorkspaceSchema = exports.createWorkspaceSchema = exports.updateUserSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.updatePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = exports.slugSchema = exports.nameSchema = exports.passwordSchema = exports.emailSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
// Common validation schemas
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.emailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform((val) => val.toLowerCase().trim());
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');
exports.nameSchema = zod_1.z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .transform((val) => val.trim());
exports.slugSchema = zod_1.z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    name: exports.nameSchema,
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.updatePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Confirm password is required'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: exports.emailSchema,
});
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Confirm password is required'),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
// User schemas
exports.updateUserSchema = zod_1.z.object({
    name: exports.nameSchema.optional(),
    avatar_url: zod_1.z.string().min(1).nullable().optional(),
    language: zod_1.z.string().max(10).optional(),
    timezone: zod_1.z.string().max(50).nullable().optional(),
    status: zod_1.z.enum(['online', 'offline', 'busy']).optional(),
});
// Workspace schemas
exports.createWorkspaceSchema = zod_1.z.object({
    name: exports.nameSchema,
    slug: exports.slugSchema.optional(),
    icon: zod_1.z.string().max(255).nullable().optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.updateWorkspaceSchema = zod_1.z.object({
    name: exports.nameSchema.optional(),
    slug: exports.slugSchema.optional(),
    icon: zod_1.z.string().max(255).nullable().optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.inviteToWorkspaceSchema = zod_1.z.object({
    email: exports.emailSchema,
    role: zod_1.z.enum(['admin', 'member', 'guest']).default('member'),
});
// Project schemas
exports.createProjectSchema = zod_1.z.object({
    name: exports.nameSchema,
    description: zod_1.z.string().max(5000).nullable().optional(),
    color: zod_1.z.string().max(20).nullable().optional(),
    icon: zod_1.z.string().max(50).nullable().optional(),
    parent_id: exports.uuidSchema.nullable().optional(),
    is_shared: zod_1.z.boolean().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: exports.nameSchema.optional(),
    description: zod_1.z.string().max(5000).nullable().optional(),
    color: zod_1.z.string().max(20).nullable().optional(),
    icon: zod_1.z.string().max(50).nullable().optional(),
    status: zod_1.z.enum(['active', 'archived', 'deleted']).optional(),
    is_shared: zod_1.z.boolean().optional(),
    is_favorite: zod_1.z.boolean().optional(),
    position: zod_1.z.number().int().min(0).optional(),
});
// Note schemas
exports.createNoteSchema = zod_1.z.object({
    title: zod_1.z.string().max(500).default('Untitled'),
    content: zod_1.z.string().optional(),
    project_id: exports.uuidSchema.nullable().optional(),
    parent_id: exports.uuidSchema.nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    is_pinned: zod_1.z.boolean().optional(),
    is_public: zod_1.z.boolean().optional(),
    is_template: zod_1.z.boolean().optional(),
    member_id: zod_1.z.string().max(100).optional(),
});
exports.updateNoteSchema = zod_1.z.object({
    title: zod_1.z.string().max(500).optional(),
    content: zod_1.z.string().optional(),
    project_id: exports.uuidSchema.nullable().optional(),
    parent_id: exports.uuidSchema.nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    is_pinned: zod_1.z.boolean().optional(),
    is_public: zod_1.z.boolean().optional(),
    is_template: zod_1.z.boolean().optional(),
    position: zod_1.z.number().int().min(0).optional(),
    member_id: zod_1.z.string().max(100).optional(),
});
// Task schemas
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500),
    description: zod_1.z.string().max(10000).nullable().optional(),
    project_id: exports.uuidSchema.nullable().optional(),
    assigned_to: exports.uuidSchema.nullable().optional(),
    parent_id: exports.uuidSchema.nullable().optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: zod_1.z.string().datetime().nullable().optional(),
    start_date: zod_1.z.string().datetime().nullable().optional(),
    estimated_minutes: zod_1.z.number().int().min(0).nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    checklist: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        text: zod_1.z.string(),
        completed: zod_1.z.boolean(),
    }))
        .optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500).optional(),
    description: zod_1.z.string().max(10000).nullable().optional(),
    project_id: exports.uuidSchema.nullable().optional(),
    assigned_to: exports.uuidSchema.nullable().optional(),
    parent_id: exports.uuidSchema.nullable().optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: zod_1.z.string().datetime().nullable().optional(),
    start_date: zod_1.z.string().datetime().nullable().optional(),
    estimated_minutes: zod_1.z.number().int().min(0).nullable().optional(),
    actual_minutes: zod_1.z.number().int().min(0).nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    checklist: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        text: zod_1.z.string(),
        completed: zod_1.z.boolean(),
    }))
        .optional(),
    position: zod_1.z.number().int().min(0).optional(),
});
// Message schemas
exports.createMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(10000),
    message_type: zod_1.z.enum(['text', 'image', 'video', 'audio', 'file', 'system']).optional(),
    reply_to_id: exports.uuidSchema.nullable().optional(),
    attachments: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        filename: zod_1.z.string(),
        file_url: zod_1.z.string().url(),
        file_size: zod_1.z.number(),
        mime_type: zod_1.z.string(),
    }))
        .optional(),
    mentions: zod_1.z.array(exports.uuidSchema).optional(),
});
exports.createConversationSchema = zod_1.z.object({
    type: zod_1.z.enum(['direct', 'channel', 'group']),
    name: zod_1.z.string().max(255).nullable().optional(),
    description: zod_1.z.string().max(1000).nullable().optional(),
    is_private: zod_1.z.boolean().optional(),
    participant_ids: zod_1.z.array(exports.uuidSchema).min(1),
});
// Pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(1000).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Search schema
exports.searchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1).max(500),
    ...exports.paginationSchema.shape,
});
//# sourceMappingURL=validation.js.map