// =============================================
// PRODUCTIVEAPP - DRAGDROP.JS v3
// Module Drag & Drop avec persistance DB
// =============================================

// === STATE ===
let draggedTask = null;
let draggedProject = null;

// =============================================
// INITIALISATION
// =============================================

function initDragAndDrop() {
    initTaskDragAndDrop();
    initProjectDragAndDrop();
    console.log('✅ Drag & Drop initialisé');
}

// =============================================
// DRAG & DROP - TÂCHES
// =============================================

function initTaskDragAndDrop() {
    document.querySelectorAll('.bubble[data-id]').forEach(bubble => {
        bubble.setAttribute('draggable', 'true');

        bubble.removeEventListener('dragstart', handleTaskDragStart);
        bubble.removeEventListener('dragend', handleTaskDragEnd);
        bubble.removeEventListener('dragover', handleTaskBubbleDragOver);
        bubble.removeEventListener('dragleave', handleTaskBubbleDragLeave);
        bubble.removeEventListener('drop', handleTaskBubbleDrop);

        bubble.addEventListener('dragstart', handleTaskDragStart);
        bubble.addEventListener('dragend', handleTaskDragEnd);
        bubble.addEventListener('dragover', handleTaskBubbleDragOver);
        bubble.addEventListener('dragleave', handleTaskBubbleDragLeave);
        bubble.addEventListener('drop', handleTaskBubbleDrop);
    });

    document.querySelectorAll('.task-list, .bubbles-list').forEach(list => {
        list.removeEventListener('dragover', handleTaskDragOver);
        list.removeEventListener('dragleave', handleTaskDragLeave);
        list.removeEventListener('drop', handleTaskDrop);

        list.addEventListener('dragover', handleTaskDragOver);
        list.addEventListener('dragleave', handleTaskDragLeave);
        list.addEventListener('drop', handleTaskDrop);
    });

    // Ajouter gestion drop sur colonnes headers (pour drop en première position)
    document.querySelectorAll('.task-column, .bubbles-column').forEach(column => {
        column.removeEventListener('dragover', handleColumnDragOver);
        column.removeEventListener('drop', handleColumnDrop);

        column.addEventListener('dragover', handleColumnDragOver);
        column.addEventListener('drop', handleColumnDrop);
    });
}

function handleTaskDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);

    document.body.classList.add('is-dragging-task');

    // L'opacité est maintenant gérée par CSS (.dragging) pour plus de fluidité
}

function handleTaskDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;

    document.body.classList.remove('is-dragging-task');

    document.querySelectorAll('.drag-over, .drag-insert-above, .drag-insert-below').forEach(el => {
        el.classList.remove('drag-over', 'drag-insert-above', 'drag-insert-below');
    });
}

function handleTaskDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleTaskDragLeave(e) {
    if (e.relatedTarget && this.contains(e.relatedTarget)) return;
    this.classList.remove('drag-over');
}

function handleTaskBubbleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask === this) return;
    
    document.querySelectorAll('.drag-insert-above, .drag-insert-below').forEach(el => {
        if (el !== this) el.classList.remove('drag-insert-above', 'drag-insert-below');
    });
    
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    this.classList.remove('drag-insert-above', 'drag-insert-below');
    
    if (e.clientY < midpoint) {
        this.classList.add('drag-insert-above');
    } else {
        this.classList.add('drag-insert-below');
    }
}

function handleTaskBubbleDragLeave(e) {
    this.classList.remove('drag-insert-above', 'drag-insert-below');
}

// Gestion drag over sur colonne (pour drop en première position)
function handleColumnDragOver(e) {
    if (!draggedTask) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

// Drop sur une colonne entière (insère en première position)
async function handleColumnDrop(e) {
    if (!draggedTask) return;

    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    const column = this;
    const newStatus = column.dataset.status;

    // Drop en première position de cette colonne
    await reorderTask(draggedId, null, true, newStatus);
}

// Drop sur une bulle spécifique (réorganisation)
async function handleTaskBubbleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask === this) return;
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = this.dataset.id;
    
    // Déterminer si on insère avant ou après
    const rect = this.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    
    // Nettoyer les indicateurs
    this.classList.remove('drag-insert-above', 'drag-insert-below');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    
    // Déterminer le nouveau statut
    const column = this.closest('.task-column') || this.closest('.bubbles-column');
    if (!column) return;
    
    const newStatus = column.dataset.status;
    
    // Réordonner dans le tableau et la DB
    await reorderTask(draggedId, targetId, insertBefore, newStatus);
}

