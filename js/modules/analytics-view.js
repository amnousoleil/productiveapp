/**
 * ANALYTICS VIEW - ProductiveApp v4.0
 * Page d'analytics (Coming Soon)
 */

const AnalyticsView = (function() {
    'use strict';

    const icons = {
        chart: '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        trend: '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        pie: '<svg viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>'
    };

    /**
     * Render analytics page
     */
    function render() {
        const container = document.getElementById('view-analytics');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.chart}</span>
                    Analytics
                </h1>
            </div>

            <div class="coming-soon-page">
                <div class="coming-soon-icon">
                    ${icons.trend}
                </div>
                <h2>Bientôt disponible</h2>
                <p>Les analytics arrivent prochainement avec :</p>
                <ul class="coming-soon-features">
                    <li>${icons.chart} Graphiques de productivité</li>
                    <li>${icons.pie} Répartition des tâches par projet</li>
                    <li>${icons.trend} Tendances sur la durée</li>
                </ul>
                <button class="btn btn-primary" onclick="Router.navigate('dashboard')">
                    Retour au Dashboard
                </button>
            </div>
        `;
    }

    function refresh() {
        render();
    }

    function init() {
        console.log('📊 AnalyticsView: Ready');
    }

    return { init, render, refresh };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsView = AnalyticsView;
}
