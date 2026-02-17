/**
 * UNDO TOAST - ProductiveApp v4.0
 * Toast avec bouton Annuler apres suppression
 */
const UndoToast = (function() {
    'use strict';

    let activeToast = null;
    let timer = null;
    let progressTimer = null;

    function show(message, undoCallback, duration) {
        duration = duration || 5000;
        // Fermer le toast precedent
        if (activeToast) dismiss(true);

        var toast = document.createElement('div');
        toast.className = 'undo-toast';
        toast.innerHTML =
            '<div class="undo-toast-content">' +
                '<span class="undo-toast-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></span>' +
                '<span class="undo-toast-message">' + message + '</span>' +
                '<button class="undo-toast-btn">Annuler</button>' +
                '<button class="undo-toast-close">&times;</button>' +
            '</div>' +
            '<div class="undo-toast-progress"><div class="undo-toast-progress-bar"></div></div>';

        document.body.appendChild(toast);
        activeToast = toast;

        // Animation entree
        requestAnimationFrame(function() {
            toast.classList.add('show');
        });

        // Barre de progression
        var bar = toast.querySelector('.undo-toast-progress-bar');
        var start = Date.now();
        progressTimer = setInterval(function() {
            var elapsed = Date.now() - start;
            var pct = Math.max(0, 100 - (elapsed / duration) * 100);
            bar.style.width = pct + '%';
            if (pct <= 0) clearInterval(progressTimer);
        }, 30);

        // Auto-dismiss apres duration
        timer = setTimeout(function() {
            dismiss(false);
        }, duration);

        // Bouton Annuler
        toast.querySelector('.undo-toast-btn').addEventListener('click', function() {
            clearTimeout(timer);
            clearInterval(progressTimer);
            if (typeof undoCallback === 'function') undoCallback();
            dismiss(true);
            showConfirm('Action annulee');
        });

        // Bouton fermer
        toast.querySelector('.undo-toast-close').addEventListener('click', function() {
            dismiss(false);
        });

        return toast;
    }

    function dismiss(immediate) {
        if (!activeToast) return;
        clearTimeout(timer);
        clearInterval(progressTimer);
        var toast = activeToast;
        activeToast = null;
        if (immediate) {
            toast.remove();
        } else {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(function() { toast.remove(); }, 300);
        }
    }

    function showConfirm(msg) {
        var el = document.createElement('div');
        el.className = 'undo-toast undo-toast-confirm show';
        el.innerHTML = '<div class="undo-toast-content"><span class="undo-toast-icon" style="color:var(--success)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></span><span class="undo-toast-message">' + msg + '</span></div>';
        document.body.appendChild(el);
        setTimeout(function() {
            el.classList.remove('show');
            el.classList.add('hide');
            setTimeout(function() { el.remove(); }, 300);
        }, 2000);
    }

    return { show: show, dismiss: dismiss };
})();

if (typeof window !== 'undefined') window.UndoToast = UndoToast;
