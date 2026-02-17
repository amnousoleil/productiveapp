"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const pool_js_1 = __importDefault(require("../accounting/pool.js"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// POST /api/v1/games/scores - Save a score
router.post('/scores', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId, score, difficulty, won, durationSeconds, metadata } = req.body;
        if (!gameId || score === undefined) {
            return res.status(400).json({ error: 'gameId and score are required' });
        }
        const result = await pool_js_1.default.query(`INSERT INTO game_scores (user_id, game_id, score, difficulty, won, duration_seconds, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, game_id, score, created_at`, [userId, gameId, score, difficulty || 'normal', won || false, durationSeconds || 0, metadata || {}]);
        res.json({ data: result.rows[0] });
    }
    catch (e) {
        console.error('[Games] Save score error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/v1/games/scores/:gameId - Get my scores for a game
router.get('/scores/:gameId', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId } = req.params;
        const result = await pool_js_1.default.query(`SELECT id, game_id, score, difficulty, won, duration_seconds, created_at
             FROM game_scores WHERE user_id = $1 AND game_id = $2
             ORDER BY score DESC LIMIT 20`, [userId, gameId]);
        res.json({ data: result.rows });
    }
    catch (e) {
        console.error('[Games] Get scores error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/v1/games/leaderboard/:gameId - Leaderboard for a specific game
router.get('/leaderboard/:gameId', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId } = req.params;
        if (gameId === 'global') {
            // Global leaderboard
            const result = await pool_js_1.default.query(`SELECT user_id, display_name, total_score, games_played, last_played
                 FROM game_leaderboard_global LIMIT 20`);
            return res.json({ data: result.rows });
        }
        // Per-game leaderboard (best score per user)
        const result = await pool_js_1.default.query(`SELECT
                gs.user_id,
                COALESCE(u.name, u.email) AS display_name,
                MAX(gs.score) AS best_score,
                COUNT(gs.id) AS games_played
             FROM game_scores gs
             JOIN users u ON u.id = gs.user_id
             WHERE gs.game_id = $1
             GROUP BY gs.user_id, u.name, u.email
             ORDER BY best_score DESC
             LIMIT 20`, [gameId]);
        res.json({ data: result.rows });
    }
    catch (e) {
        console.error('[Games] Leaderboard error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/v1/games/save - Save game state
router.post('/save', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId, state, saveName } = req.body;
        if (!gameId || !state) {
            return res.status(400).json({ error: 'gameId and state are required' });
        }
        const result = await pool_js_1.default.query(`INSERT INTO game_saves (user_id, game_id, save_name, state)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, game_id)
             DO UPDATE SET state = $4, save_name = $3, updated_at = NOW()
             RETURNING id, game_id, save_name, updated_at`, [userId, gameId, saveName || 'Autosave', state]);
        res.json({ data: result.rows[0] });
    }
    catch (e) {
        console.error('[Games] Save game error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/v1/games/save/:gameId - Load game state
router.get('/save/:gameId', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId } = req.params;
        const result = await pool_js_1.default.query(`SELECT id, game_id, save_name, state, updated_at
             FROM game_saves WHERE user_id = $1 AND game_id = $2`, [userId, gameId]);
        if (!result.rows.length)
            return res.status(404).json({ error: 'No save found' });
        res.json({ data: result.rows[0] });
    }
    catch (e) {
        console.error('[Games] Load game error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/v1/games/save/:gameId - Delete save
router.delete('/save/:gameId', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { gameId } = req.params;
        await pool_js_1.default.query(`DELETE FROM game_saves WHERE user_id = $1 AND game_id = $2`, [userId, gameId]);
        res.json({ data: { deleted: true } });
    }
    catch (e) {
        console.error('[Games] Delete save error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/v1/games/stats - Get my global stats
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const result = await pool_js_1.default.query(`SELECT
                game_id,
                MAX(score) AS best_score,
                COUNT(id) AS games_played,
                SUM(score) AS total_score
             FROM game_scores
             WHERE user_id = $1
             GROUP BY game_id`, [userId]);
        res.json({ data: result.rows });
    }
    catch (e) {
        console.error('[Games] Stats error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=games.routes.js.map