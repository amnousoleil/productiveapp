/**
 * BEHAVIORAL VIEW - Profile comportemental
 * ProductiveApp v5.0
 */

const BehavioralView = (function() {
    'use strict';

    let hasRendered = false;
    let state = { loading: false, data: null };

    function buildTemplate() {
        return `
            <div class="behavioral-page">
                <div class="behavioral-header">
                    <h1 class="view-title">
                        <span class="view-title-icon">🧠</span>
                        Mon Profil Comportemental
                    </h1>
                    <button class="btn-refresh" onclick="BehavioralView.refresh()">🔄 Rafraîchir</button>
                </div>
                <div id="behavioral-content" class="behavioral-content">
                    <div class="loading">Analyse en cours...</div>
                </div>
            </div>
        `;
    }

    async function render() {
        const container = document.getElementById('view-behavioral');
        if (!container) {
            console.warn('BehavioralView: Container not found');
            return;
        }

        // Inject styles
        if (typeof BehavioralStyles !== 'undefined') {
            BehavioralStyles.inject();
        }

        // Build initial template
        if (!hasRendered) {
            container.innerHTML = buildTemplate();
            hasRendered = true;
        }

        // Load and render profile
        state.loading = true;
        const content = document.getElementById('behavioral-content');
        if (content) content.innerHTML = '<div class="loading">Analyse en cours...</div>';

        try {
            if (typeof BehavioralProfile !== 'undefined') {
                state.data = await BehavioralApi.getProfile();
                BehavioralRender.renderProfile(content, state.data);
            } else {
                content.innerHTML = '<div class="error">Module non chargé</div>';
            }
        } catch (error) {
            console.error('BehavioralView error:', error);
            content.innerHTML = '<div class="error">Erreur de chargement</div>';
        }

        state.loading = false;
    }

    async function refresh() {
        hasRendered = false;
        await render();
    }

    function show() {
        const container = document.getElementById('view-behavioral');
        if (container) {
            container.classList.add('active');
            if (!hasRendered) render();
        }
    }

    function hide() {
        const container = document.getElementById('view-behavioral');
        if (container) {
            container.classList.remove('active');
        }
    }

    function getState() {
        return state;
    }

    return { render, refresh, show, hide, getState };
})();

if (typeof window !== 'undefined') {
    window.BehavioralView = BehavioralView;
}
