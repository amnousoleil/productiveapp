/**
 * STUDENT MANAGER v1.0
 * Gestion des étudiants d'une formation
 */

const StudentManager = (function () {
    'use strict';

    let _formation = null;
    let _students = [];
    let _searchQuery = '';
    let _onBack = null;

    function setHandlers(handlers) {
        _onBack = handlers.onBack;
    }

    async function render(container, formation) {
        _formation = formation;
        container.innerHTML = `<div class="academy-loading"><div class="academy-spinner"></div><span>Chargement des étudiants...</span></div>`;

        try {
            _students = await AcademyApi.listStudents(formation.id);
        } catch (e) {
            _students = _getMockStudents();
        }

        _searchQuery = '';
        container.innerHTML = _buildHtml();
        _attachEvents(container);
    }

    function _buildHtml() {
        return `
        <div class="academy-header">
            <div class="academy-header-left">
                <button class="btn-academy btn-secondary btn-sm" id="btn-back-from-students">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                <div>
                    <h1 class="academy-header-title">Étudiants — ${_esc(_formation.title || _formation.name || '')}</h1>
                    <p class="academy-header-subtitle">${_students.length} étudiant${_students.length !== 1 ? 's' : ''} inscrit${_students.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <div class="academy-header-actions">
                <button class="btn-academy btn-primary" id="btn-add-student">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter manuellement
                </button>
            </div>
        </div>
        <div class="academy-body">
            <div class="students-header">
                <input type="search" class="students-search" id="students-search" placeholder="🔍 Rechercher par email ou nom...">
                <span style="font-size:13px;color:var(--text-muted)" id="students-count">${_students.length} étudiant${_students.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;overflow:hidden">
                <div id="students-table-container">
                    ${_buildTable(_students)}
                </div>
            </div>
        </div>`;
    }

    function _buildTable(students) {
        if (students.length === 0) {
            return `<div class="academy-empty" style="padding:48px 24px">
                <div class="academy-empty-icon">👥</div>
                <h2 class="academy-empty-title">Aucun étudiant trouvé</h2>
                <p class="academy-empty-desc">${_searchQuery ? 'Aucun résultat pour "' + _esc(_searchQuery) + '"' : 'Aucun étudiant inscrit pour le moment.'}</p>
            </div>`;
        }

        const rows = students.map(s => {
            const progress = s.progress_pct || 0;
            const initials = _getInitials(s.name || s.email);
            const statusBadge = s.status === 'active'
                ? `<span style="color:#10b981;font-size:12px;font-weight:600">● Actif</span>`
                : `<span style="color:var(--text-muted);font-size:12px">● Inactif</span>`;

            return `<tr>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div style="font-weight:600">${_esc(s.name || '—')}</div>
                            <div style="font-size:12px;color:var(--text-muted)">${_esc(s.email)}</div>
                        </div>
                    </div>
                </td>
                <td>${_formatDate(s.enrolled_at || s.created_at)}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px">
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width:${progress}%"></div>
                        </div>
                        <span style="font-size:13px;font-weight:600;min-width:32px">${progress}%</span>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex;gap:6px">
                        <button class="btn-academy btn-secondary btn-sm" data-action="view-progress" data-student-id="${s.id}">
                            📈 Voir détail
                        </button>
                        <button class="btn-academy btn-danger btn-sm" data-action="remove-student" data-student-id="${s.id}">
                            🗑
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        return `<table class="students-table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Inscrit le</th>
                    <th>Progression</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    function _attachEvents(container) {
        container.querySelector('#btn-back-from-students')?.addEventListener('click', () => _onBack && _onBack());

        // Search
        const searchInput = container.querySelector('#students-search');
        searchInput?.addEventListener('input', () => {
            _searchQuery = searchInput.value.trim().toLowerCase();
            const filtered = _students.filter(s =>
                (s.email || '').toLowerCase().includes(_searchQuery) ||
                (s.name || '').toLowerCase().includes(_searchQuery)
            );
            container.querySelector('#students-table-container').innerHTML = _buildTable(filtered);
            container.querySelector('#students-count').textContent = `${filtered.length} étudiant${filtered.length !== 1 ? 's' : ''}`;
            _attachTableEvents(container);
        });

        _attachTableEvents(container);

        // Add student modal
        container.querySelector('#btn-add-student')?.addEventListener('click', () => {
            _showAddModal(async (data) => {
                try {
                    const student = await AcademyApi.addStudent(_formation.id, data);
                    _students.unshift({ ...data, id: student?.id || 'new-' + Date.now(), progress_pct: 0, status: 'active', enrolled_at: new Date().toISOString() });
                    container.querySelector('#students-table-container').innerHTML = _buildTable(_students);
                    container.querySelector('#academy-header-subtitle, .academy-header-subtitle').textContent = `${_students.length} étudiant${_students.length !== 1 ? 's' : ''} inscrit${_students.length !== 1 ? 's' : ''}`;
                    _attachTableEvents(container);
                } catch (e) {
                    alert('Erreur: ' + (e.message || 'Impossible d\'ajouter l\'étudiant'));
                }
            });
        });
    }

    function _attachTableEvents(container) {
        container.querySelectorAll('[data-action="remove-student"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Retirer cet étudiant de la formation ?')) return;
                const id = btn.dataset.studentId;
                try {
                    await AcademyApi.removeStudent(_formation.id, id);
                } catch (e) { /* offline ok */ }
                _students = _students.filter(s => s.id !== id);
                container.querySelector('#students-table-container').innerHTML = _buildTable(_students);
                _attachTableEvents(container);
            });
        });

        container.querySelectorAll('[data-action="view-progress"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.studentId;
                const s = _students.find(x => x.id === id);
                if (!s) return;
                _showProgressDetail(s);
            });
        });
    }

    function _showAddModal(onAdd) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:420px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">➕ Ajouter un étudiant</h3>
                <button class="academy-modal-close" id="add-modal-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <p style="font-size:13px;color:var(--text-muted);margin:0 0 16px">Donnez un accès gratuit à cette formation (accès manuel).</p>
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" id="add-email" placeholder="etudiant@email.com" autofocus>
                </div>
                <div class="form-group">
                    <label class="form-label">Nom (optionnel)</label>
                    <input type="text" class="form-control" id="add-name" placeholder="Prénom Nom">
                </div>
                <div class="form-group">
                    <label class="form-label">Note interne</label>
                    <input type="text" class="form-control" id="add-note" placeholder="ex: Accès partenariat, test...">
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="add-cancel">Annuler</button>
                <button class="btn-academy btn-primary" id="add-confirm">Ajouter</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#add-modal-close').onclick = () => overlay.remove();
        overlay.querySelector('#add-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#add-confirm').onclick = () => {
            const email = overlay.querySelector('#add-email').value.trim();
            if (!email) { overlay.querySelector('#add-email').focus(); return; }
            overlay.remove();
            onAdd({ email, name: overlay.querySelector('#add-name').value.trim(), note: overlay.querySelector('#add-note').value.trim() });
        };
    }

    function _showProgressDetail(student) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:500px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">📈 Progression — ${_esc(student.name || student.email)}</h3>
                <button class="academy-modal-close" id="prog-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <div style="text-align:center;margin-bottom:24px">
                    <div class="student-avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 12px">${_getInitials(student.name || student.email)}</div>
                    <p style="font-weight:700;font-size:16px;margin:0">${_esc(student.name || '—')}</p>
                    <p style="color:var(--text-muted);font-size:13px;margin:4px 0">${_esc(student.email)}</p>
                    <p style="color:var(--text-muted);font-size:12px;margin:4px 0">Inscrit le ${_formatDate(student.enrolled_at || student.created_at)}</p>
                </div>
                <div style="text-align:center;margin-bottom:20px">
                    <div style="font-size:48px;font-weight:800;color:#a78bfa;line-height:1">${student.progress_pct || 0}%</div>
                    <div style="color:var(--text-muted);font-size:13px;margin-top:4px">Progression globale</div>
                    <div class="progress-bar-container" style="width:100%;margin-top:12px;height:12px">
                        <div class="progress-bar-fill" style="width:${student.progress_pct || 0}%"></div>
                    </div>
                </div>
                ${student.lessons_completed !== undefined ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;text-align:center">
                        <div style="font-size:24px;font-weight:700;color:#10b981">${student.lessons_completed || 0}</div>
                        <div style="font-size:12px;color:var(--text-muted)">Leçons complétées</div>
                    </div>
                    <div style="background:var(--bg-tertiary);border-radius:10px;padding:14px;text-align:center">
                        <div style="font-size:24px;font-weight:700;color:#f59e0b">${student.time_spent_minutes || 0} min</div>
                        <div style="font-size:12px;color:var(--text-muted)">Temps passé</div>
                    </div>
                </div>` : '<p style="text-align:center;color:var(--text-muted);font-size:13px">Détail de progression non disponible</p>'}
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-primary" id="prog-close-btn">Fermer</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#prog-close').onclick = () => overlay.remove();
        overlay.querySelector('#prog-close-btn').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
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
        } catch (e) { return dateStr; }
    }

    function _getMockStudents() {
        return [
            { id: '1', email: 'alice@example.com', name: 'Alice Martin', progress_pct: 75, status: 'active', enrolled_at: '2026-01-15T10:00:00Z', lessons_completed: 6, time_spent_minutes: 90 },
            { id: '2', email: 'bob@example.com', name: 'Bob Dupont', progress_pct: 100, status: 'active', enrolled_at: '2026-01-08T14:00:00Z', lessons_completed: 8, time_spent_minutes: 120 },
            { id: '3', email: 'carol@example.com', name: null, progress_pct: 20, status: 'active', enrolled_at: '2026-02-01T09:00:00Z', lessons_completed: 2, time_spent_minutes: 25 }
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
