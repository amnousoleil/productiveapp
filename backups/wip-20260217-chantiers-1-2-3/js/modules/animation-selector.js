/**
 * Animation Selector v1.0 — Style CapCut
 * Sélecteur d'animations avec miniatures animées, favoris, personnalisation
 */

const AnimationSelector = (function() {
    'use strict';

    // Catalogue de toutes les animations disponibles
    const ANIMATIONS = [
        // ÉLÉGANCE
        { id: 'corporate', name: 'Corporate', category: 'elegance', tags: ['professionnel', 'data'], icon: '💼' },
        { id: 'diplomat', name: 'Diplomat', category: 'elegance', tags: ['luxe', 'monnaie'], icon: '👑' },
        { id: 'sterling', name: 'Sterling', category: 'elegance', tags: ['argent', 'subtil'], icon: '🥈' },
        { id: 'executive', name: 'Executive', category: 'elegance', tags: ['particules', 'parallax'], icon: '⚡' },
        { id: 'ivory', name: 'Ivory', category: 'elegance', tags: ['cercles', 'doux'], icon: '🌙' },
        { id: 'academie', name: 'Académie', category: 'elegance', tags: ['math', 'symboles'], icon: '📐' },
        // NATURE
        { id: 'ocean', name: 'Océan', category: 'nature', tags: ['vagues', 'bleu'], icon: '🌊' },
        { id: 'forest', name: 'Forêt', category: 'nature', tags: ['arbres', 'vert'], icon: '🌿' },
        { id: 'sunset', name: 'Coucher de soleil', category: 'nature', tags: ['chaud', 'orange'], icon: '🌅' },
        { id: 'desert', name: 'Désert', category: 'nature', tags: ['sable', 'chaleur'], icon: '🏜️' },
        { id: 'lavender', name: 'Lavande', category: 'nature', tags: ['pétales', 'violet'], icon: '💜' },
        { id: 'sakura', name: 'Sakura', category: 'nature', tags: ['cerisier', 'rose'], icon: '🌸' },
        { id: 'moss', name: 'Mousse', category: 'nature', tags: ['naturel', 'organique'], icon: '🍀' },
        // ATMOSPHÈRE
        { id: 'aurora', name: 'Aurora', category: 'atmosphere', tags: ['nordique', 'ondes'], icon: '🌌' },
        { id: 'midnight', name: 'Minuit', category: 'atmosphere', tags: ['nuit', 'étoiles'], icon: '🌑' },
        { id: 'twilight', name: 'Crépuscule', category: 'atmosphere', tags: ['transition', 'doux'], icon: '🌆' },
        { id: 'candlelight', name: 'Bougie', category: 'atmosphere', tags: ['feu', 'chaud'], icon: '🕯️' },
        { id: 'moonlit', name: 'Clair de lune', category: 'atmosphere', tags: ['lune', 'rayons'], icon: '🌕' },
        { id: 'golden-hour', name: 'Golden Hour', category: 'atmosphere', tags: ['doré', 'lumière'], icon: '✨' },
        { id: 'storm', name: 'Tempête', category: 'atmosphere', tags: ['pluie', 'électrique'], icon: '⛈️' },
        { id: 'ember', name: 'Braises', category: 'atmosphere', tags: ['feu', 'charbons'], icon: '🔥' },
        // MODERNE
        { id: 'bubblegum', name: 'Bubblegum', category: 'moderne', tags: ['bulles', 'rose'], icon: '🫧' },
        { id: 'neonp', name: 'Néon', category: 'moderne', tags: ['lumière', 'vibrant'], icon: '💡' },
        { id: 'pastel', name: 'Pastel', category: 'moderne', tags: ['doux', 'aquarelle'], icon: '🎨' },
        { id: 'retrowave', name: 'Retrowave', category: 'moderne', tags: ['rétro', 'grille'], icon: '🌆' },
        { id: 'mint', name: 'Menthe', category: 'moderne', tags: ['feuilles', 'vert'], icon: '🌱' },
        { id: 'coral', name: 'Corail', category: 'moderne', tags: ['récif', 'ondulant'], icon: '🪸' },
        // MINIMALISTE
        { id: 'obsidian', name: 'Obsidian', category: 'minimaliste', tags: ['sombre', 'délicat'], icon: '🖤' },
        { id: 'paper', name: 'Paper', category: 'minimaliste', tags: ['fibres', 'texture'], icon: '📄' },
        { id: 'clay', name: 'Clay', category: 'minimaliste', tags: ['argile', 'doux'], icon: '🏺' },
        { id: 'porcelain', name: 'Porcelaine', category: 'minimaliste', tags: ['céramique', 'délicat'], icon: '🫖' },
        { id: 'espresso', name: 'Espresso', category: 'minimaliste', tags: ['café', 'vapeur'], icon: '☕' },
        { id: 'zen', name: 'Zen', category: 'minimaliste', tags: ['cercles', 'sérénité'], icon: '☯️' },
        { id: 'snow', name: 'Neige', category: 'minimaliste', tags: ['flocons', 'hivernal'], icon: '❄️' },
        // TECH
        { id: 'matrix', name: 'Matrix', category: 'tech', tags: ['code', 'vert'], icon: '🟩' },
        { id: 'cyberpunk', name: 'Cyberpunk', category: 'tech', tags: ['futuriste', 'néon'], icon: '🤖' },
        { id: 'terminal', name: 'Terminal', category: 'tech', tags: ['console', 'code'], icon: '💻' },
        { id: 'trongrid', name: 'Tron', category: 'tech', tags: ['grille', 'bleu'], icon: '🔷' },
        { id: 'hologram', name: 'Hologramme', category: 'tech', tags: ['holo', 'turquoise'], icon: '🌀' },
        { id: 'pipboy', name: 'Pip-Boy', category: 'tech', tags: ['rétro', 'phosphore'], icon: '📟' },
        // ARTISTE
        { id: 'watercolor', name: 'Aquarelle', category: 'artiste', tags: ['peinture', 'taches'], icon: '🖌️' },
        { id: 'nordic', name: 'Nordic', category: 'artiste', tags: ['géométrique', 'flocons'], icon: '❄️' },
        { id: 'artdeco', name: 'Art Déco', category: 'artiste', tags: ['doré', 'motifs'], icon: '🏛️' },
        { id: 'cosmic', name: 'Cosmic', category: 'artiste', tags: ['nébuleuse', 'galaxie'], icon: '🌌' },
        { id: 'bioluminescence', name: 'Bioluminescence', category: 'artiste', tags: ['lueur', 'mer'], icon: '🌊' },
        { id: 'ukiyoe', name: 'Ukiyo-e', category: 'artiste', tags: ['japonais', 'vagues'], icon: '🗾' },
        // SAISONS
        { id: 'printemps', name: 'Printemps', category: 'saisons', tags: ['fleurs', 'éclosion'], icon: '🌺' },
        { id: 'ete', name: 'Été', category: 'saisons', tags: ['soleil', 'rayons'], icon: '☀️' },
        { id: 'automne', name: 'Automne', category: 'saisons', tags: ['feuilles', 'chute'], icon: '🍂' },
        { id: 'hiver', name: 'Hiver', category: 'saisons', tags: ['cristaux', 'froid'], icon: '🌨️' },
        // PRÉCIEUX
        { id: 'amethyst', name: 'Améthyste', category: 'precieux', tags: ['cristaux', 'violet'], icon: '💎' },
        { id: 'jade', name: 'Jade', category: 'precieux', tags: ['spirales', 'vert'], icon: '🟢' },
        { id: 'ruby', name: 'Ruby', category: 'precieux', tags: ['gemmes', 'rouge'], icon: '❤️' },
        { id: 'pearl', name: 'Perle', category: 'precieux', tags: ['nacré', 'brillant'], icon: '🪬' },
        { id: 'copper', name: 'Cuivre', category: 'precieux', tags: ['étincelles', 'métal'], icon: '🟤' },
        // VOYAGE
        { id: 'sahara', name: 'Sahara', category: 'voyage', tags: ['sable', 'dunes'], icon: '🐪' },
        { id: 'fjord', name: 'Fjord', category: 'voyage', tags: ['nordique', 'aurore'], icon: '🏔️' },
        { id: 'bamboo', name: 'Bambou', category: 'voyage', tags: ['asie', 'ondulant'], icon: '🎋' },
        { id: 'bali', name: 'Bali', category: 'voyage', tags: ['tropical', 'doré'], icon: '🌴' },
        { id: 'provence', name: 'Provence', category: 'voyage', tags: ['lavande', 'champs'], icon: '🌾' },
        // AUTRES
        { id: 'charcoal', name: 'Charcoal', category: 'autres', tags: ['cendres', 'sombre'], icon: '💨' },
    ];

    const CATEGORIES = [
        { id: 'all', name: 'Tout', icon: '✨' },
        { id: 'favoris', name: 'Favoris', icon: '⭐' },
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

    // État local
    let activeFilter = 'all';
    let searchQuery = '';
    let favoriteAnimations = JSON.parse(localStorage.getItem('as_favorites') || '[]');
    let currentAnimId = null;
    let isOpen = false;

    // ─── INIT ─────────────────────────────────────────────────────────────
    function init() {
        if (document.getElementById('animation-selector-overlay')) return;
        _buildDOM();
        _bindEvents();
        _loadCurrentAnim();
    }

    function _loadCurrentAnim() {
        const theme = document.documentElement.getAttribute('data-theme') || 'midnight';
        currentAnimId = localStorage.getItem('as_anim_' + theme) || null;
    }

    // ─── BUILD DOM ─────────────────────────────────────────────────────────
    function _buildDOM() {
        const overlay = document.createElement('div');
        overlay.id = 'animation-selector-overlay';
        overlay.className = 'animation-selector-overlay';

        overlay.innerHTML = `
            <div class="animation-selector-modal">
                <div class="anim-selector-header">
                    <div class="anim-selector-title">
                        <span class="icon">🎬</span>
                        <h2>Sélecteur d'animations</h2>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div class="anim-selector-controls">
                            <label style="color:rgba(255,255,255,0.6);font-size:13px;">Intensité</label>
                            <input type="range" id="as-intensity" min="0" max="100" value="45"
                                style="width:120px;accent-color:#8a63f6;">
                            <span id="as-intensity-val" style="color:#a78bfa;font-size:13px;min-width:35px;">45%</span>
                        </div>
                        <button class="anim-selector-close" id="as-close">✕</button>
                    </div>
                </div>

                <div class="anim-selector-toolbar">
                    <div class="anim-search">
                        <input type="text" id="as-search" placeholder="Rechercher une animation...">
                        <span class="anim-search-icon">🔍</span>
                    </div>
                    <div class="anim-filter-tabs" id="as-filter-tabs">
                        ${CATEGORIES.map(c => `
                            <button class="anim-filter-tab${c.id === 'all' ? ' active' : ''}"
                                data-filter="${c.id}">
                                <span class="icon">${c.icon}</span>${c.name}
                            </button>`).join('')}
                    </div>
                </div>

                <div class="anim-selector-content" id="as-content">
                    ${_buildGrid()}
                </div>

                <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;gap:16px;">
                    <button id="as-none-btn" style="padding:10px 20px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#f87171;cursor:pointer;font-size:13px;">
                        ⊘ Aucune animation
                    </button>
                    <span id="as-current-label" style="color:rgba(255,255,255,0.5);font-size:13px;font-style:italic;"></span>
                    <button id="as-apply-btn" style="padding:10px 28px;background:linear-gradient(135deg,#7c3aed,#6366f1);border:none;border-radius:10px;color:#fff;cursor:pointer;font-weight:600;font-size:14px;">
                        ✓ Appliquer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    function _buildGrid() {
        const filteredAnimations = _getFiltered();
        if (!filteredAnimations.length) {
            return `<div style="text-align:center;padding:60px;color:rgba(255,255,255,0.4);">
                Aucune animation trouvée
            </div>`;
        }

        const byCategory = {};
        if (activeFilter === 'all' || activeFilter === 'favoris') {
            filteredAnimations.forEach(a => {
                if (!byCategory[a.category]) byCategory[a.category] = [];
                byCategory[a.category].push(a);
            });
        } else {
            byCategory[activeFilter] = filteredAnimations;
        }

        return Object.entries(byCategory).map(([cat, anims]) => {
            const catInfo = CATEGORIES.find(c => c.id === cat) || { name: cat, icon: '✦' };
            return `
                <div class="anim-category-section">
                    <div class="anim-category-header">
                        <span class="anim-category-icon">${catInfo.icon}</span>
                        <span class="anim-category-name">${catInfo.name}</span>
                        <span class="anim-category-count">${anims.length}</span>
                    </div>
                    <div class="anim-grid">
                        ${anims.map(a => _buildCard(a)).join('')}
                    </div>
                </div>`;
        }).join('');
    }

    function _buildCard(anim) {
        const isFav = favoriteAnimations.includes(anim.id);
        const isSelected = currentAnimId === anim.id;
        return `
            <div class="anim-card${isSelected ? ' selected' : ''}" data-anim="${anim.id}"
                style="background:linear-gradient(135deg,rgba(20,20,35,0.9),rgba(30,25,50,0.95));">
                <div class="anim-card-preview">
                    <canvas class="anim-thumbnail" data-anim="${anim.id}" width="180" height="101"></canvas>
                </div>
                <div class="anim-card-overlay">
                    <div class="anim-card-name">${anim.icon} ${anim.name}</div>
                    <div class="anim-card-tags">
                        ${anim.tags.map(t => `<span class="anim-card-tag">${t}</span>`).join('')}
                    </div>
                </div>
                <button class="anim-card-favorite${isFav ? ' active' : ''}" data-anim="${anim.id}">
                    <span class="star">${isFav ? '★' : '☆'}</span>
                </button>
                ${isSelected ? `<div style="position:absolute;top:8px;left:8px;background:#7c3aed;border-radius:6px;padding:3px 8px;font-size:11px;color:#fff;font-weight:600;">Actif</div>` : ''}
            </div>`;
    }

    function _getFiltered() {
        let list = [...ANIMATIONS];
        if (activeFilter === 'favoris') {
            list = list.filter(a => favoriteAnimations.includes(a.id));
        } else if (activeFilter !== 'all') {
            list = list.filter(a => a.category === activeFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.tags.some(t => t.includes(q)) ||
                a.category.includes(q)
            );
        }
        return list;
    }

    // ─── EVENTS ────────────────────────────────────────────────────────────
    function _bindEvents() {
        const overlay = document.getElementById('animation-selector-overlay');

        // Fermer sur clic overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Bouton fermer
        document.getElementById('as-close').addEventListener('click', close);

        // Filtres par catégorie
        document.getElementById('as-filter-tabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.anim-filter-tab');
            if (!btn) return;
            document.querySelectorAll('.anim-filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            _refreshGrid();
        });

        // Recherche
        document.getElementById('as-search').addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            _refreshGrid();
        });

        // Intensité
        const intensitySlider = document.getElementById('as-intensity');
        const intensityVal = document.getElementById('as-intensity-val');
        // Charger valeur actuelle
        const savedIntensity = localStorage.getItem('productiveapp_animation_intensity');
        if (savedIntensity) {
            const pct = Math.round(parseFloat(savedIntensity) * 100);
            intensitySlider.value = pct;
            intensityVal.textContent = pct + '%';
        }
        intensitySlider.addEventListener('input', (e) => {
            const pct = e.target.value;
            intensityVal.textContent = pct + '%';
            const factor = pct / 100;
            localStorage.setItem('productiveapp_animation_intensity', factor);
            if (window.AnimEngine && window.AnimEngine.setIntensity) {
                window.AnimEngine.setIntensity(factor);
            }
        });

        // Contenu (délégation) : sélectionner animation + favoris
        document.getElementById('as-content').addEventListener('click', (e) => {
            // Bouton favori
            const favBtn = e.target.closest('.anim-card-favorite');
            if (favBtn) {
                e.stopPropagation();
                _toggleFavorite(favBtn.dataset.anim);
                return;
            }
            // Clic sur carte
            const card = e.target.closest('.anim-card');
            if (card) {
                currentAnimId = card.dataset.anim;
                document.querySelectorAll('.anim-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                _updateCurrentLabel();
                // Prévisualisation immédiate
                _applyAnimation(currentAnimId);
            }
        });

        // Bouton aucune animation
        document.getElementById('as-none-btn').addEventListener('click', () => {
            currentAnimId = null;
            document.querySelectorAll('.anim-card').forEach(c => c.classList.remove('selected'));
            _updateCurrentLabel();
            _applyAnimation(null);
        });

        // Bouton appliquer
        document.getElementById('as-apply-btn').addEventListener('click', () => {
            _savePreference();
            close();
        });
    }

    function _refreshGrid() {
        const content = document.getElementById('as-content');
        if (content) {
            content.innerHTML = _buildGrid();
            // Lancer miniatures après rebuild
            setTimeout(_startThumbnails, 100);
        }
    }

    function _updateCurrentLabel() {
        const label = document.getElementById('as-current-label');
        if (!label) return;
        if (currentAnimId) {
            const anim = ANIMATIONS.find(a => a.id === currentAnimId);
            label.textContent = anim ? `${anim.icon} ${anim.name} sélectionné` : '';
        } else {
            label.textContent = 'Aucune animation';
        }
    }

    function _toggleFavorite(animId) {
        const idx = favoriteAnimations.indexOf(animId);
        if (idx === -1) {
            favoriteAnimations.push(animId);
        } else {
            favoriteAnimations.splice(idx, 1);
        }
        localStorage.setItem('as_favorites', JSON.stringify(favoriteAnimations));

        // Update button state
        const btn = document.querySelector(`.anim-card-favorite[data-anim="${animId}"]`);
        if (btn) {
            const isFav = favoriteAnimations.includes(animId);
            btn.classList.toggle('active', isFav);
            btn.querySelector('.star').textContent = isFav ? '★' : '☆';
        }

        // Refresh si on est sur l'onglet favoris
        if (activeFilter === 'favoris') _refreshGrid();
    }

    // ─── APPLY ANIMATION ─────────────────────────────────────────────────
    function _applyAnimation(animId) {
        if (!window.AnimEngine) return;
        if (animId) {
            const theme = document.documentElement.getAttribute('data-theme') || 'midnight';
            if (window.AnimEngine.setThemeAnimation) {
                window.AnimEngine.setThemeAnimation(theme, animId);
            } else if (window.AnimEngine.restart) {
                window.AnimEngine.restart(animId);
            }
        } else {
            if (window.AnimEngine.stop) window.AnimEngine.stop();
        }
    }

    function _savePreference() {
        const theme = document.documentElement.getAttribute('data-theme') || 'midnight';
        if (currentAnimId) {
            localStorage.setItem('as_anim_' + theme, currentAnimId);
        } else {
            localStorage.removeItem('as_anim_' + theme);
        }
    }

    // ─── THUMBNAILS ─────────────────────────────────────────────────────
    // Miniatures CSS uniquement (dégradés animés par thème couleur)
    function _startThumbnails() {
        const canvases = document.querySelectorAll('.anim-thumbnail');
        canvases.forEach(canvas => {
            const animId = canvas.dataset.anim;
            const anim = ANIMATIONS.find(a => a.id === animId);
            if (!anim) return;
            _renderThumbnail(canvas, anim);
        });
    }

    function _renderThumbnail(canvas, anim) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        // Couleurs de preview selon catégorie
        const colors = {
            elegance: ['#1a1a2e', '#16213e', '#c9a96e'],
            nature: ['#0a1f0a', '#1a3a1a', '#4ade80'],
            atmosphere: ['#0d0d1a', '#1a1a3a', '#818cf8'],
            moderne: ['#1a0a2e', '#2d1f3e', '#f472b6'],
            minimaliste: ['#111111', '#1a1a1a', '#d1d5db'],
            tech: ['#001a00', '#002200', '#00ff41'],
            artiste: ['#0a0a1a', '#1a0a2e', '#a78bfa'],
            saisons: ['#1a0a00', '#2e1a00', '#fb923c'],
            precieux: ['#0a0a1e', '#10103a', '#a78bfa'],
            voyage: ['#0a0f1a', '#0f1a2e', '#38bdf8'],
            autres: ['#111111', '#1a1a1a', '#6b7280'],
        };
        const [bg1, bg2, accent] = colors[anim.category] || ['#111', '#222', '#fff'];

        ctx.clearRect(0, 0, W, H);
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, bg1);
        grad.addColorStop(1, bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Quelques points décoratifs
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * W,
                Math.random() * H,
                Math.random() * 4 + 1,
                0, Math.PI * 2
            );
            ctx.fillStyle = accent;
            ctx.globalAlpha = Math.random() * 0.6 + 0.1;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Icon animation au centre
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(anim.icon, W / 2, H / 2 - 6);
    }

    // ─── PUBLIC API ───────────────────────────────────────────────────────
    function open() {
        if (!document.getElementById('animation-selector-overlay')) init();
        const overlay = document.getElementById('animation-selector-overlay');
        overlay.classList.add('active');
        isOpen = true;
        _loadCurrentAnim();
        _updateCurrentLabel();
        setTimeout(_startThumbnails, 150);
    }

    function close() {
        const overlay = document.getElementById('animation-selector-overlay');
        if (overlay) overlay.classList.remove('active');
        isOpen = false;
    }

    function toggle() {
        isOpen ? close() : open();
    }

    return { init, open, close, toggle };
})();

if (typeof window !== 'undefined') {
    window.AnimationSelector = AnimationSelector;
}
