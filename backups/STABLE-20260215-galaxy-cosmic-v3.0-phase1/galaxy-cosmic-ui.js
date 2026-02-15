// ═══════════════════════════════════════════════════════════════════
// GALAXY COSMIC UI v3.0 - Interface Fantôme
// Gestion de l'UI contextuelle, radial menu, color picker, etc.
// ═══════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════
// TOOLBAR FLOTTANTE
// ═══════════════════════════════════════════════════════════════════

class CosmicToolbar {
    constructor() {
        this.element = null;
        this.visible = false;
        this.hideTimer = null;
        this.init();
    }

    init() {
        this.createToolbar();
        this.setupAutoHide();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'cosmic-ui cosmic-toolbar';
        toolbar.innerHTML = `
            <button class="cosmic-btn active" data-tool="select" title="Sélectionner (V)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="hand" title="Pan (H)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                </svg>
            </button>

            <div class="cosmic-separator"></div>

            <button class="cosmic-btn" data-tool="circle" title="Cercle (C)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="rect" title="Rectangle (R)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="diamond" title="Losange (D)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2 L22 12 L12 22 L2 12 Z"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="hexagon" title="Hexagone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="star" title="Étoile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </button>

            <div class="cosmic-separator"></div>

            <button class="cosmic-btn" data-tool="connector" title="Connecteur (L)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="text" title="Texte (T)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="4 7 4 4 20 4 20 7"/>
                    <line x1="9" y1="20" x2="15" y2="20"/>
                    <line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="sticky" title="Post-it (S)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5z"/>
                    <polyline points="16 3 16 8 21 8"/>
                </svg>
            </button>

            <div class="cosmic-separator"></div>

            <button class="cosmic-btn" data-action="undo" title="Annuler (Ctrl+Z)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7v6h6"/>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-action="redo" title="Refaire (Ctrl+Y)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 7v6h-6"/>
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-action="zen" title="Mode Zen (Z)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            </button>
        `;

        document.body.appendChild(toolbar);
        this.element = toolbar;

        // Event listeners
        toolbar.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTool(btn.dataset.tool);
            });
        });

        toolbar.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeAction(btn.dataset.action);
            });
        });
    }

    setupAutoHide() {
        // Montrer la toolbar au hover du canvas
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;

        canvas.addEventListener('mousemove', () => {
            this.show();
        });

        canvas.addEventListener('mouseleave', () => {
            this.scheduleHide();
        });

        // Ne pas cacher si on survole la toolbar
        this.element.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimer);
        });

        this.element.addEventListener('mouseleave', () => {
            this.scheduleHide();
        });
    }

    show() {
        clearTimeout(this.hideTimer);
        this.element.classList.add('visible');
        this.visible = true;
    }

    hide() {
        this.element.classList.remove('visible');
        this.visible = false;
    }

    scheduleHide() {
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => this.hide(), 2000);
    }

    selectTool(tool) {
        // Retirer active de tous les boutons
        this.element.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activer le bouton sélectionné
        const btn = this.element.querySelector(`[data-tool="${tool}"]`);
        if (btn) btn.classList.add('active');

        // Mettre à jour l'état global
        if (window.GalaxyCosmic && window.GalaxyCosmic.state) {
            window.GalaxyCosmic.state.currentTool = tool;
        }

        console.log('🛠️ Outil sélectionné:', tool);
    }

    executeAction(action) {
        console.log('⚡ Action:', action);

        switch (action) {
            case 'undo':
                // TODO: Implémenter undo
                break;
            case 'redo':
                // TODO: Implémenter redo
                break;
            case 'zen':
                document.body.classList.toggle('zen-mode');
                break;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// RADIAL MENU (clic droit)
// ═══════════════════════════════════════════════════════════════════

class RadialMenu {
    constructor() {
        this.element = null;
        this.active = false;
        this.items = [
            { id: 'duplicate', icon: '📋', label: 'Dupliquer', shortcut: 'Ctrl+D' },
            { id: 'delete', icon: '🗑️', label: 'Supprimer', shortcut: 'Del' },
            { id: 'copy', icon: '📄', label: 'Copier', shortcut: 'Ctrl+C' },
            { id: 'paste', icon: '📌', label: 'Coller', shortcut: 'Ctrl+V' },
            { id: 'link', icon: '🔗', label: 'Lier', shortcut: 'L' },
            { id: 'color', icon: '🎨', label: 'Couleur', shortcut: 'Alt+C' },
            { id: 'lock', icon: '🔒', label: 'Verrouiller', shortcut: 'Ctrl+L' },
            { id: 'group', icon: '📦', label: 'Grouper', shortcut: 'Ctrl+G' },
        ];
        this.init();
    }

    init() {
        this.createMenu();
        this.setupEvents();
    }

    createMenu() {
        const menu = document.createElement('div');
        menu.className = 'cosmic-radial-menu';

        // Centre
        const center = document.createElement('div');
        center.className = 'radial-center';
        center.textContent = '✨';
        menu.appendChild(center);

        // Items
        this.items.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = 'radial-item';
            btn.dataset.action = item.id;
            btn.textContent = item.icon;

            const label = document.createElement('div');
            label.className = 'radial-item-label';
            label.textContent = item.label;
            btn.appendChild(label);

            btn.addEventListener('click', () => {
                this.executeAction(item.id);
                this.hide();
            });

            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
        this.element = menu;
    }

    setupEvents() {
        // Clic droit sur le canvas
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.show(e.clientX, e.clientY);
        });

        // Clic ailleurs pour fermer
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target) && this.active) {
                this.hide();
            }
        });

        // Échap pour fermer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.active) {
                this.hide();
            }
        });
    }

    show(x, y) {
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.classList.add('active');
        this.active = true;
    }

    hide() {
        this.element.classList.remove('active');
        this.active = false;
    }

    executeAction(action) {
        console.log('📍 Radial action:', action);
        // TODO: Implémenter les actions
    }
}

