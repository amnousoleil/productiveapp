/**
 * ================================================
 * SMART ONBOARDING - ProductiveApp v5.0
 * Tour guide, setup wizard, checklist persistante
 * ================================================
 */
const SmartOnboarding = (function() {
    'use strict';

    let tourActive = false;
    let currentStep = 0;
    let overlayEl = null;
    let checklistEl = null;
    let initialized = false;

    const TOUR_STEPS = [
        { target: '#app-sidebar', text: 'Votre espace de navigation principal. Acc\u00e9dez \u00e0 toutes les fonctionnalit\u00e9s depuis ici.', title: 'Sidebar', navigate: null },
        { target: '#view-dashboard', text: 'Votre tableau de bord avec KPIs, graphiques et vue d\'ensemble de votre activit\u00e9.', title: 'Tableau de bord', navigate: 'dashboard' },
        { target: '.sidebar-item[data-id="tasks"]', text: 'G\u00e9rez vos t\u00e2ches, d\u00e9finissez des priorit\u00e9s et suivez votre progression.', title: 'T\u00e2ches', navigate: null },
        { target: '.sidebar-item[data-id="notes"]', text: 'Prenez des notes enrichies avec \u00e9diteur avanc\u00e9 et assistance IA.', title: 'Notes', navigate: null },
        { target: '.sidebar-item[data-id="accounting"]', text: 'Comptabilit\u00e9 compl\u00e8te : factures, devis, TVA, rapprochement bancaire.', title: 'Comptabilit\u00e9', navigate: null },
        { target: '.sidebar-item[data-id="accounting"]', text: 'Scannez vos factures avec l\'IA ! Photo \u2192 extraction automatique \u2192 classement.', title: 'FinScan', navigate: null },
        { target: '.sidebar-item[data-id="settings"]', text: 'Personnalisez votre espace : th\u00e8mes, sidebar, animations, et plus.', title: 'Param\u00e8tres', navigate: null },
        { target: '.quick-add-fab, #quick-add-fab', text: 'Cr\u00e9ez rapidement une t\u00e2che, note ou facture depuis n\'importe o\u00f9 !', title: 'Cr\u00e9ation rapide', navigate: null }
    ];

    const CHECKLIST_ITEMS = [
        { id: 'create_task', label: 'Cr\u00e9er une t\u00e2che', icon: '\u2705', detect: () => (typeof AppState !== 'undefined' && (AppState.tasks?.length > 0)) },
        { id: 'write_note', label: '\u00c9crire une note', icon: '\ud83d\uddd2\ufe0f', detect: () => (typeof AppState !== 'undefined' && (AppState.notes?.length > 0)) },
        { id: 'create_invoice', label: 'Cr\u00e9er une facture', icon: '\ud83d\udcb0', detect: () => !!localStorage.getItem('productiveapp_invoice_created') },
        { id: 'scan_document', label: 'Scanner un document', icon: '\ud83d\udcf7', detect: () => !!localStorage.getItem('productiveapp_scan_done') },
        { id: 'add_contact', label: 'Ajouter un contact', icon: '\ud83d\udc64', detect: () => !!localStorage.getItem('productiveapp_contact_created') },
        { id: 'change_theme', label: 'Personnaliser le th\u00e8me', icon: '\ud83c\udfa8', detect: () => !!localStorage.getItem('selectedTheme') },
        { id: 'explore_reports', label: 'Explorer les rapports', icon: '\ud83d\udcca', detect: () => !!localStorage.getItem('productiveapp_reports_viewed') },
        { id: 'setup_company', label: 'Configurer l\'entreprise', icon: '\ud83c\udfe2', detect: () => !!localStorage.getItem('productiveapp_company_setup') }
    ];

    // ============================================
    // TOUR
    // ============================================
    function startTour() {
        tourActive = true;
        currentStep = 0;
        showTourStep();
    }

    function showTourStep() {
        if (currentStep >= TOUR_STEPS.length) { endTour(); return; }
        const step = TOUR_STEPS[currentStep];

        // Navigate if needed
        if (step.navigate && typeof Sidebar !== 'undefined') {
            Sidebar.navigate(step.navigate);
        }

        // Remove old overlay
        if (overlayEl) overlayEl.remove();

        // Find target
        const target = document.querySelector(step.target);
        const rect = target ? target.getBoundingClientRect() : { top: window.innerHeight / 2 - 50, left: window.innerWidth / 2 - 100, width: 200, height: 100 };

        overlayEl = document.createElement('div');
        overlayEl.className = 'onb-overlay';
        overlayEl.innerHTML = `
            <div class="onb-spotlight" style="top:${rect.top - 8}px;left:${rect.left - 8}px;width:${rect.width + 16}px;height:${rect.height + 16}px"></div>
            <div class="onb-tooltip" style="top:${Math.min(rect.bottom + 16, window.innerHeight - 220)}px;left:${Math.max(16, Math.min(rect.left, window.innerWidth - 340))}px">
                <div class="onb-tooltip-step">\u00c9tape ${currentStep + 1}/${TOUR_STEPS.length}</div>
                <div class="onb-tooltip-title">${step.title}</div>
                <div class="onb-tooltip-text">${step.text}</div>
                <div class="onb-tooltip-actions">
                    <button class="onb-skip" onclick="SmartOnboarding.endTour()">Passer</button>
                    <button class="onb-next" onclick="SmartOnboarding.nextStep()">${currentStep < TOUR_STEPS.length - 1 ? 'Suivant \u2192' : 'Terminer \u2705'}</button>
                </div>
                <div class="onb-dots">${TOUR_STEPS.map((_, i) => `<span class="onb-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}"></span>`).join('')}</div>
            </div>
        `;
        document.body.appendChild(overlayEl);

        if (target) target.style.position = target.style.position || 'relative';
    }

    function nextStep() {
        currentStep++;
        showTourStep();
    }

    function endTour() {
        tourActive = false;
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
        localStorage.setItem('productiveapp_tour_done', 'true');
    }

    // ============================================
    // CHECKLIST
    // ============================================
    function getProgress() {
        const saved = JSON.parse(localStorage.getItem('productiveapp_onboarding_progress') || '{}');
        let completed = 0;
        CHECKLIST_ITEMS.forEach(item => {
            if (saved[item.id] || item.detect()) {
                saved[item.id] = true;
                completed++;
            }
        });
        localStorage.setItem('productiveapp_onboarding_progress', JSON.stringify(saved));
        return { completed, total: CHECKLIST_ITEMS.length, items: saved };
    }

    function markStepComplete(stepId) {
        const saved = JSON.parse(localStorage.getItem('productiveapp_onboarding_progress') || '{}');
        saved[stepId] = true;
        localStorage.setItem('productiveapp_onboarding_progress', JSON.stringify(saved));
        const { completed, total } = getProgress();
        if (completed >= total) {
            localStorage.setItem('productiveapp_onboarding_complete', 'true');
        }
        renderChecklist();
    }

    function showChecklist() {
        if (checklistEl) { checklistEl.remove(); checklistEl = null; return; }
        const { completed, total, items } = getProgress();
        checklistEl = document.createElement('div');
        checklistEl.className = 'onb-checklist';
        checklistEl.innerHTML = `
            <div class="onb-cl-header">
                <span class="onb-cl-title">D\u00e9marrage</span>
                <span class="onb-cl-progress">${completed}/${total}</span>
                <button class="onb-cl-close" onclick="SmartOnboarding.showChecklist()">\u00d7</button>
            </div>
            <div class="onb-cl-bar"><div class="onb-cl-bar-fill" style="width:${(completed/total)*100}%"></div></div>
            <div class="onb-cl-items">
                ${CHECKLIST_ITEMS.map(item => `
                    <div class="onb-cl-item ${items[item.id] ? 'done' : ''}">
                        <span class="onb-cl-icon">${items[item.id] ? '\u2705' : item.icon}</span>
                        <span class="onb-cl-label">${item.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(checklistEl);
    }

    function renderChecklist() {
        if (checklistEl) { checklistEl.remove(); checklistEl = null; showChecklist(); }
    }

    // ============================================
    // CSS
    // ============================================
    function injectStyles() {
        if (document.getElementById('onboarding-styles')) return;
        const s = document.createElement('style');
        s.id = 'onboarding-styles';
        s.textContent = `
            .onb-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.6)}
            .onb-spotlight{position:absolute;border:3px solid var(--accent,#d4af37);border-radius:8px;box-shadow:0 0 0 9999px rgba(0,0,0,0.55);pointer-events:none;transition:all 0.4s ease}
            .onb-tooltip{position:absolute;width:300px;background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:12px;padding:16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:100001}
            .onb-tooltip-step{font-size:11px;color:var(--accent,#d4af37);font-weight:600;margin-bottom:4px}
            .onb-tooltip-title{font-size:16px;font-weight:700;color:var(--text-primary,#fff);margin-bottom:6px}
            .onb-tooltip-text{font-size:13px;color:var(--text-secondary,#aaa);line-height:1.5;margin-bottom:12px}
            .onb-tooltip-actions{display:flex;justify-content:space-between;align-items:center}
            .onb-skip{background:none;border:none;color:var(--text-secondary,#888);font-size:12px;cursor:pointer;padding:4px 8px}
            .onb-skip:hover{color:var(--text-primary,#fff)}
            .onb-next{background:var(--accent,#d4af37);color:#000;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
            .onb-next:hover{filter:brightness(1.1)}
            .onb-dots{display:flex;gap:5px;justify-content:center;margin-top:12px}
            .onb-dot{width:6px;height:6px;border-radius:50%;background:var(--border-color,#444)}
            .onb-dot.active{background:var(--accent,#d4af37);width:18px;border-radius:3px}
            .onb-dot.done{background:var(--accent,#d4af37);opacity:0.5}
            .onb-checklist{position:fixed;bottom:80px;left:20px;width:260px;background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border-color,#333);border-radius:12px;padding:14px;z-index:800;box-shadow:0 8px 24px rgba(0,0,0,0.3);font-family:Inter,system-ui,sans-serif}
            .onb-cl-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
            .onb-cl-title{font-size:13px;font-weight:600;color:var(--text-primary,#fff);flex:1}
            .onb-cl-progress{font-size:11px;color:var(--accent,#d4af37);font-weight:600}
            .onb-cl-close{background:none;border:none;color:var(--text-secondary,#888);font-size:18px;cursor:pointer;padding:0 4px}
            .onb-cl-bar{height:3px;background:var(--border-color,#333);border-radius:2px;margin-bottom:10px}
            .onb-cl-bar-fill{height:100%;background:var(--accent,#d4af37);border-radius:2px;transition:width 0.3s}
            .onb-cl-items{display:flex;flex-direction:column;gap:6px}
            .onb-cl-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;transition:background 0.2s}
            .onb-cl-item:hover{background:var(--bg-primary,#111)}
            .onb-cl-item.done{opacity:0.5}
            .onb-cl-item.done .onb-cl-label{text-decoration:line-through}
            .onb-cl-icon{font-size:14px;width:20px;text-align:center}
            .onb-cl-label{font-size:12px;color:var(--text-primary,#fff)}
            .onb-badge{position:fixed;bottom:80px;left:20px;z-index:799;background:var(--accent,#d4af37);color:#000;border:none;padding:6px 12px;border-radius:16px;font-size:11px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3)}
            .onb-badge:hover{filter:brightness(1.1)}
        `;
        document.head.appendChild(s);
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        if (initialized) return;
        injectStyles();

        const isComplete = localStorage.getItem('productiveapp_onboarding_complete');
        const tourDone = localStorage.getItem('productiveapp_tour_done');

        // Auto-start tour on first visit
        if (!tourDone && !isComplete) {
            setTimeout(() => startTour(), 2000);
        }

        // Show checklist badge if not complete
        if (!isComplete) {
            const { completed, total } = getProgress();
            if (completed < total) {
                const badge = document.createElement('button');
                badge.className = 'onb-badge';
                badge.id = 'onboarding-badge';
                badge.innerHTML = `\ud83d\ude80 ${completed}/${total}`;
                badge.onclick = () => showChecklist();
                document.body.appendChild(badge);
            }
        }

        initialized = true;
        console.log('[SmartOnboarding] Initialized');
    }

    return { init, startTour, nextStep, endTour, showChecklist, getProgress, markStepComplete };
})();

window.SmartOnboarding = SmartOnboarding;
