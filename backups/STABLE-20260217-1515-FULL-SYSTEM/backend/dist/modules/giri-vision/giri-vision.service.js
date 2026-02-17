"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.giriVisionService = void 0;
const database_js_1 = require("../../config/database.js");
function generateRoomId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `giri-${timestamp}-${random}`;
}
exports.giriVisionService = {
    async createMeeting(userId, workspaceId, input) {
        const roomId = generateRoomId();
        const status = input.scheduled_at ? 'scheduled' : 'active';
        const rows = await (0, database_js_1.sql) `
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
        return rows[0];
    },
    async getMeetings(workspaceId) {
        const rows = await (0, database_js_1.sql) `
      SELECT * FROM vision_meetings
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
        return rows;
    },
    async getMeetingByRoomId(roomId) {
        const rows = await (0, database_js_1.sql) `
      SELECT * FROM vision_meetings WHERE room_id = ${roomId}
    `;
        return rows[0] || null;
    },
    async joinMeeting(roomId, participantName) {
        const rows = await (0, database_js_1.sql) `
      UPDATE vision_meetings
      SET participants = CASE
        WHEN participants @> ${JSON.stringify([participantName])}::jsonb THEN participants
        ELSE participants || ${JSON.stringify([participantName])}::jsonb
      END
      WHERE room_id = ${roomId}
      RETURNING *
    `;
        return rows[0] || null;
    },
    async endMeeting(roomId, durationSeconds) {
        const rows = await (0, database_js_1.sql) `
      UPDATE vision_meetings
      SET status = 'ended', ended_at = NOW(), duration_seconds = ${durationSeconds || null}
      WHERE room_id = ${roomId}
      RETURNING *
    `;
        return rows[0] || null;
    },
    async deleteMeeting(roomId, userId) {
        const result = await (0, database_js_1.sql) `
      DELETE FROM vision_meetings
      WHERE room_id = ${roomId} AND created_by = ${userId}
    `;
        return result.count > 0;
    },
    async getScheduled(workspaceId) {
        const rows = await (0, database_js_1.sql) `
      SELECT * FROM vision_meetings
      WHERE workspace_id = ${workspaceId}
        AND status = 'scheduled'
        AND scheduled_at > NOW()
      ORDER BY scheduled_at ASC
      LIMIT 20
    `;
        return rows;
    }
};
//# sourceMappingURL=giri-vision.service.js.map