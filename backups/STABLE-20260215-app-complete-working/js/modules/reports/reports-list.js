/**
 * REPORTS LIST - ProductiveApp v4.0
 * Rendu de la liste des rapports
 */

const ReportsList = (function() {
    'use strict';

    const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

    function formatDate(date) {
        return date.getDate() + ' ' + MONTHS_FR[date.getMonth()].substring(0, 3);
    }

    function getScoreClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-low';
    }

    function getPeriodTypeLabel(type) {
        switch (type) {
            case 'week': return 'Semaine';
            case 'month': return 'Mois';
            case 'year': return 'Annee';
            default: return type;
        }
    }

    /**
     * Rendre la liste des rapports
     */
    function render(reports, icons) {
        if (!reports || reports.length === 0) {
            return `
                <div class="empty-state">
                    ${icons.file}
                    <p>Aucun rapport pour cette periode</p>
                    <p style="font-size: 13px; margin-top: 8px;">Cliquez sur "Generer le rapport" pour en creer un</p>
                </div>
            `;
        }

        return reports.map(function(report) {
            var metrics = report.metrics || {};
            var score = metrics.score || 0;
            var scoreClass = getScoreClass(score);
            var periodStart = new Date(report.period_start);
            var periodEnd = new Date(report.period_end);

            return `
                <div class="report-item" data-report-id="${report.id}">
                    <div class="report-item-left">
                        <div class="report-date">
                            <span class="report-date-main">${formatDate(periodStart)} - ${formatDate(periodEnd)}</span>
                            <span class="report-date-sub">${getPeriodTypeLabel(report.period_type)}</span>
                        </div>
                        <span class="report-score-badge ${scoreClass}">${score}/100</span>
                    </div>
                    <div class="report-stats">
                        <span class="report-stat">${icons.check} ${metrics.tasks?.completed || 0} taches</span>
                        <span class="report-stat">${icons.percent} ${metrics.tasks?.completion_rate || 0}%</span>
                        <span class="report-stat">${icons.flame} ${metrics.gamification?.current_streak || 0}j</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rendre dans le container et attacher les events
     */
    function renderTo(containerId, reports, icons, onItemClick) {
        var el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = render(reports, icons);

        // Attacher les events de clic
        el.querySelectorAll('.report-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var reportId = item.dataset.reportId;
                var report = reports.find(function(r) { return r.id === reportId; });
                if (report && onItemClick) {
                    onItemClick(report);
                }
            });
        });
    }

    return {
        render,
        renderTo,
        formatDate,
        getScoreClass,
        getPeriodTypeLabel
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsList = ReportsList;
}
