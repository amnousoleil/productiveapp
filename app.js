// === CONFIGURATION ===
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

// === DONNÉES ===
let currentUser = null;
let bubbles = JSON.parse(localStorage.getItem('bubbles_v2')) || [];
let journal = JSON.parse(localStorage.getItem('journal_v2')) || [];
let projects = JSON.parse(localStorage.getItem('projects_v2')) || DEFAULT_PROJECTS;
let history = JSON.parse(localStorage.getItem('history_v2')) || [];

let activeProjectFilter = 'all';
let activeUserFilter = 'all';

// === ÉLÉMENTS DOM ===
const loginScreen = document.getElementById('login-screen');
const userSelectGrid = document.getElementById('user-select-grid');
const passwordForm = document.getElementById('password-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const backBtn = document.getElementById('back-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const currentUserBadge = document.getElementById('current-user-badge');

const bubbleInput = document.getElementById('bubble-input');
const projectSelect = document.getElementById('project-select');
const prioritySelect = document.getElementById('priority-select');
const addBubbleBtn = document.getElementById('add-bubble-btn');

const todoBubbles = document.getElementById('todo-bubbles');
const inprogressBubbles = document.getElementById('inprogress-bubbles');
const doneBubbles = document.getElementById('done-bubbles');
const todoCount = document.getElementById('todo-count');
const inprogressCount = document.getElementById('inprogress-count');
const doneCount = document.getElementById('done-count');

const projectsFilterList = document.getElementById('projects-filter-list');
const addProjectFilterBtn = document.getElementById('add-project-filter-btn');
const userFilterSelect = document.getElementById('user-filter-select');

const journalInput = document.getElementById('journal-input');
const addJournalBtn = document.getElementById('add-journal-btn');
const journalEntries = document.getElementById('journal-entries');

const generateSummaryBtn = document.getElementById('generate-summary');
const downloadPdfBtn = document.getElementById('download-pdf');
const dailySummary = document.getElementById('daily-summary');

const themeBtn = document.getElementById('theme-btn');
const themeModal = document.getElementById('theme-modal');
const themeModalClose = document.getElementById('theme-modal-close');
const themeSlider = document.getElementById('theme-slider');
const themeName = document.getElementById('theme-name');

const newProjectModal = document.getElementById('new-project-modal');
const newProjectName = document.getElementById('new-project-name');
const newProjectDesc = document.getElementById('new-project-desc');
const newProjectCancel = document.getElementById('new-project-cancel');
const newProjectConfirm = document.getElementById('new-project-confirm');

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotSizeToggle = document.getElementById('chatbot-size-toggle');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');
const expandIcon = document.getElementById('expand-icon');
const collapseIcon = document.getElementById('collapse-icon');

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

// === AUTHENTIFICATION ===
function renderUserSelect() {
    const grid = document.getElementById('user-select-grid');
    if (!grid) {
        console.error('user-select-grid not found');
        return;
    }
    
    grid.innerHTML = USERS.map(user => `
        <button class="user-select-btn" data-userid="${user.id}">
            <span class="user-avatar-big">${user.avatar}</span>
            <span class="user-name-select">${user.name}</span>
        </button>
    `).join('');
    
    console.log('Users rendered:', USERS.length);
    
    grid.querySelectorAll('.user-select-btn').forEach(btn => {
        btn.addEventListener('click', () => selectUser(btn.dataset.userid));
    });
}

function selectUser(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;
    
    currentUser = user;
    loginUsername.textContent = `${user.avatar} ${user.name}`;
    userSelectGrid.style.display = 'none';
    passwordForm.style.display = 'flex';
    loginPassword.focus();
}

function attemptLogin() {
    const password = loginPassword.value;
    
    if (password === currentUser.password) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        loginScreen.classList.add('hidden');
        loginError.textContent = '';
        initApp();
    } else {
        loginError.textContent = 'Mot de passe incorrect';
        loginPassword.value = '';
        loginPassword.focus();
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    loginScreen.classList.remove('hidden');
    userSelectGrid.style.display = 'grid';
    passwordForm.style.display = 'none';
    loginPassword.value = '';
    loginError.textContent = '';
}

function checkExistingSession() {
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        loginScreen.classList.add('hidden');
        initApp();
        return true;
    }
    return false;
}

