/**
 * API Fetch with Auth & Error Handling
 * ProductiveApp v4.0
 */

const ApiFetch = (function() {
    'use strict';

    let isRefreshing = false;
    let refreshQueue = [];

    function buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${ApiConfig.getBaseUrl()}${endpoint}`;
    }

    function getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = ApiTokens.getAccessToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    function showToast(message, type = 'error') {
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast(message, type);
        } else {
            console.error(`[${type.toUpperCase()}]`, message);
        }
    }

    function redirectToLogin() {
        ApiTokens.clearTokens();
        if (typeof AppState !== 'undefined') {
            AppState.currentUser = null;
            AppState.isAuthenticated = false;
        }

        // Protect against infinite redirect loops using sessionStorage
        // (persists across reloads within the same tab)
        const REDIRECT_KEY = '_auth_redirect_ts';
        const now = Date.now();
        const lastRedirect = parseInt(sessionStorage.getItem(REDIRECT_KEY) || '0');

        if (now - lastRedirect < 5000) {
            // Already redirected within 5 seconds — loop detected, don't reload again.
            // Tokens are cleared; let the auth UI handle it without a reload.
            console.warn('[ApiFetch] Redirect loop detected — skipping reload');
            sessionStorage.removeItem(REDIRECT_KEY);
            return;
        }

        sessionStorage.setItem(REDIRECT_KEY, now.toString());
        window.location.reload();
    }

    async function refreshAccessToken() {
        const refreshToken = ApiTokens.getRefreshToken();
        if (!refreshToken) {
            // No refresh token — clean up stale access token too
            ApiTokens.clearTokens();
            return false;
        }

        try {
            const response = await fetch(buildUrl('/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                // Refresh rejected by server — tokens are stale, clear them
                ApiTokens.clearTokens();
                return false;
            }

            const data = await response.json();
            if (data.success && data.data) {
                ApiTokens.setTokens(data.data.accessToken, data.data.refreshToken);
                return true;
            }

            ApiTokens.clearTokens();
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            ApiTokens.clearTokens();
            return false;
        }
    }

    async function handleUnauthorized(originalRequest) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            }).then(() => fetchWithAuth(originalRequest.url, { ...originalRequest.options, _retryAfterRefresh: true }));
        }

        isRefreshing = true;

        try {
            const refreshed = await refreshAccessToken();
            isRefreshing = false;

            if (refreshed) {
                refreshQueue.forEach(p => p.resolve());
                refreshQueue = [];
                // Mark retry so a second 401 won't loop back into handleUnauthorized
                return fetchWithAuth(originalRequest.url, { ...originalRequest.options, _retryAfterRefresh: true });
            } else {
                refreshQueue.forEach(p => p.reject(new Error('Session expired')));
                refreshQueue = [];
                redirectToLogin();
                throw new Error('Session expired');
            }
        } catch (error) {
            isRefreshing = false;
            throw error;
        }
    }

    function handleErrorResponse(status, errorData) {
        const message = errorData?.error?.message || `Erreur ${status}`;

        if (status >= 500) {
            showToast('Erreur serveur. Veuillez réessayer.', 'error');
        } else if (status === 403) {
            showToast('Accès non autorisé', 'error');
        } else if (status === 404) {
            showToast('Ressource non trouvée', 'error');
        } else if (status === 400) {
            showToast(message, 'error');
        }

        return message;
    }

    async function fetchWithAuth(endpoint, options = {}) {
        const url = buildUrl(endpoint);
        const config = {
            method: options.method || 'GET',
            headers: getHeaders(options.includeAuth !== false),
            ...options
        };

        // Remove custom props from fetch options
        delete config.includeAuth;
        const isRetry = !!config._retryAfterRefresh;
        delete config._retryAfterRefresh;

        try {
            let response = await fetch(url, config);

            if (response.status === 401 && options.includeAuth !== false) {
                if (isRetry) {
                    // Already retried after a token refresh — don't loop, just fail cleanly
                    console.warn('[ApiFetch] 401 after token refresh retry — session invalid');
                    ApiTokens.clearTokens();
                    if (typeof AppState !== 'undefined') {
                        AppState.currentUser = null;
                        AppState.isAuthenticated = false;
                    }
                    throw new Error('Session expired');
                }
                return handleUnauthorized({ url: endpoint, options });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = handleErrorResponse(response.status, errorData);
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (error.message !== 'Session expired') {
                console.error('API request failed:', error);
            }
            throw error;
        }
    }

    async function fetchWithoutAuth(endpoint, options = {}) {
        return fetchWithAuth(endpoint, { ...options, includeAuth: false });
    }

    /**
     * Refresh proactif au démarrage
     * Appelé une fois quand l'app se charge — si le token expire bientôt, on le renouvelle silencieusement
     */
    async function ensureValidToken() {
        const accessToken = ApiTokens.getAccessToken();
        if (!accessToken) return false;

        // Refresh si token expire dans moins de 2h (120 * 60 = 7200 sec)
        if (ApiTokens.isTokenExpiringSoon(accessToken, 7200)) {
            console.log('[Auth] Token expire bientôt → refresh silencieux...');
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                console.log('[Auth] ✅ Token renouvelé silencieusement');
            } else {
                console.warn('[Auth] ❌ Refresh échoué — token invalide');
            }
            return refreshed;
        }
        return true;
    }

    /**
     * Démarrer le refresh automatique toutes les heures si l'utilisateur est connecté
     */
    function startAutoRefresh() {
        // Refresh toutes les 6h si connecté (bien avant l'expiry de 7j)
        setInterval(async () => {
            const token = ApiTokens.getAccessToken();
            if (token && ApiTokens.isTokenExpiringSoon(token, 3600 * 6)) {
                await refreshAccessToken();
            }
        }, 3600 * 1000); // check toutes les heures
    }

    return {
        buildUrl,
        getHeaders,
        fetchWithAuth,
        fetchWithoutAuth,
        ensureValidToken,
        startAutoRefresh,
        showToast,
        redirectToLogin
    };
})();

if (typeof window !== 'undefined') {
    window.ApiFetch = ApiFetch;
}
