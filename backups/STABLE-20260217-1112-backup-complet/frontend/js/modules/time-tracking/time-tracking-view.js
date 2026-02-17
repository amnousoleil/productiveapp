/**
 * TimeTrackingView - Interface complete du suivi du temps
 * Chronometre temps reel, timesheet, rapports, tarification
 */
const TimeTrackingView = (function() {
    'use strict';

    var container = null;
    var activeTab = 'timer';
    var runningTimer = null;
    var timerInterval = null;
    var entries = [];
    var report = null;

    var EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    var DATEFMT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    var TIMEFMT = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

    function _toast(m, t) {
        if (typeof window.showToast === 'function') window.showToast(m, t);
    }

    function _e(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    function formatDuration(minutes) {
        if (!minutes && minutes !== 0) return '-';
        var h = Math.floor(minutes / 60);
        var m = Math.round(minutes % 60);
        return h + 'h' + (m < 10 ? '0' : '') + m;
    }

    function formatElapsed(startTime) {
        var diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    // =====================================================
    // RENDER PRINCIPAL
    // =====================================================

    function render(ctn) {
        container = ctn;
        container.innerHTML = '';

        // Header
        var hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;';
        hdr.innerHTML = '<div><h1 style="margin:0;font-size:1.5rem;color:var(--text-primary)">Suivi du temps</h1>' +
            '<p style="margin:4px 0 0;color:var(--text-secondary);font-size:.85rem">Chronometrez, facturez, optimisez</p></div>' +
            '<div id="tt-running-badge" style="display:none;padding:8px 16px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;cursor:pointer">' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-right:8px;animation:pulse 1.5s infinite"></span>' +
            '<span id="tt-running-time" style="font-family:monospace;font-weight:700;color:#ef4444;font-size:1.1rem">00:00:00</span>' +
            '<span style="margin-left:8px;color:var(--text-secondary);font-size:.85rem" id="tt-running-desc"></span></div>';
        container.appendChild(hdr);

        // Tabs
        var tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex;gap:4px;margin-bottom:20px;border-bottom:2px solid var(--border-color);padding-bottom:0;';
        var tabDefs = [
            { id: 'timer', label: 'Chronometre', icon: '&#9201;' },
            { id: 'timesheet', label: 'Feuille de temps', icon: '&#128203;' },
            { id: 'report', label: 'Rapports', icon: '&#128200;' },
            { id: 'rate', label: 'Tarification', icon: '&#128176;' }
        ];
        tabDefs.forEach(function(t) {
            var btn = document.createElement('button');
            btn.id = 'tt-tab-' + t.id;
            btn.innerHTML = t.icon + ' ' + t.label;
            btn.style.cssText = 'padding:10px 18px;border:none;background:transparent;color:' +
                (activeTab === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)') +
                ';font-weight:' + (activeTab === t.id ? '700' : '400') +
                ';cursor:pointer;font-size:.9rem;border-bottom:2px solid ' +
                (activeTab === t.id ? 'var(--accent-primary)' : 'transparent') +
                ';margin-bottom:-2px;transition:all .2s;';
            btn.onclick = function() { activeTab = t.id; render(container); };
            tabs.appendChild(btn);
        });
        container.appendChild(tabs);

        // Content
        var content = document.createElement('div');
        content.id = 'tt-content';
        container.appendChild(content);

        // Load data & render tab
        _checkRunningTimer();

        switch (activeTab) {
            case 'timer': _renderTimer(content); break;
            case 'timesheet': _renderTimesheet(content); break;
            case 'report': _renderReport(content); break;
            case 'rate': _renderRate(content); break;
        }
    }

    // =====================================================
    // RUNNING TIMER BADGE
    // =====================================================

    async function _checkRunningTimer() {
        try {
            var r = await TimeTrackingApi.getRunningTimer();
            runningTimer = (r && r.data) ? r.data : r;
            if (runningTimer && runningTimer.id) {
                _showRunningBadge();
            } else {
                runningTimer = null;
                _hideRunningBadge();
            }
        } catch (e) {
            runningTimer = null;
            _hideRunningBadge();
        }
    }

    function _showRunningBadge() {
        var badge = document.getElementById('tt-running-badge');
        if (!badge) return;
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        var descEl = document.getElementById('tt-running-desc');
        if (descEl) descEl.textContent = runningTimer.description || runningTimer.task_title || '';
        badge.onclick = function() { _stopCurrentTimer(); };

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            var el = document.getElementById('tt-running-time');
            if (el && runningTimer) el.textContent = formatElapsed(runningTimer.start_time);
        }, 1000);
    }

    function _hideRunningBadge() {
        var badge = document.getElementById('tt-running-badge');
        if (badge) badge.style.display = 'none';
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    async function _stopCurrentTimer() {
        try {
            await TimeTrackingApi.stopTimer();
            _toast('Chronometre arrete', 'success');
            runningTimer = null;
            _hideRunningBadge();
            if (activeTab === 'timer' || activeTab === 'timesheet') render(container);
        } catch (e) {
            _toast('Erreur arret chrono', 'error');
        }
    }

    // =====================================================
    // TAB: CHRONOMETRE
    // =====================================================

    function _renderTimer(content) {
        var h = '';

        // Big timer display
        h += '<div style="text-align:center;padding:40px 0">';
        if (runningTimer) {
            h += '<div id="tt-big-timer" style="font-size:4rem;font-weight:700;font-family:monospace;color:var(--text-primary);margin-bottom:16px">' +
                formatElapsed(runningTimer.start_time) + '</div>';
            h += '<p style="color:var(--text-secondary);margin:0 0 8px">' + _e(runningTimer.description || 'Pas de description') + '</p>';
            if (runningTimer.task_title) h += '<p style="color:var(--accent-primary);font-size:.85rem;margin:0 0 8px">Tache: ' + _e(runningTimer.task_title) + '</p>';
            if (runningTimer.project_title) h += '<p style="color:var(--success-color);font-size:.85rem;margin:0 0 20px">Projet: ' + _e(runningTimer.project_title) + '</p>';
            h += '<button id="tt-stop-btn" style="padding:16px 40px;border:none;border-radius:12px;background:#ef4444;color:#fff;font-size:1.1rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,.3)">Arreter</button>';
        } else {
            h += '<div style="font-size:4rem;font-weight:700;font-family:monospace;color:var(--text-secondary);margin-bottom:24px">00:00:00</div>';

            h += '<div style="max-width:500px;margin:0 auto;display:grid;gap:12px">';
            h += '<input id="tt-desc" type="text" placeholder="Sur quoi travaillez-vous ?" style="padding:12px 16px;border:1px solid var(--border-color);border-radius:10px;background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;width:100%;box-sizing:border-box">';
            h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
            h += '<select id="tt-project" style="padding:10px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);font-size:.9rem"><option value="">-- Projet --</option></select>';
            h += '<select id="tt-task" style="padding:10px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);font-size:.9rem"><option value="">-- Tache --</option></select>';
            h += '</div>';
            h += '<div style="display:flex;gap:12px;align-items:center;justify-content:center">';
            h += '<label style="display:flex;align-items:center;gap:6px;color:var(--text-secondary);font-size:.9rem"><input type="checkbox" id="tt-billable" checked> Facturable</label>';
            h += '</div>';
            h += '<button id="tt-start-btn" style="padding:16px 40px;border:none;border-radius:12px;background:var(--accent-primary);color:#fff;font-size:1.1rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3)">Demarrer le chrono</button>';
            h += '</div>';
        }
        h += '</div>';

        // Today's entries
        h += '<div style="margin-top:24px">';
        h += '<h3 style="color:var(--text-primary);margin:0 0 12px">Aujourd\'hui</h3>';
        h += '<div id="tt-today-entries"></div>';
        h += '</div>';

        content.innerHTML = h;

        // Update big timer
        if (runningTimer) {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(function() {
                var el = document.getElementById('tt-big-timer');
                var el2 = document.getElementById('tt-running-time');
                if (el && runningTimer) el.textContent = formatElapsed(runningTimer.start_time);
                if (el2 && runningTimer) el2.textContent = formatElapsed(runningTimer.start_time);
            }, 1000);

            var stopBtn = document.getElementById('tt-stop-btn');
            if (stopBtn) stopBtn.onclick = _stopCurrentTimer;
        } else {
            var startBtn = document.getElementById('tt-start-btn');
            if (startBtn) startBtn.onclick = _startNewTimer;
        }

        _loadProjects();
        _loadTodayEntries();
    }

    async function _startNewTimer() {
        var desc = (document.getElementById('tt-desc') || {}).value || '';
        var projectId = (document.getElementById('tt-project') || {}).value || undefined;
        var taskId = (document.getElementById('tt-task') || {}).value || undefined;
        var billable = (document.getElementById('tt-billable') || {}).checked !== false;

        try {
            await TimeTrackingApi.startTimer({
                description: desc || undefined,
                project_id: projectId,
                task_id: taskId,
                is_billable: billable
            });
            _toast('Chronometre demarre !', 'success');
            render(container);
        } catch (e) {
            _toast('Erreur demarrage : ' + (e.message || ''), 'error');
        }
    }

    async function _loadProjects() {
        try {
            var sel = document.getElementById('tt-project');
            if (!sel) return;
            if (typeof Api !== 'undefined') {
                var r = await Api.get('/projects/workspace/' + (typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id')));
                var projects = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
                projects.forEach(function(p) {
                    var opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.name || p.title;
                    sel.appendChild(opt);
                });
            }
        } catch (e) { /* ignore */ }
    }

    async function _loadTodayEntries() {
        try {
            var today = new Date().toISOString().split('T')[0];
            var r = await TimeTrackingApi.listEntries({ dateFrom: today, dateTo: today, limit: 50 });
            var items = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
            var el = document.getElementById('tt-today-entries');
            if (!el) return;

            if (!items.length) {
                el.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px">Aucune entree aujourd\'hui</p>';
                return;
            }

            var totalMin = 0;
            var totalAmount = 0;
            var html = '<div style="display:flex;flex-direction:column;gap:8px">';
            items.forEach(function(e) {
                var dur = e.duration_minutes || 0;
                totalMin += dur;
                var amt = e.hourly_rate ? (dur / 60) * parseFloat(e.hourly_rate) : 0;
                totalAmount += amt;
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg-secondary);border-radius:10px;border:1px solid var(--border-color)">';
                html += '<div style="flex:1"><span style="font-weight:600;color:var(--text-primary)">' + _e(e.description || e.task_title || 'Sans description') + '</span>';
                if (e.project_title) html += '<br><span style="font-size:.8rem;color:var(--accent-primary)">' + _e(e.project_title) + '</span>';
                html += '</div>';
                html += '<div style="text-align:right">';
                html += '<span style="font-family:monospace;font-weight:600;color:var(--text-primary)">' + formatDuration(dur) + '</span>';
                if (e.is_billable) html += '<br><span style="font-size:.8rem;color:var(--success-color)">' + EUR.format(amt) + '</span>';
                html += '</div>';
                html += '<button data-del="' + e.id + '" style="margin-left:12px;padding:4px 8px;border:1px solid var(--danger-color);border-radius:4px;background:transparent;color:var(--danger-color);cursor:pointer;font-size:.75rem">&#10005;</button>';
                html += '</div>';
            });
            html += '</div>';

            html += '<div style="display:flex;justify-content:flex-end;gap:24px;margin-top:12px;padding:12px 0;border-top:2px solid var(--border-color)">';
            html += '<span style="color:var(--text-secondary)">Total: <strong style="color:var(--text-primary)">' + formatDuration(totalMin) + '</strong></span>';
            html += '<span style="color:var(--text-secondary)">Montant: <strong style="color:var(--success-color)">' + EUR.format(totalAmount) + '</strong></span>';
            html += '</div>';

            el.innerHTML = html;

            el.querySelectorAll('[data-del]').forEach(function(btn) {
                btn.onclick = async function() {
                    if (!confirm('Supprimer cette entree ?')) return;
                    try {
                        await TimeTrackingApi.deleteEntry(btn.getAttribute('data-del'));
                        _toast('Entree supprimee', 'success');
                        _loadTodayEntries();
                    } catch (err) { _toast('Erreur suppression', 'error'); }
                };
            });
        } catch (e) { /* ignore */ }
    }

    // =====================================================
    // TAB: TIMESHEET
    // =====================================================

    function _renderTimesheet(content) {
        var today = new Date();
        var weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

        var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">';
        h += '<h3 style="margin:0;color:var(--text-primary)">Feuille de temps</h3>';
        h += '<div style="display:flex;gap:8px">';
        h += '<input id="ts-from" type="date" value="' + weekStart.toISOString().split('T')[0] + '" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary)">';
        h += '<input id="ts-to" type="date" value="' + today.toISOString().split('T')[0] + '" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary)">';
        h += '<button id="ts-load" style="padding:6px 16px;border:1px solid var(--accent-primary);border-radius:6px;background:var(--accent-primary);color:#fff;cursor:pointer">Charger</button>';
        h += '<button id="ts-add" style="padding:6px 16px;border:1px solid var(--success-color);border-radius:6px;background:transparent;color:var(--success-color);cursor:pointer">+ Entree manuelle</button>';
        h += '</div></div>';

        h += '<div id="ts-entries" style="border:1px solid var(--border-color);border-radius:12px;overflow-x:auto"><p style="text-align:center;padding:40px;color:var(--text-secondary)">Chargement...</p></div>';

        content.innerHTML = h;

        document.getElementById('ts-load').onclick = function() { _loadTimesheetEntries(); };
        document.getElementById('ts-add').onclick = function() { _manualEntryModal(); };

        _loadTimesheetEntries();
    }

    async function _loadTimesheetEntries() {
        var from = (document.getElementById('ts-from') || {}).value;
        var to = (document.getElementById('ts-to') || {}).value;
        try {
            var r = await TimeTrackingApi.listEntries({ dateFrom: from, dateTo: to, limit: 200 });
            entries = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
            _renderTimesheetTable();
        } catch (e) {
            _toast('Erreur chargement', 'error');
        }
    }

    function _renderTimesheetTable() {
        var el = document.getElementById('ts-entries');
        if (!el) return;

        if (!entries.length) {
            el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-secondary)">Aucune entree pour cette periode</p>';
            return;
        }

        var totalMin = 0, totalBillable = 0, totalAmount = 0;
        var h = '<table style="width:100%;border-collapse:collapse;font-size:.85rem">';
        h += '<thead><tr style="border-bottom:2px solid var(--border-color)">';
        h += '<th style="padding:10px;text-align:left;font-weight:600;color:var(--text-secondary)">Date</th>';
        h += '<th style="padding:10px;text-align:left;font-weight:600;color:var(--text-secondary)">Description</th>';
        h += '<th style="padding:10px;text-align:left;font-weight:600;color:var(--text-secondary)">Projet</th>';
        h += '<th style="padding:10px;text-align:right;font-weight:600;color:var(--text-secondary)">Duree</th>';
        h += '<th style="padding:10px;text-align:center;font-weight:600;color:var(--text-secondary)">Fact.</th>';
        h += '<th style="padding:10px;text-align:right;font-weight:600;color:var(--text-secondary)">Montant</th>';
        h += '<th style="padding:10px;text-align:center;font-weight:600;color:var(--text-secondary)">Actions</th>';
        h += '</tr></thead><tbody>';

        entries.forEach(function(e) {
            var dur = e.duration_minutes || 0;
            totalMin += dur;
            if (e.is_billable) totalBillable += dur;
            var amt = e.hourly_rate ? (dur / 60) * parseFloat(e.hourly_rate) : 0;
            totalAmount += amt;

            h += '<tr style="border-bottom:1px solid var(--border-color)">';
            h += '<td style="padding:10px;color:var(--text-primary)">' + (e.start_time ? DATEFMT.format(new Date(e.start_time)) : '-') + '</td>';
            h += '<td style="padding:10px;color:var(--text-primary);font-weight:500">' + _e(e.description || e.task_title || '-') + '</td>';
            h += '<td style="padding:10px;color:var(--accent-primary)">' + _e(e.project_title || '-') + '</td>';
            h += '<td style="padding:10px;text-align:right;font-family:monospace;font-weight:600">' + formatDuration(dur) + '</td>';
            h += '<td style="padding:10px;text-align:center">' + (e.is_billable ? '<span style="color:var(--success-color)">&#10003;</span>' : '<span style="color:var(--text-secondary)">-</span>') + '</td>';
            h += '<td style="padding:10px;text-align:right;font-family:monospace;color:var(--success-color)">' + (amt > 0 ? EUR.format(amt) : '-') + '</td>';
            h += '<td style="padding:10px;text-align:center"><button data-del="' + e.id + '" style="padding:2px 8px;border:1px solid var(--danger-color);border-radius:4px;background:transparent;color:var(--danger-color);cursor:pointer;font-size:.75rem">Suppr.</button></td>';
            h += '</tr>';
        });

        h += '</tbody><tfoot><tr style="border-top:2px solid var(--border-color);font-weight:700">';
        h += '<td colspan="3" style="padding:10px;color:var(--text-primary)">' + entries.length + ' entrees</td>';
        h += '<td style="padding:10px;text-align:right;font-family:monospace">' + formatDuration(totalMin) + '</td>';
        h += '<td style="padding:10px;text-align:center;color:var(--text-secondary);font-weight:400;font-size:.8rem">' + formatDuration(totalBillable) + ' fact.</td>';
        h += '<td style="padding:10px;text-align:right;font-family:monospace;color:var(--success-color)">' + EUR.format(totalAmount) + '</td>';
        h += '<td></td></tr></tfoot></table>';

        el.innerHTML = h;

        el.querySelectorAll('[data-del]').forEach(function(btn) {
            btn.onclick = async function() {
                if (!confirm('Supprimer ?')) return;
                try {
                    await TimeTrackingApi.deleteEntry(btn.getAttribute('data-del'));
                    _toast('Supprime', 'success');
                    _loadTimesheetEntries();
                } catch (err) { _toast('Erreur', 'error'); }
            };
        });
    }

    function _manualEntryModal() {
        var ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
        ov.onclick = function(ev) { if (ev.target === ov) document.body.removeChild(ov); };

        var IS = 'padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);font-size:.9rem;width:100%;box-sizing:border-box;';

        var html = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">';
        html += '<h2 style="margin:0 0 20px;color:var(--text-primary)">Entree manuelle</h2>';
        html += '<div style="display:grid;gap:12px">';
        html += '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">Description</label><input id="me-desc" style="' + IS + '" placeholder="Description du travail"></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        html += '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">Date</label><input id="me-date" type="date" style="' + IS + '" value="' + new Date().toISOString().split('T')[0] + '"></div>';
        html += '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">Duree (heures)</label><input id="me-hours" type="number" step="0.25" style="' + IS + '" placeholder="Ex: 2.5"></div>';
        html += '</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        html += '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">Debut</label><input id="me-start" type="time" style="' + IS + '" value="09:00"></div>';
        html += '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">Fin</label><input id="me-end" type="time" style="' + IS + '" value="11:00"></div>';
        html += '</div>';
        html += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="me-billable" checked> Facturable</label>';
        html += '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px">';
        html += '<button id="me-cancel" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-primary);cursor:pointer">Annuler</button>';
        html += '<button id="me-save" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600">Sauvegarder</button>';
        html += '</div></div></div>';

        ov.innerHTML = html;
        document.body.appendChild(ov);

        ov.querySelector('#me-cancel').onclick = function() { document.body.removeChild(ov); };
        ov.querySelector('#me-save').onclick = async function() {
            var desc = ov.querySelector('#me-desc').value;
            var date = ov.querySelector('#me-date').value;
            var hours = parseFloat(ov.querySelector('#me-hours').value) || 0;
            var startTime = ov.querySelector('#me-start').value;
            var endTime = ov.querySelector('#me-end').value;
            var billable = ov.querySelector('#me-billable').checked;

            if (!hours && startTime && endTime) {
                var s = startTime.split(':'), e = endTime.split(':');
                hours = (parseInt(e[0]) * 60 + parseInt(e[1]) - parseInt(s[0]) * 60 - parseInt(s[1])) / 60;
            }
            if (hours <= 0) { _toast('Duree invalide', 'warning'); return; }

            try {
                await TimeTrackingApi.createEntry({
                    description: desc,
                    start_time: date + 'T' + (startTime || '09:00') + ':00',
                    end_time: date + 'T' + (endTime || '11:00') + ':00',
                    duration_minutes: Math.round(hours * 60),
                    is_billable: billable
                });
                _toast('Entree creee', 'success');
                document.body.removeChild(ov);
                _loadTimesheetEntries();
            } catch (err) {
                _toast('Erreur : ' + (err.message || ''), 'error');
            }
        };
    }

    // =====================================================
    // TAB: RAPPORTS
    // =====================================================

    function _renderReport(content) {
        var now = new Date();
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">';
        h += '<h3 style="margin:0;color:var(--text-primary)">Rapport de temps</h3>';
        h += '<div style="display:flex;gap:8px;align-items:center">';
        h += '<input id="rp-from" type="date" value="' + firstDay.toISOString().split('T')[0] + '" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary)">';
        h += '<input id="rp-to" type="date" value="' + now.toISOString().split('T')[0] + '" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary)">';
        h += '<select id="rp-group" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary)">';
        h += '<option value="project">Par projet</option><option value="member">Par membre</option><option value="day">Par jour</option></select>';
        h += '<button id="rp-load" style="padding:6px 16px;border:1px solid var(--accent-primary);border-radius:6px;background:var(--accent-primary);color:#fff;cursor:pointer">Generer</button>';
        h += '</div></div>';

        h += '<div id="rp-cards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">';
        h += _reportCard('Total heures', '-', 'var(--accent-primary)');
        h += _reportCard('Heures facturables', '-', 'var(--success-color)');
        h += _reportCard('Montant total', '-', '#f59e0b');
        h += _reportCard('Taux utilisation', '-', '#8b5cf6');
        h += '</div>';

        h += '<div id="rp-detail" style="border:1px solid var(--border-color);border-radius:12px;overflow:hidden"><p style="text-align:center;padding:40px;color:var(--text-secondary)">Cliquez sur Generer pour voir le rapport</p></div>';

        content.innerHTML = h;
        document.getElementById('rp-load').onclick = _loadReport;
    }

    function _reportCard(label, value, color) {
        return '<div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border-color)">' +
            '<div style="font-size:.8rem;color:var(--text-secondary);margin-bottom:8px">' + label + '</div>' +
            '<div style="font-size:1.5rem;font-weight:700;color:' + color + ';font-family:monospace">' + value + '</div></div>';
    }

    async function _loadReport() {
        var from = (document.getElementById('rp-from') || {}).value;
        var to = (document.getElementById('rp-to') || {}).value;
        var groupBy = (document.getElementById('rp-group') || {}).value || 'project';

        try {
            var r = await TimeTrackingApi.getTimeReport({ dateFrom: from, dateTo: to, groupBy: groupBy });
            report = (r && r.data) ? r.data : r;
            _renderReportResults();
        } catch (e) {
            _toast('Erreur chargement rapport', 'error');
        }
    }

    function _renderReportResults() {
        if (!report) return;
        var cards = document.getElementById('rp-cards');
        var detail = document.getElementById('rp-detail');

        var totalH = report.total_minutes ? (report.total_minutes / 60).toFixed(1) + 'h' : '0h';
        var billableH = report.billable_minutes ? (report.billable_minutes / 60).toFixed(1) + 'h' : '0h';
        var amount = report.total_amount ? EUR.format(report.total_amount) : EUR.format(0);
        var util = report.total_minutes > 0 ? Math.round((report.billable_minutes || 0) / report.total_minutes * 100) + '%' : '0%';

        if (cards) {
            cards.innerHTML = _reportCard('Total heures', totalH, 'var(--accent-primary)') +
                _reportCard('Heures facturables', billableH, 'var(--success-color)') +
                _reportCard('Montant total', amount, '#f59e0b') +
                _reportCard('Taux utilisation', util, '#8b5cf6');
        }

        if (detail && report.groups) {
            var h = '<table style="width:100%;border-collapse:collapse;font-size:.85rem">';
            h += '<thead><tr style="border-bottom:2px solid var(--border-color)">';
            h += '<th style="padding:10px;text-align:left;font-weight:600;color:var(--text-secondary)">Groupe</th>';
            h += '<th style="padding:10px;text-align:right;font-weight:600;color:var(--text-secondary)">Heures</th>';
            h += '<th style="padding:10px;text-align:right;font-weight:600;color:var(--text-secondary)">Facturable</th>';
            h += '<th style="padding:10px;text-align:right;font-weight:600;color:var(--text-secondary)">Montant</th>';
            h += '</tr></thead><tbody>';

            report.groups.forEach(function(g) {
                h += '<tr style="border-bottom:1px solid var(--border-color)">';
                h += '<td style="padding:10px;font-weight:500;color:var(--text-primary)">' + _e(g.name || 'Sans projet') + '</td>';
                h += '<td style="padding:10px;text-align:right;font-family:monospace">' + formatDuration(g.total_minutes) + '</td>';
                h += '<td style="padding:10px;text-align:right;font-family:monospace">' + formatDuration(g.billable_minutes) + '</td>';
                h += '<td style="padding:10px;text-align:right;font-family:monospace;color:var(--success-color)">' + EUR.format(g.amount || 0) + '</td>';
                h += '</tr>';
            });
            h += '</tbody></table>';
            detail.innerHTML = h;
        }
    }

    // =====================================================
    // TAB: TARIFICATION
    // =====================================================

    function _renderRate(content) {
        var h = '<div style="max-width:500px">';
        h += '<h3 style="margin:0 0 20px;color:var(--text-primary)">Taux horaire</h3>';
        h += '<div style="padding:24px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border-color)">';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:8px;font-size:.85rem">Taux horaire par defaut</label>';
        h += '<div style="display:flex;gap:8px"><input id="rate-val" type="number" step="0.5" style="padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-primary);color:var(--text-primary);font-size:1.2rem;font-weight:700;font-family:monospace;width:150px" placeholder="0.00">';
        h += '<select id="rate-cur" style="padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-primary);color:var(--text-primary)"><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></div></div>';
        h += '<p style="color:var(--text-secondary);font-size:.85rem;margin:0 0 16px">Ce taux sera utilise par defaut pour calculer le montant des heures facturables.</p>';
        h += '<button id="rate-save" style="padding:10px 24px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;font-weight:600;cursor:pointer">Sauvegarder</button>';
        h += '</div>';

        h += '<div style="margin-top:24px;padding:24px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border-color)">';
        h += '<h4 style="margin:0 0 12px;color:var(--text-primary)">Heures non facturees</h4>';
        h += '<div id="rate-unbilled">Chargement...</div>';
        h += '</div>';
        h += '</div>';

        content.innerHTML = h;

        // Load current rate
        TimeTrackingApi.getMemberRate().then(function(r) {
            var data = (r && r.data) ? r.data : r;
            if (data && data.hourly_rate) {
                document.getElementById('rate-val').value = data.hourly_rate;
                if (data.currency) document.getElementById('rate-cur').value = data.currency;
            }
        }).catch(function() {});

        // Load unbilled
        TimeTrackingApi.getUnbilled({}).then(function(r) {
            var items = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
            var el = document.getElementById('rate-unbilled');
            if (!el) return;
            if (!items.length) {
                el.innerHTML = '<p style="color:var(--text-secondary)">Toutes les heures sont facturees !</p>';
                return;
            }
            var totalMin = 0, totalAmt = 0;
            items.forEach(function(e) { totalMin += (e.duration_minutes || 0); totalAmt += e.hourly_rate ? ((e.duration_minutes || 0) / 60) * parseFloat(e.hourly_rate) : 0; });
            el.innerHTML = '<p style="margin:0"><strong>' + items.length + '</strong> entrees non facturees</p>' +
                '<p style="margin:4px 0 0;font-size:1.2rem;font-weight:700;color:var(--accent-primary)">' + formatDuration(totalMin) + ' - ' + EUR.format(totalAmt) + '</p>';
        }).catch(function() {});

        document.getElementById('rate-save').onclick = async function() {
            var rate = parseFloat(document.getElementById('rate-val').value);
            var cur = document.getElementById('rate-cur').value;
            if (!rate || rate <= 0) { _toast('Taux invalide', 'warning'); return; }
            try {
                await TimeTrackingApi.setMemberRate(rate, cur);
                _toast('Taux sauvegarde : ' + EUR.format(rate) + '/h', 'success');
            } catch (e) { _toast('Erreur sauvegarde', 'error'); }
        };
    }

    // =====================================================
    // PUBLIC
    // =====================================================

    function destroy() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    return {
        render: render,
        destroy: destroy
    };
})();

if (typeof window !== 'undefined') {
    window.TimeTrackingView = TimeTrackingView;
}
