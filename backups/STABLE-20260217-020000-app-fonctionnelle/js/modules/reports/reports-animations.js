/**
 * REPORTS ANIMATIONS - ProductiveApp Premium
 * Compteurs animes, sparklines SVG, progress rings, entrees staggerees
 */

const ReportsAnimations = (function() {
    'use strict';

    /**
     * Animate a counter from 0 to target
     * @param {HTMLElement} element
     * @param {number} targetValue
     * @param {Object} options - { duration, suffix, prefix, decimals, easing }
     */
    function animateCounter(element, targetValue, options) {
        if (!element) return;
        var opts = options || {};
        var duration = opts.duration || 1500;
        var suffix = opts.suffix || '';
        var prefix = opts.prefix || '';
        var decimals = opts.decimals || 0;
        var startTime = null;

        function easeOutExpo(t) {
            return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = easeOutExpo(progress);
            var current = eased * targetValue;

            if (decimals > 0) {
                current = current.toFixed(decimals);
            } else {
                current = Math.round(current);
            }

            element.textContent = prefix + current.toLocaleString('fr-FR') + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Observe elements for staggered entrance animations
     * @param {string} selector
     * @param {Object} options - { staggerDelay, rootMargin }
     */
    function observeEntrance(selector, options) {
        var opts = options || {};
        var delay = opts.staggerDelay || 100;
        var elements = document.querySelectorAll(selector);
        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            // Fallback: reveal all immediately
            elements.forEach(function(el) { el.classList.add('revealed'); });
            return;
        }

        var counter = 0;
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    el.style.transitionDelay = (counter * delay) + 'ms';
                    el.classList.add('revealed');
                    counter++;
                    observer.unobserve(el);
                }
            });
        }, {
            rootMargin: opts.rootMargin || '0px 0px -30px 0px',
            threshold: 0.05
        });

        elements.forEach(function(el) { observer.observe(el); });
    }

    /**
     * Render an SVG sparkline into a container
     * @param {HTMLElement} container
     * @param {number[]} data
     * @param {Object} options - { width, height, color, strokeWidth, fill }
     */
    function renderSparkline(container, data, options) {
        if (!container || !data || !data.length) return;
        var opts = options || {};
        var w = opts.width || 100;
        var h = opts.height || 28;
        var color = opts.color || 'var(--accent)';
        var sw = opts.strokeWidth || 1.5;
        var padding = 2;
        var max = Math.max.apply(null, data);
        if (max === 0) max = 1;
        var usableW = w - padding * 2;
        var usableH = h - padding * 2;
        var step = data.length > 1 ? usableW / (data.length - 1) : 0;

        var points = data.map(function(val, i) {
            var x = padding + i * step;
            var y = padding + usableH - (val / max) * usableH;
            return x.toFixed(1) + ',' + y.toFixed(1);
        }).join(' ');

        // Area polygon for fill
        var lastX = padding + (data.length - 1) * step;
        var areaPoints = points + ' ' + lastX.toFixed(1) + ',' + (h - padding) + ' ' + padding + ',' + (h - padding);

        var gradId = 'spk-' + Math.random().toString(36).substr(2, 6);

        container.innerHTML =
            '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="display:block">' +
            '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.25"/>' +
            '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
            '</linearGradient></defs>' +
            '<polygon points="' + areaPoints + '" fill="url(#' + gradId + ')"/>' +
            '<polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
    }

    /**
     * Render an SVG progress ring
     * @param {HTMLElement} container
     * @param {number} percent (0-100)
     * @param {Object} options - { size, strokeWidth, color, bgColor, showText }
     */
    function renderProgressRing(container, percent, options) {
        if (!container) return;
        var opts = options || {};
        var size = opts.size || 48;
        var sw = opts.strokeWidth || 4;
        var color = opts.color || 'var(--accent)';
        var bgColor = opts.bgColor || 'rgba(255,255,255,0.08)';
        var showText = opts.showText !== undefined ? opts.showText : false;
        var radius = (size - sw) / 2;
        var circumference = 2 * Math.PI * radius;
        var offset = circumference - (Math.min(percent, 100) / 100) * circumference;
        var cx = size / 2;
        var cy = size / 2;

        var textHtml = '';
        if (showText) {
            textHtml = '<text x="' + cx + '" y="' + (cy + 1) + '" fill="var(--text)" font-size="' + Math.round(size * 0.22) + '" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + Math.round(percent) + '%</text>';
        }

        container.innerHTML =
            '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + bgColor + '" stroke-width="' + sw + '"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" ' +
            'stroke-dasharray="' + circumference.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '" ' +
            'stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')" class="progress-ring-anim"/>' +
            textHtml +
            '</svg>';
    }

    /**
     * Animate all KPI counters in a container
     * @param {HTMLElement} container
     */
    function animateKPIs(container) {
        if (!container) return;
        var values = container.querySelectorAll('.kpi-value[data-target]');
        values.forEach(function(el, i) {
            var target = parseFloat(el.dataset.target) || 0;
            var suffix = el.dataset.suffix || '';
            var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
            setTimeout(function() {
                animateCounter(el, target, { suffix: suffix, duration: 1500, decimals: decimals });
            }, i * 80);
        });
    }

    return {
        animateCounter: animateCounter,
        observeEntrance: observeEntrance,
        renderSparkline: renderSparkline,
        renderProgressRing: renderProgressRing,
        animateKPIs: animateKPIs
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsAnimations = ReportsAnimations;
}
