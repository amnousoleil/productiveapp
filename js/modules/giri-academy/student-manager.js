/**
 * STUDENT MANAGER v2.0
 * Tableau de suivi des étudiants — Style System.io
 * Features: stats bar, filtres, export CSV, email, progression détaillée
 */

const StudentManager = (function () {
    'use strict';

    let _formation = null;
    let _students = [];
    let _filtered = [];
    let _searchQuery = '';
    let _activeFilter = 'all';
    let _onBack = null;

    function setHandlers(handlers) {
        _onBack = handlers.onBack;
    }

    // ── Public entry point ─────────────────────────────────────────────────────

    async function render(container, formation) {
        _formation = formation;
        _searchQuery = '';
        _activeFilter = 'all';
        container.innerHTML = `<div class="academy-loading"><div class="academy-spinner"></div><span>Chargement des étudiants...</span></div>`;

        try {
            _students = await AcademyApi.listStudents(formation.id);
        } catch (e) {
            _students = _getMockStudents();
        }

        _filtered = _students;
        container.innerHTML = _buildHtml();
        _attachEvents(container);
    }

    // ── HTML builders ──────────────────────────────────────────────────────────

    function _buildHtml() {
        const stats = _computeStats(_students);
        return `
        <div class="academy-header">
            <div class="academy-header-left">
                <button class="btn-academy btn-secondary btn-sm" id="btn-back-from-students">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                <div>
                    <h1 class="academy-header-title">👥 Étudiants — ${_esc(_formation.title || _formation.name || '')}</h1>
                    <p class="academy-header-subtitle" id="students-subtitle">${_students.length} étudiant${_students.length !== 1 ? 's' : ''} inscrit${_students.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <div class="academy-header-actions">
                <button class="btn-academy btn-secondary btn-sm" id="btn-export-csv">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                </button>
                <button class="btn-academy btn-primary" id="btn-add-student">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>
        </div>

        <div class="academy-body">
            <!-- KPI Stats Bar -->
            <div class="sm-stats-bar">
                <div class="sm-stat-card">
                    <div class="sm-stat-value">${stats.total}</div>
                    <div class="sm-stat-label">Total inscrits</div>
                </div>
                <div class="sm-stat-card">
                    <div class="sm-stat-value sm-stat-green">${stats.completed}</div>
                    <div class="sm-stat-label">Complétés 🏆</div>
                </div>
                <div class="sm-stat-card">
                    <div class="sm-stat-value sm-stat-purple">${stats.avgProgress}%</div>
                    <div class="sm-stat-label">Progression moy.</div>
                </div>
                <div class="sm-stat-card">
                    <div class="sm-stat-value sm-stat-orange">${stats.activeRecent}</div>
                    <div class="sm-stat-label">Actifs (7 jours)</div>
                </div>
            </div>

            <!-- Toolbar: search + filters -->
            <div class="sm-toolbar">
                <div class="sm-search-wrap">
                    <svg class="sm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="search" class="sm-search" id="students-search" placeholder="Rechercher par email ou nom...">
                </div>
                <div class="sm-filters">
                    <button class="sm-filter-btn active" data-filter="all">Tous <span class="sm-filter-count">${_students.length}</span></button>
                    <button class="sm-filter-btn" data-filter="active">En cours <span class="sm-filter-count">${stats.inProgress}</span></button>
                    <button class="sm-filter-btn" data-filter="completed">Complétés <span class="sm-filter-count">${stats.completed}</span></button>
                    <button class="sm-filter-btn" data-filter="inactive">Inactifs <span class="sm-filter-count">${stats.inactive}</span></button>
                </div>
            </div>

            <!-- Table -->
            <div class="sm-table-wrap" id="students-table-container">
                ${_buildTable(_students)}
            </div>
        </div>`;
    }

    function _buildTable(students) {
        if (students.length === 0) {
            return `<div class="academy-empty" style="padding:56px 24px">
                <div class="academy-empty-icon">👥</div>
                <h2 class="academy-empty-title">Aucun étudiant trouvé</h2>
                <p class="academy-empty-desc">${_searchQuery ? 'Aucun résultat pour "' + _esc(_searchQuery) + '"' : 'Aucun étudiant inscrit pour le moment.'}</p>
                ${!_searchQuery ? '<button class="btn-academy btn-primary" id="btn-add-student-empty"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter le premier étudiant</button>' : ''}
            </div>`;
        }

        const rows = students.map(s => _buildRow(s)).join('');

        return `<table class="sm-table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Inscrit le</th>
                    <th style="min-width:180px">Progression</th>
                    <th>Dernière activité</th>
                    <th>Statut</th>
                    <th style="text-align:right">Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    function _buildRow(s) {
        const progress = Number(s.progress_pct) || 0;
        const initials = _getInitials(s.name || s.email);
        const isCompleted = progress >= 100;
        const isInactive = _isInactive(s);

        // Progress color
        const progressColor = progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';
        const progressGrad  = progress >= 75
            ? 'linear-gradient(90deg,#10b981,#34d399)'
            : progress >= 40
            ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
            : 'linear-gradient(90deg,#ef4444,#f87171)';

        // Status badge
        const statusHtml = isCompleted
            ? `<span class="sm-badge sm-badge-green">🏆 Complété</span>`
            : isInactive
            ? `<span class="sm-badge sm-badge-gray">Inactif</span>`
            : `<span class="sm-badge sm-badge-blue">En cours</span>`;

        // Last activity
        const lastActivity = s.last_activity_date ? _relativeDate(s.last_activity_date) : 'Jamais';

        // Streak
        const streakHtml = (s.streak_days && s.streak_days > 0)
            ? `<span class="sm-streak">🔥 ${s.streak_days}j</span>` : '';

        // Lessons info
        const lessonsHtml = s.lessons_done !== undefined
            ? `<span style="font-size:11px;color:var(--text-muted)">${s.lessons_done}/${s.total_lessons || '?'} leçons</span>`
            : '';

        return `<tr data-student-id="${s.id}">
            <td>
                <div class="sm-student-info">
                    <div class="sm-avatar" style="background:${_avatarColor(s.email)}">${initials}</div>
                    <div>
                        <div class="sm-student-name">${_esc(s.name || '—')} ${isCompleted ? '🏆' : ''}</div>
                        <div class="sm-student-email">${_esc(s.email)}</div>
                    </div>
                </div>
            </td>
            <td style="color:var(--text-muted);font-size:13px">${_formatDate(s.access_granted_at || s.created_at)}</td>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div class="sm-progress-track">
                        <div class="sm-progress-fill" style="width:${progress}%;background:${progressGrad}"></div>
                    </div>
                    <span style="font-size:13px;font-weight:700;color:${progressColor};min-width:34px">${progress}%</span>
                </div>
                <div style="margin-top:4px;display:flex;gap:6px;align-items:center">
                    ${lessonsHtml}${streakHtml}
                </div>
            </td>
            <td style="font-size:13px;color:${isInactive ? 'var(--text-muted)' : 'var(--text)'}">${lastActivity}</td>
            <td>${statusHtml}</td>
            <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                    <button class="sm-action-btn" title="Voir progression" data-action="view-progress" data-student-id="${s.id}">
                        📈
                    </button>
                    <button class="sm-action-btn" title="Envoyer un email" data-action="send-email" data-student-id="${s.id}" data-email="${_esc(s.email)}" data-name="${_esc(s.name || '')}">
                        📧
                    </button>
                    <button class="sm-action-btn sm-action-danger" title="Retirer l'accès" data-action="remove-student" data-student-id="${s.id}">
                        🗑
                    </button>
                </div>
            </td>
        </tr>`;
    }

    // ── Events ──────────────────────────────────────────────────────────────────

    function _attachEvents(container) {
        // Back
        container.querySelector('#btn-back-from-students')?.addEventListener('click', () => _onBack && _onBack());

        // Add student
        container.querySelector('#btn-add-student')?.addEventListener('click', () => _openAddModal(container));
        container.querySelector('#btn-add-student-empty')?.addEventListener('click', () => _openAddModal(container));

        // Export CSV
        container.querySelector('#btn-export-csv')?.addEventListener('click', () => _exportCsv());

        // Search
        const searchInput = container.querySelector('#students-search');
        searchInput?.addEventListener('input', () => {
            _searchQuery = searchInput.value.trim().toLowerCase();
            _applyFilter(container);
        });

        // Filters
        container.querySelectorAll('.sm-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.sm-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                _activeFilter = btn.dataset.filter;
                _applyFilter(container);
            });
        });

        _attachTableEvents(container);
    }

    function _attachTableEvents(container) {
        // View progress
        container.querySelectorAll('[data-action="view-progress"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.studentId;
                const s = _students.find(x => x.id === id);
                if (!s) return;
                await _showProgressDetail(s);
            });
        });

        // Send email
        container.querySelectorAll('[data-action="send-email"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                const name = btn.dataset.name;
                _showEmailModal(email, name);
            });
        });

        // Remove student
        container.querySelectorAll('[data-action="remove-student"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Retirer cet étudiant de la formation ? Cette action est irréversible.')) return;
                const id = btn.dataset.studentId;
                try {
                    await AcademyApi.removeStudent(_formation.id, id);
                    if (typeof Toast !== 'undefined') Toast.success('Étudiant retiré');
                } catch (e) { /* offline ok */ }
                _students = _students.filter(s => s.id !== id);
                _applyFilter(container);
            });
        });
    }

    function _applyFilter(container) {
        let list = _students;

        // Text search
        if (_searchQuery) {
            list = list.filter(s =>
                (s.email || '').toLowerCase().includes(_searchQuery) ||
                (s.name || '').toLowerCase().includes(_searchQuery)
            );
        }

        // Status filter
        if (_activeFilter === 'completed') {
            list = list.filter(s => (Number(s.progress_pct) || 0) >= 100);
        } else if (_activeFilter === 'active') {
            list = list.filter(s => {
                const p = Number(s.progress_pct) || 0;
                return p > 0 && p < 100 && !_isInactive(s);
            });
        } else if (_activeFilter === 'inactive') {
            list = list.filter(s => _isInactive(s) && (Number(s.progress_pct) || 0) < 100);
        }

        _filtered = list;
        container.querySelector('#students-table-container').innerHTML = _buildTable(list);
        container.querySelector('#students-subtitle').textContent =
            `${list.length} étudiant${list.length !== 1 ? 's' : ''} affiché${list.length !== 1 ? 's' : ''}`;
        _attachTableEvents(container);
    }

    // ── Add student modal ───────────────────────────────────────────────────────

    function _openAddModal(container) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:420px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">➕ Ajouter un étudiant</h3>
                <button class="academy-modal-close" id="add-modal-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <p style="font-size:13px;color:var(--text-muted);margin:0 0 20px">Donnez un accès manuel à la formation. L'étudiant pourra se connecter avec son email.</p>
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" id="add-email" placeholder="etudiant@email.com" autofocus>
                </div>
                <div class="form-group">
                    <label class="form-label">Nom complet</label>
                    <input type="text" class="form-control" id="add-name" placeholder="Prénom Nom">
                </div>
                <div class="form-group">
                    <label class="form-label">Expiration de l'accès</label>
                    <input type="date" class="form-control" id="add-expires">
                    <small style="color:var(--text-muted);font-size:11px">Laisser vide = accès illimité</small>
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="add-cancel">Annuler</button>
                <button class="btn-academy btn-primary" id="add-confirm">Ajouter l'étudiant</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#add-modal-close').onclick = () => overlay.remove();
        overlay.querySelector('#add-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#add-confirm').onclick = async () => {
            const email = overlay.querySelector('#add-email').value.trim();
            if (!email) { overlay.querySelector('#add-email').focus(); return; }
            const btn = overlay.querySelector('#add-confirm');
            btn.textContent = 'Ajout...';
            btn.disabled = true;
            try {
                const student = await AcademyApi.addStudent(_formation.id, {
                    email,
                    name: overlay.querySelector('#add-name').value.trim() || null,
                    access_expires_at: overlay.querySelector('#add-expires').value || null,
                });
                overlay.remove();
                _students.unshift({
                    ...student,
                    id: student?.id || 'new-' + Date.now(),
                    progress_pct: 0,
                    lessons_done: 0,
                    total_lessons: 0,
                    access_granted_at: new Date().toISOString(),
                });
                _applyFilter(container);
                if (typeof Toast !== 'undefined') Toast.success('Étudiant ajouté avec succès');
            } catch (e) {
                if (typeof Toast !== 'undefined') Toast.error('Erreur: ' + (e.message || 'Impossible d\'ajouter l\'étudiant'));
                btn.textContent = 'Ajouter l\'étudiant';
                btn.disabled = false;
            }
        };
    }

    // ── Progress detail modal ───────────────────────────────────────────────────

    async function _showProgressDetail(student) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';

        const progress = Number(student.progress_pct) || 0;
        const progressColor = progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';
        const timeSpent = student.total_time_spent
            ? (student.total_time_spent >= 3600
                ? Math.round(student.total_time_spent / 3600) + 'h'
                : Math.round(student.total_time_spent / 60) + ' min')
            : '—';

        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:520px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">📈 Progression — ${_esc(student.name || student.email)}</h3>
                <button class="academy-modal-close" id="prog-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <!-- Student identity -->
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding:16px;background:var(--bg-tertiary);border-radius:12px">
                    <div class="sm-avatar" style="width:56px;height:56px;font-size:20px;background:${_avatarColor(student.email)}">${_getInitials(student.name || student.email)}</div>
                    <div>
                        <div style="font-weight:700;font-size:16px">${_esc(student.name || '—')}</div>
                        <div style="color:var(--text-muted);font-size:13px">${_esc(student.email)}</div>
                        <div style="color:var(--text-muted);font-size:12px;margin-top:2px">Inscrit le ${_formatDate(student.access_granted_at || student.created_at)}</div>
                    </div>
                </div>

                <!-- Progress ring area -->
                <div style="text-align:center;margin-bottom:24px">
                    <div style="font-size:56px;font-weight:800;color:${progressColor};line-height:1">${progress}%</div>
                    <div style="color:var(--text-muted);font-size:13px;margin:4px 0 12px">Progression globale</div>
                    <div class="sm-progress-track" style="width:100%;height:12px">
                        <div class="sm-progress-fill" style="width:${progress}%;background:${progress >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)' : progress >= 40 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)'}"></div>
                    </div>
                </div>

                <!-- Stats grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
                    <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;text-align:center">
                        <div style="font-size:22px;font-weight:700;color:#10b981">${student.lessons_done || 0}</div>
                        <div style="font-size:11px;color:var(--text-muted)">Leçons complétées</div>
                    </div>
                    <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;text-align:center">
                        <div style="font-size:22px;font-weight:700;color:#f59e0b">${timeSpent}</div>
                        <div style="font-size:11px;color:var(--text-muted)">Temps passé</div>
                    </div>
                    <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;text-align:center">
                        <div style="font-size:22px;font-weight:700;color:#a78bfa">${student.streak_days || 0}</div>
                        <div style="font-size:11px;color:var(--text-muted)">🔥 Streak (jours)</div>
                    </div>
                </div>

                <!-- Last activity -->
                <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center">
                    <span style="color:var(--text-muted);font-size:13px">Dernière activité</span>
                    <strong style="font-size:13px">${student.last_activity_date ? _relativeDate(student.last_activity_date) + ' (' + _formatDate(student.last_activity_date) + ')' : 'Jamais'}</strong>
                </div>

                <!-- Detailed progress loading -->
                <div id="detail-lessons" style="margin-top:16px">
                    <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px">
                        <div class="academy-spinner" style="width:20px;height:20px;margin:0 auto 8px"></div>
                        Chargement du détail...
                    </div>
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="prog-email-btn" data-email="${_esc(student.email)}" data-name="${_esc(student.name || '')}">📧 Envoyer un email</button>
                <button class="btn-academy btn-primary" id="prog-close-btn">Fermer</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#prog-close').onclick = () => overlay.remove();
        overlay.querySelector('#prog-close-btn').onclick = () => overlay.remove();
        overlay.querySelector('#prog-email-btn').onclick = (e) => {
            overlay.remove();
            _showEmailModal(e.currentTarget.dataset.email, e.currentTarget.dataset.name);
        };
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        // Load per-lesson progress
        try {
            const detail = await Api.get(`/formations/${_formation.id}/students/${student.id}/progress`);
            const lessonsProgress = detail?.data?.lessons_progress || [];
            const detailEl = overlay.querySelector('#detail-lessons');
            if (detailEl && lessonsProgress.length > 0) {
                detailEl.innerHTML = `
                <div style="font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Détail par leçon</div>
                <div style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
                    ${lessonsProgress.map(lp => `
                    <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-tertiary);border-radius:8px;font-size:12px">
                        <span style="font-size:14px">${lp.completed_at ? '✅' : '⬜'}</span>
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(lp.lesson_title || 'Leçon')}</div>
                            <div style="color:var(--text-muted);font-size:11px">${_esc(lp.module_title || '')} ${lp.watch_time_seconds ? '· ' + Math.round(lp.watch_time_seconds / 60) + ' min' : ''}</div>
                        </div>
                        <span style="color:${lp.completed_at ? '#10b981' : 'var(--text-muted)'};font-weight:600">${lp.progress_percent || 0}%</span>
                    </div>`).join('')}
                </div>`;
            } else if (detailEl) {
                detailEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:13px;margin:0">Aucune leçon consultée pour l'instant.</p>`;
            }
        } catch (e) {
            const detailEl = overlay.querySelector('#detail-lessons');
            if (detailEl) detailEl.innerHTML = '';
        }
    }

    // ── Email modal ─────────────────────────────────────────────────────────────

    function _showEmailModal(email, name) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:440px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">📧 Envoyer un email</h3>
                <button class="academy-modal-close" id="email-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <p style="font-size:13px;color:var(--text-muted);margin:0 0 20px">Destinataire : <strong style="color:var(--text)">${_esc(email)}</strong></p>
                <div class="form-group">
                    <label class="form-label">Type d'email</label>
                    <select class="form-control" id="email-trigger">
                        <option value="formation_started">🚀 Formation démarrée</option>
                        <option value="inactive_7_days">👋 Relance inactivité</option>
                        <option value="certificate_ready">🏅 Certificat disponible</option>
                        <option value="purchase_complete">✅ Confirmation d'accès</option>
                    </select>
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="email-cancel">Annuler</button>
                <button class="btn-academy btn-primary" id="email-send">Envoyer →</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#email-close').onclick = () => overlay.remove();
        overlay.querySelector('#email-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#email-send').onclick = async () => {
            const trigger = overlay.querySelector('#email-trigger').value;
            const btn = overlay.querySelector('#email-send');
            btn.textContent = 'Envoi...';
            btn.disabled = true;
            try {
                await Api.post('/emails/send', {
                    to_email: email,
                    to_name: name || undefined,
                    trigger,
                    variables: {
                        name: name || email,
                        formation_title: _formation.title || _formation.name || 'votre formation',
                        access_url: window.location.origin,
                    }
                });
                overlay.remove();
                if (typeof Toast !== 'undefined') Toast.success(`Email envoyé à ${email}`);
            } catch (e) {
                if (typeof Toast !== 'undefined') Toast.error('Erreur envoi: ' + (e.message || ''));
                btn.textContent = 'Envoyer →';
                btn.disabled = false;
            }
        };
    }

    // ── Export CSV ──────────────────────────────────────────────────────────────

    function _exportCsv() {
        const list = _filtered.length > 0 ? _filtered : _students;
        const headers = ['Nom', 'Email', 'Progression (%)', 'Leçons complétées', 'Inscrit le', 'Dernière activité', 'Streak (jours)', 'Statut'];
        const rows = list.map(s => [
            s.name || '',
            s.email,
            Number(s.progress_pct) || 0,
            s.lessons_done || 0,
            _formatDate(s.access_granted_at || s.created_at),
            s.last_activity_date ? _formatDate(s.last_activity_date) : 'Jamais',
            s.streak_days || 0,
            Number(s.progress_pct) >= 100 ? 'Complété' : _isInactive(s) ? 'Inactif' : 'En cours',
        ]);
        const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        a.download = `etudiants-${(_formation.title || 'formation').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        if (typeof Toast !== 'undefined') Toast.success(`Export CSV : ${list.length} étudiants`);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    function _computeStats(students) {
        const total = students.length;
        const completed = students.filter(s => (Number(s.progress_pct) || 0) >= 100).length;
        const inProgress = students.filter(s => {
            const p = Number(s.progress_pct) || 0;
            return p > 0 && p < 100 && !_isInactive(s);
        }).length;
        const inactive = students.filter(s => _isInactive(s) && (Number(s.progress_pct) || 0) < 100).length;

        const avgProgress = total > 0
            ? Math.round(students.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / total)
            : 0;

        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        const activeRecent = students.filter(s => s.last_activity_date && s.last_activity_date >= sevenDaysAgo).length;

        return { total, completed, inProgress, inactive, avgProgress, activeRecent };
    }

    function _isInactive(student) {
        if (!student.last_activity_date) return true;
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        return student.last_activity_date < sevenDaysAgo;
    }

    function _relativeDate(dateStr) {
        if (!dateStr) return 'Jamais';
        try {
            const d = new Date(dateStr);
            const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
            if (diffDays === 0) return 'Aujourd\'hui';
            if (diffDays === 1) return 'Hier';
            if (diffDays < 7) return `Il y a ${diffDays} jours`;
            if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${diffDays >= 14 ? 's' : ''}`;
            if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
            return `Il y a ${Math.floor(diffDays / 365)} an${diffDays >= 730 ? 's' : ''}`;
        } catch { return dateStr; }
    }

    function _avatarColor(email) {
        const colors = [
            'linear-gradient(135deg,#7c3aed,#a78bfa)',
            'linear-gradient(135deg,#0891b2,#38bdf8)',
            'linear-gradient(135deg,#059669,#34d399)',
            'linear-gradient(135deg,#d97706,#fbbf24)',
            'linear-gradient(135deg,#dc2626,#f87171)',
            'linear-gradient(135deg,#7c3aed,#ec4899)',
            'linear-gradient(135deg,#1d4ed8,#818cf8)',
        ];
        let hash = 0;
        for (const c of (email || '')) hash = (hash << 5) - hash + c.charCodeAt(0);
        return colors[Math.abs(hash) % colors.length];
    }

    function _getInitials(str) {
        if (!str) return '?';
        const parts = str.split(/[@\s.]+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return str.slice(0, 2).toUpperCase();
    }

    function _formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    }

    function _getMockStudents() {
        return [
            { id: '1', email: 'alice@example.com', name: 'Alice Martin', progress_pct: 75, lessons_done: 6, total_lessons: 8, last_activity_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), streak_days: 5, access_granted_at: '2026-01-15T10:00:00Z', total_time_spent: 5400 },
            { id: '2', email: 'bob@example.com', name: 'Bob Dupont', progress_pct: 100, lessons_done: 8, total_lessons: 8, last_activity_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), streak_days: 14, access_granted_at: '2026-01-08T14:00:00Z', total_time_spent: 7200 },
            { id: '3', email: 'carol@example.com', name: null, progress_pct: 20, lessons_done: 2, total_lessons: 8, last_activity_date: null, streak_days: 0, access_granted_at: '2026-02-01T09:00:00Z', total_time_spent: 1200 },
            { id: '4', email: 'david@example.com', name: 'David Chen', progress_pct: 45, lessons_done: 4, total_lessons: 8, last_activity_date: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10), streak_days: 0, access_granted_at: '2026-01-20T09:00:00Z', total_time_spent: 3000 },
        ];
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    return { render, setHandlers };
})();

if (typeof window !== 'undefined') window.StudentManager = StudentManager;
