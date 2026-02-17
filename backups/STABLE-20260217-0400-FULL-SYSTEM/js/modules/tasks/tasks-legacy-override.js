/**
 * TASKS LEGACY OVERRIDE
 * Force Tasks 2.0 Supreme à remplacer l'ancien système
 */

(function() {
    'use strict';

    console.log('🔄 Tasks Legacy Override: Starting...');

    // Hook sur le changement de view
    document.addEventListener('viewchange', (e) => {
        if (e.detail && e.detail.view === 'tasks') {
            console.log('📋 Tasks view requested - loading Tasks 2.0 Supreme...');

            setTimeout(() => {
                if (typeof Tasks2Supreme !== 'undefined') {
                    console.log('✅ Tasks2Supreme found - initializing...');
                    Tasks2Supreme.init();
                } else {
                    console.warn('⚠️ Tasks2Supreme not loaded yet');
                }
            }, 300); // Délai pour laisser les modules charger
        }
    });

    // Hook aussi sur DOMContentLoaded au cas où la vue tasks est la première
    window.addEventListener('appReady', () => {
        // Si on est déjà sur la vue tasks (par défaut au login)
        setTimeout(() => {
            const tasksView = document.getElementById('view-tasks');
            if (tasksView && tasksView.classList.contains('active')) {
                console.log('📋 Tasks view is active on load - forcing Tasks 2.0 Supreme...');
                if (typeof Tasks2Supreme !== 'undefined') {
                    Tasks2Supreme.init();
                }
            }
        }, 500);
    });

    console.log('✅ Tasks Legacy Override: Ready');
})();
