export declare const USER_STATUS: {
    readonly ONLINE: "online";
    readonly OFFLINE: "offline";
    readonly BUSY: "busy";
};
export declare const USER_PLAN: {
    readonly FREE: "free";
    readonly PRO: "pro";
    readonly ENTERPRISE: "enterprise";
};
export declare const WORKSPACE_ROLE: {
    readonly OWNER: "owner";
    readonly ADMIN: "admin";
    readonly MEMBER: "member";
    readonly GUEST: "guest";
};
export declare const TEAM_ROLE: {
    readonly LEAD: "lead";
    readonly MEMBER: "member";
};
export declare const PROJECT_STATUS: {
    readonly ACTIVE: "active";
    readonly ARCHIVED: "archived";
    readonly DELETED: "deleted";
};
export declare const PROJECT_ROLE: {
    readonly OWNER: "owner";
    readonly EDITOR: "editor";
    readonly VIEWER: "viewer";
};
export declare const TASK_STATUS: {
    readonly TODO: "todo";
    readonly IN_PROGRESS: "in_progress";
    readonly REVIEW: "review";
    readonly DONE: "done";
    readonly BLOCKED: "blocked";
};
export declare const TASK_PRIORITY: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
    readonly URGENT: "urgent";
};
export declare const CONVERSATION_TYPE: {
    readonly DIRECT: "direct";
    readonly CHANNEL: "channel";
    readonly GROUP: "group";
};
export declare const MESSAGE_TYPE: {
    readonly TEXT: "text";
    readonly IMAGE: "image";
    readonly VIDEO: "video";
    readonly AUDIO: "audio";
    readonly FILE: "file";
    readonly SYSTEM: "system";
};
export declare const CONVERSATION_ROLE: {
    readonly ADMIN: "admin";
    readonly MEMBER: "member";
};
export declare const ACHIEVEMENT_CATEGORY: {
    readonly PRODUCTIVITY: "productivity";
    readonly SOCIAL: "social";
    readonly STREAK: "streak";
    readonly SPECIAL: "special";
};
export declare const ACHIEVEMENT_RARITY: {
    readonly COMMON: "common";
    readonly RARE: "rare";
    readonly EPIC: "epic";
    readonly LEGENDARY: "legendary";
};
export declare const XP_REASON: {
    readonly NOTE_CREATED: "note_created";
    readonly NOTE_UPDATED: "note_updated";
    readonly TASK_CREATED: "task_created";
    readonly TASK_COMPLETED: "task_completed";
    readonly STREAK_BONUS: "streak_bonus";
    readonly ACHIEVEMENT: "achievement";
    readonly MESSAGE_SENT: "message_sent";
    readonly LOGIN_BONUS: "login_bonus";
    readonly DAILY_GOAL: "daily_goal";
    readonly WEEKLY_GOAL: "weekly_goal";
};
export declare const STREAK_TYPE: {
    readonly DAILY_LOGIN: "daily_login";
    readonly DAILY_NOTE: "daily_note";
    readonly DAILY_TASK: "daily_task";
    readonly WEEKLY_GOAL: "weekly_goal";
};
export declare const LEADERBOARD_PERIOD: {
    readonly DAILY: "daily";
    readonly WEEKLY: "weekly";
    readonly MONTHLY: "monthly";
    readonly ALLTIME: "alltime";
};
export declare const HUMAN_DESIGN_TYPE: {
    readonly GENERATOR: "generator";
    readonly MANIFESTING_GENERATOR: "manifesting_generator";
    readonly PROJECTOR: "projector";
    readonly MANIFESTOR: "manifestor";
    readonly REFLECTOR: "reflector";
};
export declare const AUDIT_REPORT_TYPE: {
    readonly QUICK: "quick";
    readonly STANDARD: "standard";
    readonly DEEP: "deep";
    readonly COMPREHENSIVE: "comprehensive";
};
export declare const AUDIT_REPORT_STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export declare const CANVAS_PERMISSION: {
    readonly VIEW: "view";
    readonly EDIT: "edit";
};
export declare const ENTITY_TYPE: {
    readonly NOTE: "note";
    readonly TASK: "task";
    readonly MESSAGE: "message";
    readonly CANVAS: "canvas";
    readonly PROJECT: "project";
    readonly WORKSPACE: "workspace";
};
export declare const ACTIVITY_ACTION: {
    readonly CREATE: "create";
    readonly UPDATE: "update";
    readonly DELETE: "delete";
    readonly VIEW: "view";
    readonly LOGIN: "login";
    readonly LOGOUT: "logout";
    readonly INVITE: "invite";
    readonly JOIN: "join";
    readonly LEAVE: "leave";
    readonly ARCHIVE: "archive";
    readonly RESTORE: "restore";
};
export declare const NOTIFICATION_TYPE: {
    readonly MENTION: "mention";
    readonly ASSIGNMENT: "assignment";
    readonly ACHIEVEMENT: "achievement";
    readonly MESSAGE: "message";
    readonly SYSTEM: "system";
    readonly INVITATION: "invitation";
    readonly TASK_DUE: "task_due";
    readonly COMMENT: "comment";
};
export declare const DIGEST_FREQUENCY: {
    readonly REALTIME: "realtime";
    readonly DAILY: "daily";
    readonly WEEKLY: "weekly";
    readonly NONE: "none";
};
export declare const XP_CONFIG: {
    readonly NOTE_CREATED: 10;
    readonly NOTE_UPDATED: 2;
    readonly TASK_CREATED: 5;
    readonly TASK_COMPLETED: 15;
    readonly MESSAGE_SENT: 1;
    readonly LOGIN_BONUS: 5;
    readonly STREAK_MULTIPLIER: 1.5;
    readonly LEVEL_BASE_XP: 100;
    readonly LEVEL_MULTIPLIER: 1.2;
};
export declare const RATE_LIMITS: {
    readonly LOGIN: {
        readonly windowMs: number;
        readonly max: 50;
    };
    readonly REGISTER: {
        readonly windowMs: number;
        readonly max: 5;
    };
    readonly DEFAULT: {
        readonly windowMs: number;
        readonly max: 200;
    };
    readonly UPLOAD: {
        readonly windowMs: number;
        readonly max: 50;
    };
    readonly PASSWORD_RESET: {
        readonly windowMs: number;
        readonly max: 3;
    };
    readonly AI: {
        readonly windowMs: number;
        readonly max: 30;
    };
    readonly REFRESH: {
        readonly windowMs: number;
        readonly max: 20;
    };
};
export declare const XP_PER_LEVEL: number;
export declare const LEVEL_MULTIPLIER: number;
//# sourceMappingURL=constants.d.ts.map