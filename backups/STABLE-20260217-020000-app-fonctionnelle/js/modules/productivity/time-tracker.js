/**
 * ================================================
 * TIME TRACKER - ProductiveApp v5.0
 * Suivi du temps avec timer, historique, rapports
 * Table: time_entries (migration 020)
 * ================================================
 */
const TimeTracker = (function() {
    'use strict';

    let state = {
        entries: [],
        runningEntry: null,
        weekSummary: [],
        todayTotal: 0,
        weekTotal: 0,
        monthTotal: 0,
        timerDisplay: '00:00:00',
        description: '',
        projectId: null,
        taskId: null
    };
    let timerInterval = null;
    let initialized = false;

    function getWid() {
        return (typeof AppState !== 'undefined' && (AppState.currentUser?.workspaceId || AppState.workspace?.id)) || '';
    }

    function getMid() {
        return (typeof AppState !== 'undefined' && AppState.currentUser?.id) || '';
    }

    function getBaseUrl() {
        return `/api/v1/time/workspace/${getWid()}/entries`;
    }

    // ============================================
    // API (with localStorage fallback)
    // ============================================
    async function apiGet(path) {
        try {
            if (typeof Api !== 'undefined' && getWid()) return await Api.get(getBaseUrl() + (path || ''));
        } catch (e) { console.warn('[TimeTracker] API error:', e); }
        return null;
    }

    async function apiPost(path, body) {
        try {
            if (typeof Api !== 'undefined' && getWid()) return await Api.post(getBaseUrl() + (path || ''), body);
        } catch (e) { console.warn('[TimeTracker] API error:', e); }
        return null;
    }

    async function apiPut(path, body) {
        try {
            if (typeof Api !== 'undefined' && getWid()) return await Api.put(getBaseUrl() + path, body);
        } catch (e) { console.warn('[TimeTracker] API error:', e); }
        return null;
    }

    async function apiDelete(path) {
        try {
            if (typeof Api !== 'undefined' && getWid()) return await Api.delete(getBaseUrl() + path);
        } catch (e) { console.warn('[TimeTracker] API error:', e); }
        return null;
    }

    // ============================================
    // TIMER
    // ============================================
    async function startTimer(desc, projectId, taskId) {
        const now = new Date().toISOString();
        const body = {
            description: desc || state.description || 'Sans description',
            project_id: projectId || state.projectId || null,
            task_id: taskId || state.taskId || null,
            member_id: getMid(),
            start_time: now,
            is_running: true,
            is_billable: true
        };
        const result = await apiPost('', body);
        state.runningEntry = result || { ...body, id: 'local_' + Date.now(), start_time: now };
        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        render();
    }

    async function stopTimer() {
        if (!state.runningEntry) return;
        clearInterval(timerInterval);
        timerInterval = null;
        const start = new Date(state.runningEntry.start_time);
        const now = new Date();
        const durationMin = Math.round((now - start) / 60000);
        if (state.runningEntry.id && !state.runningEntry.id.startsWith('local_')) {
            await apiPost('/' + state.runningEntry.id + '/stop', {});
        }
        // Save to local
        saveLocalEntry({ ...state.runningEntry, end_time: now.toISOString(), duration_minutes: durationMin, is_running: false });
        state.runningEntry = null;
        state.timerDisplay = '00:00:00';
        await loadEntries();
        render();
    }

    function updateTimerDisplay() {
        if (!state.runningEntry) return;
        const start = new Date(state.runningEntry.start_time);
        const diff = Math.floor((Date.now() - start.getTime()) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        state.timerDisplay = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        const el = document.querySelector('.tt-timer-display');
        if (el) el.textContent = state.timerDisplay;
    }

    function saveLocalEntry(entry) {
        const key = `productiveapp_time_entries_${getMid()}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = data.findIndex(e => e.id === entry.id);
        if (idx >= 0) data[idx] = entry; else data.push(entry);
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ============================================
    // DATA LOADING
    // ============================================
    async function loadEntries() {
        const today = new Date().toISOString().split('T')[0];
        const result = await apiGet('?date_from=' + today + '&member_id=' + getMid());
        if (result?.data) {
            state.entries = result.data;
        } else {
            const key = `productiveapp_time_entries_${getMid()}`;
            state.entries = JSON.parse(localStorage.getItem(key) || '[]').filter(e => e.start_time?.startsWith(today));
        }
        // Check for running
        const running = await apiGet('/running?member_id=' + getMid());
        if (running && running.id) {
            state.runningEntry = running;
            if (!timerInterval) {
                updateTimerDisplay();
                timerInterval = setInterval(updateTimerDisplay, 1000);
            }
        }
        // Calculate totals
        state.todayTotal = state.entries.filter(e => !e.is_running).reduce((s, e) => s + (e.duration_minutes || 0), 0);
    }

    // ============================================
    // FORMATTING
    // ============================================
    function fmtDuration(min) {
        if (!min || min <= 0) return '0min';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    }

    function fmtTime(iso) {
        if (!iso) return '-';
        return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // ============================================
    // ACTIONS
    // ============================================
    async function deleteEntry(id) {
        if (!confirm('Supprimer cette entr\u00e9e ?')) return;
        await apiDelete('/' + id);
        const key = `productiveapp_time_entries_${getMid()}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]').filter(e => e.id !== id);
        localStorage.setItem(key, JSON.stringify(data));
        await loadEntries();
        render();
    }

    function handleAction(action, data) {
        switch (action) {
            case 'start': startTimer(data?.description, data?.projectId, data?.taskId); break;
            case 'stop': stopTimer(); break;
            case 'delete': deleteEntry(data?.id); break;
            case 'export': exportCSV(); break;
        }
    }

    function exportCSV() {
        const headers = ['Description', 'D\u00e9but', 'Fin', 'Dur\u00e9e (min)', 'Facturable'];
        const rows = state.entries.map(e => [
            e.description || '', fmtTime(e.start_time), fmtTime(e.end_time),
            e.duration_minutes || 0, e.is_billable ? 'Oui' : 'Non'
        ]);
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `temps_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    // ============================================
    // RENDER
    // ============================================
    function render() {
        const container = document.getElementById('view-time-tracker');
        if (!container) return;

        const projects = (typeof AppState !== 'undefined' && AppState.projects) || [];
        const completedEntries = state.entries.filter(e => !e.is_running);

        container.innerHTML = `
            <div class="tt-container">
                <div class="tt-header">
                    <h2>Suivi du temps</h2>
                    <button class="tt-btn tt-btn-export" onclick="TimeTracker.handleAction('export')">Exporter CSV</button>
                </div>

                ${state.runningEntry ? `
                    <div class="tt-running">
                        <div class="tt-running-info">
                            <span class="tt-running-dot"></span>
                            <span class="tt-running-desc">${state.runningEntry.description || 'En cours...'}</span>
                        </div>
                        <div class="tt-timer-display">${state.timerDisplay}</div>
                        <button class="tt-btn tt-btn-stop" onclick="TimeTracker.handleAction('stop')">Arr\u00eater</button>
                    </div>
                ` : `
                    <div class="tt-start">
                        <input type="text" class="tt-input" id="tt-desc" placeholder="Sur quoi travaillez-vous ?" value="${state.description}">
                        <select class="tt-select" id="tt-project">
                            <option value="">Aucun projet</option>
                            ${projects.map(p => `<option value="${p.id}">${p.name || p.title}</option>`).join('')}
                        </select>
                        <button class="tt-btn tt-btn-start" onclick="TimeTracker.handleAction('start', {description: document.getElementById('tt-desc').value, projectId: document.getElementById('tt-project').value})">D\u00e9marrer</button>
                    </div>
                `}

                <div class="tt-stats">
                    <div class="tt-stat-card">
                        <div class="tt-stat-value">${fmtDuration(state.todayTotal)}</div>
                        <div class="tt-stat-label">Aujourd'hui</div>
                    </div>
                    <div class="tt-stat-card">
                        <div class="tt-stat-value">${completedEntries.length}</div>
                        <div class="tt-stat-label">Entr\u00e9es</div>
                    </div>
                </div>

                <div class="tt-entries">
                    <h3>Entr\u00e9es du jour</h3>
                    ${completedEntries.length === 0 ? '<p class="tt-empty">Aucune entr\u00e9e pour aujourd\'hui</p>' : ''}
                    <div class="tt-entries-list">
                        ${completedEntries.map(e => `
                            <div class="tt-entry">
                                <div class="tt-entry-desc">${e.description || 'Sans description'}</div>
                                <div class="tt-entry-time">${fmtTime(e.start_time)} \u2192 ${fmtTime(e.end_time)}</div>
                                <div class="tt-entry-duration">${fmtDuration(e.duration_minutes)}</div>
                                <div class="tt-entry-billable ${e.is_billable ? 'yes' : ''}">${e.is_billable ? '\u20ac' : '-'}</div>
                                <button class="tt-entry-delete" onclick="TimeTracker.handleAction('delete', {id:'${e.id}'})">\u00d7</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // CSS
    // ============================================
    function injectStyles() {
        if (document.getElementById('time-tracker-styles')) return;
        const s = document.createElement('style');
        s.id = 'time-tracker-styles';
        s.textContent = `
            .tt-container{max-width:900px;margin:0 auto;padding:20px;font-family:Inter,system-ui,sans-serif}
            .tt-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
            .tt-header h2{color:var(--text-primary,#fff);font-size:22px;margin:0}
            .tt-btn{padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s}
            .tt-btn-start{background:var(--accent,#d4af37);color:#000}
            .tt-btn-start:hover{filter:brightness(1.1)}
            .tt-btn-stop{background:#ef4444;color:#fff}
            .tt-btn-stop:hover{background:#dc2626}
            .tt-btn-export{background:var(--bg-secondary,#1a1a2e);color:var(--text-secondary,#888);border:1px solid var(--border-color,#333)}
            .tt-btn-export:hover{color:var(--text-primary,#fff)}
            .tt-running{display:flex;align-items:center;gap:16px;padding:16px 20px;background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.05));border:1px solid rgba(239,68,68,0.3);border-radius:12px;margin-bottom:20px}
            .tt-running-info{display:flex;align-items:center;gap:8px;flex:1}
            .tt-running-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;animation:ttPulse 1.5s infinite}
            .tt-running-desc{color:var(--text-primary,#fff);font-weight:500}
            .tt-timer-display{font-size:28px;font-weight:700;color:#ef4444;font-variant-numeric:tabular-nums}
            @keyframes ttPulse{0%,100%{opacity:1}50%{opacity:0.4}}
            .tt-start{display:flex;gap:10px;padding:16px 20px;background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:12px;margin-bottom:20px}
            .tt-input{flex:1;padding:10px 14px;background:var(--bg-primary,#111);border:1px solid var(--border-color,#333);border-radius:8px;color:var(--text-primary,#fff);font-size:14px}
            .tt-input::placeholder{color:var(--text-secondary,#666)}
            .tt-select{padding:10px;background:var(--bg-primary,#111);border:1px solid var(--border-color,#333);border-radius:8px;color:var(--text-primary,#fff);font-size:13px;min-width:120px}
            .tt-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
            .tt-stat-card{padding:16px;background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:10px;text-align:center}
            .tt-stat-value{font-size:20px;font-weight:700;color:var(--text-primary,#fff)}
            .tt-stat-label{font-size:11px;color:var(--text-secondary,#888);margin-top:4px}
            .tt-entries h3{color:var(--text-primary,#fff);font-size:16px;margin-bottom:12px}
            .tt-empty{color:var(--text-secondary,#666);font-size:13px;text-align:center;padding:30px}
            .tt-entry{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--border-color,#222);transition:background 0.2s}
            .tt-entry:hover{background:var(--bg-secondary,#1a1a2e)}
            .tt-entry-desc{flex:1;color:var(--text-primary,#fff);font-size:13px}
            .tt-entry-time{color:var(--text-secondary,#888);font-size:12px;white-space:nowrap}
            .tt-entry-duration{color:var(--accent,#d4af37);font-weight:600;font-size:13px;min-width:60px;text-align:right}
            .tt-entry-billable{width:20px;text-align:center;color:var(--text-secondary,#555);font-size:13px}
            .tt-entry-billable.yes{color:#4ade80}
            .tt-entry-delete{background:none;border:none;color:var(--text-secondary,#555);font-size:16px;cursor:pointer;padding:2px 6px}
            .tt-entry-delete:hover{color:#ef4444}
            @media(max-width:768px){.tt-start{flex-direction:column}.tt-running{flex-direction:column;text-align:center}.tt-entry{flex-wrap:wrap}}
        `;
        document.head.appendChild(s);
    }

    // ============================================
    // INIT
    // ============================================
    async function init() {
        if (initialized) return;
        injectStyles();
        initialized = true;
        console.log('[TimeTracker] Initialized');
    }

    // Called when view becomes active
    async function onViewActive() {
        await loadEntries();
        render();
    }

    return {
        init,
        render: onViewActive,
        startTimer,
        stopTimer,
        getRunningEntry: () => state.runningEntry,
        handleAction,
        refresh: onViewActive
    };
})();

window.TimeTracker = TimeTracker;
