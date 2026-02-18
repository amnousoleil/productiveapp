/**
 * GIRI MEMORY v2.0 — Fix emojis 6×6, design premium, intégration GIRIS
 */
const MemoryGame = (function() {
    'use strict';

    const EMOJIS = [
        '🐶','🐱','🦊','🐻','🐼','🦁','🐸','🦋','🌺','🎸',
        '🍕','🎮','🚀','⭐','🎯','🌈','🏆','💎','🌙','🔥',
        '❄️','🎨','🎭','🎪','🌊','🦄','🍀','🎲','🦉','🐧',
        '🐬','🦀','🌸','🍦','🎵','🏄','🦋','🌵','🍄','🦚',
        '🐙','🎃','🌻','🦜','🐳','🍓','🎈','🦊'
    ]; // 48 emojis — suffisant pour 6×6 (36 paires)

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

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function flipCard(i) {
        if (locked || flipped.includes(i) || matched.includes(i)) return;
        flipped.push(i); renderCards();
        if (flipped.length === 2) { moves++; updateStats(); locked = true; setTimeout(checkMatch, 700); }
    }

    function checkMatch() {
        const [a, b] = flipped;
        if (cards[a] === cards[b]) {
            matched.push(a, b);
            if (matched.length === cards.length) setTimeout(handleWin, 300);
        }
        flipped = []; locked = false; renderCards();
    }

    function handleWin() {
        if (timer) clearInterval(timer);
        const score = Math.max(100, 2000 - moves * 20 - elapsed * 2);
        let girisEarned = 0;
        if (typeof GamesState !== 'undefined') {
            const res = GamesState.addScore('memory', score, true);
            girisEarned = res ? res.girisEarned : 0;
        }
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore('memory', score, { won: true, duration: elapsed });
        if (size === 6 && typeof GamesAchievements !== 'undefined') GamesAchievements.unlock('memory_perfect');
        if (typeof XpFeedback !== 'undefined') XpFeedback.trigger('game_win', { el: container });

        const overlay = document.createElement('div');
        overlay.className = 'games-finish-overlay';
        overlay.innerHTML = `<div class="games-finish-box">
            <div class="finish-icon">🎉</div>
            <h2 class="finish-title">Toutes les paires !</h2>
            <div class="finish-stats-row">
                <div class="finish-stat"><div class="finish-val">${moves}</div><div class="finish-lbl">Coups</div></div>
                <div class="finish-stat"><div class="finish-val">${elapsed}s</div><div class="finish-lbl">Temps</div></div>
                <div class="finish-stat"><div class="finish-val">${score}</div><div class="finish-lbl">Score</div></div>
            </div>
            <div class="finish-giris">+${girisEarned} <span class="giri-coin">GIRIS</span></div>
            <div class="finish-actions">
                <button class="games-btn-primary" onclick="this.closest('.games-finish-overlay').remove();MemoryGame.restart()">🔄 Rejouer</button>
                <button class="games-btn" onclick="this.closest('.games-finish-overlay').remove();GiriGames.showHome()">🏠 Accueil</button>
            </div>
        </div>`;
        if (container) container.appendChild(overlay);
        else document.body.appendChild(overlay);
    }

    function render() {
        if (!container) return;
        const maxCardSize = size === 6 ? 65 : 80;
        const cardSize = Math.min(maxCardSize, Math.floor(container.offsetWidth * 0.9 / size) - 10);
        container.innerHTML = `
        <div class="memory-wrapper">
            <div class="memory-toolbar">
                <div class="memory-size-btns">
                    ${[4, 6].map(s => `<button class="games-btn ${s===size?'active':''}" onclick="MemoryGame.changeSize(${s})">${s}×${s}</button>`).join('')}
                </div>
                <button class="games-btn" onclick="MemoryGame.restart()">🔄 Nouveau</button>
                <div class="memory-live-stats">
                    🎯 <strong id="mem-moves">0</strong> coups &nbsp;·&nbsp; ⏱ <span id="mem-timer">0:00</span>
                </div>
            </div>
            <div class="memory-grid" id="memory-grid"
                style="grid-template-columns:repeat(${size},${cardSize}px)"></div>
        </div>`;
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
            card.innerHTML = `<div class="memory-card-face memory-card-back">🎮</div>
                              <div class="memory-card-face memory-card-front">${emoji}</div>`;
            card.addEventListener('click', () => flipCard(i));
            grid.appendChild(card);
        });
    }

    function updateStats() {
        const m = document.getElementById('mem-moves');
        if (m) m.textContent = moves;
    }
    function updateTimer() {
        const el = document.getElementById('mem-timer');
        if (!el) return;
        const m = Math.floor(elapsed / 60), s = elapsed % 60;
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }
    function changeSize(s) { startGame(s); }
    function restart() { startGame(size); }

    return { mount, unmount, restart, changeSize };
})();
