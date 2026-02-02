/**
 * API Auth Endpoints
 * ProductiveApp v4.0
 */

const ApiAuth = (function() {
    'use strict';

    /**
     * Login with email and password
     * DEMO MODE: Uses mock authentication for testing
     */
    async function login(email, password) {
        // DEMO: Mock login for testing (no backend available)
        if (email === 'demo@productive.app' && password === 'Demo@123') {
            console.log('✅ Mock login successful');
            const mockUser = {
                id: 'demo-user',
                email: email,
                name: 'Demo User',
                avatar: '👤',
                role: 'admin'
            };
            const mockToken = 'mock-token-' + Date.now();

            if (typeof ApiTokens !== 'undefined') {
                ApiTokens.setTokens(mockToken, mockToken);
                ApiTokens.setStoredUser(mockUser);
            }

            return {
                user: mockUser,
                workspaces: [{ id: 'default', name: 'Demo Workspace' }],
                accessToken: mockToken,
                refreshToken: mockToken
            };
        }

        // Try real API if not demo credentials
        try {
            const response = await ApiFetch.fetchWithoutAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.success && response.data) {
                const { user, accessToken, refreshToken, workspaces } = response.data;

                ApiTokens.setTokens(accessToken, refreshToken);
                ApiTokens.setStoredUser(user);

                if (workspaces && workspaces.length > 0) {
                    ApiTokens.setWorkspaceId(workspaces[0].id);
                }

                return { user, workspaces, accessToken, refreshToken };
            }

            throw new Error(response.error?.message || 'Login failed');
        } catch (error) {
            console.error('API login failed:', error);
            throw new Error('Identifiants incorrects');
        }
    }

    /**
     * Register new user
     */
    async function register(userData) {
        const response = await ApiFetch.fetchWithoutAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;

            ApiTokens.setTokens(accessToken, refreshToken);
            ApiTokens.setStoredUser(user);

            return { user, accessToken, refreshToken };
        }

        throw new Error(response.error?.message || 'Registration failed');
    }

    /**
     * Logout current user
     */
    async function logout() {
        try {
            await Api.post('/auth/logout', {});
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            ApiTokens.clearTokens();
        }
    }

    /**
     * Get current user profile
     */
    async function getProfile() {
        const response = await Api.get('/auth/me');
        return response.data?.user;
    }

    /**
     * Get current authenticated user (alias with full response)
     */
    async function getMe() {
        const response = await Api.get('/auth/me');
        return response.data;
    }

    /**
     * Update current user profile
     */
    async function updateProfile(data) {
        const response = await Api.patch('/auth/me', data);
        if (response.success && response.data) {
            ApiTokens.setStoredUser(response.data.user);
        }
        return response.data?.user;
    }

    /**
     * Change password
     */
    async function changePassword(currentPassword, newPassword) {
        const response = await Api.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.success;
    }

    /**
     * Get user's workspaces
     */
    async function getWorkspaces() {
        const response = await Api.get('/workspaces');
        return response.data?.workspaces || [];
    }

    /**
     * Check if user is logged in (has valid tokens)
     */
    function isLoggedIn() {
        return ApiTokens.isAuthenticated();
    }

    /**
     * Get current stored user
     */
    function getCurrentUser() {
        return ApiTokens.getStoredUser();
    }

    /**
     * Get active sessions
     */
    async function getSessions() {
        const response = await Api.get('/auth/sessions');
        return response.data?.sessions || [];
    }

    /**
     * Revoke a session
     */
    async function revokeSession(sessionId) {
        await Api.delete(`/auth/sessions/${sessionId}`);
    }

    return {
        login,
        register,
        logout,
        getProfile,
        getMe,
        updateProfile,
        changePassword,
        getWorkspaces,
        isLoggedIn,
        getCurrentUser,
        getSessions,
        revokeSession
    };
})();

if (typeof window !== 'undefined') {
    window.ApiAuth = ApiAuth;
}
