// =============================================
// PRODUCTIVEAPP - APP.JS
// Logique principale + Webhooks N8N
// =============================================

// === CONFIGURATION N8N (NE PAS MODIFIER) ===
const N8N_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/b44d5f39-8f25-4fb0-9fcf-d69be1ffa1a1';
const CHATBOT_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc';

// === UTILISATEURS ===
const USERS = [
    { id: 'maha', name: 'Maha Giri', avatar: '👑', password: 'Autopdutop63.G+htrhs7', role: 'boss' },
    { id: 'brice', name: 'Brice', avatar: '🧑‍💻', password: 'Autopdutop63.G+htrhs7', role: 'team' }
];

// === PROJETS PAR DÉFAUT ===
const DEFAULT_PROJECTS = [
    { id: 'bible', name: 'Bible des Thérapeutes', icon: '📖', color: '#6c8fff', desc: 'Livre + examen pour les thérapeutes' },
    { id: 'academie', name: 'Académie', icon: '🎓', color: '#4ade80', desc: 'Formations, abonnements mensuels, contenu' },
    { id: 'lives', name: 'Lives Quotidiens', icon: '🎬', color: '#ff6b9d', desc: 'Contenu live daily' },
    { id: 'entreprise', name: 'Entreprise Interne', icon: '🏢', color: '#f97316', desc: 'RH, recrutement, personnel, orga interne' },
    { id: 'brice-evolution', name: 'Évolution Brice', icon: '👨‍🎓', color: '#00b4d8', desc: 'Suivi progression de Brice' },
    { id: 'retraites', name: 'Retraites Spirituelles', icon: '🧘', color: '#bf6bff', desc: 'Organisation des retraites' },
    { id: 'digital-giri', name: 'Digital Giri', icon: '💻', color: '#ffd700', desc: 'La marque, le business global' },
    { id: 'agents-ia', name: 'Agents IA', icon: '🤖', color: '#00ff66', desc: 'Projets tech, automation, IA' },
    { id: 'voyages', name: 'Voyages Monde', icon: '✈️', color: '#48cae4', desc: 'Déplacements, logistics internationale' },
    { id: 'perso-maha', name: 'Perso Maha', icon: '💜', color: '#ff6b9d', desc: 'Vie personnelle' },
    { id: 'general', name: 'Général', icon: '📋', color: '#a89078', desc: 'Tâches diverses' }
];

// === THÈMES ===
const THEMES = [
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
let tasks = JSON.parse(localStorage.getItem('tasks_v3')) || [];
let journal = JSON.parse(localStorage.getItem('journal_v3')) || [];
let projects = JSON.parse(localStorage.getItem('projects_v3')) || DEFAULT_PROJECTS;

let activeProjectFilter = 'all';
let activeUserFilter = 'all';
let viewMode = localStorage.getItem('viewMode') || 'columns'; // 'columns' ou 'bubbles'

// === DOM ELEMENTS ===
const $ = id => document.getElementById(id);

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

function initApp() {
    // Update user badge
    $('current-user-badge').innerHTML = `
        <span class="user-avatar">${currentUser.avatar}</span>
        <span class="user-name">${currentUser.name}</span>
    `;
    
    // Load settings
    loadTheme();
    loadViewMode();
    
    // Render UI
    renderProjectsFilter();
    renderProjectSelect();
    renderUserFilter();
    renderTasks();
    renderJournal();
    
    // Start animations
    setTimeout(() => {
        if (typeof initAnimation === 'function') initAnimation();
    }, 100);
    
    console.log('✅ App initialized');
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
    
    // Reset animations pour le nouveau thème
    if (typeof resetAnimationForTheme === 'function') {
        resetAnimationForTheme();
    }
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'desert';
    setTheme(saved);
    
    const idx = THEMES.findIndex(t => t.id === saved);
    if (idx !== -1) {
        $('theme-slider').value = idx;
        $('theme-name').textContent = THEMES[idx].name;
    }
}

// =============================================
// VUE MODE (Colonnes vs Bulles)
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
    
    // Event listeners
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
// UTILS
// =============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveTasks() {
    localStorage.setItem('tasks_v3', JSON.stringify(tasks));
}

function saveJournal() {
    localStorage.setItem('journal_v3', JSON.stringify(journal));
}

function saveProjects() {
    localStorage.setItem('projects_v3', JSON.stringify(projects));
}

