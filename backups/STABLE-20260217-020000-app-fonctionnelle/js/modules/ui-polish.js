/**
 * UI POLISH - Loading Skeletons, Empty States, Transitions, Breadcrumbs
 * ProductiveApp v5.0 - Professional UX Layer
 */

const UIPolish = (function() {
    'use strict';

    let stylesInjected = false;

    // ========== SKELETON LOADING ==========

    function showSkeleton(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const templates = {
            dashboard: `
                <div class="skeleton-grid">
                    <div class="skeleton-card skeleton-card-lg">
                        <div class="skeleton-line skeleton-w60"></div>
                        <div class="skeleton-line skeleton-w80"></div>
                        <div class="skeleton-block"></div>
                    </div>
                    <div class="skeleton-card">
                        <div class="skeleton-circle"></div>
                        <div class="skeleton-line skeleton-w40"></div>
                        <div class="skeleton-line skeleton-w70"></div>
                    </div>
                    <div class="skeleton-card">
                        <div class="skeleton-circle"></div>
                        <div class="skeleton-line skeleton-w50"></div>
                        <div class="skeleton-line skeleton-w60"></div>
                    </div>
                    <div class="skeleton-card">
                        <div class="skeleton-circle"></div>
                        <div class="skeleton-line skeleton-w45"></div>
                        <div class="skeleton-line skeleton-w75"></div>
                    </div>
                </div>`,
            list: `
                <div class="skeleton-list">
                    ${Array(5).fill('').map(() => `
                    <div class="skeleton-list-item">
                        <div class="skeleton-circle skeleton-sm"></div>
                        <div class="skeleton-list-content">
                            <div class="skeleton-line skeleton-w70"></div>
                            <div class="skeleton-line skeleton-w40"></div>
                        </div>
                    </div>`).join('')}
                </div>`,
            cards: `
                <div class="skeleton-grid skeleton-grid-3">
                    ${Array(6).fill('').map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-line skeleton-w50"></div>
                        <div class="skeleton-line skeleton-w80"></div>
                        <div class="skeleton-line skeleton-w30"></div>
                        <div class="skeleton-block skeleton-block-sm"></div>
                    </div>`).join('')}
                </div>`,
            profile: `
                <div class="skeleton-profile">
                    <div class="skeleton-circle skeleton-lg"></div>
                    <div class="skeleton-line skeleton-w40"></div>
                    <div class="skeleton-line skeleton-w60"></div>
                    <div class="skeleton-divider"></div>
                    <div class="skeleton-line skeleton-w80"></div>
                    <div class="skeleton-line skeleton-w70"></div>
                    <div class="skeleton-line skeleton-w90"></div>
                </div>`,
            chat: `
                <div class="skeleton-chat">
                    ${Array(4).fill('').map((_, i) => `
                    <div class="skeleton-message ${i % 2 === 0 ? 'skeleton-msg-left' : 'skeleton-msg-right'}">
                        <div class="skeleton-circle skeleton-sm"></div>
                        <div class="skeleton-bubble">
                            <div class="skeleton-line skeleton-w${60 + Math.random() * 30 | 0}"></div>
                            <div class="skeleton-line skeleton-w${40 + Math.random() * 30 | 0}"></div>
                        </div>
                    </div>`).join('')}
                </div>`
        };

        const html = templates[type] || templates.list;
        container.innerHTML = `<div class="skeleton-container" data-skeleton="true">${html}</div>`;
    }

    function hideSkeleton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const skeleton = container.querySelector('[data-skeleton]');
        if (skeleton) {
            skeleton.classList.add('skeleton-fade-out');
            setTimeout(() => skeleton.remove(), 300);
        }
    }

    // ========== EMPTY STATES ==========

    const EMPTY_STATES = {
        tasks: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <rect x="20" y="30" width="80" height="60" rx="8" opacity="0.3"/>
                <line x1="35" y1="50" x2="85" y2="50" opacity="0.2"/>
                <line x1="35" y1="62" x2="70" y2="62" opacity="0.2"/>
                <line x1="35" y1="74" x2="55" y2="74" opacity="0.2"/>
                <circle cx="90" cy="85" r="20" fill="var(--accent)" opacity="0.15"/>
                <path d="M83 85 L88 90 L97 80" stroke="var(--accent)" stroke-width="2.5"/>
            </svg>`,
            title: 'Aucune tâche pour le moment',
            subtitle: 'Créez votre première tâche pour commencer à organiser votre journée',
            action: { label: 'Nouvelle tâche', icon: '+', onclick: "document.getElementById('task-input')?.focus()" }
        },
        notes: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <rect x="25" y="15" width="70" height="90" rx="6" opacity="0.3"/>
                <line x1="40" y1="35" x2="80" y2="35" opacity="0.2"/>
                <line x1="40" y1="50" x2="75" y2="50" opacity="0.2"/>
                <line x1="40" y1="65" x2="65" y2="65" opacity="0.2"/>
                <circle cx="60" cy="85" r="8" fill="var(--accent)" opacity="0.2"/>
                <path d="M56 85 L60 89 L64 81" stroke="var(--accent)" stroke-width="2"/>
            </svg>`,
            title: 'Aucune note',
            subtitle: 'Capturez vos idées, réflexions et inspirations',
            action: { label: 'Nouvelle note', icon: '✏️', onclick: "if(typeof NotesModule!=='undefined')NotesModule.createNew()" }
        },
        projects: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <rect x="15" y="25" width="40" height="35" rx="6" opacity="0.3"/>
                <rect x="65" y="25" width="40" height="35" rx="6" opacity="0.2"/>
                <rect x="15" y="68" width="40" height="35" rx="6" opacity="0.2"/>
                <rect x="65" y="68" width="40" height="35" rx="6" opacity="0.15"/>
                <circle cx="35" cy="42" r="6" fill="var(--accent)" opacity="0.3"/>
            </svg>`,
            title: 'Aucun projet',
            subtitle: 'Organisez votre travail en projets pour une meilleure visibilité',
            action: { label: 'Nouveau projet', icon: '📁', onclick: "if(typeof ProjectsView!=='undefined')ProjectsView.showCreateModal()" }
        },
        messages: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <path d="M20 30 Q20 20 30 20 L90 20 Q100 20 100 30 L100 70 Q100 80 90 80 L50 80 L30 100 L30 80 L30 80 Q20 80 20 70 Z" opacity="0.3"/>
                <circle cx="45" cy="50" r="4" fill="var(--text-secondary)" opacity="0.3"/>
                <circle cx="60" cy="50" r="4" fill="var(--text-secondary)" opacity="0.3"/>
                <circle cx="75" cy="50" r="4" fill="var(--text-secondary)" opacity="0.3"/>
            </svg>`,
            title: 'Aucune conversation',
            subtitle: 'Démarrez une discussion avec votre équipe',
            action: { label: 'Nouveau message', icon: '💬' }
        },
        reports: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <rect x="20" y="60" width="15" height="40" rx="3" fill="var(--accent)" opacity="0.15"/>
                <rect x="42" y="40" width="15" height="60" rx="3" fill="var(--accent)" opacity="0.2"/>
                <rect x="64" y="25" width="15" height="75" rx="3" fill="var(--accent)" opacity="0.25"/>
                <rect x="86" y="50" width="15" height="50" rx="3" fill="var(--accent)" opacity="0.15"/>
                <path d="M27 55 L49 35 L71 20 L93 45" stroke="var(--accent)" stroke-width="2" opacity="0.5"/>
            </svg>`,
            title: 'Aucun rapport',
            subtitle: 'Générez des rapports pour suivre votre progression',
            action: { label: 'Générer un rapport', icon: '📊' }
        },
        calendar: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <rect x="20" y="25" width="80" height="75" rx="8" opacity="0.3"/>
                <line x1="20" y1="45" x2="100" y2="45" opacity="0.2"/>
                <line x1="40" y1="25" x2="40" y2="15" stroke-width="2.5" stroke-linecap="round" opacity="0.3"/>
                <line x1="80" y1="25" x2="80" y2="15" stroke-width="2.5" stroke-linecap="round" opacity="0.3"/>
                <circle cx="45" cy="62" r="5" fill="var(--accent)" opacity="0.3"/>
                <circle cx="60" cy="78" r="5" fill="var(--accent)" opacity="0.2"/>
            </svg>`,
            title: 'Votre calendrier est vide',
            subtitle: 'Ajoutez des dates d\'échéance à vos tâches pour les voir ici',
            action: { label: 'Voir les tâches', icon: '📋', onclick: "ViewRouter.navigate('tasks')" }
        },
        generic: {
            icon: `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                <circle cx="60" cy="50" r="30" opacity="0.2"/>
                <path d="M60 35 L60 55" stroke-width="2.5" stroke-linecap="round" opacity="0.3"/>
                <circle cx="60" cy="65" r="2.5" fill="var(--text-secondary)" opacity="0.3"/>
            </svg>`,
            title: 'Rien à afficher',
            subtitle: 'Cette section est vide pour le moment',
            action: null
        }
    };

    function showEmptyState(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const state = EMPTY_STATES[type] || EMPTY_STATES.generic;

        let actionHtml = '';
        if (state.action) {
            actionHtml = `<button class="empty-state-action" onclick="${state.action.onclick || ''}">
                <span>${state.action.icon}</span> ${state.action.label}
            </button>`;
        }

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${state.icon}</div>
                <h3 class="empty-state-title">${state.title}</h3>
                <p class="empty-state-subtitle">${state.subtitle}</p>
                ${actionHtml}
            </div>`;
    }

    // ========== VIEW TRANSITIONS ==========

    function setupViewTransitions() {
        document.addEventListener('viewchange', function(e) {
            const viewId = e.detail.view;
            const container = document.getElementById('view-' + viewId) ||
                              document.getElementById('view-' + viewId.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (container) {
                container.classList.remove('view-enter');
                void container.offsetWidth; // force reflow
                container.classList.add('view-enter');
            }
        });
    }

    // ========== BREADCRUMB ==========

    const BREADCRUMB_MAP = {
        dashboard: [{ label: 'Accueil', icon: '🏠' }],
        tasks: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Tâches', icon: '✅' }],
        projects: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Projets', icon: '📁' }],
        notes: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Notes', icon: '📝' }],
        galaxy: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Galaxie', icon: '🌌' }],
        settings: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Paramètres', icon: '⚙️' }],
        analytics: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Analytique', icon: '📈' }],
        reports: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Rapports', icon: '📊' }],
        accounting: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Comptabilité', icon: '💰' }],
        psychoAudit: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Psycho-Audit', icon: '🧠' }],
        teamMessaging: [{ label: 'Accueil', view: 'dashboard' }, { label: 'TeamTalk', icon: '💬' }],
        campaigns: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Campagnes', icon: '📧' }],
        gamification: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Gamification', icon: '🎮' }],
        behavioral: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Mon Profil', icon: '👤' }],
        teamVision: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Vision équipe', icon: '👥' }],
        giriVision: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Giri Vision', icon: '📹' }],
        calendar: [{ label: 'Accueil', view: 'dashboard' }, { label: 'Calendrier', icon: '📅' }]
    };

    function renderBreadcrumb(viewId) {
        const crumbs = BREADCRUMB_MAP[viewId];
        if (!crumbs || crumbs.length <= 1) return '';

        return `<nav class="breadcrumb" aria-label="Navigation">
            ${crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                if (isLast) {
                    return `<span class="breadcrumb-current">${c.icon ? c.icon + ' ' : ''}${c.label}</span>`;
                }
                return `<a class="breadcrumb-link" onclick="ViewRouter.navigate('${c.view || 'dashboard'}')">${c.label}</a>
                        <span class="breadcrumb-sep">›</span>`;
            }).join('')}
        </nav>`;
    }

    function setupBreadcrumbs() {
        // Create breadcrumb container
        let bcContainer = document.getElementById('breadcrumb-bar');
        if (!bcContainer) {
            bcContainer = document.createElement('div');
            bcContainer.id = 'breadcrumb-bar';
            bcContainer.className = 'breadcrumb-bar';
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(bcContainer, mainContent.firstChild);
            }
        }

        document.addEventListener('viewchange', function(e) {
            bcContainer.innerHTML = renderBreadcrumb(e.detail.view);
        });
    }

    // ========== DYNAMIC FAVICON BADGE ==========

    let faviconBadgeCount = 0;
    const originalFavicon = document.querySelector('link[rel="icon"]')?.href || '';

    function updateFaviconBadge(count) {
        faviconBadgeCount = count;
        if (count <= 0) {
            const link = document.querySelector('link[rel="icon"]');
            if (link) link.href = originalFavicon;
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 64, 64);
            // Draw badge circle
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(50, 14, 14, 0, Math.PI * 2);
            ctx.fill();
            // Draw count
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 9 ? '9+' : String(count), 50, 14);
            // Update favicon
            const link = document.querySelector('link[rel="icon"]');
            if (link) link.href = canvas.toDataURL();
        };
        img.onerror = function() {
            // Fallback: just draw badge on blank
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(50, 14, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 9 ? '9+' : String(count), 50, 14);
            const link = document.querySelector('link[rel="icon"]');
            if (link) link.href = canvas.toDataURL();
        };
        img.src = originalFavicon;
    }

    // ========== TOOLTIPS ==========

    function setupTooltips() {
        document.addEventListener('mouseover', function(e) {
            const target = e.target.closest('[data-tooltip]');
            if (!target) return;

            let tip = document.querySelector('.ui-tooltip');
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'ui-tooltip';
                document.body.appendChild(tip);
            }

            tip.textContent = target.getAttribute('data-tooltip');
            tip.classList.add('visible');

            const rect = target.getBoundingClientRect();
            tip.style.left = rect.left + rect.width / 2 - tip.offsetWidth / 2 + 'px';
            tip.style.top = rect.top - tip.offsetHeight - 8 + 'px';
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('[data-tooltip]')) {
                const tip = document.querySelector('.ui-tooltip');
                if (tip) tip.classList.remove('visible');
            }
        });
    }

    // ========== KEYBOARD SHORTCUTS HELP ==========

    function showShortcutsHelp() {
        const existing = document.querySelector('.shortcuts-modal-overlay');
        if (existing) { existing.remove(); return; }

        const shortcuts = [
            { keys: '⌘/Ctrl + K', desc: 'Recherche globale' },
            { keys: 'N', desc: 'Ajout rapide' },
            { keys: '?', desc: 'Aide raccourcis' },
            { keys: 'G puis D', desc: 'Aller au Dashboard' },
            { keys: 'G puis T', desc: 'Aller aux Tâches' },
            { keys: 'G puis P', desc: 'Aller aux Projets' },
            { keys: 'G puis N', desc: 'Aller aux Notes' },
            { keys: 'G puis C', desc: 'Aller au Calendrier' },
            { keys: 'G puis R', desc: 'Aller aux Rapports' },
            { keys: 'G puis S', desc: 'Aller aux Paramètres' },
            { keys: 'Échap', desc: 'Fermer modal / retour' },
        ];

        const overlay = document.createElement('div');
        overlay.className = 'shortcuts-modal-overlay';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="shortcuts-modal">
                <div class="shortcuts-header">
                    <h3>Raccourcis clavier</h3>
                    <button class="shortcuts-close" onclick="this.closest('.shortcuts-modal-overlay').remove()">✕</button>
                </div>
                <div class="shortcuts-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <kbd class="shortcut-keys">${s.keys}</kbd>
                            <span class="shortcut-desc">${s.desc}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="shortcuts-footer">
                    Appuyez sur <kbd>?</kbd> pour afficher/masquer
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }

    // Go-to shortcuts (G then letter)
    let gPressed = false;
    let gTimeout = null;

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ignore when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

            // ? = show shortcuts help
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                showShortcutsHelp();
                return;
            }

            // G prefix for navigation
            if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !gPressed) {
                gPressed = true;
                clearTimeout(gTimeout);
                gTimeout = setTimeout(() => { gPressed = false; }, 1000);
                return;
            }

            if (gPressed) {
                gPressed = false;
                clearTimeout(gTimeout);
                const goMap = {
                    d: 'dashboard', t: 'tasks', p: 'projects',
                    n: 'notes', c: 'calendar', r: 'reports',
                    s: 'settings', a: 'accounting', g: 'gamification',
                    m: 'teamMessaging'
                };
                if (goMap[e.key] && typeof ViewRouter !== 'undefined') {
                    e.preventDefault();
                    ViewRouter.navigate(goMap[e.key]);
                }
            }
        });
    }

    // ========== CSS INJECTION ==========

    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;

        const css = `
/* ===== SKELETON LOADING ===== */
.skeleton-container { padding: 20px; }
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.skeleton-grid-3 { grid-template-columns: repeat(3, 1fr); }
.skeleton-card { background: var(--surface, #1e1e2e); border-radius: 12px; padding: 20px; }
.skeleton-card-lg { grid-column: span 2; }
.skeleton-line { height: 14px; border-radius: 7px; background: linear-gradient(90deg, var(--border, #333) 25%, var(--surface-hover, #2a2a3e) 50%, var(--border, #333) 75%); background-size: 200% 100%; animation: skeletonShimmer 1.5s ease-in-out infinite; margin-bottom: 12px; }
.skeleton-w30 { width: 30%; } .skeleton-w40 { width: 40%; } .skeleton-w45 { width: 45%; }
.skeleton-w50 { width: 50%; } .skeleton-w60 { width: 60%; } .skeleton-w70 { width: 70%; }
.skeleton-w75 { width: 75%; } .skeleton-w80 { width: 80%; } .skeleton-w90 { width: 90%; }
.skeleton-circle { width: 48px; height: 48px; border-radius: 50%; background: var(--border, #333); animation: skeletonShimmer 1.5s ease-in-out infinite; margin-bottom: 12px; }
.skeleton-circle.skeleton-sm { width: 36px; height: 36px; }
.skeleton-circle.skeleton-lg { width: 80px; height: 80px; margin: 0 auto 16px; }
.skeleton-block { height: 120px; border-radius: 8px; background: var(--border, #333); animation: skeletonShimmer 1.5s ease-in-out infinite; }
.skeleton-block-sm { height: 60px; }
.skeleton-list-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border, #333); }
.skeleton-list-content { flex: 1; }
.skeleton-divider { height: 1px; background: var(--border, #333); margin: 16px 0; }
.skeleton-profile { text-align: center; padding: 30px 20px; }
.skeleton-message { display: flex; gap: 8px; margin-bottom: 16px; }
.skeleton-msg-right { flex-direction: row-reverse; }
.skeleton-bubble { flex: 0 1 60%; background: var(--surface, #1e1e2e); border-radius: 12px; padding: 12px; }
.skeleton-chat { padding: 20px; }
.skeleton-fade-out { opacity: 0; transition: opacity 0.3s ease; }

@keyframes skeletonShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ===== EMPTY STATES ===== */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; min-height: 300px; }
.empty-state-icon { margin-bottom: 24px; opacity: 0.8; }
.empty-state-icon svg { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1)); }
.empty-state-title { font-size: 20px; font-weight: 600; color: var(--text, #fff); margin: 0 0 8px; }
.empty-state-subtitle { font-size: 14px; color: var(--text-secondary, #888); margin: 0 0 24px; max-width: 400px; line-height: 1.6; }
.empty-state-action { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: var(--accent, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.empty-state-action:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4); }

/* ===== VIEW TRANSITIONS ===== */
.view-enter { animation: viewSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes viewSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ===== BREADCRUMB ===== */
.breadcrumb-bar { padding: 8px 24px 0; min-height: 0; }
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary, #888); }
.breadcrumb-link { color: var(--text-secondary, #888); text-decoration: none; cursor: pointer; transition: color 0.2s; }
.breadcrumb-link:hover { color: var(--accent, #8b5cf6); }
.breadcrumb-sep { color: var(--border, #444); font-size: 11px; }
.breadcrumb-current { color: var(--text, #fff); font-weight: 500; }

/* ===== TOOLTIPS ===== */
.ui-tooltip { position: fixed; padding: 6px 12px; background: var(--surface, #1e1e2e); color: var(--text, #fff); border: 1px solid var(--border, #333); border-radius: 8px; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transform: translateY(4px); transition: opacity 0.2s, transform 0.2s; z-index: 100001; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.ui-tooltip.visible { opacity: 1; transform: translateY(0); }

/* ===== SHORTCUTS MODAL ===== */
.shortcuts-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100002; animation: fadeIn 0.2s ease; }
.shortcuts-modal { background: var(--surface, #1e1e2e); border: 1px solid var(--border, #333); border-radius: 16px; padding: 24px; width: 420px; max-width: 90vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.shortcuts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.shortcuts-header h3 { margin: 0; font-size: 18px; color: var(--text, #fff); }
.shortcuts-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.shortcuts-close:hover { background: var(--surface-hover, #2a2a3e); }
.shortcut-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border, #222); }
.shortcut-item:last-child { border: none; }
.shortcut-keys { background: var(--bg, #0f0f1a); border: 1px solid var(--border, #333); border-radius: 6px; padding: 3px 8px; font-size: 12px; font-family: monospace; color: var(--text, #fff); min-width: 80px; text-align: center; }
.shortcut-desc { color: var(--text-secondary, #888); font-size: 13px; }
.shortcuts-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border, #333); text-align: center; font-size: 12px; color: var(--text-secondary, #666); }
.shortcuts-footer kbd { background: var(--bg, #0f0f1a); border: 1px solid var(--border, #333); border-radius: 4px; padding: 1px 6px; font-size: 11px; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .skeleton-grid { grid-template-columns: 1fr; }
    .skeleton-grid-3 { grid-template-columns: 1fr; }
    .skeleton-card-lg { grid-column: span 1; }
    .empty-state { padding: 40px 16px; }
    .shortcuts-modal { width: 95vw; }
}

@media (prefers-reduced-motion: reduce) {
    .view-enter { animation: none; }
    .skeleton-line, .skeleton-circle, .skeleton-block { animation: none; }
}
`;

        const style = document.createElement('style');
        style.id = 'ui-polish-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ========== INIT ==========

    function init() {
        injectStyles();
        setupViewTransitions();
        setupBreadcrumbs();
        setupTooltips();
        setupKeyboardShortcuts();
        console.log('✨ UIPolish: Initialized (skeletons, empty states, transitions, breadcrumbs, tooltips, shortcuts)');
    }

    return {
        init,
        showSkeleton,
        hideSkeleton,
        showEmptyState,
        showShortcutsHelp,
        updateFaviconBadge,
        renderBreadcrumb
    };
})();

if (typeof window !== 'undefined') {
    window.UIPolish = UIPolish;
}
