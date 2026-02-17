"use strict";
/**
 * Behavioral Signals Service
 * Records user behavioral signals for analytics
 * ProductiveApp v4.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSignal = recordSignal;
exports.recordSignalAsync = recordSignalAsync;
exports.getSignals = getSignals;
exports.deleteSignal = deleteSignal;
exports.getSignalStats = getSignalStats;
exports.getProfile = getProfile;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
async function recordSignal(userId, workspaceId, signalType, sourceModule, sourceId, payload = {}, occurredAt) {
    const id = (0, helpers_js_1.generateUUID)();
    const timestamp = occurredAt || new Date();
    const result = await (0, database_js_1.sql) `
    INSERT INTO behavioral_signals (id, user_id, workspace_id, signal_type, source_module, source_id, payload, created_at)
    VALUES (${id}, ${userId}, ${workspaceId}, ${signalType}, ${sourceModule}, ${sourceId}, ${JSON.stringify(payload)}, ${timestamp})
    RETURNING *
  `;
    return result[0];
}
/**
 * Fire-and-forget signal recording - never blocks main flow
 */
function recordSignalAsync(userId, workspaceId, signalType, sourceModule, sourceId, payload = {}) {
    recordSignal(userId, workspaceId, signalType, sourceModule, sourceId, payload).catch((error) => {
        console.error('⚠️ Failed to record signal:', signalType, error instanceof Error ? error.message : error);
    });
}
async function getSignals(userId, filters = {}) {
    const limit = filters.limit || 100;
    let result;
    if (filters.type && filters.source) {
        result = await (0, database_js_1.sql) `
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND signal_type = ${filters.type} AND source_module = ${filters.source}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    }
    else if (filters.type) {
        result = await (0, database_js_1.sql) `
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND signal_type = ${filters.type}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    }
    else if (filters.source) {
        result = await (0, database_js_1.sql) `
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId} AND source_module = ${filters.source}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    }
    else {
        result = await (0, database_js_1.sql) `
      SELECT * FROM behavioral_signals
      WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    }
    return result;
}
async function deleteSignal(signalId, userId) {
    const result = await (0, database_js_1.sql) `
    DELETE FROM behavioral_signals WHERE id = ${signalId} AND user_id = ${userId}
  `;
    return result.count > 0;
}
async function getSignalStats(userId) {
    const [totalResult, byTypeResult, bySourceResult, recentResult] = await Promise.all([
        (0, database_js_1.sql) `SELECT COUNT(*) as total FROM behavioral_signals WHERE user_id = ${userId}`,
        (0, database_js_1.sql) `SELECT signal_type, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} GROUP BY signal_type`,
        (0, database_js_1.sql) `SELECT source_module, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} GROUP BY source_module`,
        (0, database_js_1.sql) `SELECT DATE(created_at) as date, COUNT(*) as count FROM behavioral_signals WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date DESC`
    ]);
    const signals_by_type = {};
    for (const row of byTypeResult) {
        signals_by_type[row.signal_type] = Number(row.count);
    }
    const signals_by_source = {};
    for (const row of bySourceResult) {
        signals_by_source[row.source_module] = Number(row.count);
    }
    const recent_activity = recentResult.map(row => ({
        date: String(row.date),
        count: Number(row.count)
    }));
    return {
        total_signals: Number(totalResult[0]?.total || 0),
        signals_by_type,
        signals_by_source,
        recent_activity
    };
}
async function getProfile(userId) {
    const result = await (0, database_js_1.sql) `
    SELECT
      user_id,
      COUNT(*) as total_signals,
      MIN(created_at) as first_signal_at,
      MAX(created_at) as last_signal_at,
      MODE() WITHIN GROUP (ORDER BY source_module) as most_active_module,
      MODE() WITHIN GROUP (ORDER BY signal_type) as most_common_signal
    FROM behavioral_signals
    WHERE user_id = ${userId}
    GROUP BY user_id
  `;
    if (result.length === 0) {
        return null;
    }
    const row = result[0];
    return {
        user_id: row.user_id,
        total_signals: Number(row.total_signals),
        first_signal_at: row.first_signal_at,
        last_signal_at: row.last_signal_at,
        most_active_module: row.most_active_module,
        most_common_signal: row.most_common_signal
    };
}
//# sourceMappingURL=signals.service.js.map