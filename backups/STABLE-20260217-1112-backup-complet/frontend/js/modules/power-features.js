/**
 * ================================================
 * POWER FEATURES - ProductiveApp
 * Smart Priority, Bookmarks, Progress Analytics,
 * Data Export, Onboarding Wizard
 * ================================================
 */

/* ================================================
   SMART PRIORITY MATRIX (Eisenhower)
   ================================================ */
var SmartPriority = (function() {
    'use strict';

    function render(container) {
        if (!container) return;
        var tasks = getTasks().filter(function(t) { var s = (t.status||'').toLowerCase(); return s !== 'done' && s !== 'completed'; });

        var q = { ui: [], i: [], u: [], n: [] };
        tasks.forEach(function(t) {
            var p = (t.priority || 'normal').toLowerCase();
            var hasDue = !!(t.due_date || t.dueDate || t.deadline);
            var isUrgent = p === 'urgent' || p === 'high' || hasDue && isOverdueOrSoon(t);
            var isImportant = p === 'urgent' || p === 'high' || p === 'normal';

            if (isUrgent && isImportant) q.ui.push(t);
            else if (isImportant) q.i.push(t);
            else if (isUrgent) q.u.push(t);
            else q.n.push(t);
        });

        var html = '<button class="priority-ai-btn" id="priority-ai-btn">\uD83E\uDDE0 Prioriser avec l\'IA</button>';
        html += '<div class="priority-matrix">';
        html += renderQuadrant('pq-urgent-important', '\uD83D\uDD25', 'Faire maintenant', q.ui);
        html += renderQuadrant('pq-important', '\uD83C\uDFAF', 'Planifier', q.i);
        html += renderQuadrant('pq-urgent', '\u26A1', 'D\u00e9l\u00e9guer', q.u);
        html += renderQuadrant('pq-neither', '\uD83D\uDDD1\uFE0F', '\u00c9liminer / Reporter', q.n);
        html += '</div>';

        container.innerHTML = html;

        container.querySelector('#priority-ai-btn')?.addEventListener('click', function() {
            aiPrioritize(tasks, container);
        });
    }

    function renderQuadrant(cls, icon, title, tasks) {
        var html = '<div class="priority-quadrant ' + cls + '">';
        html += '<div class="priority-quadrant-header"><span class="priority-quadrant-icon">' + icon + '</span><span class="priority-quadrant-title">' + title + '</span><span class="priority-quadrant-count">' + tasks.length + '</span></div>';
        tasks.forEach(function(t) {
            html += '<div class="priority-task-item" data-task-id="' + (t.id || '') + '"><span class="priority-task-dot"></span>' + escapeHtml(t.title || 'Sans titre') + '</div>';
        });
        if (!tasks.length) html += '<div style="font-size:0.75rem;color:var(--text-secondary);padding:8px">Aucune t\u00e2che</div>';
        html += '</div>';
        return html;
    }

    async function aiPrioritize(tasks, container) {
        if (typeof ApiAi === 'undefined' || !ApiAi.generate) return;
        var btn = container.querySelector('#priority-ai-btn');
        if (btn) { btn.disabled = true; btn.textContent = '\u23F3 Analyse en cours...'; }
        try {
            var taskList = tasks.map(function(t) { return '- ' + (t.title || 'Sans titre') + ' (priorit\u00e9: ' + (t.priority || '?') + ', \u00e9ch\u00e9ance: ' + (t.due_date || t.dueDate || 'aucune') + ')'; }).join('\n');
            var prompt = 'Voici mes t\u00e2ches :\n' + taskList + '\n\nClassifie-les en 4 cat\u00e9gories (matrice Eisenhower) : Urgent+Important, Important, Urgent, Ni l\'un ni l\'autre. R\u00e9ponds en JSON: {"ui":["titre"],"i":["titre"],"u":["titre"],"n":["titre"]}';
            await ApiAi.generate(prompt);
        } catch (e) {}
        if (btn) { btn.disabled = false; btn.textContent = '\uD83E\uDDE0 Prioriser avec l\'IA'; }
    }

    function isOverdueOrSoon(task) {
        var d = task.due_date || task.dueDate || task.deadline;
        if (!d) return false;
        var due = new Date(d);
        var now = new Date();
        var diff = (due - now) / (1000 * 60 * 60 * 24);
        return diff <= 2;
    }

    function getTasks() { return (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : []; }
    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return { render: render };
})();
if (typeof window !== 'undefined') window.SmartPriority = SmartPriority;


/* ================================================
   BOOKMARKS / FAVORITES
   ================================================ */
var Bookmarks = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_bookmarks';
    var panelEl = null;
    var isOpen = false;
    var initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;
        createPanel();
    }

    function createPanel() {
        panelEl = document.createElement('div');
        panelEl.className = 'bookmarks-panel';
        panelEl.innerHTML = '<div class="bookmarks-header"><span class="bookmarks-title">\u2B50 Favoris</span><button class="bookmarks-close" id="bk-close">\u2715</button></div><div class="bookmarks-list" id="bk-list"></div>';
        document.body.appendChild(panelEl);
        panelEl.querySelector('#bk-close').addEventListener('click', close);
    }

    function open() { isOpen = true; panelEl.classList.add('open'); renderList(); }
    function close() { isOpen = false; panelEl.classList.remove('open'); }
    function toggle() { isOpen ? close() : open(); }

    function add(type, id, name, icon) {
        var bks = getAll();
        if (bks.find(function(b) { return b.id === id && b.type === type; })) return;
        bks.push({ type: type, id: id, name: name, icon: icon || '\u2B50', addedAt: Date.now() });
        save(bks);
        if (isOpen) renderList();
    }

    function remove(type, id) {
        var bks = getAll().filter(function(b) { return !(b.id === id && b.type === type); });
        save(bks);
        if (isOpen) renderList();
    }

    function isBookmarked(type, id) {
        return !!getAll().find(function(b) { return b.id === id && b.type === type; });
    }

    function renderList() {
        var list = panelEl.querySelector('#bk-list');
        var bks = getAll();
        if (!bks.length) { list.innerHTML = '<div class="bookmarks-empty"><div style="font-size:2rem;margin-bottom:8px">\u2B50</div>Aucun favori. Ajoutez des t\u00e2ches, notes ou projets ici !</div>'; return; }
        list.innerHTML = '';
        bks.forEach(function(b) {
            var item = document.createElement('div');
            item.className = 'bookmark-item';
            item.innerHTML = '<span class="bookmark-icon">' + (b.icon || '\u2B50') + '</span><div class="bookmark-info"><div class="bookmark-name">' + escapeHtml(b.name) + '</div><div class="bookmark-type">' + escapeHtml(b.type) + '</div></div><button class="bookmark-remove" title="Retirer">\u2715</button>';
            item.querySelector('.bookmark-remove').addEventListener('click', function(e) { e.stopPropagation(); remove(b.type, b.id); });
            item.addEventListener('click', function() {
                if (b.type === 'task') nav('tasks');
                else if (b.type === 'note') nav('notes');
                else if (b.type === 'project') nav('projects');
                close();
            });
            list.appendChild(item);
        });
    }

    function getAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; } }
    function save(bks) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bks)); } catch (e) {} }
    function nav(v) { if (typeof ViewRouter !== 'undefined') ViewRouter.navigate(v); }
    function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return { init: init, open: open, close: close, toggle: toggle, add: add, remove: remove, isBookmarked: isBookmarked, getAll: getAll };
})();
if (typeof window !== 'undefined') window.Bookmarks = Bookmarks;


