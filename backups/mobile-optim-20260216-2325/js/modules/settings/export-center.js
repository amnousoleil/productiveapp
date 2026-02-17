/**
 * EXPORT CENTER - ProductiveApp v4.0
 * Centre d'export de donnees multi-format
 */
const ExportCenter = (function() {
    'use strict';

    function render() {
        var html = '<div class="export-center">';
        html += '<h3 class="export-title">Exporter vos données</h3>';
        html += '<p class="export-desc">Téléchargez vos données dans le format de votre choix.</p>';
        html += '<div class="export-grid">';

        html += renderExportCard('tasks-csv', 'Tâches', 'CSV',
            '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
            'Toutes vos tâches avec statut, priorité, échéance');
        html += renderExportCard('projects-csv', 'Projets', 'CSV',
            '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
            'Projets avec progression et statistiques');
        html += renderExportCard('notes-md', 'Notes', 'Markdown',
            '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            'Notes en Markdown pour import facile');
        html += renderExportCard('invoices-csv', 'Factures', 'CSV',
            '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
            'Historique des factures et paiements');
        html += renderExportCard('full-json', 'Tout', 'JSON',
            '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
            'Export complet de toutes vos données');

        html += '</div></div>';
        return html;
    }

    function renderExportCard(id, name, format, icon, desc) {
        return '<div class="export-card" onclick="ExportCenter.doExport(\'' + id + '\')">' +
            '<div class="export-card-icon">' + icon + '</div>' +
            '<div class="export-card-info">' +
                '<div class="export-card-name">' + name + '</div>' +
                '<div class="export-card-desc">' + desc + '</div>' +
            '</div>' +
            '<span class="export-card-format">' + format + '</span>' +
        '</div>';
    }

    function doExport(type) {
        switch (type) {
            case 'tasks-csv': return exportTasksCsv();
            case 'projects-csv': return exportProjectsCsv();
            case 'notes-md': return exportNotesMarkdown();
            case 'invoices-csv': return exportInvoicesCsv();
            case 'full-json': return exportFullJson();
        }
    }

    function exportTasksCsv() {
        var tasks = (typeof AppState !== 'undefined' && AppState.tasks) ? AppState.tasks : [];
        if (!tasks.length) { notify('Aucune tâche à exporter', 'warning'); return; }

        var priorityMap = { 1: 'Urgent', 2: 'Haute', 3: 'Moyenne', 4: 'Basse' };
        var csv = 'Titre,Statut,Priorité,Échéance,Projet,Créé le\n';
        tasks.forEach(function(t) {
            csv += csvEscape(t.title || t.text || '') + ',' +
                csvEscape(t.status || '') + ',' +
                csvEscape(priorityMap[t.priority] || 'Moyenne') + ',' +
                csvEscape(t.due_date ? new Date(t.due_date).toLocaleDateString('fr-FR') : '') + ',' +
                csvEscape(t.project_name || '') + ',' +
                csvEscape(t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '') + '\n';
        });
        downloadFile(csv, 'taches-productiveapp.csv', 'text/csv;charset=utf-8');
        notify(tasks.length + ' tâches exportées', 'success');
    }

    function exportProjectsCsv() {
        var projects = (typeof AppState !== 'undefined' && AppState.projects) ? AppState.projects : [];
        if (!projects.length) { notify('Aucun projet à exporter', 'warning'); return; }

        var csv = 'Nom,Statut,Progression,Budget,Créé le\n';
        projects.forEach(function(p) {
            csv += csvEscape(p.name || p.title || '') + ',' +
                csvEscape(p.status || '') + ',' +
                csvEscape((p.progress || 0) + '%') + ',' +
                csvEscape(p.budget ? p.budget + ' €' : '') + ',' +
                csvEscape(p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '') + '\n';
        });
        downloadFile(csv, 'projets-productiveapp.csv', 'text/csv;charset=utf-8');
        notify(projects.length + ' projets exportés', 'success');
    }

    function exportNotesMarkdown() {
        var notes = (typeof AppState !== 'undefined' && AppState.notes) ? AppState.notes : [];
        if (!notes.length) { notify('Aucune note à exporter', 'warning'); return; }

        var md = '# Notes - ProductiveApp\n\nExport du ' + new Date().toLocaleDateString('fr-FR') + '\n\n---\n\n';
        notes.forEach(function(n) {
            md += '## ' + (n.title || 'Sans titre') + '\n\n';
            if (n.created_at) md += '*Créé le ' + new Date(n.created_at).toLocaleDateString('fr-FR') + '*\n\n';
            md += (n.content || n.body || '') + '\n\n---\n\n';
        });
        downloadFile(md, 'notes-productiveapp.md', 'text/markdown;charset=utf-8');
        notify(notes.length + ' notes exportées', 'success');
    }

    function exportInvoicesCsv() {
        // Tenter de recuperer depuis AppState ou window
        var invoices = [];
        if (typeof AppState !== 'undefined' && AppState.invoices) invoices = AppState.invoices;
        if (!invoices.length) { notify('Aucune facture à exporter', 'warning'); return; }

        var csv = 'Numéro,Client,Montant HT,TVA,Montant TTC,Statut,Date\n';
        invoices.forEach(function(inv) {
            csv += csvEscape(inv.number || inv.reference || '') + ',' +
                csvEscape(inv.client_name || '') + ',' +
                csvEscape((inv.total_ht || 0) + ' €') + ',' +
                csvEscape((inv.total_tva || 0) + ' €') + ',' +
                csvEscape((inv.total_ttc || inv.total || 0) + ' €') + ',' +
                csvEscape(inv.status || '') + ',' +
                csvEscape(inv.created_at ? new Date(inv.created_at).toLocaleDateString('fr-FR') : '') + '\n';
        });
        downloadFile(csv, 'factures-productiveapp.csv', 'text/csv;charset=utf-8');
        notify(invoices.length + ' factures exportées', 'success');
    }

    function exportFullJson() {
        var data = {};
        if (typeof AppState !== 'undefined') {
            if (AppState.tasks) data.tasks = AppState.tasks;
            if (AppState.projects) data.projects = AppState.projects;
            if (AppState.notes) data.notes = AppState.notes;
            if (AppState.invoices) data.invoices = AppState.invoices;
        }
        data.exported_at = new Date().toISOString();
        data.version = 'ProductiveApp v4.0';
        var json = JSON.stringify(data, null, 2);
        downloadFile(json, 'productiveapp-export.json', 'application/json;charset=utf-8');
        var count = Object.keys(data).length - 2; // minus exported_at and version
        notify('Export complet (' + count + ' catégories)', 'success');
    }

    function downloadFile(content, filename, mimeType) {
        var BOM = '\uFEFF'; // BOM for Excel UTF-8 CSV
        var blob = new Blob([BOM + content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function csvEscape(value) {
        var s = String(value || '');
        if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function notify(msg, type) {
        if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify(msg, type);
    }

    return { render: render, doExport: doExport };
})();

if (typeof window !== 'undefined') window.ExportCenter = ExportCenter;
