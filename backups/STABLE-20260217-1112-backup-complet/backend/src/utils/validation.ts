import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .transform((val) => val.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character'
  );

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters')
  .transform((val) => val.trim());

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  );

// Auth schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User schemas
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  avatar_url: z.string().min(1).nullable().optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).nullable().optional(),
  status: z.enum(['online', 'offline', 'busy']).optional(),
});

// Workspace schemas
export const createWorkspaceSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  icon: z.string().max(255).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema.optional(),
  slug: slugSchema.optional(),
  icon: z.string().max(255).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const inviteToWorkspaceSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member', 'guest']).default('member'),
});

// Project schemas
export const createProjectSchema = z.object({
  name: nameSchema,
  description: z.string().max(5000).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  parent_id: uuidSchema.nullable().optional(),
  is_shared: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(5000).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  is_shared: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// Note schemas
export const createNoteSchema = z.object({
  title: z.string().max(500).default('Untitled'),
  content: z.string().optional(),
  project_id: uuidSchema.nullable().optional(),
  parent_id: uuidSchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  is_pinned: z.boolean().optional(),
  is_public: z.boolean().optional(),
  is_template: z.boolean().optional(),
  member_id: z.string().max(100).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  project_id: uuidSchema.nullable().optional(),
  parent_id: uuidSchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  is_pinned: z.boolean().optional(),
  is_public: z.boolean().optional(),
  is_template: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  member_id: z.string().max(100).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  project_id: uuidSchema.nullable().optional(),
  assigned_to: uuidSchema.nullable().optional(),
  parent_id: uuidSchema.nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().datetime().nullable().optional(),
  start_date: z.string().datetime().nullable().optional(),
  estimated_minutes: z.number().int().min(0).nullable().optional(),
  tags: z.array(z.string()).optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  project_id: uuidSchema.nullable().optional(),
  assigned_to: uuidSchema.nullable().optional(),
  parent_id: uuidSchema.nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().datetime().nullable().optional(),
  start_date: z.string().datetime().nullable().optional(),
  estimated_minutes: z.number().int().min(0).nullable().optional(),
  actual_minutes: z.number().int().min(0).nullable().optional(),
  tags: z.array(z.string()).optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
  position: z.number().int().min(0).optional(),
});

// Message schemas
export const createMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  message_type: z.enum(['text', 'image', 'video', 'audio', 'file', 'system']).optional(),
  reply_to_id: uuidSchema.nullable().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        file_url: z.string().url(),
        file_size: z.number(),
        mime_type: z.string(),
      })
    )
    .optional(),
  mentions: z.array(uuidSchema).optional(),
});

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'channel', 'group']),
  name: z.string().max(255).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  is_private: z.boolean().optional(),
  participant_ids: z.array(uuidSchema).min(1),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(500),
  ...paginationSchema.shape,
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteToWorkspaceInput = z.infer<typeof inviteToWorkspaceSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