async function sendToN8N(type, data) {
    try {
        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, user: currentUser.name, ...data })
        });
    } catch (e) {
        console.error('N8N Error:', e);
    }
}
// =============================================
// TÂCHES
// =============================================

function createTask() {
    const text = $('task-input').value.trim();
    if (!text) return;
    
    const projectId = $('project-select').value || 'general';
    const priorityLevel = parseInt($('priority-select').value) || 2;
    const priorityLabels = { 1: 'Urgent', 2: 'Normal', 3: 'Basse' };
    
    const task = {
        id: Date.now(),
        text: text,
        status: 'todo',
        priority: { level: priorityLevel, label: priorityLabels[priorityLevel] },
        project: projectId,
        userId: currentUser.id,
        userName: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    renderProjectsFilter();
    
    $('task-input').value = '';
    $('project-select').value = '';
    $('priority-select').value = '2';
    
    sendToN8N('task', task);
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
        <div class="task-bubble ${task.status}" data-id="${task.id}">
            <div class="task-header">
                <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon} ${project.name}</span>
                <span class="task-priority ${task.priority.level === 1 ? 'urgent' : ''}">${task.priority.label}</span>
                ${!isOwn ? `<span class="task-user">${task.userName}</span>` : ''}
            </div>
            <div class="task-text">${escapeHtml(task.text)}</div>
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
            const taskEl = newBtn.closest('.task-bubble');
            if (!taskEl) return;
            
            const taskId = Number(taskEl.dataset.id);
            const action = newBtn.dataset.action;
            handleTaskAction(taskId, action);
        });
    });
}

function handleTaskAction(taskId, action) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    if (action === 'start') {
        task.status = 'inprogress';
        task.startedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        addJournalEntry('task', `🔄 Commencé: ${task.text}`, 2);
    } else if (action === 'done') {
        task.status = 'done';
        task.completedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        addJournalEntry('win', `✅ Terminé: ${task.text}`, 3);
    } else if (action === 'delete') {
        tasks.splice(taskIndex, 1);
        addJournalEntry('task', `🗑️ Supprimé: ${task.text}`, 2);
    }
    
    saveTasks();
    renderTasks();
    renderProjectsFilter();
}

// =============================================
// JOURNAL AMÉLIORÉ
// =============================================

