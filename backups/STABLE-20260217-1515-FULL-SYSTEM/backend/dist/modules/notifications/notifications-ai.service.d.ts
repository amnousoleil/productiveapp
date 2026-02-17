/**
 * NOTIFICATIONS AI SERVICE
 * Analyse intelligente et génération de rappels pertinents
 */
import type { UUID } from '../../types/index.js';
interface SmartReminder {
    type: 'calendar' | 'task_forgotten' | 'note_important' | 'project_blocked' | 'ai_suggestion';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    dueDate?: Date;
    metadata?: any;
}
declare class NotificationsAIService {
    /**
     * Analyser toutes les données utilisateur et générer des rappels intelligents
     */
    analyzeAndGenerateReminders(userId: UUID, memberId: UUID): Promise<SmartReminder[]>;
    /**
     * Récupérer le contexte complet utilisateur
     */
    private gatherUserContext;
    /**
     * Analyser le calendrier pour rappels
     */
    private analyzeCalendar;
    /**
     * Analyser les tâches pour rappels
     */
    private analyzeTasks;
    /**
     * Analyser les notes pour rappels
     */
    private analyzeNotes;
    /**
     * Analyser les projets pour rappels
     */
    private analyzeProjects;
    /**
     * Utiliser l'IA pour prioriser et filtrer les rappels
     */
    private aiPrioritize;
    /**
     * IA suggère des rappels proactifs (si aucun rappel basique détecté)
     */
    private aiSuggestProactive;
    /**
     * Créer une notification depuis un SmartReminder
     */
    createNotificationFromReminder(userId: UUID, reminder: SmartReminder): Promise<void>;
}
export declare const notificationsAIService: NotificationsAIService;
export {};
//# sourceMappingURL=notifications-ai.service.d.ts.map