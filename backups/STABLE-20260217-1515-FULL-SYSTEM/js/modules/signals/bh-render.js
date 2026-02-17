/**
 * Behavioral Render v2.0 — Portrait psychologique profond
 * ProductiveApp v5.0
 */
const BehavioralRender = (function() {
    'use strict';

    function renderProfile(container, data) {
        if (!container) return;

        if (!data || (!data.hourlyActivity && !data.completion_rate && !data.completionRate)) {
            container.innerHTML = '<div class="bh-empty">Aucune donnée disponible. Commence à utiliser l\'app pour générer ton profil.</div>';
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
            <div class="bh-profile-v2">
                ${renderChronotype(insights.chronotype, insights.stats)}
                <div class="bh-dual-row">
                    ${renderArchetype(insights.archetype, insights.stats)}
                    ${renderPressure(insights.pressureStyle, insights.stats)}
                </div>
                ${renderWindows(insights.windows)}
                ${renderMomentum(insights.momentum)}
                ${renderSignature(insights.signature)}
                <div class="bh-details-toggle" onclick="BehavioralRender.toggleDetails(this)">
                    <span class="bh-toggle-label">Vue détaillée</span>
                    <span class="bh-toggle-icon">▼</span>
                </div>
                <div class="bh-details-section" style="display:none">
                    ${renderClassicCharts(data)}
                </div>
            </div>
        `;

        // Animations d'entrée
        requestAnimationFrame(() => {
            container.querySelectorAll('[data-reveal]').forEach((el, i) => {
                el.style.animationDelay = `${i * 80}ms`;
                el.classList.add('bh-reveal');
            });
        });
    }

    function renderChronotype(ct, stats) {
        const peakText = stats.peakHour !== undefined ? `${stats.peakHour}h–${(stats.peakHour + 2) % 24}h` : '?';
        return `
        <div class="bh-card bh-chronotype" style="--ct-color: ${ct.badge}" data-reveal>
            <div class="bh-chronotype-header">
                <div class="bh-chronotype-icon">${ct.icon}</div>
                <div class="bh-chronotype-meta">
                    <div class="bh-label-row">
                        <span class="bh-module-label">CHRONOTYPE</span>
                        <span class="bh-badge" style="background: ${ct.badge}20; color: ${ct.badge}; border-color: ${ct.badge}40">${ct.percent}</span>
                    </div>
                    <h2 class="bh-chronotype-name">${ct.name}</h2>
                    <p class="bh-chronotype-tagline">${ct.tagline}</p>
                </div>
            </div>
            <p class="bh-chronotype-desc">${ct.description}</p>
            <div class="bh-chronotype-stats">
                <div class="bh-stat-pill">
                    <span class="bh-stat-icon">⚡</span>
                    <span class="bh-stat-label">Superpower</span>
                    <span class="bh-stat-value">${ct.superpower}</span>
                </div>
                <div class="bh-stat-pill bh-stat-warning">
                    <span class="bh-stat-icon">🎯</span>
                    <span class="bh-stat-label">Point faible</span>
                    <span class="bh-stat-value">${ct.kryptonite}</span>
                </div>
                <div class="bh-stat-pill">
                    <span class="bh-stat-icon">⏰</span>
                    <span class="bh-stat-label">Ton pic naturel</span>
                    <span class="bh-stat-value">${peakText}</span>
                </div>
            </div>
            <div class="bh-chronotype-advice">
                <span class="bh-advice-icon">💡</span>
                <span>${ct.advice}</span>
            </div>
        </div>`;
    }

    function renderArchetype(at, stats) {
        const burstLabel = stats.burstIndex >= 4 ? 'Très burst' : stats.burstIndex >= 2.5 ? 'Burst modéré' : 'Régulier';
        return `
        <div class="bh-card bh-dual-card" style="--at-color: ${at.color}" data-reveal>
            <div class="bh-dual-header">
                <span class="bh-module-label">ARCHÉTYPE</span>
                <span class="bh-dual-icon">${at.icon}</span>
            </div>
            <h3 class="bh-dual-name" style="color: ${at.color}">${at.name}</h3>
            <p class="bh-dual-desc">${at.description}</p>
            <div class="bh-trait-list">
                ${at.traits.map(t => `<span class="bh-trait">${t}</span>`).join('')}
            </div>
            <div class="bh-dual-stats">
                <div class="bh-mini-stat">
                    <span class="bh-mini-stat-val">${stats.completionRate}%</span>
                    <span class="bh-mini-stat-lbl">Complétion</span>
                </div>
                <div class="bh-mini-stat">
                    <span class="bh-mini-stat-val">${burstLabel}</span>
                    <span class="bh-mini-stat-lbl">Intensité</span>
                </div>
            </div>
        </div>`;
    }

    function renderPressure(ps, stats) {
        return `
        <div class="bh-card bh-dual-card" style="--at-color: ${ps.color}" data-reveal>
            <div class="bh-dual-header">
                <span class="bh-module-label">FACE À LA PRESSION</span>
                <span class="bh-dual-icon">${ps.icon}</span>
            </div>
            <h3 class="bh-dual-name" style="color: ${ps.color}">${ps.name}</h3>
            <p class="bh-dual-desc">${ps.desc}</p>
            <div class="bh-dual-stats">
                <div class="bh-mini-stat">
                    <span class="bh-mini-stat-val" style="color: ${stats.overdueRate > 30 ? '#EF4444' : '#10B981'}">${stats.overdueRate}%</span>
                    <span class="bh-mini-stat-lbl">Tâches en retard</span>
                </div>
                <div class="bh-mini-stat">
                    <span class="bh-mini-stat-val">${stats.completionRate}%</span>
                    <span class="bh-mini-stat-lbl">Taux finalisé</span>
                </div>
            </div>
        </div>`;
    }

    function renderWindows(windows) {
        if (!windows || windows.length === 0) return '';

        const icons = ['🥇', '🥈', '🥉'];
        const windowCards = windows.map((w, i) => {
            const intensity = Math.round(w.intensity * 100);
            return `
            <div class="bh-window-card" data-reveal>
                <div class="bh-window-rank">${icons[i]}</div>
                <div class="bh-window-time">${w.start}h–${w.end}h</div>
                <div class="bh-window-label">${w.label}</div>
                <div class="bh-window-bar">
                    <div class="bh-window-fill" style="width: ${intensity}%; background: var(--primary)"></div>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="bh-card bh-windows" data-reveal>
            <div class="bh-card-header">
                <span class="bh-module-label">FENÊTRES D'EXCELLENCE</span>
                <span class="bh-card-subtitle">Tes 3 meilleures plages horaires</span>
            </div>
            <div class="bh-window-grid">
                ${windowCards}
            </div>
        </div>`;
    }

    function renderMomentum(momentum) {
        const barWidth = Math.min(100, Math.max(5, 50 + momentum.delta));
        return `
        <div class="bh-card bh-momentum" data-reveal>
            <div class="bh-card-header">
                <span class="bh-module-label">MOMENTUM CETTE SEMAINE</span>
            </div>
            <div class="bh-momentum-body">
                <span class="bh-momentum-icon">${momentum.icon}</span>
                <div class="bh-momentum-info">
                    <span class="bh-momentum-label" style="color: ${momentum.color}">${momentum.label}</span>
                    ${momentum.delta !== 0 ? `<span class="bh-momentum-delta">${momentum.delta > 0 ? '+' : ''}${momentum.delta}% vs moyenne</span>` : ''}
                    <span class="bh-momentum-count">${momentum.count7d} actions cette semaine</span>
                </div>
            </div>
            <div class="bh-momentum-bar">
                <div class="bh-momentum-fill" style="width: ${barWidth}%; background: ${momentum.color}"></div>
            </div>
        </div>`;
    }

    function renderSignature(signature) {
        return `
        <div class="bh-card bh-signature" data-reveal>
            <div class="bh-signature-label">TA SIGNATURE COMPORTEMENTALE</div>
            <div class="bh-signature-code">${signature}</div>
            <div class="bh-signature-note">Unique à toi — mise à jour à chaque connexion</div>
        </div>`;
    }

    function renderClassicCharts(data) {
        const { hourlyActivity, weeklyHeatmap, auditScores, projectEngagement } = data;

        return `
        <div class="bh-classic-charts">
            <div class="bh-chart-block">
                <h4 class="bh-chart-title">Rythme horaire</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.activityClock(hourlyActivity || Array(24).fill(0))}</div>
            </div>
            ${weeklyHeatmap ? `
            <div class="bh-chart-block">
                <h4 class="bh-chart-title">Heatmap hebdomadaire</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.weeklyHeatmap(weeklyHeatmap)}</div>
            </div>` : ''}
            ${auditScores && auditScores.length > 1 ? `
            <div class="bh-chart-block">
                <h4 class="bh-chart-title">Évolution du score</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.evolutionCurve(auditScores)}</div>
            </div>` : ''}
            ${projectEngagement && projectEngagement.length ? `
            <div class="bh-chart-block">
                <h4 class="bh-chart-title">Engagement par projet</h4>
                <div class="bh-chart-wrap">${BehavioralCharts.projectBars([...projectEngagement].sort((a, b) => b.score - a.score))}</div>
            </div>` : ''}
        </div>`;
    }

    function toggleDetails(btn) {
        const section = btn.nextElementSibling;
        if (!section) return;
        const visible = section.style.display !== 'none';
        section.style.display = visible ? 'none' : 'block';
        btn.querySelector('.bh-toggle-icon').textContent = visible ? '▼' : '▲';
        btn.querySelector('.bh-toggle-label').textContent = visible ? 'Vue détaillée' : 'Masquer';
    }

    function renderMini(container, data) {
        if (!container) return;
        const cr = data?.completion_rate ?? data?.completionRate ?? 0;
        const peak = data?.peakHours?.start ?? 9;
        container.innerHTML = `
            <div class="bh-mini">
                <span class="bh-mini-stat">${cr}% complété</span>
                <span class="bh-mini-peak">Peak: ${peak}h</span>
            </div>`;
    }

    return { renderProfile, renderMini, toggleDetails };
})();

if (typeof window !== 'undefined') window.BehavioralRender = BehavioralRender;
