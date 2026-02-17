/**
 * Behavioral Render - Profile assembly with insights
 * ProductiveApp v4.0
 */
const BehavioralRender = (function() {
    'use strict';

    function renderProfile(container, data) {
        if (!container || !data) return;

        const html = `
            <div class="bh-profile">
                ${renderRhythm(data)}
                ${renderPatterns(data)}
                ${renderEvolution(data)}
                ${renderProjects(data)}
            </div>
        `;
        container.innerHTML = html;
    }

    function renderRhythm(data) {
        const { peakHours, avgTasksPerDay, hourlyActivity } = data;
        const peakText = peakHours ? `Tu es le plus productif entre <strong>${peakHours.start}h et ${peakHours.end}h</strong>.` : '';
        const avgText = avgTasksPerDay ? `En moyenne, tu termines <strong>${avgTasksPerDay.toFixed(1)} tâches par jour</strong>.` : '';

        return `
            <section class="bh-section bh-section-rhythm">
                <h3 class="bh-section-title">Ton rythme</h3>
                <div class="bh-chart-container">
                    ${BehavioralCharts.activityClock(hourlyActivity || Array(24).fill(0))}
                </div>
                <p class="bh-insight-text">${peakText} ${avgText}</p>
            </section>
        `;
    }

    function renderPatterns(data) {
        const { weeklyHeatmap, completionRate } = data;
        const rateClass = completionRate > 70 ? 'good' : completionRate > 40 ? 'medium' : 'low';
        const rateText = completionRate ? `Ton taux de complétion est de <strong class="bh-highlight-${rateClass}">${completionRate}%</strong>.` : '';

        // Find most/least active days
        let insights = [];
        if (weeklyHeatmap) {
            const daySums = weeklyHeatmap.map(d => d.reduce((a, b) => a + b, 0));
            const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
            const maxDay = days[daySums.indexOf(Math.max(...daySums))];
            const minDay = days[daySums.indexOf(Math.min(...daySums))];
            if (maxDay !== minDay) {
                insights.push(`Le <strong>${maxDay}</strong> est ton jour le plus actif.`);
            }
        }

        return `
            <section class="bh-section bh-section-patterns">
                <h3 class="bh-section-title">Tes patterns</h3>
                <div class="bh-chart-container">
                    ${BehavioralCharts.weeklyHeatmap(weeklyHeatmap || Array(7).fill(Array(24).fill(0)))}
                </div>
                <p class="bh-insight-text">${rateText} ${insights.join(' ')}</p>
            </section>
        `;
    }

    function renderEvolution(data) {
        const { auditScores } = data;
        if (!auditScores || !auditScores.length) return '';

        const recent = auditScores.slice(-7);
        const trend = recent.length > 1 ? recent[recent.length - 1].score - recent[0].score : 0;
        const trendText = trend > 5 ? 'en progression' : trend < -5 ? 'en baisse' : 'stable';
        const trendIcon = trend > 5 ? '📈' : trend < -5 ? '📉' : '➡️';
        const currentScore = Math.round(auditScores[auditScores.length - 1]?.score || 0);

        return `
            <section class="bh-section bh-section-evolution">
                <h3 class="bh-section-title">Ton évolution</h3>
                <div class="bh-chart-container">
                    ${BehavioralCharts.evolutionCurve(auditScores)}
                </div>
                <p class="bh-insight-text">
                    ${trendIcon} Score actuel : <strong>${currentScore}</strong> — tendance <strong>${trendText}</strong> sur les 7 derniers jours.
                </p>
            </section>
        `;
    }

    function renderProjects(data) {
        const { projectEngagement } = data;
        if (!projectEngagement || !projectEngagement.length) return '';

        const sorted = [...projectEngagement].sort((a, b) => b.score - a.score);
        const top = sorted[0];
        const neglected = sorted.filter(p => p.score < 40);

        let insights = [];
        if (top) insights.push(`Tu investis beaucoup dans <strong>${top.name}</strong>.`);
        if (neglected.length) {
            const names = neglected.map(p => p.name).join(', ');
            const lastActive = neglected[0]?.lastActive || 'longtemps';
            insights.push(`<strong>${names}</strong> attend${neglected.length > 1 ? 'ent' : ''} ton attention depuis ${lastActive}.`);
        }

        return `
            <section class="bh-section bh-section-projects">
                <h3 class="bh-section-title">Tes projets</h3>
                <div class="bh-chart-container">
                    ${BehavioralCharts.projectBars(sorted)}
                </div>
                <p class="bh-insight-text">${insights.join(' ')}</p>
            </section>
        `;
    }

    function renderMini(container, data) {
        if (!container || !data) return;
        const { completionRate, peakHours } = data;
        container.innerHTML = `
            <div class="bh-mini">
                <span class="bh-mini-stat">${completionRate || 0}% complété</span>
                <span class="bh-mini-peak">Peak: ${peakHours?.start || 9}h-${peakHours?.end || 11}h</span>
            </div>
        `;
    }

    return { renderProfile, renderMini };
})();

if (typeof window !== 'undefined') window.BehavioralRender = BehavioralRender;
