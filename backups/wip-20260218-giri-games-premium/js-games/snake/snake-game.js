/**
 * GIRI SNAKE v2.0 - Neon Edition
 * World-class visuals with glow, particle trail, gradient body
 */
const SnakeGame = (function() {
    'use strict';

    const CELL = 22;
    let container = null, canvas = null, ctx = null;
    let snake = [], food = null, dir = 'right', nextDir = 'right';
    let score = 0, level = 1, gameOver = false;
    let animId = null, lastTime = 0, speed = 160;
    let mode = 'classic', listeners = [];
    let particles = [], foodPulse = 0, frameCount = 0;

    // Particle class for eating effects
    function createParticle(x, y, color) {
        return {
            x: x * CELL + CELL/2, y: y * CELL + CELL/2,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            life: 1.0, size: Math.random() * 4 + 2, color
        };
    }

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
        dir = 'right'; nextDir = 'right'; score = 0; level = 1;
        gameOver = false; speed = 160; particles = []; foodPulse = 0; frameCount = 0;
        render();
        placeFood();
        lastTime = 0;
        animId = requestAnimationFrame(loop);
    }

    function cols() { return canvas ? Math.floor(canvas.width / CELL) : 20; }
    function rows() { return canvas ? Math.floor(canvas.height / CELL) : 18; }

    function placeFood() {
        do { food = { x: Math.floor(Math.random() * cols()), y: Math.floor(Math.random() * rows()) }; }
        while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function loop(ts) {
        if (!canvas || gameOver) return;
        animId = requestAnimationFrame(loop);
        frameCount++;
        // Always draw (for animations), but only update logic at speed interval
        if (ts - lastTime >= speed) {
            lastTime = ts; update();
        }
        draw();
    }

    function update() {
        dir = nextDir;
        const head = { x: snake[0].x + (dir==='right'?1:dir==='left'?-1:0), y: snake[0].y + (dir==='down'?1:dir==='up'?-1:0) };
        if (mode === 'classic') { if (head.x < 0 || head.x >= cols() || head.y < 0 || head.y >= rows()) { endGame(); return; } }
        else { head.x = ((head.x % cols()) + cols()) % cols(); head.y = ((head.y % rows()) + rows()) % rows(); }
        if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return; }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++; level = Math.floor(score / 5) + 1; speed = Math.max(65, 160 - level * 10);
            // Spawn eat particles
            for (let i = 0; i < 12; i++) particles.push(createParticle(food.x, food.y, i%2===0?'#ef4444':'#f97316'));
            placeFood(); updateStats();
            if (score >= 100 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('snake_legend');
        } else { snake.pop(); }
    }

    function draw() {
        if (!ctx || !canvas) return;
        const W = canvas.width, H = canvas.height;

        // === BACKGROUND: Deep space ===
        ctx.fillStyle = '#060612';
        ctx.fillRect(0, 0, W, H);

        // === GRID: Subtle neon lines ===
        ctx.strokeStyle = 'rgba(100, 120, 255, 0.06)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= cols(); x++) {
            ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, H); ctx.stroke();
        }
        for (let y = 0; y <= rows(); y++) {
            ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(W, y*CELL); ctx.stroke();
        }

        // === PARTICLES ===
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.vx *= 0.95; p.vy *= 0.95;
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 8; ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        // === FOOD: Pulsing red orb ===
        if (food) {
            foodPulse += 0.08;
            const pulse = Math.sin(foodPulse) * 0.25 + 0.75;
            const fx = food.x * CELL + CELL/2, fy = food.y * CELL + CELL/2;
            const fr = (CELL/2 - 3) * pulse;

            // Outer glow rings
            ctx.shadowBlur = 20 + Math.sin(foodPulse)*8;
            ctx.shadowColor = '#ef4444';
            const foodGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr + 4);
            foodGrad.addColorStop(0, '#ff6b6b');
            foodGrad.addColorStop(0.5, '#ef4444');
            foodGrad.addColorStop(1, '#991b1b');
            ctx.fillStyle = foodGrad;
            ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI*2); ctx.fill();

            // Shine
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath(); ctx.arc(fx - fr*0.3, fy - fr*0.3, fr * 0.25, 0, Math.PI*2); ctx.fill();
        }

        // === SNAKE: Neon gradient segments ===
        snake.forEach((seg, i) => {
            const ratio = i / Math.max(snake.length - 1, 1);
            const sx = seg.x * CELL + 1, sy = seg.y * CELL + 1, ss = CELL - 2;
            const cx = sx + ss/2, cy = sy + ss/2;

            if (i === 0) {
                // HEAD: Bright neon green with strong glow
                ctx.shadowBlur = 18;
                ctx.shadowColor = '#4ade80';
                const headGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ss/2);
                headGrad.addColorStop(0, '#86efac');
                headGrad.addColorStop(0.5, '#22c55e');
                headGrad.addColorStop(1, '#16a34a');
                ctx.fillStyle = headGrad;
            } else {
                // BODY: Gradient from green to teal to blue, fading
                const alpha = Math.max(0.3, 1 - ratio * 0.6);
                const r = Math.floor(34 + ratio * 30);
                const g = Math.floor(197 - ratio * 80);
                const b = Math.floor(94 + ratio * 150);
                ctx.shadowBlur = 10 - ratio * 6;
                ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            }

            // Rounded rect segment
            const r = i === 0 ? 7 : 5;
            ctx.beginPath();
            ctx.roundRect(sx, sy, ss, ss, r);
            ctx.fill();

            // Head eyes
            if (i === 0) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffffff';
                const eyeOffset = CELL * 0.22;
                const eyeSize = CELL * 0.13;
                if (dir === 'right' || dir === 'left') {
                    const ex = dir === 'right' ? cx + CELL*0.18 : cx - CELL*0.18;
                    ctx.beginPath(); ctx.arc(ex, cy - eyeOffset, eyeSize, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(ex, cy + eyeOffset, eyeSize, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#1a1a1a';
                    ctx.beginPath(); ctx.arc(ex + (dir==='right'?1.5:-1.5), cy - eyeOffset, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(ex + (dir==='right'?1.5:-1.5), cy + eyeOffset, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                } else {
                    const ey = dir === 'down' ? cy + CELL*0.18 : cy - CELL*0.18;
                    ctx.beginPath(); ctx.arc(cx - eyeOffset, ey, eyeSize, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + eyeOffset, ey, eyeSize, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#1a1a1a';
                    ctx.beginPath(); ctx.arc(cx - eyeOffset, ey + (dir==='down'?1.5:-1.5), eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + eyeOffset, ey + (dir==='down'?1.5:-1.5), eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                }
            }
        });

        ctx.shadowBlur = 0;

        // === SCORE OVERLAY ===
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${score}`, 10, H - 10);
        ctx.textAlign = 'right';
        ctx.fillText(`LVL ${level}`, W - 10, H - 10);
        ctx.textAlign = 'left';
    }

    function endGame() {
        gameOver = true;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (typeof GamesState !== 'undefined') GamesState.addScore('snake', score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('snake', score, { won: false });
        const parent = canvas ? canvas.parentElement : container;
        if (!parent) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;border-radius:8px;z-index:10;backdrop-filter:blur(4px);';
        overlay.innerHTML = `<div style="text-align:center;color:white;padding:24px;">
            <div style="font-size:48px;margin-bottom:8px">🐍</div>
            <div style="font-size:24px;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#22c55e,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Game Over</div>
            <div style="margin-bottom:6px;color:#94a3b8">Score : <strong style="color:#f8fafc">${score}</strong> · Niveau <strong style="color:#f8fafc">${level}</strong></div>
            <div style="margin-bottom:20px;color:#a78bfa;font-size:18px;font-weight:700">+${score * 10} XP</div>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button onclick="SnakeGame.restart()" style="padding:10px 18px;background:linear-gradient(135deg,#16a34a,#22c55e);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button>
                <button onclick="GiriGames.showHome()" style="padding:10px 18px;background:rgba(255,255,255,.1);color:white;border:1px solid rgba(255,255,255,.2);border-radius:8px;cursor:pointer;">🏠 Accueil</button>
            </div>
        </div>`;
        parent.style.position = 'relative'; parent.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        const W = Math.floor(Math.min(window.innerWidth * 0.65, 500) / CELL) * CELL;
        const H = Math.floor(Math.min(window.innerHeight * 0.55, 420) / CELL) * CELL;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;">
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;">
                <button class="games-btn" onclick="SnakeGame.setMode('classic')" style="${mode==='classic'?'background:#22c55e;color:#000;border-color:#22c55e;':''}">🧱 Murs</button>
                <button class="games-btn" onclick="SnakeGame.setMode('infinite')" style="${mode==='infinite'?'background:#22c55e;color:#000;border-color:#22c55e;':''}">♾️ Infini</button>
                <button class="games-btn" onclick="SnakeGame.restart()">🔄 Nouveau</button>
            </div>
            <div style="position:relative;">
                <canvas id="snake-canvas" class="snake-canvas" width="${W}" height="${H}" style="border-radius:12px;box-shadow:0 0 40px rgba(34,197,94,0.2),0 0 80px rgba(34,197,94,0.05),0 8px 32px rgba(0,0,0,0.5);"></canvas>
            </div>
            <div style="font-size:12px;color:#475569;text-align:center">⬆️⬇️⬅️➡️ Flèches · WASD · Swipe</div>
        </div>`;
        canvas = document.getElementById('snake-canvas');
        ctx = canvas ? canvas.getContext('2d') : null;
        attachEvents();
    }

    function updateStats() {
        // Stats are drawn on canvas, nothing extra needed
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
