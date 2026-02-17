// =============================================
// PRODUCTIVEAPP - JOURNAL MODULE v2.0
// Gestion du journal d'activité quotidienne
// Utilise ApiJournal (REST moderne)
// =============================================

const Journal = {
    /**
     * Charge les entrées du journal (aujourd'hui par défaut)
     */
    async load() {
        try {
            if (!ApiJournal || !ApiJournal.isAvailable()) {
                console.error('❌ ApiJournal non disponible');
                return [];
            }

            const entries = await ApiJournal.getTodayEntries();
            console.log(`✅ ${entries.length} entrées journal chargées`);

            // Stocker dans AppState si disponible
            if (typeof AppState !== 'undefined' && AppState.setJournal) {
                AppState.setJournal(entries);
            }

            return entries;
        } catch (error) {
            console.error('❌ Erreur chargement journal:', error);
            return [];
        }
    },

    /**
     * Ajoute une entrée au journal
     * @param {string} category - Catégorie (task, idea, reflection, blocker, win)
     * @param {string} text - Texte de l'entrée
     * @param {number} energy - Niveau d'énergie (1-3)
     */
    async add(category, text, energy) {
        try {
            if (!text || !text.trim()) {
                console.error('❌ Texte vide');
                return null;
            }

            const entry = {
                category: category || 'task',
                text: text.trim(),
                energy: parseInt(energy) || 2,
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
            };

            const result = await ApiJournal.upsertEntry(entry);

            if (result) {
                console.log('✅ Entrée journal créée:', result.id);

                // Recharger le journal
                await this.load();
                this.render();

                // Notifier succès
                if (typeof Toast !== 'undefined') {
                    Toast.success('Entrée ajoutée au journal');
                }

                return result;
            }
        } catch (error) {
            console.error('❌ Erreur création entrée journal:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Erreur lors de l\'ajout');
            }
            return null;
        }
    },

    /**
     * Crée une entrée depuis le formulaire
     */
    async createFromForm() {
        const input = document.getElementById('journal-input');
        const categorySelect = document.getElementById('journal-category');
        const energySelect = document.getElementById('journal-energy');

        if (!input || !categorySelect || !energySelect) {
            console.error('❌ Éléments formulaire journal introuvables');
            return;
        }

        const text = input.value.trim();
        if (!text) {
            if (typeof Toast !== 'undefined') {
                Toast.warning('Saisissez du texte');
            }
            return;
        }

        const category = categorySelect.value;
        const energy = parseInt(energySelect.value);

        const result = await this.add(category, text, energy);

        if (result) {
            // Vider le formulaire
            input.value = '';
            input.focus();
        }
    },

    /**
     * Afficher le badge utilisateur personnel
     */
    renderUserBadge() {
        const badge = document.getElementById('journal-user-badge');
        if (!badge) return;

        // Récupérer l'utilisateur actuel
        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        if (!user) return;

        const avatarSpan = badge.querySelector('.user-avatar');
        const nameSpan = badge.querySelector('.user-name');

        if (avatarSpan) avatarSpan.textContent = user.avatar || '👤';
        if (nameSpan) nameSpan.textContent = user.name || 'Vous';

        badge.style.display = 'flex';
    },

    /**
     * Render le journal
     */
    render() {
        const entriesContainer = document.getElementById('journal-entries');
        const statsContainer = document.getElementById('journal-stats');

        if (!entriesContainer || !statsContainer) {
            console.warn('⚠️ Conteneurs journal introuvables');
            return;
        }

        // Afficher le badge utilisateur
        this.renderUserBadge();

        // Récupérer les entrées depuis AppState ou vide
        let entries = [];
        if (typeof AppState !== 'undefined' && AppState.getTodayJournal) {
            entries = AppState.getTodayJournal();
        }

        // Statistiques
        const stats = {
            total: entries.length,
            wins: entries.filter(e => e.category === 'win').length,
            ideas: entries.filter(e => e.category === 'idea').length,
            blockers: entries.filter(e => e.category === 'blocker').length
        };

        statsContainer.innerHTML = `
            <span>📝 ${stats.total}</span>
            <span>🏆 ${stats.wins}</span>
            <span>💡 ${stats.ideas}</span>
            <span>🚧 ${stats.blockers}</span>
        `;

        // Icônes et labels
        const catIcons = { task: '✅', idea: '💡', reflection: '🤔', blocker: '🚧', win: '🏆' };
        const energyLabels = { 1: 'low', 2: 'normal', 3: 'high' };
        const energyText = { 1: '😴', 2: '😊', 3: '⚡' };

        // Formater les entrées
        if (entries.length === 0) {
            entriesContainer.innerHTML = '<div class="empty-state">Aucune entrée aujourd\'hui. Commence par noter ta première action !</div>';
        } else {
            entriesContainer.innerHTML = entries.map(e => {
                const time = e.time || (e.created_at ? this.formatTime(e.created_at) : '');
                const userName = e.userName || e.user_name || 'Toi';
                const energy = e.energy || 2;

                return `
                    <div class="journal-entry">
                        <span class="entry-category">${catIcons[e.category] || '📝'}</span>
                        <div class="entry-content">
                            <div class="entry-text">${this.escapeHtml(e.text)}</div>
                            <div class="entry-meta">
                                <span>${time}</span>
                                <span>${userName}</span>
                                <span class="entry-energy ${energyLabels[energy]}">${energyText[energy]}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    /**
     * Formater l'heure depuis ISO string
     */
    formatTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    },

    /**
     * Escape HTML pour sécurité
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const addBtn = document.getElementById('add-journal-btn');
        const input = document.getElementById('journal-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.createFromForm());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.createFromForm();
                }
            });
        }

        console.log('✅ Événements journal initialisés');
    }
};

// Exposer globalement pour compatibilité
window.Journal = Journal;
window.renderJournal = () => Journal.render();
window.addJournalEntry = (category, text, energy) => Journal.add(category, text, energy);
window.createJournalEntry = () => Journal.createFromForm();
