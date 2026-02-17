/**
 * MOBILE BOTTOM NAV - ProductiveApp v4.0
 * Navigation mobile fixe en bas
 */
const MobileNav = (function() {
    'use strict';

    var navItems = [
        { id: 'dashboard', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>', label: 'Accueil' },
        { id: 'tasks', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', label: 'Taches' },
        { id: 'notes', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', label: 'Notes' },
        { id: 'accounting', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', label: 'Compta' },
        { id: 'more', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>', label: 'Plus' }
    ];

    var moreItems = [
        { id: 'projects', label: 'Projets', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' },
        { id: 'calendar', label: 'Calendrier', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { id: 'clients', label: 'Clients', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
        { id: 'reports', label: 'Rapports', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
        { id: 'settings', label: 'Parametres', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
        { id: 'gamification', label: 'Gamification', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' }
    ];

    var moreOpen = false;

    function init() {
        if (window.innerWidth > 768) return;
        createNav();
        document.addEventListener('viewchange', updateActive);
    }

    function createNav() {
        if (document.getElementById('mobile-bottom-nav')) return;
        var nav = document.createElement('nav');
        nav.id = 'mobile-bottom-nav';
        nav.className = 'mobile-bottom-nav';

        var html = '';
        navItems.forEach(function(item) {
            html += '<button class="mob-nav-item' + (item.id === 'dashboard' ? ' active' : '') + '" data-view="' + item.id + '" onclick="MobileNav.navigate(\'' + item.id + '\')">' +
                '<span class="mob-nav-icon">' + item.icon + '</span>' +
                '<span class="mob-nav-label">' + item.label + '</span>' +
            '</button>';
        });
        nav.innerHTML = html;

        // Menu "Plus"
        var moreMenu = document.createElement('div');
        moreMenu.id = 'mobile-more-menu';
        moreMenu.className = 'mobile-more-menu';
        var moreHtml = '<div class="mobile-more-grid">';
        moreItems.forEach(function(item) {
            moreHtml += '<button class="mobile-more-item" onclick="MobileNav.navigateMore(\'' + item.id + '\')">' +
                '<span class="mobile-more-icon">' + item.icon + '</span>' +
                '<span class="mobile-more-label">' + item.label + '</span>' +
            '</button>';
        });
        moreHtml += '</div>';
        moreMenu.innerHTML = moreHtml;

        document.body.appendChild(moreMenu);
        document.body.appendChild(nav);

        // Ajouter padding-bottom au main-content
        var main = document.querySelector('.main-content');
        if (main) main.style.paddingBottom = '70px';
    }

    function navigate(viewId) {
        if (viewId === 'more') {
            toggleMore();
            return;
        }
        closeMore();
        if (typeof ViewRouter !== 'undefined') ViewRouter.navigate(viewId);
        updateActive();
    }

    function navigateMore(viewId) {
        closeMore();
        if (typeof ViewRouter !== 'undefined') ViewRouter.navigate(viewId);
        updateActive();
    }

    function toggleMore() {
        moreOpen = !moreOpen;
        var menu = document.getElementById('mobile-more-menu');
        if (menu) menu.classList.toggle('show', moreOpen);
    }

    function closeMore() {
        moreOpen = false;
        var menu = document.getElementById('mobile-more-menu');
        if (menu) menu.classList.remove('show');
    }

    function updateActive() {
        var current = (typeof ViewRouter !== 'undefined') ? ViewRouter.getCurrentView() : 'dashboard';
        document.querySelectorAll('.mob-nav-item').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.view === current);
        });
    }

    // Re-init si resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.getElementById('mobile-bottom-nav')) {
            createNav();
        }
    });

    return { init: init, navigate: navigate, navigateMore: navigateMore };
})();

if (typeof window !== 'undefined') window.MobileNav = MobileNav;
