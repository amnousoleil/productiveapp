/**
 * GIRI BLOCKS (Tetris-style) v1.0
 */
const TetrisGame = (function() {
    'use strict';

    const COLS = 10, ROWS = 20, CELL = 28;
    const PIECES = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
    const COLORS = ['#06b6d4','#f59e0b','#a855f7','#3b82f6','#f97316','#22c55e','#ef4444'];

    let container = null, canvas = null, ctx = null, nextCanvas = null, nextCtx = null;
    let board = [], piece = null, nextPiece = null;
    let score = 0, lines = 0, level = 1, gameOver = false, paused = false;
    let dropInterval = 800, lastDrop = 0, animId = null, listeners = [];

    function mount(el) { container = el; if (!container) return; startGame(); }

    function unmount() {
        if (animId) cancelAnimationFrame(animId);
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (container) container.innerHTML = '';
        container = null; canvas = null; ctx = null;
    }

    function addListener(el, ev, fn) { el.addEventListener(ev, fn); listeners.push({el, ev, fn}); }

    function startGame() {
        board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        score = 0; lines = 0; level = 1; gameOver = false; paused = false; dropInterval = 800;
        nextPiece = randomPiece(); spawnPiece(); render(); animId = requestAnimationFrame(loop);
    }

    function randomPiece() { const i = Math.floor(Math.random() * PIECES.length); return { shape: PIECES[i].map(r=>[...r]), color: COLORS[i] }; }

    function spawnPiece() {
        piece = { ...nextPiece, x: Math.floor((COLS - nextPiece.shape[0].length) / 2), y: 0 };
        nextPiece = randomPiece();
        if (collides(piece, 0, 0)) { gameOver = true; endGame(); }
        if (nextCtx) drawNextPiece();
    }

    function collides(p, dx, dy, shape) {
        const s = shape || p.shape;
        for (let r = 0; r < s.length; r++) for (let c = 0; c < s[r].length; c++) {
            if (!s[r][c]) continue;
            const nx = p.x + c + dx, ny = p.y + r + dy;
            if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
            if (ny >= 0 && board[ny][nx]) return true;
        }
        return false;
    }

    function rotate(p) { return p.shape[0].map((_, c) => p.shape.map(r => r[c]).reverse()); }

    function lock() {
        piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) board[piece.y+r][piece.x+c] = piece.color; }));
        clearLines(); spawnPiece();
    }

    function clearLines() {
        const full = [];
        for (let r = 0; r < ROWS; r++) if (board[r].every(c => c)) full.push(r);
        if (!full.length) return;
        full.forEach(r => { board.splice(r, 1); board.unshift(Array(COLS).fill(0)); });
        const pts = [0,100,300,500,800][Math.min(full.length, 4)] * level;
        score += pts; lines += full.length; level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(80, 800 - (level-1) * 70);
        updateStats();
        if (score > 50000 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('blocks_master');
    }

    function loop(ts) {
        if (!canvas || gameOver) return;
        animId = requestAnimationFrame(loop);
        if (!paused && ts - lastDrop > dropInterval) {
            lastDrop = ts;
            if (!collides(piece, 0, 1)) piece.y++;
            else lock();
        }
        draw();
    }

    function draw() {
        if (!ctx) return;
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b';
        ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
        for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r*CELL); ctx.lineTo(COLS*CELL, r*CELL); ctx.stroke(); }
        for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c*CELL, 0); ctx.lineTo(c*CELL, ROWS*CELL); ctx.stroke(); }
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (board[r][c]) drawCell(ctx, c, r, board[r][c]);
        // Ghost
        let gy = piece.y;
        while (!collides(piece, 0, gy - piece.y + 1)) gy++;
        if (gy !== piece.y) { ctx.globalAlpha = 0.15; piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(ctx, piece.x+c, gy+r, piece.color); })); ctx.globalAlpha = 1; }
        piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(ctx, piece.x+c, piece.y+r, piece.color); }));
    }

    function drawCell(c, x, y, color) {
        c.fillStyle = color; c.fillRect(x*CELL+1, y*CELL+1, CELL-2, CELL-2);
        c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x*CELL+1, y*CELL+1, CELL-2, 4);
    }

    function drawNextPiece() {
        if (!nextCtx || !nextCanvas) return;
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b';
        nextCtx.fillStyle = bg; nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        const s = nextPiece.shape, ox = Math.floor((4-s[0].length)/2), oy = Math.floor((4-s.length)/2);
        s.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(nextCtx, ox+c, oy+r, nextPiece.color); }));
    }

    function endGame() {
        if (animId) cancelAnimationFrame(animId);
        if (typeof GamesState !== 'undefined') GamesState.addScore('tetris', score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('tetris', score, { won: false });
        if (!canvas) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;border-radius:8px;z-index:10;';
        overlay.innerHTML = `<div style="text-align:center;color:white;padding:24px;"><div style="font-size:32px;margin-bottom:8px">🧱</div><div style="font-size:20px;font-weight:700;margin-bottom:8px">Game Over</div><div style="opacity:.8;margin-bottom:8px">Score : ${score.toLocaleString('fr-FR')}</div><div style="opacity:.6;margin-bottom:16px">${lines} lignes · Niveau ${level}</div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="TetrisGame.restart()" style="padding:10px 18px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="GiriGames.showHome()" style="padding:10px 18px;background:rgba(255,255,255,.2);color:white;border:1px solid rgba(255,255,255,.3);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        canvas.parentElement.style.position = 'relative'; canvas.parentElement.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;"><div style="display:flex;gap:10px;justify-content:center;"><button class="games-btn" onclick="TetrisGame.restart()">🔄 Nouveau</button><button class="games-btn" id="tetris-pause" onclick="TetrisGame.togglePause()">⏸ Pause</button></div><div class="tetris-wrapper"><div style="position:relative;"><canvas id="tetris-canvas" class="tetris-canvas" width="${COLS*CELL}" height="${ROWS*CELL}"></canvas></div><div class="tetris-sidebar"><div style="text-align:center;"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px">Suivant</div><canvas id="tetris-next" class="tetris-next-canvas" width="${4*CELL}" height="${4*CELL}"></canvas></div><div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:var(--text-secondary)">SCORE</div><div id="tetris-score" style="font-size:20px;font-weight:700;color:var(--text-primary)">0</div></div><div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:var(--text-secondary)">LIGNES</div><div id="tetris-lines" style="font-size:20px;font-weight:700;color:var(--text-primary)">0</div></div><div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:var(--text-secondary)">NIVEAU</div><div id="tetris-level" style="font-size:20px;font-weight:700;color:var(--accent-primary,#7c3aed)">1</div></div></div></div><div style="font-size:12px;color:var(--text-secondary)">← → Déplacer · ↑ Rotation · ↓ Descendre · Espace Placer</div></div>`;
        canvas = document.getElementById('tetris-canvas'); ctx = canvas ? canvas.getContext('2d') : null;
        nextCanvas = document.getElementById('tetris-next'); nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
        attachEvents(); if (nextCtx) drawNextPiece();
    }

    function updateStats() {
        const s = document.getElementById('tetris-score'), l = document.getElementById('tetris-lines'), lv = document.getElementById('tetris-level');
        if (s) s.textContent = score.toLocaleString('fr-FR'); if (l) l.textContent = lines; if (lv) lv.textContent = level;
    }

    function attachEvents() {
        const onKey = (e) => {
            if (gameOver) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); if (!collides(piece,-1,0)) { piece.x--; draw(); } }
            else if (e.key === 'ArrowRight') { e.preventDefault(); if (!collides(piece,1,0)) { piece.x++; draw(); } }
            else if (e.key === 'ArrowDown') { e.preventDefault(); if (!collides(piece,0,1)) piece.y++; else lock(); draw(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); const r = rotate(piece); if (!collides(piece,0,0,r)) { piece.shape = r; draw(); } }
            else if (e.key === ' ') { e.preventDefault(); while (!collides(piece,0,1)) piece.y++; lock(); }
            else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); togglePause(); }
        };
        addListener(document, 'keydown', onKey);
    }

    function togglePause() {
        paused = !paused;
        const btn = document.getElementById('tetris-pause');
        if (btn) btn.textContent = paused ? '▶️ Reprendre' : '⏸ Pause';
    }

    function restart() { startGame(); }

    return { mount, unmount, restart, togglePause };
})();
