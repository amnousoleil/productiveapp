// =============================================
// PRODUCTIVEAPP - APP.JS
// Version API PostgreSQL (Tasks + Journal)
// =============================================

// === CONFIGURATION API ===
const API_TASKS = 'https://n8n.srv1053121.hstgr.cloud/webhook/tasks';
const API_JOURNAL = 'https://n8n.srv1053121.hstgr.cloud/webhook/journal';
const TENANT_ID = 'digitalgiri';

// === CONFIGURATION N8N ===
const CHATBOT_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc';

// === UTILISATEURS ===
const USERS = [
    { id: 'maha', name: 'Maha Giri', avatar: '👑', password: 'Autopdutop63.G+htrhs7', role: 'boss' },
    { id: 'brice', name: 'Brice', avatar: '🧑‍💻', password: 'Autopdutop63.G+htrhs7', role: 'team' }
];

// === PROJETS PAR DÉFAUT ===
const DEFAULT_PROJECTS = [
    { id: 'bible', name: 'Bible des Thérapeutes', icon: '📖', color: '#e07840', desc: 'Livre + examen pour les thérapeutes' },
    { id: 'academie', name: 'Académie', icon: '🎓', color: '#f5e6d3', desc: 'Formations, abonnements mensuels, contenu' },
    { id: 'lives', name: 'Lives Quotidiens', icon: '🎥', color: '#a89078', desc: 'Contenu live daily' },
    { id: 'entreprise', name: 'Entreprise Interne', icon: '🏢', color: '#2d2117', desc: 'RH, recrutement, personnel, orga interne' },
    { id: 'brice', name: 'Évolution Brice', icon: '🚀', color: '#22c55e', desc: 'Suivi progression de Brice' },
    { id: 'retraites', name: 'Retraites Spirituelles', icon: '🧘', color: '#8b5cf6', desc: 'Organisation des retraites' },
    { id: 'digital', name: 'Digital Giri', icon: '💻', color: '#3b82f6', desc: 'La marque, le business global' },
    { id: 'agents', name: 'Agents IA', icon: '🤖', color: '#ec4899', desc: 'Projets tech, automation, IA' },
    { id: 'voyages', name: 'Voyages Monde', icon: '✈️', color: '#f59e0b', desc: 'Déplacements, logistics internationale' },
    { id: 'perso', name: 'Perso Maha', icon: '🌟', color: '#fbbf24', desc: 'Vie personnelle' },
    { id: 'general', name: 'Général', icon: '📌', color: '#6b7280', desc: 'Tâches diverses' }
];

// === THÈMES (10 thèmes) ===
const THEMES = [
    { id: 'academie', name: '📚 Académie' },
    { id: 'desert', name: '🏜️ Désert' },
    { id: 'matrix', name: '💚 Matrix' },
    { id: 'bubblegum', name: '🍬 Bubblegum' },
    { id: 'midnight', name: '🌙 Midnight' },
    { id: 'ocean', name: '🌊 Océan' },
    { id: 'fantasy', name: '🔮 Fantasy' },
    { id: 'sunset', name: '🌅 Sunset' },
    { id: 'forest', name: '🌲 Forest' },
    { id: 'hacker', name: '🖤 Hacker' }
];

// === STATE ===
let currentUser = null;
let tasks = [];
let journal = [];
let projects = DEFAULT_PROJECTS;

let activeProjectFilter = 'all';
let activeUserFilter = 'all';
let viewMode = localStorage.getItem('viewMode') || 'columns';
let chatbotLarge = localStorage.getItem('chatbot-large') === 'true';
let lastReportData = null;

// === DOM ELEMENTS ===
const $ = id => document.getElementById(id);

// =============================================
// API TASKS
// =============================================

async function loadTasksFromAPI() {
    try {
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get', tenant_id: TENANT_ID })
        });
        const data = await response.json();
        
        tasks = data.map(t => ({
            id: t.task_id,
            text: t.text,
            status: t.status,
            priority: { level: t.priority, label: getPriorityLabel(t.priority) },
            project: t.project_id,
            userId: t.user_id,
            userName: getUserName(t.user_id),
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            completedAt: t.completed_at
        }));
        
        console.log(`✅ ${tasks.length} tâches chargées`);
        return tasks;
    } catch (error) {
        console.error('❌ Erreur chargement tasks:', error);
        return [];
    }
}

