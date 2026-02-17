/**
 * PROMPT FORGE - UI
 * ProductiveApp - Interface utilisateur (Thème Soleil)
 * Version: 1.0
 */

const PromptForgeUI = (function() {
    'use strict';

    let currentView = 'forge'; // 'forge' ou 'library'
    let currentFilter = 'all';

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
     * Rendre le header avec le soleil
     */
    function renderHeader() {
        return `
            <div class="pf-header">
                <div class="pf-sun-container">
                    <div class="pf-sun-rays"></div>
                    <div class="pf-sun-core">
                        <div class="pf-sun-glow"></div>
                        <div class="pf-sun-center">☀️</div>
                    </div>
                    <div class="pf-orbital pf-orbital-1"><span class="pf-electron"></span></div>
                    <div class="pf-orbital pf-orbital-2"><span class="pf-electron"></span></div>
                    <div class="pf-sun-shimmer"></div>
                </div>
                <h1 class="pf-title">Forge ton Prompt Parfait</h1>
                <p class="pf-subtitle">Génère des prompts de niveau élite pour l'IA</p>
            </div>
        `;
    }

    /**
     * Rendre la barre d'onglets
     */
    function renderTabBar() {
        return `
            <div class="pf-tabs">
                <button class="pf-tab ${currentView === 'forge' ? 'active' : ''}" data-view="forge">
                    ⚡ Générateur
                </button>
                <button class="pf-tab ${currentView === 'library' ? 'active' : ''}" data-view="library">
                    📚 Bibliothèque (${PromptForgeLibrary.getCount()})
                </button>
            </div>
        `;
    }

    /**
     * Rendre la vue Forge (génération)
     */
    function renderForgeView() {
        const state = PromptForgeCore.getState();
        const categories = PromptForgeCategories.getAll();

        return `
            <div class="pf-forge-view">
                <div class="pf-input-section">
                    <label class="pf-label">Que souhaites-tu obtenir ?</label>
                    <textarea
                        id="pf-user-goal"
                        class="pf-textarea"
                        placeholder="Ex: Créer un prompt pour analyser la psychologie d'un personnage historique..."
                        rows="4"
                    >${state.userGoal}</textarea>
                </div>

                <div class="pf-category-section">
                    <label class="pf-label">Catégorie :</label>
                    <div class="pf-category-pills">
                        ${categories.map(cat => `
                            <button
                                class="pf-category-pill ${state.selectedCategory === cat.id ? 'active' : ''}"
                                data-category="${cat.id}"
                                style="--cat-color: ${cat.color}"
                            >
                                <span class="pf-cat-icon">${cat.icon}</span>
                                <span class="pf-cat-name">${cat.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <button class="pf-generate-btn" id="pf-generate-btn" ${state.isGenerating ? 'disabled' : ''}>
                    ${state.isGenerating ? '⏳ Génération en cours...' : '⚡ GÉNÉRER LE PROMPT IDÉAL'}
                </button>

                ${state.error ? `<div class="pf-error">❌ ${state.error}</div>` : ''}

                ${state.generatedPrompt ? renderGeneratedPrompt(state.generatedPrompt) : ''}
            </div>
        `;
    }

    /**
     * Rendre le prompt généré
     */
    function renderGeneratedPrompt(prompt) {
        return `
            <div class="pf-result-section">
                <div class="pf-result-header">
                    <h3>🔥 Ton Prompt Forgé</h3>
                    <div class="pf-result-actions">
                        <button class="pf-action-btn" id="pf-copy-btn" title="Copier">📋</button>
                        <button class="pf-action-btn" id="pf-save-btn" title="Sauvegarder">💾</button>
                    </div>
                </div>
                <div class="pf-result-content">
                    <pre class="pf-prompt-text">${escapeHtml(prompt)}</pre>
                </div>
            </div>
        `;
    }

    /**
     * Rendre la vue Bibliothèque
     */
    function renderLibraryView() {
        const categories = PromptForgeCategories.getAll();
        const prompts = currentFilter === 'all'
            ? PromptForgeLibrary.getAllPrompts()
            : PromptForgeLibrary.filterByCategory(currentFilter);

        return `
            <div class="pf-library-view">
                <div class="pf-library-filters">
                    <button class="pf-filter-pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                        Tous (${PromptForgeLibrary.getCount()})
                    </button>
                    ${categories.map(cat => {
                        const count = PromptForgeLibrary.filterByCategory(cat.id).length;
                        return `
                            <button
                                class="pf-filter-pill ${currentFilter === cat.id ? 'active' : ''}"
                                data-filter="${cat.id}"
                                style="--cat-color: ${cat.color}"
                            >
                                ${cat.icon} ${cat.name} (${count})
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="pf-library-grid">
                    ${prompts.length === 0 ? '<p class="pf-empty">📭 Aucun prompt sauvegardé</p>' : ''}
                    ${prompts.map(p => renderPromptCard(p)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Rendre une card de prompt
     */
    function renderPromptCard(prompt) {
        const category = PromptForgeCategories.getById(prompt.category);
        const date = new Date(prompt.createdAt).toLocaleDateString('fr-FR');

        return `
            <div class="pf-prompt-card" data-id="${prompt.id}">
                <div class="pf-card-header">
                    <span class="pf-card-category" style="color: ${category?.color || '#6b7280'}">
                        ${category?.icon || '📝'} ${category?.name || 'Autre'}
                    </span>
                    <span class="pf-card-date">${date}</span>
                </div>
                <div class="pf-card-body">
                    <h4 class="pf-card-title">${escapeHtml(prompt.userGoal || 'Sans titre')}</h4>
                    <p class="pf-card-preview">${escapeHtml(prompt.prompt.substring(0, 120))}...</p>
                </div>
                <div class="pf-card-actions">
                    <button class="pf-card-btn" data-action="copy" data-id="${prompt.id}">📋 Copier</button>
                    <button class="pf-card-btn" data-action="delete" data-id="${prompt.id}">🗑️ Supprimer</button>
                </div>
            </div>
        `;
    }

    /**
     * Attacher les événements
     */
    function attachEvents() {
        // Tab switcher
        document.querySelectorAll('.pf-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentView = tab.dataset.view;
                render();
            });
        });

        // Category pills (Forge)
        document.querySelectorAll('.pf-category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                PromptForgeCore.setCategory(pill.dataset.category);
                render();
            });
        });

        // Generate button
        const generateBtn = document.getElementById('pf-generate-btn');
        const userGoalInput = document.getElementById('pf-user-goal');

        if (generateBtn && userGoalInput) {
            generateBtn.addEventListener('click', async () => {
                const userGoal = userGoalInput.value.trim();
                const category = PromptForgeCore.state.selectedCategory;

                if (!userGoal) {
                    alert('Veuillez décrire votre objectif');
                    return;
                }

                const result = await PromptForgeCore.generatePrompt(userGoal, category);
                render(); // Re-render pour afficher le résultat
            });

            userGoalInput.addEventListener('input', (e) => {
                PromptForgeCore.setUserGoal(e.target.value);
            });
        }

        // Copy & Save buttons
        const copyBtn = document.getElementById('pf-copy-btn');
        const saveBtn = document.getElementById('pf-save-btn');

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const success = await PromptForgeLibrary.copyToClipboard(PromptForgeCore.state.generatedPrompt);
                copyBtn.textContent = success ? '✅' : '❌';
                setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                PromptForgeLibrary.savePrompt({
                    userGoal: PromptForgeCore.state.userGoal,
                    category: PromptForgeCore.state.selectedCategory,
                    prompt: PromptForgeCore.state.generatedPrompt
                });
                saveBtn.textContent = '✅ Sauvegardé';
                setTimeout(() => { saveBtn.textContent = '💾'; }, 2000);
            });
        }

        // Library filters
        document.querySelectorAll('.pf-filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                currentFilter = pill.dataset.filter;
                render();
            });
        });

        // Library card actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'copy') {
                    const prompt = PromptForgeLibrary.getPromptById(id);
                    if (prompt) {
                        const success = await PromptForgeLibrary.copyToClipboard(prompt.prompt);
                        btn.textContent = success ? '✅ Copié' : '❌ Erreur';
                        setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000);
                    }
                } else if (action === 'delete') {
                    if (confirm('Supprimer ce prompt ?')) {
                        PromptForgeLibrary.deletePrompt(id);
                        render();
                    }
                }
            });
        });
    }

    /**
     * Échapper HTML pour sécurité
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        render
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeUI = PromptForgeUI;
}
