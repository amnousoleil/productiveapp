/**
 * API Token Management
 * ProductiveApp v4.0
 */

const ApiTokens = (function() {
    'use strict';

    const STORAGE_KEYS = {
        ACCESS_TOKEN: 'accessToken',
        REFRESH_TOKEN: 'refreshToken',
        USER: 'user',
        WORKSPACE_ID: 'workspaceId'
    };

    function getAccessToken() {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    function getRefreshToken() {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    function setTokens(accessToken, refreshToken) {
        if (accessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        }
        if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
    }

    function clearTokens() {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.WORKSPACE_ID);
    }

    function getWorkspaceId() {
        return localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
    }

    function setWorkspaceId(id) {
        if (id) {
            localStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, id);
        }
    }

    function getStoredUser() {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    }

    function setStoredUser(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
    }

    /**
     * Décoder un JWT sans vérification (lecture seule des claims)
     */
    function decodeToken(token) {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) {
            return null;
        }
    }

    /**
     * Vérifier si le token est expiré ou expire dans moins de `bufferSeconds`
     */
    function isTokenExpiringSoon(token, bufferSeconds) {
        bufferSeconds = bufferSeconds || 300; // 5 min par défaut
        if (!token) return true;
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        const expiresAt = decoded.exp * 1000;
        return Date.now() > (expiresAt - bufferSeconds * 1000);
    }

    function isAuthenticated() {
        const token = getAccessToken();
        if (!token) return false;
        // Si le token existe mais est expiré → pas authentifié (le refresh sera tenté)
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true; // token sans exp = toujours valide
        return Date.now() < decoded.exp * 1000;
    }

    return {
        getAccessToken,
        getRefreshToken,
        setTokens,
        clearTokens,
        getWorkspaceId,
        setWorkspaceId,
        getStoredUser,
        setStoredUser,
        isAuthenticated,
        decodeToken,
        isTokenExpiringSoon
    };
})();

if (typeof window !== 'undefined') {
    window.ApiTokens = ApiTokens;
}
