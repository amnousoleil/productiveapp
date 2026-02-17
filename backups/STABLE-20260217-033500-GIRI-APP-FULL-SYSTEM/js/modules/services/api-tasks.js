/**
 * API Tasks Module
 * ProductiveApp v4.0
 */

const ApiTasks = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    function buildUrl(path) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            throw new Error('No workspace selected');
        }
        return `/tasks/workspace/${workspaceId}${path}`;
    }

    /**
     * Get all tasks in workspace
     */
    async function getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        // Always send limit, default to 500 to get all tasks
        queryParams.set('limit', params.limit || 500);
        if (params.projectId) queryParams.set('project_id', params.projectId);
        if (params.status) queryParams.set('status', params.status);
        if (params.priority) queryParams.set('priority', params.priority);
        if (params.assigneeId) queryParams.set('assignee_id', params.assigneeId);
        if (params.userId) queryParams.set('user_id', params.userId);
        if (params.search) queryParams.set('search', params.search);
        if (params.dueBefore) queryParams.set('due_before', params.dueBefore);
        if (params.dueAfter) queryParams.set('due_after', params.dueAfter);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? `?${query}` : '');
        const response = await Api.get(url);
        // Backend returns array directly in data, not data.tasks
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get single task by ID
     */
    async function getById(taskId) {
        const response = await Api.get(buildUrl(`/${taskId}`));
        return response.data?.task;
    }

    /**
     * Create new task
     */
    async function create(data) {
        const response = await Api.post(buildUrl(''), data);
        return response.data?.task;
    }

    /**
     * Update task
     */
    async function update(taskId, data) {
        // Note: PUT /:taskId route is outside workspace prefix
        const response = await Api.put(`/tasks/${taskId}`, data);
        return response.data?.task;
    }

    /**
     * Delete task
     */
    async function remove(taskId) {
        // Note: DELETE /:taskId route is outside workspace prefix
        await Api.delete(`/tasks/${taskId}`);
        return true;
    }

    /**
     * Complete task
     */
    async function complete(taskId) {
        return update(taskId, { status: 'completed' });
    }

    /**
     * Reopen task
     */
    async function reopen(taskId) {
        return update(taskId, { status: 'todo' });
    }

    /**
     * Get task comments
     */
    async function getComments(taskId) {
        const response = await Api.get(buildUrl(`/${taskId}/comments`));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Add comment to task
     */
    async function addComment(taskId, content) {
        const response = await Api.post(buildUrl(`/${taskId}/comments`), {
            content
        });
        return response.data?.comment;
    }

    /**
     * Delete comment
     */
    async function deleteComment(taskId, commentId) {
        await Api.delete(buildUrl(`/${taskId}/comments/${commentId}`));
        return true;
    }

    /**
     * Get subtasks
     */
    async function getSubtasks(taskId) {
        const response = await Api.get(buildUrl(`/${taskId}/subtasks`));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Create subtask
     */
    async function createSubtask(taskId, data) {
        const response = await Api.post(buildUrl(`/${taskId}/subtasks`), data);
        return response.data?.subtask;
    }

    /**
     * Get tasks due soon (next 7 days)
     */
    async function getDueSoon() {
        const response = await Api.get(buildUrl('/due-soon'));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Get overdue tasks
     */
    async function getOverdue() {
        const response = await Api.get(buildUrl('/overdue'));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Reorder tasks
     */
    async function reorder(taskIds) {
        const response = await Api.post(buildUrl('/reorder'), { taskIds });
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Assign task to user
     */
    async function assign(taskId, userId) {
        return update(taskId, { assigned_to: userId });
    }

    /**
     * Unassign task
     */
    async function unassign(taskId) {
        return update(taskId, { assigned_to: null });
    }

    /**
     * Set task priority
     */
    async function setPriority(taskId, priority) {
        return update(taskId, { priority });
    }

    /**
     * Set due date
     */
    async function setDueDate(taskId, dueDate) {
        return update(taskId, { due_date: dueDate });
    }

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        complete,
        reopen,
        getComments,
        addComment,
        deleteComment,
        getSubtasks,
        createSubtask,
        getDueSoon,
        getOverdue,
        reorder,
        assign,
        unassign,
        setPriority,
        setDueDate
    };
})();

if (typeof window !== 'undefined') {
    window.ApiTasks = ApiTasks;
}
