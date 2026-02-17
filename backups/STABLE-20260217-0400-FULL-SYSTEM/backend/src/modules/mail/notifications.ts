// =============================================
// MAIL NOTIFICATIONS
// Helpers pour envoyer des notifications automatiques
// =============================================

import { MailService } from './mail.service.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Remplace les variables dans un template HTML
 */
function replaceVariables(html: string, variables: Record<string, any>): string {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  return result;
}

/**
 * Charge un template HTML
 */
async function loadTemplate(templateName: string): Promise<string> {
  // Use absolute path from project root (works in both dev and production)
  const templatePath = path.join(process.cwd(), 'dist/modules/mail/templates', `${templateName}.html`);
  return await fs.readFile(templatePath, 'utf-8');
}

/**
 * Notification: Tâche assignée
 */
export async function notifyTaskAssigned(params: {
  userId: string;
  workspaceId: string;
  userEmail: string;
  userName: string;
  taskTitle: string;
  taskDescription: string;
  deadline: string;
  priority: string;
  projectName: string;
  assignedBy: string;
  taskUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await loadTemplate('task-assigned');

    // Map priority to class
    const priorityClassMap: Record<string, string> = {
      'urgent': 'high',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };

    const html = replaceVariables(template, {
      userName: params.userName,
      projectName: params.projectName,
      taskTitle: params.taskTitle,
      taskDescription: params.taskDescription || 'Aucune description',
      deadline: params.deadline,
      assignedBy: params.assignedBy,
      priority: params.priority.toUpperCase(),
      priorityClass: priorityClassMap[params.priority.toLowerCase()] || 'medium',
      taskUrl: params.taskUrl,
      appUrl: process.env.APP_URL || 'https://giri-app.com'
    });

    return await MailService.send(params.userId, params.workspaceId, {
      to: [params.userEmail],
      subject: `✅ Nouvelle tâche: ${params.taskTitle}`,
      body: html,
      isHtml: true
    });
  } catch (error: any) {
    console.error('[Notifications] Error sending task assigned email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notification: Échéance approchante (J-3, J-1)
 */
export async function notifyDeadlineWarning(params: {
  userId: string;
  workspaceId: string;
  userEmail: string;
  userName: string;
  daysRemaining: number;
  tasks: Array<{
    title: string;
    description: string;
    deadline: string;
  }>;
  tasksUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await loadTemplate('deadline-warning');

    // Build tasks HTML (simple loop replacement)
    let tasksHtml = '';
    for (const task of params.tasks) {
      tasksHtml += `
                <li class="task-item">
                    <h3>${task.title}</h3>
                    <p>${task.description || 'Aucune description'}</p>
                    <span class="deadline-badge">📅 ${task.deadline}</span>
                </li>`;
    }

    let html = replaceVariables(template, {
      userName: params.userName,
      taskCount: params.tasks.length,
      daysRemaining: params.daysRemaining,
      tasksUrl: params.tasksUrl,
      appUrl: process.env.APP_URL || 'https://giri-app.com'
    });

    // Replace tasks loop
    html = html.replace(/{{#tasks}}[\s\S]*?{{\/tasks}}/g, tasksHtml);

    return await MailService.send(params.userId, params.workspaceId, {
      to: [params.userEmail],
      subject: `⚠️ ${params.tasks.length} tâche(s) à terminer dans ${params.daysRemaining} jour(s)`,
      body: html,
      isHtml: true
    });
  } catch (error: any) {
    console.error('[Notifications] Error sending deadline warning email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notification: Invitation réunion
 */
export async function notifyMeetingInvitation(params: {
  userId: string;
  workspaceId: string;
  userEmail: string;
  userName: string;
  organizerName: string;
  organizerEmail: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  duration: number;
  meetingUrl: string;
  location?: string;
  agenda?: string;
  participants: Array<{ name: string }>;
  calendarLink: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await loadTemplate('meeting-invitation');

    // Build participants HTML
    let participantsHtml = '';
    for (const p of params.participants) {
      participantsHtml += `<li>${p.name}</li>`;
    }

    let html = replaceVariables(template, {
      userName: params.userName,
      organizerName: params.organizerName,
      organizerEmail: params.organizerEmail,
      meetingTitle: params.meetingTitle,
      meetingDate: params.meetingDate,
      meetingTime: params.meetingTime,
      duration: params.duration,
      meetingUrl: params.meetingUrl,
      location: params.location || '',
      agenda: params.agenda || '',
      participantCount: params.participants.length,
      calendarLink: params.calendarLink,
      appUrl: process.env.APP_URL || 'https://giri-app.com'
    });

    // Replace participants loop
    html = html.replace(/{{#participants}}[\s\S]*?{{\/participants}}/g, participantsHtml);

    // Handle optional sections (location, agenda)
    if (!params.location) {
      html = html.replace(/{{#location}}[\s\S]*?{{\/location}}/g, '');
    } else {
      html = html.replace(/{{#location}}|{{\/location}}/g, '');
    }

    if (!params.agenda) {
      html = html.replace(/{{#agenda}}[\s\S]*?{{\/agenda}}/g, '');
    } else {
      html = html.replace(/{{#agenda}}|{{\/agenda}}/g, '');
    }

    return await MailService.send(params.userId, params.workspaceId, {
      to: [params.userEmail],
      subject: `📅 Invitation: ${params.meetingTitle}`,
      body: html,
      isHtml: true
    });
  } catch (error: any) {
    console.error('[Notifications] Error sending meeting invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notification: Rapport AI disponible
 */
export async function notifyReportReady(params: {
  userId: string;
  workspaceId: string;
  userEmail: string;
  userName: string;
  reportTitle: string;
  reportType: string;
  generatedDate: string;
  tasksAnalyzed: number;
  insightsCount: number;
  mainInsight: string;
  reportUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await loadTemplate('report-ready');

    const html = replaceVariables(template, {
      userName: params.userName,
      reportTitle: params.reportTitle,
      reportType: params.reportType,
      generatedDate: params.generatedDate,
      tasksAnalyzed: params.tasksAnalyzed,
      insightsCount: params.insightsCount,
      mainInsight: params.mainInsight,
      reportUrl: params.reportUrl,
      appUrl: process.env.APP_URL || 'https://giri-app.com'
    });

    return await MailService.send(params.userId, params.workspaceId, {
      to: [params.userEmail],
      subject: `✨ Votre rapport "${params.reportTitle}" est prêt`,
      body: html,
      isHtml: true
    });
  } catch (error: any) {
    console.error('[Notifications] Error sending report ready email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notification: Bienvenue nouveau membre
 */
export async function notifyWelcome(params: {
  userId: string;
  workspaceId: string;
  userEmail: string;
  userName: string;
  workspaceName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await loadTemplate('welcome');

    const html = replaceVariables(template, {
      userName: params.userName,
      workspaceName: params.workspaceName,
      userEmail: params.userEmail,
      appUrl: process.env.APP_URL || 'https://giri-app.com',
      helpUrl: `${process.env.APP_URL || 'https://giri-app.com'}/help`
    });

    return await MailService.send(params.userId, params.workspaceId, {
      to: [params.userEmail],
      subject: `👑 Bienvenue sur ProductiveApp, ${params.userName} !`,
      body: html,
      isHtml: true
    });
  } catch (error: any) {
    console.error('[Notifications] Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}
