/**
 * Animation Studio v1.0
 * Sélecteur d'animations intégré au modal de thèmes
 * Design ultra-ergonomique — assigne n'importe quelle animation à n'importe quel thème
 */
const AnimationStudio = (function () {
    'use strict';

    // Catalogue — IDs = clés AT (animation engine types)
    const ANIMS = [
        // ÉLÉGANCE
        { id: 'executive',   name: 'Executive',       cat: 'elegance',    icon: '⚡',  bg: 'linear-gradient(160deg,#0d0d0d,#1a1a1a)',  acc: '#d4af37', anim: 'float'   },
        { id: 'corporate',   name: 'Corporate',        cat: 'elegance',    icon: '💼',  bg: 'linear-gradient(160deg,#0a1628,#0f1e35)',  acc: '#6495ed', anim: 'rain'    },
        { id: 'diplomat',    name: 'Diplomat',         cat: 'elegance',    icon: '👑',  bg: 'linear-gradient(160deg,#1a0a00,#2e1000)',  acc: '#ffd700', anim: 'rain'    },
        { id: 'sterling',    name: 'Sterling',         cat: 'elegance',    icon: '🥈',  bg: 'linear-gradient(160deg,#0d0d0d,#1a1a1a)',  acc: '#c0c0c0', anim: 'drift'   },
        { id: 'ivory',       name: 'Ivory',            cat: 'elegance',    icon: '🌙',  bg: 'linear-gradient(160deg,#1a1812,#2e2e20)',  acc: '#f5f0e8', anim: 'pulse'   },
        { id: 'academie',    name: 'Académie',         cat: 'elegance',    icon: '📐',  bg: 'linear-gradient(160deg,#12100e,#1e1c18)',  acc: '#c9a96e', anim: 'float'   },
        // NATURE
        { id: 'ocean',       name: 'Océan',            cat: 'nature',      icon: '🌊',  bg: 'linear-gradient(160deg,#020b1a,#051630)',  acc: '#38bdf8', anim: 'wave'    },
        { id: 'forest',      name: 'Forêt',            cat: 'nature',      icon: '🌿',  bg: 'linear-gradient(160deg,#050e03,#0d1c09)',  acc: '#22c55e', anim: 'rise'    },
        { id: 'sunset',      name: 'Sunset',           cat: 'nature',      icon: '🌅',  bg: 'linear-gradient(160deg,#1a0800,#2e1200)',  acc: '#f97316', anim: 'rise'    },
        { id: 'desert',      name: 'Désert',           cat: 'nature',      icon: '🏜️', bg: 'linear-gradient(160deg,#1a1000,#2e1e00)',  acc: '#D4A017', anim: 'drift'   },
        { id: 'lavender',    name: 'Lavande',          cat: 'nature',      icon: '💜',  bg: 'linear-gradient(160deg,#1a0a2e,#120820)',  acc: '#a78bfa', anim: 'float'   },
        { id: 'sakura',      name: 'Sakura',           cat: 'nature',      icon: '🌸',  bg: 'linear-gradient(160deg,#1a0510,#2e0820)',  acc: '#f9a8d4', anim: 'float'   },
        { id: 'moss',        name: 'Mousse',           cat: 'nature',      icon: '🍀',  bg: 'linear-gradient(160deg,#051205,#0a1e0a)',  acc: '#10b981', anim: 'drift'   },
        // ATMOSPHÈRE
        { id: 'aurora',      name: 'Aurora',           cat: 'atmosphere',  icon: '🌌',  bg: 'linear-gradient(160deg,#020b14,#03141f)',  acc: '#34d399', anim: 'wave'    },
        { id: 'midnight',    name: 'Minuit',           cat: 'atmosphere',  icon: '🌑',  bg: 'linear-gradient(160deg,#020209,#04040f)',  acc: '#818cf8', anim: 'twinkle' },
        { id: 'twilight',    name: 'Crépuscule',       cat: 'atmosphere',  icon: '🌆',  bg: 'linear-gradient(160deg,#0d0512,#1a0a2e)',  acc: '#c084fc', anim: 'pulse'   },
        { id: 'candlelight', name: 'Bougie',           cat: 'atmosphere',  icon: '🕯️', bg: 'linear-gradient(160deg,#100500,#1e0a00)',  acc: '#fb923c', anim: 'rise'    },
        { id: 'moonlit',     name: 'Clair de lune',    cat: 'atmosphere',  icon: '🌕',  bg: 'linear-gradient(160deg,#050510,#0a0a1e)',  acc: '#e2e8f0', anim: 'pulse'   },
        { id: 'goldenhour',  name: 'Golden Hour',      cat: 'atmosphere',  icon: '✨',  bg: 'linear-gradient(160deg,#1a0e00,#2e1800)',  acc: '#fbbf24', anim: 'twinkle' },
        { id: 'storm',       name: 'Tempête',          cat: 'atmosphere',  icon: '⛈️', bg: 'linear-gradient(160deg,#030a0d,#060f14)',  acc: '#38bdf8', anim: 'rain'    },
        { id: 'ember',       name: 'Braises',          cat: 'atmosphere',  icon: '🔥',  bg: 'linear-gradient(160deg,#100200,#1e0400)',  acc: '#ef4444', anim: 'rise'    },
        // MODERNE
        { id: 'bubblegum',   name: 'Bubblegum',        cat: 'moderne',     icon: '🫧',  bg: 'linear-gradient(160deg,#1a0520,#2e0a35)',  acc: '#f472b6', anim: 'rise'    },
        { id: 'neonp',       name: 'Néon',             cat: 'moderne',     icon: '💡',  bg: 'linear-gradient(160deg,#0a001a,#10002e)',  acc: '#a855f7', anim: 'twinkle' },
        { id: 'pastel',      name: 'Pastel',           cat: 'moderne',     icon: '🎨',  bg: 'linear-gradient(160deg,#fff5f0,#ffeef8)',  acc: '#f9a8d4', anim: 'pulse'   },
        { id: 'retrowave',   name: 'Retrowave',        cat: 'moderne',     icon: '🌆',  bg: 'linear-gradient(160deg,#080018,#100028)',  acc: '#f43f5e', anim: 'wave'    },
        { id: 'mint',        name: 'Menthe',           cat: 'moderne',     icon: '🌱',  bg: 'linear-gradient(160deg,#f0fff4,#ecfdf5)',  acc: '#10b981', anim: 'float'   },
        { id: 'coral',       name: 'Corail',           cat: 'moderne',     icon: '🪸',  bg: 'linear-gradient(160deg,#00080f,#001018)',  acc: '#fb7185', anim: 'wave'    },
        // MINIMALISTE
        { id: 'obsidian',    name: 'Obsidian',         cat: 'minimaliste', icon: '🖤',  bg: 'linear-gradient(160deg,#050505,#0a0a0a)',  acc: '#6366f1', anim: 'twinkle' },
        { id: 'paper',       name: 'Paper',            cat: 'minimaliste', icon: '📄',  bg: 'linear-gradient(160deg,#f5f0e8,#ede8d8)',  acc: '#92400e', anim: 'drift'   },
        { id: 'clay',        name: 'Clay',             cat: 'minimaliste', icon: '🏺',  bg: 'linear-gradient(160deg,#1a0a05,#2e1508)',  acc: '#C4783C', anim: 'drift'   },
        { id: 'porcelain',   name: 'Porcelaine',       cat: 'minimaliste', icon: '🫖',  bg: 'linear-gradient(160deg,#f8f4f0,#f0ebe4)',  acc: '#9ca3af', anim: 'pulse'   },
        { id: 'espresso',    name: 'Espresso',         cat: 'minimaliste', icon: '☕',  bg: 'linear-gradient(160deg,#0a0600,#140d00)',  acc: '#92400e', anim: 'rise'    },
        { id: 'zen',         name: 'Zen',              cat: 'minimaliste', icon: '☯️', bg: 'linear-gradient(160deg,#f5f5f5,#ebebeb)',  acc: '#6b7280', anim: 'pulse'   },
        { id: 'snow',        name: 'Neige',            cat: 'minimaliste', icon: '❄️',  bg: 'linear-gradient(160deg,#0a0f1e,#0f1830)',  acc: '#e2e8f0', anim: 'rain'    },
        // TECH
        { id: 'matrix',      name: 'Matrix',           cat: 'tech',        icon: '🟩',  bg: 'linear-gradient(160deg,#000a00,#001400)',  acc: '#00ff41', anim: 'rain'    },
        { id: 'cyberpunk',   name: 'Cyberpunk',        cat: 'tech',        icon: '🤖',  bg: 'linear-gradient(160deg,#050010,#0a0020)',  acc: '#f0abfc', anim: 'wave'    },
        { id: 'terminal',    name: 'Terminal',         cat: 'tech',        icon: '💻',  bg: 'linear-gradient(160deg,#000a00,#001000)',  acc: '#4ade80', anim: 'rain'    },
        { id: 'trongrid',    name: 'Tron',             cat: 'tech',        icon: '🔷',  bg: 'linear-gradient(160deg,#000510,#000a20)',  acc: '#38bdf8', anim: 'wave'    },
        { id: 'hologram',    name: 'Hologramme',       cat: 'tech',        icon: '🌀',  bg: 'linear-gradient(160deg,#000f14,#001e28)',  acc: '#22d3ee', anim: 'twinkle' },
        { id: 'pipboy',      name: 'Pip-Boy',          cat: 'tech',        icon: '📟',  bg: 'linear-gradient(160deg,#000a00,#001200)',  acc: '#86efac', anim: 'twinkle' },
        // ARTISTE
        { id: 'watercolor',  name: 'Aquarelle',        cat: 'artiste',     icon: '🖌️', bg: 'linear-gradient(160deg,#f8f4ff,#f0e8ff)',  acc: '#a78bfa', anim: 'pulse'   },
        { id: 'nordic',      name: 'Nordic',           cat: 'artiste',     icon: '❄️',  bg: 'linear-gradient(160deg,#050a1e,#0a1028)',  acc: '#bfdbfe', anim: 'float'   },
        { id: 'artdeco',     name: 'Art Déco',         cat: 'artiste',     icon: '🏛️', bg: 'linear-gradient(160deg,#0a0800,#141000)',  acc: '#fbbf24', anim: 'twinkle' },
        { id: 'cosmic',      name: 'Cosmic',           cat: 'artiste',     icon: '🌌',  bg: 'linear-gradient(160deg,#020010,#050020)',  acc: '#c084fc', anim: 'twinkle' },
        { id: 'ukiyoe',      name: 'Ukiyo-e',          cat: 'artiste',     icon: '🗾',  bg: 'linear-gradient(160deg,#020818,#040f28)',  acc: '#60a5fa', anim: 'wave'    },
        // SAISONS
        { id: 'printemps',   name: 'Printemps',        cat: 'saisons',     icon: '🌺',  bg: 'linear-gradient(160deg,#fff0f5,#ffe4ef)',  acc: '#f9a8d4', anim: 'float'   },
        { id: 'ete',         name: 'Été',              cat: 'saisons',     icon: '☀️',  bg: 'linear-gradient(160deg,#fff8e1,#fff3c4)',  acc: '#fbbf24', anim: 'pulse'   },
        { id: 'automne',     name: 'Automne',          cat: 'saisons',     icon: '🍂',  bg: 'linear-gradient(160deg,#1a0800,#2e1000)',  acc: '#f97316', anim: 'float'   },
        { id: 'hiver',       name: 'Hiver',            cat: 'saisons',     icon: '🌨️', bg: 'linear-gradient(160deg,#050a1e,#0a1028)',  acc: '#bae6fd', anim: 'drift'   },
        // PRÉCIEUX
        { id: 'amethyst',    name: 'Améthyste',        cat: 'precieux',    icon: '💎',  bg: 'linear-gradient(160deg,#0a0520,#100a35)',  acc: '#c084fc', anim: 'twinkle' },
        { id: 'jade',        name: 'Jade',             cat: 'precieux',    icon: '🟢',  bg: 'linear-gradient(160deg,#02100a,#041e14)',  acc: '#34d399', anim: 'wave'    },
        { id: 'ruby',        name: 'Ruby',             cat: 'precieux',    icon: '❤️',  bg: 'linear-gradient(160deg,#100002,#1e0004)',  acc: '#f43f5e', anim: 'pulse'   },
        { id: 'pearl',       name: 'Perle',            cat: 'precieux',    icon: '🪬',  bg: 'linear-gradient(160deg,#f0f4f8,#e8eef4)',  acc: '#e2e8f0', anim: 'float'   },
        { id: 'copper',      name: 'Cuivre',           cat: 'precieux',    icon: '🟤',  bg: 'linear-gradient(160deg,#0f0500,#1e0a00)',  acc: '#f97316', anim: 'rise'    },
        // VOYAGE
        { id: 'waves',       name: 'Fjord',            cat: 'voyage',      icon: '🏔️', bg: 'linear-gradient(160deg,#030a14,#051428)',  acc: '#34d399', anim: 'wave'    },
        { id: 'bamboo',      name: 'Bambou',           cat: 'voyage',      icon: '🎋',  bg: 'linear-gradient(160deg,#f5fff0,#eaffea)',  acc: '#86efac', anim: 'wave'    },
        { id: 'provence',    name: 'Provence',         cat: 'voyage',      icon: '🌾',  bg: 'linear-gradient(160deg,#f5f0ff,#ede8ff)',  acc: '#a78bfa', anim: 'wave'    },
        // AUTRES
        { id: 'charcoal',    name: 'Charcoal',         cat: 'autres',      icon: '💨',  bg: 'linear-gradient(160deg,#050505,#0a0a0a)',  acc: '#6b7280', anim: 'rise'    },
    ];

    const CATS = [
        { id: 'all', name: 'Tout', icon: '✨' },
        { id: 'elegance', name: 'Élégance', icon: '💼' },
        { id: 'nature', name: 'Nature', icon: '🌿' },
        { id: 'atmosphere', name: 'Atmosphère', icon: '🌌' },
        { id: 'moderne', name: 'Moderne', icon: '🎨' },
        { id: 'minimaliste', name: 'Minimaliste', icon: '○' },
        { id: 'tech', name: 'Tech', icon: '💻' },
        { id: 'artiste', name: 'Artiste', icon: '🖌️' },
        { id: 'saisons', name: 'Saisons', icon: '🍂' },
        { id: 'precieux', name: 'Précieux', icon: '💎' },
        { id: 'voyage', name: 'Voyage', icon: '🗺️' },
        { id: 'autres', name: 'Autres', icon: '✦' },
    ];

    let activeFilter = 'all';
    let searchQuery = '';
    let initialized = false;

    // ── Helpers ──────────────────────────────────────────────────
    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'midnight';
    }

    function getCustom(theme) {
        return localStorage.getItem('as_anim_' + theme) || null;
    }

    function getDefault(theme) {
        if (window.AnimEngine && window.AnimEngine.getDefaultType) {
            return window.AnimEngine.getDefaultType(theme);
        }
        return null;
    }

    function getAnimName(animId) {
        if (!animId || animId === 'none') return 'Aucune animation';
        const a = ANIMS.find(x => x.id === animId);
        return a ? a.name : animId;
    }

    function applyAnim(theme, animId) {
        if (window.AnimEngine && window.AnimEngine.setThemeAnimation) {
            window.AnimEngine.setThemeAnimation(theme, animId);
        } else {
            if (animId && animId !== 'none') {
                localStorage.setItem('as_anim_' + theme, animId);
            } else if (animId === 'none') {
                localStorage.setItem('as_anim_' + theme, 'none');
            } else {
                localStorage.removeItem('as_anim_' + theme);
            }
        }
    }

    function getFiltered() {
        let list = ANIMS;
        if (activeFilter !== 'all') list = list.filter(a => a.cat === activeFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(a => a.name.toLowerCase().includes(q) || a.cat.includes(q));
        }
        return list;
    }

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        if (initialized) return;
        const modal = document.getElementById('theme-modal');
        if (!modal) {
            // Retry once DOM is ready
            setTimeout(init, 500);
            return;
        }
        initialized = true;
        injectTabs(modal);
        buildPanel(modal);
        watchModal(modal);
        watchThemeChange();
    }

    function watchModal(modal) {
        const obs = new MutationObserver(() => {
            if (!modal.classList.contains('hidden')) refreshAll();
        });
        obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    function watchThemeChange() {
        // Re-render when theme changes (data-theme attribute)
        const obs = new MutationObserver(() => refreshAll());
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // ── Tab Injection ─────────────────────────────────────────────
    function injectTabs(modal) {
        const box = modal.querySelector('.modal-box.theme-selector-modal');
        if (!box || box.querySelector('.astudio-tabs')) return;

        // Create tab bar
        const tabs = document.createElement('div');
        tabs.className = 'astudio-tabs';
        tabs.innerHTML = `
            <button class="astudio-tab active" data-tab="themes">🎨 Thèmes</button>
            <button class="astudio-tab" data-tab="animations">🎬 Animations</button>
        `;

        const h3 = box.querySelector('h3');
        if (h3) h3.after(tabs);
        else box.prepend(tabs);

        // Wrap existing theme categories
        const cats = Array.from(box.querySelectorAll('.theme-category'));
        if (cats.length) {
            const wrapper = document.createElement('div');
            wrapper.className = 'astudio-theme-content-wrapper';
            cats[0].before(wrapper);
            cats.forEach(c => wrapper.appendChild(c));
        }

        // Tab switching
        tabs.addEventListener('click', e => {
            const btn = e.target.closest('.astudio-tab');
            if (!btn) return;
            const tabId = btn.dataset.tab;
            tabs.querySelectorAll('.astudio-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            const themeWrap = box.querySelector('.astudio-theme-content-wrapper');
            const animPanel = box.querySelector('.astudio-anim-panel');

            if (tabId === 'themes') {
                if (themeWrap) themeWrap.style.display = '';
                if (animPanel) animPanel.style.display = 'none';
            } else {
                if (themeWrap) themeWrap.style.display = 'none';
                if (animPanel) animPanel.style.display = '';
                refreshAll();
            }
        });
    }

    // ── Panel Build ───────────────────────────────────────────────
    function buildPanel(modal) {
        const box = modal.querySelector('.modal-box.theme-selector-modal');
        if (!box || box.querySelector('.astudio-anim-panel')) return;

        const panel = document.createElement('div');
        panel.className = 'astudio-anim-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="astudio-current-theme">
                <div class="astudio-theme-label">
                    <span class="astudio-theme-icon" id="astudio-theme-emoji">🎨</span>
                    <div>
                        <div class="astudio-theme-name" id="astudio-theme-title">Thème actif</div>
                        <div class="astudio-theme-anim-name" id="astudio-anim-label">—</div>
                    </div>
                </div>
                <button class="astudio-reset-btn" id="astudio-reset">↺ Défaut</button>
            </div>
            <div class="astudio-toolbar">
                <div class="astudio-search-wrap">
                    <span class="astudio-search-icon">🔍</span>
                    <input type="text" class="astudio-search" id="astudio-search"
                           placeholder="Rechercher une animation...">
                </div>
                <div class="astudio-cat-tabs" id="astudio-cats">
                    ${CATS.map(c =>
                        `<button class="astudio-cat${c.id === 'all' ? ' active' : ''}"
                                 data-cat="${c.id}">${c.icon} ${c.name}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="astudio-grid-wrap">
                <div class="astudio-grid" id="astudio-grid"></div>
            </div>
            <div class="astudio-footer">
                <button class="astudio-no-anim-btn" id="astudio-no-anim">⊘ Sans animation</button>
                <span class="astudio-footer-hint">Cliquer sur une carte pour l'assigner au thème actif</span>
            </div>
        `;

        box.appendChild(panel);
        bindEvents(panel);
    }

    function bindEvents(panel) {
        // Search
        panel.querySelector('#astudio-search').addEventListener('input', e => {
            searchQuery = e.target.value.trim();
            renderGrid();
        });

        // Category filter
        panel.querySelector('#astudio-cats').addEventListener('click', e => {
            const btn = e.target.closest('.astudio-cat');
            if (!btn) return;
            activeFilter = btn.dataset.cat;
            panel.querySelectorAll('.astudio-cat').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGrid();
        });

        // Reset to default
        panel.querySelector('#astudio-reset').addEventListener('click', () => {
            applyAnim(currentTheme(), null);
            refreshAll();
        });

        // No animation
        panel.querySelector('#astudio-no-anim').addEventListener('click', () => {
            applyAnim(currentTheme(), 'none');
            refreshAll();
        });

        // Grid clicks — delegated on static wrapper
        panel.querySelector('.astudio-grid-wrap').addEventListener('click', e => {
            const card = e.target.closest('.astudio-card');
            if (!card) return;
            applyAnim(currentTheme(), card.dataset.anim);
            refreshAll();
        });
    }

    // ── Refresh ───────────────────────────────────────────────────
    function refreshAll() {
        refreshHeader();
        renderGrid();
    }

    function refreshHeader() {
        const theme = currentTheme();
        const custom = getCustom(theme);
        const defType = getDefault(theme);
        const isCustom = custom && custom !== defType;
        const isNone = custom === 'none';

        const label = document.getElementById('astudio-anim-label');
        const titleEl = document.getElementById('astudio-theme-title');
        const emojiEl = document.getElementById('astudio-theme-emoji');
        if (!label) return;

        if (titleEl) titleEl.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

        // Find theme emoji from ANIMS
        const themeAnim = ANIMS.find(a => a.id === (custom || defType));
        if (emojiEl && themeAnim) emojiEl.textContent = themeAnim.icon;

        let animName, badgeClass, badgeText;
        if (isNone) {
            animName = 'Aucune animation';
            badgeClass = 'custom'; badgeText = '✎ Perso';
        } else if (isCustom) {
            animName = getAnimName(custom);
            badgeClass = 'custom'; badgeText = '✎ Perso';
        } else {
            animName = getAnimName(defType);
            badgeClass = 'default'; badgeText = '★ Défaut';
        }

        label.innerHTML = `${animName} <span class="astudio-anim-badge ${badgeClass}">${badgeText}</span>`;
    }

    // ── Grid Render ───────────────────────────────────────────────
    function renderGrid() {
        const grid = document.getElementById('astudio-grid');
        if (!grid) return;

        const theme = currentTheme();
        const custom = getCustom(theme);
        const defType = getDefault(theme);
        const filtered = getFiltered();

        if (!filtered.length) {
            grid.innerHTML = '<div class="astudio-empty">Aucune animation trouvée</div>';
            return;
        }

        grid.innerHTML = filtered.map(a => {
            const isActive = custom
                ? (custom === a.id)
                : (a.id === defType);
            const isDefault = a.id === defType;

            const dots = Array.from({ length: 6 }, (_, i) => {
                const delay = (i * 0.22).toFixed(2);
                const dur = (1.4 + i * 0.08).toFixed(2);
                return `<div class="astudio-dot"
                    style="--acc:${a.acc};animation-name:astudio-${a.anim};animation-delay:${delay}s;animation-duration:${dur}s;"></div>`;
            }).join('');

            return `
                <div class="astudio-card${isActive ? ' active' : ''}"
                     data-anim="${a.id}"
                     style="--acc:${a.acc};"
                     title="${a.name}">
                    <div class="astudio-card-bg" style="background:${a.bg}">
                        <div class="astudio-dots">${dots}</div>
                        ${isActive ? '<div class="astudio-active-badge">✓</div>' : ''}
                        ${isDefault ? '<div class="astudio-default-badge">★</div>' : ''}
                    </div>
                    <div class="astudio-card-info">
                        <span class="astudio-card-icon">${a.icon}</span>
                        <span class="astudio-card-name">${a.name}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── Public API ────────────────────────────────────────────────
    return {
        init,
        refresh: refreshAll,
    };
})();

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimationStudio.init());
} else {
    AnimationStudio.init();
}

window.AnimationStudio = AnimationStudio;
