/**
 * Auto Theme Detection - Dark/Light selon préférence système
 * ProductiveApp v4.0
 */

const ThemeAuto = (function() {
    'use strict';

    const STORAGE_KEY = 'theme_preference';
    const SYSTEM = 'system';
    let mediaQuery = null;

    // Thèmes clairs et sombres
    const LIGHT_THEMES = ['ivory', 'paper', 'porcelain', 'sakura', 'mint', 'pastel', 'zen', 'nordic', 'watercolor', 'printemps', 'ete', 'pearl', 'snow', 'bamboo', 'provence'];
    const DARK_THEMES = ['executive', 'obsidian', 'midnight', 'matrix', 'cyberpunk', 'cosmic', 'tron', 'amethyst', 'ruby', 'bioluminescence', 'hiver'];

    function init() {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemChange);

        const pref = getPreference();
        if (pref === SYSTEM) {
            applySystemTheme();
        }

        console.log('🎨 ThemeAuto: Initialized, preference:', pref);
    }

    function getPreference() {
        return localStorage.getItem(STORAGE_KEY) || SYSTEM;
    }

    function setPreference(pref) {
        localStorage.setItem(STORAGE_KEY, pref);
        if (pref === SYSTEM) {
            applySystemTheme();
        }
    }

    function handleSystemChange(e) {
        if (getPreference() === SYSTEM) {
            applySystemTheme();
        }
    }

    function applySystemTheme() {
        const isDark = mediaQuery.matches;
        const currentTheme = document.documentElement.getAttribute('data-theme');

        // Si le thème actuel correspond déjà à la préférence, ne rien faire
        if (isDark && DARK_THEMES.includes(currentTheme)) return;
        if (!isDark && LIGHT_THEMES.includes(currentTheme)) return;

        // Appliquer un thème par défaut selon la préférence
        const newTheme = isDark ? 'executive' : 'ivory';

        if (typeof Themes !== 'undefined' && Themes.setTheme) {
            Themes.setTheme(newTheme);
        } else {
            document.documentElement.setAttribute('data-theme', newTheme);
        }

        console.log('🎨 ThemeAuto: Applied', newTheme, '(system:', isDark ? 'dark' : 'light', ')');
    }

    function isSystemDark() {
        return mediaQuery?.matches || false;
    }

    function getRecommendedThemes() {
        return isSystemDark() ? DARK_THEMES : LIGHT_THEMES;
    }

    return {
        init,
        getPreference,
        setPreference,
        isSystemDark,
        getRecommendedThemes,
        LIGHT_THEMES,
        DARK_THEMES
    };
})();

if (typeof window !== 'undefined') {
    window.ThemeAuto = ThemeAuto;
    // Auto-init si DOM ready
    if (document.readyState !== 'loading') {
        ThemeAuto.init();
    } else {
        document.addEventListener('DOMContentLoaded', ThemeAuto.init);
    }
}
