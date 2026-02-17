/**
 * JOURNAL PREMIUM UI v5.0
 * Navigation temporelle + IA Maha Giri contextuelle + Patterns + Victories Vault
 * Résolution de problèmes profonds via l'écriture intelligente
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

    // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────

    async function render() {
        const container = document.getElementById('view-journal');
        if (!container) return;

        container.innerHTML = buildSkeleton();

        await JournalPremiumCore.loadEntriesForDate(JournalPremiumCore.state.currentDate);
        await JournalPremiumCore.loadWeekData();
        await JournalPremiumCore.calculateStreak();

        container.innerHTML = buildLayout();
        attachEvents(container);
    }

    // ─── SKELETON ────────────────────────────────────────────────────────────

    function buildSkeleton() {
        return `
        <div class="jp-container" style="opacity:0.3;pointer-events:none">
            <div style="height:56px;background:var(--card-bg,#1a1a2e);border-radius:12px;margin-bottom:20px"></div>
            <div class="jp-layout">
                <aside class="jp-sidebar">
                    <div style="height:180px;background:var(--card-bg,#1a1a2e);border-radius:12px;margin-bottom:16px"></div>
                    <div style="height:120px;background:var(--card-bg,#1a1a2e);border-radius:12px"></div>
                </aside>
                <main class="jp-main">
                    <div style="height:60px;background:var(--card-bg,#1a1a2e);border-radius:12px;margin-bottom:16px"></div>
                    <div style="height:300px;background:var(--card-bg,#1a1a2e);border-radius:12px"></div>
                </main>
            </div>
        </div>`;
    }

    // ─── LAYOUT COMPLET ───────────────────────────────────────────────────────

    function buildLayout() {
        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const quote = JournalPremiumCore.getDailyQuote();
        const stats = JournalPremiumCore.getTodayStats();
        const streak = JournalPremiumCore.state.streak;
        const weekData = JournalPremiumCore.state.weekData;
        const currentDate = JournalPremiumCore.state.currentDate;
        const isToday = JournalPremiumCore.isToday();

        const dateLabel = JournalPremiumCore.formatDateLabel(currentDate);
        const fullDate = new Date(currentDate + 'T12:00:00').toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        return `
        <div class="jp-container">

            <!-- ═══ NAVIGATION TEMPORELLE ═══ -->
            <nav class="jp-nav">
                <div class="jp-nav-left">
                    <button class="jp-nav-btn" id="jp-prev-day" title="Jour précédent">‹</button>
                    <div class="jp-nav-date-group">
                        <div class="jp-nav-label">${dateLabel}</div>
                        <div class="jp-nav-full-date">${fullDate}</div>
                    </div>
                    <button class="jp-nav-btn ${isToday ? 'disabled' : ''}" id="jp-next-day"
                        ${isToday ? 'disabled' : ''} title="Jour suivant">›</button>
                </div>
                <div class="jp-nav-center">
                    ${buildMiniWeek(weekData, currentDate)}
                </div>
                <div class="jp-nav-right">
                    <div class="jp-streak-pill" title="${streak} jour${streak > 1 ? 's' : ''} consécutif${streak > 1 ? 's' : ''}">
                        🔥 ${streak}j
                    </div>
                    ${!isToday ? `<button class="jp-today-btn" id="jp-go-today">Aujourd'hui</button>` : ''}
                    <button class="jp-btn-focus-mini" id="jp-focus-btn" title="Mode focus écriture">✨</button>
                </div>
            </nav>

            <!-- ═══ LAYOUT PRINCIPAL ═══ -->
            <div class="jp-layout">

                <!-- ═══ SIDEBAR GAUCHE ═══ -->
                <aside class="jp-sidebar">

                    <!-- Stats du jour -->
                    <div class="jp-card">
                        <div class="jp-card-title">${isToday ? "Aujourd'hui" : dateLabel}</div>
                        <div class="jp-daily-stats">
                            <div class="jp-stat-card">
                                <div class="stat-value">${stats.total}</div>
                                <div class="stat-label">Entrées</div>
                            </div>
                            <div class="jp-stat-card wins">
                                <div class="stat-value">${stats.wins}</div>
                                <div class="stat-label">Victoires</div>
                            </div>
                            <div class="jp-stat-card ideas">
                                <div class="stat-value">${stats.ideas}</div>
                                <div class="stat-label">Idées</div>
                            </div>
                            <div class="jp-stat-card blockers">
                                <div class="stat-value">${stats.blockers}</div>
                                <div class="stat-label">Blocages</div>
                            </div>
                        </div>
                    </div>

                    <!-- Heatmap 7j cliquable -->
                    <div class="jp-card">
                        <div class="jp-card-title">Activité 7 jours</div>
                        <div class="jp-heatmap">
                            ${buildHeatmap(weekData, currentDate)}
                        </div>
                    </div>

                    <!-- Énergie -->
                    <div class="jp-card">
                        <div class="jp-card-title">Énergie semaine</div>
                        <div class="jp-energy-chart">
                            ${buildEnergyBars(weekData)}
                        </div>
                    </div>

                    <!-- IA Tools -->
                    <div class="jp-card">
                        <div class="jp-card-title">🧠 Intelligence</div>
                        <div class="jp-ia-tools">
                            <button class="jp-ia-btn" id="jp-patterns-btn">
                                🔁 Détecter mes patterns
                            </button>
                            <button class="jp-ia-btn" id="jp-full-analysis-btn">
                                🔍 Analyse 30 jours
                            </button>
                            <button class="jp-ia-btn secondary" id="jp-report-btn">
                                📊 Générer rapport
                            </button>
                            <button class="jp-ia-btn victories" id="jp-victories-btn">
                                🏆 Mes victoires (${stats.wins})
                            </button>
                        </div>
                        <div class="jp-analyze-note">Connecté · PsychoAudit · Historique</div>
                    </div>

                    <!-- Citation Maha Giri -->
                    <div class="jp-card jp-quote-card">
                        <div class="jp-card-title">✦ Maha Giri</div>
                        <div class="jp-quote-giri">
                            "${quote.text}"
                            <span class="quote-author">— ${quote.author}</span>
                        </div>
                    </div>

                </aside>

                <!-- ═══ MAIN CONTENT ═══ -->
                <main class="jp-main">

                    <!-- Tabs -->
                    <div class="jp-tabs">
                        <button class="jp-tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
                            📋 Tout
                        </button>
                        <button class="jp-tab ${activeTab === 'morning' ? 'active' : ''}" data-tab="morning">
                            🌅 Matin
                        </button>
                        <button class="jp-tab ${activeTab === 'evening' ? 'active' : ''}" data-tab="evening">
                            🌙 Soir
                        </button>
                    </div>

                    <!-- Éditeur (seulement si c'est aujourd'hui ou si on veut ajouter à un jour passé) -->
                    <div class="jp-editor">
                        <div class="jp-category-pills">
                            ${CATS.map(c => `
                                <button class="jp-category-pill ${selectedCat === c.id ? 'selected' : ''}"
                                    data-cat="${c.id}" title="${c.label}">
                                    ${c.icon} ${c.label}
                                </button>
                            `).join('')}
                        </div>
                        <div class="jp-textarea-wrap">
                            <textarea class="jp-textarea" id="jp-input"
                                placeholder="${getPlaceholder(activeTab)}"
                                rows="3"></textarea>
                        </div>
                        <div class="jp-editor-footer">
                            <div class="jp-energy-selector">
                                <span class="jp-energy-label">Énergie :</span>
                                ${ENERGY.map(e => `
                                    <button class="jp-energy-btn ${selectedEnergy === e.value ? 'selected' : ''}"
                                        data-energy="${e.value}" title="${e.label}">
                                        ${e.icon}
                                    </button>
                                `).join('')}
                            </div>
                            <button class="jp-submit-btn" id="jp-submit">
                                ➕ Ajouter
                            </button>
                        </div>
                    </div>

                    <!-- Zone réponse IA après soumission -->
                    <div class="jp-ai-response-zone" id="jp-ai-response-zone" style="display:none">
                        <div class="jp-ai-response-inner">
                            <div class="jp-ai-response-avatar">MG</div>
                            <div class="jp-ai-response-bubble" id="jp-ai-response-text">
                                <div class="jp-ai-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="jp-timeline" id="jp-timeline">
                        ${buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab))}
                    </div>

                </main>
            </div>
        </div>

        <!-- ═══ MODE FOCUS ═══ -->
        <div class="jp-focus-overlay" id="jp-focus-overlay">
            <div class="jp-focus-header">
                <span class="jp-focus-title">✨ MODE FOCUS</span>
                <span class="jp-focus-sub">Écris librement. Sauve avec Ctrl+Enter.</span>
            </div>
            <textarea class="jp-focus-textarea" id="jp-focus-input"
                placeholder="Laisse tes pensées s'exprimer sans filtre..."></textarea>
            <div class="jp-focus-footer">
                <button class="jp-focus-close" id="jp-focus-save">💾 Sauvegarder</button>
                <span class="jp-focus-esc">Échap pour fermer</span>
            </div>
        </div>

        <!-- ═══ MODAL PATTERNS IA ═══ -->
        <div class="jp-modal-overlay" id="jp-patterns-modal">
            <div class="jp-modal-panel">
                <button class="jp-modal-close" id="jp-patterns-close">✕</button>
                <h2 class="jp-modal-title">🔁 Tes Patterns</h2>
                <div id="jp-patterns-content">
                    <div class="jp-loading-state">
                        <div class="jp-spinner"></div>
                        <p>Analyse de tes schémas comportementaux...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ MODAL ANALYSE COMPLÈTE ═══ -->
        <div class="jp-modal-overlay" id="jp-analysis-modal">
            <div class="jp-modal-panel">
                <button class="jp-modal-close" id="jp-analysis-close">✕</button>
                <div id="jp-analysis-content">
                    <div class="jp-loading-state">
                        <div class="jp-spinner"></div>
                        <p>Analyse de tes 30 derniers jours...</p>
                        <p class="jp-loading-sub">Forces · Faiblesses · Connexion PsychoAudit</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ MODAL VICTORIES VAULT ═══ -->
        <div class="jp-modal-overlay" id="jp-victories-modal">
            <div class="jp-modal-panel">
                <button class="jp-modal-close" id="jp-victories-close">✕</button>
                <h2 class="jp-modal-title">🏆 Victories Vault</h2>
                <p class="jp-modal-sub">Toutes tes victoires des 30 derniers jours</p>
                <div id="jp-victories-content">
                    <div class="jp-loading-state">
                        <div class="jp-spinner"></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ─── MINI SEMAINE CLIQUABLE ───────────────────────────────────────────────

    function buildMiniWeek(weekData, currentDate) {
        if (!weekData?.length) return '';
        return `<div class="jp-mini-week">
            ${weekData.map(d => `
                <div class="jp-mini-day ${d.date === currentDate ? 'selected' : ''} ${d.count > 0 ? 'has-entries' : ''} ${d.isToday ? 'is-today' : ''}"
                     data-date="${d.date}" title="${d.count} entrée${d.count !== 1 ? 's' : ''} — ${d.label}">
                    <div class="jp-mini-day-label">${d.label}</div>
                    <div class="jp-mini-day-dot ${d.count > 0 ? 'filled' : ''}"></div>
                    <div class="jp-mini-day-num">${new Date(d.date + 'T12:00:00').getDate()}</div>
                </div>
            `).join('')}
        </div>`;
    }

    // ─── HEATMAP CLIQUABLE ────────────────────────────────────────────────────

    function buildHeatmap(weekData, currentDate) {
        if (!weekData?.length) return '';
        return weekData.map(d => {
            const level = d.count === 0 ? 0 : d.count <= 1 ? 1 : d.count <= 2 ? 2 : d.count <= 4 ? 3 : 4;
            const isSelected = d.date === currentDate;
            return `
                <div class="jp-heatmap-day ${isSelected ? 'selected' : ''}" data-date="${d.date}">
                    <div class="day-label">${d.label}</div>
                    <div class="day-cell active-${level} ${d.isToday ? 'today' : ''}"
                         title="${d.count} entrée${d.count > 1 ? 's' : ''}"></div>
                    <div class="day-count">${d.count || ''}</div>
                </div>
            `;
        }).join('');
    }

    // ─── BARRES ÉNERGIE ───────────────────────────────────────────────────────

    function buildEnergyBars(weekData) {
        if (!weekData?.length) return '';
        return `<div class="jp-energy-bars-wrap">
            ${weekData.map(d => {
                const pct = d.avgEnergy ? Math.round((d.avgEnergy / 3) * 100) : 5;
                const lvl = d.avgEnergy >= 2.5 ? 3 : d.avgEnergy >= 1.5 ? 2 : 1;
                return `<div class="jp-energy-col">
                    <div class="jp-energy-bar level-${lvl}" style="height:${pct}%"
                         title="${d.label}: ${d.avgEnergy ? d.avgEnergy.toFixed(1) : 'N/A'}/3"></div>
                    <div class="jp-energy-label-small">${d.label}</div>
                </div>`;
            }).join('')}
        </div>`;
    }

    // ─── TIMELINE ─────────────────────────────────────────────────────────────

    function buildTimeline(entries) {
        const isToday = JournalPremiumCore.isToday();
        if (!entries?.length) return `
            <div class="jp-timeline-empty">
                <span class="empty-icon">📖</span>
                <h3>${isToday ? "Ton journal t'attend" : "Aucune entrée ce jour"}</h3>
                <p>${isToday ? 'Commence par noter une pensée, une victoire, un blocage...' : 'Tu n\'as pas écrit ce jour-là.'}</p>
            </div>
        `;
        return entries.map((e, i) => {
            const time = e.created_at
                ? new Date(e.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
            const energyIcon = e.energy === 3 ? '⚡' : e.energy === 1 ? '😴' : '😊';
            const catDef = CATS.find(c => c.id === e.category) || { icon: '📝', label: 'Note' };
            const isLast = i === entries.length - 1;

            return `
            <div class="jp-entry" data-id="${e.id}">
                <div class="jp-entry-indicator">
                    <div class="jp-entry-dot cat-${e.category}">${catDef.icon}</div>
                    ${!isLast ? '<div class="jp-entry-line"></div>' : ''}
                </div>
                <div class="jp-entry-body">
                    <div class="jp-entry-top">
                        <span class="jp-entry-cat-badge cat-${e.category}">${catDef.label}</span>
                        <span class="jp-entry-energy">${energyIcon}</span>
                        ${time ? `<span class="jp-entry-time">${time}</span>` : ''}
                        <button class="jp-entry-delete" data-id="${e.id}" title="Supprimer">×</button>
                    </div>
                    <div class="jp-entry-text">${escapeHtml(e.text)}</div>
                    ${e.ai_response ? `
                    <div class="jp-entry-ai-response">
                        <span class="jp-ai-badge">✦ MG</span>
                        <span>${escapeHtml(e.ai_response)}</span>
                    </div>` : ''}
                </div>
            </div>
            `;
        }).join('');
    }

    // ─── PATTERNS HTML ────────────────────────────────────────────────────────

    function buildPatternsHTML(patterns) {
        if (!patterns) return `<div class="jp-empty-state">Pas assez de données. Continue à noter tes journées !</div>`;

        return `
        <div class="jp-patterns-result">
            ${patterns.alerte ? `
            <div class="jp-pattern-alert">
                ⚠️ ${escapeHtml(patterns.alerte)}
            </div>` : ''}

            ${patterns.force_cachee ? `
            <div class="jp-pattern-force">
                💎 <strong>Force cachée :</strong> ${escapeHtml(patterns.force_cachee)}
            </div>` : ''}

            <div class="jp-patterns-list">
                ${(patterns.patterns || []).map(p => `
                <div class="jp-pattern-item">
                    <div class="jp-pattern-icon">${p.icon || '🔁'}</div>
                    <div class="jp-pattern-content">
                        <div class="jp-pattern-title">${escapeHtml(p.titre)}</div>
                        <div class="jp-pattern-desc">${escapeHtml(p.description)}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    }

    // ─── ANALYSE COMPLÈTE HTML ────────────────────────────────────────────────

    function buildAnalysisHTML(analysis) {
        if (!analysis) return `<div class="jp-empty-state">Pas assez de données (min. 3 entrées sur 30 jours).</div>`;

        const energyColor = analysis.score_energie >= 2.5 ? '#16a34a' :
                            analysis.score_energie >= 1.5 ? '#ca8a04' : '#dc2626';
        const energyEmoji = analysis.score_energie >= 2.5 ? '⚡' :
                            analysis.score_energie >= 1.5 ? '😊' : '😴';

        return `
        <div class="jp-analysis-result">
            <div class="jp-analysis-header">
                <h2>🧠 Analyse — 30 jours</h2>
                <div class="jp-analysis-energy">
                    ${energyEmoji} <strong style="color:${energyColor}">${parseFloat(analysis.score_energie).toFixed(1)}/3</strong> énergie moyenne
                </div>
            </div>

            ${analysis.message_coach ? `
            <div class="jp-analysis-coach">
                <span class="jp-ai-badge-large">✦ MG</span>
                <p>${escapeHtml(analysis.message_coach)}</p>
            </div>` : ''}

            <div class="jp-analysis-grid">
                <div class="jp-analysis-section forces">
                    <div class="jp-analysis-section-title">💪 Tes forces</div>
                    <ul>${(analysis.forces || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
                </div>
                <div class="jp-analysis-section faiblesses">
                    <div class="jp-analysis-section-title">🎯 Tes défis</div>
                    <ul>${(analysis.faiblesses || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
                </div>
            </div>

            <div class="jp-analysis-section patterns">
                <div class="jp-analysis-section-title">🔄 Patterns</div>
                <ul>${(analysis.patterns || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
            </div>

            <div class="jp-analysis-section recommandations">
                <div class="jp-analysis-section-title">🚀 Actions</div>
                <ul>${(analysis.recommandations || []).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
            </div>

            ${analysis.lien_psychoaudit && analysis.lien_psychoaudit !== 'null' ? `
            <div class="jp-analysis-section psychoaudit">
                <div class="jp-analysis-section-title">🧬 PsychoAudit</div>
                <p>${escapeHtml(analysis.lien_psychoaudit)}</p>
                <button onclick="ViewRouter&&ViewRouter.navigate('psychoAudit');document.getElementById('jp-analysis-modal').classList.remove('active')">
                    Ouvrir PsychoAudit →
                </button>
            </div>` : ''}

            <div class="jp-analysis-actions">
                <button class="jp-btn-primary" id="jp-send-to-reports">📊 Envoyer dans Rapports</button>
                <button class="jp-btn-secondary" onclick="document.getElementById('jp-analysis-modal').classList.remove('active')">Fermer</button>
            </div>
        </div>`;
    }

    // ─── VICTORIES VAULT HTML ─────────────────────────────────────────────────

    function buildVictoriesHTML(victories) {
        if (!victories?.length) return `
            <div class="jp-empty-state">
                <p>Aucune victoire notée ces 30 derniers jours.</p>
                <p>Commence par noter tes succès avec la catégorie 🏆 Victoire !</p>
            </div>`;

        return `
        <div class="jp-victories-list">
            ${victories.map(v => {
                const date = v.date ? new Date(v.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short'
                }) : '';
                const energyIcon = v.energy === 3 ? '⚡' : v.energy === 1 ? '😴' : '😊';
                return `
                <div class="jp-victory-item">
                    <div class="jp-victory-icon">🏆</div>
                    <div class="jp-victory-content">
                        <div class="jp-victory-text">${escapeHtml(v.text)}</div>
                        ${v.ai_response ? `
                        <div class="jp-entry-ai-response">
                            <span class="jp-ai-badge">✦ MG</span>
                            <span>${escapeHtml(v.ai_response)}</span>
                        </div>` : ''}
                    </div>
                    <div class="jp-victory-meta">
                        <span class="jp-victory-date">${date}</span>
                        <span>${energyIcon}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>
        <div class="jp-victories-footer">
            <strong>${victories.length}</strong> victoire${victories.length > 1 ? 's' : ''} en 30 jours — continue comme ça !
        </div>`;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    function getPlaceholder(tab) {
        return {
            morning: '🌅 Mon intention principale du jour...',
            evening: '🌙 Ce qui s\'est passé, ce que j\'ai appris...',
            all: '📝 Note une victoire, idée, blocage, réflexion...'
        }[tab] || '📝 Note ta pensée du moment...';
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = String(text || '');
        return d.innerHTML;
    }

    function updateStats(container) {
        const stats = JournalPremiumCore.getTodayStats();
        const statCards = container.querySelectorAll('.jp-stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-value').textContent = stats.total;
            statCards[1].querySelector('.stat-value').textContent = stats.wins;
            statCards[2].querySelector('.stat-value').textContent = stats.ideas;
            statCards[3].querySelector('.stat-value').textContent = stats.blockers;
        }
        // Update victories button count
        const vicBtn = container.querySelector('#jp-victories-btn');
        if (vicBtn) vicBtn.textContent = `🏆 Mes victoires (${stats.wins})`;
    }

    function refreshTimeline(container) {
        const timeline = container.querySelector('#jp-timeline');
        if (timeline) timeline.innerHTML = buildTimeline(JournalPremiumCore.getFilteredEntries(activeTab));
    }

    // ─── NAVIGATION ───────────────────────────────────────────────────────────

    async function navigateToDate(dateStr, container) {
        JournalPremiumCore.setDate(dateStr);
        await JournalPremiumCore.loadEntriesForDate(dateStr);
        // Re-render complet pour mettre à jour navigation et stats
        container.innerHTML = buildLayout();
        attachEvents(container);
    }

    // ─── IA : RÉPONSE CONTEXTUELLE ───────────────────────────────────────────

    async function showAiResponse(entry, container, entryId) {
        const zone = container.querySelector('#jp-ai-response-zone');
        const bubble = container.querySelector('#jp-ai-response-text');
        if (!zone || !bubble) return;

        // Afficher zone de réponse avec animation "frappe"
        zone.style.display = 'block';
        zone.style.animation = 'jp-slideIn 0.3s ease-out';
        bubble.innerHTML = `<div class="jp-ai-typing"><span></span><span></span><span></span></div>`;

        try {
            const response = await JournalPremiumCore.getAiResponse(entry);
            if (response) {
                bubble.innerHTML = escapeHtml(response);
                bubble.style.animation = 'jp-fadeIn 0.4s ease-out';

                // Sauvegarder la réponse IA dans l'entrée (async, sans bloquer)
                if (entryId) {
                    ApiJournal.updateEntryAiResponse(entryId, response, entry.date).then(() => {
                        // Mettre à jour l'affichage de l'entrée dans la timeline
                        const entryEl = container.querySelector(`.jp-entry[data-id="${entryId}"] .jp-entry-body`);
                        if (entryEl && !entryEl.querySelector('.jp-entry-ai-response')) {
                            const aiDiv = document.createElement('div');
                            aiDiv.className = 'jp-entry-ai-response';
                            aiDiv.innerHTML = `<span class="jp-ai-badge">✦ MG</span><span>${escapeHtml(response)}</span>`;
                            entryEl.appendChild(aiDiv);
                        }
                    }).catch(() => {});
                }

                // Masquer après 8 secondes
                setTimeout(() => {
                    zone.style.animation = 'jp-fadeOut 0.4s ease-out';
                    setTimeout(() => { zone.style.display = 'none'; }, 400);
                }, 8000);
            } else {
                zone.style.display = 'none';
            }
        } catch (e) {
            zone.style.display = 'none';
        }
    }

    // ─── SOUMISSION ENTRÉE ────────────────────────────────────────────────────

    async function submitEntry(inputEl, container) {
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.disabled = true;
        const submitBtn = container.querySelector('#jp-submit');
        if (submitBtn) submitBtn.textContent = '⏳...';

        try {
            const result = await JournalPremiumCore.addEntry(text, selectedCat, selectedEnergy, activeTab);
            inputEl.value = '';
            refreshTimeline(container);
            updateStats(container);
            if (typeof Toast !== 'undefined') Toast.success('Entrée sauvegardée ✅');
            if (typeof XPFeedback !== 'undefined') XPFeedback.show(10, 'Journal');

            // IA répond à l'entrée (async, ne bloque pas l'UI)
            if (result && typeof ApiAi !== 'undefined') {
                showAiResponse({ text, category: selectedCat, energy: selectedEnergy, date: JournalPremiumCore.state.currentDate }, container, result.id);
            }
        } catch (e) {
            if (typeof Toast !== 'undefined') Toast.error('Erreur lors de l\'ajout');
        } finally {
            inputEl.disabled = false;
            if (submitBtn) submitBtn.textContent = '➕ Ajouter';
            inputEl.focus();
        }
    }

    async function saveFocusEntry(container) {
        const text = document.getElementById('jp-focus-input')?.value?.trim();
        if (text) {
            await JournalPremiumCore.addEntry(text, selectedCat, selectedEnergy, 'general');
            refreshTimeline(container);
            updateStats(container);
            if (typeof Toast !== 'undefined') Toast.success('Entrée sauvegardée ✅');
        }
        document.getElementById('jp-focus-overlay')?.classList.remove('active');
        const fi = document.getElementById('jp-focus-input');
        if (fi) fi.value = '';
    }

    // ─── MODALS ───────────────────────────────────────────────────────────────

    async function openPatterns() {
        const modal = document.getElementById('jp-patterns-modal');
        const content = document.getElementById('jp-patterns-content');
        if (!modal || !content) return;
        modal.classList.add('active');
        content.innerHTML = `<div class="jp-loading-state"><div class="jp-spinner"></div><p>Détection des patterns...</p></div>`;
        const patterns = await JournalPremiumCore.detectPatterns();
        content.innerHTML = buildPatternsHTML(patterns);
    }

    async function openFullAnalysis() {
        const modal = document.getElementById('jp-analysis-modal');
        const content = document.getElementById('jp-analysis-content');
        if (!modal || !content) return;
        modal.classList.add('active');
        content.innerHTML = `<div class="jp-loading-state"><div class="jp-spinner"></div><p>Analyse 30 jours en cours...</p><p class="jp-loading-sub">Forces · Faiblesses · PsychoAudit</p></div>`;
        const analysis = await JournalPremiumCore.generateFullAnalysis();
        content.innerHTML = buildAnalysisHTML(analysis);
        const sendBtn = content.querySelector('#jp-send-to-reports');
        if (sendBtn && analysis) {
            sendBtn.addEventListener('click', () => sendToReports(analysis));
        }
    }

    async function openVictories() {
        const modal = document.getElementById('jp-victories-modal');
        const content = document.getElementById('jp-victories-content');
        if (!modal || !content) return;
        modal.classList.add('active');
        content.innerHTML = `<div class="jp-loading-state"><div class="jp-spinner"></div></div>`;
        await JournalPremiumCore.loadExtendedHistory(30);
        const victories = await JournalPremiumCore.loadVictories(30);
        content.innerHTML = buildVictoriesHTML(victories);
    }

    function sendToReports(analysis) {
        if (typeof AppState !== 'undefined') AppState.journalAnalysis = analysis;
        if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('reports');
        if (typeof Toast !== 'undefined') Toast.info('Analyse envoyée dans Rapports');
        document.getElementById('jp-analysis-modal')?.classList.remove('active');
    }

    // ─── ÉVÉNEMENTS ───────────────────────────────────────────────────────────

    function attachEvents(container) {

        // ── Navigation temporelle
        container.querySelector('#jp-prev-day')?.addEventListener('click', async () => {
            if (JournalPremiumCore.navigateDay(-1)) {
                await navigateToDate(JournalPremiumCore.state.currentDate, container);
            }
        });

        container.querySelector('#jp-next-day')?.addEventListener('click', async () => {
            if (JournalPremiumCore.navigateDay(1)) {
                await navigateToDate(JournalPremiumCore.state.currentDate, container);
            }
        });

        container.querySelector('#jp-go-today')?.addEventListener('click', async () => {
            JournalPremiumCore.setDate(JournalPremiumCore.todayStr());
            await navigateToDate(JournalPremiumCore.state.currentDate, container);
        });

        // ── Mini-semaine cliquable
        container.querySelectorAll('.jp-mini-day').forEach(el => {
            el.addEventListener('click', async () => {
                const date = el.dataset.date;
                if (date && date !== JournalPremiumCore.state.currentDate) {
                    await navigateToDate(date, container);
                }
            });
        });

        // ── Heatmap cliquable
        container.querySelectorAll('.jp-heatmap-day').forEach(el => {
            el.addEventListener('click', async () => {
                const date = el.dataset.date;
                if (date && date !== JournalPremiumCore.state.currentDate) {
                    await navigateToDate(date, container);
                }
            });
        });

        // ── Tabs
        container.querySelectorAll('.jp-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                container.querySelectorAll('.jp-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const inputEl = container.querySelector('#jp-input');
                if (inputEl) inputEl.placeholder = getPlaceholder(activeTab);
                refreshTimeline(container);
            });
        });

        // ── Catégories
        container.querySelectorAll('.jp-category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                selectedCat = pill.dataset.cat;
                container.querySelectorAll('.jp-category-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
            });
        });

        // ── Énergie
        container.querySelectorAll('.jp-energy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedEnergy = parseInt(btn.dataset.energy);
                container.querySelectorAll('.jp-energy-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // ── Soumettre
        const submitBtn = container.querySelector('#jp-submit');
        const inputEl = container.querySelector('#jp-input');
        if (submitBtn && inputEl) {
            submitBtn.addEventListener('click', () => submitEntry(inputEl, container));
            inputEl.addEventListener('keydown', e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitEntry(inputEl, container);
            });
        }

        // ── Supprimer entrée
        container.addEventListener('click', async e => {
            const deleteBtn = e.target.closest('.jp-entry-delete');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (!id) return;
                await JournalPremiumCore.deleteEntry(id);
                refreshTimeline(container);
                updateStats(container);
            }
        });

        // ── Mode Focus
        container.querySelector('#jp-focus-btn')?.addEventListener('click', () => {
            document.getElementById('jp-focus-overlay')?.classList.add('active');
            document.getElementById('jp-focus-input')?.focus();
        });

        document.getElementById('jp-focus-save')?.addEventListener('click', () => saveFocusEntry(container));

        // ── IA Tools
        container.querySelector('#jp-patterns-btn')?.addEventListener('click', openPatterns);
        container.querySelector('#jp-full-analysis-btn')?.addEventListener('click', openFullAnalysis);
        container.querySelector('#jp-victories-btn')?.addEventListener('click', openVictories);
        container.querySelector('#jp-report-btn')?.addEventListener('click', () => {
            if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('reports');
        });

        // ── Fermer modals
        ['jp-patterns-close', 'jp-analysis-close', 'jp-victories-close'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                document.querySelectorAll('.jp-modal-overlay').forEach(m => m.classList.remove('active'));
            });
        });

        // ── Fermer sur clic overlay
        document.querySelectorAll('.jp-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // ── Échap
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.getElementById('jp-focus-overlay')?.classList.remove('active');
                document.querySelectorAll('.jp-modal-overlay').forEach(m => m.classList.remove('active'));
            }
        });
    }

    return { render };
})();

if (typeof window !== 'undefined') window.JournalPremiumUI = JournalPremiumUI;
