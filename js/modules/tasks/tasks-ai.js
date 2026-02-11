/**
 * Tasks AI Actions
 * ProductiveApp v4.3
 *
 * AI-powered task enhancements:
 * - Suggest subtasks
 * - Estimate duration
 * - Reformulate clearly
 * - Prioritize intelligently
 */

const TasksAI = (function() {
    'use strict';

    let currentTask = null;

    /**
     * Show AI actions menu for a task
     */
    function showActionsMenu(task, buttonElement) {
        if (!task) return;

        currentTask = task;

        // Close existing menu
        closeMenu();

        // Create menu
        const menu = document.createElement('div');
        menu.className = 'tasks-ai-menu';
        menu.id = 'tasks-ai-menu';

        menu.innerHTML = `
            <div class="tasks-ai-menu-header">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                </svg>
                <span>Actions IA</span>
            </div>
            <div class="tasks-ai-menu-items">
                <button class="tasks-ai-menu-item" onclick="TasksAI.suggestSubtasks()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        <path d="M9 12h6m-6 4h6"/>
                    </svg>
                    <div>
                        <strong>Suggérer des sous-tâches</strong>
                        <small>Décomposer en étapes actionnables</small>
                    </div>
                </button>
                <button class="tasks-ai-menu-item" onclick="TasksAI.estimateDuration()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    <div>
                        <strong>Estimer la durée</strong>
                        <small>Calculer le temps nécessaire</small>
                    </div>
                </button>
                <button class="tasks-ai-menu-item" onclick="TasksAI.reformulateTask()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <div>
                        <strong>Reformuler clairement</strong>
                        <small>Rendre la tâche plus précise</small>
                    </div>
                </button>
                <button class="tasks-ai-menu-item" onclick="TasksAI.analyzePriority()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <div>
                        <strong>Analyser la priorité</strong>
                        <small>Suggérer le niveau d'urgence</small>
                    </div>
                </button>
                <button class="tasks-ai-menu-item" onclick="TasksAI.suggestNextSteps()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <div>
                        <strong>Prochaines étapes</strong>
                        <small>Conseils pour avancer</small>
                    </div>
                </button>
            </div>
        `;

        // Position menu near button
        document.body.appendChild(menu);
        positionMenu(menu, buttonElement);

        // Animate in
        requestAnimationFrame(() => menu.classList.add('active'));

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    /**
     * Position menu relative to button
     */
    function positionMenu(menu, button) {
        const rect = button.getBoundingClientRect();
        const menuWidth = 320;
        const menuHeight = 360;

        let left = rect.right + 8;
        let top = rect.top;

        // Check if menu goes off screen
        if (left + menuWidth > window.innerWidth) {
            left = rect.left - menuWidth - 8;
        }

        if (top + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 16;
        }

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }

    /**
     * Close menu
     */
    function closeMenu() {
        const menu = document.getElementById('tasks-ai-menu');
        if (menu) {
            menu.classList.remove('active');
            setTimeout(() => menu.remove(), 200);
        }
        document.removeEventListener('click', handleOutsideClick);
    }

    /**
     * Handle outside click
     */
    function handleOutsideClick(e) {
        const menu = document.getElementById('tasks-ai-menu');
        if (menu && !menu.contains(e.target)) {
            closeMenu();
        }
    }

    /**
     * Suggest subtasks
     */
    async function suggestSubtasks() {
        closeMenu();
        if (!currentTask) return;

        showLoadingModal('Génération de sous-tâches...');

        try {
            const prompt = `Voici une tâche à accomplir : "${currentTask.text || currentTask.title}"

Décompose cette tâche en 3 à 6 sous-tâches concrètes et actionnables. Chaque sous-tâche doit être :
- Spécifique et claire
- Réalisable indépendamment
- Ordonnée logiquement

Retourne UNIQUEMENT une liste numérotée, sans commentaire ni introduction :

1. [Première sous-tâche]
2. [Deuxième sous-tâche]
etc.`;

            const response = await ApiAi.generate(prompt);

            // Parse subtasks
            const subtasks = parseSubtasks(response);

            showSubtasksModal(subtasks);

        } catch (error) {
            console.error('TasksAI: Failed to suggest subtasks', error);
            showNotification('Erreur lors de la génération', 'error');
        } finally {
            hideLoadingModal();
        }
    }

    /**
     * Estimate duration
     */
    async function estimateDuration() {
        closeMenu();
        if (!currentTask) return;

        showLoadingModal('Estimation de la durée...');

        try {
            const prompt = `Voici une tâche : "${currentTask.text || currentTask.title}"

Estime le temps nécessaire pour accomplir cette tâche. Considère :
- La complexité de la tâche
- Les étapes impliquées
- Le temps réaliste (pas optimiste ni pessimiste)

Réponds en une seule ligne au format : "X heures" ou "X minutes" ou "X jours"
Ajoute ensuite UNE phrase (max 100 caractères) pour justifier brièvement.`;

            const response = await ApiAi.generate(prompt);

            showResultModal('Estimation de durée', response, '⏱️');

        } catch (error) {
            console.error('TasksAI: Failed to estimate duration', error);
            showNotification('Erreur lors de l\'estimation', 'error');
        } finally {
            hideLoadingModal();
        }
    }

    /**
     * Reformulate task
     */
    async function reformulateTask() {
        closeMenu();
        if (!currentTask) return;

        showLoadingModal('Reformulation en cours...');

        try {
            const prompt = `Reformule cette tâche pour la rendre plus claire et actionnable : "${currentTask.text || currentTask.title}"

Critères :
- Commence par un verbe d'action
- Soit spécifique et mesurable
- Garde la même intention
- Max 1 phrase courte

Retourne UNIQUEMENT la tâche reformulée, sans commentaire.`;

            const response = await ApiAi.generate(prompt);

            showReformulationModal(response.trim());

        } catch (error) {
            console.error('TasksAI: Failed to reformulate', error);
            showNotification('Erreur lors de la reformulation', 'error');
        } finally {
            hideLoadingModal();
        }
    }

    /**
     * Analyze priority
     */
    async function analyzePriority() {
        closeMenu();
        if (!currentTask) return;

        showLoadingModal('Analyse de la priorité...');

        try {
            const prompt = `Analyse cette tâche : "${currentTask.text || currentTask.title}"

Détermine son niveau de priorité (Urgent, Normal, ou Basse) en considérant :
- Impact potentiel
- Urgence temporelle
- Dépendances avec d'autres tâches

Réponds exactement au format :

PRIORITÉ: [Urgent/Normal/Basse]

RAISON: [Une phrase courte expliquant pourquoi]`;

            const response = await ApiAi.generate(prompt);

            const priority = parsePriority(response);

            showPriorityModal(priority);

        } catch (error) {
            console.error('TasksAI: Failed to analyze priority', error);
            showNotification('Erreur lors de l\'analyse', 'error');
        } finally {
            hideLoadingModal();
        }
    }

    /**
     * Suggest next steps
     */
    async function suggestNextSteps() {
        closeMenu();
        if (!currentTask) return;

        showLoadingModal('Génération de conseils...');

        try {
            const prompt = `Voici une tâche : "${currentTask.text || currentTask.title}"

Donne 3 conseils pratiques pour avancer efficacement sur cette tâche. Chaque conseil doit être :
- Actionnable immédiatement
- Spécifique à la tâche
- Court (max 1 ligne)

Format :
1. [Premier conseil]
2. [Deuxième conseil]
3. [Troisième conseil]`;

            const response = await ApiAi.generate(prompt);

            showResultModal('Prochaines étapes recommandées', response, '💡');

        } catch (error) {
            console.error('TasksAI: Failed to suggest next steps', error);
            showNotification('Erreur lors de la génération', 'error');
        } finally {
            hideLoadingModal();
        }
    }

    // ==========================================
    // MODAL FUNCTIONS
    // ==========================================

    function showLoadingModal(message) {
        const modal = document.createElement('div');
        modal.id = 'tasks-ai-loading-modal';
        modal.className = 'tasks-ai-loading-modal';
        modal.innerHTML = `
            <div class="tasks-ai-loading-content">
                <div class="tasks-ai-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    function hideLoadingModal() {
        const modal = document.getElementById('tasks-ai-loading-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 200);
        }
    }

    function showResultModal(title, content, icon = '✨') {
        const modal = document.createElement('div');
        modal.className = 'tasks-ai-result-modal';
        modal.innerHTML = `
            <div class="tasks-ai-result-content">
                <div class="tasks-ai-result-header">
                    <h3><span class="ai-icon">${icon}</span> ${title}</h3>
                    <button onclick="this.closest('.tasks-ai-result-modal').remove()">×</button>
                </div>
                <div class="tasks-ai-result-body">
                    <p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>
                </div>
                <div class="tasks-ai-result-footer">
                    <button class="btn btn-primary" onclick="this.closest('.tasks-ai-result-modal').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    function showSubtasksModal(subtasks) {
        const modal = document.createElement('div');
        modal.className = 'tasks-ai-result-modal';
        modal.innerHTML = `
            <div class="tasks-ai-result-content">
                <div class="tasks-ai-result-header">
                    <h3><span class="ai-icon">📋</span> Sous-tâches suggérées</h3>
                    <button onclick="this.closest('.tasks-ai-result-modal').remove()">×</button>
                </div>
                <div class="tasks-ai-result-body">
                    <ul class="ai-subtasks-list">
                        ${subtasks.map(st => `<li>${escapeHtml(st)}</li>`).join('')}
                    </ul>
                </div>
                <div class="tasks-ai-result-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.tasks-ai-result-modal').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="TasksAI.createSubtasks(${JSON.stringify(subtasks).replace(/"/g, '&quot;')})">
                        Créer ces tâches
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    function showReformulationModal(newText) {
        const modal = document.createElement('div');
        modal.className = 'tasks-ai-result-modal';
        modal.innerHTML = `
            <div class="tasks-ai-result-content">
                <div class="tasks-ai-result-header">
                    <h3><span class="ai-icon">✍️</span> Reformulation proposée</h3>
                    <button onclick="this.closest('.tasks-ai-result-modal').remove()">×</button>
                </div>
                <div class="tasks-ai-result-body">
                    <div class="ai-comparison">
                        <div class="ai-comparison-item">
                            <label>Texte original :</label>
                            <p>${escapeHtml(currentTask.text || currentTask.title)}</p>
                        </div>
                        <div class="ai-comparison-item">
                            <label>Proposition IA :</label>
                            <p class="ai-suggestion">${escapeHtml(newText)}</p>
                        </div>
                    </div>
                </div>
                <div class="tasks-ai-result-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.tasks-ai-result-modal').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="TasksAI.applyReformulation('${newText.replace(/'/g, "\\'")}')">
                        Appliquer
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    function showPriorityModal(priorityData) {
        const modal = document.createElement('div');
        modal.className = 'tasks-ai-result-modal';
        modal.innerHTML = `
            <div class="tasks-ai-result-content">
                <div class="tasks-ai-result-header">
                    <h3><span class="ai-icon">⚡</span> Analyse de priorité</h3>
                    <button onclick="this.closest('.tasks-ai-result-modal').remove()">×</button>
                </div>
                <div class="tasks-ai-result-body">
                    <div class="ai-priority-result">
                        <div class="ai-priority-badge ${priorityData.level}">
                            ${priorityData.label}
                        </div>
                        <p>${escapeHtml(priorityData.reason)}</p>
                    </div>
                </div>
                <div class="tasks-ai-result-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.tasks-ai-result-modal').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="TasksAI.applyPriority(${priorityData.value})">
                        Appliquer cette priorité
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    // ==========================================
    // PARSING & APPLICATION
    // ==========================================

    function parseSubtasks(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const subtasks = [];

        for (const line of lines) {
            // Match patterns like "1. Task" or "- Task" or "• Task"
            const match = line.match(/^[\d\-\•\*\+]\s*\.?\s*(.+)/);
            if (match) {
                subtasks.push(match[1].trim());
            } else if (line.trim() && !line.includes(':')) {
                // If no prefix but non-empty, include it
                subtasks.push(line.trim());
            }
        }

        return subtasks.length > 0 ? subtasks : [text.trim()];
    }

    function parsePriority(text) {
        const priorityMatch = text.match(/PRIORITÉ:\s*(Urgent|Normal|Basse)/i);
        const reasonMatch = text.match(/RAISON:\s*(.+)/i);

        let level = 'Normal';
        if (priorityMatch) {
            level = priorityMatch[1];
        }

        const value = level === 'Urgent' ? 1 : level === 'Basse' ? 3 : 2;
        const reason = reasonMatch ? reasonMatch[1].trim() : 'Analyse basée sur le contexte de la tâche.';

        return { level: level.toLowerCase(), label: level, value, reason };
    }

    function createSubtasks(subtasks) {
        // Close modal
        document.querySelector('.tasks-ai-result-modal')?.remove();

        // Create subtasks
        if (typeof AppState !== 'undefined' && typeof Tasks !== 'undefined') {
            subtasks.forEach(text => {
                Tasks.addTask({
                    text: text,
                    project: currentTask.project || 'general',
                    priority: currentTask.priority || 2,
                    status: 'todo'
                });
            });

            showNotification(`${subtasks.length} sous-tâches créées`, 'success');
        }
    }

    function applyReformulation(newText) {
        document.querySelector('.tasks-ai-result-modal')?.remove();

        if (currentTask && typeof Tasks !== 'undefined' && Tasks.updateTask) {
            Tasks.updateTask(currentTask.id, { text: newText });
            showNotification('Tâche reformulée avec succès', 'success');
        }
    }

    function applyPriority(priorityValue) {
        document.querySelector('.tasks-ai-result-modal')?.remove();

        if (currentTask && typeof Tasks !== 'undefined' && Tasks.updateTask) {
            Tasks.updateTask(currentTask.id, { priority: priorityValue });
            showNotification('Priorité mise à jour', 'success');
        }
    }

    function showNotification(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        showActionsMenu,
        closeMenu,
        suggestSubtasks,
        estimateDuration,
        reformulateTask,
        analyzePriority,
        suggestNextSteps,
        createSubtasks,
        applyReformulation,
        applyPriority
    };
})();

// Export
if (typeof window !== 'undefined') {
    window.TasksAI = TasksAI;
}
