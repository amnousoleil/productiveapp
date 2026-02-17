/**
 * ================================================
 * VISION UTILS - Giri Vision v1.0
 * Utilitaires partagés
 * ================================================
 */

const VisionUtils = (function () {
    'use strict';

    function generateRoomCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 9; i++) {
            if (i === 3 || i === 6) code += '-';
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function formatDuration(seconds) {
        if (!seconds) return '—';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}min`;
        if (m > 0) return `${m}min ${s}s`;
        return `${s}s`;
    }

    function getCurrentUser() {
        if (typeof AppConfig !== 'undefined' && AppConfig.currentMember) {
            return AppConfig.currentMember;
        }
        return { name: 'Utilisateur', email: '' };
    }

    function sanitizeRoomId(roomId) {
        return roomId.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
    }

    return { generateRoomCode, formatDate, formatDuration, getCurrentUser, sanitizeRoomId };
})();

if (typeof window !== 'undefined') window.VisionUtils = VisionUtils;
