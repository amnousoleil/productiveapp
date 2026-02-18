/**
 * API Data Loader
 * Loads data from backend API and populates AppState
 * ProductiveApp v4.0
 */

const ApiDataLoader = (function() {
    'use strict';

    let isLoading = false;

    /**
     * Load all data in parallel
     */
    async function loadAll() {
        if (isLoading) {
            console.warn('Data loading already in progress');
            return;
        }

        if (!ApiTokens.isAuthenticated()) {
            console.warn('Not authenticated, skipping data load');
            return;
        }

        isLoading = true;
        console.log('📦 Loading data from API...');

        try {
            const [projects, tasks, notes] = await Promise.all([
                loadProjects().catch(err => {
                    console.error('Failed to load projects:', err);
                    return [];
                }),
                loadTasks().catch(err => {
                    console.error('Failed to load tasks:', err);
                    return [];
                }),
                loadNotes().catch(err => {
                    console.error('Failed to load notes:', err);
                    return [];
                })
            ]);

            // Update AppState
            if (typeof AppState !== 'undefined') {
                AppState.projects = projects;
                AppState.tasks = tasks;
                AppState.notes = notes;
            }

            // Expose for legacy compatibility
            if (typeof window !== 'undefined') {
                window.tasks = tasks;
                window.projects = projects;
            }

            console.log('✅ Data loaded:', {
                projects: projects.length,
                tasks: tasks.length,
                notes: notes.length
            });

            // Refresh dashboard if visible
            if (typeof Dashboard !== 'undefined') {
                Dashboard.refresh();
            }

            return { projects, tasks, notes };
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        } finally {
            isLoading = false;
        }
    }

    /**
     * Load projects
     */
    async function loadProjects() {
        const projects = await ApiProjects.getAll();
        return normalizeProjects(projects);
    }

    /**
     * Load tasks (filtered by current user = personal space)
     */
    async function loadTasks() {
        const params = { limit: 500 };
        // Personal space: only my tasks
        const userId = typeof AppState !== 'undefined' && AppState.currentUser?.id;
        if (userId && userId !== 'all') {
            params.userId = userId;
        }
        const tasks = await ApiTasks.getAll(params);
        return normalizeTasks(tasks);
    }

    /**
     * Load ALL workspace tasks (for Team Vision)
     */
    async function loadAllTasks() {
        const tasks = await ApiTasks.getAll({ limit: 500 });
        return normalizeTasks(tasks);
    }

    /**
     * Load notes
     */
    async function loadNotes() {
        const notes = await ApiNotes.getAll({ limit: 200 });
        return normalizeNotes(notes);
    }

    /**
     * Normalize project data for frontend compatibility
     */
    function normalizeProjects(projects) {
        return projects.map(p => ({
            id: p.id,
            name: p.name,
            icon: p.icon || '📁',
            color: p.color || '#6b7280',
            desc: p.description || '',
            status: p.status,
            created_at: p.created_at,
            updated_at: p.updated_at
        }));
    }

    /**
     * Normalize task data for frontend compatibility
     */
    function normalizeTasks(tasks) {
        return tasks.map(t => ({
            id: t.id,
            text: t.title,
            title: t.title,
            description: t.description,
            status: normalizeTaskStatus(t.status),
            priority: normalizeTaskPriority(t.priority),
            project: t.project_id,
            project_id: t.project_id,
            assigned_to: t.assigned_to,
            creator_id: t.user_id,
            userId: t.assigned_to,
            userName: typeof Utils !== 'undefined' ? Utils.getUserName(t.assigned_to) : '',
            due_date: t.due_date,
            created_at: t.created_at,
            updated_at: t.updated_at,
            completed_at: t.completed_at
        }));
    }

    /**
     * Normalize note data for frontend compatibility
     */
    function normalizeNotes(notes) {
        return notes.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            tags: n.tags || [],
            is_pinned: n.is_pinned,
            project_id: n.project_id,
            created_at: n.created_at,
            updated_at: n.updated_at
        }));
    }

    /**
     * Normalize task status to frontend format
     */
    function normalizeTaskStatus(status) {
        const statusMap = {
            'todo': 'todo',
            'in_progress': 'inprogress',
            'completed': 'done',
            'archived': 'done'
        };
        return statusMap[status] || status;
    }

    /**
     * Normalize task priority to frontend format
     * Returns { level: number, label: string }
     */
    function normalizeTaskPriority(priority) {
        const priorityMap = {
            'urgent': 1,
            'high': 2,
            'medium': 2,
            'low': 3
        };
        const labelMap = {
            'urgent': 'Urgent',
            'high': 'Important',
            'medium': 'Normal',
            'low': 'Zen'
        };
        const raw = (typeof priority === 'string') ? priority.toLowerCase() : 'medium';
        const level = priorityMap[raw] || 2;
        return { level, label: labelMap[raw] || 'Normal', raw: raw };
    }

    /**
     * Reload specific data type
     */
    async function reload(type) {
        switch (type) {
            case 'projects':
                const projects = await loadProjects();
                if (typeof AppState !== 'undefined') {
                    AppState.projects = projects;
                }
                window.projects = projects;
                return projects;

            case 'tasks':
                const tasks = await loadTasks();
                if (typeof AppState !== 'undefined') {
                    AppState.tasks = tasks;
                }
                window.tasks = tasks;
                return tasks;

            case 'notes':
                const notes = await loadNotes();
                if (typeof AppState !== 'undefined') {
                    AppState.notes = notes;
                }
                return notes;

            default:
                return loadAll();
        }
    }

    return {
        loadAll,
        loadProjects,
        loadTasks,
        loadAllTasks,
        loadNotes,
        reload,
        get isLoading() { return isLoading; }
    };
})();

if (typeof window !== 'undefined') {
    window.ApiDataLoader = ApiDataLoader;
}
