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

    var PRESETS = {
        zen:          { label: 'Zen',       icon: '\u2728',     intensity: 15 },
        elegant:      { label: '\u00C9l\u00E9gant', icon: '\uD83C\uDF38', intensity: 45 },
        dynamic:      { label: 'Dynamic',   icon: '\u26A1',     intensity: 70 },
        spectacular:  { label: 'Spectacle', icon: '\uD83C\uDF86', intensity: 90 },
        cinematic:    { label: 'Cin\u00E9ma',  icon: '\uD83C\uDFAC', intensity: 100 }
    };
    var PRESET_ORDER = ['zen', 'elegant', 'dynamic', 'spectacular', 'cinematic'];

    // ---- State ----
    var currentIntensity = 45;
    var currentPreset = 'elegant';
    var panelOpen = false;
    var fabEl = null;
    var panelEl = null;
    var initialized = false;

    // ---- SVG Icons ----
    var SVG_SPARKLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>' +
        '<circle cx="18" cy="5" r="1.5" fill="currentColor" opacity="0.5"/>' +
        '<circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.4"/>' +
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
            var savedIntensity = localStorage.getItem(STORAGE_KEY_INTENSITY);
            var savedPreset = localStorage.getItem(STORAGE_KEY_PRESET);
            if (savedIntensity !== null) {
                currentIntensity = Math.max(0, Math.min(100, parseInt(savedIntensity, 10) || 45));
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
                setPreset('elegant');
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
        var closest = 'elegant';
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

console.log('animation-controls.js v1.0 loaded');
