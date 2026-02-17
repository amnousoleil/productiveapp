import type { UUID } from '../../types/index.js';

export interface VisionMeeting {
  id: UUID;
  room_id: string;
  title: string;
  created_by: string;
  workspace_id: UUID;
  participants: string[];
  status: 'active' | 'ended' | 'scheduled';
  scheduled_at?: Date;
  started_at?: Date;
  ended_at?: Date;
  duration_seconds?: number;
  settings: Record<string, unknown>;
  created_at: Date;
}

export interface CreateMeetingInput {
  title?: string;
  scheduled_at?: string;
}

export interface JoinMeetingInput {
  participant_name: string;
}

export interface EndMeetingInput {
  duration_seconds?: number;
}
