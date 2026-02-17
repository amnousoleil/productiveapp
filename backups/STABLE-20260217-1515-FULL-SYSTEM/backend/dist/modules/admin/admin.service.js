"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
class AdminService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async getSystemHealth() {
        const startTime = Date.now();
        let dbStatus = 'disconnected';
        let responseTime = 0;
        try {
            await this.pool.query('SELECT 1');
            responseTime = Date.now() - startTime;
            dbStatus = 'connected';
        }
        catch (error) {
            console.error('[AdminService] DB health check failed:', error);
        }
        const uptime = process.uptime();
        const status = dbStatus === 'connected' && responseTime < 1000 ? 'healthy' :
            dbStatus === 'connected' ? 'degraded' : 'down';
        return {
            status,
            database: {
                status: dbStatus,
                responseTime,
            },
            uptime,
            timestamp: new Date().toISOString(),
        };
    }
    async getSystemStats() {
        // Count total users
        const usersResult = await this.pool.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(usersResult.rows[0]?.count || '0', 10);
        // Count users active today (logged in today)
        const activeUsersResult = await this.pool.query(`SELECT COUNT(DISTINCT user_id) as count
       FROM user_gamification
       WHERE last_activity_at >= CURRENT_DATE`);
        const activeToday = parseInt(activeUsersResult.rows[0]?.count || '0', 10);
        // Count workspaces
        const workspacesResult = await this.pool.query('SELECT COUNT(*) as count FROM workspaces');
        const totalWorkspaces = parseInt(workspacesResult.rows[0]?.count || '0', 10);
        // Count notes
        const notesResult = await this.pool.query('SELECT COUNT(*) as count FROM notes');
        const notesCount = parseInt(notesResult.rows[0]?.count || '0', 10);
        // Count tasks
        const tasksResult = await this.pool.query('SELECT COUNT(*) as count FROM tasks');
        const tasksCount = parseInt(tasksResult.rows[0]?.count || '0', 10);
        // Count projects
        const projectsResult = await this.pool.query('SELECT COUNT(*) as count FROM projects');
        const projectsCount = parseInt(projectsResult.rows[0]?.count || '0', 10);
        // Count logins today (using gamification last_activity_at)
        const loginsTodayResult = await this.pool.query(`SELECT COUNT(DISTINCT user_id) as count
       FROM user_gamification
       WHERE last_activity_at >= CURRENT_DATE`);
        const loginsToday = parseInt(loginsTodayResult.rows[0]?.count || '0', 10);
        // Count logins this week
        const loginsWeekResult = await this.pool.query(`SELECT COUNT(DISTINCT user_id) as count
       FROM user_gamification
       WHERE last_activity_at >= CURRENT_DATE - INTERVAL '7 days'`);
        const loginsWeek = parseInt(loginsWeekResult.rows[0]?.count || '0', 10);
        return {
            users: {
                total: totalUsers,
                active_today: activeToday,
            },
            workspaces: {
                total: totalWorkspaces,
            },
            content: {
                notes: notesCount,
                tasks: tasksCount,
                projects: projectsCount,
            },
            activity: {
                logins_today: loginsToday,
                logins_week: loginsWeek,
            },
        };
    }
    async getMemberActivity() {
        const result = await this.pool.query(`SELECT
        u.id as user_id,
        u.name,
        ug.last_activity_at,
        COALESCE(
          (SELECT COUNT(*) FROM user_gamification ug2
           WHERE ug2.user_id = u.id
           AND ug2.last_activity_at >= CURRENT_DATE - INTERVAL '7 days'),
          0
        ) as login_count_week,
        COALESCE((SELECT COUNT(*) FROM notes n WHERE n.member_id::uuid = u.id), 0) as notes_count,
        COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id), 0) as tasks_count,
        COALESCE((SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id), 0) as projects_count
      FROM users u
      LEFT JOIN user_gamification ug ON u.id = ug.user_id
      ORDER BY ug.last_activity_at DESC NULLS LAST`);
        return result.rows.map((row) => ({
            member_id: row.user_id,
            member_name: row.name,
            last_login: row.last_activity_at,
            login_count_week: parseInt(row.login_count_week || '0', 10),
            notes_count: parseInt(row.notes_count || '0', 10),
            tasks_count: parseInt(row.tasks_count || '0', 10),
            projects_count: parseInt(row.projects_count || '0', 10),
        }));
    }
    async getRecentActivity(limit = 20) {
        // For now, we'll use notes and tasks creation as activity indicators
        // (since we don't have a dedicated activity log table)
        const result = await this.pool.query(`SELECT 'note' as type,
              n.member_id::text,
              COALESCE(u.name, 'Unknown') as member_name,
              'Created note: ' || LEFT(n.content, 50) as action,
              n.created_at as timestamp
       FROM notes n
       LEFT JOIN users u ON n.member_id::uuid = u.id
       WHERE n.created_at IS NOT NULL AND n.member_id IS NOT NULL
       UNION ALL
       SELECT 'task' as type,
              t.user_id::text,
              COALESCE(u.name, 'Unknown') as member_name,
              'Created task: ' || t.title as action,
              t.created_at as timestamp
       FROM tasks t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.created_at IS NOT NULL AND t.user_id IS NOT NULL
       UNION ALL
       SELECT 'project' as type,
              p.user_id::text as member_id,
              COALESCE(u.name, 'Unknown') as member_name,
              'Created project: ' || p.name as action,
              p.created_at as timestamp
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.created_at IS NOT NULL AND p.user_id IS NOT NULL
       ORDER BY timestamp DESC
       LIMIT $1`, [limit]);
        return result.rows.map((row) => ({
            type: row.type,
            member_id: row.member_id,
            member_name: row.member_name,
            action: row.action,
            timestamp: row.timestamp,
        }));
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map