/**
 * TasksColumnResize — Redimensionnement des colonnes de tâches à la souris
 * Design : ligne lumineuse pleine hauteur + badge grip flottant au survol
 */
const TasksColumnResize = (() => {
    const STORAGE_KEY = 'productiveapp_tasks_col_widths';
    const MIN_PCT = 15;

    let widths = [33.33, 33.34, 33.33];
    let dragging = false;
    let activeHandle = -1;
    let startX = 0;
    let startWidths = [];
    let _initialized = false;
    let _styleInjected = false;

    /* ── CSS ── */
    function injectCSS() {
        if (_styleInjected) return;
        _styleInjected = true;
        const style = document.createElement('style');
        style.id = 'tasks-resize-css';
        style.textContent = `
/* ── Zone de redimensionnement ── */
#columns-view {
    position: relative !important;
}

.col-resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28px;
    transform: translateX(-50%);
    cursor: col-resize;
    z-index: 20;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

/* ── Ligne lumineuse pleine hauteur ── */
.col-resize-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
    background: transparent;
    border-radius: 2px;
    transition: background 0.22s ease, box-shadow 0.22s ease, width 0.22s ease;
    pointer-events: none;
}

.col-resize-handle:hover .col-resize-line,
.col-resize-handle.is-dragging .col-resize-line {
    background: var(--accent, #7c3aed);
    width: 2px;
    box-shadow:
        0 0 6px var(--accent, #7c3aed),
        0 0 18px rgba(124, 58, 237, 0.45),
        0 0 40px rgba(124, 58, 237, 0.18);
}

/* ── Badge grip central ── */
.col-resize-badge {
    position: absolute;
    top: 52px;
    left: 50%;
    transform: translateX(-50%) scale(0.7);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;

    background: var(--accent, #7c3aed);
    border-radius: 8px;
    padding: 7px 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 4px 16px rgba(124, 58, 237, 0.55),
        0 0 0 1px rgba(255,255,255,0.12) inset;
}

.col-resize-badge svg {
    display: block;
    color: rgba(255,255,255,0.95);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
}

.col-resize-handle:hover .col-resize-badge,
.col-resize-handle.is-dragging .col-resize-badge {
    opacity: 1;
    transform: translateX(-50%) scale(1);
}

.col-resize-handle.is-dragging .col-resize-badge {
    box-shadow:
        0 6px 24px rgba(124, 58, 237, 0.7),
        0 0 0 2px rgba(255,255,255,0.2) inset;
}

/* ── Bouton reset élégant ── */
.col-resize-reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px 5px 9px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--text-muted, #888);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border, #333);
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.18s, border-color 0.18s, background 0.18s, box-shadow 0.18s;
    white-space: nowrap;
    user-select: none;
    height: 34px;
}

.col-resize-reset-btn:hover {
    color: var(--accent, #7c3aed);
    border-color: var(--accent, #7c3aed);
    background: rgba(124, 58, 237, 0.08);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.col-resize-reset-btn .crr-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.18s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
}

.col-resize-reset-btn:hover .crr-icon {
    opacity: 1;
    transform: rotate(-180deg);
}

.col-resize-reset-btn.crr-done {
    color: #22c55e;
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
}

/* ── Pendant le drag : freeze curseur partout ── */
body.col-resizing,
body.col-resizing * {
    cursor: col-resize !important;
    user-select: none !important;
}

@media (max-width: 768px) {
    .col-resize-handle,
    .col-resize-reset-btn { display: none !important; }
}
        `;
        document.head.appendChild(style);
    }

    /* ── Storage ── */
    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (Array.isArray(parsed) && parsed.length === 3 &&
                parsed.every(v => typeof v === 'number' && v >= MIN_PCT)) {
                widths = parsed;
            }
        } catch (e) { /* ignore */ }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
    }

    /* ── Grille CSS ── */
    function apply() {
        const view = document.getElementById('columns-view');
        if (view) view.style.gridTemplateColumns = widths.map(w => w + '%').join(' ');
    }

    /* ── Reset égal ── */
    function reset() {
        widths = [33.33, 33.34, 33.33];
        save();
        apply();
        positionHandles();

        const btn = document.querySelector('.col-resize-reset-btn');
        if (btn && !btn.classList.contains('crr-done')) {
            btn.classList.add('crr-done');
            btn.querySelector('.crr-label').textContent = 'Égalisé !';
            setTimeout(() => {
                btn.classList.remove('crr-done');
                btn.querySelector('.crr-label').textContent = 'Colonnes égales';
            }, 1500);
        }
    }

    /* ── HTML du bouton reset ── */
    function resetBtnHTML() {
        return `
            <svg class="crr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
            </svg>
            <span class="crr-label">Colonnes égales</span>`;
    }

    /* ── HTML d'une poignée ── */
    function handleHTML() {
        // Badge avec 6 points grip (2 colonnes × 3 rangées)
        return `
            <div class="col-resize-line"></div>
            <div class="col-resize-badge">
                <svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor">
                    <circle cx="2.5" cy="3"  r="1.5"/>
                    <circle cx="7.5" cy="3"  r="1.5"/>
                    <circle cx="2.5" cy="9"  r="1.5"/>
                    <circle cx="7.5" cy="9"  r="1.5"/>
                    <circle cx="2.5" cy="15" r="1.5"/>
                    <circle cx="7.5" cy="15" r="1.5"/>
                </svg>
            </div>`;
    }

    /* ── Positionnement des poignées ── */
    function positionHandles() {
        const view = document.getElementById('columns-view');
        if (!view) return;
        const handles = view.querySelectorAll('.col-resize-handle');
        if (!handles.length) return;

        const totalWidth = view.offsetWidth;
        const gap = parseFloat(getComputedStyle(view).columnGap) || 24;

        const pxW0 = (widths[0] / 100) * totalWidth;
        const pxW1 = (widths[1] / 100) * totalWidth;

        if (handles[0]) handles[0].style.left = (pxW0 + gap / 2) + 'px';
        if (handles[1]) handles[1].style.left = (pxW0 + gap + pxW1 + gap / 2) + 'px';
    }

    /* ── Injection des poignées dans le DOM ── */
    function addHandles() {
        const view = document.getElementById('columns-view');
        if (!view) return;

        view.querySelectorAll('.col-resize-handle').forEach(h => h.remove());

        for (let i = 0; i < 2; i++) {
            const handle = document.createElement('div');
            handle.className = 'col-resize-handle';
            handle.dataset.handleIndex = i;
            handle.innerHTML = handleHTML();
            // Pas de title (tooltip natif) — le badge visuel suffit
            view.appendChild(handle);
            handle.addEventListener('mousedown', (e) => startDrag(e, i));
        }

        positionHandles();
    }

    /* ── Bouton reset dans la toolbar ── */
    function addResetButton() {
        if (document.querySelector('.col-resize-reset-btn')) return;
        const addBtn = document.getElementById('add-task-btn');
        if (!addBtn) return;

        const btn = document.createElement('button');
        btn.className = 'col-resize-reset-btn';
        btn.title = 'Remettre les 3 colonnes à taille égale';
        btn.innerHTML = resetBtnHTML();
        btn.addEventListener('click', reset);
        addBtn.parentNode.insertBefore(btn, addBtn.nextSibling);
    }

    /* ── Drag ── */
    function startDrag(e, handleIdx) {
        e.preventDefault();
        dragging = true;
        activeHandle = handleIdx;
        startX = e.clientX;
        startWidths = [...widths];
        document.body.classList.add('col-resizing');

        const view = document.getElementById('columns-view');
        if (view) {
            const handles = view.querySelectorAll('.col-resize-handle');
            if (handles[handleIdx]) handles[handleIdx].classList.add('is-dragging');
        }
    }

    function onMouseMove(e) {
        if (!dragging) return;
        const view = document.getElementById('columns-view');
        if (!view) return;

        const totalWidth = view.offsetWidth;
        const deltaPct = ((e.clientX - startX) / totalWidth) * 100;

        if (activeHandle === 0) {
            let w0 = Math.max(MIN_PCT, Math.min(startWidths[0] + deltaPct, 100 - MIN_PCT * 2));
            let w1 = Math.max(MIN_PCT, startWidths[1] - (w0 - startWidths[0]));
            let w2 = 100 - w0 - w1;
            if (w2 < MIN_PCT) { w2 = MIN_PCT; w1 = 100 - w0 - w2; }
            widths = [w0, w1, w2];
        } else {
            let w1 = Math.max(MIN_PCT, Math.min(startWidths[1] + deltaPct, 100 - MIN_PCT * 2));
            let w2 = Math.max(MIN_PCT, startWidths[2] - (w1 - startWidths[1]));
            let w0 = 100 - w1 - w2;
            if (w0 < MIN_PCT) { w0 = MIN_PCT; w2 = 100 - w0 - w1; }
            widths = [w0, w1, w2];
        }

        apply();
        positionHandles();
    }

    function onMouseUp() {
        if (!dragging) return;
        dragging = false;
        document.body.classList.remove('col-resizing');
        const view = document.getElementById('columns-view');
        if (view) view.querySelectorAll('.col-resize-handle').forEach(h => h.classList.remove('is-dragging'));
        save();
    }

    /* ── Init / Refresh ── */
    function init() {
        injectCSS();

        if (!_initialized) {
            load();
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            window.addEventListener('resize', () => {
                if (document.getElementById('columns-view')) positionHandles();
            });
            _initialized = true;
        }

        apply();
        addHandles();
        addResetButton();
    }

    function refresh() {
        if (!_initialized) { init(); return; }
        apply();
        addHandles();
    }

    return { init, refresh, reset, apply };
})();
