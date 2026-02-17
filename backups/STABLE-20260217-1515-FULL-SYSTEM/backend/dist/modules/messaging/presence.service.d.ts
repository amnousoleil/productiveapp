/**
 * Presence Service - TeamTalk Pro
 * Manages user online/offline status and custom messages
 */
export interface UserPresence {
    id: string;
    userId: string;
    status: 'available' | 'busy' | 'dnd' | 'away' | 'offline' | 'custom';
    customMessage: string | null;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface PresenceUpdate {
    status?: 'available' | 'busy' | 'dnd' | 'away' | 'offline' | 'custom';
    customMessage?: string | null;
}
/**
 * Get user presence by user ID
 */
export declare function getUserPresence(userId: string): Promise<UserPresence | null>;
/**
 * Get presence for multiple users
 */
export declare function getMultiplePresences(userIds: string[]): Promise<UserPresence[]>;
/**
 * Get all online users (status != offline)
 */
export declare function getOnlineUsers(): Promise<UserPresence[]>;
/**
 * Update user presence status
 */
export declare function updatePresence(userId: string, update: PresenceUpdate): Promise<UserPresence>;
/**
 * Update last seen timestamp (heartbeat)
 */
export declare function updateLastSeen(userId: string): Promise<void>;
/**
 * Set user offline
 */
export declare function setOffline(userId: string): Promise<void>;
/**
 * Set typing indicator
 */
export declare function setTyping(conversationId: string, userId: string): Promise<void>;
/**
 * Clear typing indicator
 */
export declare function clearTyping(conversationId: string, userId: string): Promise<void>;
/**
 * Get typing users in conversation
 */
export declare function getTypingUsers(conversationId: string): Promise<string[]>;
/**
 * Cleanup old typing indicators (run periodically)
 */
export declare function cleanupTypingIndicators(): Promise<void>;
/**
 * Auto-set users offline if no activity for 5 minutes
 */
export declare function autoOfflineInactiveUsers(): Promise<void>;
//# sourceMappingURL=presence.service.d.ts.map