/**
 * FORMATION LIST v1.0
 * Liste des formations avec cards premium
 */

const FormationList = (function () {
    'use strict';

    let _onEdit = null;
    let _onStats = null;
    let _onCreate = null;

    function setHandlers(handlers) {
        _onEdit = handlers.onEdit;
        _onStats = handlers.onStats;
        _onCreate = handlers.onCreate;
    }

    async function render(container) {
        container.innerHTML = `<div class="academy-loading"><div class="academy-spinner"></div><span>Chargement des formations...</span></div>`;

        let formations = [];
        try {
            formations = await AcademyApi.listFormations();
        } catch (e) {
            formations = _getMockFormations();
        }

        container.innerHTML = _buildHtml(formations);
        _attachEvents(container, formations);
    }

    function _buildHtml(formations) {
        const createBtn = `
            <div class="academy-header">
                <div class="academy-header-left">
                    <div class="academy-header-icon">🎓</div>
                    <div>
                        <h1 class="academy-header-title">Mes Formations</h1>
                        <p class="academy-header-subtitle">${formations.length} formation${formations.length !== 1 ? 's' : ''} créée${formations.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="academy-header-actions">
                    <button class="btn-academy btn-primary" id="btn-create-formation">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Créer une formation
                    </button>
                </div>
            </div>
            <div class="academy-body">`;

        if (formations.length === 0) {
            return createBtn + _emptyState() + '</div>';
        }

        const cards = formations.map(f => _buildCard(f)).join('');
        return createBtn + `<div class="formation-grid">${cards}</div></div>`;
    }

    function _buildCard(f) {
        const price = f.price_cents ? `${(f.price_cents / 100).toFixed(0)} €` : 'Gratuit';
        const status = f.status === 'published' ? 'published' : 'draft';
        const statusLabel = status === 'published' ? 'Publié' : 'Brouillon';
        const emoji = f.emoji || '📚';
        const studentsCount = f.students_count || 0;
        const modulesCount = f.modules_count || 0;


        return `
        <div class="formation-card" data-id="${f.id}">
            <div class="formation-thumbnail">
                <span class="formation-thumbnail-emoji">${emoji}</span>
                <span class="formation-status-badge status-${status}">${statusLabel}</span>
            </div>
            <div class="formation-card-body">
                <h3 class="formation-card-title">${_esc(f.title || f.name || 'Sans titre')}</h3>
                <p class="formation-card-desc">${_esc(f.description || 'Aucune description')}</p>
                <div class="formation-card-meta">
                    <span class="formation-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span class="formation-meta-value">${studentsCount}</span> étudiants
                    </span>
                    <span class="formation-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        <span class="formation-meta-value">${modulesCount}</span> modules
                    </span>
                </div>
                <div class="formation-card-price">${price}</div>
                <div class="formation-card-actions">
                    <button class="btn-academy btn-secondary btn-sm btn-edit-formation" data-id="${f.id}">
                        ✏️ Éditer
                    </button>
                    <button class="btn-academy btn-secondary btn-sm btn-stats-formation" data-id="${f.id}">
                        📊 Stats
                    </button>
                    <button class="btn-academy btn-secondary btn-sm btn-students-formation" data-id="${f.id}">
                        👥 Étudiants
                    </button>
                    <button class="btn-academy ${status === 'published' ? 'btn-danger' : 'btn-success'} btn-sm btn-toggle-publish" data-id="${f.id}" data-status="${status}">
                        ${status === 'published' ? '⏸ Dépublier' : '🚀 Publier'}
                    </button>
                </div>
            </div>
        </div>`;
    }

    function _emptyState() {
        return `
        <div class="academy-empty">
            <div class="academy-empty-icon">🎓</div>
            <h2 class="academy-empty-title">Aucune formation créée</h2>
            <p class="academy-empty-desc">Créez votre première formation et commencez à partager vos connaissances avec le monde.</p>
            <button class="btn-academy btn-primary" id="btn-create-empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Créer ma première formation
            </button>
        </div>`;
    }

    function _attachEvents(container, formations) {
        const createBtn = container.querySelector('#btn-create-formation');
        if (createBtn) createBtn.addEventListener('click', () => _onCreate && _onCreate());

        const emptyBtn = container.querySelector('#btn-create-empty');
        if (emptyBtn) emptyBtn.addEventListener('click', () => _onCreate && _onCreate());

        container.querySelectorAll('.btn-edit-formation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const f = formations.find(x => x.id === id);
                if (f && _onEdit) _onEdit(f);
            });
        });

        container.querySelectorAll('.btn-stats-formation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const f = formations.find(x => x.id === id);
                if (f && _onStats) _onStats(f);
            });
        });

        container.querySelectorAll('.btn-students-formation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const f = formations.find(x => x.id === id);
                if (f && _onEdit) _onEdit(f, 'students');
            });
        });

        container.querySelectorAll('.btn-toggle-publish').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const isPublished = btn.dataset.status === 'published';
                try {
                    if (isPublished) {
                        await AcademyApi.unpublishFormation(id);
                    } else {
                        await AcademyApi.publishFormation(id);
                    }
                    render(container);
                } catch (err) {
                    if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la publication: ' + (err.message || ''));
                }
            });
        });

        container.querySelectorAll('.formation-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const f = formations.find(x => x.id === id);
                if (f && _onEdit) _onEdit(f);
            });
        });
    }

    // ── Emoji Picker ─────────────────────────────────────────
    const FORMATION_EMOJIS = ['📚','🧘','💪','🎯','🚀','💡','🎓','✨','🔥','💎','🌟','🎨','💼','🏆','❤️','🧠','🌿','⚡','🎵','🏅'];

    function _attachEmojiPicker(trigger, display, hiddenInput) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Fermer tout picker existant
            document.querySelectorAll('.emoji-picker-dropdown').forEach(p => p.remove());

            const picker = document.createElement('div');
            picker.className = 'emoji-picker-dropdown';
            const current = hiddenInput.value || '📚';
            picker.innerHTML = FORMATION_EMOJIS.map(em =>
                `<button class="emoji-option${em === current ? ' selected' : ''}" data-emoji="${em}" type="button">${em}</button>`
            ).join('');

            // FIX: Appendre au body avec position:fixed pour éviter le clipping par overflow des parents (modals)
            const rect = trigger.getBoundingClientRect();
            picker.style.position = 'fixed';
            picker.style.top = (rect.bottom + 8) + 'px';
            picker.style.left = rect.left + 'px';
            picker.style.zIndex = '99999';
            document.body.appendChild(picker);

            // Ajuster si déborde en bas de l'écran
            requestAnimationFrame(() => {
                const ph = picker.offsetHeight;
                if (rect.bottom + 8 + ph > window.innerHeight) {
                    picker.style.top = (rect.top - ph - 8) + 'px';
                }
            });

            picker.addEventListener('click', (ev) => {
                const btn = ev.target.closest('[data-emoji]');
                if (!btn) return;
                const chosen = btn.dataset.emoji;
                hiddenInput.value = chosen;
                display.textContent = chosen;
                picker.remove();
                ev.stopPropagation();
            });

            // Fermer si clic ailleurs
            setTimeout(() => {
                document.addEventListener('click', function closePicker() {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }, { once: true });
            }, 0);
        });
    }

    // Modal création
    function showCreateModal(onCreated) {
        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.innerHTML = `
        <div class="academy-modal" style="max-width:480px">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">✨ Nouvelle formation</h3>
                <button class="academy-modal-close" id="modal-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <div class="form-group">
                    <label class="form-label">Titre de la formation *</label>
                    <input type="text" class="form-control" id="formation-title" placeholder="ex: Méditation pour débutants" autofocus>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="formation-desc" rows="3" placeholder="Décrivez votre formation..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Prix (€)</label>
                    <input type="number" class="form-control" id="formation-price" placeholder="0 = Gratuit" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji 🎨</label>
                    <div style="position:relative;display:inline-block">
                        <div class="emoji-trigger" id="formation-emoji-trigger">
                            <span id="formation-emoji-display">📚</span>
                            <span class="emoji-trigger-hint">Cliquer pour choisir</span>
                        </div>
                        <input type="hidden" id="formation-emoji" value="📚">
                    </div>
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="modal-cancel">Annuler</button>
                <button class="btn-academy btn-primary" id="modal-create">Créer la formation</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);

        overlay.querySelector('#modal-close').onclick = () => overlay.remove();
        overlay.querySelector('#modal-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Emoji picker setup
        _attachEmojiPicker(
            overlay.querySelector('#formation-emoji-trigger'),
            overlay.querySelector('#formation-emoji-display'),
            overlay.querySelector('#formation-emoji')
        );

        overlay.querySelector('#modal-create').onclick = async () => {
            const title = overlay.querySelector('#formation-title').value.trim();
            if (!title) { overlay.querySelector('#formation-title').focus(); return; }
            const price = parseFloat(overlay.querySelector('#formation-price').value) || 0;
            const data = {
                title,
                description: overlay.querySelector('#formation-desc').value.trim(),
                price_cents: Math.round(price * 100),
                emoji: overlay.querySelector('#formation-emoji').value || '📚'
            };
            try {
                const btn = overlay.querySelector('#modal-create');
                btn.textContent = 'Création...';
                btn.disabled = true;
                const formation = await AcademyApi.createFormation(data);
                overlay.remove();
                if (onCreated) onCreated(formation);
            } catch (err) {
                alert('Erreur: ' + (err.message || 'Impossible de créer la formation'));
                overlay.querySelector('#modal-create').disabled = false;
                overlay.querySelector('#modal-create').textContent = 'Créer la formation';
            }
        };
    }

    function _getMockFormations() {
        return [
            {
                id: 'mock-1', title: 'Méditation Pleine Conscience', description: 'Apprenez à méditer efficacement en 30 jours.',
                status: 'published', price_cents: 9700, students_count: 24, modules_count: 5, emoji: '🧘'
            },
            {
                id: 'mock-2', title: 'Gestion du Stress', description: 'Techniques avancées pour gérer le stress au quotidien.',
                status: 'draft', price_cents: 19700, students_count: 0, modules_count: 3, emoji: '🌿'
            }
        ];
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    return { render, setHandlers, showCreateModal };
})();

if (typeof window !== 'undefined') window.FormationList = FormationList;
