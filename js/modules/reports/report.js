// =============================================
// PRODUCTIVEAPP - REPORT MODULE
// Génération de rapports et export
// =============================================

const Report = {
    /**
     * Génère un rapport IA
     */
    async generate() {
        Utils.$('report-content').innerHTML = '<p style="color:var(--text-muted)">🔮 Génération...</p>';
        Utils.$('download-pdf-btn').classList.add('hidden');

        try {
            const aiResponse = await ApiService.sendChatMessage({
                message: 'Génère un rapport de direction concis avec: synthèse, accomplissements, points attention, recommandations.',
                context: Chatbot.buildContext(),
                user: AppState.currentUser.name,
                userId: AppState.currentUser.id,
                type: 'report'
            });

            let ai = aiResponse.replace(/ACTION:[A-Z_]+\|[^\n]*/g, '').trim();

            AppState.ui.lastReportData = { ai: ai, date: new Date() };
            this.show(ai);
            Utils.$('download-pdf-btn').classList.remove('hidden');
        } catch (e) {
            Utils.$('report-content').innerHTML = '<p style="color:var(--danger)">Erreur de génération</p>';
            console.error('❌ Erreur génération rapport:', e);
        }
    },

    /**
     * Affiche le rapport
     * @param {string} ai - Texte du rapport IA
     */
    show(ai) {
        const stats = AppState.getTaskStats();
        const todayStr = new Date().toDateString();
        const doneToday = AppState.tasks.filter(t =>
            t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === todayStr
        ).length;

        Utils.$('report-content').innerHTML = `
            <h3>📊 Rapport - ${Utils.formatDate(new Date())}</h3>
            <div style="display:flex;gap:16px;margin:16px 0">
                <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                    <div style="font-size:1.5rem;font-weight:bold;color:var(--accent)">${stats.todo}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">À faire</div>
                </div>
                <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                    <div style="font-size:1.5rem;font-weight:bold;color:var(--warning)">${stats.inProgress}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">En cours</div>
                </div>
                <div style="flex:1;background:var(--bg-card);padding:12px;border-radius:12px;text-align:center">
                    <div style="font-size:1.5rem;font-weight:bold;color:var(--success)">${doneToday}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">Terminées</div>
                </div>
            </div>
            ${ai ? `<div style="background:var(--bg-card);padding:16px;border-radius:12px;border-left:3px solid var(--accent);white-space:pre-wrap;line-height:1.6">${Utils.escapeHtml(ai)}</div>` : ''}
        `;
    },

    /**
     * Télécharge le rapport en PDF
     */
    downloadPDF() {
        if (!AppState.ui.lastReportData) {
            Utils.notify('Génère un rapport d\'abord', 'warning');
            return;
        }

        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) {
            Utils.notify('jsPDF non disponible', 'error');
            return;
        }

        const doc = new jsPDF();
        const w = doc.internal.pageSize.getWidth();

        doc.setFillColor(224, 120, 64);
        doc.rect(0, 0, w, 25, 'F');
        doc.setTextColor(255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RAPPORT DIGITAL GIRI', w / 2, 15, { align: 'center' });

        let y = 40;
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (AppState.ui.lastReportData.ai) {
            const lines = doc.splitTextToSize(AppState.ui.lastReportData.ai, w - 40);
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 5;
            });
        }

        doc.save('rapport_' + Utils.formatDate(AppState.ui.lastReportData.date).replace(/\//g, '-') + '.pdf');
    },

    /**
     * Exporte les données en JSON
     */
    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            tenant: AppConfig.TENANT_ID,
            user: AppState.currentUser.name,
            tasks: AppState.tasks,
            journal: AppState.journal,
            projects: AppState.projects
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `productiveapp_backup_${Utils.formatDate(new Date()).replace(/\//g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Backup exporté:', data.tasks.length, 'tâches,', data.journal.length, 'entrées journal');
        Utils.notify(`✅ Backup téléchargé !\n\n${AppState.tasks.length} tâches\n${AppState.journal.length} entrées journal`);
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const generateBtn = Utils.$('generate-report-btn');
        const downloadBtn = Utils.$('download-pdf-btn');
        const exportBtn = Utils.$('export-btn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDF());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }
};

// Exposer globalement
window.Report = Report;
window.generateReport = () => Report.generate();
window.downloadPDF = () => Report.downloadPDF();
window.exportData = () => Report.exportData();