// Drop sur une liste vide ou en fin de liste
async function handleTaskDrop(e) {
    e.preventDefault();
    
    const list = this;
    list.classList.remove('drag-over');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || !draggedTask) return;
    
    const column = list.closest('.task-column') || list.closest('.bubbles-column');
    if (!column) return;
    
    const newStatus = column.dataset.status;
    
    // Mettre en dernière position de cette colonne
    await reorderTask(draggedId, null, false, newStatus);
}

// Fonction principale de réordonnancement
async function reorderTask(draggedId, targetId, insertBefore, newStatus) {
    if (!window.tasks) return;
    
    const draggedTask = window.tasks.find(t => t.id === draggedId);
    if (!draggedTask) return;
    
    const oldStatus = draggedTask.status;
    
    // Filtrer les tâches par nouveau statut (sans la tâche draggée)
    let tasksInColumn = window.tasks.filter(t => t.status === newStatus && t.id !== draggedId);
    
    // Trier par position actuelle
    tasksInColumn.sort((a, b) => (a.position || 0) - (b.position || 0));
    
    // Trouver la nouvelle position (index dans le tableau)
    let insertIndex;
    if (targetId) {
        const targetIndex = tasksInColumn.findIndex(t => t.id === targetId);
        if (targetIndex !== -1) {
            insertIndex = insertBefore ? targetIndex : targetIndex + 1;
        } else {
            insertIndex = 0; // Par défaut en haut
        }
    } else {
        // Pas de cible spécifique
        if (insertBefore) {
            // insertBefore = true + pas de cible = première position
            insertIndex = 0;
        } else {
            // insertBefore = false + pas de cible = dernière position
            insertIndex = tasksInColumn.length;
        }
    }
    
    // Insérer la tâche draggée à la nouvelle position
    tasksInColumn.splice(insertIndex, 0, draggedTask);
    
    // Mettre à jour le statut de la tâche draggée
    draggedTask.status = newStatus;
    
    // Recalculer les positions (commencer à 1)
    const updates = [];
    tasksInColumn.forEach((t, index) => {
        const newPos = index + 1;
        t.position = newPos;
        updates.push({ id: t.id, status: t.status, position: newPos });
    });
    
    // Mettre à jour la référence globale
    window.tasks = window.tasks.map(t => {
        const updated = tasksInColumn.find(u => u.id === t.id);
        return updated || t;
    });
    
    // Envoyer les mises à jour à l'API
    for (const update of updates) {
        if (typeof reorderTaskAPI === 'function') {
            await reorderTaskAPI(update.id, update.status, update.position);
        }
    }
    
    // Ajouter au journal si changement de statut
    if (oldStatus !== newStatus && typeof addJournalEntry === 'function') {
        if (newStatus === 'done') {
            draggedTask.completedAt = new Date().toISOString();
            await addJournalEntry('win', `✅ Terminé: ${draggedTask.text}`, 3);
        } else if (newStatus === 'inprogress' && oldStatus === 'todo') {
            await addJournalEntry('task', `▶️ Commencé: ${draggedTask.text}`, 2);
        } else if (newStatus === 'todo' && oldStatus === 'done') {
            draggedTask.completedAt = null;
            await addJournalEntry('task', `🔄 Réouvert: ${draggedTask.text}`, 2);
        }
    }
    
    console.log(`✅ Tâche réordonnée: ${draggedTask.text} → position ${draggedTask.position} (${newStatus})`);
    
    // Re-render
    if (typeof renderTasks === 'function') renderTasks();
    if (typeof renderProjectsFilter === 'function') renderProjectsFilter();
}

// =============================================
// DRAG & DROP - PROJETS
// =============================================

