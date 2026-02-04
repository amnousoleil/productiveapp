/**
 * Psycho-Audit View Module
 * ProductiveApp v4.0 - Analyse psycho-professionnelle
 */

const PsychoAuditView = (function() {
    'use strict';

    // Demo data (API not ready yet)
    const DEMO_PROFILE = {
        scores: { execution: 78, creativity: 85, constancy: 65, ambition: 72, organization: 88, resilience: 70 },
        pillars: {
            therapeutic: "Votre profil revele une forte capacite d'execution alliee a une creativite remarquable. Attention a maintenir un equilibre pour eviter l'epuisement.",
            spiritual: "Votre ambition est guidee par des valeurs profondes. Cultivez cette connexion pour donner du sens a vos actions quotidiennes.",
            strategic: "Votre organisation est votre force. Utilisez-la pour structurer vos projets ambitieux et deleguer efficacement."
        }
    };

    const AXES = ['Execution', 'Creativite', 'Constance', 'Ambition', 'Organisation', 'Resilience'];
    const AXES_KEYS = ['execution', 'creativity', 'constancy', 'ambition', 'organization', 'resilience'];

    let state = { profile: null, loading: false, generated: false };

    function generateRadarChart(scores, size = 280) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 40;
        const angleStep = (2 * Math.PI) / 6;

        // Background hexagon levels
        let levels = '';
        [0.25, 0.5, 0.75, 1].forEach(level => {
            const points = AXES_KEYS.map((_, i) => {
                const angle = -Math.PI / 2 + i * angleStep;
                return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
            }).join(' ');
            levels += `<polygon points="${points}" fill="none" stroke="rgba(139,92,246,0.15)" stroke-width="1"/>`;
        });

        // Axis lines
        let axes = '';
        AXES_KEYS.forEach((_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            axes += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="rgba(139,92,246,0.3)" stroke-width="1"/>`;
        });

        // Data polygon
        const dataPoints = AXES_KEYS.map((key, i) => {
            const val = (scores[key] || 0) / 100;
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + r * val * Math.cos(angle)},${cy + r * val * Math.sin(angle)}`;
        }).join(' ');

        // Labels
        let labels = '';
        AXES.forEach((label, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const lx = cx + (r + 25) * Math.cos(angle);
            const ly = cy + (r + 25) * Math.sin(angle);
            const score = scores[AXES_KEYS[i]] || 0;
            labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="#a78bfa" font-size="11" font-weight="500">${label}</text>`;
            labels += `<text x="${lx}" y="${ly + 14}" text-anchor="middle" fill="#22c55e" font-size="12" font-weight="700">${score}%</text>`;
        });

        // Data points
        let dots = '';
        AXES_KEYS.forEach((key, i) => {
            const val = (scores[key] || 0) / 100;
            const angle = -Math.PI / 2 + i * angleStep;
            const dx = cx + r * val * Math.cos(angle);
            const dy = cy + r * val * Math.sin(angle);
            dots += `<circle cx="${dx}" cy="${dy}" r="5" fill="#8b5cf6" stroke="#fff" stroke-width="2"/>`;
        });

        return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${levels}${axes}<polygon points="${dataPoints}" fill="rgba(139,92,246,0.25)" stroke="#8b5cf6" stroke-width="2"/>${dots}${labels}</svg>`;
    }

    function render() {
        console.log('🧠 PsychoAuditView: render() called');
        const container = document.getElementById('view-psycho-audit');
        if (!container) {
            console.warn('🧠 PsychoAuditView: Container #view-psycho-audit not found!');
            return;
        }
        console.log('🧠 PsychoAuditView: Rendering into container', container);

        const profile = state.profile || DEMO_PROFILE;
        const isDemo = !state.generated;

        container.innerHTML = `
            <div class="psycho-audit-view">
                <header class="audit-header">
                    <h1>Psycho-Audit</h1>
                    <p class="subtitle">Analyse psycho-professionnelle basee sur votre activite</p>
                </header>

                ${isDemo ? `<div class="demo-banner">Module en construction - Donnees de demonstration</div>` : ''}

                <div class="audit-content">
                    <div class="radar-section">
                        <h2>Profil Hexagonal</h2>
                        <div class="radar-container">${generateRadarChart(profile.scores)}</div>
                        <button class="btn-generate" onclick="PsychoAuditView.generateProfile()" ${state.loading ? 'disabled' : ''}>
                            ${state.loading ? 'Generation en cours...' : 'Generer mon profil psycho-professionnel'}
                        </button>
                    </div>

                    <div class="pillars-section">
                        <h2>Les 3 Piliers</h2>
                        <div class="pillar therapeutic">
                            <div class="pillar-icon">🧠</div>
                            <h3>Therapeutique</h3>
                            <p>${profile.pillars.therapeutic}</p>
                        </div>
                        <div class="pillar spiritual">
                            <div class="pillar-icon">✨</div>
                            <h3>Spirituel</h3>
                            <p>${profile.pillars.spiritual}</p>
                        </div>
                        <div class="pillar strategic">
                            <div class="pillar-icon">🎯</div>
                            <h3>Strategique</h3>
                            <p>${profile.pillars.strategic}</p>
                        </div>
                    </div>
                </div>

                <div class="scores-grid">
                    ${AXES.map((axis, i) => {
                        const key = AXES_KEYS[i];
                        const score = profile.scores[key] || 0;
                        return `<div class="score-item"><span class="score-label">${axis}</span><div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div><span class="score-value">${score}%</span></div>`;
                    }).join('')}
                </div>
            </div>
        `;
        injectStyles();
        console.log('🧠 PsychoAuditView: Render complete, container innerHTML set');
    }

    async function generateProfile() {
        state.loading = true;
        render();

        // Simulate API call (API not ready)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate random-ish profile based on demo
        state.profile = {
            scores: {
                execution: Math.min(100, DEMO_PROFILE.scores.execution + Math.floor(Math.random() * 10 - 5)),
                creativity: Math.min(100, DEMO_PROFILE.scores.creativity + Math.floor(Math.random() * 10 - 5)),
                constancy: Math.min(100, DEMO_PROFILE.scores.constancy + Math.floor(Math.random() * 10 - 5)),
                ambition: Math.min(100, DEMO_PROFILE.scores.ambition + Math.floor(Math.random() * 10 - 5)),
                organization: Math.min(100, DEMO_PROFILE.scores.organization + Math.floor(Math.random() * 10 - 5)),
                resilience: Math.min(100, DEMO_PROFILE.scores.resilience + Math.floor(Math.random() * 10 - 5))
            },
            pillars: DEMO_PROFILE.pillars
        };
        state.generated = true;
        state.loading = false;
        render();
    }

    function refresh() { render(); }
    function init() { console.log('PsychoAuditView: Initializing...'); render(); }

    function injectStyles() {
        if (document.getElementById('psycho-audit-styles')) return;
        const style = document.createElement('style');
        style.id = 'psycho-audit-styles';
        style.textContent = `
            .psycho-audit-view { padding: 24px; max-width: 1000px; margin: 0 auto; }
            .audit-header { text-align: center; margin-bottom: 24px; }
            .audit-header h1 { font-size: 28px; font-weight: 700; color: #a78bfa; margin-bottom: 8px; }
            .audit-header .subtitle { color: var(--text-secondary, #888); }
            .demo-banner { background: rgba(245,158,11,0.2); color: #f59e0b; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 24px; font-size: 13px; }
            .audit-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
            .radar-section, .pillars-section { background: var(--card-bg, #1e1e2e); border-radius: 16px; padding: 24px; }
            .radar-section h2, .pillars-section h2 { font-size: 16px; margin-bottom: 20px; color: var(--text-primary, #fff); }
            .radar-container { display: flex; justify-content: center; margin-bottom: 20px; }
            .btn-generate { width: 100%; padding: 14px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
            .btn-generate:hover:not(:disabled) { transform: translateY(-2px); }
            .btn-generate:disabled { opacity: 0.6; cursor: not-allowed; }
            .pillar { padding: 16px; background: var(--bg-secondary, #2a2a3e); border-radius: 12px; margin-bottom: 12px; }
            .pillar-icon { font-size: 24px; margin-bottom: 8px; }
            .pillar h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary, #fff); }
            .pillar p { font-size: 13px; color: var(--text-secondary, #888); line-height: 1.5; }
            .pillar.therapeutic { border-left: 3px solid #22c55e; }
            .pillar.spiritual { border-left: 3px solid #a78bfa; }
            .pillar.strategic { border-left: 3px solid #3b82f6; }
            .scores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .score-item { background: var(--card-bg, #1e1e2e); padding: 16px; border-radius: 12px; }
            .score-label { font-size: 12px; color: var(--text-secondary, #888); display: block; margin-bottom: 8px; }
            .score-bar { height: 8px; background: var(--bg-tertiary, #3a3a4e); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
            .score-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #22c55e); border-radius: 4px; transition: width 0.5s ease; }
            .score-value { font-size: 18px; font-weight: 700; color: #22c55e; }
            @media (max-width: 768px) { .audit-content { grid-template-columns: 1fr; } .scores-grid { grid-template-columns: repeat(2, 1fr); } }
        `;
        document.head.appendChild(style);
    }

    return { init, refresh, render, generateProfile };
})();

if (typeof window !== 'undefined') {
    window.PsychoAuditView = PsychoAuditView;
}
