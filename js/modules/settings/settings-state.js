/**
 * SETTINGS STATE - ProductiveApp v4.0
 * Configuration, icones et helpers d'etat
 */

const SettingsState = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        version: '4.0.0',
        storageKeys: {
            notifications: 'productiveapp_notifications',
            sidebarCompact: 'sidebar_compact',
            theme: 'theme',
            animationIntensity: 'productiveapp_animation_intensity',
            animationPreset: 'productiveapp_animation_preset'
        }
    };

    // Icons SVG
    const icons = {
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
        bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        sidebar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
        database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/><circle cx="18" cy="5" r="1.5" fill="currentColor" opacity="0.5"/><circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.4"/></svg>'
    };

    // Available themes
    const themes = [
        { id: 'executive', name: 'Executive', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
        { id: 'ocean', name: 'Ocean', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0c1929 0%, #1a365d 100%)' },
        { id: 'forest', name: 'Forest', color: '#22c55e', gradient: 'linear-gradient(135deg, #0d1f0d 0%, #1a2e1a 100%)' },
        { id: 'sunset', name: 'Sunset', color: '#f97316', gradient: 'linear-gradient(135deg, #1f1a0d 0%, #2e1a0d 100%)' }
    ];

    // Default notification settings
    const defaultNotifications = {
        taskReminders: true,
        dailySummary: true,
        achievements: true,
        mentions: true,
        sounds: false
    };

    /**
     * Get current user info
     */
    function getCurrentUser() {
        if (typeof AppState !== 'undefined' && AppState.currentUser) {
            return AppState.currentUser;
        }
        return { name: 'Utilisateur', email: 'user@example.com', avatar: '👤' };
    }

    /**
     * Get notification settings from localStorage
     */
    function getNotificationSettings() {
        try {
            var saved = localStorage.getItem(CONFIG.storageKeys.notifications);
            return saved ? Object.assign({}, defaultNotifications, JSON.parse(saved)) : defaultNotifications;
        } catch (e) {
            return defaultNotifications;
        }
    }

    /**
     * Check if sidebar is compact
     */
    function isSidebarCompact() {
        return localStorage.getItem(CONFIG.storageKeys.sidebarCompact) === 'true' ||
               document.body.classList.contains('sidebar-collapsed');
    }

    /**
     * Get current theme
     */
    function getCurrentTheme() {
        return localStorage.getItem(CONFIG.storageKeys.theme) || 'executive';
    }

    /**
     * Get current animation intensity
     */
    function getAnimationIntensity() {
        try {
            var saved = localStorage.getItem(CONFIG.storageKeys.animationIntensity);
            return saved !== null ? parseInt(saved, 10) : 45;
        } catch (e) { return 45; }
    }

    /**
     * Get current animation preset
     */
    function getAnimationPreset() {
        return localStorage.getItem(CONFIG.storageKeys.animationPreset) || 'elegant';
    }

    return {
        CONFIG: CONFIG,
        icons: icons,
        themes: themes,
        defaultNotifications: defaultNotifications,
        getCurrentUser: getCurrentUser,
        getNotificationSettings: getNotificationSettings,
        isSidebarCompact: isSidebarCompact,
        getCurrentTheme: getCurrentTheme,
        getAnimationIntensity: getAnimationIntensity,
        getAnimationPreset: getAnimationPreset
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsState = SettingsState;
}