async function createTaskAPI(taskData) {
    try {
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                tenant_id: TENANT_ID,
                task_id: 'task_' + Date.now(),
                user_id: taskData.userId,
                project_id: taskData.project,
                text: taskData.text,
                priority: taskData.priority.level
            })
        });
        const result = await response.json();
        console.log('✅ Tâche créée:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur création task:', error);
        return null;
    }
}

async function updateTaskAPI(taskId, status, priority) {
    try {
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                tenant_id: TENANT_ID,
                task_id: taskId,
                status: status,
                priority: priority
            })
        });
        const result = await response.json();
        console.log('✅ Tâche mise à jour:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur update task:', error);
        return null;
    }
}

async function deleteTaskAPI(taskId) {
    try {
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                tenant_id: TENANT_ID,
                task_id: taskId
            })
        });
        const result = await response.json();
        console.log('✅ Tâche supprimée:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur delete task:', error);
        return null;
    }
}

// =============================================
// API JOURNAL
// =============================================

async function loadJournalFromAPI() {
    try {
        const response = await fetch(API_JOURNAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get', tenant_id: TENANT_ID })
        });
        const data = await response.json();
        
        journal = data.map(j => ({
            id: j.id,
            category: j.category,
            text: j.text,
            energy: j.energy,
            time: new Date(j.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: j.created_at,
            userId: j.user_id,
            userName: getUserName(j.user_id)
        }));
        
        console.log(`✅ ${journal.length} entrées journal chargées`);
        return journal;
    } catch (error) {
        console.error('❌ Erreur chargement journal:', error);
        return [];
    }
}

async function createJournalAPI(entry) {
    try {
        const response = await fetch(API_JOURNAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                tenant_id: TENANT_ID,
                user_id: entry.userId,
                category: entry.category,
                text: entry.text,
                energy: entry.energy
            })
        });
        const result = await response.json();
        console.log('✅ Entrée journal créée:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur création journal:', error);
        return null;
    }
}

// =============================================
// UTILS
// =============================================

function getPriorityLabel(level) {
    const labels = { 1: 'Urgent', 2: 'Normal', 3: 'Basse' };
    return labels[level] || 'Normal';
}

function getUserName(userId) {
    const user = USERS.find(u => u.id === userId);
    return user ? user.name : userId;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================
// AUTHENTIFICATION
// =============================================

function renderUserSelect() {
    const grid = $('user-select-grid');
    if (!grid) return;
    
    grid.innerHTML = USERS.map(user => `
        <button class="user-select-btn" data-userid="${user.id}">
            <span class="user-avatar-big">${user.avatar}</span>
            <span class="user-name-select">${user.name}</span>
        </button>
    `).join('');
    
    grid.querySelectorAll('.user-select-btn').forEach(btn => {
        btn.addEventListener('click', () => selectUser(btn.dataset.userid));
    });
}

function selectUser(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;
    
    currentUser = user;
    $('login-username').textContent = `${user.avatar} ${user.name}`;
    $('user-select-grid').classList.add('hidden');
    $('password-form').classList.remove('hidden');
    $('login-password').focus();
}

function attemptLogin() {
    const password = $('login-password').value;
    
    if (password === currentUser.password) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        $('login-screen').classList.add('hidden');
        $('login-error').textContent = '';
        initApp();
    } else {
        $('login-error').textContent = 'Mot de passe incorrect';
        $('login-password').value = '';
        $('login-password').focus();
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    $('login-screen').classList.remove('hidden');
    $('user-select-grid').classList.remove('hidden');
    $('password-form').classList.add('hidden');
    $('login-password').value = '';
    $('login-error').textContent = '';
}

function checkExistingSession() {
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        $('login-screen').classList.add('hidden');
        initApp();
        return true;
    }
    return false;
}

// =============================================
// INITIALISATION
// =============================================

async function initApp() {
    $('current-user-badge').innerHTML = `
        <span class="user-avatar">${currentUser.avatar}</span>
        <span class="user-name">${currentUser.name}</span>
    `;
    
    loadTheme();
    loadViewMode();
    renderProjectsFilter();
    renderProjectSelect();
    renderUserFilter();
    
    // Charger depuis PostgreSQL
    await Promise.all([
        loadTasksFromAPI(),
        loadJournalFromAPI()
    ]);
    
    renderTasks();
    renderJournal();
    
    setTimeout(() => {
        if (typeof initAnimation === 'function') initAnimation();
    }, 100);
    
    console.log('✅ App initialized avec PostgreSQL');
}

