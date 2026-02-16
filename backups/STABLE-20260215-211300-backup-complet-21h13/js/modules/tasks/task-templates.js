/**
 * TASK TEMPLATES - ProductiveApp v4.0
 * Templates predefinis et personnalises
 */
const TaskTemplates = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_task_templates';

    var builtinTemplates = [
        {
            id: 'sprint-dev',
            name: 'Sprint Developpement',
            icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
            tasks: [
                { title: 'Planification sprint', priority: 'high' },
                { title: 'Revue de code', priority: 'medium' },
                { title: 'Tests unitaires', priority: 'high' },
                { title: 'Deploiement staging', priority: 'medium' },
                { title: 'Tests QA', priority: 'medium' },
                { title: 'Deploiement production', priority: 'urgent' },
                { title: 'Retrospective', priority: 'low' }
            ]
        },
        {
            id: 'client-onboarding',
            name: 'Onboarding Client',
            icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            tasks: [
                { title: 'Premier appel decouverte', priority: 'high' },
                { title: 'Envoyer le devis', priority: 'urgent' },
                { title: 'Signer le contrat', priority: 'urgent' },
                { title: 'Configurer acces client', priority: 'medium' },
                { title: 'Reunion de lancement (kick-off)', priority: 'high' },
                { title: 'Envoyer la premiere facture', priority: 'medium' }
            ]
        },
        {
            id: 'marketing-campaign',
            name: 'Campagne Marketing',
            icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            tasks: [
                { title: 'Definir l\'objectif', priority: 'high' },
                { title: 'Creer le contenu', priority: 'high' },
                { title: 'Preparer les visuels', priority: 'medium' },
                { title: 'Planifier la diffusion', priority: 'medium' },
                { title: 'Lancer la campagne', priority: 'urgent' },
                { title: 'Analyser les resultats', priority: 'low' }
            ]
        },
        {
            id: 'weekly-review',
            name: 'Revue Hebdomadaire',
            icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>',
            tasks: [
                { title: 'Revoir les taches de la semaine', priority: 'medium' },
                { title: 'Mettre a jour les projets', priority: 'medium' },
                { title: 'Verifier les factures en attente', priority: 'high' },
                { title: 'Planifier la semaine suivante', priority: 'high' },
                { title: 'Envoyer les rapports clients', priority: 'medium' }
            ]
        }
    ];

    function getTemplates() {
        var custom = [];
        try { custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { custom = []; }
        return builtinTemplates.concat(custom);
    }

    function renderModal() {
        var templates = getTemplates();
        var html = '<div class="task-templates-overlay" onclick="TaskTemplates.close()">' +
            '<div class="task-templates-modal" onclick="event.stopPropagation()">' +
                '<div class="task-templates-header">' +
                    '<h3>Templates de taches</h3>' +
                    '<button class="task-templates-close" onclick="TaskTemplates.close()">&times;</button>' +
                '</div>' +
                '<div class="task-templates-grid">';

        templates.forEach(function(t) {
            html += '<div class="task-template-card" onclick="TaskTemplates.apply(\'' + t.id + '\')">' +
                '<div class="task-template-icon">' + (t.icon || '') + '</div>' +
                '<div class="task-template-name">' + t.name + '</div>' +
                '<div class="task-template-count">' + t.tasks.length + ' taches</div>' +
            '</div>';
        });

        html += '</div></div></div>';
        return html;
    }

    function open() {
        var existing = document.querySelector('.task-templates-overlay');
        if (existing) existing.remove();
        var div = document.createElement('div');
        div.innerHTML = renderModal();
        document.body.appendChild(div.firstChild);
    }

    function close() {
        var el = document.querySelector('.task-templates-overlay');
        if (el) el.remove();
    }

    async function apply(templateId) {
        var templates = getTemplates();
        var template = templates.find(function(t) { return t.id === templateId; });
        if (!template) return;

        close();

        var created = 0;
        for (var i = 0; i < template.tasks.length; i++) {
            var t = template.tasks[i];
            try {
                if (typeof Tasks !== 'undefined' && Tasks.create) {
                    await Tasks.create({ text: t.title, priority: getPriorityNum(t.priority) });
                    created++;
                }
            } catch (e) {
                console.error('Template task creation error:', e);
            }
        }

        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(created + ' taches creees depuis "' + template.name + '"', 'success');
        }
    }

    function getPriorityNum(p) {
        if (p === 'urgent') return 1;
        if (p === 'high') return 2;
        if (p === 'low') return 4;
        return 3;
    }

    function saveAsTemplate(name, tasks) {
        if (!name || !tasks || !tasks.length) return;
        var custom = [];
        try { custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { custom = []; }
        custom.push({
            id: 'custom-' + Date.now(),
            name: name,
            icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            tasks: tasks.map(function(t) {
                return { title: t.title || t.text, priority: t.priority || 'medium' };
            })
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    }

    return { open: open, close: close, apply: apply, saveAsTemplate: saveAsTemplate, renderModal: renderModal };
})();

if (typeof window !== 'undefined') window.TaskTemplates = TaskTemplates;