/* ================================================
   PROGRESS ANALYTICS
   ================================================ */
var ProgressAnalytics = (function() {
    'use strict';

    function render(container) {
        if (!container) return;
        var tasks = getTasks();
        var today = new Date();
        var todayStr = fmtDate(today);

        // Stats
        var total = tasks.length;
        var done = tasks.filter(function(t) { var s = (t.status||'').toLowerCase(); return s === 'done' || s === 'completed'; }).length;
        var inProgress = tasks.filter(function(t) { return (t.status||'').toLowerCase() === 'in_progress'; }).length;
        var overdue = tasks.filter(function(t) {
            var s = (t.status||'').toLowerCase(); if (s === 'done' || s === 'completed') return false;
            var d = t.due_date || t.dueDate || t.deadline; if (!d) return false;
            return new Date(d) < today;
        }).length;

        // Pomodoro sessions today
        var pomSessions = typeof PomodoroTimer !== 'undefined' ? PomodoroTimer.getTodaySessions() : 0;
        // Time tracked today
        var ttEntries = typeof TimeTracker !== 'undefined' ? TimeTracker.getAllEntries() : [];
        var todayTime = 0;
        ttEntries.forEach(function(e) { if (new Date(e.startTime).toISOString().slice(0, 10) === todayStr) todayTime += e.duration || 0; });
        // Habits completed today
        var habitsToday = 0;
        if (typeof HabitTracker !== 'undefined') {
            var habits = HabitTracker.getHabits();
            habits.forEach(function(h) { if (h.completedDates && h.completedDates.indexOf(todayStr) !== -1) habitsToday++; });
        }

        // Completion rate this week
        var weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        var thisWeekDone = tasks.filter(function(t) {
            var s = (t.status||'').toLowerCase(); if (s !== 'done' && s !== 'completed') return false;
            var d = t.updated_at || t.completedAt; if (!d) return true;
            return new Date(d) >= weekAgo;
        }).length;

        var html = '<div class="progress-panel">';
        html += statCard(done + '/' + total, 'T\u00e2ches compl\u00e9t\u00e9es', total > 0 ? Math.round(done/total*100) + '%' : '0%', 'up');
        html += statCard(inProgress, 'En cours', '', '');
        html += statCard(overdue, 'En retard', overdue > 0 ? '\u26A0\uFE0F' : '\u2705', overdue > 0 ? 'down' : 'up');
        html += statCard(pomSessions, 'Pomodoros aujourd\'hui', '', '');
        html += statCard(fmtTime(todayTime), 'Temps track\u00e9', '', '');
        html += statCard(habitsToday, 'Habitudes compl\u00e9t\u00e9es', '', '');
        html += '</div>';

        // Weekly bar chart
        html += '<div class="progress-chart-container"><h3 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:12px">\uD83D\uDCCA T\u00e2ches compl\u00e9t\u00e9es cette semaine</h3>';
        html += '<div class="progress-bar-chart">';
        var dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
        for (var i = 6; i >= 0; i--) {
            var d = new Date(today); d.setDate(d.getDate() - i);
            var ds = fmtDate(d);
            var count = tasks.filter(function(t) {
                var s = (t.status||'').toLowerCase(); if (s !== 'done' && s !== 'completed') return false;
                var up = t.updated_at || t.completedAt; return up && up.slice(0, 10) === ds;
            }).length;
            var height = count > 0 ? Math.max(10, Math.min(100, count * 20)) : 4;
            html += '<div class="progress-bar-day" style="height:' + height + 'px;opacity:' + (count > 0 ? 1 : 0.2) + '" data-label="' + dayNames[(d.getDay()+6)%7] + '" title="' + count + ' t\u00e2ches"></div>';
        }
        html += '</div></div>';

        container.innerHTML = html;
    }

    function statCard(value, label, delta, dir) {
        return '<div class="progress-card"><div class="progress-card-value">' + value + '</div><div class="progress-card-label">' + label + '</div>' + (delta ? '<div class="progress-card-delta ' + dir + '">' + delta + '</div>' : '') + '</div>';
    }

    function getTasks() { return (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : []; }
    function fmtDate(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
    function fmtTime(s) { var h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return h > 0 ? h + 'h' + m + 'm' : m + 'min'; }

    return { render: render };
})();
if (typeof window !== 'undefined') window.ProgressAnalytics = ProgressAnalytics;


/* ================================================
   DATA EXPORT
   ================================================ */
var DataExport = (function() {
    'use strict';

    function showModal() {
        var overlay = document.createElement('div');
        overlay.className = 'export-modal-overlay active';
        overlay.innerHTML = '<div class="export-modal"><h3>\uD83D\uDCE4 Exporter vos donn\u00e9es</h3>' +
            exportOption('\uD83D\uDCCB', 'T\u00e2ches (CSV)', 'Toutes vos t\u00e2ches au format tableur', 'tasks-csv') +
            exportOption('\uD83D\uDCDD', 'Notes (JSON)', 'Toutes vos notes au format JSON', 'notes-json') +
            exportOption('\uD83D\uDCC1', 'Projets (CSV)', 'Tous vos projets au format tableur', 'projects-csv') +
            exportOption('\u23F1', 'Temps (CSV)', 'Historique du time tracking', 'time-csv') +
            exportOption('\uD83D\uDCE6', 'Tout (JSON)', 'Export complet de toutes les donn\u00e9es', 'all-json') +
            '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        overlay.querySelectorAll('.export-option').forEach(function(opt) {
            opt.addEventListener('click', function() {
                var type = opt.getAttribute('data-export');
                doExport(type);
                overlay.remove();
            });
        });
    }

    function exportOption(icon, title, desc, type) {
        return '<div class="export-option" data-export="' + type + '"><span class="export-option-icon">' + icon + '</span><div class="export-option-info"><div class="export-option-title">' + title + '</div><div class="export-option-desc">' + desc + '</div></div></div>';
    }

    function doExport(type) {
        var data, filename, mime;
        if (type === 'tasks-csv') {
            var tasks = getTasks();
            data = 'Titre,Statut,Priorit\u00e9,\u00c9ch\u00e9ance,Projet\n' + tasks.map(function(t) { return csvRow([t.title, t.status, t.priority, t.due_date || t.dueDate || '', t.project_id || '']); }).join('\n');
            filename = 'taches_' + today() + '.csv'; mime = 'text/csv';
        } else if (type === 'notes-json') {
            var notes = getNotes();
            data = JSON.stringify(notes, null, 2);
            filename = 'notes_' + today() + '.json'; mime = 'application/json';
        } else if (type === 'projects-csv') {
            var projects = getProjects();
            data = 'Nom,Statut,Couleur\n' + projects.map(function(p) { return csvRow([p.name || p.title, p.status, p.color || '']); }).join('\n');
            filename = 'projets_' + today() + '.csv'; mime = 'text/csv';
        } else if (type === 'time-csv') {
            var entries = typeof TimeTracker !== 'undefined' ? TimeTracker.getAllEntries() : [];
            data = 'T\u00e2che,D\u00e9but,Fin,Dur\u00e9e(s)\n' + entries.map(function(e) { return csvRow([e.taskTitle, new Date(e.startTime).toISOString(), new Date(e.endTime).toISOString(), e.duration]); }).join('\n');
            filename = 'temps_' + today() + '.csv'; mime = 'text/csv';
        } else {
            data = JSON.stringify({ tasks: getTasks(), projects: getProjects(), notes: getNotes(), habits: typeof HabitTracker !== 'undefined' ? HabitTracker.getHabits() : [], bookmarks: typeof Bookmarks !== 'undefined' ? Bookmarks.getAll() : [], timeEntries: typeof TimeTracker !== 'undefined' ? TimeTracker.getAllEntries() : [], exportedAt: new Date().toISOString() }, null, 2);
            filename = 'productiveapp_export_' + today() + '.json'; mime = 'application/json';
        }
        download(data, filename, mime);
    }

    function csvRow(arr) { return arr.map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','); }
    function today() { return new Date().toISOString().slice(0, 10); }
    function download(data, filename, mime) {
        var blob = new Blob([data], { type: mime + ';charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    function getTasks() { return (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : []; }
    function getProjects() { return (typeof AppState !== 'undefined' && AppState.projects) ? AppState.projects : []; }
    function getNotes() {
        try {
            var mid = typeof AppState !== 'undefined' && AppState.currentUser ? AppState.currentUser.id : '';
            var k = mid ? 'productiveapp_notes_' + mid : null;
            if (k) { var r = localStorage.getItem(k); if (r) return JSON.parse(r); }
        } catch (e) {} return [];
    }

    return { showModal: showModal, doExport: doExport };
})();
if (typeof window !== 'undefined') window.DataExport = DataExport;


/* ================================================
   ONBOARDING WIZARD
   ================================================ */
var OnboardingWizard = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_onboarding_done';
    var currentStep = 0;
    var overlayEl = null;

    var STEPS = [
        { icon: '\uD83D\uDE80', title: 'Bienvenue sur ProductiveApp', desc: 'L\'application tout-en-un pour les ind\u00e9pendants. G\u00e9rez vos projets, t\u00e2ches, notes, finances et bien plus.' },
        { icon: '\u2328\uFE0F', title: 'Raccourcis clavier', desc: 'Appuyez Cmd+K pour la palette de commandes. Shift+? pour voir tous les raccourcis. Naviguez \u00e0 la vitesse de l\'\u00e9clair.' },
        { icon: '\uD83C\uDFA8', title: '60 th\u00e8mes visuels', desc: 'Personnalisez chaque d\u00e9tail avec 60 th\u00e8mes uniques. Trouvez votre style dans Param\u00e8tres > Th\u00e8mes.' },
        { icon: '\uD83C\uDF45', title: 'Restez concentr\u00e9', desc: 'Timer Pomodoro, sons ambiants, mode Zen et suivi du temps par t\u00e2che. Tout pour votre productivit\u00e9.' },
        { icon: '\uD83E\uDDE0', title: 'IA int\u00e9gr\u00e9e', desc: 'L\'assistant IA vous aide \u00e0 prioriser, analyser et g\u00e9n\u00e9rer des rapports intelligents. Tapez Cmd+K > "IA".' },
        { icon: '\uD83C\uDFC6', title: 'Gamification', desc: 'Gagnez des XP, maintenez des s\u00e9ries et d\u00e9bloquez des niveaux. Le travail devient un jeu !' }
    ];

    function init() {
        try { if (localStorage.getItem(STORAGE_KEY) === '1') return; } catch (e) {}
    }

    function shouldShow() {
        try { return localStorage.getItem(STORAGE_KEY) !== '1'; } catch (e) { return false; }
    }

    function show() {
        currentStep = 0;
        overlayEl = document.createElement('div');
        overlayEl.className = 'onboarding-overlay active';
        document.body.appendChild(overlayEl);
        renderStep();
    }

    function renderStep() {
        if (!overlayEl) return;
        var step = STEPS[currentStep];
        overlayEl.innerHTML = '<div class="onboarding-card">' +
            '<div class="onboarding-illustration">' + step.icon + '</div>' +
            '<div class="onboarding-title">' + step.title + '</div>' +
            '<div class="onboarding-desc">' + step.desc + '</div>' +
            '<div class="onboarding-dots">' + STEPS.map(function(_, i) { return '<div class="onboarding-dot' + (i === currentStep ? ' active' : '') + '"></div>'; }).join('') + '</div>' +
            '<button class="onboarding-next" id="ob-next">' + (currentStep === STEPS.length - 1 ? 'C\'est parti !' : 'Suivant') + '</button>' +
            '<button class="onboarding-skip" id="ob-skip">Passer l\'introduction</button>' +
        '</div>';
        overlayEl.querySelector('#ob-next').addEventListener('click', function() {
            if (currentStep < STEPS.length - 1) { currentStep++; renderStep(); }
            else finish();
        });
        overlayEl.querySelector('#ob-skip').addEventListener('click', finish);
    }

    function finish() {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
        if (overlayEl) { overlayEl.classList.remove('active'); setTimeout(function() { overlayEl.remove(); overlayEl = null; }, 500); }
    }

    return { init: init, show: show, shouldShow: shouldShow, finish: finish };
})();
if (typeof window !== 'undefined') window.OnboardingWizard = OnboardingWizard;
