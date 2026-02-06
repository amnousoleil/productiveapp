/**
 * ChatActions - Intent Detection & Task Actions for Mahayawen
 * ProductiveApp v4.0
 */
const ChatActions = (function() {
    'use strict';

    const INTENTS = {
        CREATE_TASK: {
            patterns: [
                /(?:cr[ée]e|ajoute|nouvelle?|fais|note)[\s-]*(?:une?\s+)?(?:t[aâ]che|todo)/i,
                /(?:je dois|il faut|pense à|n'oublie pas)/i
            ],
            extract: (msg) => msg
                .replace(/(?:cr[ée]e|ajoute|nouvelle?|fais)[\s-]*(?:une?\s+)?(?:t[aâ]che|todo)\s*:?\s*/i, '')
                .replace(/(?:je dois|il faut|pense à|n'oublie pas)\s*:?\s*/i, '')
                .trim() || null
        },
        LIST_URGENT: {
            patterns: [
                /(?:t[aâ]ches?|todo)\s*(?:urgente?s?|prioritaire?s?)/i,
                /(?:urgente?s?|prioritaire?s?)\s*(?:t[aâ]ches?|todo)/i
            ]
        },
        LIST_TODO: {
            patterns: [
                /(?:mes|les|toutes?)\s*t[aâ]ches?\s*(?:en cours|à faire)?/i,
                /(?:montre|affiche|liste)[\s-]*(?:moi\s+)?(?:mes|les)\s*t[aâ]ches?/i
            ]
        },
        TASK_STATS: {
            patterns: [
                /combien\s+(?:de\s+)?(?:t[aâ]ches?|todo)/i,
                /(?:stats?|statistiques?|r[ée]sum[ée]|bilan)\s*(?:t[aâ]ches?)?/i
            ]
        },
        LIST_NOTES: {
            patterns: [
                /(?:mes|les)\s*notes?/i,
                /(?:montre|affiche|r[ée]sume)[\s-]*(?:moi\s+)?(?:mes|les)\s*notes?/i
            ]
        }
    };

    function detectIntent(message) {
        if (!message || typeof message !== 'string') return null;
        const msg = message.toLowerCase().trim();

        for (const [intentName, config] of Object.entries(INTENTS)) {
            for (const pattern of config.patterns) {
                if (pattern.test(msg)) {
                    return {
                        intent: intentName,
                        data: config.extract ? config.extract(message) : null,
                        originalMessage: message
                    };
                }
            }
        }
        return null;
    }

    async function executeAction(intentResult) {
        if (!intentResult?.intent) return null;
        const { intent, data } = intentResult;
        const workspaceId = ApiTokens.getWorkspaceId();

        if (!workspaceId) return "Je n'ai pas accès au workspace. Reconnecte-toi.";

        try {
            switch (intent) {
                case 'CREATE_TASK': return await createTask(workspaceId, data);
                case 'LIST_URGENT': return listUrgentTasks();
                case 'LIST_TODO': return listTodoTasks();
                case 'TASK_STATS': return getTaskStats();
                case 'LIST_NOTES': return listNotes();
                default: return null;
            }
        } catch (error) {
            console.error('ChatActions error:', error);
            return `Oups, erreur: ${error.message}`;
        }
    }

    async function createTask(workspaceId, taskText) {
        if (!taskText || taskText.length < 3) {
            return "Dis-moi ce que tu veux ajouter comme tâche.";
        }

        const response = await ApiFetch.fetchWithAuth(`/tasks/workspace/${workspaceId}`, {
            method: 'POST',
            body: JSON.stringify({ title: taskText, status: 'todo', priority: 'medium' })
        });

        if (response.success) {
            if (typeof ApiDataLoader !== 'undefined') {
                ApiDataLoader.reload('tasks').catch(console.error);
            }
            return `J'ai créé la tâche "${taskText}".`;
        }
        return "Je n'ai pas pu créer la tâche.";
    }

    function listUrgentTasks() {
        const tasks = AppState.tasks || [];
        const urgent = tasks.filter(t =>
            t.status !== 'done' && (t.priority?.level === 1 || t.priority === 'urgent')
        );

        if (!urgent.length) return "Aucune tâche urgente !";

        const list = urgent.slice(0, 5).map((t, i) => `${i + 1}. ${t.text || t.title}`).join('\n');
        return `${urgent.length} tâche${urgent.length > 1 ? 's' : ''} urgente${urgent.length > 1 ? 's' : ''}:\n${list}`;
    }

    function listTodoTasks() {
        const tasks = AppState.tasks || [];
        const todo = tasks.filter(t => t.status === 'todo' || t.status === 'inprogress');

        if (!todo.length) return "Aucune tâche en cours !";

        const inProgress = todo.filter(t => t.status === 'inprogress');
        const waiting = todo.filter(t => t.status === 'todo');

        let response = `${todo.length} tâche${todo.length > 1 ? 's' : ''} en cours:\n`;
        if (inProgress.length) {
            response += `\nEn cours:\n` + inProgress.slice(0, 3).map(t => `  - ${t.text || t.title}`).join('\n');
        }
        if (waiting.length) {
            response += `\n\nÀ faire:\n` + waiting.slice(0, 5).map(t => `  - ${t.text || t.title}`).join('\n');
        }
        return response;
    }

    function getTaskStats() {
        const tasks = AppState.tasks || [];
        const todo = tasks.filter(t => t.status === 'todo').length;
        const inProgress = tasks.filter(t => t.status === 'inprogress').length;
        const done = tasks.filter(t => t.status === 'done').length;
        const urgent = tasks.filter(t => t.status !== 'done' && t.priority?.level === 1).length;

        return `Stats:\n- Total: ${tasks.length}\n- À faire: ${todo}\n- En cours: ${inProgress}\n- Terminées: ${done}\n- Urgentes: ${urgent}`;
    }

    function listNotes() {
        const notes = AppState.notes || [];
        if (!notes.length) return "Tu n'as pas de notes.";

        const list = notes.slice(0, 5).map((n, i) => `${i + 1}. ${n.title || 'Sans titre'}`).join('\n');
        return `${notes.length} note${notes.length > 1 ? 's' : ''}:\n${list}`;
    }

    return { detectIntent, executeAction, INTENTS };
})();

if (typeof window !== 'undefined') {
    window.ChatActions = ChatActions;
}
