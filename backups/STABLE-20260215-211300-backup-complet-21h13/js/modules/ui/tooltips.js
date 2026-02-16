/**
 * TOOLTIPS - ProductiveApp v4.0
 * Tooltips riches au hover
 */
const Tooltips = (function() {
    'use strict';

    let tooltip = null;
    let hideTimer = null;

    function init() {
        // Creer l'element tooltip
        tooltip = document.createElement('div');
        tooltip.className = 'pa-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        // Delegation d'evenements
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
    }

    function handleMouseOver(e) {
        var target = e.target.closest('[data-tooltip]');
        if (!target) return;
        clearTimeout(hideTimer);
        var text = target.getAttribute('data-tooltip');
        var pos = target.getAttribute('data-tooltip-pos') || 'top';
        show(target, text, pos);
    }

    function handleMouseOut(e) {
        var target = e.target.closest('[data-tooltip]');
        if (!target) return;
        hideTimer = setTimeout(hide, 150);
    }

    function show(anchor, text, pos) {
        if (!tooltip || !text) return;
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.className = 'pa-tooltip pa-tooltip-' + pos + ' show';

        var rect = anchor.getBoundingClientRect();
        var tw = tooltip.offsetWidth;
        var th = tooltip.offsetHeight;
        var x, y;

        switch (pos) {
            case 'bottom':
                x = rect.left + rect.width / 2 - tw / 2;
                y = rect.bottom + 8;
                break;
            case 'left':
                x = rect.left - tw - 8;
                y = rect.top + rect.height / 2 - th / 2;
                break;
            case 'right':
                x = rect.right + 8;
                y = rect.top + rect.height / 2 - th / 2;
                break;
            default: // top
                x = rect.left + rect.width / 2 - tw / 2;
                y = rect.top - th - 8;
                break;
        }

        // Eviter debordement
        x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
        y = Math.max(8, Math.min(y, window.innerHeight - th - 8));

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    function hide() {
        if (!tooltip) return;
        tooltip.classList.remove('show');
        tooltip.style.display = 'none';
    }

    return { init: init, show: show, hide: hide };
})();

if (typeof window !== 'undefined') window.Tooltips = Tooltips;
