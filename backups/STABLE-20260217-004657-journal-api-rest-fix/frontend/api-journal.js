/**
 * API Journal Module
 * ProductiveApp v4.0
 * Interface moderne REST pour le module Journal
 */

const ApiJournal = (function() {
    'use strict';

    /**
     * Obtenir le workspace ID actuel
     */
    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    /**
     * Construire l'URL avec workspace
     */
    function buildUrl(path = '') {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }
        return `/journal/workspace/${workspaceId}${path}`;
    }

    /**
     * Obtenir toutes les entrées du journal
     * @param {Object} params - Paramètres de filtrage
     * @returns {Promise<Array>} - Liste des entrées
     */
    async function getEntries(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.date) queryParams.set('date', params.date);
        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate) queryParams.set('end_date', params.endDate);
        if (params.category) queryParams.set('category', params.category);
        if (params.userId) queryParams.set('user_id', params.userId);
        if (params.limit) queryParams.set('limit', params.limit);
        if (params.offset) queryParams.set('offset', params.offset);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? `?${query}` : '');

        const response = await Api.get(url);
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Obtenir une entrée par ID
     */
    async function getEntryById(id) {
        const response = await Api.get(buildUrl(`/${id}`));
        return response.data;
    }

    /**
     * Obtenir l'entrée pour une date spécifique
     */
    async function getEntryByDate(date) {
        const response = await Api.get(buildUrl(`/date/${date}`));
        return response.data;
    }

    /**
     * Créer ou mettre à jour une entrée (upsert)
     * @param {Object} data - Données de l'entrée
     * @returns {Promise<Object>} - Entrée créée/mise à jour
     */
    async function upsertEntry(data) {
        const response = await Api.post(buildUrl(''), data);
        return response.data;
    }

    /**
     * Mettre à jour une entrée existante
     */
    async function updateEntry(id, data) {
        const response = await Api.put(buildUrl(`/${id}`), data);
        return response.data;
    }

    /**
     * Supprimer une entrée
     */
    async function deleteEntry(id) {
        await Api.delete(buildUrl(`/${id}`));
        return true;
    }

    /**
     * Obtenir les statistiques du journal
     */
    async function getStatistics(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate) queryParams.set('end_date', params.endDate);
        if (params.userId) queryParams.set('user_id', params.userId);

        const query = queryParams.toString();
        const url = buildUrl('/statistics') + (query ? `?${query}` : '');

        const response = await Api.get(url);
        return response.data;
    }

    /**
     * Obtenir les entrées du jour actuel
     */
    async function getTodayEntries() {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        return await getEntries({ date: today });
    }

    /**
     * Vérifier si l'API journal est disponible
     */
    function isAvailable() {
        return typeof Api !== 'undefined' &&
               typeof ApiTokens !== 'undefined' &&
               ApiTokens.isAuthenticated &&
               ApiTokens.isAuthenticated();
    }

    return {
        getEntries,
        getEntryById,
        getEntryByDate,
        upsertEntry,
        updateEntry,
        deleteEntry,
        getStatistics,
        getTodayEntries,
        isAvailable
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.ApiJournal = ApiJournal;
}
