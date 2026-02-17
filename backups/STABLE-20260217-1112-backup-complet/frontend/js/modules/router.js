/**
 * ================================================
 * VIEW ROUTER - ProductiveApp v3.2
 * Gère la navigation entre les vues
 * ================================================
 */

const ViewRouter = (function() {
    'use strict';

    // View labels (for dynamic page title)
    const VIEW_LABELS = {
        dashboard: 'Tableau de bord',
        tasks: 'Tâches',
        projects: 'Projets',
        notes: 'Notes',
        galaxy: 'Galaxie',
        journal: 'Journal',
        settings: 'Paramètres',
        analytics: 'Analytique',
        reports: 'Rapports',
        accounting: 'Comptabilité',
        psychoAudit: 'Psycho-Audit',
        teamMessaging: 'TeamTalk',
        campaigns: 'Campagnes',
        gamification: 'Gamification',
        behavioral: 'Mon Profil',
        teamVision: 'Vision équipe',
        giriVision: 'Giri Vision',
        calendar: 'Calendrier',
        mail: 'Mail',
        admin: 'Administration'
    };

    // Available views
    const VIEWS = {
        dashboard: 'view-dashboard',
        tasks: 'view-tasks',
        projects: 'view-projects',
        notes: 'view-notes',
        galaxy: 'view-galaxy',
        journal: 'view-journal',
        settings: 'view-settings',
        analytics: 'view-analytics',
        reports: 'view-reports',
        accounting: 'view-accounting',
        psychoAudit: 'view-psycho-audit',
        teamMessaging: 'view-team-messaging',
        campaigns: 'view-campaigns',
        gamification: 'view-gamification',
        behavioral: 'view-behavioral',
        teamVision: 'view-team-vision',
        giriVision: 'view-giri-vision',
        calendar: 'view-calendar',
        mail: 'view-mail'
    };

    let currentView = 'dashboard';
    let previousView = null;

    /**
     * Navigate to a specific view
     */
    function navigate(viewId) {
        // Special handling for admin view (custom rendering)
        if (viewId === 'admin') {
            previousView = currentView;
            currentView = viewId;

            // Hide all views
            document.querySelectorAll('.view-container').forEach(view => {
                view.classList.remove('active');
            });

            // Update sidebar active state
            if (typeof Sidebar !== 'undefined') {
                Sidebar.setActiveItem(viewId);
            }

            // Update page title
            document.title = 'Administration - ProductiveApp';

            // Update URL hash
            history.pushState({ view: viewId }, '', `#${viewId}`);

            // Emit event
            document.dispatchEvent(new CustomEvent('viewchange', {
                detail: { view: viewId, previous: previousView }
            }));

            // Show admin view
            if (typeof AdminView !== 'undefined') {
                AdminView.show();
            }

            return true;
        }

        if (!VIEWS[viewId]) {
            console.warn(`ViewRouter: vue inconnue "${viewId}"`);
            return false;
        }

        previousView = currentView;
        currentView = viewId;

        // Hide all views
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(VIEWS[viewId]);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.warn(`ViewRouter: conteneur ${VIEWS[viewId]} introuvable`);
        }

        // Toggle galaxy-active class on body (hides Pomodoro etc.)
        document.body.classList.toggle('galaxy-active', viewId === 'galaxy');

        // Pause/resume matrix background animation for Galaxy View
        if (window.AnimEngine) {
            window.AnimEngine.setIntensity(viewId === 'galaxy' ? 0 : 45);
        }

        // Update sidebar active state
        if (typeof Sidebar !== 'undefined') {
            Sidebar.setActiveItem(viewId);
            // Auto-collapse sidebar for Galaxy immersion, restore on leave
            if (viewId === 'galaxy') {
                Sidebar.collapse();
            } else if (previousView === 'galaxy') {
                Sidebar.expand();
            }
        }

        // Update page title
        const label = VIEW_LABELS[viewId] || viewId;
        document.title = `${label} - ProductiveApp`;

        // Update URL hash
        history.pushState({ view: viewId }, '', `#${viewId}`);

        // Emit event
        document.dispatchEvent(new CustomEvent('viewchange', {
            detail: { view: viewId, previous: previousView }
        }));

        // Trigger view-specific initialization
        initializeView(viewId);

        return true;
    }

    /**
     * Initialize view-specific content
     */
    async function initializeView(viewId) {
        // LAZY LOADING: Charger les modules requis pour cette vue
        if (typeof LazyLoader !== 'undefined') {
            try {
                await LazyLoader.loadViewModules(viewId);
            } catch (err) {
                console.error(`❌ Failed to load modules for ${viewId}:`, err);
                // Continuer quand même, certains modules peuvent déjà être chargés
            }
        }

        // Pour les vues critiques, préparer le cache d'abord (anti-cache mechanism)
        if (typeof CacheManager !== 'undefined' && CacheManager.shouldForceRefresh(viewId)) {
            CacheManager.prepareView(viewId).then(() => {
                renderViewContent(viewId);
            }).catch(err => {
                console.error('❌ CacheManager prepare failed:', err);
                // Render quand même en cas d'erreur
                renderViewContent(viewId);
            });
        } else {
            // Vues non-critiques : render direct
            renderViewContent(viewId);
        }
    }

    /**
     * Render view content (extracted from initializeView for async wrapper)
     */
    function renderViewContent(viewId) {
        switch (viewId) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.refresh();
                }
                break;
            case 'notes':
                if (typeof NotesModule !== 'undefined') {
                    NotesModule.refresh();
                }
                break;
            case 'projects':
                if (typeof ProjectsView !== 'undefined') {
                    ProjectsView.refresh();
                }
                break;
            case 'settings':
                if (typeof SettingsView !== 'undefined') {
                    SettingsView.refresh();
                }
                break;
            case 'analytics':
                if (typeof AnalyticsView !== 'undefined') {
                    AnalyticsView.refresh();
                }
                break;
            case 'reports':
                if (typeof ReportsView !== 'undefined') {
                    ReportsView.refresh();
                }
                break;
            case 'tasks':
                // Initialize Tasks 2.0 Supreme if available
                if (typeof Tasks2Supreme !== 'undefined') {
                    Tasks2Supreme.init();
                } else {
                    // Fallback to classic tasks
                    if (typeof Tasks !== 'undefined' && Tasks.render) {
                        Tasks.render();
                    }
                }
                break;
            case 'galaxy':
                if (typeof GalaxieView !== 'undefined') {
                    GalaxieView.open();
                }
                break;
            case 'accounting':
                if (typeof AccountingView !== 'undefined') {
                    AccountingView.refresh();
                }
                break;
            case 'psychoAudit':
                if (typeof PsychoAuditView !== 'undefined') {
                    PsychoAuditView.refresh();
                }
                break;
            case 'teamMessaging':
                if (typeof Messaging !== 'undefined') {
                    Messaging.refresh();
                }
                break;
            case 'campaigns':
                if (typeof CampaignsModule !== 'undefined') {
                    CampaignsModule.show();
                }
                break;
            case 'gamification':
                if (typeof GamificationView !== 'undefined') {
                    GamificationView.refresh();
                }
                break;
            case 'behavioral':
                if (typeof BehavioralView !== 'undefined') {
                    BehavioralView.render();
                }
                break;
            case 'teamVision':
                if (typeof TeamVisionView !== 'undefined') {
                    TeamVisionView.refresh();
                }
                break;
            case 'giriVision':
                if (typeof GiriVisionView !== 'undefined') {
                    GiriVisionView.refresh();
                }
                break;
            case 'calendar':
                if (typeof CalendarView !== 'undefined') {
                    CalendarView.refresh();
                }
                break;
            case 'mail':
                if (typeof MailView !== 'undefined') {
                    MailView.init();
                }
                break;
        }
    }

    /**
     * Go back to previous view
     */
    function back() {
        if (previousView) {
            navigate(previousView);
        }
    }

    /**
     * Get current view
     */
    function getCurrentView() {
        return currentView;
    }

    /**
     * Handle browser back/forward
     */
    function handlePopState(e) {
        if (e.state && e.state.view) {
            navigate(e.state.view);
        }
    }

    /**
     * Initialize router
     */
    function init() {
        console.log('🧭 ViewRouter: Initializing...');

        // Handle browser navigation
        window.addEventListener('popstate', handlePopState);

        // Check URL hash on load
        const hash = window.location.hash.slice(1);
        if (hash && VIEWS[hash]) {
            currentView = hash;
        }

        // Show initial view
        navigate(currentView);

        console.log('✅ ViewRouter: Ready');
    }

    return {
        init,
        navigate,
        back,
        getCurrentView,
        VIEWS
    };
})();

if (typeof window !== 'undefined') {
    window.ViewRouter = ViewRouter;
    window.Router = ViewRouter; // Alias for convenience
}
