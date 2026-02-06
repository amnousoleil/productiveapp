/**
 * Behavioral Styles - CSS injection
 * ProductiveApp v4.0
 */
const BehavioralStyles = (function() {
    'use strict';

    const CSS = `
.bh-profile { display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem; }
.bh-section { background: var(--surface); border-radius: 12px; padding: 1.25rem; border: 1px solid var(--border); }
.bh-section-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; color: var(--text); }
.bh-chart-container { display: flex; justify-content: center; margin: 0.5rem 0; }
.bh-insight-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0.75rem 0 0; }
.bh-insight-text strong { color: var(--text); font-weight: 600; }
.bh-highlight-good { color: var(--success); }
.bh-highlight-medium { color: var(--warning); }
.bh-highlight-low { color: var(--danger); }

/* Clock */
.bh-chart-clock { max-width: 200px; }
.bh-clock-segment { animation: bhFadeIn 0.4s ease-out both; }
.bh-clock-label { font-size: 10px; fill: var(--text-secondary); }

/* Heatmap */
.bh-chart-heatmap { max-width: 280px; }
.bh-heatmap-cell { animation: bhFadeIn 0.3s ease-out both; }
.bh-heatmap-label { font-size: 9px; fill: var(--text-secondary); }

/* Curve */
.bh-chart-curve { max-width: 320px; width: 100%; }
.bh-curve-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: bhDrawLine 1.5s ease-out forwards; }
.bh-curve-label { font-size: 9px; fill: var(--text-secondary); }
.bh-curve-dot { animation: bhPulse 2s ease-in-out infinite; }

/* Bars */
.bh-chart-bars { max-width: 300px; width: 100%; }
.bh-bar-group { animation: bhSlideIn 0.5s ease-out both; }
.bh-bar-label { font-size: 11px; fill: var(--text-secondary); }
.bh-bar-fill { transform-origin: left; animation: bhGrowBar 0.6s ease-out both; }
.bh-bar-value { font-size: 10px; fill: var(--text); font-weight: 600; }

/* Mini */
.bh-mini { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); }
.bh-mini-stat { font-weight: 600; color: var(--primary); }

/* Animations */
@keyframes bhFadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes bhDrawLine { to { stroke-dashoffset: 0; } }
@keyframes bhGrowBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes bhSlideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bhPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

/* Responsive */
@media (max-width: 480px) {
    .bh-chart-container svg { max-width: 100%; }
    .bh-section { padding: 1rem; }
}
`;

    let injected = false;

    function inject() {
        if (injected) return;
        const style = document.createElement('style');
        style.id = 'bh-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
        injected = true;
    }

    function remove() {
        const el = document.getElementById('bh-styles');
        if (el) el.remove();
        injected = false;
    }

    return { inject, remove };
})();

if (typeof window !== 'undefined') window.BehavioralStyles = BehavioralStyles;
