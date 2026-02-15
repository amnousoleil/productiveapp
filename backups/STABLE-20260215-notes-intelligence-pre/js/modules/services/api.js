/**
 * API - Main module with HTTP helpers
 * ProductiveApp v4.0
 */

const Api = (function() {
    'use strict';

    /**
     * GET request
     */
    async function get(endpoint, params = {}) {
        let url = endpoint;

        // Add query params
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        return ApiFetch.fetchWithAuth(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async function post(endpoint, data = {}) {
        return ApiFetch.fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async function put(endpoint, data = {}) {
        return ApiFetch.fetchWithAuth(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     */
    async function patch(endpoint, data = {}) {
        return ApiFetch.fetchWithAuth(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async function del(endpoint) {
        return ApiFetch.fetchWithAuth(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Upload file (multipart)
     */
    async function upload(endpoint, formData) {
        const token = ApiTokens.getAccessToken();
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(ApiFetch.buildUrl(endpoint), {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    }

    return {
        get,
        post,
        put,
        patch,
        delete: del,
        upload
    };
})();

if (typeof window !== 'undefined') {
    window.Api = Api;
}
