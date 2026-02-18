/**
 * Behavioral Render v3.0 — Portrait Vivant, Joyeux & Aimant
 * ProductiveApp v5.0
 */
const BehavioralRender = (function() {
    'use strict';

    function renderProfile(container, data) {
        if (!container) return;
        if (!data || (!data.hourlyActivity && !data.completion_rate && !data.completionRate)) {
            container.innerHTML = `<div class="bh-empty">
                <div class="bh-empty-icon">🌱</div>
                <h3>Ton profil prend vie...</h3>
                <p>Utilise l'app quelques jours et découvre ton portrait unique !</p>
            </div>`;
            return;
        }
        let insights;
        try {
            insights = BehavioralInsights.analyze(data);
        } catch (e) {
            console.error('BH insights error:', e);
            container.innerHTML = '<div class="bh-empty">Erreur d\'analyse. Rafraîchis la page.</div>';
            return;
        }

        container.innerHTML = `
            <div class="bh-profile-v3">
                ${renderHero(insights)}
                ${renderSoul(insights.chronotype, insights.stats)}
                ${renderPowers(insights.chronotype)}
                <div class="bh-dual-row">
                    ${renderStyle(insights.archetype)}
                    ${renderPressure(insights.pressureStyle, insights.stats)}
                </div>
                ${renderGoldenWindows(insights.windows)}
                ${renderMomentumCard(insights.momentum)}
                ${renderLoveSection(insights)}
                ${renderSignatureCelebration(insights.signature)}
                <div class="bh-details-toggle" onclick="BehavioralRender.toggleDetails(this)">
                    <span class="bh-toggle-label">📊 Voir les graphiques détaillés</span>
                    <span class="bh-toggle-icon">▼</span>
                </div>
                <div class="bh-details-section" style="display:none">
                    ${renderClassicCharts(data)}
                </div>
            </div>`;

        requestAnimationFrame(() => {
            container.querySelectorAll('[data-reveal]').forEach((el, i) => {
                el.style.animationDelay = `${i * 90}ms`;
                el.classList.add('bh-reveal');
            });
        });
    }

    function renderHero(insights) {
        const ct = insights.chronotype;
        const at = insights.archetype;
        return `
        <div class="bh-hero" style="--ct-gradient:${ct.gradient};--ct-glow:${ct.glowColor}" data-reveal>
            <div class="bh-hero-animal">${ct.icon}</div>
            <div class="bh-hero-content">
                <div class="bh-hero-chip">✨ CHRONOTYPE · ${ct.percent}</div>
                <h1 class="bh-hero-title">Tu es un <em>${ct.name}</em></h1>
                <p class="bh-hero-tagline">${ct.tagline}</p>
            </div>
            <div class="bh-hero-archetype">
                <span class="bh-hero-at-badge">${at.icon} ${at.name}</span>
            </div>
        </div>`;
    }

    function renderSoul(ct, stats) {
        const gifts = ct.gifts || ['Force', 'Clarté', 'Élan'];
        const peakText = `${stats.peakHour}h–${(stats.peakHour + 2) % 24}h`;
        return `
        <div class="bh-card bh-soul" style="--ct-color:${ct.badge}" data-reveal>
            <div class="bh-soul-header">
                <span class="bh-chip">🌟 TON ESSENCE</span>
                <span class="bh-subtitle">${ct.subtitle}</span>
            </div>
            <div class="bh-soul-body">
                <div class="bh-soul-big-icon">${ct.icon}</div>
                <div class="bh-soul-text">
                    <p class="bh-soul-desc">${ct.description}</p>
                    <div class="bh-gifts-row">
                        ${gifts.map(g => `<span class="bh-gift">✦ ${g}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="bh-soul-stats">
                <div class="bh-soul-stat"><span class="bh-soul-stat-val">⚡</span><span>${ct.superpower}</span></div>
                <div class="bh-soul-stat bh-soul-warn"><span class="bh-soul-stat-val">⏰</span><span>${peakText}</span></div>
            </div>
            <div class="bh-soul-advice">💡 ${ct.advice}</div>
        </div>`;
    }

    function renderPowers(ct) {
        const powers = [
            { icon: '⚡', label: 'Superpower', value: ct.superpower, cls: 'bh-power-gold' },
            { icon: '🎯', label: 'Défi créatif', value: ct.kryptonite, cls: 'bh-power-rose' },
            ...(ct.gifts || []).map((g, i) => ({
                icon: ['🌟', '💎', '🔥'][i] || '✨', label: 'Don naturel', value: g, cls: 'bh-power-violet'
            }))
        ];
        return `
        <div class="bh-card bh-powers" data-reveal>
            <div class="bh-chip">⚡ TES SUPER-POUVOIRS</div>
            <div class="bh-powers-grid">
                ${powers.slice(0, 4).map(p => `
                <div class="bh-power-card ${p.cls}">
                    <span class="bh-power-icon">${p.icon}</span>
                    <span class="bh-power-label">${p.label}</span>
                    <span class="bh-power-value">${p.value}</span>
                </div>`).join('')}
            </div>
        </div>`;
    }

    function renderStyle(at) {
        return `
        <div class="bh-card bh-style-card" style="--style-color:${at.color}" data-reveal>
            <span class="bh-chip">🎨 TON STYLE CRÉATIF</span>
            <div class="bh-style-icon">${at.icon}</div>
            <h3 class="bh-style-name" style="color:${at.color}">${at.name}</h3>
            <p class="bh-style-desc">${at.description}</p>
            <div class="bh-traits-row">
                ${at.traits.map(t => `<span class="bh-trait">${t}</span>`).join('')}
            </div>
        </div>`;
    }

    function renderPressure(ps, stats) {
        const color = stats.overdueRate > 30 ? '#EF4444' : '#10B981';
        return `
        <div class="bh-card bh-style-card" style="--style-color:${ps.color}" data-reveal>
            <span class="bh-chip">🌊 FACE À LA PRESSION</span>
            <div class="bh-style-icon">${ps.icon}</div>
            <h3 class="bh-style-name" style="color:${ps.color}">${ps.name}</h3>
            <p class="bh-style-desc">${ps.desc}</p>
            <div class="bh-style-kpi">
                <span class="bh-kpi-val" style="color:${color}">${stats.overdueRate}%</span>
                <span class="bh-kpi-lbl">tâches en retard</span>
                <span class="bh-kpi-val">${stats.completionRate}%</span>
                <span class="bh-kpi-lbl">complétées</span>
            </div>
        </div>`;
    }

    function renderGoldenWindows(windows) {
        if (!windows?.length) return '';
        const medals = ['🥇', '🥈', '🥉'];
        const tips = ['Ton heure de gloire', 'Ton second souffle', 'Ton moment créatif'];
        return `
        <div class="bh-card bh-golden" data-reveal>
            <div class="bh-golden-header">
                <span class="bh-chip">⏰ TES FENÊTRES D'OR</span>
                <span class="bh-subtitle">Tes instants les plus précieux</span>
            </div>
            <div class="bh-golden-grid">
                ${windows.map((w, i) => `
                <div class="bh-golden-card bh-golden-${i + 1}">
                    <div class="bh-golden-medal">${medals[i]}</div>
                    <div class="bh-golden-time">${w.start}h – ${w.end}h</div>
                    <div class="bh-golden-tip">${tips[i]}</div>
                    <div class="bh-golden-name">${w.label}</div>
                    <div class="bh-golden-bar"><div class="bh-golden-fill" style="width:${Math.round(w.intensity * 100)}%"></div></div>
                </div>`).join('')}
            </div>
        </div>`;
    }

    function renderMomentumCard(momentum) {
        const encourage = {
            '🚀': 'Tu es en feu ! Continue sur cette lancée.', '📈': 'Belle progression ! Tu montes.',
            '🎯': 'Rythme parfait. La constance est une maîtrise.', '📉': 'Un peu de douceur. Tu te régénères.',
            '🔋': 'Mode récupération. C\'est sage, pas faible.', '📊': 'Chaque action compte !'
        };
        const barW = Math.min(100, Math.max(5, 50 + momentum.delta));
        return `
        <div class="bh-card bh-momentum-card" data-reveal>
            <span class="bh-chip">📊 MOMENTUM</span>
            <div class="bh-momentum-body">
                <span class="bh-momentum-big">${momentum.icon}</span>
                <div class="bh-momentum-info">
                    <span class="bh-momentum-status" style="color:${momentum.color}">${momentum.label}</span>
                    <span class="bh-momentum-msg">${encourage[momentum.icon] || 'Continue à avancer.'}</span>
                    <span class="bh-momentum-count">${momentum.count7d} actions cette semaine</span>
                </div>
            </div>
            <div class="bh-momentum-track">
                <div class="bh-momentum-fill-bar" style="width:${barW}%;background:${momentum.color}"></div>
            </div>
        </div>`;
    }

    function renderLoveSection(insights) {
        const ct = insights.chronotype;
        const at = insights.archetype;
        const loveNote = at.loveNote || ct.loveNote || 'Tu es unique, et cette unicité est ta force.';
        const quote = ct.quote;
        return `
        <div class="bh-card bh-love" data-reveal>
            <span class="bh-chip bh-chip-love">💝 CE QUE TU MÉRITES DE SAVOIR</span>
            <div class="bh-love-body">
                <div class="bh-love-icon">💌</div>
                <p class="bh-love-note">${loveNote}</p>
                ${quote ? `
                <blockquote class="bh-love-quote">
                    <span class="bh-quote-mark">❝</span>
                    <span class="bh-quote-text">${quote}</span>
                    <cite class="bh-quote-author">— ${ct.quoteAuthor}</cite>
                </blockquote>` : ''}
            </div>
        </div>`;
    }

    function renderSignatureCelebration(signature) {
        return `
        <div class="bh-card bh-sig-card" data-reveal>
            <div class="bh-sig-sparkles">✨ 🌟 💫 ⭐ 🌟 ✨</div>
            <div class="bh-sig-label">TA SIGNATURE UNIQUE AU MONDE</div>
            <div class="bh-sig-code">${signature}</div>
            <div class="bh-sig-note">Il n'existe personne exactement comme toi — cette combinaison est la tienne.</div>
        </div>`;
    }

    function renderClassicCharts(data) {
        const { hourlyActivity, weeklyHeatmap, auditScores, projectEngagement } = data;
        const chartsAvailable = typeof BehavioralCharts !== 'undefined';
        if (!chartsAvailable) return '<p style="padding:1rem;opacity:.5">Graphiques non disponibles</p>';
        return `
        <div class="bh-classic-charts">
            <div class="bh-chart-block">
                <h4 class="bh-chart-title">Rythme horaire</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.activityClock(hourlyActivity || Array(24).fill(0))}</div>
            </div>
            ${weeklyHeatmap ? `<div class="bh-chart-block">
                <h4 class="bh-chart-title">Heatmap hebdomadaire</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.weeklyHeatmap(weeklyHeatmap)}</div>
            </div>` : ''}
            ${auditScores?.length > 1 ? `<div class="bh-chart-block">
                <h4 class="bh-chart-title">Évolution du score</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.evolutionCurve(auditScores)}</div>
            </div>` : ''}
            ${projectEngagement?.length ? `<div class="bh-chart-block">
                <h4 class="bh-chart-title">Engagement par projet</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.projectBars([...projectEngagement].sort((a,b)=>b.score-a.score))}</div>
            </div>` : ''}
        </div>`;
    }

    function toggleDetails(btn) {
        const section = btn.nextElementSibling;
        if (!section) return;
        const visible = section.style.display !== 'none';
        section.style.display = visible ? 'none' : 'block';
        btn.querySelector('.bh-toggle-icon').textContent = visible ? '▼' : '▲';
        btn.querySelector('.bh-toggle-label').textContent = visible ? '📊 Voir les graphiques détaillés' : '📊 Masquer les graphiques';
    }

    function renderMini(container, data) {
        if (!container) return;
        const cr = data?.completion_rate ?? data?.completionRate ?? 0;
        const peak = data?.peakHours?.start ?? 9;
        container.innerHTML = `<div class="bh-mini"><span>${cr}% complété</span><span>Pic: ${peak}h</span></div>`;
    }

    return { renderProfile, renderMini, toggleDetails };
})();

if (typeof window !== 'undefined') window.BehavioralRender = BehavioralRender;
