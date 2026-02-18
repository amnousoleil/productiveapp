/**
 * Behavioral Styles v3.0 — Vivant, Joyeux & Aimant
 * ProductiveApp v5.0
 */
const BehavioralStyles = (function() {
    'use strict';

    const CSS = `
/* ═══ BASE ═══ */
.bh-profile-v3 {
    display: flex; flex-direction: column; gap: 1.25rem;
    padding: 0.5rem 0 3rem; max-width: 860px;
}
.bh-empty {
    padding: 3rem; text-align: center; color: var(--text-secondary);
}
.bh-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.bh-empty h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--text); }

/* ═══ CHIP LABELS ═══ */
.bh-chip {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 0.25rem 0.65rem;
    border-radius: 20px; background: var(--primary, #6366F1)18;
    color: var(--primary, #6366F1); margin-bottom: 0.75rem;
}
.bh-chip-love { background: rgba(236,72,153,0.12); color: #EC4899; }
.bh-subtitle { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-left: 0.5rem; }

/* ═══ CARDS ═══ */
.bh-card {
    background: var(--surface); border-radius: 20px; padding: 1.5rem;
    border: 1px solid var(--border); position: relative; overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.bh-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }

/* ═══ HERO ═══ */
.bh-hero {
    border-radius: 24px; padding: 2rem 1.75rem;
    background: var(--ct-gradient, linear-gradient(135deg,#8B5CF6,#EC4899));
    box-shadow: 0 8px 40px var(--ct-glow, rgba(139,92,246,0.3));
    display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
    position: relative; overflow: hidden; color: white;
}
.bh-hero::before {
    content: ''; position: absolute; top: -40%; right: -10%;
    width: 250px; height: 250px; border-radius: 50%;
    background: rgba(255,255,255,0.08); pointer-events: none;
}
.bh-hero-animal {
    font-size: 4.5rem; line-height: 1; flex-shrink: 0;
    animation: bhAnimalFloat 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
}
@keyframes bhAnimalFloat {
    0%,100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-8px) rotate(2deg); }
}
.bh-hero-content { flex: 1; min-width: 200px; }
.bh-hero-chip {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.9); padding: 0.25rem 0.7rem;
    border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;
}
.bh-hero-title { font-size: 2rem; font-weight: 800; margin: 0 0 0.3rem; line-height: 1.1; }
.bh-hero-title em { font-style: normal; text-decoration: underline; text-decoration-color: rgba(255,255,255,0.5); }
.bh-hero-tagline { font-size: 0.9rem; opacity: 0.9; margin: 0; }
.bh-hero-archetype { flex-shrink: 0; }
.bh-hero-at-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
    border-radius: 12px; padding: 0.5rem 0.9rem;
    font-weight: 600; font-size: 0.85rem; color: white;
    border: 1px solid rgba(255,255,255,0.3);
}

/* ═══ SOUL ═══ */
.bh-soul { border-top: 3px solid var(--ct-color, #8B5CF6); }
.bh-soul-header { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.bh-soul-body { display: flex; gap: 1.25rem; align-items: flex-start; margin-bottom: 1rem; }
.bh-soul-big-icon { font-size: 3.5rem; flex-shrink: 0; animation: bhSoulPulse 4s ease-in-out infinite; }
@keyframes bhSoulPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
.bh-soul-desc { font-size: 0.9rem; line-height: 1.65; color: var(--text); margin: 0 0 0.75rem; }
.bh-gifts-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.bh-gift {
    font-size: 0.78rem; font-weight: 600; padding: 0.25rem 0.65rem;
    border-radius: 20px; background: var(--ct-color, #8B5CF6)15;
    color: var(--ct-color, #8B5CF6); border: 1px solid var(--ct-color, #8B5CF6)30;
}
.bh-soul-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.bh-soul-stat {
    display: flex; align-items: center; gap: 0.5rem;
    background: var(--surface-elevated, rgba(0,0,0,0.04));
    padding: 0.4rem 0.75rem; border-radius: 10px;
    font-size: 0.82rem; color: var(--text-secondary); flex: 1; min-width: 160px;
}
.bh-soul-warn { background: rgba(245,158,11,0.08); color: var(--text-secondary); }
.bh-soul-stat-val { font-size: 1rem; }
.bh-soul-advice {
    font-size: 0.82rem; color: var(--text-secondary);
    background: rgba(99,102,241,0.06); padding: 0.65rem 0.9rem;
    border-radius: 10px; border-left: 3px solid var(--primary, #6366F1);
    line-height: 1.5;
}

/* ═══ SUPER-POUVOIRS ═══ */
.bh-powers {}
.bh-powers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
.bh-power-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem;
    padding: 1rem; border-radius: 14px; border: 1px solid transparent;
    transition: transform 0.2s ease;
}
.bh-power-card:hover { transform: translateY(-3px) scale(1.02); }
.bh-power-gold { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
.bh-power-rose { background: rgba(236,72,153,0.1); border-color: rgba(236,72,153,0.25); }
.bh-power-violet { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.25); }
.bh-power-icon { font-size: 1.75rem; margin-bottom: 0.25rem; }
.bh-power-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); opacity: 0.7; }
.bh-power-value { font-size: 0.82rem; font-weight: 600; color: var(--text); line-height: 1.35; }

/* ═══ DUAL ROW ═══ */
.bh-dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .bh-dual-row { grid-template-columns: 1fr; } }

/* ═══ STYLE CARDS ═══ */
.bh-style-card { border-top: 3px solid var(--style-color, #6366F1); }
.bh-style-icon { font-size: 2.5rem; margin: 0.5rem 0; }
.bh-style-name { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem; }
.bh-style-desc { font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary); margin: 0 0 0.75rem; }
.bh-traits-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.bh-trait {
    font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.55rem;
    border-radius: 20px; background: var(--style-color, #6366F1)15;
    color: var(--style-color, #6366F1); border: 1px solid var(--style-color, #6366F1)25;
}
.bh-style-kpi { display: flex; gap: 1rem; align-items: baseline; margin-top: 0.75rem; flex-wrap: wrap; }
.bh-kpi-val { font-size: 1.4rem; font-weight: 800; }
.bh-kpi-lbl { font-size: 0.72rem; color: var(--text-secondary); margin-right: 0.75rem; }

/* ═══ FENÊTRES D'OR ═══ */
.bh-golden-header { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.bh-golden-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
@media (max-width: 500px) { .bh-golden-grid { grid-template-columns: 1fr; } }
.bh-golden-card {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 1.1rem 0.75rem; border-radius: 16px; gap: 0.3rem;
    transition: transform 0.2s ease;
}
.bh-golden-card:hover { transform: translateY(-3px); }
.bh-golden-1 { background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(252,211,77,0.08)); border: 1px solid rgba(245,158,11,0.3); }
.bh-golden-2 { background: linear-gradient(135deg, rgba(148,163,184,0.12), rgba(203,213,225,0.08)); border: 1px solid rgba(148,163,184,0.3); }
.bh-golden-3 { background: linear-gradient(135deg, rgba(180,120,80,0.1), rgba(205,150,100,0.06)); border: 1px solid rgba(180,120,80,0.25); }
.bh-golden-medal { font-size: 1.75rem; }
.bh-golden-time { font-size: 1.2rem; font-weight: 800; color: var(--text); }
.bh-golden-tip { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-secondary); opacity: 0.6; }
.bh-golden-name { font-size: 0.8rem; color: var(--text-secondary); }
.bh-golden-bar { width: 100%; height: 4px; background: var(--border); border-radius: 4px; margin-top: 0.3rem; overflow: hidden; }
.bh-golden-fill { height: 100%; background: var(--primary, #6366F1); border-radius: 4px; animation: bhBarGrow 1s ease forwards; }
@keyframes bhBarGrow { from { width: 0 !important; } }

/* ═══ MOMENTUM ═══ */
.bh-momentum-card {}
.bh-momentum-body { display: flex; align-items: center; gap: 1rem; margin: 0.75rem 0; }
.bh-momentum-big { font-size: 2.5rem; }
.bh-momentum-info { display: flex; flex-direction: column; gap: 0.2rem; }
.bh-momentum-status { font-size: 1rem; font-weight: 700; }
.bh-momentum-msg { font-size: 0.82rem; color: var(--text-secondary); font-style: italic; }
.bh-momentum-count { font-size: 0.78rem; color: var(--text-secondary); opacity: 0.7; }
.bh-momentum-track { height: 6px; background: var(--border); border-radius: 6px; overflow: hidden; }
.bh-momentum-fill-bar { height: 100%; border-radius: 6px; animation: bhBarGrow 1s ease forwards; }

/* ═══ LOVE SECTION ═══ */
.bh-love {
    background: linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(139,92,246,0.06) 100%);
    border: 1px solid rgba(236,72,153,0.2);
}
.bh-love-body { display: flex; gap: 1rem; align-items: flex-start; margin-top: 0.5rem; }
.bh-love-icon { font-size: 2.5rem; flex-shrink: 0; animation: bhSoulPulse 4s ease-in-out infinite; }
.bh-love-note { font-size: 0.92rem; line-height: 1.7; color: var(--text); margin: 0 0 0.75rem; font-style: italic; flex: 1; }
.bh-love-quote {
    margin: 0.75rem 0 0; padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.05); border-radius: 12px;
    border-left: 3px solid rgba(236,72,153,0.4);
}
.bh-quote-mark { font-size: 2rem; color: rgba(236,72,153,0.5); line-height: 0.5; display: block; margin-bottom: 0.25rem; }
.bh-quote-text { font-size: 0.88rem; color: var(--text); font-style: italic; display: block; margin-bottom: 0.4rem; }
.bh-quote-author { font-size: 0.72rem; color: var(--text-secondary); display: block; font-style: normal; }

/* ═══ SIGNATURE ═══ */
.bh-sig-card {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06));
    border: 1.5px dashed rgba(99,102,241,0.3); text-align: center;
}
.bh-sig-sparkles {
    font-size: 1.2rem; letter-spacing: 0.4rem; margin-bottom: 0.75rem;
    animation: bhSparkle 2s ease-in-out infinite;
}
@keyframes bhSparkle { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.bh-sig-label {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-secondary); opacity: 0.7;
    margin-bottom: 0.6rem;
}
.bh-sig-code {
    font-size: 1rem; font-weight: 800; letter-spacing: 0.05em;
    color: var(--primary, #6366F1); padding: 0.75rem 1rem;
    background: var(--primary, #6366F1)10; border-radius: 10px;
    margin-bottom: 0.5rem; word-break: break-word; line-height: 1.4;
}
.bh-sig-note { font-size: 0.78rem; color: var(--text-secondary); font-style: italic; opacity: 0.7; }

/* ═══ DETAILS TOGGLE ═══ */
.bh-details-toggle {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 1.25rem; background: var(--surface);
    border-radius: 12px; border: 1px solid var(--border);
    cursor: pointer; font-size: 0.85rem; font-weight: 600;
    color: var(--text-secondary); transition: all 0.2s ease;
}
.bh-details-toggle:hover { background: var(--surface-elevated, rgba(0,0,0,0.04)); color: var(--text); }
.bh-details-section { margin-top: -0.5rem; }
.bh-classic-charts { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 1.25rem; padding: 1rem; }
.bh-chart-block { background: var(--surface); border-radius: 14px; padding: 1rem; border: 1px solid var(--border); }
.bh-chart-title { font-size: 0.82rem; font-weight: 600; margin: 0 0 0.75rem; color: var(--text-secondary); }
.bh-chart-wrap {}

/* ═══ ANIMATIONS REVEAL ═══ */
[data-reveal] { opacity: 0; transform: translateY(16px); }
.bh-reveal { animation: bhReveal 0.5s ease forwards; }
@keyframes bhReveal { to { opacity: 1; transform: translateY(0); } }
`;

    let injected = false;
    function inject() {
        if (injected) return;
        const style = document.createElement('style');
        style.id = 'bh-styles-v3';
        style.textContent = CSS;
        document.head.appendChild(style);
        injected = true;
    }

    return { inject };
})();

if (typeof window !== 'undefined') window.BehavioralStyles = BehavioralStyles;
