/**
 * GIRI SUDOKU v1.0
 */
const SudokuGame = (function() {
    'use strict';

    let container = null, puzzle = null, solution = null, userGrid = null, pencilMarks = null;
    let selected = null, isPencil = false, errors = 0, timer = null, elapsed = 0, difficulty = 'normal';
    let listeners = [];

    const DIFFS = { easy: { name: 'Facile', remove: 35 }, normal: { name: 'Moyen', remove: 45 }, hard: { name: 'Difficile', remove: 52 }, expert: { name: 'Expert', remove: 58 } };

    function mount(el) { container = el; if (!container) return; startNewGame('normal'); }

    function unmount() {
        listeners.forEach(({el, ev, fn}) => el.removeEventListener(ev, fn));
        listeners = [];
        if (timer) clearInterval(timer);
        if (container) container.innerHTML = '';
        container = null;
    }

    function addListener(el, ev, fn) { el.addEventListener(ev, fn); listeners.push({el, ev, fn}); }

    function startNewGame(diff) {
        difficulty = diff || difficulty; errors = 0; elapsed = 0; isPencil = false; selected = null;
        if (timer) clearInterval(timer);
        solution = generateSolution();
        puzzle = createPuzzle(solution, DIFFS[difficulty].remove);
        userGrid = puzzle.map(r => [...r]);
        pencilMarks = Array.from({length:9}, () => Array.from({length:9}, () => new Set()));
        render();
        timer = setInterval(() => { elapsed++; updateTimer(); }, 1000);
    }

    function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }

    function generateSolution() { const g=Array.from({length:9},()=>Array(9).fill(0)); fillGrid(g); return g; }

    function fillGrid(g) {
        for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (g[r][c]===0) {
            const nums = shuffle([1,2,3,4,5,6,7,8,9]);
            for (const n of nums) { if (isValid(g,r,c,n)) { g[r][c]=n; if (fillGrid(g)) return true; g[r][c]=0; } }
            return false;
        }
        return true;
    }

    function isValid(g, row, col, num) {
        if (g[row].includes(num)) return false;
        if (g.some(r => r[col]===num)) return false;
        const br=Math.floor(row/3)*3, bc=Math.floor(col/3)*3;
        for (let r=br;r<br+3;r++) for (let c=bc;c<bc+3;c++) if (g[r][c]===num) return false;
        return true;
    }

    function createPuzzle(sol, removeCount) {
        const p = sol.map(r=>[...r]); let removed = 0;
        const cells = shuffle([...Array(81)].map((_,i)=>[Math.floor(i/9),i%9]));
        for (const [r,c] of cells) {
            if (removed >= removeCount) break;
            const val = p[r][c]; p[r][c] = 0;
            const copy = p.map(r=>[...r]); if (!solveSudoku(copy)) { p[r][c]=val; continue; }
            removed++;
        }
        return p;
    }

    function solveSudoku(g) {
        for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (g[r][c]===0) {
            for (let n=1;n<=9;n++) { if (isValid(g,r,c,n)) { g[r][c]=n; if (solveSudoku(g)) return true; g[r][c]=0; } }
            return false;
        }
        return true;
    }

    function render() {
        if (!container) return;
        container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;"><select id="sudoku-diff" class="games-btn" onchange="SudokuGame.changeDiff(this.value)">${Object.entries(DIFFS).map(([k,v])=>`<option value="${k}"${k===difficulty?' selected':''}>${v.name}</option>`).join('')}</select><button class="games-btn" onclick="SudokuGame.newGame()">🔄 Nouveau</button><button class="games-btn" id="sudoku-pencil" onclick="SudokuGame.togglePencil()">✏️ Crayon</button><button class="games-btn" onclick="SudokuGame.hint()">💡 Indice</button><span style="font-size:13px;color:var(--text-secondary)">⏱ <span id="sudoku-timer">0:00</span> · ❌ <span id="sudoku-errors">${errors}</span></span></div><div class="sudoku-grid" id="sudoku-grid"></div><div class="sudoku-numpad" id="sudoku-numpad"></div></div>`;
        renderGrid(); renderNumpad(); attachKeyEvents();
    }

    function renderGrid() {
        const grid = document.getElementById('sudoku-grid');
        if (!grid) return; grid.innerHTML = '';
        for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.r = r; cell.dataset.c = c;
            if (r===2||r===5) cell.classList.add('row-border-bottom');
            const isGiven = puzzle[r][c]!==0, val = userGrid[r][c];
            if (isGiven) { cell.classList.add('given'); cell.textContent = val; }
            else if (val!==0) {
                cell.classList.add('user-filled'); cell.textContent = val;
                if (val!==solution[r][c]) cell.classList.add('error');
            } else {
                const marks = pencilMarks[r][c];
                if (marks.size>0) {
                    const m = document.createElement('div'); m.className = 'pencil-marks';
                    for (let n=1;n<=9;n++) { const s=document.createElement('span'); s.textContent=marks.has(n)?n:''; s.style.cssText='display:flex;align-items:center;justify-content:center;'; m.appendChild(s); }
                    cell.appendChild(m);
                }
            }
            if (selected&&selected[0]===r&&selected[1]===c) cell.classList.add('selected');
            else if (selected&&(selected[0]===r||selected[1]===c||(Math.floor(selected[0]/3)===Math.floor(r/3)&&Math.floor(selected[1]/3)===Math.floor(c/3)))) cell.classList.add('highlighted');
            cell.addEventListener('click', () => selectCell(r, c)); grid.appendChild(cell);
        }
    }

    function renderNumpad() {
        const np = document.getElementById('sudoku-numpad'); if (!np) return; np.innerHTML = '';
        for (let n=1;n<=9;n++) { const btn=document.createElement('button'); btn.textContent=n; btn.onclick=()=>placeNumber(n); np.appendChild(btn); }
        const del=document.createElement('button'); del.textContent='⌫'; del.onclick=()=>placeNumber(0); np.appendChild(del);
    }

    function selectCell(r, c) { selected=[r,c]; renderGrid(); }

    function placeNumber(num) {
        if (!selected) return;
        const [r,c] = selected; if (puzzle[r][c]!==0) return;
        if (isPencil) { if (num===0) pencilMarks[r][c].clear(); else if (pencilMarks[r][c].has(num)) pencilMarks[r][c].delete(num); else pencilMarks[r][c].add(num); }
        else { userGrid[r][c]=num; if (num!==0&&num!==solution[r][c]) { errors++; document.getElementById('sudoku-errors').textContent=errors; } if (num!==0) pencilMarks[r][c].clear(); checkWin(); }
        renderGrid();
    }

    function togglePencil() {
        isPencil=!isPencil;
        const btn=document.getElementById('sudoku-pencil');
        if (btn) { btn.style.background=isPencil?'var(--accent-primary,#7c3aed)':''; btn.style.color=isPencil?'white':''; }
    }

    function hint() {
        const empty=[]; for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (userGrid[r][c]===0) empty.push([r,c]);
        if (!empty.length) return;
        const [r,c]=empty[Math.floor(Math.random()*empty.length)]; userGrid[r][c]=solution[r][c]; selected=[r,c]; renderGrid(); checkWin();
    }

    function checkWin() {
        for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (userGrid[r][c]!==solution[r][c]) return;
        if (timer) clearInterval(timer);
        const pts = Math.max(100, 1000 - errors*50 - Math.floor(elapsed/10));
        if (typeof GamesState!=='undefined') GamesState.addScore('sudoku', pts);
        if (typeof GamesApi!=='undefined') GamesApi.saveScore('sudoku', pts, { won:true, difficulty, duration:elapsed });
        if (difficulty==='expert'&&typeof GamesAchievements!=='undefined') GamesAchievements.unlock('sudoku_expert');
        setTimeout(() => {
            const msg=document.createElement('div'); msg.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
            msg.innerHTML=`<div style="background:var(--bg-primary);border-radius:16px;padding:32px;text-align:center;max-width:320px;"><div style="font-size:48px;margin-bottom:12px">🎉</div><h2 style="color:var(--text-primary);margin-bottom:8px">Bravo !</h2><p style="color:var(--text-secondary);margin-bottom:8px">Terminé en ${elapsed}s avec ${errors} erreur${errors>1?'s':''}</p><div style="font-size:24px;font-weight:700;color:var(--accent-primary,#7c3aed);margin-bottom:20px">+${pts} pts</div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="this.closest('[style*=fixed]').remove();SudokuGame.newGame()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button><button onclick="this.closest('[style*=fixed]').remove();GiriGames.showHome()" style="padding:10px 20px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;cursor:pointer;">🏠 Accueil</button></div></div>`;
            document.body.appendChild(msg);
        }, 200);
    }

    function updateTimer() { const el=document.getElementById('sudoku-timer'); if (!el) return; const m=Math.floor(elapsed/60),s=elapsed%60; el.textContent=`${m}:${s.toString().padStart(2,'0')}`; }

    function attachKeyEvents() {
        const onKey = (e) => {
            if (!selected) return;
            const n = parseInt(e.key);
            if (n>=1&&n<=9) { e.preventDefault(); placeNumber(n); }
            else if (e.key==='Backspace'||e.key==='Delete'||e.key==='0') { e.preventDefault(); placeNumber(0); }
            else if (e.key==='ArrowUp'&&selected[0]>0) { selected[0]--; renderGrid(); }
            else if (e.key==='ArrowDown'&&selected[0]<8) { selected[0]++; renderGrid(); }
            else if (e.key==='ArrowLeft'&&selected[1]>0) { selected[1]--; renderGrid(); }
            else if (e.key==='ArrowRight'&&selected[1]<8) { selected[1]++; renderGrid(); }
        };
        addListener(document, 'keydown', onKey);
    }

    function changeDiff(d) { startNewGame(d); }
    function newGame() { startNewGame(difficulty); }

    return { mount, unmount, newGame, changeDiff, togglePencil, hint };
})();
