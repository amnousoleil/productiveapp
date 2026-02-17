/**
 * Behavioral Profile - Main module
 * ProductiveApp v4.0
 */
const BehavioralProfile = (function() {
    'use strict';

    let currentData = null;
    let currentContainer = null;

    async function init(container) {
        BehavioralStyles.inject();
        currentContainer = typeof container === 'string' ? document.querySelector(container) : container;
        if (!currentContainer) {
            console.warn('BehavioralProfile: container not found');
            return;
        }
        await refresh();
    }

    async function render(container, data) {
        BehavioralStyles.inject();
        const target = container || currentContainer;
        const profileData = data || currentData || await BehavioralApi.getProfile();
        if (target && profileData) {
            BehavioralRender.renderProfile(target, profileData);
            currentData = profileData;
        }
    }

    async function refresh() {
        currentData = await BehavioralApi.getProfile();
        if (currentContainer) {
            BehavioralRender.renderProfile(currentContainer, currentData);
        }
        return currentData;
    }

    function getData() {
        return currentData;
    }

    return { init, render, refresh, getData };
})();

if (typeof window !== 'undefined') window.BehavioralProfile = BehavioralProfile;
