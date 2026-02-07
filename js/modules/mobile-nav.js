/**
 * MOBILE BOTTOM NAVIGATION - ProductiveApp v5.0
 * Touch-optimized navigation for mobile devices
 */

const MobileNav = (function() {
    'use strict';

    let initialized = false;
    let currentView = 'dashboard';

    const NAV_ITEMS = [
        {
            id: 'dashboard',
            label: 'Accueil',
            icon: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
        },
        {
            id: 'tasks',
            label: 'Tâches',
            icon: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
        },
        {
            id: 'calendar',
            label: 'Agenda',
            icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
        },
        {
            id: 'more',
            label: 'Plus',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>'
        }
    ];

    function createBottomNav() {
        if (document.getElementById('mobile-bottom-nav')) return;

        const nav = document.createElement('nav');
        nav.id = 'mobile-bottom-nav';
        nav.className = 'mobile-bottom-nav';
        nav.innerHTML = `
            <div class="mobile-nav-items">
                ${NAV_ITEMS.map(item => `
                    <button class="mobile-nav-item ${item.id === 'dashboard' ? 'active' : ''}"
                            data-view="${item.id}"
                            onclick="MobileNav.navigate('${item.id}')">
                        ${item.icon}
                        <span>${item.label}</span>
                        <div class="mobile-nav-dot"></div>
                    </button>
                `).join('')}
            </div>
        `;
        document.body.appendChild(nav);
    }

    function createMoreMenu() {
        if (document.getElementById('mobile-more-menu')) return;

        const moreItems = [
            { id: 'projects', label: 'Projets', icon: '📁' },
            { id: 'accounting', label: 'Comptabilité', icon: '💰' },
            { id: 'reports', label: 'Rapports', icon: '📊' },
            { id: 'gamification', label: 'Gamification', icon: '🎮' },
            { id: 'psychoAudit', label: 'Psycho-Audit', icon: '🧠' },
            { id: 'teamMessaging', label: 'TeamTalk', icon: '💬' },
            { id: 'galaxy', label: 'Galaxie', icon: '🌌' },
            { id: 'settings', label: 'Paramètres', icon: '⚙️' },
        ];

        const menu = document.createElement('div');
        menu.id = 'mobile-more-menu';
        menu.className = 'mobile-more-menu';
        menu.innerHTML = `
            <div class="mobile-more-overlay" onclick="MobileNav.closeMore()"></div>
            <div class="mobile-more-sheet">
                <div class="mobile-more-handle"></div>
                <div class="mobile-more-grid">
                    ${moreItems.map(item => `
                        <button class="mobile-more-item" onclick="MobileNav.navigate('${item.id}')">
                            <span class="mobile-more-icon">${item.icon}</span>
                            <span class="mobile-more-label">${item.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(menu);

        injectMoreStyles();
    }

    function navigate(viewId) {
        if (viewId === 'more') {
            toggleMore();
            return;
        }

        closeMore();
        currentView = viewId;

        // Update active state
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        // Navigate
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate(viewId);
        }

        // Close sidebar if open on mobile
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
        const overlay = document.getElementById('sidebar-mobile-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    function toggleMore() {
        const menu = document.getElementById('mobile-more-menu');
        if (menu) menu.classList.toggle('open');
    }

    function closeMore() {
        const menu = document.getElementById('mobile-more-menu');
        if (menu) menu.classList.remove('open');
    }

    function injectMoreStyles() {
        if (document.getElementById('mobile-more-styles')) return;
        const style = document.createElement('style');
        style.id = 'mobile-more-styles';
        style.textContent = `
.mobile-more-menu { display: none; position: fixed; inset: 0; z-index: 10001; }
.mobile-more-menu.open { display: block; }
.mobile-more-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); animation: fadeIn 0.2s; }
.mobile-more-sheet { position: absolute; bottom: 64px; left: 0; right: 0; background: var(--surface, #1e1e2e); border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 12px 16px 20px; transform: translateY(100%); animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards; border-top: 1px solid var(--border, #333); }
.mobile-more-handle { width: 36px; height: 4px; background: var(--border, #444); border-radius: 2px; margin: 0 auto 16px; }
.mobile-more-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.mobile-more-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 4px; background: none; border: none; color: var(--text, #fff); cursor: pointer; border-radius: 12px; transition: background 0.2s; -webkit-tap-highlight-color: transparent; }
.mobile-more-item:active { background: var(--surface-hover, #2a2a3e); }
.mobile-more-icon { font-size: 24px; }
.mobile-more-label { font-size: 11px; color: var(--text-secondary, #888); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .mobile-more-sheet { bottom: calc(64px + env(safe-area-inset-bottom)); }
}
`;
        document.head.appendChild(style);
    }

    // Swipe to navigate between views (optional)
    let touchStartX = 0;
    let touchStartY = 0;

    function setupSwipeGestures() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        mainContent.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        mainContent.addEventListener('touchend', function(e) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;

            // Only horizontal swipes (ignore vertical scroll)
            if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx)) return;

            const mainViews = ['dashboard', 'tasks', 'notes', 'calendar'];
            const idx = mainViews.indexOf(currentView);
            if (idx === -1) return;

            if (dx > 0 && idx > 0) {
                navigate(mainViews[idx - 1]);
            } else if (dx < 0 && idx < mainViews.length - 1) {
                navigate(mainViews[idx + 1]);
            }
        }, { passive: true });
    }

    // Pull-to-refresh
    function setupPullToRefresh() {
        let startY = 0;
        let pulling = false;
        let indicator = null;

        const main = document.querySelector('.main-content');
        if (!main) return;

        main.addEventListener('touchstart', function(e) {
            if (main.scrollTop === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });

        main.addEventListener('touchmove', function(e) {
            if (!pulling) return;
            const dy = e.touches[0].clientY - startY;
            if (dy > 0 && dy < 120) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = 'pull-refresh-indicator';
                    indicator.innerHTML = '<div class="pull-refresh-spinner"></div>';
                    main.insertBefore(indicator, main.firstChild);
                    injectPullStyles();
                }
                indicator.style.height = dy + 'px';
                indicator.style.opacity = Math.min(dy / 80, 1);
                if (dy > 60) {
                    indicator.classList.add('ready');
                }
            }
        }, { passive: true });

        main.addEventListener('touchend', function() {
            if (!pulling || !indicator) { pulling = false; return; }
            if (indicator.classList.contains('ready')) {
                indicator.classList.add('refreshing');
                indicator.style.height = '50px';
                // Trigger refresh
                const event = new CustomEvent('pullrefresh');
                document.dispatchEvent(event);
                setTimeout(function() {
                    if (indicator) {
                        indicator.style.height = '0';
                        indicator.style.opacity = '0';
                        setTimeout(() => { indicator?.remove(); indicator = null; }, 300);
                    }
                }, 1500);
            } else {
                indicator.style.height = '0';
                indicator.style.opacity = '0';
                setTimeout(() => { indicator?.remove(); indicator = null; }, 300);
            }
            pulling = false;
        }, { passive: true });
    }

    function injectPullStyles() {
        if (document.getElementById('pull-refresh-styles')) return;
        const style = document.createElement('style');
        style.id = 'pull-refresh-styles';
        style.textContent = `
.pull-refresh-indicator { display: flex; align-items: center; justify-content: center; overflow: hidden; transition: height 0.3s, opacity 0.3s; height: 0; opacity: 0; }
.pull-refresh-spinner { width: 24px; height: 24px; border: 2px solid var(--border, #333); border-top-color: var(--accent, #8b5cf6); border-radius: 50%; }
.pull-refresh-indicator.ready .pull-refresh-spinner { border-top-color: var(--accent, #22c55e); }
.pull-refresh-indicator.refreshing .pull-refresh-spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;
        document.head.appendChild(style);
    }

    function init() {
        if (initialized) return;
        initialized = true;

        createBottomNav();
        createMoreMenu();

        if (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) {
            setupSwipeGestures();
            setupPullToRefresh();
        }

        // Listen to view changes
        document.addEventListener('viewchange', function(e) {
            currentView = e.detail.view;
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === currentView);
            });
        });

        // Pull-to-refresh handler
        document.addEventListener('pullrefresh', function() {
            if (typeof ViewRouter !== 'undefined') {
                const view = ViewRouter.getCurrentView();
                // Re-initialize current view
                if (typeof ViewRouter.navigate === 'function') {
                    ViewRouter.navigate(view);
                }
            }
        });

        console.log('📱 MobileNav: Initialized');
    }

    return {
        init,
        navigate,
        toggleMore,
        closeMore
    };
})();

if (typeof window !== 'undefined') {
    window.MobileNav = MobileNav;
}
