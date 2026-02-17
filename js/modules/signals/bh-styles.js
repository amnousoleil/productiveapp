/**
 * Behavioral Styles v2.0 — Portrait psychologique premium
 * ProductiveApp v5.0
 */
const BehavioralStyles = (function() {
    'use strict';

    const CSS = `
/* ════════════════════════════════════════════
   BASE
════════════════════════════════════════════ */
.bh-profile-v2 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0 2rem;
    max-width: 820px;
}

.bh-empty {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
}

/* ════════════════════════════════════════════
   CARDS BASE
════════════════════════════════════════════ */
.bh-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.bh-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.bh-module-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    opacity: 0.7;
}

.bh-card-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 1rem;
}
.bh-card-subtitle {
    font-size: 0.78rem;
    color: var(--text-secondary);
    opacity: 0.6;
}

/* ════════════════════════════════════════════
   CHRONOTYPE — HERO CARD
════════════════════════════════════════════ */
.bh-chronotype {
    background: linear-gradient(135deg, var(--surface) 60%, color-mix(in srgb, var(--ct-color, #3B82F6) 8%, transparent));
    border-left: 3px solid var(--ct-color, #3B82F6);
}

.bh-chronotype-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    margin-bottom: 1rem;
}

.bh-chronotype-icon {
    font-size: 3.5rem;
    line-height: 1;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
    animation: bhIconFloat 3s ease-in-out infinite;
}
@keyframes bhIconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}

.bh-chronotype-meta {
    flex: 1;
}

.bh-label-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
}

.bh-badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    border: 1px solid;
    letter-spacing: 0.03em;
}

.bh-chronotype-name {
    font-size: 1.9rem;
    font-weight: 800;
    margin: 0 0 0.15rem;
    color: var(--ct-color, var(--text));
    letter-spacing: -0.02em;
}

.bh-chronotype-tagline {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    font-style: italic;
}

.bh-chronotype-desc {
    font-size: 0.88rem;
    line-height: 1.65;
    color: var(--text-secondary);
    margin: 0 0 1.25rem;
}

.bh-chronotype-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.bh-stat-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--surface-hover, rgba(0,0,0,0.04));
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    font-size: 0.78rem;
    flex: 1;
    min-width: 160px;
}
.bh-stat-warning {
    background: rgba(239,68,68,0.06);
}
.bh-stat-icon { font-size: 0.9rem; }
.bh-stat-label {
    color: var(--text-secondary);
    opacity: 0.7;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
}
.bh-stat-value {
    font-weight: 600;
    color: var(--text);
    font-size: 0.78rem;
}

.bh-chronotype-advice {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: color-mix(in srgb, var(--ct-color, #3B82F6) 6%, transparent);
    border-radius: 8px;
    padding: 0.6rem 0.9rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.5;
    border: 1px solid color-mix(in srgb, var(--ct-color, #3B82F6) 15%, transparent);
}
.bh-advice-icon { flex-shrink: 0; }

/* ════════════════════════════════════════════
   DUAL ROW (Archétype + Pression)
════════════════════════════════════════════ */
.bh-dual-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}
@media (max-width: 600px) {
    .bh-dual-row { grid-template-columns: 1fr; }
}

.bh-dual-card {
    border-top: 2px solid var(--at-color, var(--primary));
}

.bh-dual-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.bh-dual-icon { font-size: 1.5rem; }
.bh-dual-name {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
}
.bh-dual-desc {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.55;
    margin: 0 0 0.8rem;
}

.bh-trait-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 0.8rem;
}
.bh-trait {
    font-size: 0.68rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: var(--surface-hover, rgba(0,0,0,0.05));
    color: var(--text-secondary);
    font-weight: 500;
}

.bh-dual-stats {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}
.bh-mini-stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}
.bh-mini-stat-val {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--at-color, var(--primary));
}
.bh-mini-stat-lbl {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    opacity: 0.65;
}

/* ════════════════════════════════════════════
   FENÊTRES D'EXCELLENCE
════════════════════════════════════════════ */
.bh-window-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}
@media (max-width: 480px) {
    .bh-window-grid { grid-template-columns: 1fr; }
}

.bh-window-card {
    background: var(--surface-hover, rgba(0,0,0,0.03));
    border-radius: 10px;
    padding: 0.9rem;
    text-align: center;
    border: 1px solid var(--border);
    transition: background 0.2s;
}
.bh-window-card:hover { background: var(--surface-hover); }

.bh-window-rank { font-size: 1.2rem; margin-bottom: 0.3rem; }
.bh-window-time {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 0.2rem;
}
.bh-window-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
}
.bh-window-bar {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
}
.bh-window-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1s ease-out;
    animation: bhBarGrow 1s ease-out both;
}
@keyframes bhBarGrow { from { width: 0 !important; } }

/* ════════════════════════════════════════════
   MOMENTUM
════════════════════════════════════════════ */
.bh-momentum-body {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
}
.bh-momentum-icon { font-size: 2rem; }
.bh-momentum-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}
.bh-momentum-label {
    font-size: 1.05rem;
    font-weight: 700;
}
.bh-momentum-delta {
    font-size: 0.78rem;
    color: var(--text-secondary);
}
.bh-momentum-count {
    font-size: 0.78rem;
    color: var(--text-secondary);
    opacity: 0.7;
}
.bh-momentum-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
}
.bh-momentum-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    animation: bhBarGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
}

/* ════════════════════════════════════════════
   SIGNATURE
════════════════════════════════════════════ */
.bh-signature {
    background: var(--surface);
    text-align: center;
    border: 1px dashed var(--border);
}
.bh-signature-label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
    opacity: 0.5;
    margin-bottom: 0.5rem;
}
.bh-signature-code {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--text);
    font-family: 'SF Mono', 'Fira Mono', monospace;
    word-break: break-word;
    line-height: 1.5;
}
.bh-signature-note {
    font-size: 0.68rem;
    color: var(--text-secondary);
    opacity: 0.4;
    margin-top: 0.4rem;
}

/* ════════════════════════════════════════════
   TOGGLE DETAILS
════════════════════════════════════════════ */
.bh-details-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 0.8rem;
    border-radius: 8px;
    transition: background 0.15s;
    user-select: none;
}
.bh-details-toggle:hover { background: var(--surface-hover, rgba(0,0,0,0.04)); }
.bh-toggle-icon { font-size: 0.7rem; transition: transform 0.2s; }

/* ════════════════════════════════════════════
   CLASSIC CHARTS (vue détaillée)
════════════════════════════════════════════ */
.bh-classic-charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    padding-top: 0.5rem;
}
.bh-chart-block {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
}
.bh-chart-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.bh-chart-wrap { display: flex; justify-content: center; }

/* Styles charts existants */
.bh-section { display: none; }
.bh-chart-clock { max-width: 200px; }
.bh-clock-segment { animation: bhFadeIn 0.4s ease-out both; }
.bh-clock-label { font-size: 10px; fill: var(--text-secondary); }
.bh-chart-heatmap { max-width: 280px; }
.bh-heatmap-cell { animation: bhFadeIn 0.3s ease-out both; }
.bh-heatmap-label { font-size: 9px; fill: var(--text-secondary); }
.bh-chart-curve { max-width: 320px; width: 100%; }
.bh-curve-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: bhDrawLine 1.5s ease-out forwards; }
.bh-curve-label { font-size: 9px; fill: var(--text-secondary); }
.bh-curve-dot { animation: bhPulse 2s ease-in-out infinite; }
.bh-chart-bars { max-width: 300px; width: 100%; }
.bh-bar-group { animation: bhSlideIn 0.5s ease-out both; }
.bh-bar-label { font-size: 11px; fill: var(--text-secondary); }
.bh-bar-fill { transform-origin: left; animation: bhGrowBar 0.6s ease-out both; }
.bh-bar-value { font-size: 10px; fill: var(--text); font-weight: 600; }

/* ════════════════════════════════════════════
   ANIMATIONS REVEAL
════════════════════════════════════════════ */
[data-reveal] {
    opacity: 0;
    transform: translateY(12px);
}
[data-reveal].bh-reveal {
    animation: bhReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes bhReveal {
    to { opacity: 1; transform: translateY(0); }
}

/* Legacy animations */
@keyframes bhFadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes bhDrawLine { to { stroke-dashoffset: 0; } }
@keyframes bhGrowBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes bhSlideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bhPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

/* Mini (sidebar) */
.bh-mini { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); }
.bh-mini-stat { font-weight: 600; color: var(--primary); }
.bh-mini-peak { color: var(--text-secondary); }

/* ════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════ */
@media (max-width: 480px) {
    .bh-chronotype-header { flex-direction: column; }
    .bh-chronotype-icon { font-size: 2.5rem; }
    .bh-chronotype-name { font-size: 1.5rem; }
    .bh-stat-pill { min-width: unset; flex: 0 0 auto; width: 100%; }
    .bh-window-grid { grid-template-columns: 1fr; }
    .bh-classic-charts { grid-template-columns: 1fr; }
}
`;

    let injected = false;

    function inject() {
        if (injected) return;
        // Remplacer l'ancien style si présent
        const old = document.getElementById('bh-styles');
        if (old) old.remove();
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
