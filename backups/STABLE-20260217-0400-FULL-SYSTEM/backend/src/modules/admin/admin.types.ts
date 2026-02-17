/**
 * ADMIN MODULE - TYPES
 * ProductiveApp Backend - Types pour l'administration
 * RÉSERVÉ À: contact@mahagiri.fr
 */

export interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
  };
  uptime: string;
}

export interface SystemStats {
  totalNotes: number;
  totalTasks: number;
  totalProjects: number;
  totalConnections: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  avatar: string;
  action: string;
  timestamp: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  projectCount: number;
  createdAt: Date;
}

// ===== NEW TYPES FOR DASHBOARD v2.0 =====

export interface DatabaseMetrics {
  sizeMb: number;
  tableCount: number;
  slowQueries: SlowQuery[];
  missingIndexes: MissingIndex[];
}

export interface SlowQuery {
  query: string;
  calls: number;
  meanTimeMs: number;
  maxTimeMs: number;
}

export interface MissingIndex {
  schemaName: string;
  tableName: string;
  seqScans: number;
  seqTupRead: number;
  recommendation: string;
}

export interface UserAnalytics {
  memberId: string;
  memberName: string;
  lastLogin: string | null;
  loginCountWeek: number;
  notesCount: number;
  tasksCount: number;
  projectsCount: number;
  totalActions: number;
  timeSpentMinutes: number;
}

export interface VersionInfo {
  appVersion: string;
  nodeVersion: string;
  environment: string;
  uptime: number;
  changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  date: string;
  version?: string;
  title: string;
  changes: string[];
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
