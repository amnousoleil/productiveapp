/**
 * Notification: Tâche assignée
 */
export declare function notifyTaskAssigned(params: {
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
}): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Notification: Échéance approchante (J-3, J-1)
 */
export declare function notifyDeadlineWarning(params: {
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
}): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Notification: Invitation réunion
 */
export declare function notifyMeetingInvitation(params: {
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
    participants: Array<{
        name: string;
    }>;
    calendarLink: string;
}): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Notification: Rapport AI disponible
 */
export declare function notifyReportReady(params: {
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
}): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Notification: Bienvenue nouveau membre
 */
export declare function notifyWelcome(params: {
    userId: string;
    workspaceId: string;
    userEmail: string;
    userName: string;
    workspaceName: string;
}): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=notifications.d.ts.map