loginBtn.addEventListener('click', attemptLogin);
loginPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
backBtn.addEventListener('click', () => {
    userSelectGrid.style.display = 'grid';
    passwordForm.style.display = 'none';
    loginError.textContent = '';
    currentUser = null;
});
logoutBtn.addEventListener('click', logout);

// === INITIALISATION APP ===
function initApp() {
    currentUserBadge.innerHTML = `
        <span class="user-avatar">${currentUser.avatar}</span>
        <span class="user-name">${currentUser.name}</span>
    `;
    
    loadTheme();
    renderProjectsFilter();
    renderProjectSelect();
    renderUserFilter();
    renderBubbles();
    renderJournal();
    setTimeout(startAnimation, 100);
}

// === GESTION DES PROJETS ===
function renderProjectsFilter() {
    const counts = {};
    projects.forEach(p => {
        counts[p.id] = bubbles.filter(b => b.project === p.id && b.status !== 'done').length;
    });
    const totalCount = bubbles.filter(b => b.status !== 'done').length;
    
    document.getElementById('count-all').textContent = totalCount;
    
    projectsFilterList.innerHTML = projects.map(p => `
        <button class="project-filter-btn ${activeProjectFilter === p.id ? 'active' : ''}" data-project="${p.id}">
            <span class="filter-icon">${p.icon}</span>
            <span class="filter-name">${p.name}</span>
            <span class="filter-count">${counts[p.id] || 0}</span>
        </button>
    `).join('');
    
    document.querySelectorAll('.project-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.project-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeProjectFilter = btn.dataset.project;
            renderBubbles();
        });
    });
}

function renderProjectSelect() {
    projectSelect.innerHTML = '<option value="">Projet...</option>' + 
        projects.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('');
}

function renderUserFilter() {
    userFilterSelect.innerHTML = '<option value="all">👥 Tout le monde</option>' +
        USERS.map(u => `<option value="${u.id}">${u.avatar} ${u.name}</option>`).join('');
    
    userFilterSelect.addEventListener('change', () => {
        activeUserFilter = userFilterSelect.value;
        renderBubbles();
        renderJournal();
    });
}

function getProject(projectId) {
    return projects.find(p => p.id === projectId) || projects.find(p => p.id === 'general');
}

addProjectFilterBtn.addEventListener('click', () => {
    newProjectModal.classList.remove('hidden');
    newProjectName.focus();
});

newProjectCancel.addEventListener('click', () => {
    newProjectModal.classList.add('hidden');
    newProjectName.value = '';
    newProjectDesc.value = '';
});

newProjectConfirm.addEventListener('click', () => {
    const name = newProjectName.value.trim();
    const desc = newProjectDesc.value.trim();
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
    newProjectModal.classList.add('hidden');
    newProjectName.value = '';
    newProjectDesc.value = '';
});

newProjectModal.addEventListener('click', (e) => {
    if (e.target === newProjectModal) newProjectModal.classList.add('hidden');
});

// === GESTION DES BULLES ===
addBubbleBtn.addEventListener('click', createBubble);
bubbleInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') createBubble(); });

