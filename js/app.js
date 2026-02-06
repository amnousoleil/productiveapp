// =============================================
// PRODUCTIVEAPP - APP.JS v13
// + Drag & Drop tâches entre colonnes
// + Drag & Drop projets pour réorganiser
// + Correction automatique des notes (IA)
// + Bouton 💡 reformulation
// =============================================

// === CONFIGURATION API ===
const API_TASKS = 'https://n8n.srv1053121.hstgr.cloud/webhook/tasks';
const API_JOURNAL = 'https://n8n.srv1053121.hstgr.cloud/webhook/journal';
const API_PROJECTS = 'https://n8n.srv1053121.hstgr.cloud/webhook/projects';
const API_CORRECT = 'https://n8n.srv1053121.hstgr.cloud/webhook/correct';
const TENANT_ID = 'digitalgiri';

// === CONFIGURATION N8N ===
const CHATBOT_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc';

// === UTILISATEURS ===
const USERS = [
    { id: 'maha', name: 'Maître Maha Giri', avatar: '👑', loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fae4f07fb8_ChatGPTImage1f%C3%A9vr.202609_58_10.png', role: 'boss' },
    { id: 'brice', name: 'Brice', avatar: '🚀', loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697ff503b4fa8_ChatGPTImage2f%C3%A9vr.202601_51_06.png', role: 'team' },
    { id: 'team', name: 'Team', avatar: '👥', loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png', role: 'shared' }
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

// === THÈMES v2.0 - Organisés par catégories ===
const THEMES = {
    pro: [
        { id: 'executive', name: 'Executive', color: '#d4af37', category: 'PRO/CEO' },
        { id: 'corporate', name: 'Corporate', color: '#6495ed', category: 'PRO/CEO' },
        { id: 'minimal', name: 'Minimal', color: '#007aff', category: 'PRO/CEO' },
        { id: 'slate', name: 'Slate', color: '#64748b', category: 'PRO/CEO' },
        { id: 'obsidian', name: 'Obsidian', color: '#a0a0a0', category: 'PRO/CEO' },
        { id: 'academie', name: 'Académie', color: '#daa520', category: 'PRO/CEO' }
    ],
    creative: [
        { id: 'sunset', name: 'Sunset', color: '#f97316', category: 'CRÉATIF/FUN' },
        { id: 'ocean', name: 'Ocean', color: '#00b4d8', category: 'CRÉATIF/FUN' },
        { id: 'forest', name: 'Forest', color: '#4ade80', category: 'CRÉATIF/FUN' },
        { id: 'bubblegum', name: 'Bubblegum', color: '#ff6b9d', category: 'CRÉATIF/FUN' },
        { id: 'aurora', name: 'Aurora', color: '#93c5fd', category: 'CRÉATIF/FUN' }
    ],
    geek: [
        { id: 'matrix', name: 'Matrix', color: '#00ff66', category: 'GEEK/TECH' },
        { id: 'cyberpunk', name: 'Cyberpunk', color: '#ff00ff', category: 'GEEK/TECH' },
        { id: 'terminal', name: 'Terminal', color: '#00ff00', category: 'GEEK/TECH' },
        { id: 'midnight', name: 'Midnight', color: '#7c9fff', category: 'GEEK/TECH' }
    ]
};

// Liste plate pour compatibilité
const ALL_THEMES = [...THEMES.pro, ...THEMES.creative, ...THEMES.geek];

// === STATE ===
let currentUser = null;
let tasks = [];
let journal = [];
let projects = DEFAULT_PROJECTS;

let activeProjectFilter = 'all';
let activeUserFilter = 'all';
let priorityFilterMode = 'off'; // off -> urgent -> normal -> zen -> off
let lastChatbotActionTaskId = null; // Pour scroll vers la tâche après fermeture chatbot
const GYRO_IMAGES = {
    off: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa2efd9d54_gyrophare.png',
    urgent: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa2efd9d54_gyrophare.png',
    normal: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa8fb04267_ChatGPTImage1f%C3%A9vr.202620_25_30.png',
    zen: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa94e3a225_3ced8da8-b8c7-4a26-9fd0-feb9a7715dae.png'
};
let viewMode = localStorage.getItem('viewMode') || 'columns';
let chatbotLarge = localStorage.getItem('chatbot-large') === 'true';
let lastReportData = null;

// Exposer globalement pour dragdrop.js
window.tasks = tasks;
window.projects = projects;

// === DOM ===
const $ = id => document.getElementById(id);

// =============================================
// CORRECTION AUTOMATIQUE (IA)
// =============================================

let isCorrectingText = false;

async function correctText(text, mode = 'fix') {
    if (!text || text.trim().length < 5) return text; // Pas de correction pour texte trop court
    
    try {
        const response = await fetch(API_CORRECT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, mode: mode })
        });
        
        const data = await response.json();
        
        console.log('📝 Réponse correction brute:', data);
        
        // Fonction récursive pour extraire le texte
        function extractText(obj) {
            if (typeof obj === 'string') return obj;
            if (!obj) return null;
            
            // Chercher dans les clés communes
            if (obj.output && typeof obj.output === 'string') return obj.output;
            if (obj.text && typeof obj.text === 'string') return obj.text;
            if (obj.content && typeof obj.content === 'string') return obj.content;
            if (obj.message && typeof obj.message === 'string') return obj.message;
            if (obj.result && typeof obj.result === 'string') return obj.result;
            
            // OpenAI format
            if (obj.message && obj.message.content) return obj.message.content;
            if (obj.choices && obj.choices[0] && obj.choices[0].message) {
                return obj.choices[0].message.content;
            }
            
            // Si c'est un objet avec une seule clé string
            const keys = Object.keys(obj);
            for (const key of keys) {
                if (typeof obj[key] === 'string' && obj[key].length > 5) {
                    return obj[key];
                }
            }
            
            // Chercher récursivement dans les sous-objets
            for (const key of keys) {
                if (typeof obj[key] === 'object') {
                    const found = extractText(obj[key]);
                    if (found) return found;
                }
            }
            
            return null;
        }
        
        // Si c'est un array, chercher dans le premier élément
        if (Array.isArray(data)) {
            if (data.length > 0) {
                const result = extractText(data[0]);
                if (result) return result;
            }
        } else {
            const result = extractText(data);
            if (result) return result;
        }
        
        console.log('⚠️ Format réponse correction inattendu:', data);
        return text; // Retourner le texte original si format inconnu
    } catch (error) {
        console.error('❌ Erreur correction:', error);
        return text; // En cas d'erreur, retourner le texte original
    }
}

async function handleDescriptionBlur(event) {
    if (isCorrectingText) return; // Éviter les corrections en boucle
    
    const textarea = event.target;
    const text = textarea.value.trim();
    
    if (!text || text.length < 10) return; // Pas de correction pour texte trop court
    
    isCorrectingText = true;
    
    // Ajouter un indicateur visuel
    textarea.style.opacity = '0.7';
    textarea.placeholder = '✨ Correction en cours...';
    
    try {
        const correctedText = await correctText(text, 'fix');
        
        if (correctedText && correctedText !== text) {
            textarea.value = correctedText;
            console.log('✅ Texte corrigé');
        }
    } catch (e) {
        console.error('Erreur correction:', e);
    }
    
    textarea.style.opacity = '1';
    textarea.placeholder = 'Ajouter des détails, précisions, notes, sous-tâches...';
    isCorrectingText = false;
}

async function reformulateDescription() {
    const textarea = $('edit-task-description');
    const text = textarea.value.trim();
    
    if (!text || text.length < 10) {
        alert('Écris d\'abord quelque chose à reformuler !');
        return;
    }
    
    // Indicateur visuel
    const btn = $('reformulate-btn');
    const originalText = btn.textContent;
    btn.textContent = '⏳';
    btn.disabled = true;
    textarea.style.opacity = '0.7';
    
    try {
        const reformulatedText = await correctText(text, 'reformulate');
        
        if (reformulatedText && reformulatedText !== text) {
            textarea.value = reformulatedText;
            console.log('✅ Texte reformulé');
        }
    } catch (e) {
        console.error('Erreur reformulation:', e);
        alert('Erreur de reformulation');
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
    textarea.style.opacity = '1';
}

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
        
        if (!Array.isArray(data)) {
            console.error('❌ Réponse API invalide:', data);
            return [];
        }
        
        tasks = data.map(t => {
            // Parser titre et description (format: "titre\n---\ndescription")
            const parts = (t.text || '').split('\n---\n');
            return {
                id: t.task_id,
                text: parts[0] || t.text,
                description: parts[1] || '',
                status: t.status,
                priority: { level: t.priority, label: getPriorityLabel(t.priority) },
                project: t.project_id,
                userId: t.user_id,
                userName: getUserName(t.user_id),
                position: t.position || 0,
                createdAt: t.created_at,
                updatedAt: t.updated_at,
                completedAt: t.completed_at
            };
        });
        
        console.log(`✅ ${tasks.length} tâches chargées`);
        return tasks;
    } catch (error) {
        console.error('❌ Erreur chargement tasks:', error);
        return [];
    }
}

