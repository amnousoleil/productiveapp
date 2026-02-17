// User Status
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
} as const;

// User Plan
export const USER_PLAN = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Workspace Member Roles
export const WORKSPACE_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

// Team Member Roles
export const TEAM_ROLE = {
  LEAD: 'lead',
  MEMBER: 'member',
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

// Project Member Roles
export const PROJECT_ROLE = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// Task Status
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked',
} as const;

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Conversation Type
export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  CHANNEL: 'channel',
  GROUP: 'group',
} as const;

// Message Type
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

// Conversation Participant Role
export const CONVERSATION_ROLE = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

// Achievement Category
export const ACHIEVEMENT_CATEGORY = {
  PRODUCTIVITY: 'productivity',
  SOCIAL: 'social',
  STREAK: 'streak',
  SPECIAL: 'special',
} as const;

// Achievement Rarity
export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

// XP Event Reasons
export const XP_REASON = {
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
} as const;

// Streak Types
export const STREAK_TYPE = {
  DAILY_LOGIN: 'daily_login',
  DAILY_NOTE: 'daily_note',
  DAILY_TASK: 'daily_task',
  WEEKLY_GOAL: 'weekly_goal',
} as const;

// Leaderboard Period
export const LEADERBOARD_PERIOD = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALLTIME: 'alltime',
} as const;

// Human Design Types
export const HUMAN_DESIGN_TYPE = {
  GENERATOR: 'generator',
  MANIFESTING_GENERATOR: 'manifesting_generator',
  PROJECTOR: 'projector',
  MANIFESTOR: 'manifestor',
  REFLECTOR: 'reflector',
} as const;

// Audit Report Types
export const AUDIT_REPORT_TYPE = {
  QUICK: 'quick',
  STANDARD: 'standard',
  DEEP: 'deep',
  COMPREHENSIVE: 'comprehensive',
} as const;

// Audit Report Status
export const AUDIT_REPORT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Canvas Permission
export const CANVAS_PERMISSION = {
  VIEW: 'view',
  EDIT: 'edit',
} as const;

// Entity Types (for polymorphic relations)
export const ENTITY_TYPE = {
  NOTE: 'note',
  TASK: 'task',
  MESSAGE: 'message',
  CANVAS: 'canvas',
  PROJECT: 'project',
  WORKSPACE: 'workspace',
} as const;

// Activity Log Actions
export const ACTIVITY_ACTION = {
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
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  MENTION: 'mention',
  ASSIGNMENT: 'assignment',
  ACHIEVEMENT: 'achievement',
  MESSAGE: 'message',
  SYSTEM: 'system',
  INVITATION: 'invitation',
  TASK_DUE: 'task_due',
  COMMENT: 'comment',
} as const;

// Digest Frequency
export const DIGEST_FREQUENCY = {
  REALTIME: 'realtime',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  NONE: 'none',
} as const;

// XP Configuration
export const XP_CONFIG = {
  NOTE_CREATED: 10,
  NOTE_UPDATED: 2,
  TASK_CREATED: 5,
  TASK_COMPLETED: 15,
  MESSAGE_SENT: 1,
  LOGIN_BONUS: 5,
  STREAK_MULTIPLIER: 1.5,
  LEVEL_BASE_XP: 100,
  LEVEL_MULTIPLIER: 1.2,
} as const;

// API Rate Limits per endpoint (production-hardened)
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 50 },      // 50 per 15 min (dev-friendly)
  REGISTER: { windowMs: 60 * 60 * 1000, max: 5 },     // 5 per hour
  DEFAULT: { windowMs: 15 * 60 * 1000, max: 200 },    // 200 per 15 min
  UPLOAD: { windowMs: 60 * 60 * 1000, max: 50 },      // 50 per hour
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  AI: { windowMs: 60 * 60 * 1000, max: 30 },          // 30 per hour
  REFRESH: { windowMs: 15 * 60 * 1000, max: 20 },     // 20 per 15 min
} as const;

// Gamification exports (backwards compatibility)
export const XP_PER_LEVEL: number = XP_CONFIG.LEVEL_BASE_XP;
export const LEVEL_MULTIPLIER: number = XP_CONFIG.LEVEL_MULTIPLIER;