function createBubble() {
    const text = bubbleInput.value.trim();
    if (!text) return;
    
    const projectId = projectSelect.value || 'general';
    const priorityLevel = parseInt(prioritySelect.value) || 2;
    const priorityLabels = { 1: 'Urgent', 2: 'Normal', 3: 'Basse' };
    
    const bubble = {
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
    
    bubbles.push(bubble);
    saveBubbles();
    renderBubbles();
    renderProjectsFilter();
    
    bubbleInput.value = '';
    projectSelect.value = '';
    prioritySelect.value = '2';
    
    sendToN8N('bubble', bubble);
}

function renderBubbles() {
    let filtered = bubbles;
    
    if (activeProjectFilter !== 'all') {
        filtered = filtered.filter(b => b.project === activeProjectFilter);
    }
    if (activeUserFilter !== 'all') {
        filtered = filtered.filter(b => b.userId === activeUserFilter);
    }
    
    const todo = filtered.filter(b => b.status === 'todo').sort((a, b) => a.priority.level - b.priority.level);
    const inprogress = filtered.filter(b => b.status === 'inprogress');
    const done = filtered.filter(b => b.status === 'done').slice(0, 20);
    
    todoCount.textContent = todo.length;
    inprogressCount.textContent = inprogress.length;
    doneCount.textContent = done.length;
    
    todoBubbles.innerHTML = todo.length ? todo.map(b => renderBubbleHTML(b)).join('') : '<div class="empty-state">Aucune tâche</div>';
    inprogressBubbles.innerHTML = inprogress.length ? inprogress.map(b => renderBubbleHTML(b)).join('') : '<div class="empty-state">Rien en cours</div>';
    doneBubbles.innerHTML = done.length ? done.map(b => renderBubbleHTML(b)).join('') : '<div class="empty-state">Rien terminé</div>';
    
    attachBubbleEvents();
}

function renderBubbleHTML(bubble) {
    const project = getProject(bubble.project);
    const isOwn = bubble.userId === currentUser.id;
    
    return `
        <div class="bubble ${bubble.status}" data-id="${bubble.id}">
            <div class="bubble-header">
                <span class="bubble-project" style="background: ${project.color}20; color: ${project.color};">${project.icon} ${project.name}</span>
                <span class="bubble-priority ${bubble.priority.level === 1 ? 'urgent' : ''}">${bubble.priority.label}</span>
                <span class="bubble-user">${isOwn ? '' : bubble.userName}</span>
            </div>
            <div class="bubble-text">${escapeHtml(bubble.text)}</div>
            <div class="bubble-actions">
                ${bubble.status === 'todo' ? `<button class="bubble-action-btn start" data-action="start">▶️ Commencer</button>` : ''}
                ${bubble.status === 'inprogress' ? `<button class="bubble-action-btn done" data-action="done">✅ Terminé</button>` : ''}
                ${bubble.status === 'todo' ? `<button class="bubble-action-btn done" data-action="done">✅ Fait</button>` : ''}
                <button class="bubble-action-btn delete" data-action="delete">🗑️</button>
            </div>
        </div>
    `;
}

function attachBubbleEvents() {
    document.querySelectorAll('.bubble').forEach(el => {
        el.querySelectorAll('.bubble-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleBubbleAction(parseInt(el.dataset.id), btn.dataset.action);
            });
        });
    });
}

function handleBubbleAction(bubbleId, action) {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;
    
    if (action === 'start') {
        bubble.status = 'inprogress';
        bubble.startedAt = new Date().toISOString();
        addJournalEntry(`🔄 Commencé: ${bubble.text}`);
    } else if (action === 'done') {
        bubble.status = 'done';
        bubble.completedAt = new Date().toISOString();
        addJournalEntry(`✅ Terminé: ${bubble.text}`);
    } else if (action === 'delete') {
        bubbles = bubbles.filter(b => b.id !== bubbleId);
    }
    
    bubble.updatedAt = new Date().toISOString();
    saveBubbles();
    renderBubbles();
    renderProjectsFilter();
}

// === JOURNAL ===
addJournalBtn.addEventListener('click', () => {
    const text = journalInput.value.trim();
    if (text) { addJournalEntry(text); journalInput.value = ''; }
});
journalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = journalInput.value.trim();
        if (text) { addJournalEntry(text); journalInput.value = ''; }
    }
});

