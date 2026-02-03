/**
 * API Projects Module
 * ProductiveApp v4.0
 */

const ApiProjects = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    function buildUrl(path) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }
        return `/projects/workspace/${workspaceId}${path}`;
    }

    /**
     * Get all projects in workspace
     */
    async function getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit);
        if (params.status) queryParams.set('status', params.status);
        if (params.search) queryParams.set('search', params.search);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? `?${query}` : '');
        const response = await Api.get(url);
        // Backend returns array directly in data, not data.projects
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get single project by ID
     */
    async function getById(projectId) {
        const response = await Api.get(buildUrl(`/${projectId}`));
        return response.data?.project;
    }

    /**
     * Create new project
     */
    async function create(data) {
        const response = await Api.post(buildUrl(''), data);
        return response.data?.project;
    }

    /**
     * Update project
     */
    async function update(projectId, data) {
        const response = await Api.patch(buildUrl(`/${projectId}`), data);
        return response.data?.project;
    }

    /**
     * Delete project
     */
    async function remove(projectId) {
        await Api.delete(buildUrl(`/${projectId}`));
        return true;
    }

    /**
     * Archive project
     */
    async function archive(projectId) {
        const response = await Api.post(buildUrl(`/${projectId}/archive`));
        return response.data?.project;
    }

    /**
     * Restore archived project
     */
    async function restore(projectId) {
        const response = await Api.post(buildUrl(`/${projectId}/restore`));
        return response.data?.project;
    }

    /**
     * Get project members
     */
    async function getMembers(projectId) {
        const response = await Api.get(buildUrl(`/${projectId}/members`));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Add member to project
     */
    async function addMember(projectId, userId, role = 'member') {
        const response = await Api.post(buildUrl(`/${projectId}/members`), {
            userId,
            role
        });
        return response.data?.member;
    }

    /**
     * Remove member from project
     */
    async function removeMember(projectId, userId) {
        await Api.delete(buildUrl(`/${projectId}/members/${userId}`));
        return true;
    }

    /**
     * Reorder projects
     */
    async function reorder(projectIds) {
        const response = await Api.post(buildUrl('/reorder'), {
            projectIds
        });
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get project statistics
     */
    async function getStats(projectId) {
        const response = await Api.get(buildUrl(`/${projectId}/stats`));
        return response.data?.stats;
    }

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        archive,
        restore,
        getMembers,
        addMember,
        removeMember,
        reorder,
        getStats
    };
})();

if (typeof window !== 'undefined') {
    window.ApiProjects = ApiProjects;
}
