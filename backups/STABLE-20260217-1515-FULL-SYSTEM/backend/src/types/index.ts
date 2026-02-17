import type { Request } from 'express';

// ============================================
// Utility Types
// ============================================

export type UUID = string;
export type ISODateString = string;
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// ============================================
// Enum Types
// ============================================

export type UserStatus = 'online' | 'offline' | 'busy';
export type UserPlan = 'free' | 'pro' | 'enterprise';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';
export type TeamRole = 'lead' | 'member';
export type ProjectStatus = 'active' | 'archived' | 'deleted';
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ConversationType = 'direct' | 'channel' | 'group';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
export type ConversationRole = 'admin' | 'member';
export type AchievementCategory = 'productivity' | 'social' | 'streak' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type XpReason = 'note_created' | 'note_updated' | 'task_created' | 'task_completed' | 'task_early' | 'streak_bonus' | 'achievement' | 'message_sent' | 'login_bonus' | 'daily_goal' | 'weekly_goal' | 'report_generated' | 'audit_completed';
export type StreakType = 'daily_login' | 'daily_note' | 'daily_task' | 'weekly_goal';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';
export type HumanDesignType = 'generator' | 'manifesting_generator' | 'projector' | 'manifestor' | 'reflector';
export type AuditReportType = 'quick' | 'standard' | 'deep' | 'comprehensive';
export type AuditReportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type CanvasPermission = 'view' | 'edit';
export type EntityType = 'note' | 'task' | 'message' | 'canvas' | 'project' | 'workspace' | 'report' | 'audit';
export type ActivityAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'invite' | 'join' | 'leave' | 'archive' | 'restore';
export type NotificationType = 'mention' | 'assignment' | 'achievement' | 'message' | 'system' | 'invitation' | 'task_due' | 'comment';
export type DigestFrequency = 'realtime' | 'daily' | 'weekly' | 'none';

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: UUID;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  status: UserStatus;
  plan: UserPlan;
  language: string;
  timezone: string | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  email_verified: boolean;
}

export type UserPublic = Omit<User, 'password_hash'>;

export interface Session {
  id: UUID;
  user_id: UUID;
  token_hash: string;
  refresh_token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
}

