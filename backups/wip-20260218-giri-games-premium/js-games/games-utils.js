/**
 * GIRI GAMES UTILS v1.0
 * Utilitaires partagés pour tous les jeux
 */
const GamesUtils = (function() {
    'use strict';

    // Mélange un tableau (Fisher-Yates)
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Formatte un temps en secondes en MM:SS
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Formatte un temps en millisecondes en MM:SS.mmm
    function formatTimeMs(ms) {
        const total = Math.floor(ms / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Clamp une valeur entre min et max
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // Génère un nombre aléatoire entier entre min et max (inclus)
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Génère un identifiant unique court
    function uid() {
        return Math.random().toString(36).slice(2, 9);
    }

    // Deep clone simple (JSON-safe)
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Calcule le score avec bonus temps
    function calcScore(base, timeSeconds, multiplier) {
        const timeBonus = Math.max(0, 10000 - timeSeconds * 10);
        return Math.floor((base + timeBonus) * (multiplier || 1));
    }

    // Crée un timer qui appelle cb chaque seconde, retourne { stop }
    function createTimer(cb) {
        let seconds = 0;
        const id = setInterval(() => { seconds++; cb(seconds); }, 1000);
        return { stop: () => clearInterval(id), get: () => seconds };
    }

    // Debounce
    function debounce(fn, delay) {
        let t;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    return { shuffle, formatTime, formatTimeMs, clamp, randInt, uid, deepClone, calcScore, createTimer, debounce };
})();
