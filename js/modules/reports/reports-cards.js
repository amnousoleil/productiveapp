/**
 * REPORTS CARDS PREMIUM - ProductiveApp
 * 6 KPI Cards avec sparklines, tendances, mini gauges, animations
 */

const ReportsCards = (function() {
    'use strict';

    function render(summary, icons) {
        if (!summary) {
            return '<div class="kpi-grid"><div class="summary-loading">Chargement...</div></div>';
        }

        var s = summary;
        var tasksData = typeof ReportsData !== 'undefined' ? ReportsData.getTasksCompleted(7) : { current: s.tasks_completed || 0, previous: 0, trend: 'flat', diff: 0 };
        var completionData = typeof ReportsData !== 'undefined' ? ReportsData.getCompletionRate(7) : { current: s.completion_rate || 0, previous: 0, trend: 'flat', diff: 0 };
        var velocityData = typeof ReportsData !== 'undefined' ? ReportsData.getTeamVelocity(7) : { current: s.tasks_per_day || 0, previous: 0, trend: 'flat', diff: 0 };
        var activeProjects = typeof ReportsData !== 'undefined' ? ReportsData.getActiveProjects() : { count: 0, projects: [] };
        var streak = typeof ReportsData !== 'undefined' ? ReportsData.getStreak() : (s.streak || 0);
        var score = s.score || (typeof ReportsData !== 'undefined' ? ReportsData.getGlobalScore() : 0);

        return '<div class="kpi-grid">' +
            // Card 1: Tasks Completed
            kpiCard({
                icon: icons.check,
                iconClass: 'kpi-icon-green',
                value: s.tasks_completed || tasksData.current,
                label: 'Taches completees',
                trend: tasksData.trend,
                trendValue: tasksData.diff,
                sparklineId: 'sparkline-tasks',
                gradient: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))'
            }) +
            // Card 2: Completion Rate
            kpiCard({
                icon: icons.percent,
                iconClass: 'kpi-icon-blue',
                value: s.completion_rate || completionData.current,
                suffix: '%',
                label: 'Taux completion',
                trend: completionData.trend,
                trendValue: completionData.diff,
                trendSuffix: '%',
                gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))'
            }) +
            // Card 3: Productivity Score
            kpiCard({
                icon: icons.star,
                iconClass: 'kpi-icon-orange',
                value: score,
                suffix: '/100',
                label: 'Score productivite',
                miniGaugeId: 'mini-gauge-score',
                miniGaugeValue: score,
                gradient: 'linear-gradient(135deg, rgba(224,120,64,0.1), rgba(224,120,64,0.02))'
            }) +
            // Card 4: Streak
            kpiCard({
                icon: icons.flame,
                iconClass: 'kpi-icon-red kpi-icon-fire',
                value: streak,
                suffix: 'j',
                label: 'Streak actuel',
                gradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))'
            }) +
            // Card 5: Active Projects
            kpiCard({
                icon: icons.target,
                iconClass: 'kpi-icon-purple',
                value: activeProjects.count,
                label: 'Projets actifs',
                miniRingsId: 'mini-project-rings',
                miniRingsData: activeProjects.projects.slice(0, 4),
                gradient: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))'
            }) +
            // Card 6: Team Velocity
            kpiCard({
                icon: icons.chart,
                iconClass: 'kpi-icon-cyan',
                value: velocityData.current,
                suffix: '/j',
                decimals: 1,
                label: 'Velocite equipe',
                trend: velocityData.trend,
                trendValue: velocityData.diff,
                trendSuffix: '/j',
                gradient: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.02))'
            }) +
            '</div>';
    }

    function kpiCard(opts) {
        var trendHtml = '';
        if (opts.trend && opts.trend !== 'flat') {
            var trendClass = opts.trend === 'up' ? 'trend-up' : 'trend-down';
            var arrow = opts.trend === 'up' ? '\u25B2' : '\u25BC';
            var sign = opts.trendValue > 0 ? '+' : '';
            var tv = opts.decimals ? opts.trendValue.toFixed(1) : opts.trendValue;
            trendHtml = '<div class="kpi-trend ' + trendClass + '">' + arrow + ' ' + sign + tv + (opts.trendSuffix || '') + '</div>';
        }

        var extraHtml = '';
        if (opts.sparklineId) {
            extraHtml = '<div class="kpi-sparkline" id="' + opts.sparklineId + '"></div>';
        }
        if (opts.miniGaugeId) {
            extraHtml = '<div class="kpi-mini-gauge" id="' + opts.miniGaugeId + '"></div>';
        }
        if (opts.miniRingsId) {
            extraHtml = '<div class="kpi-mini-rings" id="' + opts.miniRingsId + '"></div>';
        }

        var valStr = opts.decimals ? parseFloat(opts.value || 0).toFixed(opts.decimals) : (opts.value || 0);

        return '<div class="kpi-card entrance-fade" style="background:' + opts.gradient + '">' +
            '<div class="kpi-header">' +
                '<div class="kpi-icon ' + opts.iconClass + '">' + opts.icon + '</div>' +
                trendHtml +
            '</div>' +
            '<div class="kpi-body">' +
                '<div class="kpi-value" data-target="' + valStr + '" data-suffix="' + (opts.suffix || '') + '" data-decimals="' + (opts.decimals || 0) + '">' + valStr + (opts.suffix || '') + '</div>' +
                '<div class="kpi-label">' + opts.label + '</div>' +
            '</div>' +
            extraHtml +
            '</div>';
    }

    function renderTo(containerId, summary, icons) {
        var el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = render(summary, icons);

        // Animate counters
        if (typeof ReportsAnimations !== 'undefined') {
            ReportsAnimations.animateKPIs(el);
        }

        // Render sparkline
        if (typeof ReportsAnimations !== 'undefined' && typeof ReportsData !== 'undefined') {
            var sparkEl = document.getElementById('sparkline-tasks');
            if (sparkEl) {
                var sparkData = ReportsData.getDailyCompletionSeries(14);
                ReportsAnimations.renderSparkline(sparkEl, sparkData, { color: '#22c55e', width: 100, height: 28 });
            }
        }

        // Render mini gauge
        if (typeof ReportsAnimations !== 'undefined') {
            var gaugeEl = document.getElementById('mini-gauge-score');
            if (gaugeEl) {
                var score = summary ? (summary.score || 0) : 0;
                if (typeof ReportsData !== 'undefined' && !summary.score) score = ReportsData.getGlobalScore();
                ReportsAnimations.renderProgressRing(gaugeEl, score, { size: 40, strokeWidth: 3, color: '#e07840' });
            }
        }

        // Render mini project rings
        if (typeof ReportsAnimations !== 'undefined' && typeof ReportsData !== 'undefined') {
            var ringsEl = document.getElementById('mini-project-rings');
            if (ringsEl) {
                var projects = ReportsData.getActiveProjects().projects.slice(0, 4);
                if (projects.length === 0) {
                    ringsEl.innerHTML = '<span style="font-size:0.7rem;color:var(--text-muted)">-</span>';
                } else {
                    ringsEl.innerHTML = projects.map(function(p) {
                        return '<div class="mini-ring-item" title="' + (p.name || '') + ': ' + p.progress + '%">' +
                            '<div class="mini-ring-svg" data-progress="' + p.progress + '" data-color="' + (p.color || 'var(--accent)') + '"></div>' +
                            '</div>';
                    }).join('');
                    ringsEl.querySelectorAll('.mini-ring-svg').forEach(function(ringEl) {
                        ReportsAnimations.renderProgressRing(ringEl, parseInt(ringEl.dataset.progress) || 0, {
                            size: 26,
                            strokeWidth: 3,
                            color: ringEl.dataset.color
                        });
                    });
                }
            }
        }

        // Staggered entrance
        if (typeof ReportsAnimations !== 'undefined') {
            ReportsAnimations.observeEntrance('.kpi-card', { staggerDelay: 80 });
        }
    }

    return { render: render, renderTo: renderTo };
})();

if (typeof window !== 'undefined') {
    window.ReportsCards = ReportsCards;
}
