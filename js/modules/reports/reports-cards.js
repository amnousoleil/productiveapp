/**
 * REPORTS CARDS - ProductiveApp v4.0
 * Rendu des cartes resume
 */

const ReportsCards = (function() {
    'use strict';

    /**
     * Rendre les 4 cartes de resume
     */
    function render(summary, icons) {
        if (!summary) {
            return '<div class="summary-loading">Chargement...</div>';
        }

        const s = summary;

        return `
            <div class="summary-card">
                <div class="summary-icon green">${icons.check}</div>
                <div class="summary-content">
                    <div class="summary-value">${s.tasks_completed || 0}</div>
                    <div class="summary-label">Taches completees</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon blue">${icons.percent}</div>
                <div class="summary-content">
                    <div class="summary-value">${s.completion_rate || 0}%</div>
                    <div class="summary-label">Taux completion</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon orange">${icons.star}</div>
                <div class="summary-content">
                    <div class="summary-value">${s.score || 0}</div>
                    <div class="summary-label">Score productivite</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon red">${icons.flame}</div>
                <div class="summary-content">
                    <div class="summary-value">${s.streak || 0}</div>
                    <div class="summary-label">Jours de streak</div>
                </div>
            </div>
        `;
    }

    /**
     * Rendre dans le container
     */
    function renderTo(containerId, summary, icons) {
        const el = document.getElementById(containerId);
        if (el) {
            el.innerHTML = render(summary, icons);
        }
    }

    return {
        render,
        renderTo
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsCards = ReportsCards;
}
