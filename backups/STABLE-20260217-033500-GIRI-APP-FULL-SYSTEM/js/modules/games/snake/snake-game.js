/**
 * GIRI SNAKE v1.0
 */
const SnakeGame = (function() {
    'use strict';

    const CELL = 20;
    let container = null, canvas = null, ctx = null;
    let snake = [], food = null, dir = 'right', nextDir = 'right';
    let score = 0, level = 1, gameOver = false;
    let animId = null, lastTime = 0, speed = 150;
    let mode = 'classic', listeners = [];

    function mount(el) { container = el; if (!container) return; startGame(); }

    function unmount() {
        if (animId) cancelAnimationFrame(animId);
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (container) container.innerHTML = '';
        container = null; canvas = null; ctx = null;
    }

    function addListener(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); listeners.push({el, ev, fn}); }

    function startGame(m) {
        if (m) mode = m;
        if (animId) cancelAnimationFrame(animId);
        snake = [{x:5,y:5},{x:4,y:5},{x:3,y:5}];
        dir = 'right'; nextDir = 'right'; score = 0; level = 1; gameOver = false; speed = 150;
        render();
        placeFood();
        animId = requestAnimationFrame(loop);
    }

    function cols() { return canvas ? Math.floor(canvas.width / CELL) : 20; }
    function rows() { return canvas ? Math.floor(canvas.height / CELL) : 20; }

    function placeFood() {
        do { food = { x: Math.floor(Math.random() * cols()), y: Math.floor(Math.random() * rows()) }; }
        while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function loop(ts) {
        if (!canvas || gameOver) return;
        animId = requestAnimationFrame(loop);
        if (ts - lastTime < speed) return;
        lastTime = ts; update(); draw();
    }

    function update() {
        dir = nextDir;
        const head = { x: snake[0].x + (dir==='right'?1:dir==='left'?-1:0), y: snake[0].y + (dir==='down'?1:dir==='up'?-1:0) };
        if (mode === 'classic') { if (head.x < 0 || head.x >= cols() || head.y < 0 || head.y >= rows()) { endGame(); return; } }
        else { head.x = ((head.x % cols()) + cols()) % cols(); head.y = ((head.y % rows()) + rows()) % rows(); }
        if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return; }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++; level = Math.floor(score / 5) + 1; speed = Math.max(60, 150 - level * 10);
            placeFood(); updateStats();
            if (score >= 100 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('snake_legend');
        } else { snake.pop(); }
    }

    function draw() {
        if (!ctx) return;
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b';
        ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Grid dots
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let x = 0; x < cols(); x++) for (let y = 0; y < rows(); y++) { ctx.beginPath(); ctx.arc(x*CELL+CELL/2, y*CELL+CELL/2, 1, 0, Math.PI*2); ctx.fill(); }
        // Food
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2); ctx.fill();
        // Snake
        snake.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#22c55e' : `rgba(34,197,94,${Math.max(0.25, 1 - i*0.04)})`;
            ctx.beginPath(); ctx.roundRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2, 4); ctx.fill();
        });
    }

    function endGame() {
        gameOver = true;
        if (animId) cancelAnimationFrame(animId);
        if (typeof GamesState !== 'undefined') GamesState.addScore('snake', score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('snake', score, { won: false });
        const parent = canvas ? canvas.parentElement : container;
        if (!parent) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;border-radius:8px;z-index:10;';
        overlay.innerHTML = `<div style="text-align:center;color:white;padding:24px;"><div style="font-size:32px;margin-bottom:8px">🐍</div><div style="font-size:20px;font-weight:700;margin-bottom:8px">Game Over</div><div style="margin-bottom:16px;opacity:.8">Score : ${score} · Niveau ${level}</div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="SnakeGame.restart()" style="padding:10px 18px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="GiriGames.showHome()" style="padding:10px 18px;background:rgba(255,255,255,.2);color:white;border:1px solid rgba(255,255,255,.3);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        parent.style.position = 'relative'; parent.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        const w = Math.floor(Math.min(window.innerWidth*0.65, 480) / CELL) * CELL;
        const h = Math.floor(Math.min(window.innerHeight*0.5, 380) / CELL) * CELL;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;"><button class="games-btn ${mode==='classic'?'':'active'}" onclick="SnakeGame.setMode('classic')" style="${mode==='classic'?'background:var(--accent-primary,#7c3aed);color:white;':''}">Classique</button><button class="games-btn" onclick="SnakeGame.setMode('infinite')" style="${mode==='infinite'?'background:var(--accent-primary,#7c3aed);color:white;':''}">Infini</button><button class="games-btn" onclick="SnakeGame.restart()">🔄 Nouveau</button><div style="font-size:13px;color:var(--text-secondary)">🎯 <strong id="snake-score">0</strong> · Niv. <strong id="snake-level">1</strong></div></div><div style="position:relative;"><canvas id="snake-canvas" class="snake-canvas" width="${w}" height="${h}"></canvas></div><div style="font-size:12px;color:var(--text-secondary)">Flèches / WASD · Swipe mobile</div></div>`;
        canvas = document.getElementById('snake-canvas');
        ctx = canvas ? canvas.getContext('2d') : null;
        attachEvents();
    }

    function updateStats() {
        const s = document.getElementById('snake-score'), l = document.getElementById('snake-level');
        if (s) s.textContent = score; if (l) l.textContent = level;
    }

    function attachEvents() {
        const dirs = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right' };
        const opp = { up:'down', down:'up', left:'right', right:'left' };
        const onKey = (e) => { const d = dirs[e.key]; if (d && d !== opp[dir]) { e.preventDefault(); nextDir = d; } };
        addListener(document, 'keydown', onKey);
        let tx = 0, ty = 0;
        const onTS = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
        const onTE = (e) => {
            const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
            if (Math.abs(dx) > Math.abs(dy)) { const d = dx > 0 ? 'right' : 'left'; if (d !== opp[dir]) nextDir = d; }
            else { const d = dy > 0 ? 'down' : 'up'; if (d !== opp[dir]) nextDir = d; }
        };
        if (canvas) { addListener(canvas, 'touchstart', onTS, {passive:true}); addListener(canvas, 'touchend', onTE, {passive:true}); }
    }

    function setMode(m) { startGame(m); }
    function restart() { startGame(mode); }

    return { mount, unmount, restart, setMode };
})();