async function createTaskAPI(taskData) {
    try {
        // Combiner titre et description
        let fullText = taskData.text;
        if (taskData.description && taskData.description.trim()) {
            fullText = taskData.text + '\n---\n' + taskData.description;
        }
        
        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        const payload = {
            action: 'create',
            tenant_id: TENANT_ID,
            task_id: taskId,
            user_id: taskData.userId,
            project_id: taskData.project,
            text: fullText,
            priority: taskData.priority.level
        };
        
        console.log('📤 Envoi création tâche:', payload);
        
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Gérer les réponses vides ou mal formatées
        const text = await response.text();
        console.log('📥 Réponse brute:', text);
        
        if (!text || text.trim() === '') {
            // Réponse vide mais probablement OK - on construit le résultat nous-mêmes
            console.log('⚠️ Réponse vide, on suppose succès');
            return [{
                task_id: taskId,
                text: fullText,
                status: 'todo',
                priority: taskData.priority.level,
                project_id: taskData.project,
                user_id: taskData.userId,
                created_at: new Date().toISOString()
            }];
        }
        
        try {
            const result = JSON.parse(text);
            console.log('✅ Tâche créée:', result);
            return Array.isArray(result) ? result : [result];
        } catch (parseError) {
            console.log('⚠️ JSON invalide, on suppose succès');
            return [{
                task_id: taskId,
                text: fullText,
                status: 'todo',
                priority: taskData.priority.level,
                project_id: taskData.project,
                user_id: taskData.userId,
                created_at: new Date().toISOString()
            }];
        }
    } catch (error) {
        console.error('❌ Erreur création task:', error);
        alert('Erreur réseau. Vérifie ta connexion.');
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

async function reorderTaskAPI(taskId, status, position) {
    try {
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'reorder',
                tenant_id: TENANT_ID,
                task_id: taskId,
                status: status,
                position: position
            })
        });
        const result = await response.json();
        console.log('✅ Tâche réordonnée:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur reorder task:', error);
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
// API PROJECTS
// =============================================

async function loadProjectsFromAPI() {
    try {
        const response = await fetch(API_PROJECTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get', tenant_id: TENANT_ID })
        });
        const data = await response.json();
        
        // Commencer avec les projets par défaut (pour les anciennes tâches)
        projects = [...DEFAULT_PROJECTS];
        
        if (Array.isArray(data) && data.length > 0) {
            // Ajouter les projets de la DB qui ne sont pas déjà dans les défauts
            data.forEach(p => {
                const existingIndex = projects.findIndex(proj => 
                    proj.id === p.project_id || proj.name.toLowerCase() === p.name.toLowerCase()
                );
                
                if (existingIndex === -1) {
                    // Nouveau projet custom, on l'ajoute
                    projects.push({
                        id: p.project_id,
                        name: p.name,
                        icon: p.icon || '📁',
                        color: p.color || '#6b7280',
                        desc: p.description || p.name
                    });
                }
            });
        }
        
        console.log(`✅ ${projects.length} projets chargés`);
        return projects;
    } catch (error) {
        console.error('❌ Erreur chargement projects:', error);
        return DEFAULT_PROJECTS;
    }
}

async function createProjectAPI(projectData) {
    try {
        const projectId = projectData.id || 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        const payload = {
            action: 'create',
            tenant_id: TENANT_ID,
            project_id: projectId,
            name: projectData.name,
            icon: projectData.icon || '📁',
            color: projectData.color || '#6b7280',
            description: projectData.desc || projectData.name
        };
        
        console.log('📤 Création projet:', payload);
        
        const response = await fetch(API_PROJECTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const text = await response.text();
        if (!text || text.trim() === '') {
            return [{ project_id: projectId, ...payload }];
        }
        
        try {
            const result = JSON.parse(text);
            console.log('✅ Projet créé:', result);
            return Array.isArray(result) ? result : [result];
        } catch (parseError) {
            return [{ project_id: projectId, ...payload }];
        }
    } catch (error) {
        console.error('❌ Erreur création projet:', error);
        return null;
    }
}

async function deleteProjectAPI(projectId) {
    try {
        const response = await fetch(API_PROJECTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                tenant_id: TENANT_ID,
                project_id: projectId
            })
        });
        const text = await response.text();
        console.log('✅ Projet supprimé:', text);
        return true;
    } catch (error) {
        console.error('❌ Erreur suppression projet:', error);
        return false;
    }
}

async function deleteProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Vérifier si le projet contient des tâches
    const taskCount = tasks.filter(t => t.project === projectId).length;
    
    if (taskCount > 0) {
        alert(`⚠️ Impossible de supprimer "${project.name}"\n\nCe projet contient ${taskCount} tâche(s).\nDéplace-les d'abord vers un autre projet.`);
        return;
    }
    
    if (!confirm(`Supprimer le projet "${project.name}" ?`)) return;
    
    // Supprimer de la DB (si c'est un projet custom)
    if (projectId.startsWith('proj_')) {
        await deleteProjectAPI(projectId);
    }
    
    // Supprimer localement
    const index = projects.findIndex(p => p.id === projectId);
    if (index > -1) {
        projects.splice(index, 1);
    }
    
    // Reset filtre si on était sur ce projet
    if (activeProjectFilter === projectId) {
        activeProjectFilter = 'all';
    }
    
    renderProjectsFilter();
    renderProjectSelect();
    console.log('✅ Projet supprimé:', project.name);
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
        
        if (!Array.isArray(data)) {
            console.error('❌ Réponse journal invalide:', data);
            return [];
        }
        
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
        
        const text = await response.text();
        
        if (!text || text.trim() === '') {
            console.log('⚠️ Journal: réponse vide, on suppose succès');
            return [{
                id: Date.now(),
                category: entry.category,
                text: entry.text,
                energy: entry.energy,
                user_id: entry.userId,
                created_at: new Date().toISOString()
            }];
        }
        
        try {
            const result = JSON.parse(text);
            console.log('✅ Entrée journal créée:', result);
            return Array.isArray(result) ? result : [result];
        } catch (parseError) {
            console.log('⚠️ Journal: JSON invalide, on suppose succès');
            return [{
                id: Date.now(),
                category: entry.category,
                text: entry.text,
                energy: entry.energy,
                user_id: entry.userId,
                created_at: new Date().toISOString()
            }];
        }
    } catch (error) {
        console.error('❌ Erreur création journal:', error);
        return null;
    }
}

// =============================================
// UTILS
// =============================================

function getPriorityLabel(level) {
    const labels = { 1: '🔥 Urgent', 2: 'Normal', 3: '💤 Zen' };
    return labels[level] || 'Normal';
}

function getUserName(userId) {
    const user = USERS.find(u => u.id === userId);
    return user ? user.name : userId;
}

