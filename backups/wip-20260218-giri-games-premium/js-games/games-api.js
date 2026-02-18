/**
 * GIRI GAMES API v1.0
 * Appels API pour scores, sauvegardes, défis
 */
const GamesApi = (function() {
    'use strict';

    const BASE = '/api/v1/games';

    async function request(method, path, body) {
        const token = localStorage.getItem('productiveapp_token');
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        if (body) opts.body = JSON.stringify(body);
        try {
            const res = await fetch(BASE + path, opts);
            if (!res.ok) return null;
            const json = await res.json();
            return json.data || json;
        } catch(e) {
            console.warn('GamesApi error:', e);
            return null;
        }
    }

    async function saveScore(gameId, score, opts = {}) {
        return request('POST', '/scores', {
            gameId, score,
            metadata: opts.metadata || {},
            durationSeconds: opts.duration || 0,
            difficulty: opts.difficulty || 'normal',
            won: opts.won || false
        });
    }

    async function getMyScores(gameId) { return request('GET', `/scores/${gameId}`) || []; }
    async function getLeaderboard(gameId) { return request('GET', `/leaderboard/${gameId}`) || []; }
    async function getGlobalLeaderboard() { return request('GET', '/leaderboard/global') || []; }

    async function saveGame(gameId, state, saveName = 'Autosave') {
        return request('POST', '/save', { gameId, state, saveName });
    }

    async function loadGame(gameId) {
        const data = await request('GET', `/save/${gameId}`);
        return data ? data.state : null;
    }

    async function deleteSave(gameId) { return request('DELETE', `/save/${gameId}`); }
    async function getMyStats() { return request('GET', '/stats') || []; }

    return { saveScore, getMyScores, getLeaderboard, getGlobalLeaderboard, saveGame, loadGame, deleteSave, getMyStats };
})();
