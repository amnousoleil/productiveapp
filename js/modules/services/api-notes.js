/**
 * API Notes Module
 * ProductiveApp v4.0
 */

const ApiNotes = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    function getMemberId() {
        const id = localStorage.getItem('selectedMemberId');
        return (id && id !== 'all') ? id : null;
    }

    function buildUrl(path) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }
        return `/notes/workspace/${workspaceId}${path}`;
    }

    /**
     * Get all notes in workspace (filtered by member_id)
     */
    async function getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit || '100');
        if (params.projectId) queryParams.set('project_id', params.projectId);
        if (params.search) queryParams.set('q', params.search);
        if (params.tags) queryParams.set('tags', params.tags.join(','));
        if (params.isPinned !== undefined) queryParams.set('is_pinned', params.isPinned);

        // Always pass member_id for per-member isolation
        const memberId = getMemberId();
        if (memberId) {
            queryParams.set('member_id', memberId);
        }

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? `?${query}` : '');
        const response = await Api.get(url);
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get single note by ID
     */
    async function getById(noteId) {
        const response = await Api.get(buildUrl(`/${noteId}`));
        return response.data?.note;
    }

    /**
     * Create new note (with member_id)
     */
    async function create(data) {
        const memberId = getMemberId();
        if (memberId) {
            data.member_id = memberId;
        }
        const response = await Api.post(buildUrl(''), data);
        return response.data?.note;
    }

    /**
     * Update note (PUT to workspace-scoped route)
     */
    async function update(noteId, data) {
        const memberId = getMemberId();
        if (memberId) {
            data.member_id = memberId;
        }
        const response = await Api.put(buildUrl(`/${noteId}`), data);
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
        return Array.isArray(response.data) ? response.data : [];
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
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get deleted notes (trash)
     */
    async function getDeleted() {
        const response = await Api.get(buildUrl('/deleted'));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Search notes
     */
    async function search(query) {
        return getAll({ search: query });
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
