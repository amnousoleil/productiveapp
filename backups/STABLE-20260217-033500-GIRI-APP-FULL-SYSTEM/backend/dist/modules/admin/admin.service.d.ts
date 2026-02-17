import type { Pool } from 'pg';
import type { SystemHealth, SystemStats, MemberActivity, RecentActivity } from './types.js';
export declare class AdminService {
    private pool;
    constructor(pool: Pool);
    getSystemHealth(): Promise<SystemHealth>;
    getSystemStats(): Promise<SystemStats>;
    getMemberActivity(): Promise<MemberActivity[]>;
    getRecentActivity(limit?: number): Promise<RecentActivity[]>;
}
//# sourceMappingURL=admin.service.d.ts.map