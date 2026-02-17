/**
 * NOTIFICATIONS AI SERVICE
 * Analyse intelligente et génération de rappels pertinents
 */

import { sql } from '../../config/database.js';
import type { UUID } from '../../types/index.js';
import { AiService } from '../ai/ai.service.js';

const aiService = new AiService();

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

interface AnalysisContext {
  userId: UUID;
  memberId: UUID;
  tasks: any[];
  calendarEvents: any[];
  notes: any[];
  projects: any[];
  recentActivity: any[];
}

class NotificationsAIService {
  /**
   * Analyser toutes les données utilisateur et générer des rappels intelligents
   */
  async analyzeAndGenerateReminders(userId: UUID, memberId: UUID): Promise<SmartReminder[]> {
    try {
      console.log(`🤖 AI Analysis started for user ${userId}`);

      // 1. Récupérer toutes les données pertinentes
      const context = await this.gatherUserContext(userId, memberId);

      // 2. Analyser chaque source de données
      const reminders: SmartReminder[] = [];

      // Analyse calendrier (événements dans <24h)
      const calendarReminders = await this.analyzeCalendar(context);
      reminders.push(...calendarReminders);

      // Analyse tâches (oubliées, urgentes, bloquées)
      const taskReminders = await this.analyzeTasks(context);
      reminders.push(...taskReminders);

      // Analyse notes (importantes non relues)
      const noteReminders = await this.analyzeNotes(context);
      reminders.push(...noteReminders);

      // Analyse projets (bloqués, dépassés)
      const projectReminders = await this.analyzeProjects(context);
      reminders.push(...projectReminders);

      // 3. Utiliser l'IA pour filtrer et prioriser
      const smartReminders = await this.aiPrioritize(reminders, context);

      console.log(`✅ Generated ${smartReminders.length} smart reminders`);
      return smartReminders;

    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      return [];
    }
  }

  /**
   * Récupérer le contexte complet utilisateur
   */
  private async gatherUserContext(userId: UUID, memberId: UUID): Promise<AnalysisContext> {
    try {
      // Tâches
      const tasks = await sql`
        SELECT id, title, description, status, priority, due_date, created_at, updated_at
        FROM tasks
        WHERE member_id = ${memberId} AND status != 'done' AND status != 'archived'
        ORDER BY created_at DESC
        LIMIT 100
      `;

      // Événements calendrier (30 prochains jours)
      const events = await sql`
        SELECT id, title, description, start_time, end_time, all_day, reminders, created_at
        FROM calendar_events
        WHERE user_id = ${userId}
          AND start_time >= NOW()
          AND start_time <= NOW() + INTERVAL '30 days'
        ORDER BY start_time ASC
        LIMIT 50
      `;

      // Notes (dernières 50)
      const notes = await sql`
        SELECT id, title, content, created_at, updated_at
        FROM notes
        WHERE member_id = ${memberId}
        ORDER BY updated_at DESC
        LIMIT 50
      `;

      // Projets actifs
      const projects = await sql`
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        WHERE member_id = ${memberId} AND status != 'archived'
        ORDER BY updated_at DESC
        LIMIT 20
      `;

      // Activité récente (gamification)
      const activity = await sql`
        SELECT action_type, created_at
        FROM user_xp_history
        WHERE member_id = ${memberId}
        ORDER BY created_at DESC
        LIMIT 20
      `;

      return {
        userId,
        memberId,
        tasks: tasks as any[],
        calendarEvents: events as any[],
        notes: notes as any[],
        projects: projects as any[],
        recentActivity: activity as any[]
      };

    } catch (error) {
      console.error('Error gathering context:', error);
      return {
        userId,
        memberId,
        tasks: [],
        calendarEvents: [],
        notes: [],
        projects: [],
        recentActivity: []
      };
    }
  }

