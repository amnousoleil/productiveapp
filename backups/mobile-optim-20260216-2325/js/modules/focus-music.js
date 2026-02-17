/**
 * ================================================
 * FOCUS MUSIC + SCRATCH PAD - ProductiveApp
 * Sons ambiants Lo-Fi (Web Audio API) + Capture rapide
 * ================================================
 */

/* ================================================
   FOCUS MUSIC (Web Audio API - no external files)
   ================================================ */
var FocusMusic = (function() {
    'use strict';

    var audioCtx = null;
    var currentSound = null;
    var isPlaying = false;
    var volume = 0.3;
    var pillEl = null;
    var panelEl = null;
    var panelOpen = false;
    var nodes = [];
    var initialized = false;

    var SOUNDS = [
        { id: 'rain', name: 'Pluie douce', icon: '\uD83C\uDF27\uFE0F', desc: 'Bruit de pluie relaxant', gen: genRain },
        { id: 'ocean', name: 'Oc\u00e9an', icon: '\uD83C\uDF0A', desc: 'Vagues sur la plage', gen: genOcean },
        { id: 'forest', name: 'For\u00eat', icon: '\uD83C\uDF32', desc: 'Ambiance naturelle', gen: genForest },
        { id: 'wind', name: 'Vent', icon: '\uD83D\uDCA8', desc: 'Brise l\u00e9g\u00e8re', gen: genWind },
        { id: 'fire', name: 'Feu de chemin\u00e9e', icon: '\uD83D\uDD25', desc: 'Cr\u00e9pitements apaisants', gen: genFire },
        { id: 'whitenoise', name: 'Bruit blanc', icon: '\u26AA', desc: 'Concentration pure', gen: genWhiteNoise },
        { id: 'binaural', name: 'Binaural Focus', icon: '\uD83E\uDDE0', desc: 'Ondes alpha 10Hz', gen: genBinaural },
        { id: 'lofi', name: 'Lo-Fi Beats', icon: '\uD83C\uDFB5', desc: 'Rythme doux', gen: genLoFi }
    ];

    function init() {
        if (initialized) return;
        initialized = true;
        createPill();
        createPanel();
        var saved = localStorage.getItem('productiveapp_focus_music_volume');
        if (saved) volume = parseFloat(saved) || 0.3;
    }

    function createPill() {
        pillEl = document.createElement('div');
        pillEl.className = 'focus-music-pill';
        pillEl.innerHTML = '<svg class="focus-music-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
            '<div class="focus-music-bars"><div class="focus-music-bar"></div><div class="focus-music-bar"></div><div class="focus-music-bar"></div><div class="focus-music-bar"></div></div>' +
            '<span class="focus-music-label">Focus</span>';
        pillEl.addEventListener('click', function(e) { e.stopPropagation(); togglePanel(); });
        document.body.appendChild(pillEl);
    }

    function createPanel() {
        panelEl = document.createElement('div');
        panelEl.className = 'focus-music-panel';
        var html = '<div class="focus-music-panel-header">\uD83C\uDFB6 Sons de concentration</div>';
        html += '<div class="focus-music-sounds">';
        SOUNDS.forEach(function(s) {
            html += '<div class="focus-music-sound" data-sound="' + s.id + '">';
            html += '<span class="focus-music-sound-icon">' + s.icon + '</span>';
            html += '<div class="focus-music-sound-info"><div class="focus-music-sound-name">' + s.name + '</div><div class="focus-music-sound-desc">' + s.desc + '</div></div>';
            html += '</div>';
        });
        html += '</div>';
        html += '<div class="focus-music-volume"><span class="focus-music-volume-label">\uD83D\uDD0A</span><input type="range" min="0" max="100" value="' + Math.round(volume * 100) + '"></div>';
        panelEl.innerHTML = html;
        document.body.appendChild(panelEl);

        panelEl.querySelectorAll('.focus-music-sound').forEach(function(el) {
            el.addEventListener('click', function() {
                var id = el.getAttribute('data-sound');
                if (currentSound === id && isPlaying) { stop(); }
                else { play(id); }
                updatePanel();
            });
        });
        panelEl.querySelector('input[type="range"]').addEventListener('input', function(e) {
            volume = parseInt(e.target.value) / 100;
            setVolume(volume);
            localStorage.setItem('productiveapp_focus_music_volume', volume);
        });
        document.addEventListener('click', function(e) {
            if (panelOpen && !panelEl.contains(e.target) && !pillEl.contains(e.target)) { panelOpen = false; panelEl.classList.remove('open'); }
        });
    }

    function togglePanel() { panelOpen = !panelOpen; panelEl.classList.toggle('open', panelOpen); }
    function updatePanel() {
        panelEl.querySelectorAll('.focus-music-sound').forEach(function(el) {
            el.classList.toggle('active', el.getAttribute('data-sound') === currentSound && isPlaying);
        });
        pillEl.classList.toggle('playing', isPlaying);
        pillEl.querySelector('.focus-music-label').textContent = isPlaying ? SOUNDS.find(function(s) { return s.id === currentSound; })?.name || 'Focus' : 'Focus';
    }

    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function play(id) {
        stop();
        var sound = SOUNDS.find(function(s) { return s.id === id; });
        if (!sound) return;
        currentSound = id;
        isPlaying = true;
        var ctx = getCtx();
        sound.gen(ctx);
        updatePanel();
    }

    function stop() {
        nodes.forEach(function(n) { try { n.disconnect(); if (n.stop) n.stop(); } catch (e) {} });
        nodes = [];
        isPlaying = false;
        updatePanel();
    }

    function setVolume(v) {
        nodes.forEach(function(n) { if (n.gain) n.gain.value = v; });
    }

    function addGain(ctx) {
        var g = ctx.createGain(); g.gain.value = volume; g.connect(ctx.destination); nodes.push(g); return g;
    }

    // Sound generators (procedural audio)
    function genRain(ctx) {
        var buf = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
        buf.buffer = buffer; buf.loop = true;
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
        var g = addGain(ctx);
        buf.connect(lp); lp.connect(g);
        buf.start(); nodes.push(buf, lp);
    }

    function genOcean(ctx) {
        var buf = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) {
            var t = i / ctx.sampleRate;
            var wave = Math.sin(t * 0.3) * 0.5 + 0.5;
            data[i] = (Math.random() * 2 - 1) * wave * 0.25;
        }
        buf.buffer = buffer; buf.loop = true;
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
        var g = addGain(ctx); buf.connect(lp); lp.connect(g); buf.start(); nodes.push(buf, lp);
    }

    function genForest(ctx) {
        genRain(ctx); // light rain base
        // Add bird-like chirps via oscillator
        var osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 2000;
        var mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = 5;
        var modGain = ctx.createGain(); modGain.gain.value = 300;
        mod.connect(modGain); modGain.connect(osc.frequency);
        var g = ctx.createGain(); g.gain.value = volume * 0.05; g.connect(ctx.destination);
        osc.connect(g); osc.start(); mod.start(); nodes.push(osc, mod, modGain, g);
    }

    function genWind(ctx) {
        var buf = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
        buf.buffer = buffer; buf.loop = true;
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.5;
        var g = addGain(ctx); buf.connect(bp); bp.connect(g); buf.start(); nodes.push(buf, bp);
    }

    function genFire(ctx) {
        var buf = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.random() * 0.3;
        buf.buffer = buffer; buf.loop = true;
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 1;
        var g = addGain(ctx); buf.connect(bp); bp.connect(g); buf.start(); nodes.push(buf, bp);
    }

    function genWhiteNoise(ctx) {
        var buf = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
        buf.buffer = buffer; buf.loop = true;
        var g = addGain(ctx); buf.connect(g); buf.start(); nodes.push(buf);
    }

    function genBinaural(ctx) {
        var osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 200;
        var osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 210; // 10Hz diff = alpha
        var merger = ctx.createChannelMerger(2);
        var g1 = ctx.createGain(); g1.gain.value = volume * 0.3;
        var g2 = ctx.createGain(); g2.gain.value = volume * 0.3;
        osc1.connect(g1); g1.connect(merger, 0, 0);
        osc2.connect(g2); g2.connect(merger, 0, 1);
        merger.connect(ctx.destination);
        osc1.start(); osc2.start(); nodes.push(osc1, osc2, g1, g2, merger);
    }

    function genLoFi(ctx) {
        // Simple beat pattern
        var bpm = 72, interval = 60 / bpm;
        var kick = function(t) {
            var o = ctx.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
            var g = ctx.createGain(); g.gain.setValueAtTime(volume * 0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.3); nodes.push(o, g);
        };
        // Schedule 32 beats then loop
        var now = ctx.currentTime;
        for (var i = 0; i < 32; i++) kick(now + i * interval);
        // Add noise hi-hat
        genRain(ctx);
    }

    return { init: init, play: play, stop: stop, isPlaying: function() { return isPlaying; } };
})();
if (typeof window !== 'undefined') window.FocusMusic = FocusMusic;


