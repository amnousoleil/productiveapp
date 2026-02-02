/**
 * REPORTS VIEW - ProductiveApp v4.0
 * Page des rapports (Coming Soon)
 */

const ReportsView = (function() {
    'use strict';

    const icons = {
        file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    };

    /**
     * Render reports page
     */
    function render() {
        const container = document.getElementById('view-reports');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.file}</span>
                    Rapports
                </h1>
            </div>

            <div class="coming-soon-page">
                <div class="coming-soon-icon">
                    ${icons.file}
                </div>
                <h2>Bientôt disponible</h2>
                <p>La génération de rapports arrive prochainement avec :</p>
                <ul class="coming-soon-features">
                    <li>${icons.file} Rapports hebdomadaires automatiques</li>
                    <li>${icons.download} Export PDF et Excel</li>
                    <li>${icons.calendar} Rapports par période personnalisée</li>
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
        console.log('📄 ReportsView: Ready');
    }

    return { init, render, refresh };
})();

if (typeof window !== 'undefined') {
    window.ReportsView = ReportsView;
}
