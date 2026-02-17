/**
 * Notification Service - Push, Email, SMS
 * @description Gestion complète des notifications utilisateur
 */
import { Pool } from 'pg';
export declare const initNotificationService: (p: Pool) => void;
export declare const getUserPreferences: (userId: string) => Promise<any>;
export declare const updateUserPreferences: (userId: string, preferences: any) => Promise<any>;
export declare const scheduleEventReminders: (eventId: string, userId: string, eventTitle: string, eventStart: Date, customReminders?: number[]) => Promise<{
    scheduled: number;
}>;
export declare const cancelEventReminders: (eventId: string) => Promise<void>;
export declare const sendPushNotification: (userId: string, title: string, body: string, actionUrl?: string, icon?: string) => Promise<{
    success: boolean;
}>;
export declare const processPendingNotifications: () => Promise<{
    sent: number;
    failed: number;
    processed: number;
}>;
export declare const getNotificationHistory: (userId: string, limit?: number) => Promise<any[]>;
export declare const sendTestNotification: (userId: string) => Promise<{
    success: boolean;
}>;
//# sourceMappingURL=notifications.service.d.ts.map