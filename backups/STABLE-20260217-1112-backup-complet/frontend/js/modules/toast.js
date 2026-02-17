/**
 * TOAST NOTIFICATION SYSTEM - ProductiveApp v5.0
 * Professional toast notifications with auto-dismiss and actions
 *
 * Usage:
 *   Toast.success('Tâche créée avec succès');
 *   Toast.error('Erreur de sauvegarde');
 *   Toast.warning('Connexion instable');
 *   Toast.info('Mise à jour disponible');
 *   Toast.show({ type, message, duration, action: { label, callback } });
 */
(function() {
    'use strict';
    if (window.Toast) return;

    var ICONS = {
        success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    var COLORS = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    var DURATIONS = { success: 4000, error: 6000, warning: 5000, info: 4500 };
    var MAX_TOASTS = 5;
    var activeToasts = [];
    var container = null;
    var stylesInjected = false;

    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;
        var style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = [
            '.toast-container{position:fixed;top:16px;right:16px;z-index:100000;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-height:calc(100vh - 32px)}',
            '.toast{position:relative;display:flex;align-items:flex-start;gap:12px;min-width:300px;max-width:420px;padding:14px 16px;border-radius:12px;border-left:4px solid transparent;background:var(--surface,#1e1e2e);color:var(--text,#fff);box-shadow:0 8px 32px rgba(0,0,0,.3),0 2px 8px rgba(0,0,0,.15);pointer-events:auto;overflow:hidden;transform:translateX(calc(100% + 40px));opacity:0;transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .3s;font-size:14px;line-height:1.5;backdrop-filter:blur(12px)}',
            '.toast.visible{transform:translateX(0);opacity:1}',
            '.toast.dismissing{transform:translateX(calc(100% + 40px));opacity:0;transition:transform .3s,opacity .2s}',
            '.toast-success{border-left-color:#22c55e}',
            '.toast-error{border-left-color:#ef4444}',
            '.toast-warning{border-left-color:#f59e0b}',
            '.toast-info{border-left-color:#3b82f6}',
            '.toast-icon{flex-shrink:0;margin-top:1px}',
            '.toast-body{flex:1;min-width:0}',
            '.toast-message{margin:0;word-wrap:break-word}',
            '.toast-action-btn{display:inline-block;margin-top:6px;padding:0;background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}',
            '.toast-success .toast-action-btn{color:#22c55e}',
            '.toast-error .toast-action-btn{color:#ef4444}',
            '.toast-warning .toast-action-btn{color:#f59e0b}',
            '.toast-info .toast-action-btn{color:#3b82f6}',
            '.toast-action-btn:hover{opacity:.8}',
            '.toast-close{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin:-2px -4px 0 4px;background:none;border:none;border-radius:6px;color:var(--text-secondary,#888);cursor:pointer;opacity:.5;transition:opacity .15s}',
            '.toast-close:hover{opacity:1}',
            '.toast-progress{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 0 12px}',
            '.toast-success .toast-progress{background:#22c55e}',
            '.toast-error .toast-progress{background:#ef4444}',
            '.toast-warning .toast-progress{background:#f59e0b}',
            '.toast-info .toast-progress{background:#3b82f6}',
            '@media(max-width:768px){.toast-container{top:8px;right:8px;left:8px}.toast{min-width:0;max-width:none;width:100%}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function getContainer() {
        if (container && container.isConnected) return container;
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('role', 'log');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
        return container;
    }

    function removeToast(obj) {
        var idx = activeToasts.indexOf(obj);
        if (idx === -1) return;
        activeToasts.splice(idx, 1);
        if (obj.timer) { clearTimeout(obj.timer); obj.timer = null; }
        var el = obj.el;
        if (!el) return;
        el.classList.remove('visible');
        el.classList.add('dismissing');
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    }

    function show(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        if (!opts || !opts.message) return null;

        injectStyles();

        var type = opts.type || 'info';
        var message = opts.message;
        var duration = typeof opts.duration === 'number' ? opts.duration : (DURATIONS[type] || 4000);
        var action = opts.action || null;
        var color = COLORS[type] || COLORS.info;

        // Cap toasts
        while (activeToasts.length >= MAX_TOASTS) {
            removeToast(activeToasts[0]);
        }

        var el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.setAttribute('role', 'alert');

        // Icon
        var iconDiv = document.createElement('span');
        iconDiv.className = 'toast-icon';
        iconDiv.innerHTML = ICONS[type] || ICONS.info;

        // Body
        var bodyDiv = document.createElement('div');
        bodyDiv.className = 'toast-body';

        var msgDiv = document.createElement('div');
        msgDiv.className = 'toast-message';
        msgDiv.textContent = message;
        bodyDiv.appendChild(msgDiv);

        if (action && action.label) {
            var actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action-btn';
            actionBtn.textContent = action.label;
            actionBtn.onclick = function(e) {
                e.stopPropagation();
                if (typeof action.callback === 'function') action.callback();
                removeToast(obj);
            };
            bodyDiv.appendChild(actionBtn);
        }

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        closeBtn.onclick = function(e) { e.stopPropagation(); removeToast(obj); };

        // Progress bar
        var progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.width = '100%';

        el.appendChild(iconDiv);
        el.appendChild(bodyDiv);
        el.appendChild(closeBtn);
        el.appendChild(progress);

        var obj = { el: el, timer: null, duration: duration, remaining: duration, startTime: 0 };
        activeToasts.push(obj);

        getContainer().appendChild(el);

        // Animate in
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                el.classList.add('visible');
                startTimer(obj, progress);
            });
        });

        // Pause on hover
        el.addEventListener('mouseenter', function() { pauseTimer(obj, progress); });
        el.addEventListener('mouseleave', function() { startTimer(obj, progress); });

        return { dismiss: function() { removeToast(obj); } };
    }

    function startTimer(obj, progress) {
        if (obj.duration <= 0) return;
        if (obj.remaining <= 0) { removeToast(obj); return; }
        obj.startTime = Date.now();
        progress.style.transition = 'width ' + obj.remaining + 'ms linear';
        progress.style.width = '0%';
        obj.timer = setTimeout(function() { obj.timer = null; removeToast(obj); }, obj.remaining);
    }

    function pauseTimer(obj, progress) {
        if (obj.timer) {
            clearTimeout(obj.timer);
            obj.timer = null;
            var elapsed = Date.now() - obj.startTime;
            obj.remaining = Math.max(0, obj.remaining - elapsed);
            var pct = obj.duration > 0 ? (obj.remaining / obj.duration * 100) : 0;
            progress.style.transition = 'none';
            progress.style.width = pct + '%';
        }
    }

    window.Toast = {
        show: show,
        success: function(msg, opts) { return show(Object.assign({ type: 'success', message: msg }, opts || {})); },
        error: function(msg, opts) { return show(Object.assign({ type: 'error', message: msg }, opts || {})); },
        warning: function(msg, opts) { return show(Object.assign({ type: 'warning', message: msg }, opts || {})); },
        info: function(msg, opts) { return show(Object.assign({ type: 'info', message: msg }, opts || {})); },
        dismissAll: function() { var copy = activeToasts.slice(); copy.forEach(removeToast); },
        count: function() { return activeToasts.length; }
    };
})();