function initProjectDragAndDrop() {
    const container = document.getElementById('projects-filter-list');
    if (!container) return;
    
    container.querySelectorAll('.project-chip[data-project]').forEach(chip => {
        if (chip.dataset.project === 'all') return;
        
        chip.setAttribute('draggable', 'true');
        
        chip.removeEventListener('dragstart', handleProjectDragStart);
        chip.removeEventListener('dragend', handleProjectDragEnd);
        chip.removeEventListener('dragover', handleProjectDragOver);
        chip.removeEventListener('dragleave', handleProjectDragLeave);
        chip.removeEventListener('drop', handleProjectDrop);
        
        chip.addEventListener('dragstart', handleProjectDragStart);
        chip.addEventListener('dragend', handleProjectDragEnd);
        chip.addEventListener('dragover', handleProjectDragOver);
        chip.addEventListener('dragleave', handleProjectDragLeave);
        chip.addEventListener('drop', handleProjectDrop);
    });
}

function handleProjectDragStart(e) {
    draggedProject = this;
    this.classList.add('dragging-project');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.project);

    document.body.classList.add('is-dragging-project');

    // L'opacité est maintenant gérée par CSS (.dragging-project) pour plus de fluidité
}

function handleProjectDragEnd(e) {
    this.classList.remove('dragging-project');
    draggedProject = null;

    document.body.classList.remove('is-dragging-project');

    document.querySelectorAll('.project-chip').forEach(chip => {
        chip.classList.remove('drag-over-project', 'drag-over-project-left', 'drag-over-project-right');
    });
}

function handleProjectDragOver(e) {
    e.preventDefault();
    if (!draggedProject || draggedProject === this) return;
    
    const rect = this.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    this.classList.remove('drag-over-project-left', 'drag-over-project-right');
    
    if (e.clientX < midpoint) {
        this.classList.add('drag-over-project-left');
    } else {
        this.classList.add('drag-over-project-right');
    }
}

function handleProjectDragLeave(e) {
    this.classList.remove('drag-over-project', 'drag-over-project-left', 'drag-over-project-right');
}

function handleProjectDrop(e) {
    e.preventDefault();
    if (!draggedProject || draggedProject === this) return;
    
    this.classList.remove('drag-over-project', 'drag-over-project-left', 'drag-over-project-right');
    
    const draggedId = draggedProject.dataset.project;
    const targetId = this.dataset.project;
    
    if (!window.projects) return;
    
    const draggedIndex = window.projects.findIndex(p => p.id === draggedId);
    const targetIndex = window.projects.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const rect = this.getBoundingClientRect();
    const insertAfter = e.clientX > rect.left + rect.width / 2;
    
    const [draggedProjectData] = window.projects.splice(draggedIndex, 1);
    
    let newTargetIndex = window.projects.findIndex(p => p.id === targetId);
    if (insertAfter) newTargetIndex++;
    
    window.projects.splice(newTargetIndex, 0, draggedProjectData);
    
    saveProjectsOrder();
    
    if (typeof renderProjectsFilter === 'function') renderProjectsFilter();
    if (typeof renderProjectSelect === 'function') renderProjectSelect();
    
    console.log(`✅ Projet réorganisé: ${draggedProjectData.name}`);
}

// =============================================
// PERSISTENCE ORDRE PROJETS (localStorage)
// =============================================

function saveProjectsOrder() {
    if (!window.projects) return;
    const order = window.projects.map(p => p.id);
    localStorage.setItem('projectsOrder', JSON.stringify(order));
}

function loadProjectsOrder() {
    const saved = localStorage.getItem('projectsOrder');
    if (!saved || !window.projects) return;
    
    try {
        const order = JSON.parse(saved);
        
        const reordered = [];
        order.forEach(id => {
            const project = window.projects.find(p => p.id === id);
            if (project) reordered.push(project);
        });
        
        window.projects.forEach(p => {
            if (!reordered.find(r => r.id === p.id)) {
                reordered.push(p);
            }
        });
        
        window.projects = reordered;
    } catch (e) {
        console.error('Erreur chargement ordre projets:', e);
    }
}

// =============================================
// EXPORT GLOBAL
// =============================================

window.initDragAndDrop = initDragAndDrop;
window.initTaskDragAndDrop = initTaskDragAndDrop;
window.initProjectDragAndDrop = initProjectDragAndDrop;
window.loadProjectsOrder = loadProjectsOrder;
window.saveProjectsOrder = saveProjectsOrder;
window.reorderTask = reorderTask;

console.log('📦 dragdrop.js v3 loaded');
