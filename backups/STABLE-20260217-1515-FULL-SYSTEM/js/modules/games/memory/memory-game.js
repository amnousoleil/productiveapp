/**
 * GIRI MEMORY v1.0
 */
const MemoryGame = (function() {
    'use strict';

    const EMOJIS = ['🐶','🐱','🦊','🐻','🐼','🦁','🐸','🦋','🌺','🎸','🍕','🎮','🚀','⭐','🎯','🌈','🏆','💎','🌙','🔥','❄️','🎨','🎭','🎪','🌊','🦄','🍀','🎲','🦉','🐧','🐬','🦀'];

    let container = null, cards = [], flipped = [], matched = [];
    let moves = 0, locked = false, size = 4, timer = null, elapsed = 0;
    let listeners = [];

    function mount(el) { container = el; if (!container) return; startGame(4); }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (timer) clearInterval(timer);
        if (container) container.innerHTML = '';
        container = null;
    }

    function startGame(s) {
        size = s; moves = 0; elapsed = 0; flipped = []; matched = []; locked = false;
        const pairs = (size * size) / 2;
        const emojis = EMOJIS.slice(0, pairs);
        cards = shuffle([...emojis, ...emojis]);
        if (timer) clearInterval(timer);
        timer = setInterval(() => { elapsed++; updateTimer(); }, 1000);
        render();
    }

    function shuffle(arr) { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }

    function flipCard(i) {
        if (locked || flipped.includes(i) || matched.includes(i)) return;
        flipped.push(i); renderCards();
        if (flipped.length === 2) { moves++; updateStats(); locked = true; setTimeout(checkMatch, 700); }
    }

    function checkMatch() {
        const [a, b] = flipped;
        if (cards[a] === cards[b]) { matched.push(a, b); if (matched.length === cards.length) setTimeout(handleWin, 300); }
        flipped = []; locked = false; renderCards();
    }

    function handleWin() {
        if (timer) clearInterval(timer);
        const score = Math.max(100, 2000 - moves * 20 - elapsed * 2);
        if (typeof GamesState !== 'undefined') GamesState.addScore('memory', score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('memory', score, { won: true, duration: elapsed });
        if (size === 8 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('memory_perfect');
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
        overlay.innerHTML = `<div style="background:var(--bg-primary);border-radius:16px;padding:32px;text-align:center;max-width:320px;"><div style="font-size:48px;margin-bottom:12px">🎉</div><h2 style="color:var(--text-primary);margin-bottom:8px">Terminé !</h2><p style="color:var(--text-secondary);margin-bottom:8px">${moves} coups · ${elapsed}s</p><div style="font-size:24px;font-weight:700;color:var(--accent-primary,#7c3aed);margin-bottom:20px">+${score} pts</div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="this.closest('[style*=fixed]').remove();MemoryGame.restart()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="this.closest('[style*=fixed]').remove();GiriGames.showHome()" style="padding:10px 20px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        document.body.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        const cardSize = Math.min(80, Math.floor((window.innerWidth * 0.7) / size) - 12);
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;">${[4,6].map(s=>`<button class="games-btn" onclick="MemoryGame.changeSize(${s})" style="${s===size?'background:var(--accent-primary,#7c3aed);color:white;':''}">${s}×${s}</button>`).join('')}<button class="games-btn" onclick="MemoryGame.restart()">🔄 Nouveau</button><div style="font-size:13px;color:var(--text-secondary)">🎯 <strong id="mem-moves">0</strong> coups · ⏱ <span id="mem-timer">0:00</span></div></div><div class="memory-grid" id="memory-grid" style="grid-template-columns:repeat(${size},${cardSize}px);width:fit-content;"></div></div>`;
        renderCards();
    }

    function renderCards() {
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        grid.innerHTML = '';
        cards.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            if (flipped.includes(i) || matched.includes(i)) card.classList.add('flipped');
            if (matched.includes(i)) card.classList.add('matched');
            card.innerHTML = `<div class="memory-card-face memory-card-back">🎮</div><div class="memory-card-face memory-card-front">${emoji}</div>`;
            card.addEventListener('click', () => flipCard(i));
            grid.appendChild(card);
        });
    }

    function updateStats() { const m = document.getElementById('mem-moves'); if (m) m.textContent = moves; }
    function updateTimer() { const el = document.getElementById('mem-timer'); if (!el) return; const m = Math.floor(elapsed/60), s = elapsed%60; el.textContent = `${m}:${s.toString().padStart(2,'0')}`; }
    function changeSize(s) { startGame(s); }
    function restart() { startGame(size); }

    return { mount, unmount, restart, changeSize };
})();
