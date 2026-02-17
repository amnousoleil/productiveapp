/**
 * GIRI 2048 v1.0 - Based on Gabriele Cirulli's 2048 (MIT License)
 */
const G2048Game = (function() {
    'use strict';

    const SIZE = 4;
    let grid = [], score = 0, bestScore = 0, prevGrid = null, prevScore = 0;
    let container = null, gameOver = false, won = false;
    let listeners = [];

    function mount(el) {
        container = el;
        if (!container) return;
        bestScore = typeof GamesState !== 'undefined' ? GamesState.getBestScore('g2048') : 0;
        resetGame();
        render();
        attachEvents();
        if (typeof GamesApi !== 'undefined') {
            GamesApi.loadGame('g2048').then(state => {
                if (state && state.grid && !gameOver) { grid = state.grid; score = state.score || 0; renderBoard(); renderStats(); }
            });
        }
    }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (typeof GamesApi !== 'undefined' && !gameOver) GamesApi.saveGame('g2048', { grid, score });
        if (container) container.innerHTML = '';
        container = null;
    }

    function addListener(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); listeners.push({el, ev, fn}); }

    function resetGame() {
        grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
        score = 0; gameOver = false; won = false;
        addTile(); addTile();
    }

    function addTile() {
        const empty = [];
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r,c]);
        if (!empty.length) return;
        const [r,c] = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function slide(row) {
        const f = row.filter(x => x !== 0);
        for (let i = 0; i < f.length - 1; i++) {
            if (f[i] === f[i+1]) { f[i] *= 2; score += f[i]; f.splice(i+1, 1); }
        }
        while (f.length < SIZE) f.push(0);
        return f;
    }

    function move(dir) {
        if (gameOver) return false;
        prevGrid = grid.map(r => [...r]); prevScore = score;
        let moved = false;
        if (dir === 'left' || dir === 'right') {
            for (let r = 0; r < SIZE; r++) {
                const row = dir === 'right' ? [...grid[r]].reverse() : [...grid[r]];
                const slid = slide(row);
                const final = dir === 'right' ? slid.reverse() : slid;
                if (final.join(',') !== grid[r].join(',')) moved = true;
                grid[r] = final;
            }
        } else {
            for (let c = 0; c < SIZE; c++) {
                let col = grid.map(r => r[c]);
                if (dir === 'down') col = col.reverse();
                const slid = slide(col);
                if (dir === 'down') slid.reverse();
                if (slid.join(',') !== col.join(',')) moved = true;
                for (let r = 0; r < SIZE; r++) grid[r][c] = slid[r];
            }
        }
        if (moved) {
            addTile();
            if (score > bestScore) { bestScore = score; if (typeof GamesState !== 'undefined') GamesState.addScore('g2048', score); }
            checkState(); renderBoard(); renderStats();
        }
        return moved;
    }

    function undo() {
        if (!prevGrid) return;
        grid = prevGrid.map(r => [...r]); score = prevScore; prevGrid = null; gameOver = false;
        renderBoard(); renderStats();
    }

    function checkState() {
        if (!won) for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 2048) { won = true; break; }
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return;
            if (c < SIZE-1 && grid[r][c] === grid[r][c+1]) return;
            if (r < SIZE-1 && grid[r][c] === grid[r+1][c]) return;
        }
        gameOver = true;
        setTimeout(showGameOver, 300);
    }

    function showGameOver() {
        const board = container ? container.querySelector('.g2048-board') : null;
        if (!board) return;
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('g2048', score, { won });
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;border-radius:12px;z-index:10;';
        overlay.innerHTML = `<div style="text-align:center;color:white;padding:24px;"><div style="font-size:28px;font-weight:700;margin-bottom:8px">${won?'🏆 2048 !':'💀 Game Over'}</div><div style="font-size:18px;margin-bottom:16px">Score : ${score.toLocaleString('fr-FR')}</div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="G2048Game.restart()" style="padding:10px 18px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="GiriGames.showHome()" style="padding:10px 18px;background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        board.style.position = 'relative';
        board.appendChild(overlay);
    }

    function restart() {
        const ov = container ? container.querySelector('.g2048-board > div') : null;
        if (ov) ov.remove();
        resetGame(); renderBoard(); renderStats();
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;"><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center;"><div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:10px 20px;text-align:center;"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.8px">Score</div><div id="g2048-score" style="font-size:22px;font-weight:700;color:var(--text-primary)">0</div></div><div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:10px 20px;text-align:center;"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.8px">Meilleur</div><div id="g2048-best" style="font-size:22px;font-weight:700;color:var(--accent-primary,#7c3aed)">${bestScore.toLocaleString('fr-FR')}</div></div><div style="display:flex;gap:8px;"><button onclick="G2048Game.restart()" class="games-btn">🔄 Nouveau</button><button onclick="G2048Game.undo()" class="games-btn">↩ Annuler</button></div></div><div class="g2048-board" id="g2048-board" style="grid-template-columns:repeat(${SIZE},1fr);"></div><div style="font-size:13px;color:var(--text-secondary);text-align:center">Flèches / WASD · Swipe mobile</div></div>`;
        renderBoard();
    }

    function renderBoard() {
        const board = document.getElementById('g2048-board');
        if (!board) return;
        board.innerHTML = '';
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
            const val = grid[r][c];
            const cell = document.createElement('div');
            cell.className = 'g2048-cell';
            if (val > 0) { cell.textContent = val; cell.dataset.val = val; }
            board.appendChild(cell);
        }
    }

    function renderStats() {
        const s = document.getElementById('g2048-score');
        const b = document.getElementById('g2048-best');
        if (s) s.textContent = score.toLocaleString('fr-FR');
        if (b) b.textContent = bestScore.toLocaleString('fr-FR');
    }

    function attachEvents() {
        const keyMap = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down', a:'left', d:'right', w:'up', s:'down', A:'left', D:'right', W:'up', S:'down' };
        const onKey = (e) => { const dir = keyMap[e.key]; if (dir) { e.preventDefault(); move(dir); } };
        addListener(document, 'keydown', onKey);
        let tx = 0, ty = 0;
        const onTouchStart = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
        const onTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
            if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
            else move(dy > 0 ? 'down' : 'up');
        };
        if (container) { addListener(container, 'touchstart', onTouchStart, {passive:true}); addListener(container, 'touchend', onTouchEnd, {passive:true}); }
        const autoSaveInterval = setInterval(() => { if (!container) { clearInterval(autoSaveInterval); return; } if (typeof GamesApi !== 'undefined' && !gameOver) GamesApi.saveGame('g2048', { grid, score }); }, 30000);
    }

    return { mount, unmount, restart, undo };
})();
