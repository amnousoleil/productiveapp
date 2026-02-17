export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    database: {
        status: 'connected' | 'disconnected';
        responseTime: number;
    };
    uptime: number;
    timestamp: string;
}
export interface SystemStats {
    users: {
        total: number;
        active_today: number;
    };
    workspaces: {
        total: number;
    };
    content: {
        notes: number;
        tasks: number;
        projects: number;
    };
    activity: {
        logins_today: number;
        logins_week: number;
    };
}
export interface MemberActivity {
    member_id: string;
    member_name: string;
    last_login: string | null;
    login_count_week: number;
    notes_count: number;
    tasks_count: number;
    projects_count: number;
}
export interface RecentActivity {
    type: 'login' | 'note' | 'task' | 'project';
    member_id: string;
    member_name: string;
    action: string;
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map