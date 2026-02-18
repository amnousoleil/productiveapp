/**
 * GIRI GAMES ACHIEVEMENTS v2.0 — Succès enrichis + GIRIS rewards + hooks gamification
 */
const GamesAchievements = (function() {
    'use strict';

    const ACHIEVEMENTS = {
        // Généraux
        first_game:    { id: 'first_game',     icon: '🏁', title: 'Premier pas',          desc: 'Jouer sa première partie',                          giris: 50 },
        streak7:       { id: 'streak7',        icon: '🔥', title: 'En feu',                desc: 'Jouer 7 jours de suite',                            giris: 200 },
        streak30:      { id: 'streak30',       icon: '💪', title: 'Indestructible',        desc: 'Jouer 30 jours de suite',                           giris: 1000 },
        champion:      { id: 'champion',       icon: '🏆', title: 'Champion',              desc: 'Être #1 au classement d\'un jeu',                   giris: 500 },
        centurion:     { id: 'centurion',      icon: '💯', title: 'Centurion',             desc: 'Jouer 100 parties au total',                        giris: 300 },
        // TypeRace
        speed_demon:   { id: 'speed_demon',    icon: '⚡', title: 'Speed Demon',           desc: 'Dépasser 100 WPM au TypeRace',                      giris: 300 },
        typerace_60wpm:{ id: 'typerace_60wpm', icon: '⌨️', title: 'Dactylographe',         desc: 'Atteindre 60 WPM au TypeRace',                      giris: 100 },
        // Échecs
        chess_master:  { id: 'chess_master',   icon: '♟️', title: 'Maître des Échecs',     desc: 'Gagner 10 parties d\'échecs',                       giris: 400 },
        chess_win:     { id: 'chess_win',      icon: '♟️', title: 'Échec et Mat',          desc: 'Gagner sa première partie d\'échecs',               giris: 150 },
        // Sudoku
        sudoku_expert: { id: 'sudoku_expert',  icon: '🧠', title: 'Cerveau d\'Acier',      desc: 'Compléter un Sudoku Expert',                        giris: 300 },
        // Mines
        mines_pro:     { id: 'mines_pro',      icon: '💣', title: 'Démineur Pro',          desc: 'Compléter Expert sans erreur',                      giris: 400 },
        // Memory
        memory_perfect:{ id: 'memory_perfect', icon: '🎯', title: 'Mémoire Parfaite',      desc: 'Gagner en 6×6 avec moins de 20 coups',              giris: 250 },
        // Snake
        snake_legend:  { id: 'snake_legend',   icon: '🐍', title: 'Serpent Légendaire',    desc: 'Dépasser 100 pts au Snake',                         giris: 200 },
        // Blocks
        blocks_master: { id: 'blocks_master',  icon: '🧱', title: 'Architecte',            desc: 'Dépasser 50 000 pts aux Blocs',                     giris: 350 },
        // Gimots (Wordle)
        gimots_win:    { id: 'gimots_win',     icon: '🔤', title: 'Linguiste',             desc: 'Trouver le mot du jour dans GIMOTS',                giris: 100 },
        gimots_genius: { id: 'gimots_genius',  icon: '🧠', title: 'Génie des Mots',        desc: 'Trouver le mot en 1 essai dans GIMOTS',             giris: 500 },
        gimots_7days:  { id: 'gimots_7days',   icon: '📅', title: '7 Jours de Suite',      desc: 'Jouer GIMOTS 7 jours consécutifs',                  giris: 300 },
        // GIRIS milestones
        giris_1000:    { id: 'giris_1000',     icon: '💰', title: 'Millionnaire GIRIS',    desc: 'Accumuler 1 000 GIRIS',                             giris: 100 },
        giris_10000:   { id: 'giris_10000',    icon: '💎', title: 'Grand Argentier',       desc: 'Accumuler 10 000 GIRIS',                            giris: 500 },
        giris_50000:   { id: 'giris_50000',    icon: '👑', title: 'Trésorier Légendaire',  desc: 'Accumuler 50 000 GIRIS',                            giris: 2000 },
    };

    function unlock(id) {
        const ach = ACHIEVEMENTS[id];
        if (!ach) return;
        const isNew = typeof GamesState !== 'undefined' && GamesState.addAchievement(id);
        if (!isNew) return;
        // Récompense GIRIS
        if (ach.giris && typeof GamesState !== 'undefined') {
            GamesState.addGiris(ach.giris);
        }
        showNotification(ach);
        // Hook vers gamification principale
        if (typeof XpFeedback !== 'undefined') {
            XpFeedback.trigger('achievement_unlocked', { name: ach.title });
        }
        // Vérifier milestones GIRIS
        if (typeof GamesState !== 'undefined') {
            const giris = GamesState.getGiris();
            if (giris >= 50000 && id !== 'giris_50000') unlock('giris_50000');
            else if (giris >= 10000 && id !== 'giris_10000') unlock('giris_10000');
            else if (giris >= 1000 && id !== 'giris_1000') unlock('giris_1000');
        }
    }

    function showNotification(ach) {
        const el = document.createElement('div');
        el.className = 'games-achievement-popup';
        el.innerHTML = `
            <span class="ach-icon">${ach.icon}</span>
            <div class="ach-info">
                <div class="ach-title">Succès débloqué !</div>
                <div class="ach-name">${ach.title}</div>
                ${ach.giris ? `<div style="font-size:12px;color:#f59e0b;font-weight:700">+${ach.giris} GIRIS</div>` : ''}
            </div>`;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('show'), 100);
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4000);
    }

    function checkGirisAchievements() {
        if (typeof GamesState === 'undefined') return;
        const giris = GamesState.getGiris();
        if (giris >= 1000)  unlock('giris_1000');
        if (giris >= 10000) unlock('giris_10000');
        if (giris >= 50000) unlock('giris_50000');
    }

    function getAll() { return Object.values(ACHIEVEMENTS); }
    function getUnlocked() {
        return typeof GamesState !== 'undefined' ? (GamesState.getStats().achievements || []) : [];
    }

    return { unlock, getAll, getUnlocked, checkGirisAchievements };
})();
