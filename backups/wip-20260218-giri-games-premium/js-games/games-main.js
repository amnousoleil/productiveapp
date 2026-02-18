/**
 * GIRI GAMES MAIN v2.0 — Arcade Premium Hub
 * Daily challenge · Rangs · Coins · Design arcade
 */
const GiriGames = (function() {
    'use strict';

    const GAMES = [
        { id: 'g2048',    name: 'Giri 2048',    icon: '🔢', category: 'rapide',    desc: 'Fusionnez les tuiles jusqu\'à 2048', hot: true },
        { id: 'snake',    name: 'Giri Snake',    icon: '🐍', category: 'rapide',    desc: 'Guidez le serpent sans tomber',      hot: true },
        { id: 'tetris',   name: 'Giri Blocks',   icon: '🧱', category: 'rapide',    desc: 'Empilez les blocs qui tombent' },
        { id: 'typerace', name: 'TypeRace',       icon: '⌨️', category: 'rapide',    desc: 'Tapez le plus vite possible' },
        { id: 'chess',    name: 'Giri Chess',     icon: '♟️', category: 'strategie', desc: 'Échecs contre l\'IA' },
        { id: 'sudoku',   name: 'Giri Sudoku',    icon: '🧩', category: 'reflexion', desc: 'Remplissez la grille 9×9' },
        { id: 'mines',    name: 'Giri Mines',     icon: '💣', category: 'reflexion', desc: 'Trouvez toutes les mines' },
        { id: 'memory',   name: 'Giri Memory',    icon: '🃏', category: 'reflexion', desc: 'Retrouvez les paires de cartes' },
    ];

    const CATEGORIES = { rapide: 'Jeux Rapides ⚡', strategie: 'Stratégie ♟️', reflexion: 'Réflexion 🧠' };

    const RANKS = [
        { min: 0,    label: 'Novice',  icon: '🥉' },
        { min: 100,  label: 'Joueur',  icon: '🥈' },
        { min: 500,  label: 'Expert',  icon: '🥇' },
        { min: 2000, label: 'Maître',  icon: '💎' },
        { min: 5000, label: 'Légende', icon: '👑' },
    ];

    const GAME_MODULES = {
        g2048:    () => typeof G2048Game    !== 'undefined' ? G2048Game    : null,
        sudoku:   () => typeof SudokuGame   !== 'undefined' ? SudokuGame   : null,
        mines:    () => typeof MinesGame    !== 'undefined' ? MinesGame    : null,
        memory:   () => typeof MemoryGame   !== 'undefined' ? MemoryGame   : null,
        snake:    () => typeof SnakeGame    !== 'undefined' ? SnakeGame    : null,
        tetris:   () => typeof TetrisGame   !== 'undefined' ? TetrisGame   : null,
        chess:    () => typeof ChessGame    !== 'undefined' ? ChessGame    : null,
        typerace: () => typeof TypeRaceGame !== 'undefined' ? TypeRaceGame : null,
    };

    let currentGame = null;

    function getContainer() { return document.getElementById('view-games'); }

    function getRank(pts) {
        return [...RANKS].reverse().find(r => pts >= r.min) || RANKS[0];
    }

    function getDailyGame() {
        const day = new Date().toISOString().slice(0, 10);
        let h = 0;
        for (const c of day) h = ((h << 5) - h) + c.charCodeAt(0);
        return GAMES[Math.abs(h) % GAMES.length];
    }

    function init() { showHome(); }

    function showHome() {
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        const user  = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const name  = user ? (user.firstName || user.name || 'Joueur').split(' ')[0] : 'Joueur';
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const total = Object.values(stats.scores || {}).reduce((a, s) => a + (s.count || 0), 0);
        const pts   = stats.totalPoints || 0;
        const rank  = getRank(pts);
        const daily = getDailyGame();

        container.innerHTML = `
        <div class="games-home">
            <div class="games-header">
                <div class="games-title-block">
                    <h1>🎮 Giri Games</h1>
                    <div class="games-subtitle">Gagne des XP · Bats tes records · Défis quotidiens</div>
                </div>
                <div class="games-header-actions">
                    <button class="games-btn" onclick="GiriGames.showLeaderboard()">🏆 Classement</button>
                    <button class="games-btn" onclick="GiriGames.showAchievements()">🎯 Succès</button>
                </div>
            </div>

            <div class="games-player-bar">
                <div class="games-player-greeting">Salut <strong>${name}</strong> !</div>
                <div class="games-player-rank">${rank.icon} ${rank.label}</div>
                <div class="games-player-stats">
                    <div class="games-stat-badge">🔥 <span class="stat-val">${stats.streak || 0}</span> jours</div>
                    <div class="games-stat-badge">⭐ <span class="stat-val">${pts.toLocaleString('fr-FR')}</span> pts</div>
                    <div class="games-stat-badge">🎮 <span class="stat-val">${total}</span> parties</div>
                </div>
            </div>

            <div class="games-daily-challenge" onclick="GiriGames.openGame('${daily.id}')">
                <div class="daily-badge">⚡ Défi du Jour</div>
                <div class="daily-game-icon">${daily.icon}</div>
                <div class="daily-info">
                    <div class="daily-title">${daily.name}</div>
                    <div class="daily-desc">${daily.desc} — Bonus XP ×3 aujourd'hui uniquement !</div>
                </div>
                <div class="daily-reward">
                    <div class="reward-val">×3</div>
                    <div class="reward-label">Bonus XP</div>
                </div>
                <button class="daily-btn">Jouer →</button>
            </div>

            ${renderCategories()}

            <div class="games-bottom-row">
                <div class="games-panel">
                    <div class="games-panel-title">📊 Mes meilleurs scores</div>
                    ${renderActivity(stats)}
                </div>
                <div class="games-panel">
                    <div class="games-panel-title">🏆 Mon classement personnel</div>
                    ${renderMiniLeaderboard(stats)}
                </div>
            </div>
        </div>`;

        container.querySelectorAll('.game-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 50}ms`;
        });
    }

    function renderCategories() {
        return Object.entries(CATEGORIES).map(([catId, catName]) => {
            const games = GAMES.filter(g => g.category === catId);
            return `<div class="games-category">
                <div class="games-category-header">
                    <div class="games-category-title">${catName}</div>
                </div>
                <div class="games-grid">
                    ${games.map(renderGameCard).join('')}
                </div>
            </div>`;
        }).join('');
    }

    function renderGameCard(game) {
        const best = typeof GamesState !== 'undefined' ? GamesState.getBestScore(game.id) : 0;
        const cnt  = typeof GamesState !== 'undefined' ? (GamesState.getStats().scores?.[game.id]?.count || 0) : 0;
        const tag  = game.hot ? '<div class="game-tag hot">HOT 🔥</div>' : '';
        const score = best > 0
            ? `<div class="game-best-score">🏆 ${best.toLocaleString('fr-FR')}</div>`
            : `<div class="game-play-count">Jouer →</div>`;
        const plays = cnt > 0 ? `<div class="game-play-count">${cnt} partie${cnt > 1 ? 's' : ''}</div>` : '';
        return `<div class="game-card" data-game="${game.id}" onclick="GiriGames.openGame('${game.id}')" title="${game.desc}">
            ${tag}
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            ${score}${plays}
        </div>`;
    }

    function renderActivity(stats) {
        const played = Object.entries(stats.scores || {}).filter(([, s]) => s.count > 0);
        if (!played.length) return '<div class="activity-row"><div class="activity-text" style="color:#334155">Lance une partie pour voir tes stats !</div></div>';
        return played.slice(0, 4).map(([id, sc]) => {
            const g = GAMES.find(x => x.id === id);
            if (!g) return '';
            return `<div class="activity-row">
                <span style="font-size:20px">${g.icon}</span>
                <div class="activity-text">${g.name}</div>
                <div class="activity-time" style="color:#f59e0b">${sc.best.toLocaleString('fr-FR')}</div>
            </div>`;
        }).join('');
    }

    function renderMiniLeaderboard(stats) {
        const played = Object.entries(stats.scores || {})
            .filter(([, s]) => s.count > 0)
            .sort(([, a], [, b]) => (b.best || 0) - (a.best || 0));
        if (!played.length) return '<div class="activity-row"><div class="activity-text" style="color:#334155">Joue pour apparaître ici !</div></div>';
        const medals = ['🥇', '🥈', '🥉', '4️⃣'];
        return played.slice(0, 4).map(([id, sc], i) => {
            const g = GAMES.find(x => x.id === id);
            if (!g) return '';
            return `<div class="activity-row">
                <span>${medals[i] || '•'}</span>
                <div class="activity-text">${g.name}</div>
                <div class="activity-time" style="color:#a78bfa;font-weight:700">${(sc.best || 0).toLocaleString('fr-FR')}</div>
            </div>`;
        }).join('');
    }

    function openGame(gameId) {
        const game = GAMES.find(g => g.id === gameId);
        if (!game) return;
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        container.innerHTML = `<div class="game-container">
            <div class="game-topbar">
                <button class="game-back-btn" onclick="GiriGames.showHome()">← Retour</button>
                <div class="game-title">${game.icon} ${game.name}</div>
            </div>
            <div class="game-play-area" id="game-play-area"></div>
        </div>`;

        currentGame = game;
        if (typeof GamesState    !== 'undefined') GamesState.setCurrentGame(gameId);
        if (typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('first_game');

        const playArea = document.getElementById('game-play-area');
        if (!playArea) return;

        try {
            const mod = (GAME_MODULES[gameId] || (() => null))();
            if (mod && typeof mod.mount === 'function') {
                mod.mount(playArea);
            } else {
                playArea.innerHTML = `<div style="text-align:center;padding:60px;color:#475569">
                    <div style="font-size:80px;margin-bottom:20px;filter:drop-shadow(0 0 20px rgba(124,58,237,0.5))">${game.icon}</div>
                    <h2 style="color:#94a3b8;margin-bottom:8px">${game.name}</h2>
                    <p style="color:#334155">Module en cours de chargement...</p>
                </div>`;
            }
        } catch (e) {
            console.error('[GiriGames] Erreur chargement:', e);
            playArea.innerHTML = `<div style="text-align:center;padding:60px">
                <p style="color:#ef4444;margin-bottom:16px">Erreur lors du chargement du jeu.</p>
                <button class="games-btn" onclick="GiriGames.showHome()">← Retour</button>
            </div>`;
        }
    }

    function stopCurrentGame() {
        if (!currentGame) return;
        try {
            const mod = (GAME_MODULES[currentGame.id] || (() => null))();
            if (mod && typeof mod.unmount === 'function') mod.unmount();
        } catch (e) {}
        currentGame = null;
        if (typeof GamesState !== 'undefined') GamesState.clearCurrentGame();
    }

    async function showLeaderboard() {
        const modal = createModal('🏆 Classement Global', '<div style="text-align:center;padding:24px;color:#475569">Chargement...</div>');
        const box = modal.querySelector('.games-modal-box');
        try {
            const data = typeof GamesApi !== 'undefined' ? await GamesApi.getGlobalLeaderboard() : [];
            box.querySelector('div[style*="Chargement"]')?.remove();
            if (!data?.length) {
                box.innerHTML += '<p style="text-align:center;color:#475569;padding:20px">Aucun score — soyez le premier !</p>';
            } else {
                box.innerHTML += data.slice(0, 10).map((row, i) => `
                <div class="leaderboard-row">
                    <div class="lb-rank ${i===0?'top1':i===1?'top2':i===2?'top3':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
                    <div class="lb-name">${row.user_id || 'Joueur'}</div>
                    <div class="lb-score">${parseInt(row.total_score||0).toLocaleString('fr-FR')} pts</div>
                    <div style="font-size:12px;color:#475569">${row.games_played||0} parties</div>
                </div>`).join('');
            }
        } catch (e) {
            box.innerHTML += '<p style="text-align:center;color:#475569">Données non disponibles</p>';
        }
    }

    function showAchievements() {
        const all      = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getAll()      : [];
        const unlocked = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getUnlocked() : [];
        const html = all.map(a => {
            const done = unlocked.includes(a.id);
            return `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(51,65,85,0.15);opacity:${done?1:.3}">
                <span style="font-size:32px">${a.icon}</span>
                <div style="flex:1">
                    <div style="font-weight:700;color:#f1f5f9">${a.title}</div>
                    <div style="font-size:12px;color:#475569;margin-top:3px">${a.desc}</div>
                </div>
                ${done ? '<span style="color:#22c55e;font-size:20px;font-weight:800">✓</span>' : ''}
            </div>`;
        }).join('');
        createModal(`🎯 Succès débloqués (${unlocked.length}/${all.length})`, html);
    }

    function createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'games-modal';
        modal.innerHTML = `<div class="games-modal-box">
            <div class="games-modal-title">${title}
                <span class="games-modal-close" onclick="this.closest('.games-modal').remove()">✕</span>
            </div>${content}
        </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        return modal;
    }

    function refresh() { init(); }

    return { init, showHome, openGame, showLeaderboard, showAchievements, refresh };
})();
