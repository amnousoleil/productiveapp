/**
 * Animation Selector v1.0 — Style CapCut
 * Sélecteur d'animations avec miniatures animées, favoris, personnalisation
 */

const AnimationSelector = (function() {
    'use strict';

    // Catalogue de toutes les animations disponibles
    const ANIMATIONS = [
        // ÉLÉGANCE
        { id: 'corporate', name: 'Corporate', category: 'elegance', desc: 'Colonnes de données qui tombent — Bloomberg Terminal', icon: '💼', bg: 'linear-gradient(160deg,#0a1628,#0f1e35)', accent: '#6495ed', anim: 'rain' },
        { id: 'diplomat', name: 'Diplomat', category: 'elegance', desc: 'Symboles monétaires qui descendent en pluie', icon: '👑', bg: 'linear-gradient(160deg,#1a0a00,#2e1000)', accent: '#ffd700', anim: 'rain' },
        { id: 'sterling', name: 'Sterling', category: 'elegance', desc: 'Poussière argentée qui dérive doucement', icon: '🥈', bg: 'linear-gradient(160deg,#0d0d0d,#1a1a1a)', accent: '#c0c0c0', anim: 'drift' },
        { id: 'executive', name: 'Executive', category: 'elegance', desc: 'Orbes dorées flottant avec parallax souris', icon: '⚡', bg: 'linear-gradient(160deg,#0d0d0d,#1a1a1a)', accent: '#d4af37', anim: 'float' },
        { id: 'ivory', name: 'Ivory', category: 'elegance', desc: 'Cercles concentriques qui pulsent doucement', icon: '🌙', bg: 'linear-gradient(160deg,#1a1812,#2e2e20)', accent: '#f5f0e8', anim: 'pulse' },
        { id: 'academie', name: 'Académie', category: 'elegance', desc: 'Symboles mathématiques qui flottent vers le haut', icon: '📐', bg: 'linear-gradient(160deg,#12100e,#1e1c18)', accent: '#c9a96e', anim: 'float' },
        // NATURE
        { id: 'ocean', name: 'Océan', category: 'nature', desc: 'Vagues sinusoïdales bleu profond', icon: '🌊', bg: 'linear-gradient(160deg,#020b1a,#051630)', accent: '#38bdf8', anim: 'wave' },
        { id: 'forest', name: 'Forêt', category: 'nature', desc: 'Particules vertes qui montent comme des lucioles', icon: '🌿', bg: 'linear-gradient(160deg,#050e03,#0d1c09)', accent: '#22c55e', anim: 'rise' },
        { id: 'sunset', name: 'Coucher de soleil', category: 'nature', desc: 'Bulles orange et or qui montent lentement', icon: '🌅', bg: 'linear-gradient(160deg,#1a0800,#2e1200)', accent: '#f97316', anim: 'rise' },
        { id: 'desert', name: 'Désert', category: 'nature', desc: 'Grains de sable dorés portés par le vent', icon: '🏜️', bg: 'linear-gradient(160deg,#1a1000,#2e1e00)', accent: '#D4A017', anim: 'drift' },
        { id: 'lavender', name: 'Lavande', category: 'nature', desc: 'Pétales violets qui flottent et tourbillonnent', icon: '💜', bg: 'linear-gradient(160deg,#1a0a2e,#120820)', accent: '#a78bfa', anim: 'float' },
        { id: 'sakura', name: 'Sakura', category: 'nature', desc: 'Pétales de cerisier en spirale portés par le vent', icon: '🌸', bg: 'linear-gradient(160deg,#1a0510,#2e0820)', accent: '#f9a8d4', anim: 'float' },
        { id: 'moss', name: 'Mousse', category: 'nature', desc: 'Particules organiques vertes qui dérivent', icon: '🍀', bg: 'linear-gradient(160deg,#051205,#0a1e0a)', accent: '#10b981', anim: 'drift' },
        // ATMOSPHÈRE
        { id: 'aurora', name: 'Aurora', category: 'atmosphere', desc: 'Ondes colorées nordiques qui ondulent lentement', icon: '🌌', bg: 'linear-gradient(160deg,#020b14,#03141f)', accent: '#34d399', anim: 'wave' },
        { id: 'midnight', name: 'Minuit', category: 'atmosphere', desc: 'Étoiles scintillantes dans le ciel nocturne', icon: '🌑', bg: 'linear-gradient(160deg,#020209,#04040f)', accent: '#818cf8', anim: 'twinkle' },
        { id: 'twilight', name: 'Crépuscule', category: 'atmosphere', desc: 'Lueurs qui pulsent au coucher du soleil', icon: '🌆', bg: 'linear-gradient(160deg,#0d0512,#1a0a2e)', accent: '#c084fc', anim: 'pulse' },
        { id: 'candlelight', name: 'Bougie', category: 'atmosphere', desc: 'Flammes et particules de feu vacillantes', icon: '🕯️', bg: 'linear-gradient(160deg,#100500,#1e0a00)', accent: '#fb923c', anim: 'rise' },
        { id: 'moonlit', name: 'Clair de lune', category: 'atmosphere', desc: 'Rayons de lune depuis le coin haut-droite', icon: '🌕', bg: 'linear-gradient(160deg,#050510,#0a0a1e)', accent: '#e2e8f0', anim: 'pulse' },
        { id: 'golden-hour', name: 'Golden Hour', category: 'atmosphere', desc: 'Lueurs dorées qui scintillent doucement', icon: '✨', bg: 'linear-gradient(160deg,#1a0e00,#2e1800)', accent: '#fbbf24', anim: 'twinkle' },
        { id: 'storm', name: 'Tempête', category: 'atmosphere', desc: 'Pluie battante avec éclairs au loin', icon: '⛈️', bg: 'linear-gradient(160deg,#030a0d,#060f14)', accent: '#38bdf8', anim: 'rain' },
        { id: 'ember', name: 'Braises', category: 'atmosphere', desc: 'Braises rougeoyantes qui montent lentement', icon: '🔥', bg: 'linear-gradient(160deg,#100200,#1e0400)', accent: '#ef4444', anim: 'rise' },
        // MODERNE
        { id: 'bubblegum', name: 'Bubblegum', category: 'moderne', desc: 'Bulles colorées qui montent et éclatent', icon: '🫧', bg: 'linear-gradient(160deg,#1a0520,#2e0a35)', accent: '#f472b6', anim: 'rise' },
        { id: 'neonp', name: 'Néon', category: 'moderne', desc: 'Particules néon connectées en réseau lumineux', icon: '💡', bg: 'linear-gradient(160deg,#0a001a,#10002e)', accent: '#a855f7', anim: 'twinkle' },
        { id: 'pastel', name: 'Pastel', category: 'moderne', desc: 'Taches aquarelle pastel qui diffusent', icon: '🎨', bg: 'linear-gradient(160deg,#fff5f0,#ffeef8)', accent: '#f9a8d4', anim: 'pulse' },
        { id: 'retrowave', name: 'Retrowave', category: 'moderne', desc: 'Grille rétro qui converge vers un soleil 80s', icon: '🌆', bg: 'linear-gradient(160deg,#080018,#100028)', accent: '#f43f5e', anim: 'wave' },
        { id: 'mint', name: 'Menthe', category: 'moderne', desc: 'Feuilles et particules vertes qui flottent', icon: '🌱', bg: 'linear-gradient(160deg,#f0fff4,#ecfdf5)', accent: '#10b981', anim: 'float' },
        { id: 'coral', name: 'Corail', category: 'moderne', desc: 'Branches de corail qui ondulent sous l\'eau', icon: '🪸', bg: 'linear-gradient(160deg,#00080f,#001018)', accent: '#fb7185', anim: 'wave' },
        // MINIMALISTE
        { id: 'obsidian', name: 'Obsidian', category: 'minimaliste', desc: 'Étincelles délicates sur fond noir profond', icon: '🖤', bg: 'linear-gradient(160deg,#050505,#0a0a0a)', accent: '#6366f1', anim: 'twinkle' },
        { id: 'paper', name: 'Paper', category: 'minimaliste', desc: 'Fibres de papier qui dérivent imperceptiblement', icon: '📄', bg: 'linear-gradient(160deg,#f5f0e8,#ede8d8)', accent: '#92400e', anim: 'drift' },
        { id: 'clay', name: 'Clay', category: 'minimaliste', desc: 'Texture argile terracotta avec particules chaudes', icon: '🏺', bg: 'linear-gradient(160deg,#1a0a05,#2e1508)', accent: '#C4783C', anim: 'drift' },
        { id: 'porcelain', name: 'Porcelaine', category: 'minimaliste', desc: 'Motifs céramique qui se dessinent doucement', icon: '🫖', bg: 'linear-gradient(160deg,#f8f4f0,#f0ebe4)', accent: '#9ca3af', anim: 'pulse' },
        { id: 'espresso', name: 'Espresso', category: 'minimaliste', desc: 'Vapeur de café qui monte en volutes', icon: '☕', bg: 'linear-gradient(160deg,#0a0600,#140d00)', accent: '#92400e', anim: 'rise' },
        { id: 'zen', name: 'Zen', category: 'minimaliste', desc: 'Cercles concentriques qui se propagent', icon: '☯️', bg: 'linear-gradient(160deg,#f5f5f5,#ebebeb)', accent: '#6b7280', anim: 'pulse' },
        { id: 'snow', name: 'Neige', category: 'minimaliste', desc: 'Flocons blancs et quelques flocons dorés rares', icon: '❄️', bg: 'linear-gradient(160deg,#0a0f1e,#0f1830)', accent: '#e2e8f0', anim: 'rain' },
        // TECH
        { id: 'matrix', name: 'Matrix', category: 'tech', desc: 'Pluie de code vert — The Matrix', icon: '🟩', bg: 'linear-gradient(160deg,#000a00,#001400)', accent: '#00ff41', anim: 'rain' },
        { id: 'cyberpunk', name: 'Cyberpunk', category: 'tech', desc: 'Lignes de scan futuristes et néons électriques', icon: '🤖', bg: 'linear-gradient(160deg,#050010,#0a0020)', accent: '#f0abfc', anim: 'wave' },
        { id: 'terminal', name: 'Terminal', category: 'tech', desc: 'Caractères de terminal qui défilent', icon: '💻', bg: 'linear-gradient(160deg,#000a00,#001000)', accent: '#4ade80', anim: 'rain' },
        { id: 'trongrid', name: 'Tron', category: 'tech', desc: 'Grille lumineuse bleue style TRON', icon: '🔷', bg: 'linear-gradient(160deg,#000510,#000a20)', accent: '#38bdf8', anim: 'wave' },
        { id: 'hologram', name: 'Hologramme', category: 'tech', desc: 'Lignes holographiques turquoise qui scintillent', icon: '🌀', bg: 'linear-gradient(160deg,#000f14,#001e28)', accent: '#22d3ee', anim: 'twinkle' },
        { id: 'pipboy', name: 'Pip-Boy', category: 'tech', desc: 'Phosphore vert rétro de terminal Vault-Tec', icon: '📟', bg: 'linear-gradient(160deg,#000a00,#001200)', accent: '#86efac', anim: 'twinkle' },
        // ARTISTE
        { id: 'watercolor', name: 'Aquarelle', category: 'artiste', desc: 'Taches d\'aquarelle qui se diffusent et mélangent', icon: '🖌️', bg: 'linear-gradient(160deg,#f8f4ff,#f0e8ff)', accent: '#a78bfa', anim: 'pulse' },
        { id: 'nordic', name: 'Nordic', category: 'artiste', desc: 'Flocons géométriques blancs qui tourbillonnent', icon: '❄️', bg: 'linear-gradient(160deg,#050a1e,#0a1028)', accent: '#bfdbfe', anim: 'float' },
        { id: 'artdeco', name: 'Art Déco', category: 'artiste', desc: 'Motifs dorés Art Déco qui brillent', icon: '🏛️', bg: 'linear-gradient(160deg,#0a0800,#141000)', accent: '#fbbf24', anim: 'twinkle' },
        { id: 'cosmic', name: 'Cosmic', category: 'artiste', desc: 'Nébuleuse cosmique avec étoiles filantes', icon: '🌌', bg: 'linear-gradient(160deg,#020010,#050020)', accent: '#c084fc', anim: 'twinkle' },
        { id: 'bioluminescence', name: 'Bioluminescence', category: 'artiste', desc: 'Lueurs vivantes bleu-vert dans les profondeurs', icon: '🌊', bg: 'linear-gradient(160deg,#000f0f,#001e1e)', accent: '#34d399', anim: 'pulse' },
        { id: 'ukiyoe', name: 'Ukiyo-e', category: 'artiste', desc: 'Vagues japonaises qui déroulent comme Hokusai', icon: '🗾', bg: 'linear-gradient(160deg,#020818,#040f28)', accent: '#60a5fa', anim: 'wave' },
        // SAISONS
        { id: 'printemps', name: 'Printemps', category: 'saisons', desc: 'Fleurs qui éclosent et pétales qui volent', icon: '🌺', bg: 'linear-gradient(160deg,#fff0f5,#ffe4ef)', accent: '#f9a8d4', anim: 'float' },
        { id: 'ete', name: 'Été', category: 'saisons', desc: 'Rayons de soleil dorés qui irradient', icon: '☀️', bg: 'linear-gradient(160deg,#fff8e1,#fff3c4)', accent: '#fbbf24', anim: 'pulse' },
        { id: 'automne', name: 'Automne', category: 'saisons', desc: 'Feuilles rouge-or qui tombent en tournoyant', icon: '🍂', bg: 'linear-gradient(160deg,#1a0800,#2e1000)', accent: '#f97316', anim: 'float' },
        { id: 'hiver', name: 'Hiver', category: 'saisons', desc: 'Cristaux de glace bleutés qui scintillent', icon: '🌨️', bg: 'linear-gradient(160deg,#050a1e,#0a1028)', accent: '#bae6fd', anim: 'drift' },
        // PRÉCIEUX
        { id: 'amethyst', name: 'Améthyste', category: 'precieux', desc: 'Éclats de cristaux violets qui pulsent', icon: '💎', bg: 'linear-gradient(160deg,#0a0520,#100a35)', accent: '#c084fc', anim: 'twinkle' },
        { id: 'jade', name: 'Jade', category: 'precieux', desc: 'Spirales de jade vert qui tourbillonnent', icon: '🟢', bg: 'linear-gradient(160deg,#02100a,#041e14)', accent: '#34d399', anim: 'wave' },
        { id: 'ruby', name: 'Ruby', category: 'precieux', desc: 'Gemmes rubis qui pulsent et clignotent', icon: '❤️', bg: 'linear-gradient(160deg,#100002,#1e0004)', accent: '#f43f5e', anim: 'pulse' },
        { id: 'pearl', name: 'Perle', category: 'precieux', desc: 'Perles nacrées qui flottent avec reflets', icon: '🪬', bg: 'linear-gradient(160deg,#f0f4f8,#e8eef4)', accent: '#e2e8f0', anim: 'float' },
        { id: 'copper', name: 'Cuivre', category: 'precieux', desc: 'Étincelles cuivrées qui jaillissent vers le haut', icon: '🟤', bg: 'linear-gradient(160deg,#0f0500,#1e0a00)', accent: '#f97316', anim: 'rise' },
        // VOYAGE
        { id: 'sahara', name: 'Sahara', category: 'voyage', desc: 'Dunes de sable doré balayées par le vent', icon: '🐪', bg: 'linear-gradient(160deg,#120c02,#1e1405)', accent: '#D4A017', anim: 'drift' },
        { id: 'fjord', name: 'Fjord', category: 'voyage', desc: 'Aurores boréales nordiques sur fjord glacé', icon: '🏔️', bg: 'linear-gradient(160deg,#030a14,#051428)', accent: '#34d399', anim: 'wave' },
        { id: 'bamboo', name: 'Bambou', category: 'voyage', desc: 'Tiges de bambou qui ondulent avec le vent', icon: '🎋', bg: 'linear-gradient(160deg,#f5fff0,#eaffea)', accent: '#86efac', anim: 'wave' },
        { id: 'bali', name: 'Bali', category: 'voyage', desc: 'Flammes tropicales dorées — soleil balinais', icon: '🌴', bg: 'linear-gradient(160deg,#120c02,#1e1405)', accent: '#F59E0B', anim: 'rise' },
        { id: 'provence', name: 'Provence', category: 'voyage', desc: 'Champs de lavande qui ondulent dans le mistral', icon: '🌾', bg: 'linear-gradient(160deg,#f5f0ff,#ede8ff)', accent: '#a78bfa', anim: 'wave' },
        // AUTRES
        { id: 'charcoal', name: 'Charcoal', category: 'autres', desc: 'Cendres qui s\'envolent — secret "MAITRE MAHA GIRI"', icon: '💨', bg: 'linear-gradient(160deg,#050505,#0a0a0a)', accent: '#6b7280', anim: 'rise' },
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
        // Keyframes pour points animés dans les cartes
        if (!document.getElementById('as-keyframes')) {
            const s = document.createElement('style');
            s.id = 'as-keyframes';
            s.textContent = `
                @keyframes asDotrain  { 0%,100%{transform:translateY(0);opacity:.7} 50%{transform:translateY(-18px);opacity:.2} }
                @keyframes asDotfloat { 0%,100%{transform:translateY(0) translateX(0);opacity:.7} 50%{transform:translateY(-10px) translateX(5px);opacity:.4} }
                @keyframes asDotdrift { 0%,100%{transform:translateX(0);opacity:.6} 50%{transform:translateX(12px);opacity:.3} }
                @keyframes asDotpulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.8);opacity:.1} }
                @keyframes asDotwave  { 0%,100%{transform:translateY(0);opacity:.7} 25%{transform:translateY(-8px);opacity:.5} 75%{transform:translateY(8px);opacity:.5} }
                @keyframes asDottwinkle { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:.1;transform:scale(0.5)} }
                @keyframes asDotrise  { 0%{transform:translateY(0);opacity:.8} 100%{transform:translateY(-30px);opacity:0} }
            `;
            document.head.appendChild(s);
        }

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
        const previewStyle = `background:${anim.bg || '#111'};`;
        // Petits points animés selon le type d'animation
        const dots = Array.from({length: 6}, (_, i) => {
            const x = 10 + i * 14 + '%';
            const delay = (i * 0.3).toFixed(1);
            return `<span style="position:absolute;width:4px;height:4px;border-radius:50%;background:${anim.accent};left:${x};bottom:${20 + (i % 3) * 15}%;animation:asDot${anim.anim} ${1.5 + i * 0.2}s ${delay}s ease-in-out infinite;opacity:0.7;"></span>`;
        }).join('');
        return `
            <div class="anim-card${isSelected ? ' selected' : ''}" data-anim="${anim.id}" style="${previewStyle}">
                <div style="position:absolute;inset:0;overflow:hidden;">${dots}
                    <span style="position:absolute;right:10px;top:8px;font-size:22px;opacity:0.9;">${anim.icon}</span>
                </div>
                <div class="anim-card-overlay">
                    <div class="anim-card-name" style="font-size:12px;font-weight:700;">${anim.name}</div>
                    <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:2px;line-height:1.3;">${anim.desc || ''}</div>
                </div>
                <button class="anim-card-favorite${isFav ? ' active' : ''}" data-anim="${anim.id}">
                    <span class="star">${isFav ? '★' : '☆'}</span>
                </button>
                ${isSelected ? `<div style="position:absolute;top:6px;left:6px;background:#7c3aed;border-radius:5px;padding:2px 6px;font-size:10px;color:#fff;font-weight:700;">✓ Actif</div>` : ''}
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

        // Intensité — format stocké : entier 0-100 par animation-controls
        const intensitySlider = document.getElementById('as-intensity');
        const intensityVal = document.getElementById('as-intensity-val');
        const savedIntensity = localStorage.getItem('productiveapp_animation_intensity');
        if (savedIntensity) {
            const raw = parseFloat(savedIntensity);
            // Si > 1 c'est déjà un %, sinon c'est un ratio 0-1
            const pct = Math.min(100, raw > 1 ? Math.round(raw) : Math.round(raw * 100));
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
        if (content) content.innerHTML = _buildGrid();
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
