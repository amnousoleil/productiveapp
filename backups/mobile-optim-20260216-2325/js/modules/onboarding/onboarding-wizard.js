/**
 * ONBOARDING WIZARD - ProductiveApp v4.0
 * Guide de premiere utilisation en 5 etapes
 */
const OnboardingWizard = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_onboarding_done';
    var currentStep = 0;

    var steps = [
        {
            title: 'Bienvenue sur ProductiveApp !',
            description: 'Votre espace de travail tout-en-un pour gérer vos projets, tâches, finances et bien plus. Faisons un tour rapide ensemble.',
            icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
            target: null,
            action: null
        },
        {
            title: 'Créez votre premier projet',
            description: 'Les projets organisent vos tâches par objectif. Cliquez sur "Projets" dans la sidebar pour commencer.',
            icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
            target: '[data-view="projects"]',
            action: function() { if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('projects'); }
        },
        {
            title: 'Ajoutez des tâches',
            description: 'Gérez vos tâches avec le Kanban, le calendrier, les sous-tâches et la récurrence. Utilisez Cmd+N pour créer rapidement.',
            icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#10b981" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
            target: '[data-view="tasks"]',
            action: function() { if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('tasks'); }
        },
        {
            title: 'Explorez les vues',
            description: 'Dashboard, Galaxie 3D, Calendrier, Notes, Comptabilité, Rapports, Messagerie... Tout est dans la sidebar à gauche.',
            icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#8b5cf6" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
            target: '.sidebar',
            action: null
        },
        {
            title: 'Personnalisez votre espace',
            description: 'Choisissez parmi 60 thèmes, ajustez les animations, activez le mode zen (Ctrl+Shift+F), et explorez les raccourcis clavier (Shift+?).',
            icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ec4899" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
            target: '[data-view="settings"]',
            action: function() { if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('settings'); }
        }
    ];

    function shouldShow() {
        if (localStorage.getItem(STORAGE_KEY)) return false;
        // Montrer si pas de taches
        if (typeof AppState !== 'undefined' && AppState.tasks && AppState.tasks.length > 3) return false;
        return true;
    }

    function start() {
        if (!shouldShow()) return;
        currentStep = 0;
        renderStep();
    }

    function renderStep() {
        var step = steps[currentStep];
        if (!step) { complete(); return; }

        // Supprimer l'ancien overlay
        var old = document.querySelector('.onboarding-overlay');
        if (old) old.remove();

        var isFirst = currentStep === 0;
        var isLast = currentStep === steps.length - 1;
        var progress = ((currentStep + 1) / steps.length * 100).toFixed(0);

        var html = '<div class="onboarding-overlay">';
        html += '<div class="onboarding-modal">';

        // Progress bar
        html += '<div class="onboarding-progress"><div class="onboarding-progress-fill" style="width:' + progress + '%"></div></div>';

        // Contenu
        html += '<div class="onboarding-content">';
        html += '<div class="onboarding-icon">' + step.icon + '</div>';
        html += '<h2 class="onboarding-title">' + step.title + '</h2>';
        html += '<p class="onboarding-desc">' + step.description + '</p>';
        html += '</div>';

        // Dots
        html += '<div class="onboarding-dots">';
        for (var i = 0; i < steps.length; i++) {
            html += '<div class="onboarding-dot' + (i === currentStep ? ' active' : '') + (i < currentStep ? ' done' : '') + '"></div>';
        }
        html += '</div>';

        // Actions
        html += '<div class="onboarding-actions">';
        html += '<button class="onboarding-skip" onclick="OnboardingWizard.complete()">Passer</button>';
        html += '<div class="onboarding-nav">';
        if (!isFirst) {
            html += '<button class="onboarding-btn secondary" onclick="OnboardingWizard.prev()">Précédent</button>';
        }
        if (isLast) {
            html += '<button class="onboarding-btn primary" onclick="OnboardingWizard.complete()">C\'est parti !</button>';
        } else {
            html += '<button class="onboarding-btn primary" onclick="OnboardingWizard.next()">Suivant</button>';
        }
        html += '</div></div>';

        // Step counter
        html += '<div class="onboarding-counter">' + (currentStep + 1) + ' / ' + steps.length + '</div>';

        html += '</div></div>';

        var div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstChild);

        // Highlight target si present
        if (step.target) highlightTarget(step.target);
    }

    function highlightTarget(selector) {
        var el = document.querySelector(selector);
        if (!el) return;
        el.classList.add('onboarding-highlight');
        // Cleanup apres animation
        setTimeout(function() { el.classList.remove('onboarding-highlight'); }, 3000);
    }

    function next() {
        var step = steps[currentStep];
        if (step && step.action) step.action();
        currentStep++;
        renderStep();
    }

    function prev() {
        currentStep = Math.max(0, currentStep - 1);
        renderStep();
    }

    function complete() {
        localStorage.setItem(STORAGE_KEY, '1');
        var overlay = document.querySelector('.onboarding-overlay');
        if (overlay) {
            overlay.style.animation = 'onboardingFadeOut 0.3s ease forwards';
            setTimeout(function() { overlay.remove(); }, 300);
        }
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        start: start,
        next: next,
        prev: prev,
        complete: complete,
        reset: reset,
        shouldShow: shouldShow
    };
})();

if (typeof window !== 'undefined') window.OnboardingWizard = OnboardingWizard;