function addJournalEntry(text) {
    journal.unshift({
        id: Date.now(),
        text: text,
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
    if (activeUserFilter !== 'all') entries = entries.filter(e => e.userId === activeUserFilter);
    
    journalEntries.innerHTML = entries.length ? entries.map(e => `
        <div class="journal-entry">
            <span class="time">${e.time}</span>
            <span class="content">${escapeHtml(e.text)}</span>
            <span class="entry-user">${e.userName}</span>
        </div>
    `).join('') : '<div class="empty-state">Aucune entrée aujourd\'hui</div>';
}

// === THÈMES ===
themeBtn.addEventListener('click', () => themeModal.classList.remove('hidden'));
themeModalClose.addEventListener('click', () => themeModal.classList.add('hidden'));
themeModal.addEventListener('click', (e) => { if (e.target === themeModal) themeModal.classList.add('hidden'); });

themeSlider.addEventListener('input', () => {
    const theme = THEMES[parseInt(themeSlider.value)];
    setTheme(theme.id);
    themeName.textContent = theme.name;
});

function setTheme(theme) {
    if (theme === 'desert') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'desert';
    setTheme(saved);
    const idx = THEMES.findIndex(t => t.id === saved);
    if (idx !== -1) { themeSlider.value = idx; themeName.textContent = THEMES[idx].name; }
}

// === ANIMATION ===
const matrixCanvas = document.getElementById('matrix-bg');
const matrixCtx = matrixCanvas.getContext('2d');
let particles = [];
let animationId = null;

function startAnimation() {
    if (!animationId) { matrixCanvas.width = window.innerWidth; matrixCanvas.height = window.innerHeight; animate(); }
}

function animate() {
    if (matrixCanvas.width !== window.innerWidth) { matrixCanvas.width = window.innerWidth; matrixCanvas.height = window.innerHeight; }
    if (particles.length > 100) particles = particles.slice(-50);
    
    matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    if (particles.length < 40 && Math.random() > 0.92) {
        particles.push({ x: Math.random() * matrixCanvas.width, y: Math.random() * matrixCanvas.height, size: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, life: 1 });
    }
    
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.003;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `rgba(224, 120, 64, ${p.life * 0.3})`;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
    });
    
    animationId = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { matrixCanvas.width = window.innerWidth; matrixCanvas.height = window.innerHeight; });

// === CHATBOT ===
let isLargeMode = localStorage.getItem('chatbot-large-mode') === 'true';

chatbotToggle.addEventListener('click', () => { chatbotWindow.classList.toggle('hidden'); if (!chatbotWindow.classList.contains('hidden')) chatbotInput.focus(); });
chatbotClose.addEventListener('click', () => chatbotWindow.classList.add('hidden'));
chatbotSizeToggle.addEventListener('click', () => { isLargeMode = !isLargeMode; localStorage.setItem('chatbot-large-mode', isLargeMode); applyChatbotSize(); });

function applyChatbotSize() {
    chatbotWindow.classList.toggle('large-mode', isLargeMode);
    expandIcon.style.display = isLargeMode ? 'none' : 'block';
    collapseIcon.style.display = isLargeMode ? 'block' : 'none';
}

chatbotSend.addEventListener('click', sendChatMessage);
chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

async function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    chatbotInput.value = '';
    const loadingDiv = addChatMessage('Réflexion...', 'assistant loading');
    
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
        addChatMessage(aiResponse || 'OK!', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMessage('Erreur de connexion', 'assistant');
    }
}