function getUserAvatar(userId) {
    const user = USERS.find(u => u.id === userId);
    return user ? user.avatar : '👤';
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
            <div class="avatar-orbit-container">
                <div class="fire-breath-container"></div>
                <img src="${user.loginImg}" class="user-avatar-img-login" alt="${user.name}">
            </div>
            <span class="user-name-select">${user.name}</span>
        </button>
    `).join('');

    grid.querySelectorAll('.user-select-btn').forEach(btn => {
        btn.addEventListener('click', () => selectUser(btn.dataset.userid));
    });

    // Lancer le système de particules de souffle
    initFireBreathParticles();
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
    initChatbotFontSize();
    
    // Charger les projets depuis PostgreSQL AVANT de rendre les filtres
    await loadProjectsFromAPI();
    
    // Charger l'ordre personnalisé des projets
    if (typeof loadProjectsOrder === 'function') {
        loadProjectsOrder();
    }
    
    renderProjectsFilter();
    renderProjectSelect();
    renderUserFilter();
    renderAssignSelect();
    
    await Promise.all([
        loadTasksFromAPI(),
        loadJournalFromAPI()
    ]);
    
    // Mettre à jour les références globales pour dragdrop.js
    window.tasks = tasks;
    window.projects = projects;
    
    renderTasks();
    renderJournal();
    
    // Initialiser le drag & drop (chargé depuis dragdrop.js)
    setTimeout(() => {
        if (typeof initDragAndDrop === 'function') initDragAndDrop();
        if (typeof initAnimation === 'function') initAnimation();
    }, 100);
    
    console.log('✅ App initialized (v13)');
}

// =============================================
// THÈMES
// =============================================

function setTheme(themeId) {
    // Tous les thèmes utilisent data-theme maintenant (pas de thème par défaut)
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);

    if (typeof resetAnimationForTheme === 'function') {
        resetAnimationForTheme();
    }
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'executive'; // Executive par défaut
    setTheme(saved);

    // Marquer la carte active si le modal est ouvert
    const activeCard = document.querySelector(`.theme-card[data-theme="${saved}"]`);
    if (activeCard) {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        activeCard.classList.add('active');
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
        toggleBtn.title = 'Mode Simple (2 colonnes)';
    } else {
        columnsView.classList.add('hidden');
        bubblesView.classList.remove('hidden');
        toggleBtn.textContent = '📋';
        toggleBtn.title = 'Mode Workflow (3 colonnes)';
    }
}

// =============================================
// PROJETS & FILTRES
// =============================================

function renderProjectsFilter() {
    const counts = {};
    projects.forEach(p => {
        counts[p.id] = tasks.filter(t => t.project === p.id && t.status !== 'done').length;
    });
    const totalCount = tasks.filter(t => t.status !== 'done').length;
    
    $('count-all').textContent = totalCount;
    
    // Mettre à jour la référence globale
    window.projects = projects;
    
    $('projects-filter-list').innerHTML = projects.map(p => `
        <button class="project-chip ${activeProjectFilter === p.id ? 'active' : ''}" data-project="${p.id}">
            <span class="chip-icon">${p.icon}</span>
            <span class="chip-name">${p.name}</span>
            <span class="chip-count">${counts[p.id] || 0}</span>
            <span class="chip-delete" data-delete="${p.id}" title="Supprimer ce projet">×</span>
        </button>
    `).join('');
    
    document.querySelectorAll('.project-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Ne pas filtrer si on clique sur le bouton supprimer
            if (e.target.classList.contains('chip-delete')) return;
            
            document.querySelectorAll('.project-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeProjectFilter = btn.dataset.project;
            renderTasks();
        });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.chip-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProject(btn.dataset.delete);
        });
    });
    
    // Réinitialiser le drag & drop pour les projets
    if (typeof initProjectDragAndDrop === 'function') initProjectDragAndDrop();
}

function renderProjectSelect() {
    $('project-select').innerHTML = '<option value="">Projet...</option>' + 
        projects.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('');
}

function getProject(projectId) {
    return projects.find(p => p.id === projectId) || projects.find(p => p.id === 'general');
}

function renderUserFilter() {
    const options = $('user-filter-options');
    if (!options) return;

    options.innerHTML = `
        <div class="custom-select-option active" data-value="all">
            <span class="option-emoji">👥</span>
            <span>Tout le monde</span>
        </div>
        ${USERS.map(u => `
            <div class="custom-select-option" data-value="${u.id}">
                <span class="option-emoji">${u.avatar}</span>
                <span>${u.name}</span>
            </div>
        `).join('')}
    `;

    // Event listeners pour les options
    options.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.addEventListener('click', () => selectUserFilter(opt.dataset.value));
    });
}

function selectUserFilter(value) {
    activeUserFilter = value;

    // Update le bouton
    const btn = $('user-filter-btn');
    const options = $('user-filter-options');

    // Trouver l'option sélectionnée
    options.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.value === value);
    });

    // Update l'affichage du bouton
    if (value === 'all') {
        btn.querySelector('.select-avatar').textContent = '👥';
        btn.querySelector('.select-text').textContent = 'Tout le monde';
    } else {
        const user = USERS.find(u => u.id === value);
        if (user) {
            btn.querySelector('.select-avatar').textContent = user.avatar;
            btn.querySelector('.select-text').textContent = user.name;
        }
    }

    // Fermer le dropdown
    $('user-filter-dropdown').classList.remove('open');

    renderTasks();
    renderJournal();
}

function renderAssignSelect() {
    const assignSelect = $('assign-select');
    if (!assignSelect) return;
    
    assignSelect.innerHTML = `<option value="">👤 Moi</option>` +
        USERS.filter(u => u.id !== currentUser.id).map(u =>
            `<option value="${u.id}">${u.name}</option>`
        ).join('');
}

// =============================================
// TÂCHES
// =============================================

async function createTask() {
    const text = $('task-input').value.trim();
    if (!text) {
        alert('Entre un titre pour la tâche');
        return;
    }
    
    const description = '';
    const projectId = $('project-select').value || 'general';
    const priorityLevel = parseInt($('priority-select').value) || 2;
    const assignTo = $('assign-select').value || currentUser.id;
    
    // Désactiver le bouton
    const btn = $('add-task-btn');
    btn.disabled = true;
    btn.textContent = '...';
    
    const taskData = {
        text: text,
        description: description,
        project: projectId,
        priority: { level: priorityLevel, label: getPriorityLabel(priorityLevel) },
        userId: assignTo,
        userName: getUserName(assignTo)
    };
    
    const result = await createTaskAPI(taskData);
    
    btn.disabled = false;
    btn.textContent = '+';
    
    if (result && Array.isArray(result) && result.length > 0) {
        const newTask = result[0];
        const parts = (newTask.text || '').split('\n---\n');
        
        // Ajouter en HAUT du tableau (unshift au lieu de push)
        tasks.unshift({
            id: newTask.task_id,
            text: parts[0] || newTask.text,
            description: parts[1] || '',
            status: newTask.status,
            priority: { level: newTask.priority, label: getPriorityLabel(newTask.priority) },
            project: newTask.project_id,
            userId: newTask.user_id,
            userName: getUserName(newTask.user_id),
            position: 0, // Position 0 = tout en haut
            createdAt: newTask.created_at,
            updatedAt: newTask.updated_at
        });
        
        // Mettre à jour la référence globale
        window.tasks = tasks;
        
        renderTasks();
        renderProjectsFilter();
        
        if (assignTo !== currentUser.id) {
            await addJournalEntry('task', `📝 Assigné à ${getUserName(assignTo)}: ${text}`, 2);
        } else {
            await addJournalEntry('task', `📝 Créé: ${text}`, 2);
        }
    }
    
    // Reset
    $('task-input').value = '';
    $('project-select').value = '';
    $('priority-select').value = '2';
    $('assign-select').value = '';
}

function renderTasks() {
    let filtered = tasks;

    if (activeProjectFilter !== 'all') {
        filtered = filtered.filter(t => t.project === activeProjectFilter);
    }
    if (activeUserFilter !== 'all') {
        filtered = filtered.filter(t => t.userId === activeUserFilter);
    }

    // Tri/Filtre par priorité selon le mode gyrophare
    if (priorityFilterMode !== 'off') {
        const targetPriority = { urgent: 1, normal: 2, zen: 3 }[priorityFilterMode];
        filtered = filtered.filter(t => (t.priority?.level || 2) === targetPriority);
    }

    const todo = filtered.filter(t => t.status === 'todo');
    const inprogress = filtered.filter(t => t.status === 'inprogress');
    const done = filtered.filter(t => t.status === 'done').slice(0, 20);
    
    if (viewMode === 'columns') {
        renderColumnsView(todo, inprogress, done);
    } else {
        renderBubblesView(todo, inprogress, done);
    }
}

function renderColumnsView(todo, inprogress, done) {
    $('todo-count').textContent = todo.length;
    $('inprogress-count').textContent = inprogress.length;
    $('done-count').textContent = done.length;
    
    $('todo-list').innerHTML = todo.length ? todo.map(t => renderTaskHTMLFull(t)).join('') : '<div class="empty-state">Aucune tâche</div>';
    $('inprogress-list').innerHTML = inprogress.length ? inprogress.map(t => renderTaskHTMLFull(t)).join('') : '<div class="empty-state">Rien en cours</div>';
    $('done-list').innerHTML = done.length ? done.map(t => renderTaskHTMLFull(t)).join('') : '<div class="empty-state">Rien terminé</div>';
    
    attachTaskEventsFull();
    
    // Réinitialiser le drag & drop pour les nouvelles tâches
    if (typeof initTaskDragAndDrop === 'function') initTaskDragAndDrop();
}

function renderBubblesView(todo, inprogress, done) {
    const allTodo = [...todo, ...inprogress];
    $('bubbles-todo').innerHTML = allTodo.length ? allTodo.map(t => renderTaskHTMLSimple(t)).join('') : '<div class="empty-state">Aucune tâche</div>';
    $('bubbles-done').innerHTML = done.length ? done.map(t => renderTaskHTMLSimple(t)).join('') : '<div class="empty-state">Rien terminé</div>';
    
    attachTaskEventsSimple();
    
    // Réinitialiser le drag & drop pour les nouvelles tâches
    if (typeof initTaskDragAndDrop === 'function') initTaskDragAndDrop();
}

// Vue 3 colonnes - avec boutons
function renderTaskHTMLFull(task) {
    const project = getProject(task.project);
    const userAvatar = getUserAvatar(task.userId);
    const hasDescription = task.description && task.description.trim();
    
    return `
        <div class="bubble ${task.status}" data-id="${task.id}">
            <button class="edit-btn ${hasDescription ? 'has-note' : ''}" data-action="edit" title="${hasDescription ? 'Voir/Modifier notes' : 'Ajouter notes'}">✏️</button>
            <div class="bubble-header">
                <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon} ${project.name}</span>
                <span class="task-priority ${task.priority.level === 1 ? 'urgent' : ''}">${task.priority.label}</span>
                <span class="task-user" title="${task.userName}">${userAvatar}</span>
            </div>
            <div class="bubble-text">${escapeHtml(task.text)}</div>
            ${hasDescription ? `
                <button class="note-toggle" data-expanded="false" title="Voir les notes">
                    <span class="note-dot">●</span>
                    <span class="note-arrow">▼</span>
                </button>
                <div class="bubble-description hidden">${escapeHtml(task.description)}</div>
            ` : ''}
            <div class="task-actions">
                ${task.status === 'todo' ? `<button class="task-action-btn start" data-action="start">▶️</button>` : ''}
                ${task.status === 'inprogress' ? `<button class="task-action-btn complete" data-action="done">✅</button>` : ''}
                ${task.status === 'todo' ? `<button class="task-action-btn complete" data-action="done">✓</button>` : ''}
                ${task.status === 'done' ? `<button class="task-action-btn reopen" data-action="reopen">↩️</button>` : ''}
                <button class="task-action-btn delete" data-action="delete">🗑️</button>
            </div>
        </div>
    `;
}

// Vue 2 colonnes - simple (pas de boutons action, clic = toggle)
function renderTaskHTMLSimple(task) {
    const project = getProject(task.project);
    const userAvatar = getUserAvatar(task.userId);
    const hasDescription = task.description && task.description.trim();
    
    return `
        <div class="bubble ${task.status}" data-id="${task.id}" data-simple="true">
            <button class="edit-btn ${hasDescription ? 'has-note' : ''}" data-action="edit" title="${hasDescription ? 'Voir/Modifier notes' : 'Ajouter notes'}">✏️</button>
            <div class="bubble-header">
                <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon}</span>
                <span class="task-priority ${task.priority.level === 1 ? 'urgent' : ''}">${task.priority.label}</span>
                <span class="task-user" title="${task.userName}">${userAvatar}</span>
            </div>
            <div class="bubble-text">${escapeHtml(task.text)}</div>
            ${hasDescription ? `
                <button class="note-toggle" data-expanded="false" title="Voir les notes">
                    <span class="note-dot">●</span>
                    <span class="note-arrow">▼</span>
                </button>
                <div class="bubble-description hidden">${escapeHtml(task.description)}</div>
            ` : ''}
        </div>
    `;
}

// Fonction pour dérouler/replier les notes
function toggleNoteDisplay(btn) {
    const bubble = btn.closest('.bubble');
    if (!bubble) return;
    
    const description = bubble.querySelector('.bubble-description');
    const arrow = btn.querySelector('.note-arrow');
    const isExpanded = btn.dataset.expanded === 'true';
    
    if (isExpanded) {
        // Replier
        description.classList.add('hidden');
        btn.dataset.expanded = 'false';
        arrow.textContent = '▼';
        btn.classList.remove('expanded');
    } else {
        // Déplier
        description.classList.remove('hidden');
        btn.dataset.expanded = 'true';
        arrow.textContent = '▲';
        btn.classList.add('expanded');
    }
}

function attachTaskEventsFull() {
    // Boutons d'action
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
    
    // Boutons edit (crayon)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskEl = newBtn.closest('.bubble');
            if (!taskEl) return;
            openEditTaskModal(taskEl.dataset.id);
        });
    });
    
    // Boutons toggle notes (point orange)
    document.querySelectorAll('.note-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNoteDisplay(btn);
        });
    });
    
    // Clic sur la bulle = ouvre la modal aussi
    document.querySelectorAll('#columns-view .bubble').forEach(bubble => {
        bubble.addEventListener('click', (e) => {
            // Ignorer si on a cliqué sur un bouton
            if (e.target.closest('.task-action-btn') || e.target.closest('.edit-btn') || e.target.closest('.note-toggle')) return;
            openEditTaskModal(bubble.dataset.id);
        });
    });
}

function attachTaskEventsSimple() {
    // Boutons edit (crayon) - ouvre la modal
    document.querySelectorAll('.bubbles-view .edit-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskEl = newBtn.closest('.bubble');
            if (!taskEl) return;
            openEditTaskModal(taskEl.dataset.id);
        });
    });
    
    // Boutons toggle notes (point orange)
    document.querySelectorAll('.bubbles-view .note-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNoteDisplay(btn);
        });
    });
    
    // Clic sur la bulle = TOGGLE fait/à faire (mode 2 colonnes)
    document.querySelectorAll('.bubble[data-simple="true"]').forEach(bubble => {
        bubble.addEventListener('click', (e) => {
            // Ignorer si on a cliqué sur le bouton edit ou note-toggle
            if (e.target.closest('.edit-btn') || e.target.closest('.note-toggle')) return;
            
            const taskId = bubble.dataset.id;
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            
            // Toggle: todo/inprogress -> done, done -> todo
            if (task.status === 'done') {
                handleTaskAction(taskId, 'reopen');
            } else {
                handleTaskAction(taskId, 'done');
            }
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
        
    } else if (action === 'reopen') {
        await updateTaskAPI(taskId, 'todo', task.priority.level);
        task.status = 'todo';
        task.completedAt = null;
        task.updatedAt = new Date().toISOString();
        await addJournalEntry('task', `🔄 Réouvert: ${task.text}`, 2);
        
    } else if (action === 'delete') {
        await deleteTaskAPI(taskId);
        tasks.splice(taskIndex, 1);
        await addJournalEntry('task', `🗑️ Supprimé: ${task.text}`, 2);
    }
    
    renderTasks();
    renderProjectsFilter();
}

// =============================================
// EXPORT / BACKUP
// =============================================

function exportData() {
    const data = {
        exportDate: new Date().toISOString(),
        tenant: TENANT_ID,
        user: currentUser.name,
        tasks: tasks,
        journal: journal,
        projects: projects
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `productiveapp_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup exporté:', data.tasks.length, 'tâches,', data.journal.length, 'entrées journal');
    alert(`✅ Backup téléchargé !\n\n${tasks.length} tâches\n${journal.length} entrées journal`);
}

