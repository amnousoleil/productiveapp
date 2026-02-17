/**
 * PROMPT FORGE - UI v4.0
 * 4 onglets : Générateur · Exemples · Dialogue IA · Bibliothèque
 * Loading overlay · Prompt éditable
 */

const PromptForgeUI = (function() {
    'use strict';

    const LOGO_URL = 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png';
    const LOGO_FALLBACK = '/assets/images/logos/logo.svg';

    let currentView = 'forge';
    let selectedIds  = new Set();

    function render() {
        const container = document.getElementById('view-prompt-forge');
        if (!container) return;

        container.innerHTML = `
            <div class="prompt-forge-container">
                ${renderHeader()}
                ${renderTabBar()}
                <div class="prompt-forge-content">
                    ${renderCurrentView()}
                </div>
            </div>
        `;
        attachEvents();

        // Post-render hooks
        if (currentView === 'dialogue' && PromptForgeDialogue && PromptForgeDialogue.onAfterRender) {
            PromptForgeDialogue.onAfterRender();
        }
    }

    function renderCurrentView() {
        if (currentView === 'forge')    return renderForgeView();
        if (currentView === 'examples') return PromptForgeExamples ? PromptForgeExamples.renderView() : '<p style="text-align:center;color:var(--text-muted)">Chargement...</p>';
        if (currentView === 'dialogue') return PromptForgeDialogue ? PromptForgeDialogue.renderView() : '<p style="text-align:center;color:var(--text-muted)">Chargement...</p>';
        if (currentView === 'library')  return renderLibraryView();
        return renderForgeView();
    }

    function renderHeader() {
        return `
            <div class="pf-header">
                <div class="pf-logo-container">
                    <div class="pf-logo-aura"></div>
                    <div class="pf-logo-rays"></div>
                    <div class="pf-logo-rays pf-logo-rays-slow"></div>
                    <div class="pf-logo-orbital pf-logo-orbital-1">
                        <div class="pf-logo-electron"></div>
                        <div class="pf-logo-electron"></div>
                    </div>
                    <div class="pf-logo-orbital pf-logo-orbital-2">
                        <div class="pf-logo-electron"></div>
                        <div class="pf-logo-electron"></div>
                    </div>
                    <div class="pf-logo-wrap">
                        <img class="pf-logo-img" src="${LOGO_URL}" alt="Prompt Forge"
                             onerror="this.onerror=null;this.src='${LOGO_FALLBACK}'"/>
                    </div>
                    <div class="pf-logo-particles">
                        <div class="pf-lp"></div><div class="pf-lp"></div>
                        <div class="pf-lp"></div><div class="pf-lp"></div>
                        <div class="pf-lp"></div><div class="pf-lp"></div>
                    </div>
                </div>
                <h1 class="pf-title">Forge ton Prompt Parfait</h1>
                <p class="pf-subtitle">L'IA détecte ta thématique · Dialogue IA inclus · Bibliothèque organisée</p>
            </div>
        `;
    }

    function renderTabBar() {
        const libCount = PromptForgeLibrary.getCount();
        return `
            <div class="pf-tabs">
                <button class="pf-tab ${currentView === 'forge'    ? 'active' : ''}" data-view="forge">⚡ Générateur</button>
                <button class="pf-tab ${currentView === 'examples' ? 'active' : ''}" data-view="examples">🎯 Exemples Élite</button>
                <button class="pf-tab ${currentView === 'dialogue' ? 'active' : ''}" data-view="dialogue">🤖 Dialogue IA</button>
                <button class="pf-tab ${currentView === 'library'  ? 'active' : ''}" data-view="library">
                    📚 Bibliothèque${libCount > 0 ? ` <span class="pf-tab-badge">${libCount}</span>` : ''}
                </button>
            </div>
        `;
    }

    function renderForgeView() {
        const state = PromptForgeCore.getState();
        return `
            <div class="pf-forge-view">
                <div class="pf-input-section" id="pf-input-section">
                    ${state.isGenerating ? renderForgingOverlay() : ''}
                    <label class="pf-label">Que souhaites-tu obtenir ?</label>
                    <textarea id="pf-user-goal" class="pf-textarea"
                        placeholder="Ex: Une stratégie pour lancer mon offre de coaching en ligne et attirer mes 10 premiers clients..."
                        rows="5"
                    >${escapeHtml(state.userGoal)}</textarea>
                    <p class="pf-hint">✨ La thématique sera détectée automatiquement par l'IA</p>
                </div>

                <button class="pf-generate-btn" id="pf-generate-btn" ${state.isGenerating ? 'disabled' : ''}>
                    <span class="pf-btn-content">
                        ${state.isGenerating ? '⚡ Forge en action...' : '⚡ FORGER LE PROMPT IDÉAL'}
                    </span>
                    ${state.isGenerating ? '<span class="pf-btn-spinner"></span>' : ''}
                </button>

                ${state.error ? `<div class="pf-error">❌ ${state.error}</div>` : ''}
                ${state.generatedPrompt ? renderGeneratedPrompt(state.generatedPrompt, state.detectedCategory) : ''}
            </div>
        `;
    }

    function renderForgingOverlay() {
        return `
            <div class="pf-forging-overlay">
                <div class="pf-forging-forge">⚡</div>
                <div class="pf-forging-text">La forge est en action...</div>
                <div class="pf-forging-sparks">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
    }

    function renderGeneratedPrompt(prompt, category) {
        const color = PromptForgeCategories.getColorForCategory(category);
        const icon  = PromptForgeCategories.getIconForCategory(category);
        return `
            <div class="pf-result-section">
                <div class="pf-result-header">
                    <div class="pf-result-title">
                        <span class="pf-result-icon">🔥</span>
                        <h3>Prompt Forgé</h3>
                        ${category ? `<span class="pf-detected-cat" style="--cat-color:${color}">${icon} ${category}</span>` : ''}
                    </div>
                    <div class="pf-result-actions">
                        <button class="pf-action-btn" id="pf-copy-btn">📋 Copier</button>
                        <button class="pf-action-btn save" id="pf-save-btn">💾 Sauvegarder</button>
                        <button class="pf-action-btn launch" id="pf-launch-btn" title="Lancer dans le Dialogue IA">🚀 Lancer l'IA</button>
                    </div>
                </div>
                <div class="pf-result-content">
                    <textarea class="pf-prompt-edit" id="pf-prompt-edit">${escapeHtml(prompt)}</textarea>
                    <p class="pf-edit-note">✏️ Modifie librement le prompt avant de le copier ou lancer</p>
                </div>
            </div>
        `;
    }

    function renderLibraryView() {
        const groups = PromptForgeLibrary.getGroupedByCategory();
        const total  = PromptForgeLibrary.getCount();
        if (total === 0) {
            return `<div class="pf-library-empty">
                <div class="pf-empty-icon">📭</div>
                <h3>Ta bibliothèque est vide</h3>
                <p>Génère ton premier prompt et sauvegarde-le — les catégories se créent automatiquement !</p>
                <button class="pf-go-forge-btn" id="pf-go-forge">⚡ Créer mon premier prompt</button>
            </div>`;
        }
        return `
            <div class="pf-library-view">
                ${selectedIds.size > 0 ? `
                    <div class="pf-mgmt-bar">
                        <span class="pf-mgmt-count">${selectedIds.size} sélectionné(s)</span>
                        <button class="pf-delete-sel" id="pf-delete-selected">🗑️ Supprimer la sélection</button>
                        <button class="pf-cancel-sel" id="pf-cancel-selected">✕ Annuler</button>
                    </div>` : ''}
                ${groups.map(g => renderCategoryGroup(g)).join('')}
            </div>
        `;
    }

    function renderCategoryGroup(group) {
        const color = PromptForgeCategories.getColorForCategory(group.name);
        const icon  = PromptForgeCategories.getIconForCategory(group.name);
        const allSel = group.prompts.every(p => selectedIds.has(p.id));
        return `
            <div class="pf-cat-group" style="--group-color:${color}">
                <div class="pf-group-header">
                    <div class="pf-group-title">
                        <span class="pf-group-dot"></span>
                        <span class="pf-group-icon">${icon}</span>
                        <span class="pf-group-name">${group.name}</span>
                        <span class="pf-group-count">${group.prompts.length}</span>
                    </div>
                    <label class="pf-select-all-label">
                        <input type="checkbox" class="pf-select-all" data-group="${group.name}" ${allSel ? 'checked' : ''}>
                        <span>Tout sélectionner</span>
                    </label>
                </div>
                <div class="pf-group-cards">
                    ${group.prompts.map(p => renderPromptCard(p, color)).join('')}
                </div>
            </div>
        `;
    }

    function renderPromptCard(prompt, color) {
        const date = new Date(prompt.createdAt).toLocaleDateString('fr-FR');
        const isSel = selectedIds.has(prompt.id);
        return `
            <div class="pf-prompt-card ${isSel ? 'selected' : ''}" data-id="${prompt.id}" style="--cat-color:${color}">
                <div class="pf-card-select">
                    <input type="checkbox" class="pf-card-check" data-id="${prompt.id}" ${isSel ? 'checked' : ''}>
                </div>
                <div class="pf-card-body">
                    <div class="pf-card-meta"><span class="pf-card-date">📅 ${date}</span></div>
                    <h4 class="pf-card-title">${escapeHtml(prompt.userGoal || 'Prompt sans titre')}</h4>
                    <p class="pf-card-preview">${escapeHtml(prompt.prompt.substring(0, 110))}…</p>
                </div>
                <div class="pf-card-actions">
                    <button class="pf-card-btn use"    data-action="use"    data-id="${prompt.id}">▶ Utiliser</button>
                    <button class="pf-card-btn"        data-action="copy"   data-id="${prompt.id}">📋 Copier</button>
                    <button class="pf-card-btn danger" data-action="delete" data-id="${prompt.id}">🗑️</button>
                </div>
            </div>
        `;
    }

    function showPFToast(message, type) {
        const old = document.querySelector('.pf-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = `pf-toast ${type || 'info'}`;
        t.textContent = message;
        document.body.appendChild(t);
        requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('visible')));
        setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 2800);
    }

    function attachEvents() {
        // Tabs
        document.querySelectorAll('.pf-tab').forEach(tab => {
            tab.addEventListener('click', () => { currentView = tab.dataset.view; render(); });
        });

        // Go forge button (empty library)
        document.getElementById('pf-go-forge')?.addEventListener('click', () => { currentView = 'forge'; render(); });

        // Textarea input
        const goalInput = document.getElementById('pf-user-goal');
        goalInput?.addEventListener('input', e => PromptForgeCore.setUserGoal(e.target.value));

        // Prompt edit textarea — sync live
        const editTA = document.getElementById('pf-prompt-edit');
        editTA?.addEventListener('input', e => { PromptForgeCore.state.generatedPrompt = e.target.value; });

        // Generate
        document.getElementById('pf-generate-btn')?.addEventListener('click', async () => {
            const goal = goalInput?.value.trim();
            if (!goal) { showPFToast('✍️ Décris ton objectif avant de forger', 'warning'); goalInput?.focus(); return; }
            await PromptForgeCore.generatePrompt(goal);
            render();
        });

        // Copy
        document.getElementById('pf-copy-btn')?.addEventListener('click', async () => {
            const btn = document.getElementById('pf-copy-btn');
            const text = document.getElementById('pf-prompt-edit')?.value || PromptForgeCore.state.generatedPrompt;
            const ok = await PromptForgeLibrary.copyToClipboard(text);
            btn.textContent = ok ? '✅ Copié !' : '❌ Erreur';
            if (ok) showPFToast('📋 Prompt copié !', 'success');
            setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000);
        });

        // Save
        document.getElementById('pf-save-btn')?.addEventListener('click', () => {
            const btn = document.getElementById('pf-save-btn');
            const text = document.getElementById('pf-prompt-edit')?.value || PromptForgeCore.state.generatedPrompt;
            PromptForgeLibrary.savePrompt({
                userGoal: PromptForgeCore.state.userGoal,
                category: PromptForgeCore.state.detectedCategory || 'Général',
                prompt: text
            });
            btn.textContent = '✅ Sauvegardé !';
            showPFToast('💾 Sauvegardé dans ta bibliothèque !', 'success');
            setTimeout(() => { btn.textContent = '💾 Sauvegarder'; }, 2500);
        });

        // Launch in Dialogue
        document.getElementById('pf-launch-btn')?.addEventListener('click', () => {
            const text = document.getElementById('pf-prompt-edit')?.value || PromptForgeCore.state.generatedPrompt;
            if (PromptForgeDialogue) {
                PromptForgeDialogue.importPrompt(text);
                currentView = 'dialogue';
                render();
                showPFToast('🚀 Prompt lancé dans le Dialogue IA !', 'success');
            }
        });

        // Example use buttons
        document.querySelectorAll('.pf-example-use-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                PromptForgeCore.state.generatedPrompt = prompt;
                PromptForgeCore.state.detectedCategory = btn.dataset.category || '';
                currentView = 'forge';
                render();
                showPFToast('🎯 Exemple chargé dans la forge !', 'success');
            });
        });

        // Example card toggles
        document.querySelectorAll('.pf-example-card-header').forEach(h => {
            h.addEventListener('click', e => {
                if (e.target.closest('.pf-example-use-btn')) return;
                h.closest('.pf-example-card').classList.toggle('open');
            });
        });

        // Dialogue events
        if (PromptForgeDialogue && currentView === 'dialogue') {
            PromptForgeDialogue.attachEvents(render, showPFToast);
        }

    // Examples events
    if (PromptForgeExamples && currentView === 'examples') {
        PromptForgeExamples.attachEvents(render);
    }

        // Library selection
        document.querySelectorAll('.pf-select-all').forEach(cb => {
            cb.addEventListener('change', () => {
                const g = PromptForgeLibrary.getGroupedByCategory().find(g => g.name === cb.dataset.group);
                if (!g) return;
                g.prompts.forEach(p => { cb.checked ? selectedIds.add(p.id) : selectedIds.delete(p.id); });
                render();
            });
        });
        document.querySelectorAll('.pf-card-check').forEach(cb => {
            cb.addEventListener('change', () => {
                cb.checked ? selectedIds.add(cb.dataset.id) : selectedIds.delete(cb.dataset.id);
                cb.closest('.pf-prompt-card')?.classList.toggle('selected', cb.checked);
                const bar = document.querySelector('.pf-mgmt-bar');
                const cnt = document.querySelector('.pf-mgmt-count');
                if (bar) { bar.style.display = selectedIds.size > 0 ? 'flex' : 'none'; }
                if (cnt) cnt.textContent = `${selectedIds.size} sélectionné(s)`;
            });
        });
        document.getElementById('pf-delete-selected')?.addEventListener('click', () => {
            const n = selectedIds.size;
            if (confirm(`Supprimer ${n} prompt(s) ?`)) {
                PromptForgeLibrary.deletePrompts([...selectedIds]);
                selectedIds.clear();
                showPFToast(`🗑️ ${n} prompt(s) supprimé(s)`, 'info');
                render();
            }
        });
        document.getElementById('pf-cancel-selected')?.addEventListener('click', () => { selectedIds.clear(); render(); });

        // Card actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const { action, id } = btn.dataset;
                const pd = PromptForgeLibrary.getPromptById(id);
                if (!pd) return;
                if (action === 'use') {
                    PromptForgeCore.loadFromLibrary(pd);
                    currentView = 'forge';
                    showPFToast('⚡ Prompt chargé dans la forge !', 'success');
                    render();
                } else if (action === 'copy') {
                    const ok = await PromptForgeLibrary.copyToClipboard(pd.prompt);
                    btn.textContent = ok ? '✅ Copié' : '❌';
                    if (ok) showPFToast('📋 Prompt copié !', 'success');
                    setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000);
                } else if (action === 'delete') {
                    if (confirm('Supprimer ce prompt ?')) {
                        PromptForgeLibrary.deletePrompt(id);
                        selectedIds.delete(id);
                        showPFToast('🗑️ Prompt supprimé', 'info');
                        render();
                    }
                }
            });
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function switchView(view) { currentView = view; render(); }

    return { render, showPFToast, switchView };
})();

if (typeof window !== 'undefined') window.PromptForgeUI = PromptForgeUI;