function addJournalEntry(category, text, energy) {
    journal.unshift({
        id: Date.now(),
        category: category,
        text: text,
        energy: energy,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name
    });
    saveJournal();
    renderJournal();
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

let chatbotLarge = localStorage.getItem('chatbot-large') === 'true';

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
        aiResponse = processAIActions(aiResponse);
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

function processAIActions(response) {
    if (response.includes('ACTION:CREATE|')) {
        [...response.matchAll(/ACTION:CREATE\|([^\n]+)/g)].forEach(m => {
            tasks.push({
                id: Date.now() + Math.random(),
                text: m[1].trim(),
                status: 'todo',
                priority: { level: 2, label: 'Normal' },
                project: activeProjectFilter !== 'all' ? activeProjectFilter : 'general',
                userId: currentUser.id,
                userName: currentUser.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        saveTasks(); renderTasks(); renderProjectsFilter();
        response = response.replace(/ACTION:CREATE\|[^\n]+/g, '') + '\n✅ Tâche créée!';
    }
    
    if (response.includes('ACTION:DONE|')) {
        [...response.matchAll(/ACTION:DONE\|([^\n]+)/g)].forEach(m => {
            const t = tasks.find(t => t.status !== 'done' && t.text.toLowerCase().includes(m[1].trim().toLowerCase()));
            if (t) { t.status = 'done'; t.completedAt = new Date().toISOString(); }
        });
        saveTasks(); renderTasks(); renderProjectsFilter();
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

let lastReport = null;

async function generateReport() {
    $('report-content').innerHTML = '<p style="color:var(--text-muted)">🔮 Génération...</p>';
    $('download-pdf-btn').classList.add('hidden');
    
    const today = new Date().toDateString();
    const todayDone = tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === today);
    const todo = tasks.filter(t => t.status === 'todo');
    const inProg = tasks.filter(t => t.status === 'inprogress');
    
    const metrics = { todo: todo.length, inProg: inProg.length, done: todayDone.length };
    
    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Génère un rapport concis: synthèse, accomplissements, recommandations.',
                context: buildAIContext(),
                user: currentUser.name,
                type: 'report'
            })
        });
        
        let ai = await response.text();
        try { const j = JSON.parse(ai); ai = j.response || j.text || ai; } catch(e) {}
        ai = ai.replace(/ACTION:[A-Z]+\|[^\n]*/g, '').trim();
        
        lastReport = { metrics, ai, date: new Date() };
        showReport(metrics, ai);
        $('download-pdf-btn').classList.remove('hidden');
    } catch(e) {
        showReport(metrics, null);
    }
}

function showReport(m, ai) {
    $('report-content').innerHTML = `
        <h3>📊 Rapport - ${new Date().toLocaleDateString('fr-FR')}</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:15px 0">
            <div style="background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--accent)">${m.todo}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">À faire</div>
            </div>
            <div style="background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--warning)">${m.inProg}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">En cours</div>
            </div>
            <div style="background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                <div style="font-size:1.5rem;font-weight:bold;color:var(--success)">${m.done}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Terminées</div>
            </div>
        </div>
        ${ai ? `<div style="background:var(--bg-card);padding:15px;border-radius:12px;border-left:3px solid var(--accent);white-space:pre-wrap;line-height:1.6">${escapeHtml(ai)}</div>` : ''}
    `;
}

function downloadPDF() {
    if (!lastReport) return alert('Génère un rapport d\'abord');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(224, 120, 64);
    doc.rect(0, 0, w, 25, 'F');
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.text('RAPPORT DIGITAL GIRI', w/2, 15, { align: 'center' });
    
    let y = 40;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Date: ${lastReport.date.toLocaleDateString('fr-FR')}`, 20, y);
    y += 10;
    doc.text(`À faire: ${lastReport.metrics.todo} | En cours: ${lastReport.metrics.inProg} | Terminées: ${lastReport.metrics.done}`, 20, y);
    y += 15;
    
    if (lastReport.ai) {
        doc.setFontSize(9);
        doc.splitTextToSize(lastReport.ai, w - 40).forEach(line => {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(line, 20, y);
            y += 5;
        });
    }
    
    doc.save(`rapport_${lastReport.date.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ProductiveApp starting...');
    
    renderUserSelect();
    $('login-btn').addEventListener('click', attemptLogin);
    $('login-password').addEventListener('keypress', e => { if (e.key === 'Enter') attemptLogin(); });
    $('back-btn').addEventListener('click', () => {
        $('user-select-grid').classList.remove('hidden');
        $('password-form').classList.add('hidden');
        $('login-error').textContent = '';
        currentUser = null;
    });
    $('logout-btn').addEventListener('click', logout);
    
    $('add-task-btn').addEventListener('click', createTask);
    $('task-input').addEventListener('keypress', e => { if (e.key === 'Enter') createTask(); });
    
    $('view-toggle-btn').addEventListener('click', toggleViewMode);
    
    $('theme-btn').addEventListener('click', () => $('theme-modal').classList.remove('hidden'));
    $('close-theme-modal').addEventListener('click', () => $('theme-modal').classList.add('hidden'));
    $('theme-modal').addEventListener('click', e => { if (e.target.id === 'theme-modal') $('theme-modal').classList.add('hidden'); });
    $('theme-slider').addEventListener('input', () => {
        const theme = THEMES[parseInt($('theme-slider').value)];
        setTheme(theme.id);
        $('theme-name').textContent = theme.name;
    });
    
    $('add-project-btn').addEventListener('click', () => $('project-modal').classList.remove('hidden'));
    $('cancel-project').addEventListener('click', () => {
        $('project-modal').classList.add('hidden');
        $('new-project-name').value = '';
        $('new-project-desc').value = '';
    });
    $('confirm-project').addEventListener('click', () => {
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
        
        saveProjects();
        renderProjectsFilter();
        renderProjectSelect();
        $('project-modal').classList.add('hidden');
        $('new-project-name').value = '';
        $('new-project-desc').value = '';
    });
    $('project-modal').addEventListener('click', e => { if (e.target.id === 'project-modal') $('project-modal').classList.add('hidden'); });
    
    $('user-filter-select').addEventListener('change', () => {
        activeUserFilter = $('user-filter-select').value;
        renderTasks();
        renderJournal();
    });
    
    $('add-journal-btn').addEventListener('click', () => {
        const text = $('journal-input').value.trim();
        if (text) {
            addJournalEntry($('journal-category').value, text, parseInt($('journal-energy').value));
            $('journal-input').value = '';
        }
    });
    $('journal-input').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            const text = $('journal-input').value.trim();
            if (text) {
                addJournalEntry($('journal-category').value, text, parseInt($('journal-energy').value));
                $('journal-input').value = '';
            }
        }
    });
    
    $('generate-report-btn').addEventListener('click', generateReport);
    $('download-pdf-btn').addEventListener('click', downloadPDF);
    
    $('chatbot-toggle').addEventListener('click', () => {
        $('chatbot-window').classList.toggle('hidden');
        if (!$('chatbot-window').classList.contains('hidden')) $('chatbot-input').focus();
    });
    $('chatbot-close').addEventListener('click', () => $('chatbot-window').classList.add('hidden'));
    $('chatbot-resize').addEventListener('click', () => {
        chatbotLarge = !chatbotLarge;
        localStorage.setItem('chatbot-large', chatbotLarge);
        $('chatbot-window').classList.toggle('large', chatbotLarge);
    });
    $('chatbot-send').addEventListener('click', sendChatMessage);
    $('chatbot-input').addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
    
    checkExistingSession();
    
    console.log('✅ ProductiveApp ready!');
});

