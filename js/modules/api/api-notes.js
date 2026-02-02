/**
 * API Notes Module
 * ProductiveApp v4.0
 */

const ApiNotes = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    function buildUrl(path) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }
        return `/workspaces/${workspaceId}/notes${path}`;
    }

    /**
     * Get all notes in workspace
     */
    async function getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit);
        if (params.projectId) queryParams.set('project_id', params.projectId);
        if (params.search) queryParams.set('search', params.search);
        if (params.tags) queryParams.set('tags', params.tags.join(','));
        if (params.isPinned !== undefined) queryParams.set('is_pinned', params.isPinned);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? `?${query}` : '');
        const response = await Api.get(url);
        return response.data?.notes || [];
    }

    /**
     * Get single note by ID
     */
    async function getById(noteId) {
        const response = await Api.get(buildUrl(`/${noteId}`));
        return response.data?.note;
    }

    /**
     * Create new note
     */
    async function create(data) {
        const response = await Api.post(buildUrl(''), data);
        return response.data?.note;
    }

    /**
     * Update note
     */
    async function update(noteId, data) {
        const response = await Api.patch(buildUrl(`/${noteId}`), data);
        return response.data?.note;
    }

    /**
     * Delete note (soft delete)
     */
    async function remove(noteId) {
        await Api.delete(buildUrl(`/${noteId}`));
        return true;
    }

    /**
     * Permanently delete note
     */
    async function permanentDelete(noteId) {
        await Api.delete(buildUrl(`/${noteId}/permanent`));
        return true;
    }

    /**
     * Restore deleted note
     */
    async function restore(noteId) {
        const response = await Api.post(buildUrl(`/${noteId}/restore`));
        return response.data?.note;
    }

    /**
     * Get note versions
     */
    async function getVersions(noteId) {
        const response = await Api.get(buildUrl(`/${noteId}/versions`));
        return response.data?.versions || [];
    }

    /**
     * Restore note to specific version
     */
    async function restoreVersion(noteId, versionId) {
        const response = await Api.post(buildUrl(`/${noteId}/versions/${versionId}/restore`));
        return response.data?.note;
    }

    /**
     * Toggle pin status
     */
    async function togglePin(noteId) {
        const note = await getById(noteId);
        return update(noteId, { is_pinned: !note.is_pinned });
    }

    /**
     * Link two notes
     */
    async function link(sourceNoteId, targetNoteId) {
        const response = await Api.post(buildUrl(`/${sourceNoteId}/links`), {
            targetNoteId
        });
        return response.data?.link;
    }

    /**
     * Unlink notes
     */
    async function unlink(sourceNoteId, targetNoteId) {
        await Api.delete(buildUrl(`/${sourceNoteId}/links/${targetNoteId}`));
        return true;
    }

    /**
     * Get linked notes
     */
    async function getLinks(noteId) {
        const response = await Api.get(buildUrl(`/${noteId}/links`));
        return response.data?.links || [];
    }

    /**
     * Get deleted notes (trash)
     */
    async function getDeleted() {
        const response = await Api.get(buildUrl('/trash'));
        return response.data?.notes || [];
    }

    /**
     * Search notes
     */
    async function search(query) {
        const response = await Api.get(buildUrl(`?search=${encodeURIComponent(query)}`));
        return response.data?.notes || [];
    }

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        permanentDelete,
        restore,
        getVersions,
        restoreVersion,
        togglePin,
        link,
        unlink,
        getLinks,
        getDeleted,
        search
    };
})();

if (typeof window !== 'undefined') {
    window.ApiNotes = ApiNotes;
}