// =============================================
// ÉDITION TÂCHES
// =============================================

function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    $('edit-task-id').value = taskId;
    $('edit-task-title').value = task.text;
    $('edit-task-description').value = task.description || '';
    
    // Remplir le sélecteur de projet
    const projectSelect = $('edit-task-project');
    projectSelect.innerHTML = projects.map(p =>
        `<option value="${p.id}" ${task.project === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`
    ).join('');

    // Remplir le sélecteur de priorité
    const prioritySelect = $('edit-task-priority');
    prioritySelect.value = task.priority || '2';

    // Remplir le sélecteur d'utilisateur
    const userSelect = $('edit-task-user');
    userSelect.innerHTML = USERS.map(u =>
        `<option value="${u.id}" ${task.userId === u.id ? 'selected' : ''}>${u.name}</option>`
    ).join('');
    
    // Boutons d'action selon le statut
    let statusButtons = '';
    if (task.status === 'todo') {
        statusButtons = `
            <button class="btn-warning modal-action-btn" onclick="modalTaskAction('${taskId}', 'start')">▶️ Commencer</button>
            <button class="btn-success modal-action-btn" onclick="modalTaskAction('${taskId}', 'done')">✅ Terminé</button>
        `;
    } else if (task.status === 'inprogress') {
        statusButtons = `
            <button class="btn-success modal-action-btn" onclick="modalTaskAction('${taskId}', 'done')">✅ Terminé</button>
        `;
    } else if (task.status === 'done') {
        statusButtons = `
            <button class="btn-secondary modal-action-btn" onclick="modalTaskAction('${taskId}', 'reopen')">🔄 Réouvrir</button>
        `;
    }
    statusButtons += `<button class="btn-danger modal-action-btn" onclick="modalTaskAction('${taskId}', 'delete')">🗑️ Supprimer</button>`;
    
    $('modal-status-actions').innerHTML = statusButtons;
    
    $('edit-task-modal').classList.remove('hidden');
    $('edit-task-title').focus();
    
    // Attacher l'événement de correction automatique au textarea
    const textarea = $('edit-task-description');
    textarea.removeEventListener('blur', handleDescriptionBlur); // Éviter les doublons
    textarea.addEventListener('blur', handleDescriptionBlur);
}

async function modalTaskAction(taskId, action) {
    await handleTaskAction(taskId, action);
    closeEditTaskModal();
}

function closeEditTaskModal() {
    $('edit-task-modal').classList.add('hidden');
    $('edit-task-id').value = '';
    $('edit-task-title').value = '';
    $('edit-task-description').value = '';
}

async function saveEditTask() {
    const taskId = $('edit-task-id').value;
    const newTitle = $('edit-task-title').value.trim();
    const newDescription = $('edit-task-description').value.trim();
    const newProjectId = $('edit-task-project').value;
    const newPriority = parseInt($('edit-task-priority').value);
    const newUserId = $('edit-task-user').value;

    if (!newTitle) {
        alert('Le titre ne peut pas être vide');
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Mettre à jour via API
    await updateTaskFullAPI(taskId, newTitle, newDescription, newProjectId, newPriority, newUserId);

    // Mettre à jour localement
    task.text = newTitle;
    task.description = newDescription;
    task.project = newProjectId;
    task.priority = newPriority;
    task.userId = newUserId;
    task.userName = getUserName(newUserId);
    task.updatedAt = new Date().toISOString();

    // Synchroniser la référence globale
    window.tasks = tasks;

    closeEditTaskModal();
    renderTasks();
    renderProjectsFilter();
}

async function updateTaskFullAPI(taskId, title, description, projectId, priority, userId) {
    try {
        let fullText = title;
        if (description && description.trim()) {
            fullText = title + '\n---\n' + description;
        }
        
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_full',
                tenant_id: TENANT_ID,
                task_id: taskId,
                text: fullText,
                project_id: projectId,
                priority: priority,
                user_id: userId
            })
        });
        
        const text = await response.text();
        console.log('✅ Tâche mise à jour complète:', text);
        return true;
    } catch (error) {
        console.error('❌ Erreur update tâche:', error);
        return false;
    }
}

