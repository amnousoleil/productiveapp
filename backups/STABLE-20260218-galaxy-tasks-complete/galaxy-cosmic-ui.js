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
        this._initFullscreenListener();
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

            <div class="cosmic-separator"></div>

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

            <button class="cosmic-btn" id="cosmic-fullscreen-btn" data-action="fullscreen" title="Plein écran (F11)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
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

        // Restore popup to original parent (toolbar) after floating
        if (this._cpFloatRestore) {
            this._cpFloatRestore.appendChild(popup);
            this._cpFloatRestore.appendChild(advPanel);
            this._cpFloatRestore = null;
        }
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
                : tool === 'text' ? 'tool-text'
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
            case 'skin-toggle':
                if (window.GalaxyCosmic && window.GalaxyCosmic.toggleSkin) {
                    window.GalaxyCosmic.toggleSkin();
                }
                break;
            case 'fullscreen':
                this._toggleFullscreen();
                break;
        }
    }

    _toggleFullscreen() {
        var container = document.getElementById('view-galaxy');
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(function(err) {
                console.warn('[Cosmic] Fullscreen denied:', err.message);
            });
        } else {
            document.exitFullscreen();
        }
    }

    _initFullscreenListener() {
        var self = this;
        document.addEventListener('fullscreenchange', function() {
            var btn = document.getElementById('cosmic-fullscreen-btn');
            if (!btn) return;
            var isFS = !!document.fullscreenElement;
            // Swap icon: expand arrows ↔ compress arrows
            btn.innerHTML = isFS
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                  + '<path d="M4 14h3a2 2 0 0 1 2 2v3"/>'
                  + '<path d="M20 10h-3a2 2 0 0 1-2-2V5"/>'
                  + '<path d="M14 20v-3a2 2 0 0 1 2-2h3"/>'
                  + '<path d="M10 4v3a2 2 0 0 1-2 2H5"/>'
                  + '</svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                  + '<path d="M8 3H5a2 2 0 0 0-2 2v3"/>'
                  + '<path d="M21 8V5a2 2 0 0 0-2-2h-3"/>'
                  + '<path d="M16 21h3a2 2 0 0 0 2-2v-3"/>'
                  + '<path d="M3 16v3a2 2 0 0 0 2 2h3"/>'
                  + '</svg>';
            // Floating project name overlay
            CosmicToolbar._updateFullscreenLabel(isFS);
            // Trigger canvas resize after fullscreen transition
            setTimeout(function() {
                window.dispatchEvent(new Event('resize'));
                if (window.Galaxy3D && window.Galaxy3D.onResize) {
                    window.Galaxy3D.onResize();
                }
                // Ensure keyboard focus stays inside fullscreen
                if (isFS) {
                    var fsEl = document.fullscreenElement;
                    if (fsEl) { fsEl.tabIndex = -1; fsEl.focus(); }
                }
            }, 100);
        });
    }

    static _updateFullscreenLabel(isFS) {
        var existing = document.getElementById('galaxy-fs-project-label');
        var sidebar = document.getElementById('app-sidebar');
        if (isFS) {
            // Hide sidebar to reclaim full width
            if (sidebar) sidebar.style.display = 'none';
            if (existing) existing.remove();
            var label = document.createElement('div');
            label.id = 'galaxy-fs-project-label';
            // Get project name from persistence or toolbar
            var projectName = '';
            if (typeof CosmicPersistence !== 'undefined' && CosmicPersistence.currentProjectName) {
                projectName = CosmicPersistence.currentProjectName;
            } else {
                var nameEl = document.querySelector('.cosmic-project-name');
                if (nameEl) projectName = nameEl.textContent.trim();
            }
            label.textContent = projectName || 'Galaxy View';
            var container = document.getElementById('view-galaxy');
            if (container) container.appendChild(label);
            // Move radial menu inside fullscreen element so it stays visible
            var radial = document.querySelector('.cosmic-radial-menu');
            if (radial && container) container.appendChild(radial);
        } else {
            // Restore sidebar
            if (sidebar) sidebar.style.display = '';
            if (existing) existing.remove();
            // Move radial menu back to body
            var radial = document.querySelector('.cosmic-radial-menu');
            if (radial) document.body.appendChild(radial);
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
            { id: 'lock', icon: '🔒', label: 'Verrouiller', shortcut: 'Ctrl+L' },
            { id: 'color', icon: '🎨', label: 'Couleur', shortcut: 'Alt+C' },
            { id: 'opacity', icon: '<span style="font-size:22px;line-height:1">◐</span>', label: 'Opacité', shortcut: '', isSvg: true },
            { id: 'duplicate', icon: '📋', label: 'Dupliquer', shortcut: 'Ctrl+D' },
            { id: 'delete', icon: '🗑️', label: 'Supprimer', shortcut: 'Del' },
            { id: 'text', icon: 'T', label: 'Texte', shortcut: 'T' },
        ];
        this._opacityMode = false;
        this.init();
    }

    init() {
        this.createMenu();
        this.setupEvents();
    }

    createMenu() {
        const menu = document.createElement('div');
        menu.className = 'cosmic-radial-menu';

        // Centre (hidden, kept in DOM for color submenu back-button logic)
        const center = document.createElement('div');
        center.className = 'radial-center';
        center.style.display = 'none';
        menu.appendChild(center);

        // Items
        this.items.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = 'radial-item';
            btn.dataset.action = item.id;
            if (item.isSvg) {
                btn.innerHTML = item.icon;
            } else {
                btn.textContent = item.icon;
            }

            btn.title = `${item.label} (${item.shortcut})`;

            btn.addEventListener('click', () => {
                this.executeAction(item.id);
                if (item.id !== 'color' && item.id !== 'opacity' && item.id !== 'text') this.hide();
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

            // If no node, check if a stroke is under cursor → select it for deletion via menu
            if (!this.targetNode && typeof window.getStrokeAtWorld === 'function') {
                const stroke = window.getStrokeAtWorld(wx, wy);
                if (stroke) {
                    CosmicState._selectedStrokeId = stroke.id;
                    CosmicState.selectedNodes.clear();
                }
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
            }
        });
    }

    show(x, y) {
        this.lastX = x;
        this.lastY = y;
        const mw = this.element.offsetWidth || 220;
        const mh = this.element.offsetHeight || 220;
        this.element.style.left = (x - mw / 2) + 'px';
        this.element.style.top = (y - mh / 2) + 'px';
        this.updateLockButton();

        // Menu center is now on cursor — arc opens downward-right (away from typical mouse approach)
        const arcCenter = Math.PI / 4; // 45° = down-right

        // Position items on a 140° arc, radius 100px (6 items, gap ~6px between 44px buttons)
        const RADIUS = 100;
        const ARC = 140 * Math.PI / 180; // 140° in radians
        const count = this.items.length;
        const btns = this.element.querySelectorAll('.radial-item');

        btns.forEach((btn, i) => {
            // Spread from -75° to +75° around arcCenter
            const angle = arcCenter + (i / (count - 1) - 0.5) * ARC;
            const tx = Math.cos(angle) * RADIUS;
            const ty = Math.sin(angle) * RADIUS;

            // Reset to center first (for re-opening in new direction)
            btn.style.transform = 'translate(0, 0) scale(0)';
            btn.style.opacity = '0';
            btn.style.transition = 'none';
            // Store target position for hover
            btn.dataset.tx = Math.round(tx);
            btn.dataset.ty = Math.round(ty);

            // Trigger reflow then animate to position with stagger
            requestAnimationFrame(() => {
                const delay = i * 40;
                btn.style.transition = `transform 0.2s cubic-bezier(0.2, 1, 0.3, 1) ${delay}ms, opacity 0.2s ease ${delay}ms`;
                btn.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px) scale(1)`;
                btn.style.opacity = '1';
            });
        });

        // Hover scale handlers
        this._hoverIn = this._hoverIn || ((e) => {
            const btn = e.currentTarget;
            const tx = btn.dataset.tx, ty = btn.dataset.ty;
            btn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
            btn.style.transform = `translate(${tx}px, ${ty}px) scale(1.15)`;
            btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.45)';
        });
        this._hoverOut = this._hoverOut || ((e) => {
            const btn = e.currentTarget;
            const tx = btn.dataset.tx, ty = btn.dataset.ty;
            btn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
            btn.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;
            btn.style.boxShadow = '';
        });
        btns.forEach(btn => {
            btn.removeEventListener('mouseenter', this._hoverIn);
            btn.removeEventListener('mouseleave', this._hoverOut);
            btn.addEventListener('mouseenter', this._hoverIn);
            btn.addEventListener('mouseleave', this._hoverOut);
        });

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
        // Reverse stagger close: last item disappears first
        const btns = this.element.querySelectorAll('.radial-item');
        const count = btns.length;
        btns.forEach((btn, i) => {
            const delay = (count - 1 - i) * 40;
            btn.style.transition = `transform 0.15s ease-in ${delay}ms, opacity 0.15s ease-in ${delay}ms`;
            btn.style.transform = 'translate(0, 0) scale(0.8)';
            btn.style.opacity = '0';
        });

        this.element.classList.remove('active');
        this.active = false;
        if (this._colorMode) this.hideColorSubmenu();
        if (this._opacityMode) this.hideOpacitySubmenu();
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
        } else if (action === 'opacity') {
            this.showOpacitySubmenu();
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
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
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

        // Show center as back arrow for color submenu
        const center = this.element.querySelector('.radial-center');
        center.style.display = '';
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
                if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
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

        // Hide center again
        const center = this.element.querySelector('.radial-center');
        center.style.display = 'none';
        center.textContent = '';
        center.style.cursor = '';
        if (this._centerBackHandler) {
            center.removeEventListener('click', this._centerBackHandler);
            this._centerBackHandler = null;
        }

        this._colorMode = false;
        this.element.classList.remove('color-mode');
    }

    showOpacitySubmenu() {
        const node = this.targetNode;
        if (!node) return;

        // Hide regular items
        this.element.querySelectorAll('.radial-item').forEach(el => el.style.display = 'none');

        // Show center as back arrow
        const center = this.element.querySelector('.radial-center');
        center.style.display = '';
        center.textContent = '←';
        center.style.cursor = 'pointer';
        this._opaCenterHandler = (e) => { e.stopPropagation(); this.hideOpacitySubmenu(); };
        center.addEventListener('click', this._opaCenterHandler);

        // Container
        const wrap = document.createElement('div');
        wrap.className = 'radial-opacity-wrap';
        const currentOpa = node.opacity != null ? Math.round(node.opacity * 100) : 100;

        wrap.innerHTML = `
            <label class="radial-opa-label">${currentOpa}%</label>
            <input type="range" class="radial-opa-slider" min="10" max="100" value="${currentOpa}">
        `;

        // Prevent menu close on interaction
        wrap.addEventListener('mousedown', e => e.stopPropagation());
        wrap.addEventListener('click', e => e.stopPropagation());

        const slider = wrap.querySelector('.radial-opa-slider');
        const label = wrap.querySelector('.radial-opa-label');

        slider.addEventListener('input', () => {
            const v = parseInt(slider.value);
            label.textContent = v + '%';
            node.opacity = v / 100;
        });
        slider.addEventListener('change', () => {
            if (window.CosmicHistory) window.CosmicHistory.save();
            if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
        });

        this.element.appendChild(wrap);
        this._opacityMode = true;
    }

    hideOpacitySubmenu() {
        this.element.querySelectorAll('.radial-opacity-wrap').forEach(el => el.remove());
        this.element.querySelectorAll('.radial-item').forEach(el => el.style.display = '');

        const center = this.element.querySelector('.radial-center');
        center.style.display = 'none';
        center.textContent = '';
        center.style.cursor = '';
        if (this._opaCenterHandler) {
            center.removeEventListener('click', this._opaCenterHandler);
            this._opaCenterHandler = null;
        }

        this._opacityMode = false;
    }

    editText(options) {
        const node = this.targetNode;
        if (!node) return;
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;
        const onDone = options && options.onDone;

        // Compute screen position & size of node
        const { x: camX, y: camY, zoom } = CosmicState.camera;
        const sx = (node.x - camX) * zoom + canvas.width / 2;
        const sy = (node.y - camY) * zoom + canvas.height / 2;
        const rect = canvas.getBoundingClientRect();
        const rx = rect.width / canvas.width;
        const ry = rect.height / canvas.height;
        const r = node.radius * zoom;

        // Input width = shape width in CSS pixels (use textBox dimensions for text nodes)
        const inputW = (node.isTextNode && node.textBoxWidth)
            ? node.textBoxWidth * zoom * rx
            : node.isTextNode ? r * 3 * rx
            : (node.shape === 'rect' ? (node.width || r * 1.6) : r * 2) * rx;
        const fontSize = Math.max(10, (node.fontSize || 14) * zoom * ry);

        // Contrast: use textColor for text nodes, auto-detect for shapes
        let textCol;
        if (node.isTextNode) {
            textCol = node.textColor || '#ffffff';
        } else {
            const c = node.color || '#60a5fa';
            const rgb = parseInt(c.slice(1), 16);
            const lum = ((rgb >> 16) & 0xff) * 0.299 + ((rgb >> 8) & 0xff) * 0.587 + (rgb & 0xff) * 0.114;
            textCol = lum > 140 ? '#1a1a2e' : '#ffffff';
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cosmic-inline-text-edit';
        input.value = node.text || '';
        input.placeholder = 'Texte…';
        input.style.cssText = `
            position:fixed; z-index:3000;
            left:${rect.left + sx * rx}px; top:${rect.top + sy * ry}px;
            transform:translate(-50%,-50%);
            color:${textCol};
            font:${fontSize}px "Segoe UI",sans-serif;
            width:${inputW}px; max-width:${inputW}px;
            caret-color:${textCol};
        `;
        // Append to fullscreen element if active, otherwise body
        var fsParent = document.fullscreenElement || document.body;
        fsParent.appendChild(input);
        input.focus();
        input.select();

        // Hide canvas text rendering while editing (prevents double text)
        node._editing = true;

        // Live preview: update node text as user types
        const onInput = () => { node.text = input.value; };
        input.addEventListener('input', onInput);

        let committed = false;
        const cleanup = () => {
            delete node._editing;
            input.removeEventListener('input', onInput);
            input.remove();
            // Restore focus inside fullscreen so keyboard shortcuts keep working
            var focusTarget = document.fullscreenElement || canvas;
            if (focusTarget && focusTarget.focus) focusTarget.focus();
        };
        const commit = () => {
            if (committed) return;
            committed = true;
            node.text = input.value.trim();
            cleanup();
            if (onDone) {
                onDone(node.text);
            } else {
                if (window.CosmicHistory) window.CosmicHistory.save();
                if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
            }
        };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') {
                node.text = input.dataset.original;
                cleanup();
                committed = true;
                if (onDone) onDone(input.dataset.original);
            }
        });
        input.dataset.original = node.text || '';
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
            isTextNode: node.isTextNode || false,
            textBoxWidth: node.textBoxWidth || 0,
            textBoxHeight: node.textBoxHeight || 0,
            createdAt: Date.now()
        };

        CosmicState.nodes.push(clone);
        CosmicState.selectedNodes.clear();
        CosmicState.selectedNodes.add(clone);

        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
        console.log('📋 Forme dupliquée:', clone.id);
    }

    deleteTarget() {
        const node = this.targetNode;

        // If no node targeted, try deleting selected stroke instead
        if (!node && CosmicState._selectedStrokeId) {
            CosmicState.strokes = CosmicState.strokes.filter(
                s => s.id !== CosmicState._selectedStrokeId
            );
            CosmicState._selectedStrokeId = null;
            if (window.CosmicHistory) window.CosmicHistory.save();
            if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
            this.hide();
            return;
        }

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
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();

        this.targetNode = null;
        console.log('🗑️ Forme supprimée:', node.id);
    }

}

// ═══════════════════════════════════════════════════════════════════
// TEXT TOOLBAR FLOTTANTE (au-dessus de la forme sélectionnée)
// ═══════════════════════════════════════════════════════════════════

class TextToolbar {
    constructor() {
        this.element = null;
        this._node = null;
        this.create();
    }

    create() {
        const bar = document.createElement('div');
        bar.className = 'cosmic-text-toolbar';
        bar.innerHTML = `
            <button class="ttb-btn ttb-size" data-action="size-down" title="Réduire le texte">A−</button>
            <button class="ttb-btn ttb-size" data-action="size-up" title="Agrandir le texte">A+</button>
            <button class="ttb-btn ttb-color" data-action="color" title="Couleur du texte">
                <span class="ttb-color-swatch"></span>
            </button>
            <button class="ttb-btn ttb-del" data-action="delete-text" title="Supprimer le texte">🗑</button>
        `;

        // Prevent canvas interaction
        bar.addEventListener('mousedown', e => e.stopPropagation());
        bar.addEventListener('click', e => e.stopPropagation());
        bar.addEventListener('dblclick', e => e.stopPropagation());
        bar.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); });

        // A−/A+ with hold-to-accelerate
        this._setupHold(bar.querySelector('[data-action="size-down"]'), -2);
        this._setupHold(bar.querySelector('[data-action="size-up"]'), 2);

        bar.querySelector('[data-action="color"]').addEventListener('click', () => this.pickColor());
        bar.querySelector('[data-action="delete-text"]').addEventListener('click', () => this.deleteText());

        document.body.appendChild(bar);
        this.element = bar;
    }

    // Hold-to-accelerate: after 300ms hold, repeats with decreasing interval
    _setupHold(btn, delta) {
        let holdTimeout = null;
        let repeatTimeout = null;
        let interval = 150;
        let held = false;

        const tick = () => {
            this.changeSize(delta);
            interval = Math.max(40, interval - 15);
            repeatTimeout = setTimeout(tick, interval);
        };

        btn.addEventListener('mousedown', () => {
            held = false;
            interval = 150;
            holdTimeout = setTimeout(() => { held = true; tick(); }, 300);
        });

        const stop = () => {
            clearTimeout(holdTimeout);
            clearTimeout(repeatTimeout);
            if (held) this._saveState();
        };

        btn.addEventListener('mouseup', stop);
        btn.addEventListener('mouseleave', () => { stop(); held = false; });

        btn.addEventListener('click', () => {
            if (!held) { this.changeSize(delta); this._saveState(); }
            held = false;
        });
    }

    update() {
        const sel = CosmicState.selectedNodes;
        if (sel.size !== 1) { this.hide(); return; }
        const node = sel.values().next().value;
        if (!node.text) { this.hide(); return; }

        this._node = node;
        const canvas = CosmicState.canvas;
        if (!canvas) { this.hide(); return; }

        const { x: camX, y: camY, zoom } = CosmicState.camera;
        const sx = (node.x - camX) * zoom + canvas.width / 2;
        const sy = (node.y - camY) * zoom + canvas.height / 2;
        const rect = canvas.getBoundingClientRect();
        // Scale canvas pixels → CSS viewport pixels
        const rx = rect.width / canvas.width;
        const ry = rect.height / canvas.height;

        const halfH = (node.isTextNode && node.textBoxHeight)
            ? node.textBoxHeight / 2 * zoom * ry
            : node.radius * zoom * ry;
        this.element.style.left = (rect.left + sx * rx) + 'px';
        this.element.style.top = (rect.top + sy * ry - halfH - 15) + 'px';
        this.element.classList.add('visible');

        const swatch = this.element.querySelector('.ttb-color-swatch');
        if (swatch) swatch.style.background = node.textColor || '#ffffff';
    }

    hide() {
        if (this.element) this.element.classList.remove('visible');
        this._node = null;
    }

    changeSize(delta) {
        if (!this._node) return;
        this._node.fontSize = Math.max(6, Math.min(120, (this._node.fontSize || 14) + delta));
    }

    _saveState() {
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
    }

    pickColor() {
        if (!this._node || !window.CosmicToolbar) return;
        const tb = window.CosmicToolbar;
        const popup = tb._cpPopup;
        const advPanel = tb._cpAdvPanel;
        if (!popup || !advPanel) return;

        const node = this._node;
        const rect = this.element.getBoundingClientRect();

        // Move popup to body so it escapes toolbar's opacity:0 when auto-hidden
        tb._cpFloatRestore = popup.parentNode;
        document.body.appendChild(popup);
        document.body.appendChild(advPanel);

        tb.openColorPickerAt(rect.left + rect.width / 2, rect.top - 10, (color) => {
            node.textColor = color;
            if (window.CosmicHistory) window.CosmicHistory.save();
            if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
        });
    }

    deleteText() {
        if (!this._node) return;
        this._node.text = '';
        this.hide();
        if (window.CosmicHistory) window.CosmicHistory.save();
        if (typeof CosmicPersistence !== 'undefined') CosmicPersistence.debouncedSave();
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
    window.TextToolbar = new TextToolbar();

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

// ── Export PNG haute résolution (bouton top toolbar) ──
(function() {
    var EXPORT_SCALE = 3; // 3x resolution for crisp export

    function buildFilename() {
        var name = 'galaxy-view';
        if (typeof CosmicPersistence !== 'undefined' && CosmicPersistence.currentProjectName) {
            name = 'galaxy-view-' + CosmicPersistence.currentProjectName
                .replace(/[^a-zA-Z0-9àâéèêëïîôùûüÿçæœ _-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 60);
        }
        return name + '.png';
    }

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportHiResPNG() {
        var srcCanvas = CosmicState && CosmicState.canvas;
        var renderer = window.GalaxyCosmic && window.GalaxyCosmic._renderer;
        if (!srcCanvas || !renderer) {
            console.warn('❌ PNG: no canvas or renderer');
            return;
        }

        var origW = srcCanvas.width;
        var origH = srcCanvas.height;
        var camera = CosmicState.camera;
        var origZoom = camera.zoom;
        var origCtx = CosmicState.ctx;
        var scale = EXPORT_SCALE;

        try {
            // 1. Create hi-res offscreen canvas
            var offscreen = document.createElement('canvas');
            offscreen.width = origW * scale;
            offscreen.height = origH * scale;
            var offCtx = offscreen.getContext('2d');

            // 2. Temporarily swap state to offscreen
            CosmicState.canvas = offscreen;
            CosmicState.ctx = offCtx;
            camera.zoom = origZoom * scale;

            // 3. Render background (re-render at hi-res)
            var bgCache = renderer._bgCache;
            var origBgW = bgCache.width;
            var origBgH = bgCache.height;
            bgCache.width = offscreen.width;
            bgCache.height = offscreen.height;
            renderer._bgCacheCtx = bgCache.getContext('2d');
            renderer.background.render(renderer._bgCacheCtx, camera, 16);
            offCtx.drawImage(bgCache, 0, 0);

            // 4. Render content layers at hi-res
            var now = Date.now();
            renderer.renderGrid(offCtx, camera);
            renderer.renderConnections(offCtx, camera, now);
            renderer.renderStrokes(offCtx, camera);
            renderer.renderNodes(offCtx, camera, now);
            // Skip resize handles, marquee, UI overlays for clean export

            // 5. Restore original state BEFORE async toBlob
            CosmicState.canvas = srcCanvas;
            CosmicState.ctx = origCtx;
            camera.zoom = origZoom;
            bgCache.width = origBgW;
            bgCache.height = origBgH;
            renderer._bgCacheCtx = bgCache.getContext('2d');
            renderer._bgFrame = 0; // force bg cache refresh next frame

            // 6. Export offscreen canvas to PNG
            var filename = buildFilename();
            offscreen.toBlob(function(blob) {
                if (!blob) { console.error('❌ PNG: toBlob null'); return; }
                downloadBlob(blob, filename);
                console.log('📸 PNG HD exporté:', filename,
                    '(' + offscreen.width + '×' + offscreen.height + ', ' + scale + 'x)');
            }, 'image/png');

        } catch (e) {
            // Restore on error
            CosmicState.canvas = srcCanvas;
            CosmicState.ctx = origCtx;
            camera.zoom = origZoom;
            console.error('❌ PNG export error:', e);
        }
    }

    function wireExportPNG() {
        var btn = document.getElementById('galaxy-export-png-btn');
        if (!btn) return;
        btn.addEventListener('click', exportHiResPNG);
        console.log('📸 Export PNG HD (' + EXPORT_SCALE + 'x) button wired');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireExportPNG);
    } else {
        wireExportPNG();
    }
})();

// ── Branchement Cosmic Projects ──
setTimeout(function() {
    try {
        if (typeof CosmicProjectsUI !== 'undefined' && document.getElementById('galaxy-save-btn')) {
            CosmicProjectsUI.init();
            console.log('🔌 Cosmic Projects UI initialized from cosmic-ui.js');
        }
        if (typeof CosmicPersistence !== 'undefined' && !CosmicPersistence.currentProjectId) {
            CosmicPersistence.init().then(function(r) {
                console.log('🚀 Cosmic Projects:', r.action, r.name || '');
            });
        }
    } catch(e) {
        console.error('❌ Cosmic Projects init error:', e);
    }
}, 2000);

// ═══════════════════════════════════════════════════════════════════
// GALAXY HELP BUBBLE — "Besoin d'aide ?" speech bubble from golden ball
// ═══════════════════════════════════════════════════════════════════
(function() {
    var _shown = false;       // flag: already shown this Galaxy session
    var _timer = null;
    var _bubble = null;

    function _createBubble() {
        if (_bubble) return _bubble;
        var el = document.createElement('div');
        el.id = 'galaxy-help-bubble';
        el.textContent = 'Besoin d\u2019aide ?';
        el.style.cssText =
            'position:fixed;bottom:92px;right:18px;z-index:101;' +
            'background:#faf8f0;color:#333;font-size:13px;font-weight:500;' +
            'padding:8px 14px;border-radius:12px;' +
            'box-shadow:0 2px 12px rgba(0,0,0,0.18);' +
            'opacity:0;transition:opacity 0.5s ease;pointer-events:none;' +
            'white-space:nowrap;';
        document.body.appendChild(el);

        // Speech bubble arrow pointing down-right toward the golden ball
        var arrow = document.createElement('div');
        arrow.style.cssText =
            'position:absolute;bottom:-7px;right:22px;' +
            'width:0;height:0;' +
            'border-left:7px solid transparent;border-right:7px solid transparent;' +
            'border-top:7px solid #faf8f0;';
        el.appendChild(arrow);

        _bubble = el;
        return el;
    }

    function _showBubble() {
        if (_shown) return;
        _shown = true;
        var b = _createBubble();
        // Fade in
        requestAnimationFrame(function() {
            b.style.opacity = '1';
        });
        // Fade out after 4s
        setTimeout(function() {
            b.style.opacity = '0';
            // Remove from DOM after transition
            setTimeout(function() {
                if (b.parentNode) b.parentNode.removeChild(b);
                _bubble = null;
            }, 600);
        }, 4000);
    }

    function _scheduleShow() {
        _cancelShow();
        _shown = false;
        _timer = setTimeout(_showBubble, 5000);
    }

    function _cancelShow() {
        if (_timer) { clearTimeout(_timer); _timer = null; }
        // Remove bubble if visible
        if (_bubble && _bubble.parentNode) {
            _bubble.parentNode.removeChild(_bubble);
            _bubble = null;
        }
    }

    // Detect Galaxy View enter/leave via body class observer
    var _wasActive = false;
    var obs = new MutationObserver(function() {
        var isActive = document.body.classList.contains('galaxy-active');
        if (isActive && !_wasActive) {
            // Entered Galaxy View
            _scheduleShow();
        } else if (!isActive && _wasActive) {
            // Left Galaxy View — reset so it shows again on re-entry
            _cancelShow();
            _shown = false;
        }
        _wasActive = isActive;
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Reset on new project load
    if (typeof CosmicPersistence !== 'undefined') {
        CosmicPersistence.onStatusChange(function(status) {
            if (status === 'loaded' && document.body.classList.contains('galaxy-active')) {
                _cancelShow();
                _scheduleShow();
            }
        });
    }
})();

// ═══════════════════════════════════════════════════════════════════
// TOGGLE CONNEXIONS (bouton Orbites)
// ═══════════════════════════════════════════════════════════════════
(function() {
    function _updateIcon(visible) {
        var btn = document.getElementById('galaxy-toggle-orbits');
        if (!btn) return;
        btn.style.opacity = visible ? '1' : '0.4';
        btn.title = visible ? 'Connexions visibles' : 'Connexions masquées';
    }

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('#galaxy-toggle-orbits');
        if (!btn) return;
        CosmicState.showConnections = !CosmicState.showConnections;
        _updateIcon(CosmicState.showConnections);

        // Sync 3D scene if active
        var canvas3D = document.getElementById('galaxy-3d-canvas');
        if (canvas3D && canvas3D.style.display !== 'none' && typeof Galaxy3D !== 'undefined' && Galaxy3D.isInitialized) {
            Galaxy3D.toggleOrbits();
        }
    });

    // Reset on project load: connections always visible
    if (typeof CosmicPersistence !== 'undefined') {
        CosmicPersistence.onStatusChange(function(status) {
            if (status === 'loaded') {
                CosmicState.showConnections = true;
                _updateIcon(true);
            }
        });
    }
})();

// ═══════════════════════════════════════════════════════════════════
// TOGGLE 2D ↔ 3D
// ═══════════════════════════════════════════════════════════════════
(function() {
    'use strict';

    var is3D = false;
    var backBtn = null;
    var fitBtn = null;

    // --- Adapter: CosmicState → Galaxy3D data ---
    function cosmicToGalaxy3D() {
        var nodes3D = [];
        var conns3D = [];
        var SCALE = 30; // pixels → 3D units

        CosmicState.nodes.forEach(function(n) {
            if (n.isTextNode && (!n.text || n.text.trim() === '')) return; // skip empty text nodes

            // Real 2D dimensions in pixels — shape-aware
            var pxW, pxH, pxRadius;
            var r = n.radius || 40;
            if (n.isTextNode && n.textBoxWidth) {
                // Text box with explicit dimensions
                pxW = n.textBoxWidth;
                pxH = n.textBoxHeight;
                pxRadius = Math.max(pxW, pxH) / 2;
            } else if (n.shape === 'rect') {
                // Use explicit width/height if available, else fallback
                pxW = n.width || r * 1.6;
                pxH = n.height || r * 1.2;
                pxRadius = Math.max(pxW, pxH) / 2;
            } else if (n.shape === 'diamond') {
                // Diamond: inscribed in circle of radius r
                pxW = r * 2;
                pxH = r * 2;
                pxRadius = r;
            } else {
                // circle, hexagon, star: diameter = r*2
                pxW = r * 2;
                pxH = r * 2;
                pxRadius = r;
            }

            // Parse color: rgba(r,g,b,a) → extract hex + alpha
            var nodeColor = n.color || '#60a5fa';
            var colorHex = nodeColor;
            var colorAlpha = 1;
            var rgbaMatch = nodeColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
            if (rgbaMatch) {
                var rr = parseInt(rgbaMatch[1]), gg = parseInt(rgbaMatch[2]), bb = parseInt(rgbaMatch[3]);
                colorHex = '#' + ((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1);
                colorAlpha = rgbaMatch[4] != null ? parseFloat(rgbaMatch[4]) : 1;
            }
            // Final opacity: combine node.opacity with color alpha
            var finalOpacity = (n.opacity != null ? n.opacity : 1) * colorAlpha;

            nodes3D.push({
                id: n.id,
                type: 'shape',
                sourceId: n.id,
                label: n.text || '',
                hexColor: colorHex,
                size: pxRadius / SCALE,
                position: {
                    x: (n.x || 0) / SCALE,
                    y: -(n.y || 0) / SCALE,
                    z: (Math.random() - 0.5) * 30
                },
                tags: [],
                isTaskNode: !!n.isTaskNode,
                taskId: n.taskId || null,
                taskUserAvatar: n.taskUserAvatar || '',
                taskPriorityRaw: n.taskPriorityRaw || null,
                taskStatus: n.taskStatus || null,
                taskMetadata: n.metadata || null,
                metadata: {
                    shape: n.shape || 'circle',
                    isTextNode: !!n.isTextNode,
                    pxW: pxW,
                    pxH: pxH,
                    fontSize: n.fontSize || 16,
                    textColor: n.textColor || null,
                    opacity: finalOpacity
                }
            });
        });

        CosmicState.connections.forEach(function(c) {
            conns3D.push({
                id: c.id,
                from: c.fromId,
                to: c.toId,
                strength: 0.7,
                color: '#ffffff'
            });
        });

        return { nodes: nodes3D, connections: conns3D };
    }

    // --- Create bottom bar with "Retour 2D" + "Fit View" buttons ---
    var bottomBar = null;

    function createBottomBar() {
        if (bottomBar) return bottomBar;

        var btnStyle = 'width:42px;height:42px;padding:0;border:1px solid rgba(255,255,255,0.25);border-radius:12px;' +
            'background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;' +
            'backdrop-filter:blur(8px);transition:all 0.2s;display:flex;align-items:center;justify-content:center;';
        var hoverIn = 'this.style.background="rgba(255,255,255,0.22)"';
        var hoverOut = 'this.style.background="rgba(255,255,255,0.1)"';

        // Back button — curved arrow SVG
        backBtn = document.createElement('button');
        backBtn.id = 'galaxy-back-2d';
        backBtn.title = 'Retour 2D';
        backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H14"/></svg>';
        backBtn.style.cssText = btnStyle;
        backBtn.setAttribute('onmouseenter', hoverIn);
        backBtn.setAttribute('onmouseleave', hoverOut);
        backBtn.addEventListener('click', function() { toggle3D(); });

        // Fit view button — eye SVG
        fitBtn = document.createElement('button');
        fitBtn.id = 'galaxy-fit-view';
        fitBtn.title = 'Vue panoramique';
        fitBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3.5" fill="rgba(255,255,255,0.9)" stroke="none"/></svg>';
        fitBtn.style.cssText = btnStyle;
        fitBtn.setAttribute('onmouseenter', hoverIn);
        fitBtn.setAttribute('onmouseleave', hoverOut);
        fitBtn.addEventListener('click', function() {
            if (typeof Galaxy3D !== 'undefined' && Galaxy3D.isInitialized) {
                Galaxy3D.fitToView();
            }
        });

        // Voyage button — atom icon
        var voyageBtn = document.createElement('button');
        voyageBtn.id = 'galaxy-voyage-btn';
        voyageBtn.title = 'Mode Voyage';
        voyageBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" stroke-linecap="round">' +
            '<circle cx="12" cy="12" r="2.5" fill="rgba(255,255,255,0.9)" stroke="none"/>' +
            '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)"/>' +
            '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>' +
            '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>' +
            '</svg>';
        voyageBtn.style.cssText = btnStyle;
        voyageBtn.setAttribute('onmouseenter', hoverIn);
        voyageBtn.setAttribute('onmouseleave', hoverOut);
        voyageBtn.addEventListener('click', function() {
            if (typeof Galaxy3D === 'undefined' || !Galaxy3D.isInitialized) return;
            if (Galaxy3D.isVoyageActive()) {
                Galaxy3D.stopVoyage();
                voyageBtn.style.borderColor = 'rgba(255,255,255,0.25)';
                voyageBtn.style.boxShadow = 'none';
            } else {
                var started = Galaxy3D.startVoyage();
                if (started) {
                    voyageBtn.style.borderColor = 'rgba(120,180,255,0.7)';
                    voyageBtn.style.boxShadow = '0 0 12px rgba(100,160,255,0.4)';
                    // Poll to detect when voyage ends
                    var pollId = setInterval(function() {
                        if (!Galaxy3D.isVoyageActive()) {
                            voyageBtn.style.borderColor = 'rgba(255,255,255,0.25)';
                            voyageBtn.style.boxShadow = 'none';
                            clearInterval(pollId);
                        }
                    }, 500);
                }
            }
        });

        // Fullscreen button
        var fsBtn = document.createElement('button');
        fsBtn.id = 'galaxy-3d-fullscreen-btn';
        fsBtn.title = 'Plein écran';
        var fsSvgExpand = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>' +
            '<path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
        var fsSvgCompress = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M4 14h3a2 2 0 0 1 2 2v3"/><path d="M20 10h-3a2 2 0 0 1-2-2V5"/>' +
            '<path d="M14 20v-3a2 2 0 0 1 2-2h3"/><path d="M10 4v3a2 2 0 0 1-2 2H5"/></svg>';
        fsBtn.innerHTML = fsSvgExpand;
        fsBtn.style.cssText = btnStyle;
        fsBtn.setAttribute('onmouseenter', hoverIn);
        fsBtn.setAttribute('onmouseleave', hoverOut);
        fsBtn.addEventListener('click', function() {
            var container = document.getElementById('view-galaxy');
            if (!container) return;
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(function(err) {
                    console.warn('[3D] Fullscreen denied:', err.message);
                });
            } else {
                document.exitFullscreen();
            }
        });
        // Update icon on fullscreen change
        document.addEventListener('fullscreenchange', function() {
            var isFS = !!document.fullscreenElement;
            fsBtn.innerHTML = isFS ? fsSvgCompress : fsSvgExpand;
            // Floating project name overlay
            CosmicToolbar._updateFullscreenLabel(isFS);
            // Resize 3D renderer after transition
            setTimeout(function() {
                if (typeof Galaxy3D !== 'undefined' && Galaxy3D.onResize) {
                    Galaxy3D.onResize();
                }
                window.dispatchEvent(new Event('resize'));
                if (isFS) {
                    var fsEl = document.fullscreenElement;
                    if (fsEl) { fsEl.tabIndex = -1; fsEl.focus(); }
                }
            }, 100);
        });

        // Container bar
        bottomBar = document.createElement('div');
        bottomBar.id = 'galaxy-3d-bottombar';
        bottomBar.style.cssText = 'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;' +
            'display:flex;gap:8px;';
        bottomBar.appendChild(backBtn);
        bottomBar.appendChild(fitBtn);
        bottomBar.appendChild(voyageBtn);
        bottomBar.appendChild(fsBtn);
        return bottomBar;
    }

    // --- Toggle ---
    function toggle3D() {
        var canvas2D = document.getElementById('galaxy-canvas');
        var canvas3D = document.getElementById('galaxy-3d-canvas');
        var container = document.getElementById('galaxy-3d-container');
        var toolbar = document.querySelector('.cosmic-toolbar');
        var toggleBtn = document.getElementById('galaxy-toggle-3d');

        if (!canvas2D || !canvas3D || !container) {
            console.error('[3D Toggle] Missing DOM elements: canvas2D=', !!canvas2D, 'canvas3D=', !!canvas3D, 'container=', !!container);
            return;
        }

        if (!is3D) {
            // === ENTER 3D ===
            console.log('[3D Toggle] Entering 3D mode...');

            // Hide 2D canvas and toolbar
            canvas2D.style.display = 'none';
            if (toolbar) toolbar.style.display = 'none';
            var viewGalaxy = document.getElementById('view-galaxy');
            if (viewGalaxy) viewGalaxy.classList.add('mode-3d');

            // Show and size the 3D canvas BEFORE init
            canvas3D.style.display = 'block';
            canvas3D.style.width = '100%';
            canvas3D.style.height = '100%';

            // Force reflow to get accurate container dimensions
            void container.offsetHeight;
            var w = container.clientWidth;
            var h = container.clientHeight;
            console.log('[3D Toggle] Container size:', w, 'x', h);

            if (w < 10 || h < 10) {
                console.warn('[3D Toggle] Container too small! Trying parent...');
                var parent = container.parentElement;
                if (parent) {
                    w = parent.clientWidth || window.innerWidth;
                    h = parent.clientHeight || (window.innerHeight - 60);
                    console.log('[3D Toggle] Using parent size:', w, 'x', h);
                }
            }

            // Init Galaxy3D
            if (typeof Galaxy3D !== 'undefined') {
                if (!Galaxy3D.isInitialized) {
                    console.log('[3D Toggle] Initializing Galaxy3D...');
                    Galaxy3D.init(container);
                } else {
                    Galaxy3D.onResize();
                }

                // Convert and load data
                var data = cosmicToGalaxy3D();
                console.log('[3D Toggle] Converted', data.nodes.length, 'nodes,', data.connections.length, 'connections');
                Galaxy3D.loadData(data.nodes, data.connections);

                // Sync connection visibility from 2D state
                if (!CosmicState.showConnections) {
                    Galaxy3D.toggleOrbits(); // showOrbits starts true, flip to match 2D
                }
            } else {
                console.error('[3D Toggle] Galaxy3D not loaded!');
            }

            // Add bottom bar (Retour 2D + Vue globale)
            container.appendChild(createBottomBar());

            // Update toggle button
            if (toggleBtn) {
                toggleBtn.innerHTML = '&#9998; 2D';
                toggleBtn.title = 'Retour vue 2D';
            }

            is3D = true;
        } else {
            // === EXIT 3D → back to 2D ===
            console.log('[3D Toggle] Returning to 2D...');

            if (typeof Galaxy3D !== 'undefined' && Galaxy3D.isInitialized) {
                Galaxy3D.dispose();
            }

            canvas3D.style.display = 'none';
            canvas2D.style.display = 'block';
            var inTaskMode = window.CosmicProjectsUI && window.CosmicProjectsUI.isTaskProjectMode;
            if (toolbar) toolbar.style.display = inTaskMode ? 'none' : '';
            var viewGalaxy = document.getElementById('view-galaxy');
            if (viewGalaxy) viewGalaxy.classList.remove('mode-3d');

            // Remove bottom bar
            if (bottomBar && bottomBar.parentNode) bottomBar.parentNode.removeChild(bottomBar);

            // Restore toggle button
            if (toggleBtn) {
                toggleBtn.innerHTML = '&#127760; 3D';
                toggleBtn.title = 'Vue 3D';
            }

            // Force Cosmic 2D canvas to recalculate size and redraw
            requestAnimationFrame(function() {
                if (CosmicState.canvas) {
                    var parent = CosmicState.canvas.parentElement;
                    if (parent) {
                        CosmicState.canvas.width = parent.clientWidth;
                        CosmicState.canvas.height = parent.clientHeight;
                        console.log('[3D Toggle] Restored 2D canvas:', parent.clientWidth, 'x', parent.clientHeight);
                    }
                }
            });

            is3D = false;
        }
    }

    // --- Wire up button ---
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('#galaxy-toggle-3d');
        if (!btn) return;
        toggle3D();
    });

    // --- Reset to 2D when leaving Galaxy View ---
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.attributeName === 'class') {
                if (!document.body.classList.contains('galaxy-active') && is3D) {
                    toggle3D(); // force back to 2D
                }
            }
        });
    });
    observer.observe(document.body, { attributes: true });
})();
