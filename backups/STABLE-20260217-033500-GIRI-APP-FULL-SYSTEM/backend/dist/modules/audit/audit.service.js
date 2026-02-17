"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.AuditService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class AuditService {
    // Journal Entries
    async createJournalEntry(userId, workspaceId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const entryDate = input.date ? new Date(input.date) : now;
        const entries = await (0, database_js_1.sql) `
      INSERT INTO journal_entries (
        id, user_id, workspace_id, date, content, mood, energy_level,
        sleep_quality, tags, highlights, challenges, gratitude, created_at, updated_at
      )
      VALUES (
        ${id}, ${userId}, ${workspaceId}, ${entryDate}, ${input.content},
        ${input.mood ?? 5}, ${input.energy_level ?? 5}, ${input.sleep_quality ?? 5},
        ${input.tags || []}, ${input.highlights || []}, ${input.challenges || []},
        ${input.gratitude || []}, ${now}, ${now}
      )
      RETURNING *
    `;
        return entries[0];
    }
    async getJournalEntry(entryId) {
        const entries = await (0, database_js_1.sql) `SELECT * FROM journal_entries WHERE id = ${entryId}`;
        if (entries.length === 0) {
            throw helpers_js_1.AppError.notFound('Journal entry');
        }
        return entries[0];
    }
    async getJournalEntries(userId, workspaceId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        let conditions = (0, database_js_1.sql) `user_id = ${userId} AND workspace_id = ${workspaceId}`;
        if (params.from) {
            conditions = (0, database_js_1.sql) `${conditions} AND date >= ${params.from}`;
        }
        if (params.to) {
            conditions = (0, database_js_1.sql) `${conditions} AND date <= ${params.to}`;
        }
        const entries = await (0, database_js_1.sql) `
      SELECT * FROM journal_entries
      WHERE ${conditions}
      ORDER BY date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM journal_entries
      WHERE ${conditions}
    `;
        return {
            entries: entries,
            total: countResult[0].count,
        };
    }
    async updateJournalEntry(entryId, input) {
        const updates = { updated_at: new Date() };
        if (input.content !== undefined)
            updates.content = input.content;
        if (input.mood !== undefined)
            updates.mood = input.mood;
        if (input.energy_level !== undefined)
            updates.energy_level = input.energy_level;
        if (input.sleep_quality !== undefined)
            updates.sleep_quality = input.sleep_quality;
        if (input.tags !== undefined)
            updates.tags = input.tags;
        if (input.highlights !== undefined)
            updates.highlights = input.highlights;
        if (input.challenges !== undefined)
            updates.challenges = input.challenges;
        if (input.gratitude !== undefined)
            updates.gratitude = input.gratitude;
        const fields = Object.keys(updates);
        const entries = await (0, database_js_1.sql) `
      UPDATE journal_entries
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${entryId}
      RETURNING *
    `;
        if (entries.length === 0) {
            throw helpers_js_1.AppError.notFound('Journal entry');
        }
        return entries[0];
    }
    async deleteJournalEntry(entryId) {
        await (0, database_js_1.sql) `DELETE FROM journal_entries WHERE id = ${entryId}`;
    }
    async getJournalStats(userId, workspaceId) {
        const stats = await (0, database_js_1.sql) `
      SELECT
        COUNT(*)::int as total_entries,
        ROUND(AVG(mood)::numeric, 2)::float as average_mood,
        ROUND(AVG(energy_level)::numeric, 2)::float as average_energy,
        ROUND(AVG(sleep_quality)::numeric, 2)::float as average_sleep
      FROM journal_entries
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
        // Get most used tags
        const tags = await (0, database_js_1.sql) `
      SELECT tag, COUNT(*)::int as count
      FROM journal_entries, unnest(tags) as tag
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `;
        // Calculate current streak
        const streakResult = await (0, database_js_1.sql) `
      WITH dates AS (
        SELECT DISTINCT date::date as entry_date
        FROM journal_entries
        WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        ORDER BY entry_date DESC
      ),
      numbered AS (
        SELECT entry_date, ROW_NUMBER() OVER (ORDER BY entry_date DESC) as rn
        FROM dates
      )
      SELECT COUNT(*) as streak
      FROM numbered
      WHERE entry_date = CURRENT_DATE - (rn - 1)::int
    `;
        return {
            total_entries: stats[0].total_entries || 0,
            average_mood: stats[0].average_mood || 0,
            average_energy: stats[0].average_energy || 0,
            average_sleep: stats[0].average_sleep || 0,
            current_streak: parseInt(streakResult[0]?.streak || '0'),
            most_used_tags: tags,
        };
    }
    // Human Design Profile
    async createHumanDesignProfile(userId, input) {
        const now = new Date();
        // Check if profile already exists
        const existing = await (0, database_js_1.sql) `SELECT user_id FROM human_design_profiles WHERE user_id = ${userId}`;
        if (existing.length > 0) {
            throw helpers_js_1.AppError.conflict('Human Design profile already exists');
        }
        const profiles = await (0, database_js_1.sql) `
      INSERT INTO human_design_profiles (
        user_id, type, authority, profile, definition, centers, channels,
        gates, incarnation_cross, variables, birth_data, created_at, updated_at
      )
      VALUES (
        ${userId}, ${input.type}, ${input.authority}, ${input.profile},
        ${input.definition}, ${JSON.stringify(input.centers)}, ${input.channels},
        ${input.gates}, ${input.incarnation_cross}, ${JSON.stringify(input.variables || {})},
        ${JSON.stringify(input.birth_data)}, ${now}, ${now}
      )
      RETURNING *
    `;
        return profiles[0];
    }
    async getHumanDesignProfile(userId) {
        const profiles = await (0, database_js_1.sql) `SELECT * FROM human_design_profiles WHERE user_id = ${userId}`;
        return profiles.length > 0 ? profiles[0] : null;
    }
    async updateHumanDesignProfile(userId, input) {
        const updates = { updated_at: new Date() };
        if (input.type !== undefined)
            updates.type = input.type;
        if (input.authority !== undefined)
            updates.authority = input.authority;
        if (input.profile !== undefined)
            updates.profile = input.profile;
        if (input.definition !== undefined)
            updates.definition = input.definition;
        if (input.centers !== undefined)
            updates.centers = JSON.stringify(input.centers);
        if (input.channels !== undefined)
            updates.channels = input.channels;
        if (input.gates !== undefined)
            updates.gates = input.gates;
        if (input.incarnation_cross !== undefined)
            updates.incarnation_cross = input.incarnation_cross;
        if (input.variables !== undefined)
            updates.variables = JSON.stringify(input.variables);
        if (input.birth_data !== undefined)
            updates.birth_data = JSON.stringify(input.birth_data);
        const fields = Object.keys(updates);
        const profiles = await (0, database_js_1.sql) `
      UPDATE human_design_profiles
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE user_id = ${userId}
      RETURNING *
    `;
        if (profiles.length === 0) {
            throw helpers_js_1.AppError.notFound('Human Design profile');
        }
        return profiles[0];
    }
    // Audit Reports
    async generateReport(userId, workspaceId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const reports = await (0, database_js_1.sql) `
      INSERT INTO audit_reports (
        id, user_id, workspace_id, report_type, period_start, period_end,
        status, created_at
      )
      VALUES (
        ${id}, ${userId}, ${workspaceId}, ${input.report_type},
        ${input.period_start}, ${input.period_end}, 'pending', ${now}
      )
      RETURNING *
    `;
        // In production, this would trigger an async job to generate the report
        // For now, we'll mark it as processing
        await (0, database_js_1.sql) `
      UPDATE audit_reports SET status = 'processing' WHERE id = ${id}
    `;
        return reports[0];
    }
    async getReport(reportId) {
        const reports = await (0, database_js_1.sql) `SELECT * FROM audit_reports WHERE id = ${reportId}`;
        if (reports.length === 0) {
            throw helpers_js_1.AppError.notFound('Report');
        }
        return reports[0];
    }
    async getReports(userId, workspaceId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const reports = await (0, database_js_1.sql) `
      SELECT * FROM audit_reports
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM audit_reports
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
        return {
            reports: reports,
            total: countResult[0].count,
        };
    }
    async deleteReport(reportId) {
        await (0, database_js_1.sql) `DELETE FROM audit_reports WHERE id = ${reportId}`;
    }
    // Psycho Audits
    async createPsychoAudit(userId, workspaceId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const audits = await (0, database_js_1.sql) `
      INSERT INTO psycho_audits (id, user_id, workspace_id, score, answers, recommendations, created_at)
      VALUES (${id}, ${userId}, ${workspaceId}, ${input.score}, ${database_js_1.sql.json(input.answers || [])}, ${database_js_1.sql.json(input.recommendations || [])}, ${now})
      RETURNING *
    `;
        return audits[0];
    }
    async listPsychoAudits(workspaceId) {
        const audits = await (0, database_js_1.sql) `
      SELECT id, score, answers, recommendations, created_at
      FROM psycho_audits
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC
      LIMIT 30
    `;
        return audits;
    }
}
exports.AuditService = AuditService;
exports.auditService = new AuditService();
//# sourceMappingURL=audit.service.js.map