async function updateTaskTextAPI(taskId, title, description) {
    try {
        let fullText = title;
        if (description && description.trim()) {
            fullText = title + '\n---\n' + description;
        }
        
        const response = await fetch(API_TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_text',
                tenant_id: TENANT_ID,
                task_id: taskId,
                text: fullText
            })
        });
        
        const text = await response.text();
        console.log('✅ Texte mis à jour:', text);
        return true;
    } catch (error) {
        console.error('❌ Erreur update texte:', error);
        return false;
    }
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
    
    if (result && Array.isArray(result) && result.length > 0) {
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

// Tailles de police du chatbot
const FONT_SIZES = ['small', 'medium', 'large', 'xlarge'];
let chatbotFontSize = localStorage.getItem('chatbot-font-size') || 'medium';

function toggleChatbotFontSize() {
    const currentIndex = FONT_SIZES.indexOf(chatbotFontSize);
    const nextIndex = (currentIndex + 1) % FONT_SIZES.length;
    chatbotFontSize = FONT_SIZES[nextIndex];
    localStorage.setItem('chatbot-font-size', chatbotFontSize);
    $('chatbot-window').dataset.font = chatbotFontSize;
    
    // Feedback visuel
    const labels = { small: 'Petit', medium: 'Moyen', large: 'Grand', xlarge: 'Très grand' };
    const btn = $('chatbot-font-size');
    btn.textContent = labels[chatbotFontSize];
    setTimeout(() => { btn.textContent = 'Aa'; }, 1000);
}

function initChatbotFontSize() {
    if ($('chatbot-window')) {
        $('chatbot-window').dataset.font = chatbotFontSize;
    }
}

// =============================================
// COMMANDES LOCALES CHATBOT (Option B - Frontend)
// =============================================

async function handleLocalCommands(message) {
    const msg = message.toLowerCase();

    // Commande : Supprimer les doublons
    if (msg.match(/supprim.*(doublon|duplicate|double)/i) || msg.includes('nettoie')) {
        await handleDeleteDuplicates();
        return true;
    }

    // Commande : Compter tâches urgentes
    if (msg.match(/combien.*(urgent|priorit)/i)) {
        const urgent = tasks.filter(t => t.status !== 'done' && t.priority.level === 1);
        const urgentList = urgent.map(t => `- ${t.text}`).join('\n');
        addChatMsg(`🔥 Tu as **${urgent.length} tâche(s) urgente(s)** :\n\n${urgentList || 'Aucune'}`, 'assistant');
        return true;
    }

    // Commande : Compter tâches en cours
    if (msg.match(/combien.*(en cours|progress)/i)) {
        const inProgress = tasks.filter(t => t.status === 'inprogress');
        const list = inProgress.map(t => `- ${t.text}`).join('\n');
        addChatMsg(`🔄 Tu as **${inProgress.length} tâche(s) en cours** :\n\n${list || 'Aucune'}`, 'assistant');
        return true;
    }

    // Commande : Stats globales
    if (msg.match(/stats|statistiques|résumé|bilan/i)) {
        const todo = tasks.filter(t => t.status === 'todo').length;
        const inProgress = tasks.filter(t => t.status === 'inprogress').length;
        const done = tasks.filter(t => t.status === 'done').length;
        const urgent = tasks.filter(t => t.status !== 'done' && t.priority.level === 1).length;
        const total = tasks.length;

        addChatMsg(`📊 **Statistiques de tes tâches** :\n\n` +
            `📋 À faire : ${todo}\n` +
            `🔄 En cours : ${inProgress}\n` +
            `✅ Terminé : ${done}\n` +
            `🔥 Urgent : ${urgent}\n` +
            `📌 Total : ${total}`, 'assistant');
        return true;
    }

    return false; // Pas de commande locale détectée
}

async function handleDeleteDuplicates() {
    const seen = new Map(); // Map<"text|project", Task>
    const duplicates = [];

    // Identifier les doublons (même texte + même projet)
    tasks.forEach(t => {
        const key = `${t.text.toLowerCase().trim()}|${t.project}`;
        if (seen.has(key)) {
            duplicates.push(t);
        } else {
            seen.set(key, t);
        }
    });

    if (duplicates.length === 0) {
        addChatMsg('✅ Aucun doublon trouvé ! Tes tâches sont nickel.', 'assistant');
        return;
    }

    // Supprimer les doublons via l'API
    let deleted = 0;
    for (const dup of duplicates) {
        await deleteTaskAPI(dup.id);
        tasks = tasks.filter(t => t.id !== dup.id);
        deleted++;
    }

    renderTasks();
    renderProjectsFilter();

    const dupList = duplicates.slice(0, 5).map(d => `- ${d.text}`).join('\n');
    const moreText = duplicates.length > 5 ? `\n... et ${duplicates.length - 5} autres` : '';

    addChatMsg(`🗑️ **${deleted} doublon(s) supprimé(s)** :\n\n${dupList}${moreText}`, 'assistant');
}

async function sendChatMessage() {
    const message = $('chatbot-input').value.trim();
    if (!message) return;

    addChatMsg(message, 'user');
    $('chatbot-input').value = '';

    // ✨ Détection locale des commandes AVANT N8N (Option B - Frontend)
    const localHandled = await handleLocalCommands(message);
    if (localHandled) return; // Commande traitée localement, on skip N8N

    const loadingDiv = addChatMsg('Réflexion...', 'assistant loading');

    try {
        const context = buildAIContext();
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context, user: currentUser.name, userId: currentUser.id, tenant_id: 'digitalgiri' })
        });

        let aiResponse = await response.text();
        try { const j = JSON.parse(aiResponse); aiResponse = j.response || j.text || aiResponse; } catch(e) {}

        loadingDiv.remove();
        const hadActions = aiResponse && aiResponse.includes('ACTION:');
        aiResponse = await processAIActions(aiResponse);
        if (hadActions) await loadTasks();
        addChatMsg(aiResponse || 'OK!', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMsg('Erreur de connexion', 'assistant');
        console.error('❌ Erreur chatbot:', e);
    }
}

// =============================================
// CHATBOT MÉDIA - Micro, Caméra, Fichiers
// =============================================

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// Initialiser les boutons média
function initChatMediaButtons() {
    const micBtn = $('chat-mic-btn');
    const cameraBtn = $('chat-camera-btn');
    const fileBtn = $('chat-file-btn');
    const cameraInput = $('chat-camera-input');
    const fileInput = $('chat-file-input');

    if (!micBtn) return;

    // Micro : MAINTENIR APPUYÉ pour enregistrer (style WhatsApp)
    micBtn.addEventListener('mousedown', startHoldRecording);
    micBtn.addEventListener('mouseup', () => stopAudioRecording(false));
    micBtn.addEventListener('mouseleave', () => { if (isRecording) stopAudioRecording(true); });
    // Touch events pour mobile
    micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHoldRecording(); }, { passive: false });
    micBtn.addEventListener('touchend', () => stopAudioRecording(false));
    micBtn.addEventListener('touchcancel', () => stopAudioRecording(true));

    // Caméra : ouvre sélecteur
    cameraBtn.addEventListener('click', () => cameraInput.click());
    cameraInput.addEventListener('change', handleImageSelect);

    // Fichier : ouvre sélecteur
    fileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

// Démarrer enregistrement en maintenant appuyé
async function startHoldRecording() {
    if (isRecording) return;
    await toggleAudioRecording();
}

// Variables pour l'enregistrement audio
let audioContext, analyser, dataArray, animationId, recordingStartTime, timerInterval;

// Toggle enregistrement audio
async function toggleAudioRecording() {
    const micBtn = $('chat-mic-btn');
    const recorderUI = $('audio-recorder-ui');
    const chatInput = $('chatbot-input');

    if (isRecording) {
        // Arrêter l'enregistrement
        stopAudioRecording(false);
    } else {
        // Démarrer l'enregistrement
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup audio analyser pour visualisation
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            // Créer les barres de l'onde
            createWaveformBars();

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (audioContext) audioContext.close();
                cancelAnimationFrame(animationId);
                clearInterval(timerInterval);

                // Si pas annulé, envoyer
                if (audioChunks.length > 0 && !window.recordingCancelled) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await sendAudioMessage(audioBlob);
                }
                window.recordingCancelled = false;
            };

            mediaRecorder.start();
            micBtn.classList.add('recording');
            recorderUI.classList.add('active');
            chatInput.style.display = 'none';
            isRecording = true;

            // Démarrer timer
            recordingStartTime = Date.now();
            updateRecordTimer();
            timerInterval = setInterval(updateRecordTimer, 1000);

            // Démarrer visualisation
            animateWaveform();

        } catch (err) {
            console.error('❌ Erreur micro:', err);
            addChatMsg('❌ Impossible d\'accéder au micro', 'assistant');
        }
    }
}

// Créer les barres du visualiseur
function createWaveformBars() {
    const waveform = $('audio-waveform');
    waveform.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        bar.style.height = '4px';
        waveform.appendChild(bar);
    }
}

// Animer l'onde en fonction du son
function animateWaveform() {
    if (!isRecording) return;

    analyser.getByteFrequencyData(dataArray);
    const bars = document.querySelectorAll('.waveform-bar');

    bars.forEach((bar, i) => {
        const value = dataArray[i] || 0;
        const height = Math.max(4, (value / 255) * 28);
        bar.style.height = height + 'px';
    });

    animationId = requestAnimationFrame(animateWaveform);
}

