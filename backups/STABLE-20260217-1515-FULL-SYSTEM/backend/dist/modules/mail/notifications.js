"use strict";
// =============================================
// MAIL NOTIFICATIONS
// Helpers pour envoyer des notifications automatiques
// =============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyTaskAssigned = notifyTaskAssigned;
exports.notifyDeadlineWarning = notifyDeadlineWarning;
exports.notifyMeetingInvitation = notifyMeetingInvitation;
exports.notifyReportReady = notifyReportReady;
exports.notifyWelcome = notifyWelcome;
const mail_service_js_1 = require("./mail.service.js");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Remplace les variables dans un template HTML
 */
function replaceVariables(html, variables) {
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
async function loadTemplate(templateName) {
    // Use absolute path from project root (works in both dev and production)
    const templatePath = path_1.default.join(process.cwd(), 'dist/modules/mail/templates', `${templateName}.html`);
    return await promises_1.default.readFile(templatePath, 'utf-8');
}
/**
 * Notification: Tâche assignée
 */
async function notifyTaskAssigned(params) {
    try {
        const template = await loadTemplate('task-assigned');
        // Map priority to class
        const priorityClassMap = {
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
        return await mail_service_js_1.MailService.send(params.userId, params.workspaceId, {
            to: [params.userEmail],
            subject: `✅ Nouvelle tâche: ${params.taskTitle}`,
            body: html,
            isHtml: true
        });
    }
    catch (error) {
        console.error('[Notifications] Error sending task assigned email:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Notification: Échéance approchante (J-3, J-1)
 */
async function notifyDeadlineWarning(params) {
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
        return await mail_service_js_1.MailService.send(params.userId, params.workspaceId, {
            to: [params.userEmail],
            subject: `⚠️ ${params.tasks.length} tâche(s) à terminer dans ${params.daysRemaining} jour(s)`,
            body: html,
            isHtml: true
        });
    }
    catch (error) {
        console.error('[Notifications] Error sending deadline warning email:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Notification: Invitation réunion
 */
async function notifyMeetingInvitation(params) {
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
        }
        else {
            html = html.replace(/{{#location}}|{{\/location}}/g, '');
        }
        if (!params.agenda) {
            html = html.replace(/{{#agenda}}[\s\S]*?{{\/agenda}}/g, '');
        }
        else {
            html = html.replace(/{{#agenda}}|{{\/agenda}}/g, '');
        }
        return await mail_service_js_1.MailService.send(params.userId, params.workspaceId, {
            to: [params.userEmail],
            subject: `📅 Invitation: ${params.meetingTitle}`,
            body: html,
            isHtml: true
        });
    }
    catch (error) {
        console.error('[Notifications] Error sending meeting invitation email:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Notification: Rapport AI disponible
 */
async function notifyReportReady(params) {
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
        return await mail_service_js_1.MailService.send(params.userId, params.workspaceId, {
            to: [params.userEmail],
            subject: `✨ Votre rapport "${params.reportTitle}" est prêt`,
            body: html,
            isHtml: true
        });
    }
    catch (error) {
        console.error('[Notifications] Error sending report ready email:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Notification: Bienvenue nouveau membre
 */
async function notifyWelcome(params) {
    try {
        const template = await loadTemplate('welcome');
        const html = replaceVariables(template, {
            userName: params.userName,
            workspaceName: params.workspaceName,
            userEmail: params.userEmail,
            appUrl: process.env.APP_URL || 'https://giri-app.com',
            helpUrl: `${process.env.APP_URL || 'https://giri-app.com'}/help`
        });
        return await mail_service_js_1.MailService.send(params.userId, params.workspaceId, {
            to: [params.userEmail],
            subject: `👑 Bienvenue sur ProductiveApp, ${params.userName} !`,
            body: html,
            isHtml: true
        });
    }
    catch (error) {
        console.error('[Notifications] Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=notifications.js.map