export interface TokenPayload {
  userId: UUID;
  sessionId: UUID;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// Workspace Types
// ============================================

export interface WorkspaceSettings {
  theme?: 'light' | 'dark' | 'system';
  default_view?: 'list' | 'board' | 'calendar' | 'timeline';
  notifications?: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  features?: {
    gamification: boolean;
    audit: boolean;
    canvas: boolean;
  };
}

export interface Workspace {
  id: UUID;
  owner_id: UUID;
  name: string;
  slug: string;
  icon: string | null;
  settings: WorkspaceSettings;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  workspace_id: UUID;
  user_id: UUID;
  role: WorkspaceRole;
  permissions: Record<string, boolean> | null;
  invited_by: UUID | null;
  invited_at: Date | null;
  joined_at: Date;
}

export interface WorkspaceInvitation {
  id: UUID;
  workspace_id: UUID;
  email: string;
  role: WorkspaceRole;
  token: string;
  invited_by: UUID;
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
}

// ============================================
// Team Types
// ============================================

export interface Team {
  id: UUID;
  workspace_id: UUID;
  name: string;
  description: string | null;
  color: string | null;
  created_at: Date;
}

export interface TeamMember {
  team_id: UUID;
  user_id: UUID;
  role: TeamRole;
  joined_at: Date;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  parent_id: UUID | null;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: ProjectStatus;
  is_shared: boolean;
  is_favorite: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  project_id: UUID;
  user_id: UUID;
  role: ProjectRole;
  added_at: Date;
}

// ============================================
// Note Types
// ============================================

export interface Note {
  id: UUID;
  project_id: UUID | null;
  workspace_id: UUID;
  user_id: UUID;
  parent_id: UUID | null;
  title: string;
  content: string;
  content_html: string | null;
  tags: string[];
  is_pinned: boolean;
  is_public: boolean;
  is_template: boolean;
  position: number;
  word_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface NoteVersion {
  id: UUID;
  note_id: UUID;
  user_id: UUID;
  content: string;
  created_at: Date;
}

export interface NoteLink {
  source_note_id: UUID;
  target_note_id: UUID;
  created_at: Date;
}

// ============================================
// Task Types
// ============================================

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: UUID;
  workspace_id: UUID;
  project_id: UUID | null;
  user_id: UUID;
  assigned_to: UUID | null;
  parent_id: UUID | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  start_date: Date | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  position: number;
  tags: string[];
  checklist: ChecklistItem[];
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface TaskComment {
  id: UUID;
  task_id: UUID;
  user_id: UUID;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskAttachment {
  id: UUID;
  task_id: UUID;
  user_id: UUID;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: Date;
}

// ============================================
// Messaging Types
// ============================================

export interface Conversation {
  id: UUID;
  workspace_id: UUID;
  type: ConversationType;
  name: string | null;
  description: string | null;
  is_private: boolean;
  created_by: UUID;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationParticipant {
  conversation_id: UUID;
  user_id: UUID;
  role: ConversationRole;
  nickname: string | null;
  is_muted: boolean;
  joined_at: Date;
  last_read_at: Date | null;
  last_read_message_id: UUID | null;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  reply_to_id: UUID | null;
  content: string;
  message_type: MessageType;
  attachments: MessageAttachment[];
  mentions: UUID[];
  is_edited: boolean;
  is_pinned: boolean;
  created_at: Date;
  edited_at: Date | null;
  deleted_at: Date | null;
}

export interface MessageReaction {
  message_id: UUID;
  user_id: UUID;
  emoji: string;
  created_at: Date;
}

export interface MessageReadReceipt {
  message_id: UUID;
  user_id: UUID;
  read_at: Date;
}

// ============================================
// Gamification Types
// ============================================

export interface UserGamification {
  user_id: UUID;
  workspace_id: UUID;
  total_xp: number;
  level: number;
  prestige: number;
  coins: number;
  current_streak: number;
  best_streak: number;
  last_activity_at: Date | null;
  updated_at: Date;
}

export interface AchievementCondition {
  type: string;
  threshold: number;
  entity_type?: EntityType;
}

export interface Achievement {
  id: UUID;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xp_reward: number;
  coin_reward: number;
  condition: AchievementCondition;
  is_secret: boolean;
  rarity: AchievementRarity;
  created_at: Date;
}

export interface AchievementUnlocked {
  user_id: UUID;
  achievement_id: UUID;
  unlocked_at: Date;
  notified_at: Date | null;
}

export interface XpEvent {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  amount: number;
  reason: XpReason;
  entity_type: EntityType | null;
  entity_id: UUID | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface Streak {
  user_id: UUID;
  workspace_id: UUID;
  streak_type: StreakType;
  current_count: number;
  best_count: number;
  last_activity_date: Date;
  freeze_available: boolean;
  updated_at: Date;
}

export interface Leaderboard {
  workspace_id: UUID;
  user_id: UUID;
  period: LeaderboardPeriod;
  period_start: Date;
  xp_earned: number;
  rank: number;
  updated_at: Date;
}

// ============================================
// Psycho-Audit Types
// ============================================

export interface HumanDesignCenters {
  head: boolean;
  ajna: boolean;
  throat: boolean;
  g: boolean;
  heart: boolean;
  sacral: boolean;
  spleen: boolean;
  solar_plexus: boolean;
  root: boolean;
}

export interface BirthData {
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface HumanDesignProfile {
  user_id: UUID;
  type: HumanDesignType;
  authority: string;
  profile: string;
  definition: string;
  centers: HumanDesignCenters;
  channels: string[];
  gates: number[];
  incarnation_cross: string;
  variables: Record<string, unknown>;
  birth_data: BirthData;
  created_at: Date;
  updated_at: Date;
}

export interface JournalEntry {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  date: Date;
  content: string;
  mood: number;
  energy_level: number;
  sleep_quality: number;
  tags: string[];
  weather: Record<string, unknown> | null;
  highlights: string[];
  challenges: string[];
  gratitude: string[];
  created_at: Date;
  updated_at: Date;
}

export interface AuditAnalysis {
  summary: string;
  insights: string[];
  patterns: Record<string, unknown>[];
  recommendations: string[];
}

export interface AuditReport {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  report_type: AuditReportType;
  period_start: Date;
  period_end: Date;
  status: AuditReportStatus;
  analysis_therapeutic: AuditAnalysis | null;
  analysis_spiritual: AuditAnalysis | null;
  analysis_strategic: AuditAnalysis | null;
  synthesis: Record<string, unknown> | null;
  recommendations: string[] | null;
  pdf_url: string | null;
  processing_time_ms: number | null;
  llm_model_used: string | null;
  created_at: Date;
}

// ============================================
// Canvas Types
// ============================================

export interface Canvas {
  id: UUID;
  workspace_id: UUID;
  project_id: UUID | null;
  user_id: UUID;
  name: string;
  thumbnail_url: string | null;
  elements: Record<string, unknown>;
  app_state: Record<string, unknown>;
  is_template: boolean;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CanvasCollaborator {
  canvas_id: UUID;
  user_id: UUID;
  permission: CanvasPermission;
  last_accessed_at: Date | null;
}

// ============================================
// File Types
// ============================================

export interface File {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  filename: string;
  original_filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  entity_type: EntityType | null;
  entity_id: UUID | null;
  created_at: Date;
}

// ============================================
// Analytics Types
// ============================================

export interface ActivityLog {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  action: ActivityAction;
  entity_type: EntityType | null;
  entity_id: UUID | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface DailyStats {
  user_id: UUID;
  workspace_id: UUID;
  date: Date;
  notes_created: number;
  notes_updated: number;
  tasks_created: number;
  tasks_completed: number;
  messages_sent: number;
  xp_earned: number;
  time_spent_minutes: number;
  most_active_hour: number | null;
}

export interface WorkspaceStats {
  workspace_id: UUID;
  date: Date;
  total_users: number;
  active_users: number;
  notes_count: number;
  tasks_count: number;
  messages_count: number;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: UUID;
  user_id: UUID;
  type: NotificationType;
  title: string;
  content: string;
  entity_type: EntityType | null;
  entity_id: UUID | null;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

export interface NotificationSettings {
  user_id: UUID;
  workspace_id: UUID;
  email_notifications: boolean;
  push_notifications: boolean;
  mention_notifications: boolean;
  assignment_notifications: boolean;
  achievement_notifications: boolean;
  digest_frequency: DigestFrequency;
}

// ============================================
// Express Extended Types
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: UserPublic;
  session?: Session;
  workspace?: Workspace;
  workspaceMember?: WorkspaceMember;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
