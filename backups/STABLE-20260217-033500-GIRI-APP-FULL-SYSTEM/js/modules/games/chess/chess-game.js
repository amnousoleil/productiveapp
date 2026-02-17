/**
 * GIRI CHESS v1.0 - Chess engine with minimax AI
 */
const ChessGame = (function() {
    'use strict';

    const PAWN=1, KNIGHT=2, BISHOP=3, ROOK=4, QUEEN=5, KING=6;
    const WHITE=1, BLACK=-1;
    const CHARS = { [WHITE*PAWN]:'♙', [WHITE*KNIGHT]:'♘', [WHITE*BISHOP]:'♗', [WHITE*ROOK]:'♖', [WHITE*QUEEN]:'♕', [WHITE*KING]:'♔', [BLACK*PAWN]:'♟', [BLACK*KNIGHT]:'♞', [BLACK*BISHOP]:'♝', [BLACK*ROOK]:'♜', [BLACK*QUEEN]:'♛', [BLACK*KING]:'♚' };

    let container = null, board = [], turn = WHITE, selected = null, moves = [];
    let gameOver = false, aiLevel = 2, listeners = [];

    function mount(el) { container = el; if (!container) return; startGame(); }
    function unmount() { listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn)); listeners = []; if (container) container.innerHTML = ''; container = null; }
    function addListener(el, ev, fn) { el.addEventListener(ev, fn); listeners.push({el, ev, fn}); }

    function initBoard() {
        board = Array.from({length:8}, () => Array(8).fill(0));
        const back = [ROOK,KNIGHT,BISHOP,QUEEN,KING,BISHOP,KNIGHT,ROOK];
        for (let c = 0; c < 8; c++) { board[0][c] = BLACK*back[c]; board[1][c] = BLACK*PAWN; board[6][c] = WHITE*PAWN; board[7][c] = WHITE*back[c]; }
    }

    function startGame() { initBoard(); turn = WHITE; selected = null; moves = []; gameOver = false; render(); }

    function getMoves(r, c) {
        const p = board[r][c]; if (!p) return [];
        const color = p > 0 ? WHITE : BLACK, type = Math.abs(p), res = [];
        const add = (tr, tc) => {
            if (tr < 0||tr > 7||tc < 0||tc > 7) return false;
            const t = board[tr][tc]; if (t*color > 0) return false; res.push([tr,tc]); return t === 0;
        };
        const slide = (dr, dc) => { let tr=r+dr, tc=c+dc; while(tr>=0&&tr<=7&&tc>=0&&tc<=7){if(!add(tr,tc))break;tr+=dr;tc+=dc;} };
        if (type===PAWN) {
            const d = color===WHITE?-1:1, sr = color===WHITE?6:1;
            if (board[r+d]?.[c]===0) { res.push([r+d,c]); if (r===sr&&board[r+2*d][c]===0) res.push([r+2*d,c]); }
            for (const dc of [-1,1]) { const tc=c+dc, tr=r+d; if(tc>=0&&tc<=7&&tr>=0&&tr<=7&&board[tr][tc]*color<0) res.push([tr,tc]); }
        } else if (type===KNIGHT) { for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(r+dr,c+dc); }
        else if (type===BISHOP) { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc); }
        else if (type===ROOK) { for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
        else if (type===QUEEN) { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
        else if (type===KING) { for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) add(r+dr,c+dc); }
        return res;
    }

    function makeMove(fr, fc, tr, tc) {
        board[tr][tc] = board[fr][fc]; board[fr][fc] = 0;
        if (Math.abs(board[tr][tc])===PAWN&&(tr===0||tr===7)) board[tr][tc] = (board[tr][tc]>0?1:-1)*QUEEN;
        turn *= -1;
    }

    function clickCell(r, c) {
        if (gameOver || turn !== WHITE) return;
        if (selected) {
            if (moves.some(([mr,mc]) => mr===r&&mc===c)) {
                makeMove(selected[0], selected[1], r, c); selected = null; moves = [];
                renderBoard(); checkEnd();
                if (!gameOver) setTimeout(aiMove, 400); return;
            }
        }
        if (board[r][c]*turn > 0) { selected = [r,c]; moves = getMoves(r,c); } else { selected = null; moves = []; }
        renderBoard();
    }

    function findKing(color) { for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (board[r][c]===color*KING) return [r,c]; return null; }

    function checkEnd() {
        if (!findKing(turn)) { gameOver = true; showEnd(turn===WHITE?'♟ Les Noirs gagnent !':'♙ Les Blancs gagnent !'); if (turn===BLACK&&typeof GamesApi!=='undefined') GamesApi.saveScore('chess',100,{won:true}); }
    }

    function evaluate() {
        const vals = {[PAWN]:10,[KNIGHT]:30,[BISHOP]:30,[ROOK]:50,[QUEEN]:90,[KING]:900};
        let s = 0;
        for (let r=0;r<8;r++) for (let c=0;c<8;c++) { const p=board[r][c]; if (p) s += (p>0?1:-1)*vals[Math.abs(p)]; }
        return s;
    }

    function minimax(depth, maximizing) {
        if (depth===0) return evaluate();
        const color = maximizing ? BLACK : WHITE; let best = maximizing ? -Infinity : Infinity;
        for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
            if (board[r][c]*color >= 0) continue;
            for (const [tr,tc] of getMoves(r,c)) {
                const bak = board.map(row=>[...row]); const pt = turn;
                makeMove(r,c,tr,tc);
                const val = minimax(depth-1, !maximizing);
                board = bak; turn = pt;
                if (maximizing) best = Math.max(best, val); else best = Math.min(best, val);
            }
        }
        return best===Infinity||best===-Infinity ? evaluate() : best;
    }

    function aiMove() {
        if (gameOver || turn !== BLACK) return;
        let bestVal = -Infinity, bestM = null;
        for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
            if (board[r][c]*BLACK >= 0) continue;
            for (const [tr,tc] of getMoves(r,c)) {
                const bak = board.map(row=>[...row]); const pt = turn;
                makeMove(r,c,tr,tc);
                const val = -minimax(Math.min(aiLevel-1,1), false);
                board = bak; turn = pt;
                if (val > bestVal) { bestVal = val; bestM = {r,c,tr,tc}; }
            }
        }
        if (bestM) { makeMove(bestM.r,bestM.c,bestM.tr,bestM.tc); renderBoard(); checkEnd(); }
    }

    function showEnd(msg) {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
        el.innerHTML = `<div style="background:var(--bg-primary);border-radius:16px;padding:32px;text-align:center;max-width:320px;"><div style="font-size:48px;margin-bottom:12px">♟</div><h2 style="color:var(--text-primary);margin-bottom:20px">${msg}</h2><div style="display:flex;gap:10px;justify-content:center;"><button onclick="this.closest('[style*=fixed]').remove();ChessGame.restart()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="this.closest('[style*=fixed]').remove();GiriGames.showHome()" style="padding:10px 20px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
        document.body.appendChild(el);
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div class="chess-wrapper" style="padding:16px;"><div style="display:flex;flex-direction:column;gap:8px;"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;"><button class="games-btn" onclick="ChessGame.restart()">🔄 Nouveau</button><select class="games-btn" onchange="ChessGame.setLevel(parseInt(this.value))"><option value="1">IA Facile</option><option value="2" selected>IA Moyen</option><option value="3">IA Difficile</option></select><div id="chess-turn" style="font-size:13px;color:var(--text-secondary)">♙ Blancs jouent</div></div><div id="chess-board" style="display:grid;grid-template-columns:repeat(8,1fr);width:min(400px,90vw);aspect-ratio:1;border:2px solid var(--border-color);border-radius:8px;overflow:hidden;"></div></div><div class="chess-sidebar"><div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">AIDE</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;"><p>• Cliquez une pièce pour la sélectionner</p><p>• Cliquez une case verte pour jouer</p><p>• Les Blancs jouent en premier</p><p>• L'IA joue les Noirs</p></div></div></div>`;
        renderBoard();
    }

    function renderBoard() {
        const boardEl = document.getElementById('chess-board'), turnEl = document.getElementById('chess-turn');
        if (!boardEl) return; boardEl.innerHTML = '';
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div'), isSel = selected&&selected[0]===r&&selected[1]===c, isMove = moves.some(([mr,mc])=>mr===r&&mc===c), isLight = (r+c)%2===0;
            cell.style.cssText = `display:flex;align-items:center;justify-content:center;font-size:clamp(18px,3.5vw,30px);cursor:pointer;background:${isSel?'#7c3aed':isMove?'rgba(124,58,237,.45)':isLight?'#f0d9b5':'#b58863'};position:relative;user-select:none;transition:background 100ms;`;
            const p = board[r][c];
            if (p) { const span = document.createElement('span'); span.textContent = CHARS[p]||''; span.style.cssText = `color:${p>0?'#fffde7':'#1a1a2e'};text-shadow:${p>0?'0 1px 3px rgba(0,0,0,.8)':'0 1px 2px rgba(255,255,255,.5)'};`; cell.appendChild(span); }
            if (isMove && !p) { const dot = document.createElement('div'); dot.style.cssText = 'position:absolute;width:28%;height:28%;background:rgba(124,58,237,.5);border-radius:50%;pointer-events:none;'; cell.appendChild(dot); }
            if (isMove && p) { cell.style.boxShadow = 'inset 0 0 0 3px rgba(124,58,237,.7)'; }
            const rr=r, cc=c; cell.addEventListener('click', () => clickCell(rr, cc)); boardEl.appendChild(cell);
        }
        if (turnEl) turnEl.textContent = turn===WHITE ? '♙ Blancs jouent' : '♟ Noirs jouent (IA)';
    }

    function setLevel(l) { aiLevel = l; }
    function restart() { startGame(); }

    return { mount, unmount, restart, setLevel };
})();
