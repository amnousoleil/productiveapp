/**
 * ================================================
 * VIEW ROUTER - ProductiveApp v3.2
 * Gère la navigation entre les vues
 * ================================================
 */

const ViewRouter = (function() {
    'use strict';

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
        reports: 'view-reports'
    };

    let currentView = 'dashboard';
    let previousView = null;

    /**
     * Navigate to a specific view
     */
    function navigate(viewId) {
        if (!VIEWS[viewId]) {
            console.warn(`ViewRouter: Unknown view "${viewId}"`);
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
        }

        // Update sidebar active state
        if (typeof Sidebar !== 'undefined') {
            Sidebar.setActiveItem(viewId);
        }

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
    function initializeView(viewId) {
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
                // Tasks are already rendered by the existing system
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
