// =============================================
// PRODUCTIVEAPP - DRAGDROP.JS v1
// Module Drag & Drop pour tâches et projets
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
    // Rendre les tâches draggables
    document.querySelectorAll('.bubble[data-id]').forEach(bubble => {
        bubble.setAttribute('draggable', 'true');
        
        // Retirer les anciens listeners pour éviter les doublons
        bubble.removeEventListener('dragstart', handleTaskDragStart);
        bubble.removeEventListener('dragend', handleTaskDragEnd);
        
        bubble.addEventListener('dragstart', handleTaskDragStart);
        bubble.addEventListener('dragend', handleTaskDragEnd);
    });
    
    // Zones de drop (colonnes et listes)
    document.querySelectorAll('.task-list, .bubbles-list').forEach(list => {
        list.removeEventListener('dragover', handleTaskDragOver);
        list.removeEventListener('dragleave', handleTaskDragLeave);
        list.removeEventListener('drop', handleTaskDrop);
        
        list.addEventListener('dragover', handleTaskDragOver);
        list.addEventListener('dragleave', handleTaskDragLeave);
        list.addEventListener('drop', handleTaskDrop);
    });
}

function handleTaskDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    
    // Ajouter une classe au body pour le style global pendant le drag
    document.body.classList.add('is-dragging-task');
    
    // Réduire l'opacité après un court délai
    setTimeout(() => {
        this.style.opacity = '0.5';
        this.style.transform = 'scale(0.95)';
    }, 0);
}

function handleTaskDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '';
    this.style.transform = '';
    draggedTask = null;
    
    document.body.classList.remove('is-dragging-task');
    
    // Nettoyer tous les indicateurs de drop
    document.querySelectorAll('.drag-over, .drag-over-above, .drag-over-below').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-above', 'drag-over-below');
    });
}

function handleTaskDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const list = this;
    list.classList.add('drag-over');
    
    // Trouver la bulle la plus proche pour l'insertion
    const afterElement = getDragAfterElement(list, e.clientY);
    
    // Nettoyer les indicateurs précédents dans cette liste
    list.querySelectorAll('.drag-over-above, .drag-over-below').forEach(el => {
        el.classList.remove('drag-over-above', 'drag-over-below');
    });
    
    if (afterElement) {
        afterElement.classList.add('drag-over-above');
    }
}

function handleTaskDragLeave(e) {
    // Ne pas enlever si on est toujours dans la liste
    if (e.relatedTarget && this.contains(e.relatedTarget)) return;
    
    this.classList.remove('drag-over');
    this.querySelectorAll('.drag-over-above, .drag-over-below').forEach(el => {
        el.classList.remove('drag-over-above', 'drag-over-below');
    });
}

async function handleTaskDrop(e) {
    e.preventDefault();
    
    const list = this;
    list.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId || !draggedTask) return;
    
    // Déterminer le nouveau statut selon la colonne
    const column = list.closest('.task-column') || list.closest('.bubbles-column');
    if (!column) return;
    
    const newStatus = column.dataset.status;
    
    // Accéder aux variables globales de app.js
    const task = window.tasks ? window.tasks.find(t => t.id === taskId) : null;
    if (!task) return;
    
    // Si le statut change, mettre à jour
    if (task.status !== newStatus) {
        const oldStatus = task.status;
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        
        if (newStatus === 'done') {
            task.completedAt = new Date().toISOString();
            if (typeof addJournalEntry === 'function') {
                await addJournalEntry('win', `✅ Terminé: ${task.text}`, 3);
            }
        } else if (oldStatus === 'done') {
            task.completedAt = null;
            if (newStatus === 'inprogress' && typeof addJournalEntry === 'function') {
                await addJournalEntry('task', `🔄 Repris: ${task.text}`, 2);
            }
        } else if (newStatus === 'inprogress' && oldStatus === 'todo') {
            if (typeof addJournalEntry === 'function') {
                await addJournalEntry('task', `▶️ Commencé: ${task.text}`, 2);
            }
        }
        
        // Mettre à jour l'API
        if (typeof updateTaskAPI === 'function') {
            await updateTaskAPI(taskId, newStatus, task.priority.level);
        }
        
        console.log(`✅ Tâche déplacée: ${task.text} → ${newStatus}`);
    }
    
    // Nettoyer les indicateurs
    list.querySelectorAll('.drag-over-above, .drag-over-below').forEach(el => {
        el.classList.remove('drag-over-above', 'drag-over-below');
    });
    
    // Re-render pour synchroniser l'état
    if (typeof renderTasks === 'function') renderTasks();
    if (typeof renderProjectsFilter === 'function') renderProjectsFilter();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.bubble:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// =============================================
// DRAG & DROP - PROJETS
// =============================================

function initProjectDragAndDrop() {
    const container = document.getElementById('projects-filter-list');
    if (!container) return;
    
    container.querySelectorAll('.project-chip[data-project]').forEach(chip => {
        // Ne pas permettre de drag le chip "Tout"
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
    
    setTimeout(() => {
        this.style.opacity = '0.5';
    }, 0);
}

function handleProjectDragEnd(e) {
    this.classList.remove('dragging-project');
    this.style.opacity = '';
    draggedProject = null;
    
    document.body.classList.remove('is-dragging-project');
    
    document.querySelectorAll('.project-chip').forEach(chip => {
        chip.classList.remove('drag-over-project', 'drag-over-project-left', 'drag-over-project-right');
    });
}

function handleProjectDragOver(e) {
    e.preventDefault();
    if (!draggedProject || draggedProject === this) return;
    
    // Déterminer si on est à gauche ou à droite du chip
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
    
    // Accéder au tableau global des projets
    if (!window.projects) return;
    
    const draggedIndex = window.projects.findIndex(p => p.id === draggedId);
    const targetIndex = window.projects.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Déterminer si on insère avant ou après
    const rect = this.getBoundingClientRect();
    const insertAfter = e.clientX > rect.left + rect.width / 2;
    
    // Retirer le projet dragué
    const [draggedProjectData] = window.projects.splice(draggedIndex, 1);
    
    // Trouver la nouvelle position (recalculer car l'index a changé)
    let newTargetIndex = window.projects.findIndex(p => p.id === targetId);
    if (insertAfter) newTargetIndex++;
    
    // Insérer à la nouvelle position
    window.projects.splice(newTargetIndex, 0, draggedProjectData);
    
    // Sauvegarder l'ordre
    saveProjectsOrder();
    
    // Re-render
    if (typeof renderProjectsFilter === 'function') renderProjectsFilter();
    if (typeof renderProjectSelect === 'function') renderProjectSelect();
    
    console.log(`✅ Projet réorganisé: ${draggedProjectData.name}`);
}

// =============================================
// PERSISTENCE ORDRE PROJETS
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
        
        // Réorganiser les projets selon l'ordre sauvegardé
        const reordered = [];
        order.forEach(id => {
            const project = window.projects.find(p => p.id === id);
            if (project) reordered.push(project);
        });
        
        // Ajouter les projets qui ne sont pas dans l'ordre (nouveaux)
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

// Rendre les fonctions accessibles globalement
window.initDragAndDrop = initDragAndDrop;
window.initTaskDragAndDrop = initTaskDragAndDrop;
window.initProjectDragAndDrop = initProjectDragAndDrop;
window.loadProjectsOrder = loadProjectsOrder;
window.saveProjectsOrder = saveProjectsOrder;

console.log('📦 dragdrop.js loaded');