// ═══════════════════════════════════════════════════════════════════
// COLOR PICKER HSL
// ═══════════════════════════════════════════════════════════════════

class CosmicColorPicker {
    constructor() {
        this.element = null;
        this.hue = 200;
        this.saturation = 100;
        this.lightness = 50;
        this.alpha = 1;
        this.init();
    }

    init() {
        this.createPicker();
        this.setupEvents();
    }

    createPicker() {
        const picker = document.createElement('div');
        picker.className = 'cosmic-ui cosmic-color-picker';
        picker.innerHTML = `
            <div class="color-wheel">
                <div class="color-cursor"></div>
            </div>
            <div class="color-slider" data-slider="lightness">
                <div class="slider-thumb"></div>
            </div>
            <div class="color-slider" data-slider="alpha">
                <div class="slider-thumb"></div>
            </div>
        `;

        document.body.appendChild(picker);
        this.element = picker;

        this.updateColor();
    }

    setupEvents() {
        const wheel = this.element.querySelector('.color-wheel');
        const cursor = this.element.querySelector('.color-cursor');

        // Drag sur la roue
        let isDragging = false;

        wheel.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.updateFromWheel(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.updateFromWheel(e);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Sliders
        this.element.querySelectorAll('.color-slider').forEach(slider => {
            const thumb = slider.querySelector('.slider-thumb');
            let dragging = false;

            thumb.addEventListener('mousedown', (e) => {
                dragging = true;
                e.stopPropagation();
            });

            document.addEventListener('mousemove', (e) => {
                if (!dragging) return;
                this.updateFromSlider(slider, e);
            });

            document.addEventListener('mouseup', () => {
                dragging = false;
            });

            slider.addEventListener('click', (e) => {
                this.updateFromSlider(slider, e);
            });
        });
    }

    updateFromWheel(e) {
        const wheel = this.element.querySelector('.color-wheel');
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.hypot(dx, dy), rect.width / 2);

        this.hue = ((angle * 180 / Math.PI) + 360) % 360;
        this.saturation = (distance / (rect.width / 2)) * 100;

        this.updateColor();
    }

    updateFromSlider(slider, e) {
        const rect = slider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const type = slider.dataset.slider;

        if (type === 'lightness') {
            this.lightness = percent * 100;
        } else if (type === 'alpha') {
            this.alpha = percent;
        }

        this.updateColor();
    }

    updateColor() {
        const color = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;

        // Mettre à jour le curseur de la roue
        const cursor = this.element.querySelector('.color-cursor');
        const wheel = this.element.querySelector('.color-wheel');
        const radius = (this.saturation / 100) * (wheel.offsetWidth / 2);
        const angle = this.hue * Math.PI / 180;

        cursor.style.left = (wheel.offsetWidth / 2 + Math.cos(angle) * radius) + 'px';
        cursor.style.top = (wheel.offsetHeight / 2 + Math.sin(angle) * radius) + 'px';
        cursor.style.background = color;

        // Mettre à jour les sliders
        const lightnessSlider = this.element.querySelector('[data-slider="lightness"]');
        const alphaSlider = this.element.querySelector('[data-slider="alpha"]');

        lightnessSlider.querySelector('.slider-thumb').style.left = (this.lightness) + '%';
        alphaSlider.querySelector('.slider-thumb').style.left = (this.alpha * 100) + '%';

        // Mettre à jour le fond du slider lightness
        lightnessSlider.style.background = `linear-gradient(to right,
            hsl(${this.hue}, ${this.saturation}%, 0%),
            hsl(${this.hue}, ${this.saturation}%, 50%),
            hsl(${this.hue}, ${this.saturation}%, 100%))`;

        console.log('🎨 Couleur:', color);

        // Émettre l'événement
        this.onColorChange && this.onColorChange(color);
    }

    getCurrentColor() {
        return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
    }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALISATION GLOBALE
// ═══════════════════════════════════════════════════════════════════

function initCosmicUI() {
    console.log('🎨 Initialisation Cosmic UI...');

    // Créer tous les composants UI
    window.CosmicToolbar = new CosmicToolbar();
    window.RadialMenu = new RadialMenu();
    window.CosmicColorPicker = new CosmicColorPicker();

    // Montrer la toolbar au démarrage
    setTimeout(() => {
        window.CosmicToolbar.show();
        window.CosmicToolbar.scheduleHide();
    }, 500);

    console.log('✨ Cosmic UI initialisée');
}

// Auto-init après que le DOM et galaxy-cosmic.js soient chargés
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initCosmicUI, 100);
    });
} else {
    setTimeout(initCosmicUI, 100);
}

console.log('📦 galaxy-cosmic-ui.js chargé');