// =============================================
// RAPPORT
// =============================================

var lastReportData = null;

async function generateReport() {
    $('report-content').innerHTML = '<p style="color:var(--text-muted)">🔮 Génération...</p>';
    
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
    
    $('report-content').innerHTML = 
        '<h3>📊 Rapport - ' + new Date().toLocaleDateString('fr-FR') + '</h3>' +
        '<div style="display:flex;gap:16px;margin:16px 0">' +
            '<div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">' +
                '<div style="font-size:1.5rem;font-weight:bold;color:var(--accent)">' + todo + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted)">À faire</div>' +
            '</div>' +
            '<div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">' +
                '<div style="font-size:1.5rem;font-weight:bold;color:var(--warning)">' + inProg + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted)">En cours</div>' +
            '</div>' +
            '<div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">' +
                '<div style="font-size:1.5rem;font-weight:bold;color:var(--success)">' + done + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted)">Terminées</div>' +
            '</div>' +
        '</div>' +
        (ai ? '<div style="background:var(--bg-card);padding:16px;border-radius:12px;border-left:3px solid var(--accent);white-space:pre-wrap;line-height:1.6">' + escapeHtml(ai) + '</div>' : '');
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
    
    saveProjects();
    renderProjectsFilter();
    renderProjectSelect();
    closeProjectModal();
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ProductiveApp Starting...');
    
    // Auth
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
    
    // Tasks
    $('add-task-btn').addEventListener('click', createTask);
    $('task-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createTask(); });
    
    // View Toggle
    $('view-toggle-btn').addEventListener('click', toggleViewMode);
    
    // User Filter
    $('user-filter-select').addEventListener('change', function() {
        activeUserFilter = $('user-filter-select').value;
        renderTasks();
        renderJournal();
    });
    
    // Theme
    $('theme-btn').addEventListener('click', function() { $('theme-modal').classList.remove('hidden'); });
    $('close-theme-modal').addEventListener('click', function() { $('theme-modal').classList.add('hidden'); });
    $('theme-modal').addEventListener('click', function(e) { if (e.target === $('theme-modal')) $('theme-modal').classList.add('hidden'); });
    $('theme-slider').addEventListener('input', function() {
        const theme = THEMES[parseInt($('theme-slider').value)];
        setTheme(theme.id);
        $('theme-name').textContent = theme.name;
    });
    
    // Project Modal
    $('add-project-btn').addEventListener('click', openProjectModal);
    $('cancel-project').addEventListener('click', closeProjectModal);
    $('confirm-project').addEventListener('click', createProject);
    $('project-modal').addEventListener('click', function(e) { if (e.target === $('project-modal')) closeProjectModal(); });
    
    // Journal
    $('add-journal-btn').addEventListener('click', createJournalEntry);
    $('journal-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createJournalEntry(); });
    
    // Report
    $('generate-report-btn').addEventListener('click', generateReport);
    $('download-pdf-btn').addEventListener('click', downloadPDF);
    
    // Chatbot
    $('chatbot-toggle').addEventListener('click', toggleChatbot);
    $('chatbot-close').addEventListener('click', function() { $('chatbot-window').classList.add('hidden'); });
    $('chatbot-resize').addEventListener('click', toggleChatbotSize);
    $('chatbot-send').addEventListener('click', sendChatMessage);
    $('chatbot-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') sendChatMessage(); });
    
    // Check Session
    checkExistingSession();
    
    console.log('✅ ProductiveApp Ready');
});
