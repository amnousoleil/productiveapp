/**
 * GIRI GAMES ACHIEVEMENTS v1.0
 */
const GamesAchievements = (function() {
    'use strict';

    const ACHIEVEMENTS = {
        first_game:    { id: 'first_game',    icon: '🏁', title: 'Premier pas',         desc: 'Jouer sa première partie' },
        chess_master:  { id: 'chess_master',  icon: '♟️', title: 'Maître des échecs',    desc: 'Gagner 10 parties d\'échecs' },
        sudoku_expert: { id: 'sudoku_expert', icon: '🧠', title: 'Cerveau d\'acier',     desc: 'Compléter un Sudoku Expert' },
        mines_pro:     { id: 'mines_pro',     icon: '💣', title: 'Démineur pro',         desc: 'Compléter Expert sans erreur' },
        streak7:       { id: 'streak7',       icon: '🔥', title: 'En feu',               desc: 'Streak de 7 jours' },
        champion:      { id: 'champion',      icon: '🏆', title: 'Champion',             desc: 'Être #1 au classement d\'un jeu' },
        memory_perfect:{ id: 'memory_perfect',icon: '🎯', title: 'Perfectionniste',      desc: 'Score parfait au Memory' },
        speed_demon:   { id: 'speed_demon',   icon: '⚡', title: 'Speed demon',          desc: '>100 WPM au TypeRace' },
        blocks_master: { id: 'blocks_master', icon: '🧱', title: 'Architecte',           desc: 'Score >50,000 au Giri Blocks' },
        snake_legend:  { id: 'snake_legend',  icon: '🐍', title: 'Serpent légendaire',   desc: 'Score >100 au Snake' }
    };

    function unlock(id) {
        const ach = ACHIEVEMENTS[id];
        if (!ach) return;
        const isNew = typeof GamesState !== 'undefined' && GamesState.addAchievement(id);
        if (isNew) showNotification(ach);
    }

    function showNotification(ach) {
        const el = document.createElement('div');
        el.className = 'games-achievement-popup';
        el.innerHTML = `<span class="ach-icon">${ach.icon}</span><div class="ach-info"><div class="ach-title">Succès débloqué !</div><div class="ach-name">${ach.title}</div></div>`;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('show'), 100);
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3500);
    }

    function getAll() { return Object.values(ACHIEVEMENTS); }
    function getUnlocked() { return typeof GamesState !== 'undefined' ? (GamesState.getStats().achievements || []) : []; }

    return { unlock, getAll, getUnlocked };
})();
