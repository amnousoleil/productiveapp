/**
 * API Projects Module
 * ProductiveApp v4.0
 */

const ApiProjects = (function() {
    'use strict';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    function buildDirectUrl(path) {
        return `/projects${path}`;
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
        const response = await Api.get(buildDirectUrl(`/${projectId}`));
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
        const response = await Api.put(buildDirectUrl(`/${projectId}`), data);
        return response.data?.project;
    }

    /**
     * Delete project
     */
    async function remove(projectId) {
        await Api.delete(buildDirectUrl(`/${projectId}`));
        return true;
    }

    /**
     * Archive project
     */
    async function archive(projectId) {
        const response = await Api.post(buildDirectUrl(`/${projectId}/archive`));
        return response.data?.project;
    }

    /**
     * Restore archived project
     */
    async function restore(projectId) {
        const response = await Api.post(buildDirectUrl(`/${projectId}/restore`));
        return response.data?.project;
    }

    /**
     * Get project members
     */
    async function getMembers(projectId) {
        const response = await Api.get(buildDirectUrl(`/${projectId}/members`));
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Add member to project
     */
    async function addMember(projectId, userId, role = 'member') {
        const response = await Api.post(buildDirectUrl(`/${projectId}/members`), {
            userId,
            role
        });
        return response.data?.member;
    }

    /**
     * Remove member from project
     */
    async function removeMember(projectId, userId) {
        await Api.delete(buildDirectUrl(`/${projectId}/members/${userId}`));
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
        const response = await Api.get(buildDirectUrl(`/${projectId}/stats`));
        return response.data?.stats;
    }

    /**
     * Generate AI project name suggestion
     */
    async function suggestName(description) {
        if (!description || !description.trim()) {
            return null;
        }

        try {
            const prompt = `Génère un nom de projet court et créatif (2-4 mots max) pour: "${description}".
Retourne UNIQUEMENT le nom, sans guillemets ni explications.
Le nom doit être:
- Professionnel mais mémorable
- En français
- Court (15-30 caractères)
- Inspirant et positif

Exemples:
- "application de suivi fitness" → "Vital Track"
- "site e-commerce de bijoux" → "Éclat Précieux"
- "plateforme de formation en ligne" → "Savoir Plus"`;

            const response = await ApiAi.generate(prompt, {
                maxTokens: 30,
                temperature: 0.7
            });

            if (response && response.text) {
                let name = response.text.trim();
                name = name.replace(/^["']|["']$/g, '');
                name = name.substring(0, 40);
                return name;
            }
            return null;
        } catch (error) {
            console.error('❌ AI name suggestion failed:', error);
            return null;
        }
    }

    /**
     * Generate AI project description
     */
    async function suggestDescription(name) {
        if (!name || !name.trim()) {
            return null;
        }

        try {
            const prompt = `Génère une description de projet courte et percutante (une phrase, 40-80 caractères) pour un projet nommé: "${name}".
Retourne UNIQUEMENT la description, sans guillemets ni explications.
La description doit expliquer l'objectif du projet de manière claire et motivante.`;

            const response = await ApiAi.generate(prompt, {
                maxTokens: 50,
                temperature: 0.7
            });

            if (response && response.text) {
                let desc = response.text.trim();
                desc = desc.replace(/^["']|["']$/g, '');
                desc = desc.substring(0, 120);
                return desc;
            }
            return null;
        } catch (error) {
            console.error('❌ AI description suggestion failed:', error);
            return null;
        }
    }

    /**
     * Get my projects across all workspaces
     */
    async function getMyProjects() {
        const response = await Api.get('/projects/my');
        return Array.isArray(response.data) ? response.data : [];
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
        getStats,
        suggestName,
        suggestDescription,
        getMyProjects
    };
})();

if (typeof window !== 'undefined') {
    window.ApiProjects = ApiProjects;
}
