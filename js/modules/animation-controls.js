/**
 * ANIMATION CONTROLS - ProductiveApp v4.0
 * Floating panel + intensity/preset system
 * Bridges UI controls to animations.js engine and CSS variables
 */
var AnimationControls = (function() {
    'use strict';

    // ---- Constants ----
    var STORAGE_KEY_INTENSITY = 'productiveapp_animation_intensity';
    var STORAGE_KEY_PRESET = 'productiveapp_animation_preset';
    var STORAGE_KEY_VERSION = 'productiveapp_animation_version';
    var CURRENT_VERSION = '2.0-cinematic'; // Force migration to cinematic default

    var PRESETS = {
        zen:          { label: 'Zen',       icon: '\u2728',     intensity: 15 },
        elegant:      { label: '\u00C9l\u00E9gant', icon: '\uD83C\uDF38', intensity: 45 },
        dynamic:      { label: 'Dynamic',   icon: '\u26A1',     intensity: 70 },
        spectacular:  { label: 'Spectacle', icon: '\uD83C\uDF86', intensity: 90 },
        cinematic:    { label: 'Cin\u00E9ma',  icon: '\uD83C\uDFAC', intensity: 100 }
    };
    var PRESET_ORDER = ['zen', 'elegant', 'dynamic', 'spectacular', 'cinematic'];

    // ---- State ----
    var currentIntensity = 100;
    var currentPreset = 'cinematic';
    var panelOpen = false;
    var fabEl = null;
    var panelEl = null;
    var initialized = false;

    // ---- SVG Icons ----
    var SVG_SPARKLE = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">' +
        '<path d="M12 1.5 L13.8 9.2 L21.5 12 L13.8 14.8 L12 22.5 L10.2 14.8 L2.5 12 L10.2 9.2 Z"/>' +
        '</svg>';

    // ---- Initialization ----
    function init() {
        if (initialized) return;
        initialized = true;

        loadState();
        createDOM();
        applyIntensityToCSS(currentIntensity);
        syncToEngine();

        console.log('AnimationControls: Initialized | preset=' + currentPreset + ' intensity=' + currentIntensity);
    }

    function loadState() {
        try {
            var savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

            // MIGRATION: Force cinematic mode if upgrading from old version
            if (savedVersion !== CURRENT_VERSION) {
                console.log('AnimationControls: Migrating to v' + CURRENT_VERSION + ' - Forcing Cinematic mode');
                currentIntensity = 100;
                currentPreset = 'cinematic';
                // Save the new defaults
                localStorage.setItem(STORAGE_KEY_INTENSITY, '100');
                localStorage.setItem(STORAGE_KEY_PRESET, 'cinematic');
                localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
                return;
            }

            // Load saved preferences (only if version matches)
            var savedIntensity = localStorage.getItem(STORAGE_KEY_INTENSITY);
            var savedPreset = localStorage.getItem(STORAGE_KEY_PRESET);
            if (savedIntensity !== null) {
                currentIntensity = Math.max(0, Math.min(100, parseInt(savedIntensity, 10) || 100));
            }
            if (savedPreset && PRESETS[savedPreset]) {
                currentPreset = savedPreset;
            }
        } catch (e) { /* localStorage unavailable */ }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY_INTENSITY, String(currentIntensity));
            localStorage.setItem(STORAGE_KEY_PRESET, currentPreset);
            localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        } catch (e) { /* ignore */ }
    }

    // ---- DOM Creation ----
    function createDOM() {
        // FAB button
        fabEl = document.createElement('button');
        fabEl.className = 'anim-ctrl-fab';
        fabEl.setAttribute('title', 'Animations');
        fabEl.setAttribute('aria-label', 'Controles d\'animation');
        fabEl.innerHTML = SVG_SPARKLE;
        // Inject full FAB styling via CSS (theme-adaptive with color-mix)
        if (!document.getElementById('anim-fab-keyframes')) {
            var styleTag = document.createElement('style');
            styleTag.id = 'anim-fab-keyframes';
            styleTag.textContent =
                /* Pulse glow animation */
                '@keyframes acFabPulse{' +
                    '0%,100%{box-shadow:' +
                        '0 0 15px color-mix(in srgb,var(--accent) 40%,transparent),' +
                        '0 0 30px color-mix(in srgb,var(--accent) 15%,transparent),' +
                        '0 4px 14px rgba(0,0,0,0.5)}' +
                    '50%{box-shadow:' +
                        '0 0 28px color-mix(in srgb,var(--accent) 65%,transparent),' +
                        '0 0 55px color-mix(in srgb,var(--accent) 25%,transparent),' +
                        '0 4px 14px rgba(0,0,0,0.5)}' +
                '}' +
                /* Shimmer ring rotation */
                '@keyframes acFabShimmer{' +
                    '0%{transform:rotate(0deg)}' +
                    '100%{transform:rotate(360deg)}' +
                '}' +
                /* Outer halo twinkle */
                '@keyframes acFabTwinkle{' +
                    '0%,100%{opacity:0.3;transform:scale(1)}' +
                    '50%{opacity:0.8;transform:scale(1.08)}' +
                '}' +
                /* SVG star twinkle */
                '@keyframes acFabStarTwinkle{' +
                    '0%,100%{filter:drop-shadow(0 0 3px color-mix(in srgb,var(--accent) 50%,transparent))}' +
                    '50%{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 80%,transparent))}' +
                '}' +
                /* --- Button base --- */
                'button.anim-ctrl-fab{' +
                    'position:fixed !important;' +
                    'bottom:95px !important;right:25px !important;' +
                    'width:56px !important;height:56px !important;' +
                    'border-radius:50% !important;' +
                    'background:color-mix(in srgb,var(--accent) 12%,#080808) !important;' +
                    'border:2px solid color-mix(in srgb,var(--accent) 45%,transparent) !important;' +
                    'color:var(--accent) !important;' +
                    'display:flex !important;align-items:center !important;justify-content:center !important;' +
                    'padding:0 !important;margin:0 !important;' +
                    'line-height:0 !important;' +
                    'z-index:9999 !important;cursor:pointer !important;' +
                    'overflow:visible !important;' +
                    'transition:transform 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease,background 0.3s ease !important;' +
                    'animation:acFabPulse 2.5s ease-in-out infinite !important;' +
                    '-webkit-tap-highlight-color:transparent;' +
                '}' +
                /* Shimmer ring (::before) */
                'button.anim-ctrl-fab::before{' +
                    'content:"" !important;' +
                    'position:absolute !important;' +
                    'top:-4px !important;left:-4px !important;right:-4px !important;bottom:-4px !important;' +
                    'border-radius:50% !important;' +
                    'background:conic-gradient(' +
                        'from 0deg,' +
                        'transparent 0deg,' +
                        'color-mix(in srgb,var(--accent) 30%,transparent) 45deg,' +
                        'transparent 90deg,' +
                        'color-mix(in srgb,var(--accent) 20%,transparent) 180deg,' +
                        'transparent 225deg,' +
                        'color-mix(in srgb,var(--accent) 25%,transparent) 300deg,' +
                        'transparent 360deg' +
                    ') !important;' +
                    'animation:acFabShimmer 8s linear infinite !important;' +
                    'z-index:-1 !important;' +
                    'pointer-events:none !important;' +
                '}' +
                /* Outer halo ring (::after) */
                'button.anim-ctrl-fab::after{' +
                    'content:"" !important;' +
                    'position:absolute !important;' +
                    'top:-8px !important;left:-8px !important;right:-8px !important;bottom:-8px !important;' +
                    'border-radius:50% !important;' +
                    'border:1px solid color-mix(in srgb,var(--accent) 20%,transparent) !important;' +
                    'background:transparent !important;' +
                    'animation:acFabTwinkle 3s ease-in-out infinite !important;' +
                    'pointer-events:none !important;' +
                '}' +
                /* SVG icon */
                'button.anim-ctrl-fab svg{' +
                    'width:24px !important;height:24px !important;' +
                    'display:block !important;flex-shrink:0 !important;' +
                    'margin:0 !important;padding:0 !important;' +
                    'animation:acFabStarTwinkle 2s ease-in-out infinite !important;' +
                    'transition:transform 0.3s ease !important;' +
                '}' +
                /* Hover - intense illumination */
                'button.anim-ctrl-fab:hover{' +
                    'transform:scale(1.15) !important;' +
                    'background:color-mix(in srgb,var(--accent) 20%,#0a0a0a) !important;' +
                    'border-color:color-mix(in srgb,var(--accent) 70%,transparent) !important;' +
                    'box-shadow:' +
                        '0 0 35px color-mix(in srgb,var(--accent) 65%,transparent),' +
                        '0 0 70px color-mix(in srgb,var(--accent) 30%,transparent),' +
                        '0 6px 20px rgba(0,0,0,0.5) !important;' +
                '}' +
                'button.anim-ctrl-fab:hover svg{' +
                    'filter:drop-shadow(0 0 10px color-mix(in srgb,var(--accent) 90%,transparent)) !important;' +
                    'transform:scale(1.15) !important;' +
                '}' +
                'button.anim-ctrl-fab:hover::before{' +
                    'animation-duration:3s !important;' +
                '}' +
                'button.anim-ctrl-fab:hover::after{' +
                    'border-color:color-mix(in srgb,var(--accent) 40%,transparent) !important;' +
                    'opacity:1 !important;' +
                '}';
            document.head.appendChild(styleTag);
        }
        fabEl.addEventListener('click', function(e) {
            e.stopPropagation();
            togglePanel();
        });

        // Panel
        panelEl = document.createElement('div');
        panelEl.className = 'anim-ctrl-panel';
        panelEl.innerHTML = buildPanelHTML();

        document.body.appendChild(fabEl);
        document.body.appendChild(panelEl);

        // Bind panel events
        bindPanelEvents();

        // Close panel on outside click
        document.addEventListener('click', function(e) {
            if (panelOpen && !panelEl.contains(e.target) && !fabEl.contains(e.target)) {
                closePanel();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && panelOpen) {
                closePanel();
            }
        });
    }

    function buildPanelHTML() {
        var presetsHTML = '<div class="anim-presets-row">';
        for (var i = 0; i < PRESET_ORDER.length; i++) {
            var key = PRESET_ORDER[i];
            var p = PRESETS[key];
            var activeClass = key === currentPreset ? ' active' : '';
            presetsHTML += '<button class="anim-preset-btn' + activeClass + '" data-preset="' + key + '">' +
                '<span class="anim-preset-icon">' + p.icon + '</span>' +
                '<span>' + p.label + '</span>' +
                '</button>';
        }
        presetsHTML += '</div>';

        return '<p class="anim-ctrl-panel-title">' + SVG_SPARKLE + ' Animations</p>' +
            presetsHTML +
            '<div class="anim-ctrl-divider"></div>' +
            '<div class="anim-slider-group">' +
                '<div class="anim-slider-label">' +
                    '<span>Intensit\u00E9</span>' +
                    '<span class="anim-slider-value" id="anim-intensity-value">' + currentIntensity + '%</span>' +
                '</div>' +
                '<input type="range" class="anim-slider" id="anim-intensity-slider" min="0" max="100" value="' + currentIntensity + '">' +
            '</div>' +
            '<div class="anim-ctrl-actions">' +
                '<button class="anim-preview-btn" id="anim-preview-btn">\u25B6 Aper\u00E7u</button>' +
                '<button class="anim-preview-btn" id="anim-reset-btn">\u21BA Reset</button>' +
            '</div>';
    }

    function bindPanelEvents() {
        // Preset buttons
        var presetBtns = panelEl.querySelectorAll('.anim-preset-btn');
        for (var i = 0; i < presetBtns.length; i++) {
            presetBtns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                var btn = e.currentTarget;
                var presetKey = btn.getAttribute('data-preset');
                setPreset(presetKey);
            });
        }

        // Intensity slider
        var slider = panelEl.querySelector('#anim-intensity-slider');
        if (slider) {
            slider.addEventListener('input', function() {
                var val = parseInt(slider.value, 10);
                setIntensity(val, true);
                // When user manually adjusts, remove preset highlight
                currentPreset = findClosestPreset(val);
                updatePresetHighlight(currentPreset);
                saveState();
            });
        }

        // Preview button
        var previewBtn = panelEl.querySelector('#anim-preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                triggerPreview();
            });
        }

        // Reset button
        var resetBtn = panelEl.querySelector('#anim-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                setPreset('cinematic');
            });
        }
    }

    // ---- Panel Toggle ----
    function togglePanel() {
        if (panelOpen) closePanel();
        else openPanel();
    }

    function openPanel() {
        panelOpen = true;
        panelEl.classList.add('visible');
        fabEl.classList.add('panel-open');
    }

    function closePanel() {
        panelOpen = false;
        panelEl.classList.remove('visible');
        fabEl.classList.remove('panel-open');
    }

    // ---- Core API ----
    function setIntensity(value, skipSave) {
        currentIntensity = Math.max(0, Math.min(100, parseInt(value, 10) || 0));

        // Update CSS variable on :root
        applyIntensityToCSS(currentIntensity);

        // Update slider display
        var valEl = document.getElementById('anim-intensity-value');
        if (valEl) valEl.textContent = currentIntensity + '%';
        var sliderEl = document.getElementById('anim-intensity-slider');
        if (sliderEl && parseInt(sliderEl.value, 10) !== currentIntensity) {
            sliderEl.value = String(currentIntensity);
        }

        // Sync settings panel slider if present
        var settingsSlider = document.getElementById('settings-anim-slider');
        if (settingsSlider) {
            settingsSlider.value = String(currentIntensity);
        }
        var settingsVal = document.getElementById('settings-anim-value');
        if (settingsVal) {
            settingsVal.textContent = currentIntensity + '%';
        }

        // Tell canvas engine
        syncToEngine();

        if (!skipSave) saveState();
    }

    function applyIntensityToCSS(value) {
        document.documentElement.style.setProperty('--anim-intensity', String(value / 100));
    }

    function syncToEngine() {
        if (typeof window.AnimEngine !== 'undefined' && window.AnimEngine.setIntensity) {
            window.AnimEngine.setIntensity(currentIntensity);
        }
    }

    function setPreset(presetKey) {
        if (!PRESETS[presetKey]) return;
        currentPreset = presetKey;
        var intensity = PRESETS[presetKey].intensity;
        setIntensity(intensity);
        updatePresetHighlight(presetKey);
        saveState();
    }

    function findClosestPreset(value) {
        var closest = 'cinematic';
        var minDiff = Infinity;
        for (var i = 0; i < PRESET_ORDER.length; i++) {
            var key = PRESET_ORDER[i];
            var diff = Math.abs(PRESETS[key].intensity - value);
            if (diff < minDiff) {
                minDiff = diff;
                closest = key;
            }
        }
        return closest;
    }

    function updatePresetHighlight(activeKey) {
        // Update floating panel presets
        if (panelEl) {
            var btns = panelEl.querySelectorAll('.anim-preset-btn');
            for (var j = 0; j < btns.length; j++) {
                btns[j].classList.toggle('active', btns[j].getAttribute('data-preset') === activeKey);
            }
        }

        // Update settings panel presets if present
        var settingsBtns = document.querySelectorAll('.settings-anim-preset');
        for (var k = 0; k < settingsBtns.length; k++) {
            var isActive = settingsBtns[k].getAttribute('data-preset') === activeKey;
            settingsBtns[k].classList.toggle('active', isActive);
            settingsBtns[k].style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
            settingsBtns[k].style.background = isActive ? 'var(--bg-card)' : 'transparent';
            settingsBtns[k].style.color = isActive ? 'var(--accent)' : 'var(--text-muted)';
        }
    }

    function triggerPreview() {
        // Flash intensity to 100 for 2s, then restore
        var original = currentIntensity;
        var originalPreset = currentPreset;
        setIntensity(100);

        // Reinit canvas for full effect
        if (typeof window.AnimEngine !== 'undefined' && window.AnimEngine.reinit) {
            window.AnimEngine.reinit();
        }

        setTimeout(function() {
            setIntensity(original);
            currentPreset = originalPreset;
            updatePresetHighlight(originalPreset);
            saveState();
        }, 2000);
    }

    // ---- Cycle function (for keyboard shortcut or external call) ----
    function cyclePreset() {
        var currentIdx = PRESET_ORDER.indexOf(currentPreset);
        var nextIdx = (currentIdx + 1) % PRESET_ORDER.length;
        setPreset(PRESET_ORDER[nextIdx]);
    }

    // ---- Public API ----
    return {
        init: init,
        setIntensity: setIntensity,
        setPreset: setPreset,
        getIntensity: function() { return currentIntensity; },
        getPreset: function() { return currentPreset; },
        cyclePreset: cyclePreset,
        openPanel: openPanel,
        closePanel: closePanel,
        PRESETS: PRESETS,
        PRESET_ORDER: PRESET_ORDER
    };
})();

if (typeof window !== 'undefined') {
    window.AnimationControls = AnimationControls;
}

console.log('animation-controls.js v2.0 loaded - Cinematic mode default');