  /**
   * Analyser le calendrier pour rappels
   */
  private async analyzeCalendar(context: AnalysisContext): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];
    const now = new Date();

    for (const event of context.calendarEvents) {
      const startTime = new Date(event.start_time);
      const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Événement dans moins de 24h
      if (hoursUntil > 0 && hoursUntil <= 24) {
        let priority: SmartReminder['priority'] = 'medium';
        if (hoursUntil <= 1) priority = 'urgent';
        else if (hoursUntil <= 4) priority = 'high';

        reminders.push({
          type: 'calendar',
          priority,
          title: `📅 Événement bientôt : ${event.title}`,
          message: `Dans ${Math.round(hoursUntil)}h - ${event.description || 'Pas de description'}`,
          entityType: 'calendar_event',
          entityId: event.id,
          dueDate: startTime,
          metadata: { hoursUntil, allDay: event.all_day }
        });
      }
    }

    return reminders;
  }

  /**
   * Analyser les tâches pour rappels
   */
  private async analyzeTasks(context: AnalysisContext): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const task of context.tasks) {
      const updatedAt = new Date(task.updated_at);
      const dueDate = task.due_date ? new Date(task.due_date) : null;

      // Tâche non touchée depuis >7 jours
      if (updatedAt < sevenDaysAgo && task.status !== 'done') {
        reminders.push({
          type: 'task_forgotten',
          priority: task.priority === 'urgent' ? 'high' : 'medium',
          title: `⏰ Tâche oubliée : ${task.title}`,
          message: `Non traitée depuis ${Math.round((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))} jours`,
          entityType: 'task',
          entityId: task.id,
          metadata: { daysSinceUpdate: Math.round((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)) }
        });
      }

      // Tâche avec deadline qui approche
      if (dueDate) {
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDue > 0 && hoursUntilDue <= 48 && task.status !== 'done') {
          let priority: SmartReminder['priority'] = 'medium';
          if (hoursUntilDue <= 12) priority = 'urgent';
          else if (hoursUntilDue <= 24) priority = 'high';

          reminders.push({
            type: 'task_forgotten',
            priority,
            title: `🔴 Deadline proche : ${task.title}`,
            message: `Due dans ${Math.round(hoursUntilDue)}h`,
            entityType: 'task',
            entityId: task.id,
            dueDate: dueDate,
            metadata: { hoursUntilDue }
          });
        }
      }
    }

    return reminders;
  }

  /**
   * Analyser les notes pour rappels
   */
  private async analyzeNotes(context: AnalysisContext): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];

    // Notes avec mots-clés importants (URGENT, IMPORTANT, TODO, RAPPEL)
    const importantKeywords = ['urgent', 'important', 'todo', 'rappel', 'asap', 'critique', '!!!'];

    for (const note of context.notes.slice(0, 10)) { // Top 10 notes récentes
      const content = (note.content || '').toLowerCase();
      const title = (note.title || '').toLowerCase();

      const hasImportantKeyword = importantKeywords.some(kw =>
        content.includes(kw) || title.includes(kw)
      );

      if (hasImportantKeyword) {
        reminders.push({
          type: 'note_important',
          priority: 'medium',
          title: `📝 Note importante : ${note.title}`,
          message: `Contient des mots-clés importants - À relire`,
          entityType: 'note',
          entityId: note.id,
          metadata: { hasImportantKeyword }
        });
      }
    }

    return reminders;
  }

  /**
   * Analyser les projets pour rappels
   */
  private async analyzeProjects(context: AnalysisContext): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const project of context.projects) {
      const updatedAt = new Date(project.updated_at);

      // Projet inactif depuis >30 jours
      if (updatedAt < thirtyDaysAgo && project.status === 'active') {
        reminders.push({
          type: 'project_blocked',
          priority: 'low',
          title: `📊 Projet inactif : ${project.name}`,
          message: `Aucune activité depuis ${Math.round((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))} jours`,
          entityType: 'project',
          entityId: project.id,
          metadata: { daysSinceUpdate: Math.round((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)) }
        });
      }
    }

    return reminders;
  }

  /**
   * Utiliser l'IA pour prioriser et filtrer les rappels
   */
  private async aiPrioritize(reminders: SmartReminder[], context: AnalysisContext): Promise<SmartReminder[]> {
    if (reminders.length === 0) {
      // Pas de rappels basiques, demander à l'IA de suggérer des rappels proactifs
      return await this.aiSuggestProactive(context);
    }

    // Si trop de rappels (>10), utiliser l'IA pour filtrer les plus pertinents
    if (reminders.length > 10) {
      try {
        const prompt = `Analyse ces ${reminders.length} rappels et sélectionne les 8 plus pertinents et urgents pour l'utilisateur.

Rappels bruts :
${reminders.map((r, i) => `${i + 1}. [${r.priority}] ${r.title} - ${r.message}`).join('\n')}

Contexte :
- ${context.tasks.length} tâches actives
- ${context.calendarEvents.length} événements à venir
- ${context.projects.length} projets actifs

Réponds UNIQUEMENT avec les numéros des rappels à garder, séparés par des virgules (ex: "1,3,5,7,9,12,14,16").`;

        const aiResponse = await aiService.generate({ prompt, max_tokens: 100 });
        const text = aiResponse.content || '';

        // Parser la réponse IA (ex: "1,3,5,7")
        const selectedIndices = text
          .split(',')
          .map((n: string) => parseInt(n.trim()) - 1)
          .filter((i: number) => !isNaN(i) && i >= 0 && i < reminders.length);

        if (selectedIndices.length > 0) {
          return selectedIndices.map((i: number) => reminders[i]);
        }

      } catch (error) {
        console.warn('⚠️ AI prioritization failed, using top 8 by priority');
      }

      // Fallback : trier par priorité et prendre top 8
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return reminders
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 8);
    }

    return reminders;
  }

  /**
   * IA suggère des rappels proactifs (si aucun rappel basique détecté)
   */
  private async aiSuggestProactive(context: AnalysisContext): Promise<SmartReminder[]> {
    try {
      const prompt = `Tu es un assistant de productivité intelligent. Analyse le contexte utilisateur et suggère 2-3 rappels pertinents pour l'aider à rester productif.

Contexte :
- ${context.tasks.length} tâches actives : ${context.tasks.slice(0, 5).map((t: any) => t.title).join(', ')}
- ${context.calendarEvents.length} événements à venir dans 30 jours
- ${context.projects.length} projets actifs : ${context.projects.slice(0, 3).map((p: any) => p.name).join(', ')}
- Dernière activité : ${context.recentActivity[0]?.action_type || 'Aucune'}

Suggère des rappels PERTINENTS et ACTIONNABLES (pas génériques). Format JSON :
[
  {"title": "...", "message": "...", "priority": "medium|high|low"}
]`;

      const aiResponse = await aiService.generate({ prompt, max_tokens: 300 });
      const text = aiResponse.content || '';

      // Parser JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any) => ({
          type: 'ai_suggestion' as const,
          priority: s.priority || 'medium',
          title: s.title,
          message: s.message,
          metadata: { aiGenerated: true }
        }));
      }

    } catch (error) {
      console.warn('⚠️ AI proactive suggestions failed');
    }

    return [];
  }

  /**
   * Créer une notification depuis un SmartReminder
   */
  async createNotificationFromReminder(
    userId: UUID,
    reminder: SmartReminder
  ): Promise<void> {
    try {
      // Mapper type vers notification_type enum
      let notifType = 'system';
      if (reminder.type === 'calendar') notifType = 'task_due';
      else if (reminder.type === 'task_forgotten') notifType = 'task_due';
      else if (reminder.type === 'note_important') notifType = 'system';

      await sql`
        INSERT INTO notifications (user_id, type, title, content, entity_type, entity_id)
        VALUES (${userId}, ${notifType}, ${reminder.title}, ${reminder.message}, ${reminder.entityType || null}, ${reminder.entityId || null})
      `;

    } catch (error) {
      console.error('Error creating notification from reminder:', error);
    }
  }
}

export const notificationsAIService = new NotificationsAIService();
