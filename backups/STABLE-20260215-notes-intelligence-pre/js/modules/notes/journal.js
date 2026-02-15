// =============================================
// PRODUCTIVEAPP - JOURNAL MODULE
// Gestion du journal d'activité
// =============================================

const Journal = {
    /**
     * Charge le journal depuis l'API
     */
    async load() {
        const journal = await ApiService.loadJournal();
        AppState.setJournal(journal);
        return journal;
    },

    /**
     * Ajoute une entrée au journal
     * @param {string} category - Catégorie (task, idea, reflection, blocker, win)
     * @param {string} text - Texte de l'entrée
     * @param {number} energy - Niveau d'énergie (1-3)
     */
    async add(category, text, energy) {
        const entry = {
            category: category,
            text: text,
            energy: energy,
            userId: AppState.currentUser.id,
            userName: AppState.currentUser.name
        };

        const result = await ApiService.createJournalEntry(entry);

        if (result) {
            const newEntry = {
                id: result.id,
                category: result.category,
                text: result.text,
                energy: result.energy,
                time: Utils.formatTime(result.created_at),
                date: result.created_at,
                userId: result.user_id,
                userName: Utils.getUserName(result.user_id)
            };

            AppState.addJournalEntry(newEntry);
            this.render();
        }
    },

    /**
     * Crée une entrée depuis le formulaire
     */
    async createFromForm() {
        const text = Utils.$('journal-input').value.trim();
        if (!text) return;

        const category = Utils.$('journal-category').value;
        const energy = parseInt(Utils.$('journal-energy').value);

        await this.add(category, text, energy);
        Utils.$('journal-input').value = '';
    },

    /**
     * Render le journal
     */
    render() {
        const entries = AppState.getTodayJournal();

        const stats = {
            total: entries.length,
            wins: entries.filter(e => e.category === 'win').length,
            ideas: entries.filter(e => e.category === 'idea').length,
            blockers: entries.filter(e => e.category === 'blocker').length
        };

        Utils.$('journal-stats').innerHTML = `
            <span>📝 ${stats.total}</span>
            <span>🏆 ${stats.wins}</span>
            <span>💡 ${stats.ideas}</span>
            <span>🚧 ${stats.blockers}</span>
        `;

        const catIcons = { task: '✅', idea: '💡', reflection: '🤔', blocker: '🚧', win: '🏆' };
        const energyLabels = { 1: 'low', 2: 'normal', 3: 'high' };
        const energyText = { 1: '😴', 2: '😊', 3: '⚡' };

        Utils.$('journal-entries').innerHTML = entries.length ? entries.map(e => `
            <div class="journal-entry">
                <span class="entry-category">${catIcons[e.category] || '📝'}</span>
                <div class="entry-content">
                    <div class="entry-text">${Utils.escapeHtml(e.text)}</div>
                    <div class="entry-meta">
                        <span>${e.time}</span>
                        <span>${e.userName}</span>
                        <span class="entry-energy ${energyLabels[e.energy]}">${energyText[e.energy]}</span>
                    </div>
                </div>
            </div>
        `).join('') : '<div class="empty-state">Aucune entrée aujourd\'hui</div>';
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const addBtn = Utils.$('add-journal-btn');
        const input = Utils.$('journal-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.createFromForm());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createFromForm();
            });
        }
    }
};

// Exposer globalement pour compatibilité
window.Journal = Journal;
window.renderJournal = () => Journal.render();
window.addJournalEntry = (category, text, energy) => Journal.add(category, text, energy);
window.createJournalEntry = () => Journal.createFromForm();
