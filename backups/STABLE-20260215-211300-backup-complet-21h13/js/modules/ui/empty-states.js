/**
 * EMPTY STATES - ProductiveApp v4.0
 * Etats vides illustres avec SVG inline
 */
const EmptyStates = (function() {
    'use strict';

    var states = {
        tasks: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><circle cx="60" cy="60" r="50" stroke="var(--accent)" stroke-width="2" stroke-dasharray="8 4" opacity="0.3"/><path d="M45 55l10 10 20-20" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="35" y="42" width="50" height="36" rx="8" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.4"/></svg>',
            title: 'Aucune tache pour le moment',
            text: 'Creez votre premiere tache pour commencer a organiser votre travail.',
            cta: 'Creer une tache',
            action: "document.getElementById('task-input')?.focus()"
        },
        projects: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><rect x="25" y="30" width="70" height="55" rx="8" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><rect x="25" y="30" width="35" height="12" rx="4" fill="var(--accent)" opacity="0.15"/><line x1="35" y1="55" x2="85" y2="55" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.3"/><line x1="35" y1="65" x2="75" y2="65" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.2"/><line x1="35" y1="75" x2="65" y2="75" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.15"/></svg>',
            title: 'Aucun projet',
            text: 'Les projets vous aident a regrouper vos taches par client ou par objectif.',
            cta: 'Nouveau projet',
            action: "document.getElementById('add-project-btn')?.click()"
        },
        notes: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><path d="M40 25h30l15 15v55a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V33a8 8 0 0 1 8-8z" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><path d="M70 25v15h15" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><line x1="42" y1="55" x2="78" y2="55" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.25"/><line x1="42" y1="65" x2="72" y2="65" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.2"/><line x1="42" y1="75" x2="62" y2="75" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.15"/></svg>',
            title: 'Aucune note',
            text: 'Capturez vos idees, reflexions et informations importantes.',
            cta: 'Ecrire une note',
            action: "if(typeof ViewRouter!=='undefined')ViewRouter.navigate('notes')"
        },
        clients: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><circle cx="60" cy="45" r="18" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><path d="M30 95c0-16.6 13.4-30 30-30s30 13.4 30 30" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><circle cx="85" cy="35" r="10" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.2"/><path d="M78 55c5-3 12-3 17 0" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.2"/></svg>',
            title: 'Aucun client',
            text: 'Ajoutez vos premiers clients pour suivre vos revenus et projets.',
            cta: 'Ajouter un client',
            action: "if(typeof ClientsView!=='undefined')ClientsView.showAddForm()"
        },
        calendar: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><rect x="25" y="30" width="70" height="60" rx="8" stroke="var(--accent)" stroke-width="2" opacity="0.3"/><line x1="25" y1="50" x2="95" y2="50" stroke="var(--accent)" stroke-width="1.5" opacity="0.2"/><line x1="45" y1="30" x2="45" y2="90" stroke="var(--border)" stroke-width="1" opacity="0.15"/><line x1="65" y1="30" x2="65" y2="90" stroke="var(--border)" stroke-width="1" opacity="0.15"/><circle cx="55" cy="65" r="4" fill="var(--accent)" opacity="0.3"/></svg>',
            title: 'Rien de prevu',
            text: 'Ajoutez des dates d\'echeance a vos taches pour les voir ici.',
            cta: 'Voir les taches',
            action: "if(typeof ViewRouter!=='undefined')ViewRouter.navigate('tasks')"
        },
        generic: {
            icon: '<svg viewBox="0 0 120 120" width="120" height="120" fill="none"><circle cx="60" cy="60" r="40" stroke="var(--border)" stroke-width="2" stroke-dasharray="6 4"/><path d="M50 55h20M50 65h12" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>',
            title: 'Rien a afficher',
            text: 'Il n\'y a pas encore de donnees ici.',
            cta: null,
            action: null
        }
    };

    function render(type) {
        var s = states[type] || states.generic;
        var html = '<div class="empty-state">' +
            '<div class="empty-state-icon">' + s.icon + '</div>' +
            '<h3 class="empty-state-title">' + s.title + '</h3>' +
            '<p class="empty-state-text">' + s.text + '</p>';
        if (s.cta) {
            html += '<button class="empty-state-cta" onclick="' + s.action + '">' + s.cta + '</button>';
        }
        html += '</div>';
        return html;
    }

    return { render: render };
})();

if (typeof window !== 'undefined') window.EmptyStates = EmptyStates;
