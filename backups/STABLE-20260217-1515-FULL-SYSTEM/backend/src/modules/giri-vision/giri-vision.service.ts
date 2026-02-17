import { sql } from '../../config/database.js';
import type { UUID } from '../../types/index.js';
import type { VisionMeeting, CreateMeetingInput } from './giri-vision.types.js';

function generateRoomId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `giri-${timestamp}-${random}`;
}

export const giriVisionService = {
  async createMeeting(userId: string, workspaceId: UUID, input: CreateMeetingInput): Promise<VisionMeeting> {
    const roomId = generateRoomId();
    const status = input.scheduled_at ? 'scheduled' : 'active';
    const rows = await sql`
      INSERT INTO vision_meetings (room_id, title, created_by, workspace_id, scheduled_at, status)
      VALUES (
        ${roomId},
        ${input.title || 'Réunion sans titre'},
        ${userId},
        ${workspaceId},
        ${input.scheduled_at || null},
        ${status}
      )
      RETURNING *
    `;
    return rows[0] as unknown as VisionMeeting;
  },

  async getMeetings(workspaceId: UUID): Promise<VisionMeeting[]> {
    const rows = await sql`
      SELECT * FROM vision_meetings
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return rows as unknown as VisionMeeting[];
  },

  async getMeetingByRoomId(roomId: string): Promise<VisionMeeting | null> {
    const rows = await sql`
      SELECT * FROM vision_meetings WHERE room_id = ${roomId}
    `;
    return (rows[0] as unknown as VisionMeeting) || null;
  },

  async joinMeeting(roomId: string, participantName: string): Promise<VisionMeeting | null> {
    const rows = await sql`
      UPDATE vision_meetings
      SET participants = CASE
        WHEN participants @> ${JSON.stringify([participantName])}::jsonb THEN participants
        ELSE participants || ${JSON.stringify([participantName])}::jsonb
      END
      WHERE room_id = ${roomId}
      RETURNING *
    `;
    return (rows[0] as unknown as VisionMeeting) || null;
  },

  async endMeeting(roomId: string, durationSeconds?: number): Promise<VisionMeeting | null> {
    const rows = await sql`
      UPDATE vision_meetings
      SET status = 'ended', ended_at = NOW(), duration_seconds = ${durationSeconds || null}
      WHERE room_id = ${roomId}
      RETURNING *
    `;
    return (rows[0] as unknown as VisionMeeting) || null;
  },

  async deleteMeeting(roomId: string, userId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM vision_meetings
      WHERE room_id = ${roomId} AND created_by = ${userId}
    `;
    return result.count > 0;
  },

  async getScheduled(workspaceId: UUID): Promise<VisionMeeting[]> {
    const rows = await sql`
      SELECT * FROM vision_meetings
      WHERE workspace_id = ${workspaceId}
        AND status = 'scheduled'
        AND scheduled_at > NOW()
      ORDER BY scheduled_at ASC
      LIMIT 20
    `;
    return rows as unknown as VisionMeeting[];
  }
};
