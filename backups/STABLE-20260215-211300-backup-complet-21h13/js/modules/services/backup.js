// =============================================
// PRODUCTIVEAPP - BACKUP MODULE
// Système de sauvegarde automatique PostgreSQL
// =============================================

const Backup = {
    /**
     * Intervalle de sauvegarde automatique (ms)
     * Par défaut: 30 minutes
     */
    AUTO_BACKUP_INTERVAL: 30 * 60 * 1000,

    /**
     * Timer pour la sauvegarde automatique
     */
    autoBackupTimer: null,

    /**
     * Crée une sauvegarde complète dans PostgreSQL
     * @returns {Promise<Object>} - Résultat de la sauvegarde
     */
    async create() {
        console.log('🔄 Création backup PostgreSQL...');

        const backupData = {
            timestamp: new Date().toISOString(),
            userId: AppState.currentUser?.id || 'unknown',
            userName: AppState.currentUser?.name || 'Unknown',
            data: {
                tasks: AppState.tasks,
                projects: AppState.projects,
                journal: AppState.journal
            },
            metadata: {
                version: AppConfig.VERSION,
                taskCount: AppState.tasks.length,
                projectCount: AppState.projects.length,
                journalCount: AppState.journal.length,
                urgentCount: AppState.tasks.filter(t => t.priority?.level === 1 && t.status !== 'done').length
            }
        };

        try {
            const result = await ApiService.createBackup();
            console.log('✅ Backup PostgreSQL créé:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur backup PostgreSQL:', error);
            throw error;
        }
    },

    /**
     * Liste les sauvegardes disponibles
     * @returns {Promise<Array>}
     */
    async list() {
        try {
            const backups = await ApiService.listBackups();
            console.log('📋 Backups disponibles:', backups?.length || 0);
            return backups || [];
        } catch (error) {
            console.error('❌ Erreur listing backups:', error);
            return [];
        }
    },

    /**
     * Restaure une sauvegarde
     * @param {string} backupId - ID du backup à restaurer
     * @returns {Promise<boolean>}
     */
    async restore(backupId) {
        console.log('🔄 Restauration backup:', backupId);

        try {
            const data = await ApiService.restoreBackup(backupId);

            if (data && data.data) {
                // Restaurer les données
                if (data.data.tasks) {
                    AppState.setTasks(data.data.tasks);
                }
                if (data.data.projects) {
                    AppState.setProjects(data.data.projects);
                }
                if (data.data.journal) {
                    AppState.setJournal(data.data.journal);
                }

                // Re-render tout
                Tasks.render();
                Projects.renderFilter();
                Projects.renderSelect();
                Journal.render();

                console.log('✅ Backup restauré avec succès');
                Utils.notify('Sauvegarde restaurée avec succès !', 'success');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Erreur restauration backup:', error);
            Utils.notify('Erreur lors de la restauration', 'error');
            return false;
        }
    },

    /**
     * Sauvegarde rapide (localStorage + console)
     * Pour récupération d'urgence
     */
    quickSave() {
        const snapshot = {
            timestamp: new Date().toISOString(),
            tasks: AppState.tasks,
            projects: AppState.projects,
            journal: AppState.journal.slice(0, 100) // Dernières 100 entrées
        };

        localStorage.setItem('productiveapp_quicksave', JSON.stringify(snapshot));
        console.log('💾 Quick save effectué:', snapshot.tasks.length, 'tâches');
        return snapshot;
    },

    /**
     * Restaure depuis un quick save
     * @returns {boolean}
     */
    quickRestore() {
        const saved = localStorage.getItem('productiveapp_quicksave');
        if (!saved) {
            console.log('⚠️ Aucun quick save trouvé');
            return false;
        }

        try {
            const data = JSON.parse(saved);
            AppState.setTasks(data.tasks || []);
            AppState.setProjects(data.projects || AppConfig.DEFAULT_PROJECTS);
            AppState.setJournal(data.journal || []);

            Tasks.render();
            Projects.renderFilter();
            Projects.renderSelect();
            Journal.render();

            console.log('✅ Quick restore effectué');
            return true;
        } catch (error) {
            console.error('❌ Erreur quick restore:', error);
            return false;
        }
    },

    /**
     * Démarre la sauvegarde automatique
     */
    startAutoBackup() {
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
        }

        // Quick save toutes les 5 minutes
        setInterval(() => this.quickSave(), 5 * 60 * 1000);

        // Backup PostgreSQL toutes les 30 minutes
        this.autoBackupTimer = setInterval(async () => {
            try {
                await this.create();
            } catch (error) {
                console.error('❌ Auto-backup failed:', error);
            }
        }, this.AUTO_BACKUP_INTERVAL);

        console.log('⏰ Auto-backup activé (30 min)');
    },

    /**
     * Arrête la sauvegarde automatique
     */
    stopAutoBackup() {
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
            this.autoBackupTimer = null;
            console.log('⏹️ Auto-backup désactivé');
        }
    },

    /**
     * Crée un backup manuel avec confirmation
     */
    async manualBackup() {
        if (!confirm('Créer une sauvegarde maintenant ?')) return;

        try {
            await this.create();
            Utils.notify('✅ Sauvegarde créée avec succès !');
        } catch (error) {
            Utils.notify('❌ Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Affiche le modal de gestion des backups
     */
    async showBackupModal() {
        const backups = await this.list();

        let modalHtml = `
            <div id="backup-modal" class="modal">
                <div class="modal-content">
                    <h3>🔒 Gestion des sauvegardes</h3>
                    <div class="backup-actions">
                        <button onclick="Backup.manualBackup()" class="btn-primary">
                            💾 Nouvelle sauvegarde
                        </button>
                        <button onclick="Report.exportData()" class="btn-secondary">
                            📥 Export JSON
                        </button>
                    </div>
                    <div class="backup-list">
                        <h4>📋 Sauvegardes disponibles</h4>
                        ${backups.length ? backups.map(b => `
                            <div class="backup-item">
                                <span>${Utils.formatDate(b.timestamp)} ${Utils.formatTime(b.timestamp)}</span>
                                <span>${b.metadata?.taskCount || '?'} tâches</span>
                                <button onclick="Backup.restore('${b.id}')" class="btn-small">
                                    Restaurer
                                </button>
                            </div>
                        `).join('') : '<p>Aucune sauvegarde disponible</p>'}
                    </div>
                    <button onclick="document.getElementById('backup-modal').remove()" class="btn-close">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        // Supprimer modal existant
        document.getElementById('backup-modal')?.remove();

        // Ajouter le nouveau modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Initialise le système de backup
     */
    init() {
        // Démarrer l'auto-backup
        this.startAutoBackup();

        // Quick save au déchargement de la page
        window.addEventListener('beforeunload', () => {
            this.quickSave();
        });

        console.log('🔒 Système de backup initialisé');
    }
};

// Exposer globalement
window.Backup = Backup;