// =============================================
// THÈMES
// =============================================

function setTheme(themeId) {
    if (themeId === 'desert') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeId);
    }
    localStorage.setItem('theme', themeId);
    
    if (typeof resetAnimationForTheme === 'function') {
        resetAnimationForTheme();
    }
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'academie';
    setTheme(saved);
    
    const idx = THEMES.findIndex(t => t.id === saved);
    if (idx !== -1) {
        $('theme-slider').value = idx;
        $('theme-name').textContent = THEMES[idx].name;
    }
}

// =============================================
// VUE MODE
// =============================================

function loadViewMode() {
    viewMode = localStorage.getItem('viewMode') || 'columns';
    updateViewMode();
}

function toggleViewMode() {
    viewMode = viewMode === 'columns' ? 'bubbles' : 'columns';
    localStorage.setItem('viewMode', viewMode);
    updateViewMode();
    renderTasks();
}

function updateViewMode() {
    const columnsView = $('columns-view');
    const bubblesView = $('bubbles-view');
    const toggleBtn = $('view-toggle-btn');
    
    if (viewMode === 'columns') {
        columnsView.classList.remove('hidden');
        bubblesView.classList.add('hidden');
        toggleBtn.textContent = '📊';
        toggleBtn.title = 'Mode Bulles';
    } else {
        columnsView.classList.add('hidden');
        bubblesView.classList.remove('hidden');
        toggleBtn.textContent = '📋';
        toggleBtn.title = 'Mode Colonnes';
    }
}

// =============================================
// PROJETS
// =============================================

function renderProjectsFilter() {
    const counts = {};
    projects.forEach(p => {
        counts[p.id] = tasks.filter(t => t.project === p.id && t.status !== 'done').length;
    });
    const totalCount = tasks.filter(t => t.status !== 'done').length;
    
    $('count-all').textContent = totalCount;
    
    $('projects-filter-list').innerHTML = projects.map(p => `
        <button class="project-chip ${activeProjectFilter === p.id ? 'active' : ''}" data-project="${p.id}">
            <span class="chip-icon">${p.icon}</span>
            <span class="chip-name">${p.name}</span>
            <span class="chip-count">${counts[p.id] || 0}</span>
        </button>
    `).join('');
    
    document.querySelectorAll('.project-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.project-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeProjectFilter = btn.dataset.project;
            renderTasks();
        });
    });
}

function renderProjectSelect() {
    $('project-select').innerHTML = '<option value="">Projet...</option>' + 
        projects.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('');
}

function getProject(projectId) {
    return projects.find(p => p.id === projectId) || projects.find(p => p.id === 'general');
}

function renderUserFilter() {
    $('user-filter-select').innerHTML = '<option value="all">👥 Tout le monde</option>' +
        USERS.map(u => `<option value="${u.id}">${u.avatar} ${u.name}</option>`).join('');
}

// =============================================
// TÂCHES
// =============================================

async function createTask() {
    const text = $('task-input').value.trim();
    if (!text) return;
    
    const projectId = $('project-select').value || 'general';
    const priorityLevel = parseInt($('priority-select').value) || 2;
    
    const taskData = {
        text: text,
        project: projectId,
        priority: { level: priorityLevel, label: getPriorityLabel(priorityLevel) },
        userId: currentUser.id,
        userName: currentUser.name
    };
    
    const result = await createTaskAPI(taskData);
    
    if (result && result.length > 0) {
        const newTask = result[0];
        tasks.push({
            id: newTask.task_id,
            text: newTask.text,
            status: newTask.status,
            priority: { level: newTask.priority, label: getPriorityLabel(newTask.priority) },
            project: newTask.project_id,
            userId: newTask.user_id,
            userName: getUserName(newTask.user_id),
            createdAt: newTask.created_at,
            updatedAt: newTask.updated_at
        });
        
        renderTasks();
        renderProjectsFilter();
        
        await addJournalEntry('task', `📝 Créé: ${text}`, 2);
    }
    
    $('task-input').value = '';
    $('project-select').value = '';
    $('priority-select').value = '2';
}

