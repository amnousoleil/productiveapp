/**
 * ================================================
 * VISION MAIN - Giri Vision v1.0
 * Orchestrateur principal du module
 * ================================================
 */

const VisionMain = (function () {
    'use strict';

    let _initialized = false;
    let _currentView = 'home';

    function init() {
        if (!_checkDeps()) {
            console.error('❌ VisionMain: dépendances manquantes');
            return;
        }
        _initialized = true;
        _currentView = 'home';
        showHome();
        console.log('✅ VisionMain: initialized');
    }

    function _checkDeps() {
        const deps = ['VisionUtils', 'VisionApi', 'VisionJitsi', 'VisionMeeting', 'VisionHome', 'VisionHistory'];
        for (const dep of deps) {
            if (typeof window[dep] === 'undefined') {
                console.warn(`⚠️ VisionMain: ${dep} non chargé`);
                return false;
            }
        }
        return true;
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
