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

    function isAuthenticated() {
        return !!getAccessToken();
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
        isAuthenticated
    };
})();

if (typeof window !== 'undefined') {
    window.ApiTokens = ApiTokens;
}