function renderTasks() {
    let filtered = tasks;
    
    if (activeProjectFilter !== 'all') {
        filtered = filtered.filter(t => t.project === activeProjectFilter);
    }
    if (activeUserFilter !== 'all') {
        filtered = filtered.filter(t => t.userId === activeUserFilter);
    }
    
    const todo = filtered.filter(t => t.status === 'todo').sort((a, b) => a.priority.level - b.priority.level);
    const inprogress = filtered.filter(t => t.status === 'inprogress');
    const done = filtered.filter(t => t.status === 'done').slice(0, 20);
    
    if (viewMode === 'columns') {
        renderColumnsView(todo, inprogress, done);
    } else {
        renderBubblesView(todo, inprogress, done);
    }
    
    attachTaskEvents();
}

function renderColumnsView(todo, inprogress, done) {
    $('todo-count').textContent = todo.length;
    $('inprogress-count').textContent = inprogress.length;
    $('done-count').textContent = done.length;
    
    $('todo-list').innerHTML = todo.length ? todo.map(t => renderTaskHTML(t)).join('') : '<div class="empty-state">Aucune tâche</div>';
    $('inprogress-list').innerHTML = inprogress.length ? inprogress.map(t => renderTaskHTML(t)).join('') : '<div class="empty-state">Rien en cours</div>';
    $('done-list').innerHTML = done.length ? done.map(t => renderTaskHTML(t)).join('') : '<div class="empty-state">Rien terminé</div>';
}

function renderBubblesView(todo, inprogress, done) {
    const allTodo = [...todo, ...inprogress];
    $('bubbles-todo').innerHTML = allTodo.length ? allTodo.map(t => renderTaskHTML(t)).join('') : '<div class="empty-state">Aucune tâche</div>';
    $('bubbles-done').innerHTML = done.length ? done.map(t => renderTaskHTML(t)).join('') : '<div class="empty-state">Rien terminé</div>';
}

function renderTaskHTML(task) {
    const project = getProject(task.project);
    const isOwn = task.userId === currentUser.id;
    
    return `
        <div class="bubble ${task.status}" data-id="${task.id}">
            <div class="bubble-header">
                <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon} ${project.name}</span>
                <span class="task-priority ${task.priority.level === 1 ? 'urgent' : ''}">${task.priority.label}</span>
                ${!isOwn ? `<span class="task-user">${task.userName}</span>` : ''}
            </div>
            <div class="bubble-text">${escapeHtml(task.text)}</div>
            <div class="task-actions">
                ${task.status === 'todo' ? `<button class="task-action-btn start" data-action="start">▶️ Commencer</button>` : ''}
                ${task.status === 'inprogress' ? `<button class="task-action-btn complete" data-action="done">✅ Terminé</button>` : ''}
                ${task.status === 'todo' ? `<button class="task-action-btn complete" data-action="done">✅ Fait</button>` : ''}
                <button class="task-action-btn delete" data-action="delete">🗑️</button>
            </div>
        </div>
    `;
}

function attachTaskEvents() {
    document.querySelectorAll('.task-action-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskEl = newBtn.closest('.bubble');
            if (!taskEl) return;
            
            const taskId = taskEl.dataset.id;
            const action = newBtn.dataset.action;
            handleTaskAction(taskId, action);
        });
    });
}

async function handleTaskAction(taskId, action) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    if (action === 'start') {
        await updateTaskAPI(taskId, 'inprogress', task.priority.level);
        task.status = 'inprogress';
        task.updatedAt = new Date().toISOString();
        await addJournalEntry('task', `🔄 Commencé: ${task.text}`, 2);
        
    } else if (action === 'done') {
        await updateTaskAPI(taskId, 'done', task.priority.level);
        task.status = 'done';
        task.completedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        await addJournalEntry('win', `✅ Terminé: ${task.text}`, 3);
        
    } else if (action === 'delete') {
        await deleteTaskAPI(taskId);
        tasks.splice(taskIndex, 1);
        await addJournalEntry('task', `🗑️ Supprimé: ${task.text}`, 2);
    }
    
    renderTasks();
    renderProjectsFilter();
}

// =============================================
// JOURNAL
// =============================================

