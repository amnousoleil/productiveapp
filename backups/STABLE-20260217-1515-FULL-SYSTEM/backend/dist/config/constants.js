"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_MULTIPLIER = exports.XP_PER_LEVEL = exports.RATE_LIMITS = exports.XP_CONFIG = exports.DIGEST_FREQUENCY = exports.NOTIFICATION_TYPE = exports.ACTIVITY_ACTION = exports.ENTITY_TYPE = exports.CANVAS_PERMISSION = exports.AUDIT_REPORT_STATUS = exports.AUDIT_REPORT_TYPE = exports.HUMAN_DESIGN_TYPE = exports.LEADERBOARD_PERIOD = exports.STREAK_TYPE = exports.XP_REASON = exports.ACHIEVEMENT_RARITY = exports.ACHIEVEMENT_CATEGORY = exports.CONVERSATION_ROLE = exports.MESSAGE_TYPE = exports.CONVERSATION_TYPE = exports.TASK_PRIORITY = exports.TASK_STATUS = exports.PROJECT_ROLE = exports.PROJECT_STATUS = exports.TEAM_ROLE = exports.WORKSPACE_ROLE = exports.USER_PLAN = exports.USER_STATUS = void 0;
// User Status
exports.USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    BUSY: 'busy',
};
// User Plan
exports.USER_PLAN = {
    FREE: 'free',
    PRO: 'pro',
    ENTERPRISE: 'enterprise',
};
// Workspace Member Roles
exports.WORKSPACE_ROLE = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    GUEST: 'guest',
};
// Team Member Roles
exports.TEAM_ROLE = {
    LEAD: 'lead',
    MEMBER: 'member',
};
// Project Status
exports.PROJECT_STATUS = {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
};
// Project Member Roles
exports.PROJECT_ROLE = {
    OWNER: 'owner',
    EDITOR: 'editor',
    VIEWER: 'viewer',
};
// Task Status
exports.TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    DONE: 'done',
    BLOCKED: 'blocked',
};
// Task Priority
exports.TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};
// Conversation Type
exports.CONVERSATION_TYPE = {
    DIRECT: 'direct',
    CHANNEL: 'channel',
    GROUP: 'group',
};
// Message Type
exports.MESSAGE_TYPE = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file',
    SYSTEM: 'system',
};
// Conversation Participant Role
exports.CONVERSATION_ROLE = {
    ADMIN: 'admin',
    MEMBER: 'member',
};
// Achievement Category
exports.ACHIEVEMENT_CATEGORY = {
    PRODUCTIVITY: 'productivity',
    SOCIAL: 'social',
    STREAK: 'streak',
    SPECIAL: 'special',
};
// Achievement Rarity
exports.ACHIEVEMENT_RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
};
// XP Event Reasons
exports.XP_REASON = {
    NOTE_CREATED: 'note_created',
    NOTE_UPDATED: 'note_updated',
    TASK_CREATED: 'task_created',
    TASK_COMPLETED: 'task_completed',
    STREAK_BONUS: 'streak_bonus',
    ACHIEVEMENT: 'achievement',
    MESSAGE_SENT: 'message_sent',
    LOGIN_BONUS: 'login_bonus',
    DAILY_GOAL: 'daily_goal',
    WEEKLY_GOAL: 'weekly_goal',
};
// Streak Types
exports.STREAK_TYPE = {
    DAILY_LOGIN: 'daily_login',
    DAILY_NOTE: 'daily_note',
    DAILY_TASK: 'daily_task',
    WEEKLY_GOAL: 'weekly_goal',
};
// Leaderboard Period
exports.LEADERBOARD_PERIOD = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ALLTIME: 'alltime',
};
// Human Design Types
exports.HUMAN_DESIGN_TYPE = {
    GENERATOR: 'generator',
    MANIFESTING_GENERATOR: 'manifesting_generator',
    PROJECTOR: 'projector',
    MANIFESTOR: 'manifestor',
    REFLECTOR: 'reflector',
};
// Audit Report Types
exports.AUDIT_REPORT_TYPE = {
    QUICK: 'quick',
    STANDARD: 'standard',
    DEEP: 'deep',
    COMPREHENSIVE: 'comprehensive',
};
// Audit Report Status
exports.AUDIT_REPORT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};
// Canvas Permission
exports.CANVAS_PERMISSION = {
    VIEW: 'view',
    EDIT: 'edit',
};
// Entity Types (for polymorphic relations)
exports.ENTITY_TYPE = {
    NOTE: 'note',
    TASK: 'task',
    MESSAGE: 'message',
    CANVAS: 'canvas',
    PROJECT: 'project',
    WORKSPACE: 'workspace',
};
// Activity Log Actions
exports.ACTIVITY_ACTION = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    LOGIN: 'login',
    LOGOUT: 'logout',
    INVITE: 'invite',
    JOIN: 'join',
    LEAVE: 'leave',
    ARCHIVE: 'archive',
    RESTORE: 'restore',
};
// Notification Types
exports.NOTIFICATION_TYPE = {
    MENTION: 'mention',
    ASSIGNMENT: 'assignment',
    ACHIEVEMENT: 'achievement',
    MESSAGE: 'message',
    SYSTEM: 'system',
    INVITATION: 'invitation',
    TASK_DUE: 'task_due',
    COMMENT: 'comment',
};
// Digest Frequency
exports.DIGEST_FREQUENCY = {
    REALTIME: 'realtime',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    NONE: 'none',
};
// XP Configuration
exports.XP_CONFIG = {
    NOTE_CREATED: 10,
    NOTE_UPDATED: 2,
    TASK_CREATED: 5,
    TASK_COMPLETED: 15,
    MESSAGE_SENT: 1,
    LOGIN_BONUS: 5,
    STREAK_MULTIPLIER: 1.5,
    LEVEL_BASE_XP: 100,
    LEVEL_MULTIPLIER: 1.2,
};
// API Rate Limits per endpoint (production-hardened)
exports.RATE_LIMITS = {
    LOGIN: { windowMs: 15 * 60 * 1000, max: 50 }, // 50 per 15 min (dev-friendly)
    REGISTER: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 per hour
    DEFAULT: { windowMs: 15 * 60 * 1000, max: 200 }, // 200 per 15 min
    UPLOAD: { windowMs: 60 * 60 * 1000, max: 50 }, // 50 per hour
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
    AI: { windowMs: 60 * 60 * 1000, max: 30 }, // 30 per hour
    REFRESH: { windowMs: 15 * 60 * 1000, max: 20 }, // 20 per 15 min
};
// Gamification exports (backwards compatibility)
exports.XP_PER_LEVEL = exports.XP_CONFIG.LEVEL_BASE_XP;
exports.LEVEL_MULTIPLIER = exports.XP_CONFIG.LEVEL_MULTIPLIER;
//# sourceMappingURL=constants.js.map