// =============================================
// PRODUCTIVEAPP - REPORT MODULE
// Génération de rapports et export
// =============================================

const Report = {
    /**
     * Génère un rapport IA
     */
    async generate() {
        Utils.$('report-content').innerHTML = '<p style="color:var(--text-muted)">Génération en cours...</p>';
        Utils.$('download-pdf-btn').classList.add('hidden');

        try {
            const stats = AppState.getTaskStats();
            const prompt = `Génère un rapport de direction concis en français pour ${AppState.currentUser?.name || 'Utilisateur'}.
Données: ${stats.total} tâches (${stats.done} terminées, ${stats.inProgress} en cours, ${stats.todo} à faire).
Inclus: synthèse rapide, accomplissements, points d'attention, recommandations. Format markdown court.`;

            let ai;
            if (typeof ApiAi !== 'undefined' && ApiAi.isAvailable()) {
                ai = await ApiAi.generate(prompt);
            } else {
                ai = `## Rapport\n\n**${stats.done}** tâches terminées sur **${stats.total}**.\nTaux de complétion: **${stats.total > 0 ? Math.round(stats.done/stats.total*100) : 0}%**`;
            }

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
     * Telecharge le rapport en PDF - Version Premium
     */
    downloadPDF() {
        if (!AppState.ui.lastReportData) {
            Utils.notify('Genere un rapport d\'abord', 'warning');
            return;
        }

        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) {
            Utils.notify('jsPDF non disponible', 'error');
            return;
        }

        const doc = new jsPDF();
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        const stats = AppState.getTaskStats();
        const user = AppState.currentUser?.name || 'Utilisateur';
        const date = new Date();
        const dateStr = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Header premium avec fond sombre
        doc.setFillColor(26, 26, 31);
        doc.rect(0, 0, w, 45, 'F');

        // Accent line doree
        doc.setFillColor(212, 175, 55);
        doc.rect(0, 45, w, 3, 'F');

        // Logo placeholder
        doc.setFillColor(212, 175, 55);
        doc.circle(25, 22, 10, 'F');
        doc.setTextColor(26, 26, 31);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PA', 25, 25, { align: 'center' });

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Rapport de Productivite', 45, 20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(user + ' - ' + dateStr, 45, 30);

        // Stats cards
        let y = 60;
        const cardWidth = (w - 50) / 4;
        const cardHeight = 35;
        const cards = [
            { bg: [34, 197, 94], label: 'Terminees', value: stats.done },
            { bg: [245, 158, 11], label: 'En cours', value: stats.inProgress },
            { bg: [99, 102, 241], label: 'A faire', value: stats.todo },
            { bg: [239, 68, 68], label: 'Urgentes', value: stats.urgent }
        ];

        cards.forEach((card, i) => {
            const x = 15 + i * (cardWidth + 5);

            // Card background
            doc.setFillColor(40, 40, 50);
            doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'F');

            // Color accent top
            doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
            doc.roundedRect(x, y, cardWidth, 4, 4, 4, 'F');
            doc.rect(x, y + 2, cardWidth, 2, 'F');

            // Value
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(String(card.value), x + cardWidth/2, y + 18, { align: 'center' });

            // Label
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(card.label, x + cardWidth/2, y + 28, { align: 'center' });
        });

        y += cardHeight + 20;

        // Completion rate bar
        const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

        doc.setFillColor(40, 40, 50);
        doc.roundedRect(15, y, w - 30, 25, 4, 4, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Taux de completion', 20, y + 10);
        doc.text(completionRate + '%', w - 25, y + 10, { align: 'right' });

        // Progress bar background
        doc.setFillColor(60, 60, 70);
        doc.roundedRect(20, y + 14, w - 45, 6, 2, 2, 'F');

        // Progress bar fill
        const barWidth = ((w - 45) * completionRate) / 100;
        if (barWidth > 0) {
            doc.setFillColor(139, 92, 246);
            doc.roundedRect(20, y + 14, barWidth, 6, 2, 2, 'F');
        }

        y += 40;

        // AI Analysis Section
        if (AppState.ui.lastReportData.ai) {
            doc.setFillColor(30, 30, 40);
            doc.roundedRect(15, y, w - 30, 15, 4, 4, 'F');

            doc.setFillColor(212, 175, 55);
            doc.rect(15, y, 4, 15, 'F');

            doc.setTextColor(212, 175, 55);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Analyse IA', 25, y + 10);

            y += 20;

            doc.setTextColor(200, 200, 200);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const aiText = AppState.ui.lastReportData.ai;
            const lines = doc.splitTextToSize(aiText, w - 40);

            lines.forEach(line => {
                if (y > h - 30) {
                    doc.addPage();
                    y = 20;

                    // Mini header on new page
                    doc.setFillColor(26, 26, 31);
                    doc.rect(0, 0, w, 15, 'F');
                    doc.setFillColor(212, 175, 55);
                    doc.rect(0, 15, w, 1, 'F');
                    y = 25;
                }
                doc.text(line, 20, y);
                y += 5.5;
            });
        }

        // Footer
        const footerY = h - 15;
        doc.setFillColor(26, 26, 31);
        doc.rect(0, footerY - 5, w, 20, 'F');
        doc.setFillColor(212, 175, 55);
        doc.rect(0, footerY - 5, w, 1, 'F');

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('ProductiveApp - Rapport genere automatiquement', w/2, footerY + 3, { align: 'center' });
        doc.text(date.toISOString().split('T')[0], w/2, footerY + 8, { align: 'center' });

        const filename = 'rapport_productiveapp_' + date.toISOString().split('T')[0] + '.pdf';
        doc.save(filename);
        Utils.notify('PDF telecharge !', 'success');
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
