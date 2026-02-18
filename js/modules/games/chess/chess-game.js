/**
 * GIRI CHESS v2.0 - Powered by chess.js (MIT License)
 * Beautiful board with SVG pieces from lichess cburnett set
 */
const ChessGame = (function() {
    'use strict';

    let container = null, chess = null, selectedSq = null, validMoves = [];
    let aiLevel = 2, gameOver = false, listeners = [];
    let whiteTime = 600, blackTime = 600, clockInterval = null;

    const PIECE_PATH = '/assets/chess/';
    const FILES = ['a','b','c','d','e','f','g','h'];

    function mount(el) {
        container = el;
        if (!container) return;
        if (typeof Chess === 'undefined') {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary)">
                <div style="font-size:48px">♟️</div><p>chess.js non chargé — rechargez (Ctrl+Shift+R)</p>
            </div>`;
            return;
        }
        chess = new Chess();
        selectedSq = null; validMoves = []; gameOver = false;
        whiteTime = 600; blackTime = 600;
        render();
        startClock();
    }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (clockInterval) clearInterval(clockInterval);
        if (container) container.innerHTML = '';
        container = null; chess = null;
    }

    function addListener(el, ev, fn) {
        el.addEventListener(ev, fn);
        listeners.push({el, ev, fn});
    }

    function startClock() {
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(() => {
            if (gameOver || !chess) return;
            if (chess.turn() === 'w') whiteTime = Math.max(0, whiteTime - 1);
            else blackTime = Math.max(0, blackTime - 1);
            updateClock();
            if (whiteTime === 0 || blackTime === 0) {
                gameOver = true;
                clearInterval(clockInterval);
                showResult(whiteTime === 0 ? '⏱️ Temps écoulé — Noirs gagnent' : '⏱️ Temps écoulé — Blancs gagnent');
            }
        }, 1000);
    }

    function formatTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

    function updateClock() {
        const wc = container ? container.querySelector('#chess-white-clock') : null;
        const bc = container ? container.querySelector('#chess-black-clock') : null;
        if (wc) { wc.textContent = formatTime(whiteTime); wc.className = 'chess-clock' + (chess && chess.turn() === 'w' ? ' active' : ''); }
        if (bc) { bc.textContent = formatTime(blackTime); bc.className = 'chess-clock' + (chess && chess.turn() === 'b' ? ' active' : ''); }
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div class="chess-wrapper">
            <div class="chess-left">
                <div class="chess-player black-player">
                    <span class="chess-avatar">♟</span>
                    <span class="chess-pname">IA ${['Facile','Moyen','Expert'][aiLevel-1]}</span>
                    <div id="chess-black-clock" class="chess-clock active">${formatTime(blackTime)}</div>
                </div>
                <div class="chess-board-container">
                    <div class="chess-ranks-left"><span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span></div>
                    <div id="chess-board" class="chess-board"></div>
                </div>
                <div class="chess-files-bottom"><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span></div>
                <div class="chess-player white-player">
                    <span class="chess-avatar">♙</span>
                    <span class="chess-pname">Vous (Blancs)</span>
                    <div id="chess-white-clock" class="chess-clock active">${formatTime(whiteTime)}</div>
                </div>
            </div>
            <div class="chess-right">
                <div class="chess-controls">
                    <button class="chess-btn primary" onclick="ChessGame.newGame()">🔄 Nouvelle</button>
                    <button class="chess-btn" onclick="ChessGame.undoMove()">↩ Annuler</button>
                </div>
                <select id="chess-ai-level" class="chess-select" onchange="ChessGame.setLevel(this.value)">
                    <option value="1">IA Facile</option>
                    <option value="2" selected>IA Moyen</option>
                    <option value="3">IA Expert</option>
                </select>
                <div id="chess-status" class="chess-status">⬜ Blancs jouent</div>
                <div class="chess-moves-header">Historique des coups</div>
                <div id="chess-moves" class="chess-moves-list"></div>
                <div class="chess-tips">
                    <strong>Aide</strong>
                    <div>• Cliquez une pièce pour la sélectionner</div>
                    <div>• Cases vertes = coups valides</div>
                    <div>• Vous jouez les Blancs</div>
                </div>
            </div>
        </div>`;
        renderBoard();
        addListener(document, 'keydown', e => {
            if (e.key === 'Escape') { selectedSq = null; validMoves = []; renderBoard(); }
        });
    }

    function coordsToSq(row, col) { return FILES[col] + (8 - row); }

    function renderBoard() {
        const board = container ? container.querySelector('#chess-board') : null;
        if (!board || !chess) return;
        const pos = chess.board();
        const lastMove = chess.history({ verbose: true }).slice(-1)[0];
        board.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const sq = coordsToSq(row, col);
                const piece = pos[row][col];
                const isLight = (row + col) % 2 === 0;
                const isSelected = selectedSq === sq;
                const isValidTarget = validMoves.includes(sq);
                const isLastFrom = lastMove && lastMove.from === sq;
                const isLastTo = lastMove && lastMove.to === sq;

                const cell = document.createElement('div');
                let cls = `chess-sq ${isLight ? 'light' : 'dark'}`;
                if (isSelected) cls += ' selected';
                if (isLastFrom || isLastTo) cls += ' last-move';
                if (isValidTarget) cls += piece ? ' capture-sq' : ' valid-sq';
                cell.className = cls;
                cell.dataset.sq = sq;

                if (piece) {
                    const img = document.createElement('img');
                    img.src = `${PIECE_PATH}${piece.color}${piece.type.toUpperCase()}.svg`;
                    img.className = 'chess-piece-img';
                    img.draggable = false;
                    cell.appendChild(img);
                    if (isValidTarget) {
                        const cap = document.createElement('div');
                        cap.className = 'chess-capture-ring';
                        cell.appendChild(cap);
                    }
                } else if (isValidTarget) {
                    const dot = document.createElement('div');
                    dot.className = 'chess-move-dot';
                    cell.appendChild(dot);
                }

                cell.onclick = () => handleClick(sq);
                board.appendChild(cell);
            }
        }
        updateStatus();
        updateClock();
        renderMoves();
    }

    function handleClick(sq) {
        if (gameOver || !chess || chess.turn() !== 'w') return;
        const piece = chess.get(sq);

        if (selectedSq) {
            if (validMoves.includes(sq)) {
                const opts = { from: selectedSq, to: sq };
                const mp = chess.get(selectedSq);
                if (mp && mp.type === 'p' && (sq[1] === '8' || sq[1] === '1')) opts.promotion = 'q';
                if (chess.move(opts)) {
                    selectedSq = null; validMoves = [];
                    renderBoard();
                    checkGameOver();
                    if (!gameOver) setTimeout(doAiMove, 350);
                }
                return;
            }
            selectedSq = null; validMoves = [];
        }

        if (piece && piece.color === 'w') {
            selectedSq = sq;
            validMoves = chess.moves({ square: sq, verbose: true }).map(m => m.to);
        }
        renderBoard();
    }

    function doAiMove() {
        if (!chess || gameOver || chess.game_over()) return;
        const best = getBestMove();
        if (best && chess.move(best)) {
            renderBoard();
            checkGameOver();
        }
    }

    function getBestMove() {
        const moves = chess.moves({ verbose: true });
        if (!moves.length) return null;
        if (aiLevel === 1) return moves[Math.floor(Math.random() * moves.length)];
        const depth = aiLevel === 2 ? 2 : 3;
        let bestScore = -Infinity, bestMove = null;
        for (const m of moves) {
            chess.move(m);
            const score = -minimax(depth - 1, -Infinity, Infinity);
            chess.undo();
            if (score > bestScore) { bestScore = score; bestMove = m; }
        }
        return bestMove;
    }

    function minimax(depth, alpha, beta) {
        if (depth === 0 || chess.game_over()) return evaluate();
        for (const m of chess.moves({ verbose: true })) {
            chess.move(m);
            const score = -minimax(depth - 1, -beta, -alpha);
            chess.undo();
            alpha = Math.max(alpha, score);
            if (alpha >= beta) break;
        }
        return alpha;
    }

    const PV = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    function evaluate() {
        if (chess.in_checkmate()) return chess.turn() === 'b' ? 10000 : -10000;
        if (chess.in_draw()) return 0;
        let score = 0;
        chess.board().forEach((row, r) => row.forEach((p, c) => {
            if (!p) return;
            const center = (3.5 - Math.abs(3.5 - r)) + (3.5 - Math.abs(3.5 - c));
            score += (p.color === 'b' ? 1 : -1) * ((PV[p.type] || 0) + center * 3);
        }));
        return score;
    }

    function checkGameOver() {
        if (!chess || !chess.game_over()) return;
        gameOver = true;
        if (clockInterval) clearInterval(clockInterval);
        let msg = '🏁 Partie terminée';
        if (chess.in_checkmate()) msg = chess.turn() === 'w' ? '🏆 Les Noirs gagnent !' : '🏆 Les Blancs gagnent !';
        else if (chess.in_stalemate()) msg = '🤝 Pat — Égalité';
        else if (chess.in_draw()) msg = '🤝 Nulle';
        setTimeout(() => showResult(msg), 400);
        if (typeof GamesState !== 'undefined') {
            const won = chess.in_checkmate() && chess.turn() === 'b';
            GamesState.addScore('chess', won ? 1000 : 0);
            if (typeof GamesApi !== 'undefined') GamesApi.saveScore('chess', won ? 1000 : 0, { won });
        }
    }

    function showResult(msg) {
        const bw = container ? container.querySelector('.chess-board-container') : null;
        if (!bw) return;
        const ov = document.createElement('div');
        ov.className = 'chess-overlay';
        ov.innerHTML = `<div class="chess-overlay-box">
            <div class="chess-overlay-msg">${msg}</div>
            <div class="chess-overlay-btns">
                <button class="chess-btn primary" onclick="ChessGame.newGame()">🔄 Rejouer</button>
                <button class="chess-btn" onclick="GiriGames.showHome()">🏠 Accueil</button>
            </div>
        </div>`;
        bw.appendChild(ov);
    }

    function updateStatus() {
        const s = container ? container.querySelector('#chess-status') : null;
        if (!s || !chess || gameOver) return;
        if (chess.in_check()) s.innerHTML = `<span style="color:#ef4444">⚠️ Échec ! ${chess.turn()==='w'?'Blancs':'Noirs'} jouent</span>`;
        else s.textContent = chess.turn() === 'w' ? '⬜ Blancs jouent (vous)' : '⬛ Noirs jouent (IA)';
    }

    function renderMoves() {
        const ml = container ? container.querySelector('#chess-moves') : null;
        if (!ml || !chess) return;
        const hist = chess.history();
        if (!hist.length) { ml.innerHTML = '<div style="color:var(--text-secondary);font-size:12px;padding:8px">Aucun coup</div>'; return; }
        let html = '';
        for (let i = 0; i < hist.length; i += 2) {
            const n = Math.floor(i/2)+1;
            html += `<div class="chess-move-row">
                <span class="chess-move-num">${n}.</span>
                <span class="chess-move${i >= hist.length-2?' last':''}">${hist[i]}</span>
                ${hist[i+1] ? `<span class="chess-move${i+1 >= hist.length-2?' last':''}">${hist[i+1]}</span>` : ''}
            </div>`;
        }
        ml.innerHTML = html;
        ml.scrollTop = ml.scrollHeight;
    }

    function newGame() {
        if (clockInterval) clearInterval(clockInterval);
        chess = new Chess();
        selectedSq = null; validMoves = []; gameOver = false;
        whiteTime = 600; blackTime = 600;
        const ov = container ? container.querySelector('.chess-overlay') : null;
        if (ov) ov.remove();
        renderBoard();
        startClock();
    }

    function undoMove() {
        if (!chess || chess.history().length < 2) return;
        chess.undo(); chess.undo();
        selectedSq = null; validMoves = []; gameOver = false;
        renderBoard();
    }

    function setLevel(val) { aiLevel = parseInt(val) || 2; }

    return { mount, unmount, newGame, undoMove, setLevel };
})();
