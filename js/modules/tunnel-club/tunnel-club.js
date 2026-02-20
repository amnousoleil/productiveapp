/**
 * ================================================
 * TUNNEL CLUB v1.0 — Module Principal
 * Orchestrateur de l'interface Giri Tunnel Club
 * ================================================
 */

const TunnelClub = (function() {
    'use strict';

    let initialized = false;
    let container = null;

    // ──────────────────────────────────────────
    // INITIALISATION
    // ──────────────────────────────────────────

    function init() {
        if (initialized) {
            refresh();
            return;
        }
        initialized = true;
        console.log('⚡ TunnelClub: Initializing...');
        _ensureContainer();
        render();
    }

    function _ensureContainer() {
        container = document.getElementById('view-tunnel-club');
        if (!container) {
            console.warn('TunnelClub: container #view-tunnel-club not found');
        }
    }

    // ──────────────────────────────────────────
    // RENDU
    // ──────────────────────────────────────────

    async function render() {
        if (!container) _ensureContainer();
        if (!container) return;

        // Onboarding wizard : vérifie si l'utilisateur a un tenant
        if (typeof TunnelClubOnboarding !== 'undefined') {
            await TunnelClubOnboarding.show(container);
            return;
        }

        // Fallback : déléguer au module liste (dashboard principal)
        if (typeof TunnelList !== 'undefined') {
            await TunnelList.render(container);
        } else {
            container.innerHTML = `
                <div class="tc-wrapper">
                    <div class="tc-empty-state">
                        <div class="tc-empty-state-icon">⚠️</div>
                        <h3>Modules Giri Tunnel Club non chargés</h3>
                        <p>Vérifiez que tous les fichiers JS sont bien inclus dans index.html</p>
                    </div>
                </div>
            `;
        }
    }

    function renderDashboard(cont) {
        // Appelé par l'onboarding quand le tenant existe déjà
        if (typeof TunnelList !== 'undefined') {
            TunnelList.render(cont);
        }
    }

    async function refresh() {
        if (!container) _ensureContainer();
        if (typeof TunnelList !== 'undefined') {
            await TunnelList.refresh();
        }
    }

    // ──────────────────────────────────────────
    // ACTIONS PUBLIQUES
    // ──────────────────────────────────────────

    function openGenerator() {
        if (typeof TunnelGenerator !== 'undefined') {
            TunnelGenerator.open();
        } else {
            console.warn('TunnelGenerator module not loaded');
        }
    }

    function openEditor(tunnelId) {
        if (typeof TunnelEditor !== 'undefined') {
            TunnelEditor.open(tunnelId);
        }
    }

    function showStats(tunnelId) {
        if (typeof TunnelStats !== 'undefined') {
            if (tunnelId) {
                TunnelStats.open(tunnelId);
            } else {
                // Stats globales — naviguer vers la vue stats dans la liste
                if (typeof Toast !== 'undefined') Toast.info('Sélectionnez un tunnel pour voir ses statistiques');
            }
        }
    }

    // ──────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────

    return {
        init,
        render,
        refresh,
        renderDashboard,
        openGenerator,
        openEditor,
        showStats
    };

})();

window.TunnelClub = TunnelClub;
