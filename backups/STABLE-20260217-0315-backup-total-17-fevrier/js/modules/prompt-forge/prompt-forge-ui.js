/**
 * PROMPT FORGE - UI v3.0
 * ProductiveApp - Interface WOW : logo réel, catégories auto, bibliothèque organisée
 * Version: 3.0
 */

const PromptForgeUI = (function() {
    'use strict';

    const LOGO_URL = 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png';
    const LOGO_FALLBACK = '/assets/images/logos/logo.svg';

    let currentView = 'forge';
    let selectedIds = new Set();

    /**
     * Rendre la vue principale
     */
    function render() {
        const container = document.getElementById('view-prompt-forge');
        if (!container) {
            console.error('PromptForgeUI: Container #view-prompt-forge not found');
            return;
        }

        container.innerHTML = `
            <div class="prompt-forge-container">
                ${renderHeader()}
                ${renderTabBar()}
                <div class="prompt-forge-content">
                    ${currentView === 'forge' ? renderForgeView() : renderLibraryView()}
                </div>
            </div>
        `;

        attachEvents();
    }

    /**
     * Header avec le VRAI logo + effets glow/aura/rayons
     */
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
                        <img
                            class="pf-logo-img"
                            src="${LOGO_URL}"
                            alt="Prompt Forge"
                            onerror="this.onerror=null;this.src='${LOGO_FALLBACK}'"
                        />
                    </div>
                    <div class="pf-logo-particles">
                        <div class="pf-lp"></div>
                        <div class="pf-lp"></div>
                        <div class="pf-lp"></div>
                        <div class="pf-lp"></div>
                        <div class="pf-lp"></div>
                        <div class="pf-lp"></div>
                    </div>
                </div>
                <h1 class="pf-title">Forge ton Prompt Parfait</h1>
                <p class="pf-subtitle">L'IA détecte ta thématique et classe tout automatiquement</p>
            </div>
        `;
    }

    /**
     * Barre d'onglets
     */
    function renderTabBar() {
        const count = PromptForgeLibrary.getCount();
        return `
            <div class="pf-tabs">
                <button class="pf-tab ${currentView === 'forge' ? 'active' : ''}" data-view="forge">
                    ⚡ Générateur
                </button>
                <button class="pf-tab ${currentView === 'library' ? 'active' : ''}" data-view="library">
                    📚 Bibliothèque${count > 0 ? ` <span class="pf-tab-badge">${count}</span>` : ''}
                </button>
            </div>
        `;
    }

    /**
     * Vue Forge — sans sélection de catégorie (auto-détectée par l'IA)
     */
    function renderForgeView() {
        const state = PromptForgeCore.getState();

        return `
            <div class="pf-forge-view">
                <div class="pf-input-section">
                    <label class="pf-label">Que souhaites-tu obtenir ?</label>
                    <textarea
                        id="pf-user-goal"
                        class="pf-textarea"
                        placeholder="Ex: J'ai envie de créer une stratégie pour gagner de l'argent en ligne avec l'IA..."
                        rows="5"
                    >${escapeHtml(state.userGoal)}</textarea>
                    <p class="pf-hint">✨ La catégorie sera détectée automatiquement par l'IA</p>
                </div>

                <button class="pf-generate-btn" id="pf-generate-btn" ${state.isGenerating ? 'disabled' : ''}>
                    <span class="pf-btn-content">
                        ${state.isGenerating ? '⏳ Génération en cours...' : '⚡ FORGER LE PROMPT IDÉAL'}
                    </span>
                    ${state.isGenerating ? '<span class="pf-btn-spinner"></span>' : ''}
                </button>

                ${state.error ? `<div class="pf-error">❌ ${state.error}</div>` : ''}

                ${state.generatedPrompt ? renderGeneratedPrompt(state.generatedPrompt, state.detectedCategory) : ''}
            </div>
        `;
    }

    /**
     * Section prompt généré avec catégorie détectée
     */
    function renderGeneratedPrompt(prompt, category) {
        const color = PromptForgeCategories.getColorForCategory(category);
        const icon = PromptForgeCategories.getIconForCategory(category);

        return `
            <div class="pf-result-section">
                <div class="pf-result-header">
                    <div class="pf-result-title">
                        <span class="pf-result-icon">🔥</span>
                        <h3>Prompt Forgé</h3>
                        ${category ? `
                            <span class="pf-detected-cat" style="--cat-color: ${color}">
                                ${icon} ${category}
                            </span>
                        ` : ''}
                    </div>
                    <div class="pf-result-actions">
                        <button class="pf-action-btn" id="pf-copy-btn" title="Copier">📋 Copier</button>
                        <button class="pf-action-btn save" id="pf-save-btn" title="Sauvegarder dans la bibliothèque">💾 Sauvegarder</button>
                    </div>
                </div>
                <div class="pf-result-content">
                    <pre class="pf-prompt-text">${escapeHtml(prompt)}</pre>
                </div>
            </div>
        `;
    }

    /**
     * Vue Bibliothèque — groupée par catégories auto-créées
     */
    function renderLibraryView() {
        const groups = PromptForgeLibrary.getGroupedByCategory();
        const total = PromptForgeLibrary.getCount();

        if (total === 0) {
            return `
                <div class="pf-library-empty">
                    <div class="pf-empty-icon">📭</div>
                    <h3>Ta bibliothèque est vide</h3>
                    <p>Génère ton premier prompt et sauvegarde-le — les catégories se créeront automatiquement !</p>
                    <button class="pf-go-forge-btn" id="pf-go-forge">⚡ Créer mon premier prompt</button>
                </div>
            `;
        }

        return `
            <div class="pf-library-view">
                ${selectedIds.size > 0 ? `
                    <div class="pf-mgmt-bar">
                        <span class="pf-mgmt-count">${selectedIds.size} sélectionné(s)</span>
                        <button class="pf-delete-sel" id="pf-delete-selected">🗑️ Supprimer la sélection</button>
                        <button class="pf-cancel-sel" id="pf-cancel-selected">✕ Annuler</button>
                    </div>
                ` : ''}

                ${groups.map(group => renderCategoryGroup(group)).join('')}
            </div>
        `;
    }

    /**
     * Rendre un groupe de catégorie
     */
    function renderCategoryGroup(group) {
        const color = PromptForgeCategories.getColorForCategory(group.name);
        const icon = PromptForgeCategories.getIconForCategory(group.name);
        const allSelected = group.prompts.every(p => selectedIds.has(p.id));

        return `
            <div class="pf-cat-group" style="--group-color: ${color}">
                <div class="pf-group-header">
                    <div class="pf-group-title">
                        <span class="pf-group-dot"></span>
                        <span class="pf-group-icon">${icon}</span>
                        <span class="pf-group-name">${group.name}</span>
                        <span class="pf-group-count">${group.prompts.length}</span>
                    </div>
                    <label class="pf-select-all-label">
                        <input type="checkbox" class="pf-select-all" data-group="${group.name}" ${allSelected ? 'checked' : ''}>
                        <span>Tout sélectionner</span>
                    </label>
                </div>
                <div class="pf-group-cards">
                    ${group.prompts.map(p => renderPromptCard(p, color)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Rendre une card de prompt avec checkbox
     */
    function renderPromptCard(prompt, color) {
        const date = new Date(prompt.createdAt).toLocaleDateString('fr-FR');
        const isSelected = selectedIds.has(prompt.id);

        return `
            <div class="pf-prompt-card ${isSelected ? 'selected' : ''}" data-id="${prompt.id}" style="--cat-color: ${color}">
                <div class="pf-card-select">
                    <input type="checkbox" class="pf-card-check" data-id="${prompt.id}" ${isSelected ? 'checked' : ''}>
                </div>
                <div class="pf-card-body">
                    <div class="pf-card-meta">
                        <span class="pf-card-date">📅 ${date}</span>
                    </div>
                    <h4 class="pf-card-title">${escapeHtml(prompt.userGoal || 'Prompt sans titre')}</h4>
                    <p class="pf-card-preview">${escapeHtml(prompt.prompt.substring(0, 110))}…</p>
                </div>
                <div class="pf-card-actions">
                    <button class="pf-card-btn use" data-action="use" data-id="${prompt.id}">▶ Utiliser</button>
                    <button class="pf-card-btn" data-action="copy" data-id="${prompt.id}">📋 Copier</button>
                    <button class="pf-card-btn danger" data-action="delete" data-id="${prompt.id}">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * Toast de notification
     */
    function showPFToast(message, type) {
        const existing = document.querySelector('.pf-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `pf-toast ${type || 'info'}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => { toast.classList.add('visible'); });
        });

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }

    /**
     * Mettre à jour la barre de gestion (sélection)
     */
    function updateMgmtBar() {
        const bar = document.querySelector('.pf-mgmt-bar');
        const countEl = bar ? bar.querySelector('.pf-mgmt-count') : null;
        if (!bar || !countEl) return;
        if (selectedIds.size > 0) {
            bar.style.display = 'flex';
            countEl.textContent = `${selectedIds.size} sélectionné(s)`;
        } else {
            bar.style.display = 'none';
        }
    }

    /**
     * Attacher les événements
     */
    function attachEvents() {
        // Tabs
        document.querySelectorAll('.pf-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentView = tab.dataset.view;
                render();
            });
        });

        // Bouton "Créer mon premier prompt"
        document.getElementById('pf-go-forge')?.addEventListener('click', () => {
            currentView = 'forge';
            render();
        });

        // Textarea
        const userGoalInput = document.getElementById('pf-user-goal');
        if (userGoalInput) {
            userGoalInput.addEventListener('input', (e) => {
                PromptForgeCore.setUserGoal(e.target.value);
            });
        }

        // Bouton Générer
        const generateBtn = document.getElementById('pf-generate-btn');
        if (generateBtn && userGoalInput) {
            generateBtn.addEventListener('click', async () => {
                const userGoal = userGoalInput.value.trim();
                if (!userGoal) {
                    showPFToast('✍️ Décris ton objectif avant de générer', 'warning');
                    userGoalInput.focus();
                    return;
                }
                await PromptForgeCore.generatePrompt(userGoal);
                render();
            });
        }

        // Copier le prompt généré
        document.getElementById('pf-copy-btn')?.addEventListener('click', async () => {
            const copyBtn = document.getElementById('pf-copy-btn');
            const success = await PromptForgeLibrary.copyToClipboard(PromptForgeCore.state.generatedPrompt);
            if (success) {
                copyBtn.textContent = '✅ Copié !';
                showPFToast('📋 Prompt copié dans le presse-papier !', 'success');
            } else {
                copyBtn.textContent = '❌ Erreur';
                showPFToast('❌ Impossible de copier', 'error');
            }
            setTimeout(() => { copyBtn.textContent = '📋 Copier'; }, 2000);
        });

        // Sauvegarder le prompt généré
        document.getElementById('pf-save-btn')?.addEventListener('click', () => {
            const saveBtn = document.getElementById('pf-save-btn');
            PromptForgeLibrary.savePrompt({
                userGoal: PromptForgeCore.state.userGoal,
                category: PromptForgeCore.state.detectedCategory || 'Général',
                prompt: PromptForgeCore.state.generatedPrompt
            });
            saveBtn.textContent = '✅ Sauvegardé !';
            showPFToast('💾 Prompt sauvegardé dans ta bibliothèque !', 'success');
            setTimeout(() => { saveBtn.textContent = '💾 Sauvegarder'; }, 2500);
        });

        // Sélection "Tout sélectionner" par groupe
        document.querySelectorAll('.pf-select-all').forEach(cb => {
            cb.addEventListener('change', () => {
                const groupName = cb.dataset.group;
                const group = PromptForgeLibrary.getGroupedByCategory().find(g => g.name === groupName);
                if (!group) return;
                group.prompts.forEach(p => {
                    if (cb.checked) selectedIds.add(p.id);
                    else selectedIds.delete(p.id);
                });
                render();
            });
        });

        // Checkbox individuelle
        document.querySelectorAll('.pf-card-check').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) selectedIds.add(cb.dataset.id);
                else selectedIds.delete(cb.dataset.id);
                // Mettre à jour visuel carte
                const card = cb.closest('.pf-prompt-card');
                if (card) card.classList.toggle('selected', cb.checked);
                updateMgmtBar();
            });
        });

        // Supprimer la sélection
        document.getElementById('pf-delete-selected')?.addEventListener('click', () => {
            const count = selectedIds.size;
            if (confirm(`Supprimer ${count} prompt(s) sélectionné(s) ?`)) {
                PromptForgeLibrary.deletePrompts([...selectedIds]);
                selectedIds.clear();
                showPFToast(`🗑️ ${count} prompt(s) supprimé(s)`, 'info');
                render();
            }
        });

        // Annuler la sélection
        document.getElementById('pf-cancel-selected')?.addEventListener('click', () => {
            selectedIds.clear();
            render();
        });

        // Actions sur les cards (utiliser, copier, supprimer)
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const promptData = PromptForgeLibrary.getPromptById(id);
                if (!promptData) return;

                if (action === 'use') {
                    PromptForgeCore.loadFromLibrary(promptData);
                    currentView = 'forge';
                    showPFToast('⚡ Prompt chargé dans la forge !', 'success');
                    render();
                } else if (action === 'copy') {
                    const success = await PromptForgeLibrary.copyToClipboard(promptData.prompt);
                    btn.textContent = success ? '✅ Copié' : '❌ Erreur';
                    if (success) showPFToast('📋 Prompt copié !', 'success');
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

    /**
     * Échapper HTML pour sécurité XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { render };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeUI = PromptForgeUI;
}
