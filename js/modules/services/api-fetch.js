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
        window.location.reload();
    }

    async function refreshAccessToken() {
        const refreshToken = ApiTokens.getRefreshToken();
        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(buildUrl('/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            if (data.success && data.data) {
                ApiTokens.setTokens(data.data.accessToken, data.data.refreshToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    async function handleUnauthorized(originalRequest) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            }).then(() => fetchWithAuth(originalRequest.url, originalRequest.options));
        }

        isRefreshing = true;

        try {
            const refreshed = await refreshAccessToken();
            isRefreshing = false;

            if (refreshed) {
                refreshQueue.forEach(p => p.resolve());
                refreshQueue = [];
                return fetchWithAuth(originalRequest.url, originalRequest.options);
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

        try {
            let response = await fetch(url, config);

            if (response.status === 401 && options.includeAuth !== false) {
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

    return {
        buildUrl,
        getHeaders,
        fetchWithAuth,
        fetchWithoutAuth,
        showToast,
        redirectToLogin
    };
})();

if (typeof window !== 'undefined') {
    window.ApiFetch = ApiFetch;
}
