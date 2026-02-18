/**
 * GIRI MINES (Démineur) v1.0
 */
const MinesGame = (function() {
    'use strict';

    let container = null;
    let grid = [], revealed = [], flagged = [];
    let rows = 9, cols = 9, mines = 10;
    let firstClick = true, gameOver = false, timer = null, elapsed = 0;
    let listeners = [], currentDiff = 'easy';

    const CFGS = {
        easy:   { r: 9,  c: 9,  m: 10, name: 'Débutant' },
        medium: { r: 16, c: 16, m: 40, name: 'Intermédiaire' },
        hard:   { r: 16, c: 30, m: 99, name: 'Expert' }
    };

    function mount(el) { container = el; if (!container) return; startGame('easy'); }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (timer) clearInterval(timer);
        if (container) container.innerHTML = '';
        container = null;
    }

    function addListener(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); listeners.push({el, ev, fn}); }

    function startGame(diff) {
        currentDiff = diff;
        const cfg = CFGS[diff];
        rows = cfg.r; cols = cfg.c; mines = cfg.m;
        firstClick = true; gameOver = false; elapsed = 0;
        grid = Array.from({length: rows}, () => Array(cols).fill(0));
        revealed = Array.from({length: rows}, () => Array(cols).fill(false));
        flagged = Array.from({length: rows}, () => Array(cols).fill(false));
        if (timer) clearInterval(timer);
        render();
    }

    function placeMines(sr, sc) {
        let placed = 0;
        while (placed < mines) {
            const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
            if (grid[r][c] === -1) continue;
            if (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1) continue;
            grid[r][c] = -1; placed++;
        }
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            if (grid[r][c] === -1) continue;
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const nr = r+dr, nc = c+dc; if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) cnt++; }
            grid[r][c] = cnt;
        }
    }

    function reveal(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || revealed[r][c] || flagged[r][c]) return;
        revealed[r][c] = true;
        if (grid[r][c] === 0) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(r+dr, c+dc);
    }

    function leftClick(r, c) {
        if (gameOver || flagged[r][c]) return;
        if (firstClick) { placeMines(r, c); firstClick = false; timer = setInterval(() => { elapsed++; updateTimer(); }, 1000); }
        if (revealed[r][c]) return;
        reveal(r, c);
        if (grid[r][c] === -1) {
            gameOver = true; if (timer) clearInterval(timer);
            for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) if (grid[rr][cc] === -1) revealed[rr][cc] = true;
            renderBoard();
            setTimeout(() => showEnd(false), 400);
        } else { renderBoard(); checkWin(); }
    }

    function rightClick(e, r, c) {
        e.preventDefault();
        if (gameOver || revealed[r][c]) return;
        flagged[r][c] = !flagged[r][c]; renderBoard(); updateMineCount();
    }

    function checkWin() {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] !== -1 && !revealed[r][c]) return;
        gameOver = true; if (timer) clearInterval(timer);
        const score = Math.max(100, 1000 - elapsed * 2);
        if (typeof GamesState !== 'undefined') GamesState.addScore('mines', score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('mines', score, { won: true, difficulty: currentDiff, duration: elapsed });
        renderBoard(); setTimeout(() => showEnd(true), 300);
    }

    function showEnd(isWin) {
        const board = container ? container.querySelector('#mines-board') : null;
        if (!board) return;
        const score = Math.max(100, 1000 - elapsed * 2);
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;border-radius:8px;z-index:10;';
        overlay.innerHTML = `<div style="text-align:center;color:white;padding:24px;"><div style="font-size:40px;margin-bottom:8px">${isWin?'🎉':'💥'}</div><div style="font-size:22px;font-weight:700;margin-bottom:8px">${isWin?'Bravo !':'Boom !'}</div><div style="margin-bottom:16px;opacity:.8">${isWin?`Terminé en ${elapsed}s`:'Une mine explosée !'}</div>${isWin?`<div style="font-size:20px;font-weight:700;color:#a78bfa;margin-bottom:16px">+${score} pts</div>`:''}<div style="display:flex;gap:10px;justify-content:center;"><button onclick="MinesGame.restart()" style="padding:10px 18px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="GiriGames.showHome()" style="padding:10px 18px;background:rgba(255,255,255,.2);color:white;border:1px solid rgba(255,255,255,.3);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        board.style.position = 'relative'; board.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div class="mines-wrapper">
            <div class="mines-topbar">
                ${Object.entries(CFGS).map(([k,v])=>`<button class="games-btn" onclick="MinesGame.changeDiff('${k}')" style="${k===currentDiff?'background:#7c3aed;color:white;border-color:#7c3aed;':''}">${v.name}</button>`).join('')}
                <button class="games-btn" onclick="MinesGame.restart()">🔄 Nouveau</button>
            </div>
            <div style="display:flex;gap:24px;align-items:center;justify-content:center;flex-wrap:wrap;">
                <div class="mines-stat-box">
                    <div class="mines-stat-label">💣 Mines</div>
                    <div class="mines-stat-value" id="mines-count">${mines}</div>
                </div>
                <div class="mines-stat-box">
                    <div class="mines-stat-label">⏱ Temps</div>
                    <div class="mines-stat-value" id="mines-timer">0:00</div>
                </div>
            </div>
            <div class="mines-board" id="mines-board">
                <div class="mines-grid" id="mines-grid" style="grid-template-columns:repeat(${cols},36px);grid-template-rows:repeat(${rows},36px);"></div>
            </div>
            <div style="font-size:12px;color:#475569;text-align:center">Clic gauche = révéler · Clic droit = 🚩 drapeau</div>
        </div>`;
        renderBoard();
    }

    function renderBoard() {
        const gridEl = document.getElementById('mines-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';
            if (revealed[r][c]) {
                cell.classList.add('revealed');
                if (grid[r][c] === -1) { cell.classList.add('mine'); cell.textContent = '💣'; }
                else if (grid[r][c] > 0) { cell.textContent = grid[r][c]; cell.dataset.n = grid[r][c]; }
            } else if (flagged[r][c]) { cell.classList.add('flagged'); cell.textContent = '🚩'; }
            else { cell.classList.add('unrevealed'); }
            const rr = r, cc = c;
            cell.addEventListener('click', () => leftClick(rr, cc));
            cell.addEventListener('contextmenu', (e) => rightClick(e, rr, cc));
            gridEl.appendChild(cell);
        }
    }

    function updateTimer() { const el = document.getElementById('mines-timer'); if (!el) return; const m = Math.floor(elapsed/60), s = elapsed%60; el.textContent = `${m}:${s.toString().padStart(2,'0')}`; }
    function updateMineCount() { const el = document.getElementById('mines-count'); if (!el) return; let f = 0; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (flagged[r][c]) f++; el.textContent = mines - f; }
    function changeDiff(d) { startGame(d); }
    function restart() { startGame(currentDiff); }

    return { mount, unmount, restart, changeDiff };
})();
