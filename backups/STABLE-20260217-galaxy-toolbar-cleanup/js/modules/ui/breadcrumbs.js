/**
 * BREADCRUMBS - ProductiveApp v4.0
 * Fil d'ariane contextuel
 */
const Breadcrumbs = (function() {
    'use strict';

    const VIEW_NAMES = {
        dashboard: 'Tableau de bord',
        tasks: 'Taches',
        projects: 'Projets',
        notes: 'Notes',
        galaxy: 'Galaxie',
        journal: 'Journal',
        settings: 'Parametres',
        analytics: 'Analytique',
        reports: 'Rapports',
        accounting: 'Comptabilite',
        psychoAudit: 'Psycho-Audit',
        teamMessaging: 'TeamTalk',
        campaigns: 'Campagnes',
        gamification: 'Gamification',
        behavioral: 'Mon Profil',
        teamVision: 'Vision equipe',
        giriVision: 'Giri Vision',
        calendar: 'Calendrier',
        clients: 'Clients'
    };

    const VIEW_ICONS = {
        dashboard: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
        tasks: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        notes: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        accounting: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    };

    let container = null;

    function init() {
        document.addEventListener('viewchange', function(e) {
            render(e.detail.view);
        });
    }

    function render(viewId) {
        // Trouver ou creer le container
        if (!container) {
            container = document.createElement('div');
            container.className = 'breadcrumbs';
            container.id = 'app-breadcrumbs';
        }
        // Inserer apres le premier header trouve dans la vue active
        var activeView = document.querySelector('.view-container.active');
        if (activeView) {
            var header = activeView.querySelector('.view-header');
            if (header && header.parentNode === activeView) {
                if (header.nextSibling !== container) {
                    header.after(container);
                }
            } else {
                if (activeView.firstChild !== container) {
                    activeView.prepend(container);
                }
            }
        }

        var name = VIEW_NAMES[viewId] || viewId;
        var icon = VIEW_ICONS[viewId] || VIEW_ICONS.dashboard;

        container.innerHTML =
            '<a class="breadcrumb-item breadcrumb-home" onclick="ViewRouter.navigate(\'dashboard\')">' +
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
            '</a>' +
            '<span class="breadcrumb-sep"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></span>' +
            '<span class="breadcrumb-item breadcrumb-current">' + icon + ' ' + name + '</span>';
    }

    return { init: init, render: render };
})();

if (typeof window !== 'undefined') window.Breadcrumbs = Breadcrumbs;
