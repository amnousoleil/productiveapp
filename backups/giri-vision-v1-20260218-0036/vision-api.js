/**
 * ================================================
 * VISION API - Giri Vision v1.0
 * Appels API backend
 * ================================================
 */

const VisionApi = (function () {
    'use strict';

    const BASE = '/api/v1/giri-vision';

    async function request(method, path, body) {
        // Utilise ApiTokens si disponible (système officiel de l'app)
        const token = (typeof ApiTokens !== 'undefined')
            ? ApiTokens.getAccessToken()
            : localStorage.getItem('accessToken');
        const workspaceId = (typeof ApiTokens !== 'undefined')
            ? ApiTokens.getWorkspaceId()
            : localStorage.getItem('workspaceId');

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (workspaceId) headers['X-Workspace-Id'] = workspaceId;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${BASE}${path}`, opts);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    }

    async function createMeeting(title, scheduledAt) {
        const body = { title };
        if (scheduledAt) body.scheduled_at = scheduledAt;
        return request('POST', '/meetings', body);
    }

    async function getMeetings() {
        return request('GET', '/meetings');
    }

    async function getMeeting(roomId) {
        return request('GET', `/meetings/${roomId}`);
    }

    async function joinMeeting(roomId, participantName) {
        return request('POST', `/meetings/${roomId}/join`, { participant_name: participantName });
    }

    async function endMeeting(roomId, durationSeconds) {
        return request('POST', `/meetings/${roomId}/end`, { duration_seconds: durationSeconds });
    }

    async function deleteMeeting(roomId) {
        return request('DELETE', `/meetings/${roomId}`);
    }

    return { createMeeting, getMeetings, getMeeting, joinMeeting, endMeeting, deleteMeeting };
})();

if (typeof window !== 'undefined') window.VisionApi = VisionApi;
