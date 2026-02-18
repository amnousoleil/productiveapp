/**
 * ================================================
 * VISION MAIN - Giri Vision v3.0
 * Orchestrateur — preload optimisé + init
 * ================================================
 */

const VisionMain = (function () {
    'use strict';

    let _currentView = 'home';

    function init() {
        if (!_checkDeps()) {
            console.warn('⚠️ VisionMain: dépendances manquantes, réessai dans 500ms');
            setTimeout(init, 500);
            return;
        }
        _currentView = 'home';
        // Précharger le moteur vidéo en arrière-plan pour éliminer le délai
        if (typeof VisionJitsi !== 'undefined' && VisionJitsi.preload) {
            VisionJitsi.preload().catch(() => {});
        }
        showHome();
    }

    function _checkDeps() {
        const deps = ['VisionUtils', 'VisionApi', 'VisionJitsi', 'VisionMeeting', 'VisionHome', 'VisionHistory'];
        return deps.every(d => typeof window[d] !== 'undefined');
    }

    function showHome() {
        _currentView = 'home';
        VisionJitsi.dispose();
        VisionHome.render();
    }

    function showHistory() {
        _currentView = 'history';
        VisionHistory.render();
    }

    function getCurrentView() { return _currentView; }

    return { init, showHome, showHistory, getCurrentView };
})();

if (typeof window !== 'undefined') window.VisionMain = VisionMain;
