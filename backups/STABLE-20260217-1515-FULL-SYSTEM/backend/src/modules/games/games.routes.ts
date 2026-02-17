import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import pool from '../accounting/pool.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/v1/games/scores - Save a score
router.post('/scores', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId, score, difficulty, won, durationSeconds, metadata } = req.body;
        if (!gameId || score === undefined) {
            return res.status(400).json({ error: 'gameId and score are required' });
        }

        const result = await pool.query(
            `INSERT INTO game_scores (user_id, game_id, score, difficulty, won, duration_seconds, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, game_id, score, created_at`,
            [userId, gameId, score, difficulty || 'normal', won || false, durationSeconds || 0, metadata || {}]
        );

        res.json({ data: result.rows[0] });
    } catch (e: any) {
        console.error('[Games] Save score error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/games/scores/:gameId - Get my scores for a game
router.get('/scores/:gameId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId } = req.params;
        const result = await pool.query(
            `SELECT id, game_id, score, difficulty, won, duration_seconds, created_at
             FROM game_scores WHERE user_id = $1 AND game_id = $2
             ORDER BY score DESC LIMIT 20`,
            [userId, gameId]
        );

        res.json({ data: result.rows });
    } catch (e: any) {
        console.error('[Games] Get scores error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/games/leaderboard/:gameId - Leaderboard for a specific game
router.get('/leaderboard/:gameId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId } = req.params;

        if (gameId === 'global') {
            // Global leaderboard
            const result = await pool.query(
                `SELECT user_id, display_name, total_score, games_played, last_played
                 FROM game_leaderboard_global LIMIT 20`
            );
            return res.json({ data: result.rows });
        }

        // Per-game leaderboard (best score per user)
        const result = await pool.query(
            `SELECT
                gs.user_id,
                COALESCE(u.name, u.email) AS display_name,
                MAX(gs.score) AS best_score,
                COUNT(gs.id) AS games_played
             FROM game_scores gs
             JOIN users u ON u.id = gs.user_id
             WHERE gs.game_id = $1
             GROUP BY gs.user_id, u.name, u.email
             ORDER BY best_score DESC
             LIMIT 20`,
            [gameId]
        );

        res.json({ data: result.rows });
    } catch (e: any) {
        console.error('[Games] Leaderboard error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/v1/games/save - Save game state
router.post('/save', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId, state, saveName } = req.body;
        if (!gameId || !state) {
            return res.status(400).json({ error: 'gameId and state are required' });
        }

        const result = await pool.query(
            `INSERT INTO game_saves (user_id, game_id, save_name, state)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, game_id)
             DO UPDATE SET state = $4, save_name = $3, updated_at = NOW()
             RETURNING id, game_id, save_name, updated_at`,
            [userId, gameId, saveName || 'Autosave', state]
        );

        res.json({ data: result.rows[0] });
    } catch (e: any) {
        console.error('[Games] Save game error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/games/save/:gameId - Load game state
router.get('/save/:gameId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId } = req.params;
        const result = await pool.query(
            `SELECT id, game_id, save_name, state, updated_at
             FROM game_saves WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'No save found' });
        res.json({ data: result.rows[0] });
    } catch (e: any) {
        console.error('[Games] Load game error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/v1/games/save/:gameId - Delete save
router.delete('/save/:gameId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { gameId } = req.params;
        await pool.query(
            `DELETE FROM game_saves WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId]
        );

        res.json({ data: { deleted: true } });
    } catch (e: any) {
        console.error('[Games] Delete save error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/games/stats - Get my global stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await pool.query(
            `SELECT
                game_id,
                MAX(score) AS best_score,
                COUNT(id) AS games_played,
                SUM(score) AS total_score
             FROM game_scores
             WHERE user_id = $1
             GROUP BY game_id`,
            [userId]
        );

        res.json({ data: result.rows });
    } catch (e: any) {
        console.error('[Games] Stats error:', e.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
