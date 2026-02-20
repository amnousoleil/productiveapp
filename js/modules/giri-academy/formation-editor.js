/**
 * FORMATION EDITOR v1.0
 * Éditeur de formation — Modules, Leçons, Drag & Drop
 */

const FormationEditor = (function () {
    'use strict';

    let _formation = null;
    let _modules = [];
    let _dragSrc = null;
    let _onBack = null;

    function setHandlers(handlers) {
        _onBack = handlers.onBack;
    }

    async function render(container, formation) {
        _formation = formation;
        container.innerHTML = `<div class="academy-loading"><div class="academy-spinner"></div><span>Chargement...</span></div>`;

        try {
            const full = await AcademyApi.getFormation(formation.id);
            _formation = full;
            _modules = full.modules || [];
        } catch (e) {
            _modules = formation.modules || [];
        }

        container.innerHTML = _buildHtml();
        _attachEvents(container);
    }

    function _buildHtml() {
        const f = _formation;
        const title = _esc(f.title || f.name || 'Sans titre');
        const status = f.status === 'published' ? 'published' : 'draft';

        return `
        <div class="academy-header">
            <div class="academy-header-left">
                <button class="btn-academy btn-secondary btn-sm" id="btn-back-list">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                <div class="academy-breadcrumb" style="margin:0">
                    <a id="link-back">Formations</a>
                    <span class="breadcrumb-sep">›</span>
                    <span>${title}</span>
                </div>
            </div>
            <div class="academy-header-actions">
                <button class="btn-academy btn-secondary btn-sm" id="btn-settings-formation">⚙️ Paramètres</button>
                <button class="btn-academy ${status === 'published' ? 'btn-danger' : 'btn-success'} btn-sm" id="btn-toggle-publish" data-status="${status}">
                    ${status === 'published' ? '⏸ Dépublier' : '🚀 Publier'}
                </button>
            </div>
        </div>
        <div class="academy-body">
            <div class="editor-layout">
                <div class="editor-main">
                    <!-- Modules & Leçons -->
                    <div class="editor-section">
                        <div class="editor-section-header">
                            <span class="editor-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                Contenu de la formation
                            </span>
                            <button class="btn-academy btn-primary btn-sm" id="btn-add-module">
                                + Ajouter un module
                            </button>
                        </div>
                        <div class="editor-section-body">
                            <div class="modules-list" id="modules-list">
                                ${_buildModulesList()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar paramètres -->
                <div class="editor-sidebar">
                    <div class="editor-section" id="formation-settings-panel">
                        <div class="editor-section-header">
                            <span class="editor-section-title">⚙️ Informations</span>
                        </div>
                        <div class="editor-section-body">
                            <div class="form-group">
                                <label class="form-label">Titre</label>
                                <input type="text" class="form-control" id="f-title" value="${title}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="f-desc" rows="4">${_esc(f.description || '')}</textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Prix (€)</label>
                                <input type="number" class="form-control" id="f-price" value="${f.price_cents ? (f.price_cents / 100).toFixed(2) : 0}" min="0" step="0.01">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Emoji 🎨</label>
                                <input type="text" class="form-control" id="f-emoji" value="${f.emoji || '📚'}" maxlength="2">
                            </div>
                            <button class="btn-academy btn-primary" style="width:100%;justify-content:center" id="btn-save-settings">
                                💾 Enregistrer
                            </button>
                        </div>
                    </div>

                    <div class="editor-section">
                        <div class="editor-section-header">
                            <span class="editor-section-title">📊 Statistiques rapides</span>
                        </div>
                        <div class="editor-section-body">
                            <div style="display:flex;flex-direction:column;gap:12px">
                                <div style="display:flex;justify-content:space-between;font-size:14px">
                                    <span style="color:var(--text-muted)">Modules</span>
                                    <strong id="stat-modules">${_modules.length}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:14px">
                                    <span style="color:var(--text-muted)">Leçons</span>
                                    <strong id="stat-lessons">${_modules.reduce((n, m) => n + (m.lessons?.length || 0), 0)}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:14px">
                                    <span style="color:var(--text-muted)">Étudiants</span>
                                    <strong>${_formation.students_count || 0}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:14px">
                                    <span style="color:var(--text-muted)">Revenus</span>
                                    <strong style="color:#a78bfa">${_formation.revenue_cents ? ((_formation.revenue_cents / 100).toFixed(0) + ' €') : '0 €'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function _buildModulesList() {
        if (_modules.length === 0) {
            return `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:14px">
                <p style="margin:0 0 8px;font-size:28px">📦</p>
                <p style="margin:0">Aucun module. Cliquez sur "+ Ajouter un module"</p>
            </div>`;
        }
        return _modules.map((mod, idx) => _buildModuleItem(mod, idx)).join('');
    }

    function _buildModuleItem(mod, idx) {
        const lessons = mod.lessons || [];
        const isOpen = idx === 0;
        const dripType = mod.drip_type || 'immediate';
        const dripDays = mod.drip_delay_days || 1;
        const dripAfter = mod.drip_after_module_id || '';

        // Build prerequisite module options (all other modules)
        const otherModules = _modules.filter(m => m.id !== mod.id);
        const modOptions = otherModules.length
            ? otherModules.map(m => `<option value="${m.id}" ${m.id === dripAfter ? 'selected' : ''}>${_esc(m.title || m.name || 'Module')}</option>`).join('')
            : `<option value="">— Aucun module disponible —</option>`;

        return `
        <div class="module-item" draggable="true" data-module-id="${mod.id}" data-idx="${idx}">
            <div class="module-header">
                <span class="module-drag-handle" title="Glisser pour réorganiser">⣿</span>
                <svg class="module-expand-icon ${isOpen ? 'expanded' : ''}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                <input class="module-title-input" type="text" value="${_esc(mod.title || mod.name || 'Module ' + (idx + 1))}" data-module-id="${mod.id}" placeholder="Titre du module...">
                <span class="module-lesson-count">${lessons.length} leçon${lessons.length !== 1 ? 's' : ''}</span>
                <div class="module-actions">
                    <button class="btn-academy btn-secondary btn-icon" title="Supprimer le module" data-action="delete-module" data-module-id="${mod.id}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                </div>
            </div>
            <div class="module-body ${isOpen ? 'open' : ''}">
                <div class="lessons-list" data-module-id="${mod.id}">
                    ${lessons.map((l, li) => _buildLessonItem(l, li)).join('')}
                </div>
                <button class="btn-academy btn-secondary btn-sm" style="width:100%;justify-content:center;margin-top:4px" data-action="add-lesson" data-module-id="${mod.id}">
                    + Ajouter une leçon
                </button>

                <!-- Drip settings panel -->
                <div class="module-drip-panel">
                    <div class="drip-panel-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Déblocage du contenu
                    </div>
                    <select class="drip-type-select form-control form-control-sm" data-module-id="${mod.id}">
                        <option value="immediate" ${dripType === 'immediate' ? 'selected' : ''}>⚡ Immédiat</option>
                        <option value="delay" ${dripType === 'delay' ? 'selected' : ''}>⏱ Après X jours</option>
                        <option value="completion" ${dripType === 'completion' ? 'selected' : ''}>✅ Après un module précédent</option>
                    </select>
                    <div class="drip-delay-row" style="display:${dripType === 'delay' ? 'flex' : 'none'}">
                        <input type="number" class="drip-days-input form-control form-control-sm" value="${dripDays}" min="1" max="365" placeholder="Jours">
                        <span class="drip-days-label">jours après l'inscription</span>
                    </div>
                    <div class="drip-completion-row" style="display:${dripType === 'completion' ? 'block' : 'none'}">
                        <select class="drip-module-select form-control form-control-sm">
                            ${modOptions}
                        </select>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function _buildLessonItem(lesson, idx) {
        const typeIcons = { video: '🎬', text: '📝', pdf: '📄', quiz: '❓' };
        const typeClass = { video: 'type-video', text: 'type-text', pdf: 'type-pdf', quiz: 'type-quiz' };
        const icon = typeIcons[lesson.type] || '📝';
        const cls = typeClass[lesson.type] || 'type-text';
        const duration = lesson.duration_minutes ? `${lesson.duration_minutes} min` : '';

        return `
        <div class="lesson-item" draggable="true" data-lesson-id="${lesson.id}" data-idx="${idx}">
            <span class="lesson-drag-handle">⣿</span>
            <div class="lesson-type-icon ${cls}">${icon}</div>
            <div class="lesson-info">
                <div class="lesson-title">${_esc(lesson.title || 'Leçon ' + (idx + 1))}</div>
                ${duration ? `<div class="lesson-meta">${duration}</div>` : ''}
            </div>
            ${lesson.is_preview ? '<span class="lesson-preview-badge">APERÇU</span>' : ''}
            <div class="lesson-actions">
                <button class="btn-academy btn-secondary btn-icon" title="Modifier" data-action="edit-lesson" data-lesson-id="${lesson.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-academy btn-danger btn-icon" title="Supprimer" data-action="delete-lesson" data-lesson-id="${lesson.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
            </div>
        </div>`;
    }

    function _attachEvents(container) {
        // Back
        container.querySelector('#btn-back-list')?.addEventListener('click', () => _onBack && _onBack());
        container.querySelector('#link-back')?.addEventListener('click', () => _onBack && _onBack());

        // Add module
        container.querySelector('#btn-add-module')?.addEventListener('click', async () => {
            const title = prompt('Titre du module :');
            if (!title?.trim()) return;
            try {
                const mod = await AcademyApi.createModule(_formation.id, { title: title.trim() });
                _modules.push({ ...mod, lessons: [] });
                _refreshModulesList(container);
            } catch (e) {
                // Fallback mock for dev
                _modules.push({ id: 'mod-' + Date.now(), title: title.trim(), lessons: [] });
                _refreshModulesList(container);
            }
        });

        // Save settings
        container.querySelector('#btn-save-settings')?.addEventListener('click', async () => {
            const data = {
                title: container.querySelector('#f-title')?.value.trim(),
                description: container.querySelector('#f-desc')?.value.trim(),
                price_cents: Math.round(parseFloat(container.querySelector('#f-price')?.value || 0) * 100),
                emoji: container.querySelector('#f-emoji')?.value.trim() || '📚'
            };
            try {
                await AcademyApi.updateFormation(_formation.id, data);
                _formation = { ..._formation, ...data };
                const btn = container.querySelector('#btn-save-settings');
                btn.textContent = '✅ Enregistré';
                setTimeout(() => { btn.textContent = '💾 Enregistrer'; }, 2000);
            } catch (e) {
                alert('Erreur: ' + (e.message || ''));
            }
        });

        // Publish toggle
        container.querySelector('#btn-toggle-publish')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const isPublished = btn.dataset.status === 'published';
            try {
                if (isPublished) {
                    await AcademyApi.unpublishFormation(_formation.id);
                } else {
                    await AcademyApi.publishFormation(_formation.id);
                }
                _formation.status = isPublished ? 'draft' : 'published';
                const newStatus = _formation.status;
                btn.dataset.status = newStatus;
                btn.className = `btn-academy ${newStatus === 'published' ? 'btn-danger' : 'btn-success'} btn-sm`;
                btn.textContent = newStatus === 'published' ? '⏸ Dépublier' : '🚀 Publier';
            } catch (e) {
                alert('Erreur: ' + (e.message || ''));
            }
        });

        // Delegated events on modules list
        container.querySelector('#modules-list')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const moduleId = btn.dataset.moduleId;
            const lessonId = btn.dataset.lessonId;

            if (action === 'delete-module') {
                if (!confirm('Supprimer ce module et toutes ses leçons ?')) return;
                try {
                    await AcademyApi.deleteModule(_formation.id, moduleId);
                } catch (e) { /* offline ok */ }
                _modules = _modules.filter(m => m.id !== moduleId);
                _refreshModulesList(container);
            }

            if (action === 'add-lesson') {
                const mod = _modules.find(m => m.id === moduleId);
                if (!mod) return;
                LessonEditor.open(null, async (data) => {
                    const lesson = await _saveLesson(moduleId, null, data);
                    if (!mod.lessons) mod.lessons = [];
                    mod.lessons.push(lesson);
                    _refreshModulesList(container);
                });
            }

            if (action === 'edit-lesson') {
                const mod = _modules.find(m => m.lessons?.some(l => l.id === lessonId));
                const lesson = mod?.lessons?.find(l => l.id === lessonId);
                if (!lesson) return;
                LessonEditor.open(lesson, async (data) => {
                    const updated = await _saveLesson(mod.id, lessonId, data);
                    const idx = mod.lessons.findIndex(l => l.id === lessonId);
                    if (idx !== -1) mod.lessons[idx] = { ...mod.lessons[idx], ...updated };
                    _refreshModulesList(container);
                });
            }

            if (action === 'delete-lesson') {
                if (!confirm('Supprimer cette leçon ?')) return;
                const mod = _modules.find(m => m.lessons?.some(l => l.id === lessonId));
                if (!mod) return;
                try {
                    await AcademyApi.deleteLesson(_formation.id, mod.id, lessonId);
                } catch (e) { /* offline ok */ }
                mod.lessons = mod.lessons.filter(l => l.id !== lessonId);
                _refreshModulesList(container);
            }
        });

        // Module expand/collapse
        container.querySelector('#modules-list')?.addEventListener('click', (e) => {
            const header = e.target.closest('.module-header');
            if (!header || e.target.closest('[data-action]') || e.target.tagName === 'INPUT') return;
            const body = header.nextElementSibling;
            const icon = header.querySelector('.module-expand-icon');
            if (body && body.classList.contains('module-body')) {
                body.classList.toggle('open');
                icon?.classList.toggle('expanded');
            }
        });

        // Module title inline edit
        container.querySelectorAll('.module-title-input').forEach(input => {
            input.addEventListener('blur', async () => {
                const moduleId = input.dataset.moduleId;
                const mod = _modules.find(m => m.id === moduleId);
                if (!mod || mod.title === input.value) return;
                mod.title = input.value;
                try { await AcademyApi.updateModule(_formation.id, moduleId, { title: input.value }); } catch (e) { /* offline ok */ }
            });
        });

        // Drip content events
        _attachDripEvents(container);

        // Drag & drop modules
        _initDragDrop(container);
    }

    async function _saveLesson(moduleId, lessonId, data) {
        try {
            if (lessonId) {
                return await AcademyApi.updateLesson(_formation.id, moduleId, lessonId, data);
            } else {
                return await AcademyApi.createLesson(_formation.id, moduleId, data);
            }
        } catch (e) {
            return { id: 'lesson-' + Date.now(), ...data };
        }
    }

    function _refreshModulesList(container) {
        const list = container.querySelector('#modules-list');
        if (list) list.innerHTML = _buildModulesList();

        const statModules = container.querySelector('#stat-modules');
        const statLessons = container.querySelector('#stat-lessons');
        if (statModules) statModules.textContent = _modules.length;
        if (statLessons) statLessons.textContent = _modules.reduce((n, m) => n + (m.lessons?.length || 0), 0);

        // Re-attach events on new items
        if (list) {
            container.querySelectorAll('.module-title-input').forEach(input => {
                input.addEventListener('blur', async () => {
                    const moduleId = input.dataset.moduleId;
                    const mod = _modules.find(m => m.id === moduleId);
                    if (!mod || mod.title === input.value) return;
                    mod.title = input.value;
                    try { await AcademyApi.updateModule(_formation.id, moduleId, { title: input.value }); } catch (e) { }
                });
            });
            _attachDripEvents(container);
            _initDragDrop(container);
        }
    }

    function _attachDripEvents(container) {
        container.querySelectorAll('.drip-type-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                const moduleId = sel.dataset.moduleId;
                const dripType = sel.value;
                const panel = sel.closest('.module-drip-panel');
                const delayRow = panel.querySelector('.drip-delay-row');
                const completionRow = panel.querySelector('.drip-completion-row');
                const daysInput = panel.querySelector('.drip-days-input');
                const moduleSelect = panel.querySelector('.drip-module-select');

                delayRow.style.display = dripType === 'delay' ? 'flex' : 'none';
                completionRow.style.display = dripType === 'completion' ? 'block' : 'none';

                const mod = _modules.find(m => m.id === moduleId);
                if (mod) mod.drip_type = dripType;

                const data = { drip_type: dripType };
                if (dripType === 'delay') data.drip_delay_days = parseInt(daysInput?.value) || 1;
                if (dripType === 'completion') data.drip_after_module_id = moduleSelect?.value || null;
                if (dripType === 'immediate') { data.drip_delay_days = 0; data.drip_after_module_id = null; }

                try { await AcademyApi.updateModule(_formation.id, moduleId, data); } catch (e) { /* offline ok */ }
            });
        });

        container.querySelectorAll('.drip-days-input').forEach(input => {
            input.addEventListener('change', async () => {
                const panel = input.closest('.module-drip-panel');
                const sel = panel.querySelector('.drip-type-select');
                const moduleId = sel?.dataset.moduleId;
                const days = parseInt(input.value) || 1;
                if (days < 1) input.value = 1;
                const mod = _modules.find(m => m.id === moduleId);
                if (mod) mod.drip_delay_days = days;
                try { await AcademyApi.updateModule(_formation.id, moduleId, { drip_type: 'delay', drip_delay_days: days }); } catch (e) { }
            });
        });

        container.querySelectorAll('.drip-module-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                const panel = sel.closest('.module-drip-panel');
                const typeSel = panel.querySelector('.drip-type-select');
                const moduleId = typeSel?.dataset.moduleId;
                const afterModId = sel.value || null;
                const mod = _modules.find(m => m.id === moduleId);
                if (mod) mod.drip_after_module_id = afterModId;
                try { await AcademyApi.updateModule(_formation.id, moduleId, { drip_type: 'completion', drip_after_module_id: afterModId }); } catch (e) { }
            });
        });
    }

    function _initDragDrop(container) {
        const moduleItems = container.querySelectorAll('.module-item');
        moduleItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                _dragSrc = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                item.classList.add('drag-over');
            });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                if (_dragSrc && _dragSrc !== item) {
                    const list = container.querySelector('#modules-list');
                    const items = [...list.querySelectorAll('.module-item')];
                    const srcIdx = items.indexOf(_dragSrc);
                    const tgtIdx = items.indexOf(item);
                    if (srcIdx < tgtIdx) {
                        list.insertBefore(_dragSrc, item.nextSibling);
                    } else {
                        list.insertBefore(_dragSrc, item);
                    }
                    // Sync _modules order
                    const newOrder = [...list.querySelectorAll('.module-item')].map(el => el.dataset.moduleId);
                    _modules = newOrder.map(id => _modules.find(m => m.id === id)).filter(Boolean);
                    try { await AcademyApi.reorderModules(_formation.id, newOrder); } catch (e) { }
                }
            });
        });
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    return { render, setHandlers };
})();

if (typeof window !== 'undefined') window.FormationEditor = FormationEditor;
