/**
 * JOURNAL PREMIUM UI v4.0
 * Interface utilisateur - Vue dédiée ultra-stylée
 * + Analyse IA Complète (Forces/Faiblesses/Patterns) + Connexion PsychoAudit & Rapports
 */

const JournalPremiumUI = (function() {
    'use strict';

    const CATS = [
        { id: 'task',       icon: '✅', label: 'Tâche' },
        { id: 'idea',       icon: '💡', label: 'Idée' },
        { id: 'win',        icon: '🏆', label: 'Victoire' },
        { id: 'blocker',    icon: '🚧', label: 'Blocage' },
        { id: 'reflection', icon: '🤔', label: 'Réflexion' }
    ];

    const ENERGY = [
        { value: 3, icon: '⚡', label: 'Haute' },
        { value: 2, icon: '😊', label: 'Normal' },
        { value: 1, icon: '😴', label: 'Basse' }
    ];

    let activeTab = 'all';
    let selectedCat = 'task';
    let selectedEnergy = 2;
    let aiInsightLoaded = false;

    /**
     * Render principal (appelé par ViewRouter)
     */
    async function render() {
        const container = document.getElementById('view-journal');
        if (!container) return;

        // Afficher skeleton pendant le chargement
        container.innerHTML = buildSkeleton();

        // Charger les données
        await JournalPremiumCore.loadTodayEntries();
        await JournalPremiumCore.loadWeekData();
        await JournalPremiumCore.calculateStreak();

        container.innerHTML = buildLayout();
        attachEvents(container);
    }

    /**
     * Skeleton loader pendant le chargement
     */
    function buildSkeleton() {
        return `
        <div class="jp-container" style="opacity:0.4;pointer-events:none">
            <header class="jp-header">
                <div class="jp-title-area">
                    <h1>📝 Journal</h1>
                    <div class="jp-date" style="background:#eee;border-radius:4px;width:200px;height:16px"></div>
                </div>
            </header>
            <aside class="jp-sidebar">
                <div style="height:200px;background:var(--card-bg,#f5f5f5);border-radius:12px;margin-bottom:16px"></div>
                <div style="height:100px;background:var(--card-bg,#f5f5f5);border-radius:12px"></div>
            </aside>
            <main class="jp-main">
                <div style="height:60px;background:var(--card-bg,#f5f5f5);border-radius:12px;margin-bottom:16px"></div>
                <div style="height:200px;background:var(--card-bg,#f5f5f5);border-radius:12px"></div>
            </main>
        </div>`;
    }

    /**
     * Construire le layout complet
     */
    function buildLayout() {
        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const quote = JournalPremiumCore.getDailyQuote();
        const stats = JournalPremiumCore.getTodayStats();
        const streak = JournalPremiumCore.state.streak;
        const weekData = JournalPremiumCore.state.weekData;

        const today = new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        return `
        <div class="jp-container">

            <!-- HEADER -->
            <header class="jp-header">
                <div class="jp-header-left">
                    <div class="jp-title-area">
                        <h1>📝 Journal</h1>
                        <div class="jp-date">${today}</div>
                    </div>
                    ${user ? `
                    <div class="jp-user-pill">
                        <span class="avatar">${user.avatar || '👤'}</span>
                        <span class="name">${user.name || 'Vous'}</span>
                        <span class="lock">🔒 Privé</span>
                    </div>` : ''}
                </div>
                <div class="jp-header-right">
                    <div class="jp-streak">
                        <span class="jp-streak-fire">🔥</span>
                        <span class="jp-streak-count">${streak}</span>
                        <div class="jp-streak-label">jour${streak > 1 ? 's' : ''}<br>consécutif${streak > 1 ? 's' : ''}</div>
                    </div>
                    <button class="jp-btn-focus" id="jp-focus-btn">
                        ✨ Mode Focus
                    </button>
                </div>
            </header>

            <!-- SIDEBAR STATS -->
            <aside class="jp-sidebar">
                <div>
                    <div class="jp-section-title">Aujourd'hui</div>
                    <div class="jp-daily-stats">
                        <div class="jp-stat-card">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Entrées</div>
                        </div>
                        <div class="jp-stat-card">
                            <div class="stat-value" style="color:#16a34a">${stats.wins}</div>
                            <div class="stat-label">Victoires</div>
                        </div>
                        <div class="jp-stat-card">
                            <div class="stat-value" style="color:#ca8a04">${stats.ideas}</div>
                            <div class="stat-label">Idées</div>
                        </div>
                        <div class="jp-stat-card">
                            <div class="stat-value" style="color:#dc2626">${stats.blockers}</div>
                            <div class="stat-label">Blocages</div>
                        </div>
                    </div>
                </div>

                <!-- Heatmap 7j -->
                <div>
                    <div class="jp-section-title">Activité 7 jours</div>
                    <div class="jp-heatmap">
                        ${buildHeatmap(weekData)}
                    </div>
                </div>

                <!-- Graphique énergie -->
                <div>
                    <div class="jp-section-title">Énergie cette semaine</div>
                    <div class="jp-energy-bars">
                        ${buildEnergyBars(weekData)}
                    </div>
                </div>

                <!-- Insight IA rapide -->
                <div>
                    <div class="jp-section-title">💡 Insight rapide</div>
                    <div class="jp-quote" id="jp-ai-insight">
                        <span style="opacity:0.5;font-style:italic">
                            ${stats.total >= 2
                                ? '<span id="jp-insight-load-btn" style="cursor:pointer;color:var(--accent)">✨ Analyser ma journée</span>'
                                : 'Ajoutez au moins 2 entrées pour un insight.'}
                        </span>
                    </div>
                </div>

                <!-- Analyse IA Complète -->
                <div>
                    <div class="jp-section-title">🧠 Analyse IA complète</div>
                    <div style="display:flex;flex-direction:column;gap:8px">
                        <button class="jp-analyze-btn" id="jp-full-analysis-btn">
                            🔍 Forces · Faiblesses · Patterns
                        </button>
                        <button class="jp-analyze-btn secondary" id="jp-report-btn">
                            📊 Générer un rapport
                        </button>
                    </div>
                    <div class="jp-analyze-note">Analyse 30 jours · Connexion PsychoAudit</div>
                </div>

                <!-- Citation Maha Giri -->
                <div>
                    <div class="jp-section-title">✦ Maha Giri</div>
                    <div class="jp-quote jp-quote-giri">
                        "${quote.text}"
                        <span class="quote-author">— ${quote.author}</span>
                    </div>
                </div>
            </aside>

            <!-- MAIN -->
            <main class="jp-main">
                <!-- Tabs -->
                <div class="jp-tabs">
                    <button class="jp-tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
                        <span class="tab-icon">📋</span> Tout
                    </button>
                    <button class="jp-tab ${activeTab === 'morning' ? 'active' : ''}" data-tab="morning">
                        <span class="tab-icon">🌅</span> Intentions matin
                    </button>
                    <button class="jp-tab ${activeTab === 'evening' ? 'active' : ''}" data-tab="evening">
                        <span class="tab-icon">🌙</span> Réflexions soir
                    </button>
                </div>

                <!-- Éditeur -->
                <div class="jp-editor">
                    <div class="jp-editor-header">
                        <div class="jp-category-pills">
                            ${CATS.map(c => `
                                <button class="jp-category-pill ${selectedCat === c.id ? 'selected' : ''}"
                                    data-cat="${c.id}">
                                    ${c.icon} ${c.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="jp-textarea-wrap">
                        <textarea class="jp-textarea" id="jp-input"
                            placeholder="${getPlaceholder(activeTab)}"
                            rows="3"></textarea>
                    </div>
                    <div class="jp-editor-footer">
                        <div class="jp-energy-selector">
                            <span>Énergie:</span>
                            ${ENERGY.map(e => `
                                <button class="jp-energy-btn ${selectedEnergy === e.value ? 'selected' : ''}"
                                    data-energy="${e.value}">
                                    ${e.icon} ${e.label}
                                </button>
                            `).join('')}
                        </div>
                        <button class="jp-submit-btn" id="jp-submit">
                            ➕ Ajouter
                        </button>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="jp-timeline" id="jp-timeline">
                    ${buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab))}
                </div>
            </main>
        </div>

        <!-- MODE FOCUS (overlay) -->
        <div class="jp-focus-overlay" id="jp-focus-overlay">
            <div class="jp-focus-title">✨ MODE FOCUS — Écris librement</div>
            <textarea class="jp-focus-textarea" id="jp-focus-input"
                placeholder="Laisse tes pensées s'exprimer..."></textarea>
            <div class="jp-focus-footer">
                <button class="jp-focus-close" id="jp-focus-save">
                    💾 Sauvegarder &amp; Fermer
                </button>
                <span class="jp-focus-esc">ou appuie sur Échap</span>
            </div>
        </div>

        <!-- MODAL ANALYSE IA COMPLÈTE -->
        <div class="jp-analysis-modal" id="jp-analysis-modal">
            <div class="jp-analysis-panel">
                <button class="jp-analysis-close" id="jp-analysis-close">✕</button>
                <div id="jp-analysis-content">
                    <div class="jp-analysis-loading">
                        <div class="jp-analysis-spinner"></div>
                        <p>Analyse de tes 30 derniers jours en cours...</p>
                        <p style="opacity:0.5;font-size:13px">Connexion PsychoAudit · Patterns comportementaux · Forces latentes</p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Construire la heatmap
     */
    function buildHeatmap(weekData) {
        if (!weekData?.length) return '';
        return weekData.map(d => {
            const level = d.count === 0 ? '' :
                          d.count <= 1 ? 'active-1' :
                          d.count <= 2 ? 'active-2' :
                          d.count <= 4 ? 'active-3' : 'active-4';
            return `
                <div class="jp-heatmap-day">
                    <div class="day-label">${d.label}</div>
                    <div class="day-cell ${level} ${d.isToday ? 'today' : ''}"
                         title="${d.count} entrée${d.count > 1 ? 's' : ''}"></div>
                    <div class="day-count">${d.count || ''}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Construire les barres d'énergie
     */
    function buildEnergyBars(weekData) {
        if (!weekData?.length) return '';
        return weekData.map(d => {
            const pct = d.avgEnergy ? Math.round((d.avgEnergy / 3) * 100) : 5;
            const lvl = d.avgEnergy >= 2.5 ? 3 : d.avgEnergy >= 1.5 ? 2 : 1;
            return `<div class="jp-energy-bar level-${lvl}"
                style="height:${pct}%"
                title="${d.label}: ${d.avgEnergy ? d.avgEnergy.toFixed(1) : 'N/A'}"></div>`;
        }).join('');
    }

    /**
     * Construire la timeline
     */
    function buildTimeline(entries) {
        if (!entries?.length) return `
            <div class="jp-timeline-empty">
                <span class="empty-icon">📖</span>
                <h3>Ton journal t'attend</h3>
                <p>Note ta première pensée du jour pour commencer.</p>
            </div>
        `;
        return entries.map((e, i) => {
            const time = e.created_at
                ? new Date(e.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
            const energyIcon = e.energy === 3 ? '⚡' : e.energy === 1 ? '😴' : '😊';
            const isLast = i === entries.length - 1;
            return `
            <div class="jp-entry">
                <div class="jp-entry-indicator">
                    <div class="jp-entry-dot cat-${e.category}">
                        ${CATS.find(c => c.id === e.category)?.icon || '📝'}
                    </div>
                    ${!isLast ? '<div class="jp-entry-line"></div>' : ''}
                </div>
                <div class="jp-entry-content">
                    <div class="jp-entry-top">
                        <div class="jp-entry-meta">
                            <span class="jp-entry-cat-label cat-${e.category}">
                                ${CATS.find(c => c.id === e.category)?.label || 'Note'}
                            </span>
                            <span class="jp-entry-time">${time}</span>
                        </div>
                        <div class="jp-entry-actions">
                            <button class="jp-entry-action-btn delete" data-id="${e.id}" title="Supprimer">🗑️</button>
                        </div>
                    </div>
                    <div class="jp-entry-text">${escapeHtml(e.text)}</div>
                    <div class="jp-entry-energy">${energyIcon} Énergie ${e.energy === 3 ? 'haute' : e.energy === 1 ? 'basse' : 'normale'}</div>
                </div>
            </div>
            `;
        }).join('');
    }

    /**
     * Construire le rendu HTML de l'analyse complète
     */
    function buildAnalysisHTML(analysis) {
        if (!analysis) return `
            <div style="text-align:center;padding:40px">
                <p style="opacity:0.6">Pas assez de données (minimum 3 entrées sur 30 jours).</p>
                <p style="opacity:0.4;font-size:13px">Continue à noter tes journées !</p>
            </div>`;

        const energyColor = analysis.score_energie >= 2.5 ? '#16a34a' :
                            analysis.score_energie >= 1.5 ? '#ca8a04' : '#dc2626';
        const energyEmoji = analysis.score_energie >= 2.5 ? '⚡' :
                            analysis.score_energie >= 1.5 ? '😊' : '😴';

        return `
        <div class="jp-analysis-result">
            <div class="jp-analysis-header">
                <h2>🧠 Analyse Journal — 30 jours</h2>
                <div class="jp-analysis-energy">
                    ${energyEmoji} Énergie moyenne :
                    <strong style="color:${energyColor}">${parseFloat(analysis.score_energie).toFixed(1)}/3</strong>
                </div>
            </div>

            ${analysis.message_coach ? `
            <div class="jp-analysis-coach">
                <span class="jp-analysis-coach-icon">✦</span>
                <p>${escapeHtml(analysis.message_coach)}</p>
                <span class="jp-analysis-coach-author">— Maha Giri</span>
            </div>` : ''}

            <div class="jp-analysis-grid">
                <div class="jp-analysis-section forces">
                    <div class="jp-analysis-section-title">💪 Tes forces</div>
                    <ul>
                        ${(analysis.forces || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
                <div class="jp-analysis-section faiblesses">
                    <div class="jp-analysis-section-title">🎯 Tes défis</div>
                    <ul>
                        ${(analysis.faiblesses || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="jp-analysis-section patterns">
                <div class="jp-analysis-section-title">🔄 Patterns observés</div>
                <ul>
                    ${(analysis.patterns || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
            </div>

            <div class="jp-analysis-section recommandations">
                <div class="jp-analysis-section-title">🚀 Recommandations</div>
                <ul>
                    ${(analysis.recommandations || []).map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
            </div>

            ${analysis.lien_psychoaudit && analysis.lien_psychoaudit !== 'null' ? `
            <div class="jp-analysis-section psychoaudit">
                <div class="jp-analysis-section-title">🧬 Connexion PsychoAudit</div>
                <p>${escapeHtml(analysis.lien_psychoaudit)}</p>
                <button class="jp-analysis-link-btn" onclick="ViewRouter && ViewRouter.navigate('psychoAudit'); document.getElementById('jp-analysis-modal').classList.remove('active');">
                    Ouvrir PsychoAudit →
                </button>
            </div>` : ''}

            <div class="jp-analysis-actions">
                <button class="jp-analysis-action-btn" id="jp-send-to-reports">
                    📊 Envoyer dans Rapports
                </button>
                <button class="jp-analysis-action-btn secondary" onclick="document.getElementById('jp-analysis-modal').classList.remove('active')">
                    Fermer
                </button>
            </div>
        </div>`;
    }

    /**
     * Placeholder selon l'onglet actif
     */
    function getPlaceholder(tab) {
        const placeholders = {
            morning: '🌅 Quelle est mon intention principale pour aujourd\'hui ?',
            evening: '🌙 Qu\'est-ce qui s\'est passé ? Qu\'ai-je appris aujourd\'hui ?',
            all: '📝 Note une victoire, une idée, une réflexion...'
        };
        return placeholders[tab] || placeholders.all;
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = String(text || '');
        return d.innerHTML;
    }

    /**
     * Attacher les événements
     */
    function attachEvents(container) {
        // Tabs
        container.querySelectorAll('.jp-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                container.querySelectorAll('.jp-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const input = container.querySelector('#jp-input');
                if (input) input.placeholder = getPlaceholder(activeTab);
                const timeline = container.querySelector('#jp-timeline');
                if (timeline) timeline.innerHTML = buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab));
            });
        });

        // Catégories
        container.querySelectorAll('.jp-category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                selectedCat = pill.dataset.cat;
                container.querySelectorAll('.jp-category-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
            });
        });

        // Énergie
        container.querySelectorAll('.jp-energy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedEnergy = parseInt(btn.dataset.energy);
                container.querySelectorAll('.jp-energy-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Soumettre
        const submitBtn = container.querySelector('#jp-submit');
        const inputEl = container.querySelector('#jp-input');
        if (submitBtn && inputEl) {
            submitBtn.addEventListener('click', () => submitEntry(inputEl, container));
            inputEl.addEventListener('keydown', e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitEntry(inputEl, container);
            });
        }

        // Supprimer entrée
        container.addEventListener('click', async e => {
            const deleteBtn = e.target.closest('.jp-entry-action-btn.delete');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (!id) return;
                await JournalPremiumCore.deleteEntry(id);
                const timeline = container.querySelector('#jp-timeline');
                if (timeline) timeline.innerHTML = buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab));
                updateStats(container);
            }
        });

        // Mode Focus
        const focusBtn = container.querySelector('#jp-focus-btn');
        const focusOverlay = document.getElementById('jp-focus-overlay');
        if (focusBtn && focusOverlay) {
            focusBtn.addEventListener('click', () => {
                focusOverlay.classList.add('active');
                document.getElementById('jp-focus-input')?.focus();
            });
        }

        const focusSave = document.getElementById('jp-focus-save');
        if (focusSave) {
            focusSave.addEventListener('click', () => saveFocusEntry(container));
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.getElementById('jp-focus-overlay')?.classList.remove('active');
                document.getElementById('jp-analysis-modal')?.classList.remove('active');
            }
        });

        // Insight IA rapide
        const insightBtn = document.getElementById('jp-insight-load-btn');
        if (insightBtn) {
            insightBtn.addEventListener('click', () => loadAiInsight());
        }

        // Analyse IA Complète
        const fullAnalysisBtn = document.getElementById('jp-full-analysis-btn');
        if (fullAnalysisBtn) {
            fullAnalysisBtn.addEventListener('click', () => openFullAnalysis());
        }

        // Fermer modal analyse
        const analysisClose = document.getElementById('jp-analysis-close');
        if (analysisClose) {
            analysisClose.addEventListener('click', () => {
                document.getElementById('jp-analysis-modal')?.classList.remove('active');
            });
        }

        // Bouton rapport
        const reportBtn = document.getElementById('jp-report-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                if (typeof ViewRouter !== 'undefined') {
                    ViewRouter.navigate('reports');
                    if (typeof Toast !== 'undefined') Toast.info('📊 Ouvre ton rapport Journal dans la section Rapports');
                }
            });
        }

        // Click modal backdrop pour fermer
        const modal = document.getElementById('jp-analysis-modal');
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    }

    /**
     * Soumettre une entrée
     */
    async function submitEntry(inputEl, container) {
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.disabled = true;
        const submitBtn = container.querySelector('#jp-submit');
        if (submitBtn) submitBtn.textContent = '⏳ Sauvegarde...';
        try {
            await JournalPremiumCore.addEntry(text, selectedCat, selectedEnergy, activeTab);
            inputEl.value = '';
            const timeline = container.querySelector('#jp-timeline');
            if (timeline) timeline.innerHTML = buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab));
            updateStats(container);
            if (typeof Toast !== 'undefined') Toast.success('Entrée sauvegardée ✅');
            // XP feedback
            if (typeof XPFeedback !== 'undefined') XPFeedback.show(10, 'Journal');
        } catch (e) {
            if (typeof Toast !== 'undefined') Toast.error('Erreur lors de l\'ajout');
        } finally {
            inputEl.disabled = false;
            if (submitBtn) submitBtn.textContent = '➕ Ajouter';
            inputEl.focus();
        }
    }

    /**
     * Sauvegarder une entrée depuis le mode focus
     */
    async function saveFocusEntry(container) {
        const text = document.getElementById('jp-focus-input')?.value?.trim();
        if (text) {
            await JournalPremiumCore.addEntry(text, selectedCat, selectedEnergy, 'general');
            const timeline = container.querySelector('#jp-timeline');
            if (timeline) timeline.innerHTML = buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab));
            updateStats(container);
            if (typeof Toast !== 'undefined') Toast.success('Entrée sauvegardée ✅');
        }
        document.getElementById('jp-focus-overlay')?.classList.remove('active');
        const input = document.getElementById('jp-focus-input');
        if (input) input.value = '';
    }

    /**
     * Mettre à jour les statistiques
     */
    function updateStats(container) {
        const stats = JournalPremiumCore.getTodayStats();
        const cards = container.querySelectorAll('.jp-stat-card .stat-value');
        if (cards[0]) cards[0].textContent = stats.total;
        if (cards[1]) cards[1].textContent = stats.wins;
        if (cards[2]) cards[2].textContent = stats.ideas;
        if (cards[3]) cards[3].textContent = stats.blockers;

        // Mettre à jour le bouton insight si on atteint 2 entrées
        if (stats.total >= 2 && !aiInsightLoaded) {
            const insightBox = document.getElementById('jp-ai-insight');
            if (insightBox && insightBox.querySelector('span[style*="opacity:0.5"]')) {
                insightBox.innerHTML = '<span id="jp-insight-load-btn" style="cursor:pointer;color:var(--accent)">✨ Analyser ma journée</span>';
                const btn = document.getElementById('jp-insight-load-btn');
                if (btn) btn.addEventListener('click', () => loadAiInsight());
            }
        }
    }

    /**
     * Charger l'insight IA rapide
     */
    async function loadAiInsight() {
        const box = document.getElementById('jp-ai-insight');
        if (!box) return;
        aiInsightLoaded = true;
        box.innerHTML = '<span style="opacity:0.5">⏳ Analyse en cours...</span>';
        try {
            const insight = await JournalPremiumCore.generateAiInsight();
            if (insight) {
                box.innerHTML = `<span style="font-style:normal;color:var(--text)">${escapeHtml(insight)}</span>
                    <span class="quote-author">— Maha Giri · IA</span>`;
            } else {
                box.innerHTML = '<span style="opacity:0.5">Ajoutez plus d\'entrées pour un insight.</span>';
                aiInsightLoaded = false;
            }
        } catch (e) {
            box.innerHTML = '<span style="opacity:0.5">IA non disponible.</span>';
            aiInsightLoaded = false;
        }
    }

    /**
     * Ouvrir la modal d'analyse IA complète
     */
    async function openFullAnalysis() {
        const modal = document.getElementById('jp-analysis-modal');
        const content = document.getElementById('jp-analysis-content');
        if (!modal || !content) return;

        // Ouvrir le modal avec spinner
        modal.classList.add('active');
        content.innerHTML = `
            <div class="jp-analysis-loading">
                <div class="jp-analysis-spinner"></div>
                <p>Analyse de tes 30 derniers jours en cours...</p>
                <p style="opacity:0.5;font-size:13px">Connexion PsychoAudit · Patterns comportementaux · Forces latentes</p>
            </div>`;

        try {
            const analysis = await JournalPremiumCore.generateFullAnalysis();
            content.innerHTML = buildAnalysisHTML(analysis);

            // Attacher événement "Envoyer dans Rapports"
            const sendBtn = content.querySelector('#jp-send-to-reports');
            if (sendBtn) {
                sendBtn.addEventListener('click', () => sendToReports(analysis));
            }
        } catch (e) {
            content.innerHTML = `
                <div style="text-align:center;padding:40px">
                    <p style="color:#dc2626">Erreur lors de l'analyse.</p>
                    <p style="opacity:0.5;font-size:13px">${escapeHtml(e.message)}</p>
                </div>`;
        }
    }

    /**
     * Envoyer l'analyse vers la section Rapports
     */
    function sendToReports(analysis) {
        if (!analysis) return;

        // Stocker l'analyse dans AppState pour que Reports puisse la lire
        if (typeof AppState !== 'undefined') {
            AppState.journalAnalysis = {
                timestamp: new Date().toISOString(),
                analysis,
                entries_count: JournalPremiumCore.state.extendedHistory.length
            };
        }

        document.getElementById('jp-analysis-modal')?.classList.remove('active');

        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('reports');
        }

        if (typeof Toast !== 'undefined') {
            setTimeout(() => Toast.success('📊 Analyse journal envoyée dans Rapports !'), 500);
        }
    }

    return { render };
})();

if (typeof window !== 'undefined') window.JournalPremiumUI = JournalPremiumUI;
