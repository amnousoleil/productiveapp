/**
 * GIRI GAMES MAIN v1.0
 * Orchestrateur de la section jeux
 */
const GiriGames = (function() {
    'use strict';

    const GAMES = [
        { id: 'g2048',    name: 'Giri 2048',     icon: '🔢', category: 'rapide',    desc: 'Fusionnez les tuiles jusqu\'à 2048' },
        { id: 'sudoku',   name: 'Giri Sudoku',    icon: '🧩', category: 'reflexion', desc: 'Remplissez la grille 9×9' },
        { id: 'mines',    name: 'Giri Mines',     icon: '💣', category: 'reflexion', desc: 'Trouvez toutes les mines' },
        { id: 'memory',   name: 'Giri Memory',    icon: '🃏', category: 'reflexion', desc: 'Retrouvez les paires de cartes' },
        { id: 'snake',    name: 'Giri Snake',     icon: '🐍', category: 'rapide',    desc: 'Guidez le serpent sans tomber' },
        { id: 'tetris',   name: 'Giri Blocks',    icon: '🧱', category: 'rapide',    desc: 'Empilez les blocs qui tombent' },
        { id: 'chess',    name: 'Giri Chess',     icon: '♟️', category: 'strategie', desc: 'Échecs contre l\'IA' },
        { id: 'typerace', name: 'Giri TypeRace',  icon: '⌨️', category: 'rapide',    desc: 'Tapez le plus vite possible' }
    ];

    const CATEGORIES = { strategie: 'Jeux de Stratégie', reflexion: 'Jeux de Réflexion', rapide: 'Jeux Rapides' };

    let currentGame = null;

    function getContainer() { return document.getElementById('view-games'); }

    function init() { showHome(); }

    function showHome() {
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const name = user ? (user.firstName || user.name || 'Joueur').split(' ')[0] : 'Joueur';
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const totalGames = Object.values(stats.scores || {}).reduce((a, s) => a + (s.count || 0), 0);

        container.innerHTML = `
            <div class="games-home">
                <div class="games-header">
                    <h1>🎮 Giri Games</h1>
                    <div class="games-header-actions">
                        <button class="games-btn" onclick="GiriGames.showLeaderboard()">🏆 Classement</button>
                        <button class="games-btn" onclick="GiriGames.showAchievements()">🎯 Succès</button>
                    </div>
                </div>
                <div class="games-player-bar">
                    <div class="games-player-greeting">Bonjour <strong>${name}</strong> ! Prêt pour une pause productive ?</div>
                    <div class="games-player-stats">
                        <div class="games-stat-badge">🔥 Streak <span class="stat-val">${stats.streak || 0} jours</span></div>
                        <div class="games-stat-badge">⭐ Points <span class="stat-val">${(stats.totalPoints || 0).toLocaleString('fr-FR')}</span></div>
                        <div class="games-stat-badge">🎮 Parties <span class="stat-val">${totalGames}</span></div>
                    </div>
                </div>
                ${renderCategories()}
                <div class="games-activity">
                    <div class="games-activity-title">Dernière activité</div>
                    ${renderActivity(stats)}
                </div>
            </div>
        `;

        // Staggered animation
        container.querySelectorAll('.game-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 40}ms`;
        });
    }

    function renderCategories() {
        return Object.entries(CATEGORIES).map(([catId, catName]) => {
            const games = GAMES.filter(g => g.category === catId);
            return `
                <div class="games-category">
                    <div class="games-category-title">── ${catName} ──</div>
                    <div class="games-grid">
                        ${games.map(g => renderGameCard(g)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderGameCard(game) {
        const best = typeof GamesState !== 'undefined' ? GamesState.getBestScore(game.id) : 0;
        return `
            <div class="game-card" onclick="GiriGames.openGame('${game.id}')" title="${game.desc}">
                <div class="game-icon">${game.icon}</div>
                <div class="game-name">${game.name}</div>
                ${best > 0 ? `<div class="game-best-score">Meilleur: ${best.toLocaleString('fr-FR')}</div>` : ''}
            </div>
        `;
    }

    function renderActivity(stats) {
        if (!stats.lastPlayed) return '<div class="activity-row"><div class="activity-text">Aucune activité — commence à jouer !</div></div>';
        const played = Object.entries(stats.scores || {}).filter(([, s]) => s.count > 0);
        if (!played.length) return '<div class="activity-row"><div class="activity-text">Aucune activité — commence à jouer !</div></div>';
        return played.slice(0, 3).map(([gameId, sc]) => {
            const game = GAMES.find(g => g.id === gameId);
            if (!game) return '';
            return `<div class="activity-row"><span>${game.icon}</span><div class="activity-text">${game.name} — Meilleur: <strong>${sc.best.toLocaleString('fr-FR')}</strong></div><div class="activity-time">${sc.count} partie${sc.count > 1 ? 's' : ''}</div></div>`;
        }).join('');
    }

    function openGame(gameId) {
        const game = GAMES.find(g => g.id === gameId);
        if (!game) return;
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        container.innerHTML = `
            <div class="game-container">
                <div class="game-topbar">
                    <button class="game-back-btn" onclick="GiriGames.showHome()">← Retour</button>
                    <div class="game-title">${game.icon} ${game.name}</div>
                </div>
                <div class="game-play-area" id="game-play-area"></div>
            </div>
        `;

        currentGame = game;
        if (typeof GamesState !== 'undefined') GamesState.setCurrentGame(gameId);
        if (typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('first_game');

        const playArea = document.getElementById('game-play-area');
        if (!playArea) return;

        try {
            if (gameId === 'g2048' && typeof G2048Game !== 'undefined') G2048Game.mount(playArea);
            else if (gameId === 'sudoku' && typeof SudokuGame !== 'undefined') SudokuGame.mount(playArea);
            else if (gameId === 'mines' && typeof MinesGame !== 'undefined') MinesGame.mount(playArea);
            else if (gameId === 'memory' && typeof MemoryGame !== 'undefined') MemoryGame.mount(playArea);
            else if (gameId === 'snake' && typeof SnakeGame !== 'undefined') SnakeGame.mount(playArea);
            else if (gameId === 'tetris' && typeof TetrisGame !== 'undefined') TetrisGame.mount(playArea);
            else if (gameId === 'chess' && typeof ChessGame !== 'undefined') ChessGame.mount(playArea);
            else if (gameId === 'typerace' && typeof TypeRaceGame !== 'undefined') TypeRaceGame.mount(playArea);
            else {
                playArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-secondary);"><div style="font-size:64px;margin-bottom:16px">${game.icon}</div><h2 style="color:var(--text-primary)">${game.name}</h2><p>Chargement du jeu...</p></div>`;
            }
        } catch(e) {
            console.error('Erreur chargement jeu:', e);
            playArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-secondary);"><p>Erreur lors du chargement du jeu.</p><button class="games-btn" onclick="GiriGames.showHome()" style="margin-top:16px">← Retour</button></div>`;
        }
    }

    function stopCurrentGame() {
        if (!currentGame) return;
        try {
            const id = currentGame.id;
            if (id === 'g2048' && typeof G2048Game !== 'undefined') G2048Game.unmount();
            else if (id === 'sudoku' && typeof SudokuGame !== 'undefined') SudokuGame.unmount();
            else if (id === 'mines' && typeof MinesGame !== 'undefined') MinesGame.unmount();
            else if (id === 'memory' && typeof MemoryGame !== 'undefined') MemoryGame.unmount();
            else if (id === 'snake' && typeof SnakeGame !== 'undefined') SnakeGame.unmount();
            else if (id === 'tetris' && typeof TetrisGame !== 'undefined') TetrisGame.unmount();
            else if (id === 'chess' && typeof ChessGame !== 'undefined') ChessGame.unmount();
            else if (id === 'typerace' && typeof TypeRaceGame !== 'undefined') TypeRaceGame.unmount();
        } catch(e) {}
        currentGame = null;
        if (typeof GamesState !== 'undefined') GamesState.clearCurrentGame();
    }

    async function showLeaderboard() {
        const modal = createModal('🏆 Classement Global', '<div style="text-align:center;padding:20px;color:var(--text-secondary)">Chargement...</div>');
        const box = modal.querySelector('.games-modal-box');
        try {
            const data = typeof GamesApi !== 'undefined' ? await GamesApi.getGlobalLeaderboard() : [];
            const content = box.querySelector('div[style*="Chargement"]');
            if (content) content.remove();
            if (!data || !data.length) {
                box.innerHTML += '<p style="text-align:center;color:var(--text-secondary);padding:20px">Aucun score pour l\'instant — soyez le premier !</p>';
            } else {
                const html = data.slice(0, 10).map((row, i) => `
                    <div class="leaderboard-row">
                        <div class="lb-rank ${i===0?'top1':i===1?'top2':i===2?'top3':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
                        <div class="lb-name">${row.user_id || 'Joueur'}</div>
                        <div class="lb-score">${parseInt(row.total_score||0).toLocaleString('fr-FR')} pts</div>
                        <div style="font-size:12px;color:var(--text-secondary)">${row.games_played || 0} parties</div>
                    </div>
                `).join('');
                box.innerHTML += html;
            }
        } catch(e) {
            box.innerHTML += '<p style="text-align:center;color:var(--text-secondary)">Données non disponibles</p>';
        }
    }

    function showAchievements() {
        const all = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getAll() : [];
        const unlocked = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getUnlocked() : [];
        const html = all.map(a => {
            const done = unlocked.includes(a.id);
            return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color);opacity:${done?1:.4}"><span style="font-size:28px">${a.icon}</span><div><div style="font-weight:600;color:var(--text-primary)">${a.title}</div><div style="font-size:12px;color:var(--text-secondary)">${a.desc}</div></div>${done?'<span style="margin-left:auto;color:#22c55e;font-weight:700">✓</span>':''}</div>`;
        }).join('');
        createModal(`🎯 Succès (${unlocked.length}/${all.length})`, html);
    }

    function createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'games-modal';
        modal.innerHTML = `<div class="games-modal-box"><div class="games-modal-title">${title}<span class="games-modal-close" onclick="this.closest('.games-modal').remove()">✕</span></div>${content}</div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        return modal;
    }

    function refresh() { init(); }

    return { init, showHome, openGame, showLeaderboard, showAchievements, refresh };
})();
