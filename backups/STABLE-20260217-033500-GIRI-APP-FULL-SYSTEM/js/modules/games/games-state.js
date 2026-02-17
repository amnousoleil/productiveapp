/**
 * GIRI GAMES STATE v1.0
 */
const GamesState = (function() {
    'use strict';

    const KEY = 'productiveapp_games_state';
    let state = { currentGame: null, scores: {}, achievements: [], streak: 0, totalPoints: 0, lastPlayed: null };

    function load() {
        try { const s = localStorage.getItem(KEY); if (s) Object.assign(state, JSON.parse(s)); } catch(e) {}
    }

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
    }

    function setCurrentGame(id) { state.currentGame = id; state.lastPlayed = Date.now(); save(); }
    function clearCurrentGame() { state.currentGame = null; }

    function addScore(gameId, score) {
        if (!state.scores[gameId]) state.scores[gameId] = { best: 0, last: 0, count: 0 };
        if (score > state.scores[gameId].best) state.scores[gameId].best = score;
        state.scores[gameId].last = score;
        state.scores[gameId].count++;
        state.totalPoints += Math.floor(score / 10);
        save();
    }

    function getBestScore(gameId) { return state.scores[gameId]?.best || 0; }
    function getStats() { return { ...state }; }

    function addAchievement(id) {
        if (!state.achievements.includes(id)) { state.achievements.push(id); save(); return true; }
        return false;
    }

    load();
    return { setCurrentGame, clearCurrentGame, addScore, getBestScore, getStats, addAchievement };
})();