// Mettre à jour le timer
function updateRecordTimer() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timer = $('record-timer');
    if (timer) timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Arrêter l'enregistrement
function stopAudioRecording(cancel = false) {
    const micBtn = $('chat-mic-btn');
    const recorderUI = $('audio-recorder-ui');
    const chatInput = $('chatbot-input');

    window.recordingCancelled = cancel;

    if (cancel) {
        audioChunks = []; // Vider si annulé
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    micBtn.classList.remove('recording');
    recorderUI.classList.remove('active');
    chatInput.style.display = '';
    isRecording = false;

    clearInterval(timerInterval);
    cancelAnimationFrame(animationId);
}

// Initialiser bouton annuler
function initRecordCancelBtn() {
    const cancelBtn = $('record-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => stopAudioRecording(true));
    }
}

// Envoyer audio en base64
async function sendAudioMessage(audioBlob) {
    const base64 = await blobToBase64(audioBlob);

    // Afficher preview
    addChatMsg('🎙️ Audio envoyé...', 'user');
    const loadingDiv = addChatMsg('Analyse audio...', 'assistant loading');

    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'audio',
                audio: base64,
                mimeType: 'audio/webm',
                user: currentUser.name,
                userId: currentUser.id,
                tenant_id: 'digitalgiri',
                context: buildAIContext()
            })
        });

        let aiResponse = await response.text();
        try { const j = JSON.parse(aiResponse); aiResponse = j.response || j.text || aiResponse; } catch(e) {}

        loadingDiv.remove();
        if (aiResponse && aiResponse.includes('ACTION:')) {
            aiResponse = await processAIActions(aiResponse);
            await loadTasks();
        }
        addChatMsg(aiResponse || 'Audio reçu !', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMsg('❌ Erreur envoi audio', 'assistant');
        console.error('❌ Erreur envoi audio:', e);
    }
}

// Gérer sélection image
async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const base64 = await fileToBase64(file);

    // Afficher preview
    const previewDiv = document.createElement('div');
    previewDiv.className = 'chat-msg user media-preview';
    previewDiv.innerHTML = `<img src="${base64}" alt="Photo">`;
    $('chatbot-messages').appendChild(previewDiv);
    $('chatbot-messages').scrollTop = $('chatbot-messages').scrollHeight;

    const loadingDiv = addChatMsg('Analyse image...', 'assistant loading');

    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'image',
                image: base64,
                mimeType: file.type,
                fileName: file.name,
                user: currentUser.name,
                userId: currentUser.id,
                tenant_id: 'digitalgiri',
                context: buildAIContext()
            })
        });

        let aiResponse = await response.text();
        try { const j = JSON.parse(aiResponse); aiResponse = j.response || j.text || aiResponse; } catch(e) {}

        loadingDiv.remove();
        if (aiResponse && aiResponse.includes('ACTION:')) {
            aiResponse = await processAIActions(aiResponse);
            await loadTasks();
        }
        addChatMsg(aiResponse || 'Image reçue !', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMsg('❌ Erreur envoi image', 'assistant');
        console.error('❌ Erreur envoi image:', e);
    }

    e.target.value = ''; // Reset input
}

// Gérer sélection fichier
async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const base64 = await fileToBase64(file);

    addChatMsg(`📎 Fichier: ${file.name}`, 'user');
    const loadingDiv = addChatMsg('Analyse fichier...', 'assistant loading');

    try {
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'file',
                file: base64,
                mimeType: file.type,
                fileName: file.name,
                user: currentUser.name,
                userId: currentUser.id,
                tenant_id: 'digitalgiri',
                context: buildAIContext()
            })
        });

        let aiResponse = await response.text();
        try { const j = JSON.parse(aiResponse); aiResponse = j.response || j.text || aiResponse; } catch(e) {}

        loadingDiv.remove();
        if (aiResponse && aiResponse.includes('ACTION:')) {
            aiResponse = await processAIActions(aiResponse);
            await loadTasks();
        }
        addChatMsg(aiResponse || 'Fichier reçu !', 'assistant');
    } catch (e) {
        loadingDiv.remove();
        addChatMsg('❌ Erreur envoi fichier', 'assistant');
        console.error('❌ Erreur envoi fichier:', e);
    }

    e.target.value = ''; // Reset input
}

