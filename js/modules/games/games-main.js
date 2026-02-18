/**
 * GIRI GAMES v3.0 — Hub Premium
 * Monnaie GIRIS · Profil Joueur · Classement réel · 9 jeux
 */
const GiriGames = (function() {
    'use strict';

    const GAMES = [
        { id: 'g2048',    name: 'Giri 2048',    icon: '🔢', cat: 'rapide',    desc: 'Fusionnez les tuiles jusqu\'à 2048', hot: true },
        { id: 'snake',    name: 'Giri Snake',    icon: '🐍', cat: 'rapide',    desc: 'Guidez le serpent sans tomber', hot: true },
        { id: 'tetris',   name: 'Giri Blocks',   icon: '🧱', cat: 'rapide',    desc: 'Empilez les blocs qui tombent' },
        { id: 'typerace', name: 'TypeRace',       icon: '⌨️', cat: 'rapide',    desc: 'Tapez le texte le plus vite possible' },
        { id: 'gimots',   name: 'GIMOTS',         icon: '🔤', cat: 'quotidien', desc: 'Trouvez le mot du jour en 6 essais', hot: true, isNew: true },
        { id: 'chess',    name: 'Giri Chess',     icon: '♟️', cat: 'strategie', desc: 'Affrontez l\'IA aux échecs' },
        { id: 'sudoku',   name: 'Giri Sudoku',    icon: '🧩', cat: 'reflexion', desc: 'Remplissez la grille 9×9' },
        { id: 'mines',    name: 'Giri Mines',     icon: '💣', cat: 'reflexion', desc: 'Trouvez les mines sans les toucher' },
        { id: 'memory',   name: 'Giri Memory',    icon: '🃏', cat: 'reflexion', desc: 'Retrouvez toutes les paires' },
    ];

    const CATS = {
        quotidien: { label: '📅 Défi Quotidien', desc: 'Renouvellement chaque jour' },
        rapide:    { label: '⚡ Jeux Rapides', desc: 'Action immédiate' },
        strategie: { label: '♟️ Stratégie', desc: 'Réflexion & planification' },
        reflexion: { label: '🧠 Réflexion', desc: 'Entraîne ton cerveau' }
    };

    const TITLES = [
        { min: 0,      label: 'Novice',        icon: '🌱', color: '#6b7280' },
        { min: 200,    label: 'Débutant',       icon: '⭐', color: '#6b7280' },
        { min: 1000,   label: 'Apprenti',       icon: '🥉', color: '#cd7f32' },
        { min: 3000,   label: 'Confirmé',       icon: '🥈', color: '#94a3b8' },
        { min: 8000,   label: 'Expert',         icon: '🥇', color: '#f59e0b' },
        { min: 20000,  label: 'Maître',         icon: '💎', color: '#06b6d4' },
        { min: 50000,  label: 'Légende',        icon: '👑', color: '#a78bfa' },
        { min: 100000, label: 'Transcendant',   icon: '✨', color: '#f59e0b' },
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
        gimots:   () => typeof GimotsGame   !== 'undefined' ? GimotsGame   : null,
    };

    let currentGame = null;

    function getContainer() { return document.getElementById('view-games'); }

    function getTitle(giris) {
        return [...TITLES].reverse().find(t => giris >= t.min) || TITLES[0];
    }

    function getDailyGame() {
        const day = new Date().toISOString().slice(0, 10);
        let h = 0;
        for (const c of day) h = ((h << 5) - h) + c.charCodeAt(0);
        // Priorité au jeu quotidien (gimots) ou autre
        const candidates = GAMES.filter(g => g.cat === 'rapide' || g.cat === 'strategie');
        return candidates[Math.abs(h) % candidates.length];
    }

    function init() {
        if (typeof GamesState !== 'undefined') {
            const bonus = GamesState.checkDailyStreak();
            if (bonus) setTimeout(() => showDailyBonus(bonus), 500);
        }
        showHome();
    }

    function showDailyBonus(giris) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:80px;right:24px;background:var(--bg-secondary);
            border:1px solid rgba(245,158,11,0.4);border-radius:16px;padding:14px 20px;
            display:flex;align-items:center;gap:12px;z-index:2000;
            box-shadow:0 8px 32px rgba(0,0,0,0.3);animation:boxIn 400ms ease;`;
        el.innerHTML = `<span style="font-size:28px">🎁</span>
            <div>
                <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;font-weight:700">Bonus quotidien</div>
                <div style="font-size:18px;font-weight:800;color:#f59e0b">+${giris} GIRIS</div>
            </div>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }

    function showHome() {
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        const user  = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const name  = user ? (user.firstName || user.name || 'Joueur').split(' ')[0] : 'Joueur';
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const giris = stats.giris || 0;
        const titleInfo = getTitle(giris);
        const streak = stats.streak || 0;
        const totalGames = stats.totalGames || 0;
        const wins = stats.wins || 0;
        const avatar = stats.avatar || '🎮';

        // Daily challenge bonus
        const daily = getDailyGame();

        container.innerHTML = `
        <div class="games-home">
            <div class="games-header">
                <div class="games-title-block">
                    <h1>🎮 <span class="title-gradient">Giri Games</span></h1>
                    <div class="games-subtitle">Gagne des GIRIS · Bats tes records · Défis quotidiens</div>
                </div>
                <div class="games-header-actions">
                    <button class="games-btn" onclick="GiriGames.showProfile()">👤 Profil</button>
                    <button class="games-btn" onclick="GiriGames.showLeaderboard()">🏆 Classement</button>
                    <button class="games-btn" onclick="GiriGames.showAchievements()">🎯 Succès</button>
                </div>
            </div>

            <!-- BARRE JOUEUR -->
            <div class="games-player-bar" onclick="GiriGames.showProfile()" title="Voir mon profil">
                <div class="player-avatar">${avatar}</div>
                <div class="player-info">
                    <div class="player-name">
                        ${name}
                        <span class="player-title-badge" style="background:linear-gradient(135deg,${titleInfo.color},#06b6d4)">
                            ${titleInfo.icon} ${titleInfo.label}
                        </span>
                    </div>
                    <div class="player-rank-info">Cliquez pour personnaliser votre profil</div>
                </div>
                <div class="games-player-stats">
                    <div class="games-stat-badge giris-badge">
                        ✨ <span class="stat-val">${giris.toLocaleString('fr-FR')}</span>
                        <span class="giri-coin">GIRIS</span>
                    </div>
                    <div class="games-stat-badge">🔥 <span class="stat-val">${streak}</span> jours</div>
                    <div class="games-stat-badge">🎮 <span class="stat-val">${totalGames}</span> parties</div>
                    <div class="games-stat-badge">🏆 <span class="stat-val">${wins}</span> victoires</div>
                </div>
            </div>

            <!-- DÉFI QUOTIDIEN -->
            <div class="games-daily-challenge" onclick="GiriGames.openGame('${daily.id}')">
                <div class="daily-badge">⚡ Défi du Jour</div>
                <div class="daily-game-icon">${daily.icon}</div>
                <div class="daily-info">
                    <div class="daily-title">${daily.name}</div>
                    <div class="daily-desc">${daily.desc} — Bonus GIRIS ×3 aujourd'hui !</div>
                </div>
                <div class="daily-reward">
                    <div class="reward-val">×3</div>
                    <div class="reward-label" style="color:#f59e0b">GIRIS</div>
                </div>
                <button class="daily-btn">Jouer →</button>
            </div>

            <!-- GRILLES PAR CATÉGORIE -->
            ${renderCategories()}

            <!-- BOTTOM ROW -->
            <div class="games-bottom-row">
                <div class="games-panel">
                    <div class="games-panel-title">📊 Mes meilleurs scores</div>
                    ${renderMyScores(stats)}
                </div>
                <div class="games-panel">
                    <div class="games-panel-title">🏆 Mes GIRIS par jeu</div>
                    ${renderGirisByGame(stats)}
                </div>
            </div>
        </div>`;

        container.querySelectorAll('.game-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 60}ms`;
        });
    }

    function renderCategories() {
        return Object.entries(CATS).map(([catId, catInfo]) => {
            const games = GAMES.filter(g => g.cat === catId);
            if (!games.length) return '';
            return `<div class="games-category">
                <div class="games-category-header">
                    <div class="games-category-title">${catInfo.label}</div>
                    <div style="font-size:12px;color:var(--text-secondary)">${catInfo.desc}</div>
                </div>
                <div class="games-grid">
                    ${games.map(renderGameCard).join('')}
                </div>
            </div>`;
        }).join('');
    }

    function renderGameCard(game) {
        const best  = typeof GamesState !== 'undefined' ? GamesState.getBestScore(game.id) : 0;
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const cnt   = stats.scores?.[game.id]?.count || 0;
        const girisGame = stats.girisByGame?.[game.id] || 0;
        let tags = '';
        if (game.hot) tags += '<div class="game-tag hot">HOT 🔥</div>';
        if (game.isNew) tags += '<div class="game-tag new">NEW</div>';
        return `<div class="game-card" data-game="${game.id}" onclick="GiriGames.openGame('${game.id}')" title="${game.desc}">
            ${tags}
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            ${best > 0 ? `<div class="game-best-score">🏆 ${best.toLocaleString('fr-FR')}</div>` : `<div class="game-play-count">Jouer →</div>`}
            ${girisGame > 0 ? `<div style="font-size:11px;color:#f59e0b;font-weight:700;margin-top:4px">✨ ${girisGame} GIRIS</div>` : ''}
            ${cnt > 0 ? `<div class="game-play-count">${cnt} partie${cnt > 1 ? 's' : ''}</div>` : ''}
        </div>`;
    }

    function renderMyScores(stats) {
        const played = Object.entries(stats.scores || {}).filter(([, s]) => s.count > 0);
        if (!played.length) return `<div class="activity-row"><div class="activity-text" style="color:var(--text-muted,#475569)">Lance une partie pour voir tes stats !</div></div>`;
        return played.slice(0, 5).map(([id, sc]) => {
            const g = GAMES.find(x => x.id === id);
            if (!g) return '';
            const winRate = sc.count > 0 ? Math.round((sc.wins || 0) / sc.count * 100) : 0;
            return `<div class="activity-row">
                <span style="font-size:20px">${g.icon}</span>
                <div style="flex:1">
                    <div class="activity-text">${g.name}</div>
                    <div style="font-size:11px;color:var(--text-secondary)">${sc.count} parties · ${winRate}% victoires</div>
                </div>
                <div class="activity-time">${sc.best.toLocaleString('fr-FR')}</div>
            </div>`;
        }).join('');
    }

    function renderGirisByGame(stats) {
        const entries = Object.entries(stats.girisByGame || {})
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a);
        if (!entries.length) return `<div class="activity-row"><div class="activity-text" style="color:var(--text-muted,#475569)">Joue pour gagner des GIRIS !</div></div>`;
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        return entries.slice(0, 5).map(([id, g], i) => {
            const game = GAMES.find(x => x.id === id);
            if (!game) return '';
            return `<div class="activity-row">
                <span>${medals[i] || '•'}</span>
                <div class="activity-text">${game.name}</div>
                <div style="font-size:13px;font-weight:800;color:#f59e0b">${g.toLocaleString('fr-FR')} <span style="font-size:10px">GIRIS</span></div>
            </div>`;
        }).join('');
    }

    function openGame(gameId) {
        const game = GAMES.find(g => g.id === gameId);
        if (!game) return;
        stopCurrentGame();
        const container = getContainer();
        if (!container) return;

        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const giris = stats.giris || 0;

        container.innerHTML = `<div class="game-container">
            <div class="game-topbar">
                <button class="game-back-btn" onclick="GiriGames.showHome()">← Retour</button>
                <div class="game-title">${game.icon} ${game.name}</div>
                <div class="game-topbar-right">
                    <div class="game-topbar-giris">✨ ${giris.toLocaleString('fr-FR')} GIRIS</div>
                </div>
            </div>
            <div class="game-play-area" id="game-play-area"></div>
        </div>`;

        currentGame = game;
        if (typeof GamesState !== 'undefined') GamesState.setCurrentGame(gameId);
        if (typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('first_game');

        const playArea = document.getElementById('game-play-area');
        if (!playArea) return;

        try {
            const mod = (GAME_MODULES[gameId] || (() => null))();
            if (mod && typeof mod.mount === 'function') {
                mod.mount(playArea);
            } else {
                playArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-secondary)">
                    <div style="font-size:72px;margin-bottom:20px">${game.icon}</div>
                    <h2 style="color:var(--text-primary);margin-bottom:8px">${game.name}</h2>
                    <p>Module en cours de chargement…</p>
                </div>`;
            }
        } catch (e) {
            console.error('[GiriGames] Erreur:', e);
            playArea.innerHTML = `<div style="text-align:center;padding:60px">
                <p style="color:#ef4444;margin-bottom:16px">Erreur lors du chargement.</p>
                <button class="games-btn" onclick="GiriGames.showHome()">← Retour</button>
            </div>`;
        }
    }

    function stopCurrentGame() {
        if (!currentGame) return;
        try {
            const mod = (GAME_MODULES[currentGame.id] || (() => null))();
            if (mod && typeof mod.unmount === 'function') mod.unmount();
        } catch(e) {}
        currentGame = null;
        if (typeof GamesState !== 'undefined') GamesState.clearCurrentGame();
    }

    // ── PROFIL JOUEUR ──
    function showProfile() {
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const user  = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const name  = user ? (user.firstName || user.name || 'Joueur').split(' ')[0] : 'Joueur';
        const giris = stats.giris || 0;
        const titleInfo = getTitle(giris);
        const totalGames = stats.totalGames || 0;
        const wins = stats.wins || 0;
        const streak = stats.streak || 0;
        const avatar = stats.avatar || '🎮';

        const nextTitle = TITLES.find(t => t.min > giris);
        const progressToNext = nextTitle
            ? Math.round((giris - (getTitle(giris).min)) / (nextTitle.min - getTitle(giris).min) * 100)
            : 100;

        const AVATARS = ['🎮','🚀','🦄','🐉','⚡','🌟','💎','🔥','👑','🎯','🧠','🎸','🌊','🦁','🐺','🦊','🏆','🎪','🌈','✨'];

        const modal = createModal(`👤 Mon Profil`, `
        <div class="profile-modal-header">
            <div class="profile-big-avatar" onclick="GiriGames.cycleAvatar()" title="Cliquer pour changer">
                ${avatar}
            </div>
            <div class="profile-player-name">${name}</div>
            <div class="profile-title-badge" style="background:linear-gradient(135deg,${titleInfo.color},#06b6d4)">
                ${titleInfo.icon} ${titleInfo.label}
            </div>
            <div style="margin-top:12px">
                <div class="profile-giris-total">${giris.toLocaleString('fr-FR')}</div>
                <div class="profile-giris-label">GIRIS</div>
            </div>
            ${nextTitle ? `<div style="margin-top:12px">
                <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">
                    ${giris.toLocaleString('fr-FR')} / ${nextTitle.min.toLocaleString('fr-FR')} GIRIS → ${nextTitle.icon} ${nextTitle.label}
                </div>
                <div style="width:100%;height:6px;border-radius:3px;background:var(--bg-primary)">
                    <div style="width:${progressToNext}%;height:100%;border-radius:3px;background:linear-gradient(90deg,${titleInfo.color},#06b6d4);transition:width 1s ease"></div>
                </div>
            </div>` : '<div style="font-size:13px;color:#f59e0b;margin-top:10px">✨ Rang maximum atteint !</div>'}
        </div>
        <div class="profile-stats-grid">
            <div class="profile-stat-card">
                <div class="profile-stat-val">${totalGames}</div>
                <div class="profile-stat-lbl">Parties</div>
            </div>
            <div class="profile-stat-card">
                <div class="profile-stat-val">${wins}</div>
                <div class="profile-stat-lbl">Victoires</div>
            </div>
            <div class="profile-stat-card">
                <div class="profile-stat-val">${streak} 🔥</div>
                <div class="profile-stat-lbl">Streak</div>
            </div>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Choisir un avatar</div>
        <div class="profile-avatar-picker">
            ${AVATARS.map(a => `<div class="profile-avatar-opt ${a===avatar?'selected':''}" onclick="GiriGames.setAvatar('${a}',this)">${a}</div>`).join('')}
        </div>
        `);

        return modal;
    }

    function setAvatar(emoji, el) {
        if (typeof GamesState !== 'undefined') GamesState.setAvatar(emoji);
        // Update UI
        document.querySelectorAll('.profile-avatar-opt').forEach(o => o.classList.remove('selected'));
        if (el) el.classList.add('selected');
        const bigAvatar = document.querySelector('.profile-big-avatar');
        if (bigAvatar) bigAvatar.textContent = emoji;
        const playerAvatar = document.querySelector('.player-avatar');
        if (playerAvatar) playerAvatar.textContent = emoji;
    }

    function cycleAvatar() {
        const AVATARS = ['🎮','🚀','🦄','🐉','⚡','🌟','💎','🔥','👑','🎯','🧠','🎸','🌊','🦁','🐺','🦊','🏆','🎪','🌈','✨'];
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const cur = stats.avatar || '🎮';
        const idx = AVATARS.indexOf(cur);
        const next = AVATARS[(idx + 1) % AVATARS.length];
        setAvatar(next, document.querySelector(`.profile-avatar-opt[onclick*="${next}"]`));
    }

    // ── CLASSEMENT ──
    async function showLeaderboard() {
        const stats = typeof GamesState !== 'undefined' ? GamesState.getStats() : {};
        const giris = stats.giris || 0;
        const user  = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const name  = user ? (user.firstName || user.name || 'Joueur').split(' ')[0] : 'Moi';

        const modal = createModal('🏆 Classement GIRIS', '<div style="text-align:center;padding:24px;color:var(--text-secondary)">Chargement…</div>');
        const box = modal.querySelector('.games-modal-box');

        // Tabs
        const tabsHtml = `<div style="display:flex;gap:8px;margin-bottom:16px">
            <button class="games-btn active" id="lb-tab-global" onclick="GiriGames._lbTab('global')">🌍 Global</button>
            <button class="games-btn" id="lb-tab-jeu" onclick="GiriGames._lbTab('jeu')">🎮 Par jeu</button>
        </div>`;

        try {
            const data = typeof GamesApi !== 'undefined' ? await GamesApi.getGlobalLeaderboard() : [];
            box.innerHTML = box.innerHTML.replace(/<div[^>]*>Chargement.*?<\/div>/, '');

            // Ajouter ma position locale si pas dans le top
            const rows = data && data.length ? data : [];

            // Ma ligne locale
            const maLigne = { user_id: name, total_score: giris, games_played: stats.totalGames || 0, is_me: true, avatar: stats.avatar || '🎮', title: getTitle(giris).label };

            const allRows = [...rows];
            if (!allRows.find(r => r.is_me)) allRows.push(maLigne);
            allRows.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

            const rowsHtml = allRows.slice(0, 15).map((row, i) => {
                const titleI = getTitle(row.total_score || 0);
                const isMe = row.is_me || row.user_id === name;
                return `<div class="leaderboard-row ${isMe ? 'style="background:color-mix(in srgb,var(--accent-primary,#7c3aed) 8%,var(--bg-primary))"' : ''}">
                    <div class="lb-rank ${i===0?'top1':i===1?'top2':i===2?'top3':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                    <div class="lb-avatar">${row.avatar || '🎮'}</div>
                    <div style="flex:1;min-width:0">
                        <div class="lb-name">${row.user_id || 'Joueur'}${isMe?' (Moi)':''}</div>
                        <div class="lb-title-small" style="color:${titleI.color}">${titleI.icon} ${titleI.label}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="lb-score">${parseInt(row.total_score || 0).toLocaleString('fr-FR')}</div>
                        <div class="lb-giris">GIRIS</div>
                    </div>
                </div>`;
            }).join('');

            box.innerHTML = `<div class="games-modal-title">🏆 Classement GIRIS <span class="games-modal-close" onclick="this.closest('.games-modal').remove()">✕</span></div>
                ${tabsHtml}
                <div id="lb-content">${rowsHtml || '<p style="text-align:center;color:var(--text-secondary);padding:20px">Aucun score — soyez le premier !</p>'}</div>`;
        } catch(e) {
            box.innerHTML = `<div class="games-modal-title">🏆 Classement <span class="games-modal-close" onclick="this.closest('.games-modal').remove()">✕</span></div>
                ${tabsHtml}
                <div id="lb-content"><p style="text-align:center;color:var(--text-secondary)">Classement local uniquement</p>
                <div class="leaderboard-row">
                    <div class="lb-rank top1">🥇</div>
                    <div class="lb-avatar">${stats.avatar || '🎮'}</div>
                    <div style="flex:1"><div class="lb-name">${name} (Moi)</div></div>
                    <div style="text-align:right"><div class="lb-score">${giris.toLocaleString('fr-FR')}</div><div class="lb-giris">GIRIS</div></div>
                </div></div>`;
        }
    }

    // eslint-disable-next-line
    function _lbTab(tab) {
        ['global', 'jeu'].forEach(t => {
            const btn = document.getElementById(`lb-tab-${t}`);
            if (btn) btn.classList.toggle('active', t === tab);
        });
    }

    // ── SUCCÈS ──
    function showAchievements() {
        const all      = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getAll()      : [];
        const unlocked = typeof GamesAchievements !== 'undefined' ? GamesAchievements.getUnlocked() : [];
        const html = all.map(a => {
            const done = unlocked.includes(a.id);
            return `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;
                border-bottom:1px solid var(--border-color,rgba(51,65,85,0.15));
                opacity:${done?1:0.35};transition:opacity 200ms">
                <span style="font-size:32px">${a.icon}</span>
                <div style="flex:1">
                    <div style="font-weight:700;color:var(--text-primary)">${a.title}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${a.desc}</div>
                    ${a.giris ? `<div style="font-size:11px;color:#f59e0b;font-weight:700;margin-top:2px">+${a.giris} GIRIS</div>` : ''}
                </div>
                ${done ? '<span style="color:#22c55e;font-size:22px;font-weight:800">✓</span>' : '<span style="color:var(--text-muted,#475569);font-size:14px">🔒</span>'}
            </div>`;
        }).join('');
        createModal(`🎯 Succès (${unlocked.length}/${all.length})`, html);
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

    return { init, showHome, openGame, showLeaderboard, showAchievements, showProfile, setAvatar, cycleAvatar, _lbTab, refresh };
})();