function buildAIContext() {
    const todo = bubbles.filter(b => b.status === 'todo');
    const inProgress = bubbles.filter(b => b.status === 'inprogress');
    const today = new Date().toDateString();
    const todayJournal = journal.filter(e => new Date(e.date).toDateString() === today);
    
    let ctx = `=== EMPIRE DIGITAL GIRI ===\nUser: ${currentUser.name} (${currentUser.role})\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    projects.forEach(p => {
        const pTodo = todo.filter(b => b.project === p.id);
        const pInProg = inProgress.filter(b => b.project === p.id);
        if (pTodo.length || pInProg.length) {
            ctx += `\n📁 ${p.name} (${p.desc}):\n`;
            if (pInProg.length) ctx += `  EN COURS: ${pInProg.map(b => b.text).join(', ')}\n`;
            if (pTodo.length) ctx += `  À FAIRE: ${pTodo.map(b => `"${b.text}" [${b.priority.label}]`).join(', ')}\n`;
        }
    });
    
    ctx += `\n=== JOURNAL ===\n${todayJournal.map(e => `${e.time}: ${e.text}`).join('\n') || 'Vide'}\n`;
    ctx += `\nActions: ACTION:CREATE|texte, ACTION:DONE|mot-clé, ACTION:DELETE|mot-clé`;
    
    return ctx;
}

function processAIActions(response) {
    if (response.includes('ACTION:CREATE|')) {
        [...response.matchAll(/ACTION:CREATE\|([^\n]+)/g)].forEach(m => {
            bubbles.push({ id: Date.now() + Math.random(), text: m[1].trim(), status: 'todo', priority: { level: 2, label: 'Normal' }, project: activeProjectFilter !== 'all' ? activeProjectFilter : 'general', userId: currentUser.id, userName: currentUser.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        });
        saveBubbles(); renderBubbles(); renderProjectsFilter();
        response = response.replace(/ACTION:CREATE\|[^\n]+/g, '') + '\n✅ Tâche créée!';
    }
    
    if (response.includes('ACTION:DELETE|')) {
        let c = 0;
        [...response.matchAll(/ACTION:DELETE\|([^\n]+)/g)].forEach(m => {
            const idx = bubbles.findIndex(b => b.status !== 'done' && b.text.toLowerCase().includes(m[1].trim().toLowerCase()));
            if (idx !== -1) { bubbles.splice(idx, 1); c++; }
        });
        if (c) { saveBubbles(); renderBubbles(); renderProjectsFilter(); response = response.replace(/ACTION:DELETE\|[^\n]+/g, '') + `\n🗑️ ${c} supprimée(s)`; }
    }
    
    if (response.includes('ACTION:DONE|')) {
        let c = 0;
        [...response.matchAll(/ACTION:DONE\|([^\n]+)/g)].forEach(m => {
            const b = bubbles.find(b => b.status !== 'done' && b.text.toLowerCase().includes(m[1].trim().toLowerCase()));
            if (b) { b.status = 'done'; b.completedAt = new Date().toISOString(); c++; }
        });
        if (c) { saveBubbles(); renderBubbles(); renderProjectsFilter(); response = response.replace(/ACTION:DONE\|[^\n]+/g, '') + `\n✅ ${c} terminée(s)`; }
    }
    
    return response.trim();
}

function addChatMessage(text, cls) {
    const div = document.createElement('div');
    div.className = `chat-message ${cls}`;
    div.textContent = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return div;
}

// === RAPPORT ===
let lastSummaryData = null;
generateSummaryBtn.addEventListener('click', generateSummary);
downloadPdfBtn.addEventListener('click', downloadPDF);

async function generateSummary() {
    dailySummary.innerHTML = '<p style="color:var(--text-muted)">🔮 Génération...</p>';
    dailySummary.classList.add('visible');
    downloadPdfBtn.style.display = 'none';
    
    const metrics = calcMetrics();
    
    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Génère un rapport de direction avec: synthèse, accomplissements, points attention, état par projet, recommandations. Sois concis et stratégique.', context: buildAIContext(), user: currentUser.name, type: 'report' })
        });
        
        let ai = await response.text();
        try { const j = JSON.parse(ai); ai = j.response || j.text || ai; } catch(e) {}
        ai = ai.replace(/ACTION:[A-Z]+\|[^\n]*/g, '').trim();
        
        lastSummaryData = { metrics, ai, date: new Date() };
        showReport(metrics, ai);
        downloadPdfBtn.style.display = 'inline-block';
    } catch(e) {
        showReport(metrics, null);
        downloadPdfBtn.style.display = 'inline-block';
    }
}

function calcMetrics() {
    const today = new Date().toDateString();
    const todo = bubbles.filter(b => b.status === 'todo');
    const inProg = bubbles.filter(b => b.status === 'inprogress');
    const done = bubbles.filter(b => b.status === 'done');
    const todayDone = done.filter(b => b.completedAt && new Date(b.completedAt).toDateString() === today);
    
    const byProj = {};
    projects.forEach(p => {
        const pb = bubbles.filter(b => b.project === p.id);
        byProj[p.id] = { name: p.name, icon: p.icon, total: pb.length, done: pb.filter(b => b.status === 'done').length };
    });
    
    return { todo: todo.length, inProg: inProg.length, todayDone: todayDone.length, byProj };
}

function showReport(m, ai) {
    const bars = Object.values(m.byProj).filter(p => p.total > 0).map(p => {
        const pct = Math.round((p.done / p.total) * 100);
        return `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span>${p.icon} ${p.name}</span><span>${p.done}/${p.total}</span></div><div style="background:var(--bg-tertiary);border-radius:10px;height:6px"><div style="background:var(--accent);width:${pct}%;height:100%;border-radius:10px"></div></div></div>`;
    }).join('');
    
    dailySummary.innerHTML = `
        <h3>📊 Rapport - ${new Date().toLocaleDateString('fr-FR')}</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:15px 0">
            <div style="background:var(--card-bg);padding:12px;border-radius:12px;text-align:center"><div style="font-size:1.5rem;font-weight:bold;color:var(--accent)">${m.todo}</div><div style="font-size:0.75rem;color:var(--text-muted)">À faire</div></div>
            <div style="background:var(--card-bg);padding:12px;border-radius:12px;text-align:center"><div style="font-size:1.5rem;font-weight:bold;color:var(--warning)">${m.inProg}</div><div style="font-size:0.75rem;color:var(--text-muted)">En cours</div></div>
            <div style="background:var(--card-bg);padding:12px;border-radius:12px;text-align:center"><div style="font-size:1.5rem;font-weight:bold;color:var(--success)">${m.todayDone}</div><div style="font-size:0.75rem;color:var(--text-muted)">Terminées</div></div>
        </div>
        <div style="background:var(--card-bg);padding:15px;border-radius:12px;margin-bottom:15px"><h4 style="margin-bottom:10px">📁 Par projet</h4>${bars || '<p style="color:var(--text-muted)">Aucun</p>'}</div>
        ${ai ? `<div style="background:var(--card-bg);padding:15px;border-radius:12px;border-left:3px solid var(--accent)"><h4 style="margin-bottom:10px">🔮 Analyse IA</h4><div style="white-space:pre-wrap;line-height:1.6">${escapeHtml(ai)}</div></div>` : ''}
    `;
}

function downloadPDF() {
    if (!lastSummaryData) return alert('Génère un rapport d\'abord');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(224, 120, 64);
    doc.rect(0, 0, w, 30, 'F');
    doc.setTextColor(255); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DIGITAL GIRI', w/2, 12, { align: 'center' });
    doc.setFontSize(10); doc.text(lastSummaryData.date.toLocaleDateString('fr-FR'), w/2, 22, { align: 'center' });
    
    let y = 45;
    doc.setTextColor(0); doc.setFontSize(11);
    doc.text(`À faire: ${lastSummaryData.metrics.todo}  |  En cours: ${lastSummaryData.metrics.inProg}  |  Terminées: ${lastSummaryData.metrics.todayDone}`, 20, y);
    y += 15;
    
    if (lastSummaryData.ai) {
        doc.setFont('helvetica', 'bold'); doc.text('ANALYSE', 20, y); y += 8;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.splitTextToSize(lastSummaryData.ai, w - 40).forEach(line => { if (y > 280) { doc.addPage(); y = 20; } doc.text(line, 20, y); y += 5; });
    }
    
    doc.save(`rapport_${lastSummaryData.date.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
}

// === UTILS ===
function saveBubbles() { localStorage.setItem('bubbles_v2', JSON.stringify(bubbles)); }
function saveJournal() { localStorage.setItem('journal_v2', JSON.stringify(journal)); }
function saveProjects() { localStorage.setItem('projects_v2', JSON.stringify(projects)); }
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
async function sendToN8N(type, data) { try { await fetch(N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, user: currentUser.name, ...data }) }); } catch(e) {} }

// === START ===
document.addEventListener('DOMContentLoaded', () => {
    renderUserSelect();
    checkExistingSession();
    applyChatbotSize();
});