async function addJournalEntry(category, text, energy) {
    const entry = {
        category: category,
        text: text,
        energy: energy,
        userId: currentUser.id,
        userName: currentUser.name
    };
    
    const result = await createJournalAPI(entry);
    
    if (result && result.length > 0) {
        const newEntry = result[0];
        journal.unshift({
            id: newEntry.id,
            category: newEntry.category,
            text: newEntry.text,
            energy: newEntry.energy,
            time: new Date(newEntry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: newEntry.created_at,
            userId: newEntry.user_id,
            userName: getUserName(newEntry.user_id)
        });
        renderJournal();
    }
}

async function createJournalEntry() {
    const text = $('journal-input').value.trim();
    if (text) {
        await addJournalEntry($('journal-category').value, text, parseInt($('journal-energy').value));
        $('journal-input').value = '';
    }
}

function renderJournal() {
    const today = new Date().toDateString();
    let entries = journal.filter(e => new Date(e.date).toDateString() === today);
    
    if (activeUserFilter !== 'all') {
        entries = entries.filter(e => e.userId === activeUserFilter);
    }
    
    const stats = {
        total: entries.length,
        wins: entries.filter(e => e.category === 'win').length,
        ideas: entries.filter(e => e.category === 'idea').length,
        blockers: entries.filter(e => e.category === 'blocker').length
    };
    
    $('journal-stats').innerHTML = `
        <span>📝 ${stats.total}</span>
        <span>🏆 ${stats.wins}</span>
        <span>💡 ${stats.ideas}</span>
        <span>🚧 ${stats.blockers}</span>
    `;
    
    const catIcons = { task: '✅', idea: '💡', reflection: '🤔', blocker: '🚧', win: '🏆' };
    const energyLabels = { 1: 'low', 2: 'normal', 3: 'high' };
    const energyText = { 1: '😴', 2: '😊', 3: '⚡' };
    
    $('journal-entries').innerHTML = entries.length ? entries.map(e => `
        <div class="journal-entry">
            <span class="entry-category">${catIcons[e.category] || '📝'}</span>
            <div class="entry-content">
                <div class="entry-text">${escapeHtml(e.text)}</div>
                <div class="entry-meta">
                    <span>${e.time}</span>
                    <span>${e.userName}</span>
                    <span class="entry-energy ${energyLabels[e.energy]}">${energyText[e.energy]}</span>
                </div>
            </div>
        </div>
    `).join('') : '<div class="empty-state">Aucune entrée aujourd\'hui</div>';
}

// =============================================
// CHATBOT IA
// =============================================

function toggleChatbot() {
    $('chatbot-window').classList.toggle('hidden');
    if (!$('chatbot-window').classList.contains('hidden')) {
        $('chatbot-input').focus();
    }
}

function toggleChatbotSize() {
    chatbotLarge = !chatbotLarge;
    localStorage.setItem('chatbot-large', chatbotLarge);
    $('chatbot-window').classList.toggle('large', chatbotLarge);
}

async function sendChatMessage() {
    const message = $('chatbot-input').value.trim();
    if (!message) return;
    
    addChatMsg(message, 'user');
    $('chatbot-input').value = '';
    const loadingDiv = addChatMsg('Réflexion...', 'assistant loading');
    
    try {
        const context = buildAIContext();
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context, user: currentUser.name, userId: currentUser.id })
        });
        
        let aiResponse = await response.text();
        try { const j = JSON.parse(aiResponse); aiResponse = j.response || j.text || aiResponse; } catch(e) {}
        
        loadingDiv.remove();
        aiResponse = await processAIActions(aiResponse);
        addChatMsg(aiResponse || 'OK!', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMsg('Erreur de connexion', 'assistant');
    }
}

