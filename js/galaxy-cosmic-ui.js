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
            <button class="cosmic-btn" data-tool="marquee" title="Sélection de groupe (M)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="4 2"/>
                    <path d="M8 2l2.5 6 1-2.9 2.9-1L8 2z" fill="currentColor" stroke="none"/>
                </svg>
            </button>

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

            <div class="cosmic-color-wrapper">
                <button id="cosmic-color-btn" class="cosmic-color-swatch" style="background:#60a5fa" title="Couleur des formes"></button>
                <div id="cosmic-color-popup" class="cosmic-color-popup">
                    <div class="cosmic-color-presets">
                        <button class="cosmic-color-dot" data-color="#1e1e1e" style="background:#1e1e1e" title="Noir"></button>
                        <button class="cosmic-color-dot" data-color="#ffffff" style="background:#ffffff" title="Blanc"></button>
                        <button class="cosmic-color-dot" data-color="#e03131" style="background:#e03131" title="Rouge"></button>
                        <button class="cosmic-color-dot" data-color="#1971c2" style="background:#1971c2" title="Bleu"></button>
                        <button class="cosmic-color-dot" data-color="#2f9e44" style="background:#2f9e44" title="Vert"></button>
                        <button class="cosmic-color-dot" data-color="#fbbf24" style="background:#fbbf24" title="Jaune"></button>
                        <button class="cosmic-color-dot" data-color="#f08c00" style="background:#f08c00" title="Orange"></button>
                    </div>
                    <button id="cosmic-color-advanced" class="cosmic-color-advanced-btn" title="Couleur personnalisée">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                        </svg>
                    </button>
                </div>
                <div id="cosmic-color-advanced-panel" class="cosmic-color-adv-panel">
                    <div class="ccp-sat-area">
                        <canvas id="ccp-sat-canvas" width="220" height="160"></canvas>
                        <div id="ccp-sat-cursor" class="ccp-cursor"></div>
                    </div>
                    <div class="ccp-hue-row">
                        <div class="ccp-slider-track ccp-hue-track">
                            <input type="range" id="ccp-hue" min="0" max="360" value="217" class="ccp-range ccp-range-hue">
                        </div>
                    </div>
                    <div class="ccp-alpha-row">
                        <div class="ccp-slider-track ccp-alpha-track">
                            <input type="range" id="ccp-alpha" min="0" max="100" value="100" class="ccp-range ccp-range-alpha">
                        </div>
                    </div>
                    <div class="ccp-footer">
                        <div id="ccp-preview" class="ccp-preview" style="background:#60a5fa"></div>
                        <span class="ccp-hex-label">#</span>
                        <input type="text" id="ccp-hex" class="ccp-hex-input" value="60a5fa" maxlength="8" spellcheck="false">
                    </div>
                </div>
            </div>

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
                    <circle cx="5" cy="5" r="3" fill="currentColor"/><line x1="7" y1="7" x2="17" y2="17"/><circle cx="19" cy="19" r="3" fill="currentColor"/>
                </svg>
            </button>

            <button class="cosmic-btn" data-tool="pen" title="Feutre (P)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
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

            <div class="cosmic-separator"></div>

            <button class="cosmic-btn cosmic-skin-toggle" data-action="skin-toggle" title="Skin Nuit / Désert">
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <clipPath id="skin-left"><rect x="0" y="0" width="12" height="24"/></clipPath>
                    <clipPath id="skin-right"><rect x="12" y="0" width="12" height="24"/></clipPath>
                    <circle cx="12" cy="12" r="9" fill="#1a1a2e" clip-path="url(#skin-left)"/>
                    <circle cx="12" cy="12" r="9" fill="#f5f0e8" clip-path="url(#skin-right)"/>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1"/>
                </svg>
            </button>
        `;

        // Pen width slider (above toolbar, shown only when pen tool is active)
        const penSlider = document.createElement('div');
        penSlider.className = 'cosmic-pen-slider';
        penSlider.id = 'cosmic-pen-slider';
        penSlider.style.display = 'none';
        penSlider.innerHTML = `
            <span class="pen-slider-label">1</span>
            <input type="range" id="cosmic-pen-width" min="1" max="20" value="4" class="pen-slider-range">
            <span class="pen-slider-label">20</span>
        `;

        // Ajouter la toolbar DANS #view-galaxy, pas dans body
        const galaxyView = document.getElementById('view-galaxy');
        if (galaxyView) {
            galaxyView.appendChild(toolbar);
            galaxyView.appendChild(penSlider);
        } else {
            console.warn('⚠️ #view-galaxy not found, toolbar not created');
            return;
        }
        this.element = toolbar;
        this.penSlider = penSlider;

        // Pen width slider event
        const penWidthInput = penSlider.querySelector('#cosmic-pen-width');
        penWidthInput.addEventListener('input', (e) => {
            e.stopPropagation();
            CosmicState.penWidth = parseInt(e.target.value);
        });

        // Don't hide toolbar when hovering pen slider
        penSlider.addEventListener('mouseenter', () => { clearTimeout(this.hideTimer); });
        penSlider.addEventListener('mouseleave', () => { this.scheduleHide(); });

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

        // Color picker popup
        this.initColorPicker(toolbar);
    }

    initColorPicker(toolbar) {
        const btn = toolbar.querySelector('#cosmic-color-btn');
        const popup = toolbar.querySelector('#cosmic-color-popup');
        const advPanel = toolbar.querySelector('#cosmic-color-advanced-panel');
        const advancedBtn = toolbar.querySelector('#cosmic-color-advanced');
        if (!btn || !popup || !advPanel) return;

        // HSL state
        const cp = { h: 217, s: 92, l: 68, a: 1 };

        // --- Helpers ---
        const hslToHex = (h, s, l) => {
            s /= 100; l /= 100;
            const a2 = s * Math.min(l, 1 - l);
            const f = n => {
                const k = (n + h / 30) % 12;
                const c = l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * c).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };

        const hexToHsl = (hex) => {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            const r = parseInt(hex.substring(0,2),16)/255;
            const g = parseInt(hex.substring(2,4),16)/255;
            const b = parseInt(hex.substring(4,6),16)/255;
            const max = Math.max(r,g,b), min = Math.min(r,g,b);
            let h2=0, s2=0, l2 = (max+min)/2;
            if (max !== min) {
                const d = max - min;
                s2 = l2 > 0.5 ? d/(2-max-min) : d/(max+min);
                if (max === r) h2 = ((g-b)/d + (g<b?6:0));
                else if (max === g) h2 = ((b-r)/d + 2);
                else h2 = ((r-g)/d + 4);
                h2 *= 60;
            }
            return { h: Math.round(h2), s: Math.round(s2*100), l: Math.round(l2*100) };
        };

        // --- Apply color everywhere ---
        const self = this;
        const applyColor = () => {
            const hex = hslToHex(cp.h, cp.s, cp.l);
            const color = cp.a < 1
                ? (() => { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${cp.a})`; })()
                : hex;
            CosmicState.currentColor = color;
            btn.style.background = color;
            const preview = advPanel.querySelector('#ccp-preview');
            if (preview) preview.style.background = color;
            const hexInput = advPanel.querySelector('#ccp-hex');
            if (hexInput && document.activeElement !== hexInput) {
                hexInput.value = cp.a < 1
                    ? hex.slice(1) + Math.round(cp.a * 255).toString(16).padStart(2, '0')
                    : hex.slice(1);
            }
            if (self._cpOnColorChange) self._cpOnColorChange(color);
        };

        // --- Saturation/Lightness canvas ---
        const satCanvas = advPanel.querySelector('#ccp-sat-canvas');
        const satCursor = advPanel.querySelector('#ccp-sat-cursor');
        const satCtx = satCanvas.getContext('2d');

        const drawSatArea = () => {
            const w = satCanvas.width, h = satCanvas.height;
            // Base hue fill
            satCtx.fillStyle = `hsl(${cp.h}, 100%, 50%)`;
            satCtx.fillRect(0, 0, w, h);
            // White gradient left→right
            const gW = satCtx.createLinearGradient(0, 0, w, 0);
            gW.addColorStop(0, '#fff'); gW.addColorStop(1, 'rgba(255,255,255,0)');
            satCtx.fillStyle = gW; satCtx.fillRect(0, 0, w, h);
            // Black gradient top→bottom
            const gB = satCtx.createLinearGradient(0, 0, 0, h);
            gB.addColorStop(0, 'rgba(0,0,0,0)'); gB.addColorStop(1, '#000');
            satCtx.fillStyle = gB; satCtx.fillRect(0, 0, w, h);
        };

        const posFromSL = () => {
            // Map s,l to canvas x,y (approximate)
            const x = (cp.s / 100) * satCanvas.width;
            const y = (1 - cp.l / 100) * satCanvas.height;
            return { x, y };
        };

        const slFromPos = (x, y) => {
            const w = satCanvas.width, h = satCanvas.height;
            x = Math.max(0, Math.min(w, x));
            y = Math.max(0, Math.min(h, y));
            // Read pixel to get exact color
            const px = satCtx.getImageData(x, y, 1, 1).data;
            const r = px[0]/255, g = px[1]/255, b = px[2]/255;
            const max = Math.max(r,g,b), min = Math.min(r,g,b);
            let s2 = 0, l2 = (max+min)/2;
            if (max !== min) {
                const d = max - min;
                s2 = l2 > 0.5 ? d/(2-max-min) : d/(max+min);
            }
            cp.s = Math.round(s2 * 100);
            cp.l = Math.round(l2 * 100);
        };

        const updateSatCursor = () => {
            const p = posFromSL();
            satCursor.style.left = p.x + 'px';
            satCursor.style.top = p.y + 'px';
            satCursor.style.borderColor = cp.l > 50 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
        };

        // Sat area interaction
        let satDragging = false;
        const handleSatMove = (e) => {
            const rect = satCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            slFromPos(x, y);
            updateSatCursor();
            applyColor();
            updateAlphaTrack();
        };

        satCanvas.addEventListener('mousedown', (e) => { e.stopPropagation(); satDragging = true; handleSatMove(e); });
        satCanvas.addEventListener('touchstart', (e) => { e.stopPropagation(); e.preventDefault(); satDragging = true; handleSatMove(e); }, { passive: false });
        document.addEventListener('mousemove', (e) => { if (satDragging) handleSatMove(e); });
        document.addEventListener('touchmove', (e) => { if (satDragging) handleSatMove(e); }, { passive: false });
        document.addEventListener('mouseup', () => { satDragging = false; });
        document.addEventListener('touchend', () => { satDragging = false; });

        // --- Hue slider ---
        const hueSlider = advPanel.querySelector('#ccp-hue');
        const updateAlphaTrack = () => {
            const hex = hslToHex(cp.h, cp.s, cp.l);
            const alphaTrack = advPanel.querySelector('.ccp-alpha-track');
            if (alphaTrack) alphaTrack.style.setProperty('--ccp-color', hex);
        };

        hueSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            cp.h = parseInt(e.target.value);
            drawSatArea();
            updateSatCursor();
            applyColor();
            updateAlphaTrack();
        });

        // --- Alpha slider ---
        const alphaSlider = advPanel.querySelector('#ccp-alpha');
        alphaSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            cp.a = parseInt(e.target.value) / 100;
            applyColor();
        });

        // --- Hex input ---
        const hexInput = advPanel.querySelector('#ccp-hex');
        hexInput.addEventListener('input', (e) => {
            e.stopPropagation();
            let val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
            if (val.length >= 6) {
                const hsl = hexToHsl(val.substring(0, 6));
                cp.h = hsl.h; cp.s = hsl.s; cp.l = hsl.l;
                if (val.length >= 8) cp.a = parseInt(val.substring(6, 8), 16) / 255;
                hueSlider.value = cp.h;
                alphaSlider.value = Math.round(cp.a * 100);
                drawSatArea();
                updateSatCursor();
                applyColor();
                updateAlphaTrack();
            }
        });

        // --- Preset color dots ---
        const setFromHex = (hex) => {
            const hsl = hexToHsl(hex);
            cp.h = hsl.h; cp.s = hsl.s; cp.l = hsl.l; cp.a = 1;
            hueSlider.value = cp.h;
            alphaSlider.value = 100;
            drawSatArea();
            updateSatCursor();
            applyColor();
            updateAlphaTrack();
        };

        // --- Toggle popup (presets) ---
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            advPanel.classList.remove('open');
            popup.classList.toggle('open');
        });

        popup.querySelectorAll('.cosmic-color-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                setFromHex(dot.dataset.color);
                popup.classList.remove('open');
                if (popup.classList.contains('floating')) self.closeFloatingColorPicker();
            });
        });

        // --- Toggle advanced panel ---
        advancedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.remove('open');
            const opening = !advPanel.classList.contains('open');
            advPanel.classList.toggle('open');
            // Copy floating position from popup to advPanel
            if (opening && popup.classList.contains('floating')) {
                advPanel.classList.add('floating');
                advPanel.style.left = popup.style.left;
                advPanel.style.top = popup.style.top;
            }
            if (opening) {
                drawSatArea();
                updateSatCursor();
                updateAlphaTrack();
            }
        });

        // --- Close on outside click ---
        document.addEventListener('click', (e) => {
            if (self._cpJustOpened) return;
            if (!e.target.closest('.cosmic-color-wrapper') && !e.target.closest('.cosmic-color-popup') && !e.target.closest('.cosmic-color-adv-panel')) {
                popup.classList.remove('open');
                advPanel.classList.remove('open');
                if (popup.classList.contains('floating')) self.closeFloatingColorPicker();
            }
        });

        // Prevent toolbar hide when interacting with panels
        advPanel.addEventListener('mouseenter', () => { clearTimeout(this.hideTimer); });
        advPanel.addEventListener('click', (e) => { e.stopPropagation(); });

        // Initial draw
        drawSatArea();
        updateSatCursor();
        updateAlphaTrack();

        // --- Expose API for radial menu reuse ---
        this._cpPopup = popup;
        this._cpAdvPanel = advPanel;
        this._cpOnColorChange = null;
        this._cpJustOpened = false;
    }

    /**
     * Open color picker at fixed position (for radial menu).
     * @param {number} x - screen X
     * @param {number} y - screen Y
     * @param {Function} onPick - callback(color) when color is chosen
     */
    openColorPickerAt(x, y, onPick) {
        const popup = this._cpPopup;
        const advPanel = this._cpAdvPanel;
        if (!popup || !advPanel) return;

        // Close any open state first
        popup.classList.remove('open');
        advPanel.classList.remove('open');

        // Set callback
        this._cpOnColorChange = onPick;

        // Protect from immediate closure by stale click events
        this._cpJustOpened = true;
        setTimeout(() => { this._cpJustOpened = false; }, 300);

        // Position in floating mode
        popup.classList.add('floating');
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        advPanel.classList.add('floating');
        advPanel.style.left = x + 'px';
        advPanel.style.top = (y - 280) + 'px';

        popup.classList.add('open');
    }

    closeFloatingColorPicker() {
        const popup = this._cpPopup;
        const advPanel = this._cpAdvPanel;
        if (!popup || !advPanel) return;

        popup.classList.remove('open', 'floating');
        advPanel.classList.remove('open', 'floating');
        popup.style.left = '';
        popup.style.top = '';
        advPanel.style.left = '';
        advPanel.style.top = '';
        this._cpOnColorChange = null;
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
        if (this.penSlider) this.penSlider.classList.add('visible');
        this.visible = true;
    }

    hide() {
        this.element.classList.remove('visible');
        if (this.penSlider) this.penSlider.classList.remove('visible');
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

        // Cursor on canvas
        const cv = document.getElementById('galaxy-canvas');
        if (cv) {
            const shapes = ['circle', 'rect', 'diamond', 'hexagon', 'star'];
            cv.className = shapes.includes(tool) ? 'tool-shape'
                : tool === 'hand' ? 'tool-hand'
                : tool === 'connector' ? 'tool-shape'
                : tool === 'pen' ? 'tool-pen'
                : tool === 'marquee' ? 'tool-shape' : '';
        }

        // Show/hide pen width slider
        const slider = document.getElementById('cosmic-pen-slider');
        if (slider) slider.style.display = tool === 'pen' ? 'flex' : 'none';

        console.log('🛠️ Outil sélectionné:', tool);
    }

    executeAction(action) {
        console.log('⚡ Action:', action);

        switch (action) {
            case 'undo':
                if (window.CosmicHistory) window.CosmicHistory.undo();
                break;
            case 'redo':
                if (window.CosmicHistory) window.CosmicHistory.redo();
                break;
            case 'zen':
                document.body.classList.toggle('zen-mode');
                break;
            case 'skin-toggle':
                if (window.GalaxyCosmic && window.GalaxyCosmic.toggleSkin) {
                    window.GalaxyCosmic.toggleSkin();
                }
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
        this.targetNode = null;
        this.items = [
            { id: 'duplicate', icon: '📋', label: 'Dupliquer', shortcut: 'Ctrl+D' },
            { id: 'delete', icon: '🗑️', label: 'Supprimer', shortcut: 'Del' },
            { id: 'copy', icon: '📄', label: 'Copier', shortcut: 'Ctrl+C' },
            { id: 'text', icon: 'T', label: 'Texte', shortcut: 'T' },
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

            btn.title = `${item.label} (${item.shortcut})`;

            btn.addEventListener('click', () => {
                this.executeAction(item.id);
                if (item.id !== 'color' && item.id !== 'text') this.hide();
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
            // Convert screen to world coords to find node under cursor
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const { x: camX, y: camY, zoom } = CosmicState.camera;
            const wx = (mx - canvas.width / 2) / zoom + camX;
            const wy = (my - canvas.height / 2) / zoom + camY;
            this.targetNode = typeof window.getNodeAtWorld === 'function' ? window.getNodeAtWorld(wx, wy) : null;

            // Right-click on text → show text-specific menu
            const textNode = typeof window.getTextNodeAtWorld === 'function' ? window.getTextNodeAtWorld(wx, wy) : null;
            if (textNode) {
                this.showTextMenu(e.clientX, e.clientY, textNode);
                return;
            }
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
            if (e.key === 'Escape') {
                if (this.active) this.hide();
                if (this._textMenu && this._textMenu.classList.contains('active')) this.hideTextMenu();
            }
        });
    }

    show(x, y) {
        this.lastX = x;
        this.lastY = y;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.updateLockButton();
        this.element.classList.add('active');
        this.active = true;
    }

    updateLockButton() {
        const locked = this.targetNode && this.targetNode.locked;
        const lockBtn = this.element.querySelector('[data-action="lock"]');
        if (!lockBtn) return;
        lockBtn.textContent = locked ? '🔓' : '🔒';
        lockBtn.title = locked ? 'Déverrouiller (Ctrl+L)' : 'Verrouiller (Ctrl+L)';
    }

    hide() {
        this.element.classList.remove('active');
        this.active = false;
        if (this._colorMode) this.hideColorSubmenu();
    }

    executeAction(action) {
        if (action === 'lock') {
            this.toggleLockTarget();
            return;
        }
        // Block actions on locked nodes (except lock itself)
        if (this.targetNode && this.targetNode.locked) return;

        if (action === 'delete') {
            this.deleteTarget();
        } else if (action === 'duplicate') {
            this.duplicateTarget();
        } else if (action === 'color') {
            this.showColorSubmenu();
        } else if (action === 'text') {
            this.hide();
            this.editText();
        }
    }

    toggleLockTarget() {
        const node = this.targetNode;
        if (!node) return;
        node.locked = !node.locked;
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof debouncedSave === 'function') debouncedSave();
        console.log(node.locked ? '🔒 Forme verrouillée' : '🔓 Forme déverrouillée', node.id);
    }

    showColorSubmenu() {
        const node = this.targetNode;
        if (!node) return;

        // Outer ring: primary colors
        const outerColors = ['#1e1e1e', '#ffffff', '#e03131', '#1971c2', '#2f9e44', '#fbbf24', '#f08c00'];
        // Inner ring: pastels, variants & missing hues
        const innerColors = ['#f8a4c8', '#93c5fd', '#86efac', '#fde68a', '#a78bfa', '#5eead4', '#a1887f', '#9ca3af'];

        // Hide regular items
        this.element.querySelectorAll('.radial-item').forEach(el => el.style.display = 'none');

        // Change center to back arrow
        const center = this.element.querySelector('.radial-center');
        this._centerOriginal = center.textContent;
        center.textContent = '←';
        center.style.cursor = 'pointer';

        // Center click → go back to main menu
        this._centerBackHandler = (e) => {
            e.stopPropagation();
            this.hideColorSubmenu();
        };
        center.addEventListener('click', this._centerBackHandler);

        const self = this;
        function createDot(color, x, y, cls) {
            const dot = document.createElement('button');
            dot.className = cls;
            dot.style.background = color;
            dot.style.left = `calc(50% + ${x}px)`;
            dot.style.top = `calc(50% + ${y}px)`;
            dot.title = color;
            dot.dataset.color = color;

            // Light colors need a visible border
            const lightColors = ['#ffffff', '#fde68a', '#86efac', '#93c5fd', '#f8a4c8', '#5eead4'];
            if (lightColors.includes(color)) {
                dot.style.borderColor = 'rgba(0, 0, 0, 0.25)';
            }

            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                node.color = color;
                if (window.CosmicHistory) window.CosmicHistory.save();
                if (typeof debouncedSave === 'function') debouncedSave();
                self.hide();
            });

            self.element.appendChild(dot);
        }

        // Outer ring (large dots)
        const outerR = 100;
        outerColors.forEach((color, i) => {
            const angle = (2 * Math.PI / outerColors.length) * i - Math.PI / 2;
            createDot(color, Math.cos(angle) * outerR, Math.sin(angle) * outerR, 'radial-color-dot');
        });

        // Inner ring (small dots)
        const innerR = 52;
        innerColors.forEach((color, i) => {
            const angle = (2 * Math.PI / innerColors.length) * i - Math.PI / 2;
            createDot(color, Math.cos(angle) * innerR, Math.sin(angle) * innerR, 'radial-color-dot radial-color-dot-sm');
        });

        this._colorMode = true;
        this.element.classList.add('color-mode');
    }

    hideColorSubmenu() {
        // Remove color dots
        this.element.querySelectorAll('.radial-color-dot').forEach(el => el.remove());

        // Show regular items
        this.element.querySelectorAll('.radial-item').forEach(el => el.style.display = '');

        // Restore center
        const center = this.element.querySelector('.radial-center');
        center.textContent = this._centerOriginal || '✨';
        center.style.cursor = '';
        if (this._centerBackHandler) {
            center.removeEventListener('click', this._centerBackHandler);
            this._centerBackHandler = null;
        }

        this._colorMode = false;
        this.element.classList.remove('color-mode');
    }

    editText() {
        const node = this.targetNode;
        if (!node) return;
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;

        // Compute screen position of node center
        const { x: camX, y: camY, zoom } = CosmicState.camera;
        const sx = (node.x - camX) * zoom + canvas.width / 2;
        const sy = (node.y - camY) * zoom + canvas.height / 2;
        const rect = canvas.getBoundingClientRect();

        const input = document.createElement('input');
        input.type = 'text';
        input.value = node.text || '';
        input.placeholder = 'Texte…';
        input.style.cssText = `
            position:fixed; z-index:3000;
            left:${rect.left + sx}px; top:${rect.top + sy}px;
            transform:translate(-50%,-50%);
            background:rgba(15,15,25,0.9); color:#e2e8f0;
            border:1px solid rgba(96,165,250,0.5); border-radius:6px;
            padding:6px 12px; font:${Math.max(13, 14 * zoom)}px "Segoe UI",sans-serif;
            text-align:center; outline:none; min-width:60px; max-width:200px;
        `;
        document.body.appendChild(input);
        input.focus();
        input.select();

        const commit = () => {
            node.text = input.value.trim();
            input.remove();
            if (window.CosmicHistory) window.CosmicHistory.save();
            if (typeof debouncedSave === 'function') debouncedSave();
        };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { input.remove(); }
        });
        input.addEventListener('blur', commit);
    }

    duplicateTarget() {
        const node = this.targetNode;
        if (!node) return;

        const clone = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: node.type || 'shape',
            shape: node.shape,
            x: node.x + 30,
            y: node.y + 30,
            radius: node.radius,
            color: node.color,
            text: node.text || '',
            fontSize: node.fontSize,
            textColor: node.textColor,
            createdAt: Date.now()
        };

        CosmicState.nodes.push(clone);
        CosmicState.selectedNodes.clear();
        CosmicState.selectedNodes.add(clone);

        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof debouncedSave === 'function') debouncedSave();
        console.log('📋 Forme dupliquée:', clone.id);
    }

    deleteTarget() {
        const node = this.targetNode;
        if (!node) return;

        // Remove connections linked to this node
        CosmicState.connections = CosmicState.connections.filter(
            c => c.fromId !== node.id && c.toId !== node.id
        );

        // Remove the node itself
        CosmicState.nodes = CosmicState.nodes.filter(n => n.id !== node.id);

        // Remove from selection if selected
        CosmicState.selectedNodes.delete(node);

        // Save history for undo/redo
        if (window.CosmicHistory) window.CosmicHistory.save();

        // Trigger backend save if available
        if (typeof debouncedSave === 'function') debouncedSave();

        this.targetNode = null;
        console.log('🗑️ Forme supprimée:', node.id);
    }

    // ─── Text-specific mini menu ───

    createTextMenu() {
        const menu = document.createElement('div');
        menu.className = 'cosmic-text-menu';
        menu.innerHTML = `
            <button class="text-menu-item" data-action="text-color" title="Couleur du texte">🎨</button>
            <button class="text-menu-item text-size-btn" data-action="size-minus" title="Réduire la police">A−</button>
            <span class="text-size-value">14</span>
            <button class="text-menu-item text-size-btn" data-action="size-plus" title="Agrandir la police">A+</button>
        `;
        document.body.appendChild(menu);
        this._textMenu = menu;
        this._textMenuNode = null;

        menu.querySelector('[data-action="text-color"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openTextColorPicker();
        });
        menu.querySelector('[data-action="size-minus"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeTextSize(-2);
        });
        menu.querySelector('[data-action="size-plus"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeTextSize(2);
        });

        document.addEventListener('click', (e) => {
            if (this._textMenu && !this._textMenu.contains(e.target) && this._textMenu.classList.contains('active')) {
                this.hideTextMenu();
            }
        });
    }

    showTextMenu(x, y, node) {
        if (!this._textMenu) this.createTextMenu();
        this._textMenuNode = node;
        this._textMenu.style.left = x + 'px';
        this._textMenu.style.top = y + 'px';
        this._textMenu.querySelector('.text-size-value').textContent = node.fontSize || 14;
        this._textMenu.classList.add('active');
        // Hide regular radial if open
        this.hide();
    }

    hideTextMenu() {
        if (this._textMenu) {
            this._textMenu.classList.remove('active');
            this._textMenuNode = null;
        }
    }

    changeTextSize(delta) {
        const node = this._textMenuNode;
        if (!node) return;
        node.fontSize = Math.max(6, Math.min(120, (node.fontSize || 14) + delta));
        this._textMenu.querySelector('.text-size-value').textContent = node.fontSize;
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof debouncedSave === 'function') debouncedSave();
    }

    openTextColorPicker() {
        const node = this._textMenuNode;
        if (!node || !window.CosmicToolbar) return;
        const menu = this._textMenu;
        const rect = menu.getBoundingClientRect();
        window.CosmicToolbar.openColorPickerAt(rect.left, rect.top - 10, (color) => {
            node.textColor = color;
            if (window.CosmicHistory) window.CosmicHistory.save();
            if (typeof debouncedSave === 'function') debouncedSave();
        });
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

    // Montrer la toolbar au démarrage + sélectionner cercle par défaut
    setTimeout(() => {
        window.CosmicToolbar.show();
        window.CosmicToolbar.selectTool('circle');
        window.CosmicToolbar.scheduleHide();
    }, 500);

    console.log('✨ Cosmic UI initialisée');
}

// Auto-init DÉSACTIVÉ - L'UI s'initialise UNIQUEMENT quand user ouvre Galaxy View via galaxie-view.js
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         setTimeout(initCosmicUI, 100);
//     });
// } else {
//     setTimeout(initCosmicUI, 100);
// }

// Export pour init manuelle depuis galaxie-view.js
window.initCosmicUI = initCosmicUI;

console.log('📦 galaxy-cosmic-ui.js chargé - UI en attente (init manuel)');