// Convertir Blob en base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Convertir File en base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// === FONCTIONS RECHERCHE TÂCHES ===
function highlightSearchResults(query) {
    const bubbles = document.querySelectorAll('.bubble');
    let matchCount = 0;

    bubbles.forEach(bubble => {
        const text = bubble.textContent.toLowerCase();
        if (text.includes(query)) {
            bubble.classList.add('search-match');
            bubble.classList.remove('search-hidden');
            matchCount++;
            // Scroll vers le premier résultat
            if (matchCount === 1) {
                bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            bubble.classList.remove('search-match');
            bubble.classList.add('search-hidden');
        }
    });

    const searchCount = $('search-count');
    searchCount.textContent = matchCount > 0 ? matchCount : '';
}

function clearSearchHighlights() {
    document.querySelectorAll('.bubble').forEach(bubble => {
        bubble.classList.remove('search-match', 'search-hidden');
    });
    $('search-count').textContent = '';
}

function buildAIContext() {
    const todo = tasks.filter(t => t.status === 'todo');
    const inProgress = tasks.filter(t => t.status === 'inprogress');
    const today = new Date().toDateString();
    const todayJournal = journal.filter(e => new Date(e.date).toDateString() === today);
    
    const urgent = todo.filter(t => t.priority.level === 1);
    
    let ctx = `=== EMPIRE DIGITAL GIRI ===\nUser: ${currentUser.name} (${currentUser.role})\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    ctx += `📊 STATS: 🔥 Urgent: ${urgent.length} | 📋 À faire: ${todo.length} | 🔄 En cours: ${inProgress.length}\n\n`;
    
    // Commandes disponibles
    ctx += `🤖 COMMANDES DISPONIBLES (utilise-les pour agir):
- ACTION:CREATE|texte → Créer une tâche
- ACTION:DONE|texte → Marquer comme terminé
- ACTION:START|texte → Commencer une tâche
- ACTION:PRIORITY|texte|1 → Mettre en urgent (1=urgent, 2=normal, 3=basse)
- ACTION:REOPEN|texte → Réouvrir une tâche terminée
- ACTION:DELETE_DUPLICATES → Supprimer les tâches en double

`;
    
    if (urgent.length) {
        ctx += `🔥 URGENT:\n${urgent.map(t => `- ${t.text} (${getProject(t.project).name})`).join('\n')}\n\n`;
    }
    
    if (inProgress.length) {
        ctx += `🔄 EN COURS:\n${inProgress.map(t => `- ${t.text}`).join('\n')}\n\n`;
    }
    
    // Liste des tâches par projet
    ctx += `📋 TÂCHES À FAIRE:\n`;
    projects.forEach(p => {
        const pTodo = todo.filter(t => t.project === p.id);
        if (pTodo.length) {
            ctx += `${p.icon} ${p.name}:\n${pTodo.map(t => `  - ${t.text} [P${t.priority.level}]`).join('\n')}\n`;
        }
    });
    
    ctx += `\n📝 JOURNAL (5 derniers): ${todayJournal.slice(0, 5).map(e => e.text).join(' | ') || 'Vide'}`;
    
    return ctx;
}

async function processAIActions(response) {
    let actionsPerformed = [];
    
    // ACTION:CREATE|texte de la tâche
    if (response.includes('ACTION:CREATE|')) {
        for (const m of [...response.matchAll(/ACTION:CREATE\|([^\n]+)/g)]) {
            const taskData = {
                text: m[1].trim(),
                description: '',
                project: activeProjectFilter !== 'all' ? activeProjectFilter : 'general',
                priority: { level: 2, label: 'Normal' },
                userId: currentUser.id,
                userName: currentUser.name
            };
            
            const result = await createTaskAPI(taskData);
            if (result && Array.isArray(result) && result.length > 0) {
                const newTask = result[0];
                const parts = (newTask.text || '').split('\n---\n');
                tasks.push({
                    id: newTask.task_id,
                    text: parts[0] || newTask.text,
                    description: parts[1] || '',
                    status: newTask.status,
                    priority: { level: newTask.priority, label: getPriorityLabel(newTask.priority) },
                    project: newTask.project_id,
                    userId: newTask.user_id,
                    userName: getUserName(newTask.user_id),
                    createdAt: newTask.created_at,
                    updatedAt: newTask.updated_at
                });
                actionsPerformed.push(`✅ Tâche créée: ${m[1].trim()}`);
                lastChatbotActionTaskId = newTask.task_id;
            }
        }
    }

    // ACTION:DONE|texte de la tâche
    if (response.includes('ACTION:DONE|')) {
        for (const m of [...response.matchAll(/ACTION:DONE\|([^\n]+)/g)]) {
            const searchText = m[1].trim().toLowerCase();
            const t = tasks.find(t => t.status !== 'done' && t.text.toLowerCase().includes(searchText));
            if (t) {
                await updateTaskAPI(t.id, 'done', t.priority.level);
                t.status = 'done';
                t.completedAt = new Date().toISOString();
                actionsPerformed.push(`✅ Terminé: ${t.text}`);
                lastChatbotActionTaskId = t.id;
            }
        }
    }
    
    // ACTION:PRIORITY|texte|niveau (1=urgent, 2=normal, 3=basse)
    if (response.includes('ACTION:PRIORITY|')) {
        for (const m of [...response.matchAll(/ACTION:PRIORITY\|([^|]+)\|(\d)/g)]) {
            const searchText = m[1].trim().toLowerCase();
            const newPriority = parseInt(m[2]);
            const t = tasks.find(t => t.text.toLowerCase().includes(searchText));
            if (t && newPriority >= 1 && newPriority <= 3) {
                await updateTaskAPI(t.id, t.status, newPriority);
                t.priority = { level: newPriority, label: getPriorityLabel(newPriority) };
                const priorityNames = { 1: '🔥 Urgent', 2: 'Normal', 3: 'Basse' };
                actionsPerformed.push(`🎯 Priorité ${priorityNames[newPriority]}: ${t.text}`);
            }
        }
    }
    
    // ACTION:START|texte de la tâche
    if (response.includes('ACTION:START|')) {
        for (const m of [...response.matchAll(/ACTION:START\|([^\n]+)/g)]) {
            const searchText = m[1].trim().toLowerCase();
            const t = tasks.find(t => t.status === 'todo' && t.text.toLowerCase().includes(searchText));
            if (t) {
                await updateTaskAPI(t.id, 'inprogress', t.priority.level);
                t.status = 'inprogress';
                actionsPerformed.push(`▶️ Commencé: ${t.text}`);
            }
        }
    }
    
    // ACTION:REOPEN|texte de la tâche
    if (response.includes('ACTION:REOPEN|')) {
        for (const m of [...response.matchAll(/ACTION:REOPEN\|([^\n]+)/g)]) {
            const searchText = m[1].trim().toLowerCase();
            const t = tasks.find(t => t.status === 'done' && t.text.toLowerCase().includes(searchText));
            if (t) {
                await updateTaskAPI(t.id, 'todo', t.priority.level);
                t.status = 'todo';
                t.completedAt = null;
                actionsPerformed.push(`🔄 Réouvert: ${t.text}`);
            }
        }
    }

    // ACTION:DELETE_DUPLICATES - Supprimer les tâches en double
    if (response.includes('ACTION:DELETE_DUPLICATES')) {
        const seen = new Map(); // Map<"text|project", Task>
        const duplicates = [];

        // Identifier les doublons (même texte + même projet)
        tasks.forEach(t => {
            const key = `${t.text.toLowerCase().trim()}|${t.project}`;
            if (seen.has(key)) {
                // C'est un doublon, on garde le premier et supprime celui-ci
                duplicates.push(t);
            } else {
                seen.set(key, t);
            }
        });

        // Supprimer les doublons via l'API
        for (const dup of duplicates) {
            await deleteTaskAPI(dup.id);
            tasks = tasks.filter(t => t.id !== dup.id);
            actionsPerformed.push(`🗑️ Doublon supprimé: ${dup.text}`);
        }

        if (duplicates.length === 0) {
            actionsPerformed.push(`✅ Aucun doublon trouvé`);
        } else {
            actionsPerformed.push(`✅ ${duplicates.length} doublon(s) supprimé(s)`);
        }
    }

    // Si des actions ont été effectuées
    if (actionsPerformed.length > 0) {
        renderTasks();
        renderProjectsFilter();
        response = response.replace(/ACTION:[A-Z]+\|[^\n]*/g, '').trim();
        response += '\n\n' + actionsPerformed.join('\n');
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
                userId: currentUser.id,
                tenant_id: 'digitalgiri',
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

async function createProject() {
    const name = $('new-project-name').value.trim();
    const desc = $('new-project-desc').value.trim();
    if (!name) return;
    
    const icons = ['📁', '🎯', '💡', '🚀', '⭐', '🔥', '💎', '🌟'];
    const colors = ['#e07840', '#00ff66', '#ff6b9d', '#6c8fff', '#00b4d8', '#bf6bff', '#f97316', '#4ade80'];
    
    const projectData = {
        name: name,
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        desc: desc || name
    };
    
    const result = await createProjectAPI(projectData);
    
    if (result && result.length > 0) {
        const newProj = result[0];
        projects.push({
            id: newProj.project_id || projectData.id || ('proj_' + Date.now()),
            name: newProj.name || projectData.name,
            icon: newProj.icon || projectData.icon,
            color: newProj.color || projectData.color,
            desc: newProj.description || projectData.desc
        });
        
        renderProjectsFilter();
        renderProjectSelect();
        console.log('✅ Projet ajouté:', projectData.name);
    }
    
    closeProjectModal();
}

// =============================================
// BULLES DE FEU TRAVERSANTES (Login screen)
// =============================================

function createFireBubbles() {
    const loginScreen = $('login-screen');
    if (!loginScreen) return;

    // Créer le conteneur
    let container = document.querySelector('.fire-bubbles-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'fire-bubbles-container';
        loginScreen.appendChild(container);
    }

    // Couleurs bleues divines et violettes (boules de feu mystiques)
    const fireColors = [
        'radial-gradient(circle, #00d4ff 0%, #0099cc 50%, #006699 100%)',
        'radial-gradient(circle, #9966ff 0%, #7733ff 50%, #5500cc 100%)',
        'radial-gradient(circle, #cc66ff 0%, #9933ff 50%, #6600cc 100%)',
        'radial-gradient(circle, #66ccff 0%, #3399ff 50%, #0066cc 100%)',
        'radial-gradient(circle, #bf7fff 0%, #9933ff 50%, #7700cc 100%)'
    ];

    function spawnFireBubble() {
        if (loginScreen.classList.contains('hidden')) return;

        const bubble = document.createElement('div');
        bubble.className = 'fire-bubble';

        // Taille aléatoire
        const size = 15 + Math.random() * 35;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';

        // Position Y aléatoire
        bubble.style.top = (10 + Math.random() * 80) + '%';

        // Couleur aléatoire
        bubble.style.background = fireColors[Math.floor(Math.random() * fireColors.length)];
        // Glow bleu/violet mystique
        const isBlue = Math.random() > 0.5;
        const glowColor = isBlue ? 'rgba(0, 150, 255, 0.7)' : 'rgba(150, 50, 255, 0.7)';
        const glowColor2 = isBlue ? 'rgba(0, 100, 200, 0.4)' : 'rgba(100, 0, 200, 0.4)';
        bubble.style.boxShadow = `0 0 ${size/2}px ${glowColor}, 0 0 ${size}px ${glowColor2}, 0 0 ${size*1.5}px ${glowColor2}`;

        // Direction aléatoire
        const goRight = Math.random() > 0.5;
        bubble.style.left = goRight ? '0' : 'auto';
        bubble.style.right = goRight ? 'auto' : '0';
        bubble.style.animationName = goRight ? 'fireBubbleTraverse' : 'fireBubbleTraverseReverse';

        // Durée aléatoire
        const duration = 6 + Math.random() * 8;
        bubble.style.animationDuration = duration + 's';

        container.appendChild(bubble);

        // Supprimer après animation
        setTimeout(() => bubble.remove(), duration * 1000);
    }

    // Spawner des bulles régulièrement
    setInterval(spawnFireBubble, 800);
    // Quelques bulles au démarrage
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnFireBubble, i * 300);
    }
}

// =============================================
// PARTICULES SOUFFLE DE FEU (autour avatar)
// =============================================

function initFireBreathParticles() {
    const containers = document.querySelectorAll('.fire-breath-container');
    if (containers.length === 0) return;

    const fireColors = [
        '#ffd700', '#ffaa00', '#ff8c00', '#ff6b35',
        '#ff4500', '#ff6347', '#ffb300', '#fff176'
    ];

    // Créer une vague de particules
    function createBreathWave(container) {
        const particleCount = 8 + Math.floor(Math.random() * 6); // 8-14 particules par vague
        const startAngle = Math.random() * 360;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createBreathParticle(container, startAngle + (i * 15), fireColors);
            }, i * 40); // Légère cascade
        }
    }

    // Créer une particule de souffle
    function createBreathParticle(container, startAngle, colors) {
        const particle = document.createElement('div');
        particle.className = 'breath-particle';

        // Taille aléatoire
        const size = 3 + Math.random() * 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Couleur aléatoire
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80`;

        // Position de départ (centre)
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = 'translate(-50%, -50%)';

        container.appendChild(particle);

        // Animation en courbe harmonique
        const duration = 1500 + Math.random() * 1000;
        const radius = 50 + Math.random() * 30; // Rayon d'orbite
        const rotations = 0.8 + Math.random() * 0.6; // Tours partiels
        const angleRad = (startAngle * Math.PI) / 180;

        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress >= 1) {
                particle.remove();
                return;
            }

            // Courbe en spirale harmonique
            const currentAngle = angleRad + (progress * rotations * Math.PI * 2);
            const currentRadius = radius * (0.3 + progress * 0.7);
            const x = Math.cos(currentAngle) * currentRadius;
            const y = Math.sin(currentAngle) * currentRadius;

            // Opacité : monte puis descend
            const opacity = progress < 0.2 ? progress * 5 : (1 - progress) * 1.25;

            particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            particle.style.opacity = Math.min(1, opacity);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // Lancer des vagues périodiquement pour chaque conteneur visible
    function breathCycle() {
        containers.forEach(container => {
            const btn = container.closest('.user-select-btn');
            if (btn && btn.style.display !== 'none') {
                createBreathWave(container);
            }
        });
    }

    // Démarrer après un délai (laisser l'animation d'entrée)
    setTimeout(() => {
        breathCycle();
        setInterval(breathCycle, 2500); // Nouvelle vague toutes les 2.5s
    }, 4500);
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ProductiveApp Starting (v12)...');

    renderUserSelect();

    // === BULLES DE FEU TRAVERSANTES ===
    createFireBubbles();
    
    $('login-btn').addEventListener('click', attemptLogin);
    $('login-password').addEventListener('keypress', function(e) { if (e.key === 'Enter') attemptLogin(); });
    $('back-btn').addEventListener('click', function() {
        $('user-select-grid').classList.remove('hidden');
        $('password-form').classList.add('hidden');
        $('login-error').textContent = '';
        currentUser = null;
    });

    // Carrousel navigation - UN SEUL profil visible
    let currentProfileIndex = 0;
    const profileButtons = () => document.querySelectorAll('.user-select-btn');

    // direction: 'right' = vers la droite (next), 'left' = vers la gauche (prev), 'initial' = première apparition
    function showProfile(index, direction = 'initial') {
        const buttons = profileButtons();
        if (buttons.length === 0) return;

        // Boucler
        if (index < 0) index = buttons.length - 1;
        if (index >= buttons.length) index = 0;
        currentProfileIndex = index;

        // Afficher le profil sélectionné, cacher les autres
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.style.display = 'flex';
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.1)';

                // Animation selon direction
                btn.style.animation = 'none';
                btn.offsetHeight; // Force reflow
                if (direction === 'right') {
                    btn.style.animation = 'slideInFromRight 0.4s ease-out forwards';
                } else if (direction === 'left') {
                    btn.style.animation = 'slideInFromLeft 0.4s ease-out forwards';
                } else {
                    // Initial : belle entrée avec cardReveal
                    btn.style.animation = 'cardReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                }
            } else {
                btn.style.display = 'none';
                btn.style.opacity = '0';
            }
        });
    }

    $('carousel-prev').addEventListener('click', () => {
        showProfile(currentProfileIndex - 1, 'left');
    });
    $('carousel-next').addEventListener('click', () => {
        showProfile(currentProfileIndex + 1, 'right');
    });

    // Afficher le premier profil (Maha = index 0) - sync avec carrousel à 2.5s
    setTimeout(() => showProfile(0), 3000);
    $('logout-btn').addEventListener('click', logout);
    $('export-btn').addEventListener('click', exportData);
    
    $('add-task-btn').addEventListener('click', createTask);
    $('task-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createTask(); });
    
    $('view-toggle-btn').addEventListener('click', toggleViewMode);
    
    // === DROPDOWN USER FILTER CUSTOM ===
    $('user-filter-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        $('user-filter-dropdown').classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (!$('user-filter-dropdown').contains(e.target)) {
            $('user-filter-dropdown').classList.remove('open');
        }
    });

    // === BOUTON GYROPHARE (3 modes: urgent/normal/zen) ===
    $('urgent-filter-btn').addEventListener('click', function() {
        const modes = ['off', 'urgent', 'normal', 'zen'];
        const currentIndex = modes.indexOf(priorityFilterMode);
        priorityFilterMode = modes[(currentIndex + 1) % modes.length];

        // Update button state
        this.classList.remove('active', 'mode-urgent', 'mode-normal', 'mode-zen');
        if (priorityFilterMode !== 'off') {
            this.classList.add('active', 'mode-' + priorityFilterMode);
        }

        // Update image
        this.querySelector('.gyrophare-icon').src = GYRO_IMAGES[priorityFilterMode];

        renderTasks();
    });

    // === BARRE DE RECHERCHE TÂCHES ===
    const searchContainer = $('search-container');
    const searchToggleBtn = $('search-toggle-btn');
    const searchInput = $('search-input');
    const searchCount = $('search-count');

    searchToggleBtn.addEventListener('click', function() {
        searchContainer.classList.toggle('expanded');
        searchToggleBtn.classList.toggle('active');
        if (searchContainer.classList.contains('expanded')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            clearSearchHighlights();
        }
    });

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            clearSearchHighlights();
            searchCount.textContent = '';
            return;
        }
        highlightSearchResults(query);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchContainer.classList.remove('expanded');
            searchToggleBtn.classList.remove('active');
            this.value = '';
            clearSearchHighlights();
        }
    });

    // === MENU DROPDOWN TOGGLE ===
    const menuToggleBtn = $('menu-toggle-btn');
    const menuDropdown = $('menu-dropdown');

    menuToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuDropdown.classList.toggle('active');
    });

    // Fermer le menu si on clique à l'extérieur
    document.addEventListener('click', function(e) {
        if (!menuToggleBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.remove('active');
        }
    });

    // Fermer le menu après un clic sur un item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            menuDropdown.classList.remove('active');
        });
    });

    // === NOUVEAU SÉLECTEUR DE THÈMES ===
    $('theme-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        $('theme-modal').classList.remove('hidden');
        // Marquer le thème actif
        const currentTheme = localStorage.getItem('theme') || 'executive';
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === currentTheme);
        });
    });
    $('close-theme-modal').addEventListener('click', function() { $('theme-modal').classList.add('hidden'); });
    $('theme-modal').addEventListener('click', function(e) { if (e.target === $('theme-modal')) $('theme-modal').classList.add('hidden'); });

    // Gérer les clics sur les cartes de thèmes
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', function() {
            const themeId = this.dataset.theme;
            setTheme(themeId);

            // Marquer la carte comme active
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    $('add-project-btn').addEventListener('click', openProjectModal);
    $('cancel-project').addEventListener('click', closeProjectModal);
    $('confirm-project').addEventListener('click', createProject);
    $('project-modal').addEventListener('click', function(e) { if (e.target === $('project-modal')) closeProjectModal(); });
    
    // Modal édition tâche
    $('cancel-edit-task').addEventListener('click', closeEditTaskModal);
    $('confirm-edit-task').addEventListener('click', saveEditTask);
    $('edit-task-modal').addEventListener('click', function(e) { if (e.target === $('edit-task-modal')) closeEditTaskModal(); });
    
    // Bouton reformulation 💡
    if ($('reformulate-btn')) {
        $('reformulate-btn').addEventListener('click', reformulateDescription);
    }
    
    $('add-journal-btn').addEventListener('click', createJournalEntry);
    $('journal-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') createJournalEntry(); });
    
    $('generate-report-btn').addEventListener('click', generateReport);
    $('download-pdf-btn').addEventListener('click', downloadPDF);
    
    $('chatbot-toggle').addEventListener('click', toggleChatbot);
    $('chatbot-close').addEventListener('click', function() {
        $('chatbot-window').classList.add('hidden');
        // Scroll vers la dernière tâche modifiée par le chatbot
        if (lastChatbotActionTaskId) {
            setTimeout(() => {
                const bubble = document.querySelector(`[data-id="${lastChatbotActionTaskId}"]`);
                if (bubble) {
                    bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    bubble.classList.add('search-match');
                    setTimeout(() => bubble.classList.remove('search-match'), 2000);
                }
                lastChatbotActionTaskId = null;
            }, 300);
        }
    });
    $('chatbot-resize').addEventListener('click', toggleChatbotSize);
    if ($('chatbot-font-size')) {
        $('chatbot-font-size').addEventListener('click', toggleChatbotFontSize);
        // Init font size au chargement
        const savedFont = localStorage.getItem('chatbot-font-size') || 'medium';
        $('chatbot-window').dataset.font = savedFont;
    }
    $('chatbot-send').addEventListener('click', sendChatMessage);
    $('chatbot-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') sendChatMessage(); });
    initChatMediaButtons(); // Init boutons média WhatsApp
    initRecordCancelBtn(); // Init bouton annuler enregistrement

    // === GALAXIE VIEW - Integration with Excalidraw ===
    const galaxyIcon = $('galaxy-icon');
    if (galaxyIcon) {
        // Initialize the new GalaxieView module
        if (typeof GalaxieView !== 'undefined') {
            GalaxieView.init();
            galaxyIcon.addEventListener('click', () => {
                GalaxieView.open();
            });
        } else {
            // Fallback to old galaxy.js if new module not loaded
            let galaxyInitialized = false;
            galaxyIcon.addEventListener('click', () => {
                if (!galaxyInitialized && typeof initGalaxyView === 'function') {
                    initGalaxyView();
                    galaxyInitialized = true;
                }
                if (typeof openGalaxyView === 'function') {
                    openGalaxyView();
                }
            });
        }
    }

    // === EFFET DIVIN - PARTICULES DORÉES ===
    if (typeof initDivineParticles === 'function') {
        initDivineParticles();
    }

    checkExistingSession();
    
    console.log('✅ ProductiveApp Ready (v13 - Galaxy v2.0)');
});
