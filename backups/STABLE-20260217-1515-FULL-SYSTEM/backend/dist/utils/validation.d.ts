import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const emailSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const slugSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    name: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    password: string;
}, {
    email: string;
    name: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const updatePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    avatar_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["online", "offline", "busy"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "online" | "offline" | "busy" | undefined;
    name?: string | undefined;
    avatar_url?: string | null | undefined;
    language?: string | undefined;
    timezone?: string | null | undefined;
}, {
    status?: "online" | "offline" | "busy" | undefined;
    name?: string | undefined;
    avatar_url?: string | null | undefined;
    language?: string | undefined;
    timezone?: string | null | undefined;
}>;
export declare const createWorkspaceSchema: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
    slug: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug?: string | undefined;
    icon?: string | null | undefined;
    settings?: Record<string, unknown> | undefined;
}, {
    name: string;
    slug?: string | undefined;
    icon?: string | null | undefined;
    settings?: Record<string, unknown> | undefined;
}>;
export declare const updateWorkspaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    slug: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | undefined;
    icon?: string | null | undefined;
    settings?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    icon?: string | null | undefined;
    settings?: Record<string, unknown> | undefined;
}>;
export declare const inviteToWorkspaceSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    role: z.ZodDefault<z.ZodEnum<["admin", "member", "guest"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "admin" | "member" | "guest";
}, {
    email: string;
    role?: "admin" | "member" | "guest" | undefined;
}>;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_shared: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | null | undefined;
    parent_id?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    is_shared?: boolean | undefined;
}, {
    name: string;
    description?: string | null | undefined;
    parent_id?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    is_shared?: boolean | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "archived", "deleted"]>>;
    is_shared: z.ZodOptional<z.ZodBoolean>;
    is_favorite: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "archived" | "deleted" | undefined;
    name?: string | undefined;
    position?: number | undefined;
    description?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    is_shared?: boolean | undefined;
    is_favorite?: boolean | undefined;
}, {
    status?: "active" | "archived" | "deleted" | undefined;
    name?: string | undefined;
    position?: number | undefined;
    description?: string | null | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    is_shared?: boolean | undefined;
    is_favorite?: boolean | undefined;
}>;
export declare const createNoteSchema: z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    is_pinned: z.ZodOptional<z.ZodBoolean>;
    is_public: z.ZodOptional<z.ZodBoolean>;
    is_template: z.ZodOptional<z.ZodBoolean>;
    member_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tags?: string[] | undefined;
    content?: string | undefined;
    project_id?: string | null | undefined;
    parent_id?: string | null | undefined;
    is_pinned?: boolean | undefined;
    is_public?: boolean | undefined;
    is_template?: boolean | undefined;
    member_id?: string | undefined;
}, {
    tags?: string[] | undefined;
    content?: string | undefined;
    title?: string | undefined;
    project_id?: string | null | undefined;
    parent_id?: string | null | undefined;
    is_pinned?: boolean | undefined;
    is_public?: boolean | undefined;
    is_template?: boolean | undefined;
    member_id?: string | undefined;
}>;
export declare const updateNoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    is_pinned: z.ZodOptional<z.ZodBoolean>;
    is_public: z.ZodOptional<z.ZodBoolean>;
    is_template: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodNumber>;
    member_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tags?: string[] | undefined;
    content?: string | undefined;
    position?: number | undefined;
    title?: string | undefined;
    project_id?: string | null | undefined;
    parent_id?: string | null | undefined;
    is_pinned?: boolean | undefined;
    is_public?: boolean | undefined;
    is_template?: boolean | undefined;
    member_id?: string | undefined;
}, {
    tags?: string[] | undefined;
    content?: string | undefined;
    position?: number | undefined;
    title?: string | undefined;
    project_id?: string | null | undefined;
    parent_id?: string | null | undefined;
    is_pinned?: boolean | undefined;
    is_public?: boolean | undefined;
    is_template?: boolean | undefined;
    member_id?: string | undefined;
}>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    project_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    assigned_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["todo", "in_progress", "review", "done", "blocked"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    start_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    estimated_minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    checklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        completed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        text: string;
        completed: boolean;
        id: string;
    }, {
        text: string;
        completed: boolean;
        id: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status?: "todo" | "in_progress" | "review" | "done" | "blocked" | undefined;
    tags?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    description?: string | null | undefined;
    project_id?: string | null | undefined;
    assigned_to?: string | null | undefined;
    parent_id?: string | null | undefined;
    due_date?: string | null | undefined;
    start_date?: string | null | undefined;
    estimated_minutes?: number | null | undefined;
    checklist?: {
        text: string;
        completed: boolean;
        id: string;
    }[] | undefined;
}, {
    title: string;
    status?: "todo" | "in_progress" | "review" | "done" | "blocked" | undefined;
    tags?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    description?: string | null | undefined;
    project_id?: string | null | undefined;
    assigned_to?: string | null | undefined;
    parent_id?: string | null | undefined;
    due_date?: string | null | undefined;
    start_date?: string | null | undefined;
    estimated_minutes?: number | null | undefined;
    checklist?: {
        text: string;
        completed: boolean;
        id: string;
    }[] | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    project_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    assigned_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["todo", "in_progress", "review", "done", "blocked"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    start_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    estimated_minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    actual_minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    checklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        completed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        text: string;
        completed: boolean;
        id: string;
    }, {
        text: string;
        completed: boolean;
        id: string;
    }>, "many">>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "todo" | "in_progress" | "review" | "done" | "blocked" | undefined;
    tags?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    position?: number | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    project_id?: string | null | undefined;
    assigned_to?: string | null | undefined;
    parent_id?: string | null | undefined;
    due_date?: string | null | undefined;
    start_date?: string | null | undefined;
    estimated_minutes?: number | null | undefined;
    actual_minutes?: number | null | undefined;
    checklist?: {
        text: string;
        completed: boolean;
        id: string;
    }[] | undefined;
}, {
    status?: "todo" | "in_progress" | "review" | "done" | "blocked" | undefined;
    tags?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    position?: number | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    project_id?: string | null | undefined;
    assigned_to?: string | null | undefined;
    parent_id?: string | null | undefined;
    due_date?: string | null | undefined;
    start_date?: string | null | undefined;
    estimated_minutes?: number | null | undefined;
    actual_minutes?: number | null | undefined;
    checklist?: {
        text: string;
        completed: boolean;
        id: string;
    }[] | undefined;
}>;
export declare const createMessageSchema: z.ZodObject<{
    content: z.ZodString;
    message_type: z.ZodOptional<z.ZodEnum<["text", "image", "video", "audio", "file", "system"]>>;
    reply_to_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        file_url: z.ZodString;
        file_size: z.ZodNumber;
        mime_type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        filename: string;
        file_url: string;
        file_size: number;
        mime_type: string;
    }, {
        id: string;
        filename: string;
        file_url: string;
        file_size: number;
        mime_type: string;
    }>, "many">>;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    attachments?: {
        id: string;
        filename: string;
        file_url: string;
        file_size: number;
        mime_type: string;
    }[] | undefined;
    message_type?: "text" | "image" | "video" | "audio" | "file" | "system" | undefined;
    reply_to_id?: string | null | undefined;
    mentions?: string[] | undefined;
}, {
    content: string;
    attachments?: {
        id: string;
        filename: string;
        file_url: string;
        file_size: number;
        mime_type: string;
    }[] | undefined;
    message_type?: "text" | "image" | "video" | "audio" | "file" | "system" | undefined;
    reply_to_id?: string | null | undefined;
    mentions?: string[] | undefined;
}>;
export declare const createConversationSchema: z.ZodObject<{
    type: z.ZodEnum<["direct", "channel", "group"]>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_private: z.ZodOptional<z.ZodBoolean>;
    participant_ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "direct" | "channel" | "group";
    participant_ids: string[];
    name?: string | null | undefined;
    description?: string | null | undefined;
    is_private?: boolean | undefined;
}, {
    type: "direct" | "channel" | "group";
    participant_ids: string[];
    name?: string | null | undefined;
    description?: string | null | undefined;
    is_private?: boolean | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const searchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    q: z.ZodString;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    q: string;
    sortBy?: string | undefined;
}, {
    q: string;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
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
//# sourceMappingURL=validation.d.ts.map