function buildAIContext() {
    const todo = tasks.filter(t => t.status === 'todo');
    const inProgress = tasks.filter(t => t.status === 'inprogress');
    const today = new Date().toDateString();
    const todayJournal = journal.filter(e => new Date(e.date).toDateString() === today);
    
    const urgent = todo.filter(t => t.priority.level === 1);
    
    let ctx = `=== EMPIRE DIGITAL GIRI ===\nUser: ${currentUser.name} (${currentUser.role})\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    ctx += `🔥 URGENT: ${urgent.length} | 📋 À faire: ${todo.length} | 🔄 En cours: ${inProgress.length}\n\n`;
    
    if (urgent.length) {
        ctx += `URGENTS:\n${urgent.map(t => `- ${t.text} (${getProject(t.project).name})`).join('\n')}\n\n`;
    }
    
    if (inProgress.length) {
        ctx += `EN COURS:\n${inProgress.map(t => `- ${t.text}`).join('\n')}\n\n`;
    }
    
    projects.forEach(p => {
        const pTodo = todo.filter(t => t.project === p.id);
        if (pTodo.length) {
            ctx += `📁 ${p.name}: ${pTodo.map(t => t.text).join(', ')}\n`;
        }
    });
    
    ctx += `\nJOURNAL: ${todayJournal.slice(0, 5).map(e => e.text).join(' | ') || 'Vide'}`;
    
    return ctx;
}

async function processAIActions(response) {
    if (response.includes('ACTION:CREATE|')) {
        for (const m of [...response.matchAll(/ACTION:CREATE\|([^\n]+)/g)]) {
            const taskData = {
                text: m[1].trim(),
                project: activeProjectFilter !== 'all' ? activeProjectFilter : 'general',
                priority: { level: 2, label: 'Normal' },
                userId: currentUser.id,
                userName: currentUser.name
            };
            
            const result = await createTaskAPI(taskData);
            if (result && result.length > 0) {
                const newTask = result[0];
                tasks.push({
                    id: newTask.task_id,
                    text: newTask.text,
                    status: newTask.status,
                    priority: { level: newTask.priority, label: getPriorityLabel(newTask.priority) },
                    project: newTask.project_id,
                    userId: newTask.user_id,
                    userName: getUserName(newTask.user_id),
                    createdAt: newTask.created_at,
                    updatedAt: newTask.updated_at
                });
            }
        }
        renderTasks();
        renderProjectsFilter();
        response = response.replace(/ACTION:CREATE\|[^\n]+/g, '') + '\n✅ Tâche créée!';
    }
    
    if (response.includes('ACTION:DONE|')) {
        for (const m of [...response.matchAll(/ACTION:DONE\|([^\n]+)/g)]) {
            const t = tasks.find(t => t.status !== 'done' && t.text.toLowerCase().includes(m[1].trim().toLowerCase()));
            if (t) {
                await updateTaskAPI(t.id, 'done', t.priority.level);
                t.status = 'done';
                t.completedAt = new Date().toISOString();
            }
        }
        renderTasks();
        renderProjectsFilter();
        response = response.replace(/ACTION:DONE\|[^\n]+/g, '') + '\n✅ Terminé!';
    }
    
    return response.trim();
}

function addChatMsg(text, cls) {
    const div = document.createElement('div');
    div.className = `chat-msg ${cls}`;
    div.textContent = text;
    $('chatbot-messages').appendChild(div);
    $('chatbot-messages').scrollTop = $('chatbot-messages').scrollHeight;
    return div;
}

// =============================================
// RAPPORT
// =============================================

async function generateReport() {
    $('report-content').innerHTML = '<p style="color:var(--text-muted)">🔮 Génération...</p>';
    $('download-pdf-btn').classList.add('hidden');
    
    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Génère un rapport de direction concis avec: synthèse, accomplissements, points attention, recommandations.',
                context: buildAIContext(),
                user: currentUser.name,
                type: 'report'
            })
        });
        
        let ai = await response.text();
        try { const j = JSON.parse(ai); ai = j.response || j.text || ai; } catch(e) {}
        ai = ai.replace(/ACTION:[A-Z]+\|[^\n]*/g, '').trim();
        
        lastReportData = { ai: ai, date: new Date() };
        showReport(ai);
        $('download-pdf-btn').classList.remove('hidden');
    } catch(e) {
        $('report-content').innerHTML = '<p style="color:var(--danger)">Erreur de génération</p>';
    }
}

function showReport(ai) {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProg = tasks.filter(t => t.status === 'inprogress').length;
    const todayStr = new Date().toDateString();
    const done = tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === todayStr).length;
    
    $('report-content').innerHTML = `
        <h3>📊 Rapport - ${new Date().toLocaleDateString('fr-FR')}</h3>
        <div style="display:flex;gap:16px;margin:16px 0">
            <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--accent)">${todo}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">À faire</div>
            </div>
            <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--warning)">${inProg}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">En cours</div>
            </div>
            <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--success)">${done}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Terminées</div>
            </div>
        </div>
        ${ai ? `<div style="background:var(--bg-card);padding:16px;border-radius:12px;border-left:3px solid var(--accent);white-space:pre-wrap;line-height:1.6">${escapeHtml(ai)}</div>` : ''}
    `;
}

function downloadPDF() {
    if (!lastReportData) return alert('Génère un rapport d\'abord');
    
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(224, 120, 64);
    doc.rect(0, 0, w, 25, 'F');
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DIGITAL GIRI', w/2, 15, { align: 'center' });
    
    let y = 40;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (lastReportData.ai) {
        const lines = doc.splitTextToSize(lastReportData.ai, w - 40);
        lines.forEach(function(line) {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(line, 20, y);
            y += 5;
        });
    }
    
    doc.save('rapport_' + lastReportData.date.toLocaleDateString('fr-FR').replace(/\//g, '-') + '.pdf');
}

// =============================================
// MODALS
// =============================================

function openProjectModal() {
    $('project-modal').classList.remove('hidden');
    $('new-project-name').focus();
}

function closeProjectModal() {
    $('project-modal').classList.add('hidden');
    $('new-project-name').value = '';
    $('new-project-desc').value = '';
}

function createProject() {
    const name = $('new-project-name').value.trim();
    const desc = $('new-project-desc').value.trim();
    if (!name) return;
    
    const icons = ['📁', '🎯', '💡', '🚀', '⭐', '🔥', '💎', '🌟'];
    const colors = ['#e07840', '#00ff66', '#ff6b9d', '#6c8fff', '#00b4d8', '#bf6bff', '#f97316', '#4ade80'];
    
    projects.push({
        id: 'proj_' + Date.now(),
        name: name,
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        desc: desc || name
    });
    
    renderProjectsFilter();
    renderProjectSelect();
    closeProjectModal();
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ProductiveApp Starting (PostgreSQL Mode)...');
    
    renderUserSelect();
    
    $('login-btn').addEventListener('click', attemptLogin);
    $('login-password').addEventListener('keypress', function(e) { if (e.key === 'Enter') attemptLogin(); });
    $('back-btn').addEventListener('click', function() {
        $('user-select-grid').classList.remove('hidden');
        $('password-form').classList.add('hidden');
        $('login-error').textContent = '';
        currentUser = null;
    });
    $('logout-btn').addEventListener('click', logout);
    
    $('add-task-btn').addEventListener('click', createTask);
    $('task-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createTask(); });
    
    $('view-toggle-btn').addEventListener('click', toggleViewMode);
    
    $('user-filter-select').addEventListener('change', function() {
        activeUserFilter = $('user-filter-select').value;
        renderTasks();
        renderJournal();
    });
    
    $('theme-btn').addEventListener('click', function() { $('theme-modal').classList.remove('hidden'); });
    $('close-theme-modal').addEventListener('click', function() { $('theme-modal').classList.add('hidden'); });
    $('theme-modal').addEventListener('click', function(e) { if (e.target === $('theme-modal')) $('theme-modal').classList.add('hidden'); });
    $('theme-slider').addEventListener('input', function() {
        const theme = THEMES[parseInt($('theme-slider').value)];
        setTheme(theme.id);
        $('theme-name').textContent = theme.name;
    });
    
    $('add-project-btn').addEventListener('click', openProjectModal);
    $('cancel-project').addEventListener('click', closeProjectModal);
    $('confirm-project').addEventListener('click', createProject);
    $('project-modal').addEventListener('click', function(e) { if (e.target === $('project-modal')) closeProjectModal(); });
    
    $('add-journal-btn').addEventListener('click', createJournalEntry);
    $('journal-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createJournalEntry(); });
    
    $('generate-report-btn').addEventListener('click', generateReport);
    $('download-pdf-btn').addEventListener('click', downloadPDF);
    
    $('chatbot-toggle').addEventListener('click', toggleChatbot);
    $('chatbot-close').addEventListener('click', function() { $('chatbot-window').classList.add('hidden'); });
    $('chatbot-resize').addEventListener('click', toggleChatbotSize);
    $('chatbot-send').addEventListener('click', sendChatMessage);
    $('chatbot-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') sendChatMessage(); });
    
    checkExistingSession();
    
    console.log('✅ ProductiveApp Ready (PostgreSQL Mode)');
});
