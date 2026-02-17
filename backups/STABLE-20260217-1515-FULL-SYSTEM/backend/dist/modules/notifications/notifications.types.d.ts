import type { UUID, Notification, NotificationType, DigestFrequency, EntityType } from '../../types/index.js';
export interface CreateNotificationInput {
    user_id: UUID;
    type: NotificationType;
    title: string;
    content: string;
    entity_type?: EntityType;
    entity_id?: UUID;
}
export interface UpdateNotificationSettingsInput {
    email_notifications?: boolean;
    push_notifications?: boolean;
    mention_notifications?: boolean;
    assignment_notifications?: boolean;
    achievement_notifications?: boolean;
    digest_frequency?: DigestFrequency;
}
export interface NotificationBatch {
    notifications: Notification[];
    unread_count: number;
}
//# sourceMappingURL=notifications.types.d.ts.map