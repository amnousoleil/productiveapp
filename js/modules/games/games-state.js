/**
 * GIRI GAMES STATE v2.0 — avec système GIRIS (monnaie)
 */
const GamesState = (function() {
    'use strict';

    const KEY = 'productiveapp_games_state_v2';
    let state = {
        currentGame: null,
        scores: {},
        achievements: [],
        streak: 0,
        totalPoints: 0,
        giris: 0,            // Monnaie GIRIS
        girisByGame: {},     // Giris gagnés par jeu
        lastPlayed: null,
        lastDaily: null,     // Date du dernier défi quotidien
        totalGames: 0,
        wins: 0,
        avatar: '🎮',
        title: 'Novice',
        playerName: null
    };

    function load() {
        try {
            const s = localStorage.getItem(KEY);
            if (s) Object.assign(state, JSON.parse(s));
            // Migration depuis v1
            const old = localStorage.getItem('productiveapp_games_state');
            if (old && !s) {
                const o = JSON.parse(old);
                state.scores = o.scores || {};
                state.achievements = o.achievements || [];
                state.streak = o.streak || 0;
                state.totalPoints = o.totalPoints || 0;
                state.giris = Math.floor((o.totalPoints || 0) / 5);
                save();
            }
        } catch(e) {}
    }

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
    }

    function setCurrentGame(id) {
        state.currentGame = id;
        state.lastPlayed = Date.now();
        state.totalGames++;
        save();
    }

    function clearCurrentGame() { state.currentGame = null; }

    function addScore(gameId, score, won) {
        if (!state.scores[gameId]) state.scores[gameId] = { best: 0, last: 0, count: 0, wins: 0 };
        const isNewRecord = score > state.scores[gameId].best;
        if (isNewRecord) state.scores[gameId].best = score;
        state.scores[gameId].last = score;
        state.scores[gameId].count++;
        if (won) { state.scores[gameId].wins++; state.wins++; }
        state.totalPoints += Math.floor(score / 10);
        // Calcul Giris : score / 10, bonus record x2
        const earned = Math.max(5, Math.floor(score / 50));
        const girisEarned = isNewRecord ? earned * 2 : earned;
        state.giris += girisEarned;
        if (!state.girisByGame[gameId]) state.girisByGame[gameId] = 0;
        state.girisByGame[gameId] += girisEarned;
        updateTitle();
        save();
        return { girisEarned, isNewRecord };
    }

    function addGiris(amount) {
        state.giris += amount;
        updateTitle();
        save();
        return state.giris;
    }

    function getBestScore(gameId) { return state.scores[gameId]?.best || 0; }
    function getGiris() { return state.giris || 0; }
    function getStats() { return { ...state }; }

    function updateTitle() {
        const g = state.giris;
        if (g >= 100000) state.title = 'Transcendant';
        else if (g >= 50000) state.title = 'Légende';
        else if (g >= 20000) state.title = 'Maître';
        else if (g >= 8000)  state.title = 'Expert';
        else if (g >= 3000)  state.title = 'Confirmé';
        else if (g >= 1000)  state.title = 'Apprenti';
        else if (g >= 200)   state.title = 'Débutant';
        else                 state.title = 'Novice';
    }

    function addAchievement(id) {
        if (!state.achievements.includes(id)) {
            state.achievements.push(id);
            save();
            return true;
        }
        return false;
    }

    function checkDailyStreak() {
        const today = new Date().toISOString().slice(0, 10);
        if (state.lastDaily === today) return false; // Déjà fait
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (state.lastDaily === yesterday) {
            state.streak++;
        } else if (state.lastDaily && state.lastDaily !== today) {
            state.streak = 1; // Reset streak
        } else {
            state.streak = (state.streak || 0) + 1;
        }
        state.lastDaily = today;
        // Bonus daily : 50 Giris + 10 par jour de streak (max 200)
        const bonus = Math.min(200, 50 + state.streak * 10);
        state.giris += bonus;
        updateTitle();
        save();
        return bonus;
    }

    function setAvatar(emoji) { state.avatar = emoji; save(); }
    function setPlayerName(name) { state.playerName = name; save(); }

    load();
    return {
        setCurrentGame, clearCurrentGame, addScore, addGiris,
        getBestScore, getGiris, getStats, addAchievement,
        checkDailyStreak, setAvatar, setPlayerName
    };
})();