/* ================================================
   SCRATCH PAD (Quick Capture)
   ================================================ */
var ScratchPad = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_scratch_pad';
    var btnEl = null;
    var panelEl = null;
    var textareaEl = null;
    var isOpen = false;
    var initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;
        createDOM();
        bindEvents();
    }

    function createDOM() {
        btnEl = document.createElement('button');
        btnEl.className = 'scratch-pad-btn';
        btnEl.title = 'Capture rapide';
        btnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
        document.body.appendChild(btnEl);

        panelEl = document.createElement('div');
        panelEl.className = 'scratch-pad-panel';

        var saved = '';
        try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch (e) {}

        panelEl.innerHTML =
            '<div class="scratch-pad-header">' +
                '<span class="scratch-pad-title">\u270D\uFE0F Capture rapide</span>' +
                '<div class="scratch-pad-actions">' +
                    '<button class="scratch-pad-action-btn" id="sp-clear" title="Effacer">\uD83D\uDDD1\uFE0F</button>' +
                    '<button class="scratch-pad-action-btn" id="sp-close" title="Fermer">\u2715</button>' +
                '</div>' +
            '</div>' +
            '<textarea class="scratch-pad-textarea" placeholder="Capturez une id\u00e9e, un lien, une note rapide...">' + escapeHtml(saved) + '</textarea>' +
            '<div class="scratch-pad-footer">' +
                '<span class="scratch-pad-footer-text">Auto-sauvegard\u00e9</span>' +
                '<button class="scratch-pad-save-btn" id="sp-to-note">Convertir en note</button>' +
            '</div>';
        document.body.appendChild(panelEl);
        textareaEl = panelEl.querySelector('.scratch-pad-textarea');
    }

    function bindEvents() {
        btnEl.addEventListener('click', function(e) { e.stopPropagation(); toggle(); });
        panelEl.querySelector('#sp-close').addEventListener('click', close);
        panelEl.querySelector('#sp-clear').addEventListener('click', function() { textareaEl.value = ''; save(); });
        panelEl.querySelector('#sp-to-note').addEventListener('click', function() {
            var text = textareaEl.value.trim();
            if (!text) return;
            // Navigate to notes and create
            if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('notes');
            setTimeout(function() { document.dispatchEvent(new CustomEvent('createNote', { detail: { content: text } })); }, 300);
            textareaEl.value = ''; save(); close();
        });
        textareaEl.addEventListener('input', function() { save(); });
        document.addEventListener('click', function(e) {
            if (isOpen && !panelEl.contains(e.target) && !btnEl.contains(e.target)) close();
        });
    }

    function toggle() { isOpen ? close() : open(); }
    function open() { isOpen = true; panelEl.classList.add('open'); textareaEl.focus(); }
    function close() { isOpen = false; panelEl.classList.remove('open'); }
    function save() { try { localStorage.setItem(STORAGE_KEY, textareaEl.value); } catch (e) {} }
    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return { init: init, open: open, close: close, toggle: toggle };
})();
if (typeof window !== 'undefined') window.ScratchPad = ScratchPad;
