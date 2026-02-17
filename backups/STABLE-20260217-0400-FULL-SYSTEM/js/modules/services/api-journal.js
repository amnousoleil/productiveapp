/**
 * API Journal Module v3.0
 * ProductiveApp
 *
 * ARCHITECTURE :
 * - Backend : 1 entrée par jour (UNIQUE user+workspace+date)
 * - Frontend : N mini-entrées par jour (timeline)
 * - Stockage : mini-entrées JSON dans JSONB `highlights`
 *   { id, text, category, energy, context, created_at, ai_response? }
 * - Navigation temporelle : getEntriesForDate(dateStr) pour n'importe quel jour
 */

const ApiJournal = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    function buildUrl(path) {
        path = path || '';
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace selected');
        return '/journal/workspace/' + workspaceId + path;
    }

    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function parseHighlights(highlights) {
        if (!Array.isArray(highlights)) return [];
        return highlights.map(function(h) {
            try { return typeof h === 'string' ? JSON.parse(h) : h; }
            catch(e) { return null; }
        }).filter(Boolean);
    }

    function miniId() {
        return 'je_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    async function fetchDayEntry(date) {
        try {
            const response = await Api.get(buildUrl('/date/' + date));
            // Backend returns entry directly (no .data wrapper)
            return response || null;
        } catch(e) {
            // 404 = pas d'entrée pour ce jour, c'est normal
            return null;
        }
    }

    /**
     * Obtenir les mini-entrées d'un jour spécifique
     */
    async function getEntriesForDate(dateStr) {
        const dayEntry = await fetchDayEntry(dateStr);
        if (!dayEntry) return [];
        return parseHighlights(dayEntry.highlights).map(function(e) {
            return Object.assign({}, e, { date: dayEntry.date || dateStr });
        });
    }

    /**
     * Obtenir les mini-entrées du jour courant (rétrocompat)
     */
    async function getTodayEntries() {
        return getEntriesForDate(todayStr());
    }

    /**
     * Obtenir entrées sur une plage de dates (aplatit highlights de chaque jour)
     */
    async function getEntries(params) {
        params = params || {};
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate)   queryParams.set('end_date',   params.endDate);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? '?' + query : '');

        const response = await Api.get(url);
        const dayEntries = Array.isArray(response) ? response :
                           (Array.isArray(response && response.data) ? response.data : []);

        const miniEntries = [];
        dayEntries.forEach(function(day) {
            parseHighlights(day.highlights).forEach(function(e) {
                miniEntries.push(Object.assign({}, e, { date: day.date || e.date }));
            });
        });

        return miniEntries;
    }

    /**
     * Ajouter une mini-entrée (accumule dans highlights, jamais d'écrasement)
     * Supporte une réponse IA optionnelle
     */
    async function upsertEntry(data) {
        var dateStr = data.date || todayStr();

        var miniEntry = {
            id:          miniId(),
            text:        (data.text || '').trim(),
            category:    data.category  || 'task',
            energy:      data.energy    || 2,
            context:     data.context   || 'general',
            created_at:  new Date().toISOString(),
            ai_response: data.ai_response || null  // Réponse Maha Giri si générée avant
        };

        if (!miniEntry.text) throw new Error('Texte requis');

        var existing = await fetchDayEntry(dateStr);
        var existingHighlights = parseHighlights(existing && existing.highlights);
        var existingTags = (existing && Array.isArray(existing.tags)) ? existing.tags : [];

        existingHighlights.push(miniEntry);

        if (existingTags.indexOf(miniEntry.category) === -1) {
            existingTags.push(miniEntry.category);
        }

        var contentText = existingHighlights.map(function(e) {
            return '[' + e.category + '] ' + e.text;
        }).join('\n');

        var backendPayload = {
            date:         dateStr,
            content:      contentText,
            energy_level: miniEntry.energy,
            tags:         existingTags,
            highlights:   existingHighlights
        };

        await Api.post(buildUrl(''), backendPayload);
        return miniEntry;
    }

    /**
     * Mettre à jour la réponse IA d'une mini-entrée existante
     */
    async function updateEntryAiResponse(entryId, aiResponse, dateStr) {
        dateStr = dateStr || todayStr();
        var dayEntry = await fetchDayEntry(dateStr);
        if (!dayEntry) return false;

        var highlights = parseHighlights(dayEntry.highlights).map(function(e) {
            if (e.id === entryId) return Object.assign({}, e, { ai_response: aiResponse });
            return e;
        });

        await Api.put(buildUrl('/' + dayEntry.id), { highlights: highlights });
        return true;
    }

    /**
     * Supprimer une mini-entrée par son ID (avec date optionnelle pour historique)
     */
    async function deleteEntry(id, dateStr) {
        dateStr = dateStr || todayStr();
        var dayEntry = await fetchDayEntry(dateStr);
        if (!dayEntry) return true;

        var highlights = parseHighlights(dayEntry.highlights).filter(function(e) {
            return e.id !== id;
        });

        await Api.put(buildUrl('/' + dayEntry.id), { highlights: highlights });
        return true;
    }

    /**
     * Statistiques
     */
    async function getStatistics(params) {
        params = params || {};
        var queryParams = new URLSearchParams();
        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate)   queryParams.set('end_date',   params.endDate);

        var query = queryParams.toString();
        var url = buildUrl('/statistics') + (query ? '?' + query : '');
        var response = await Api.get(url);
        return response || response.data || null;
    }

    function isAvailable() {
        return typeof Api !== 'undefined' &&
               typeof ApiTokens !== 'undefined' &&
               ApiTokens.isAuthenticated &&
               ApiTokens.isAuthenticated();
    }

    return {
        getEntries:            getEntries,
        getEntriesForDate:     getEntriesForDate,
        getTodayEntries:       getTodayEntries,
        upsertEntry:           upsertEntry,
        updateEntryAiResponse: updateEntryAiResponse,
        deleteEntry:           deleteEntry,
        getStatistics:         getStatistics,
        isAvailable:           isAvailable
    };
})();

if (typeof window !== 'undefined') {
    window.ApiJournal = ApiJournal;
}
