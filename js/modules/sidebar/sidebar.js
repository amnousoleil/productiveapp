/**
 * ================================================
 * SIDEBAR MODULE - ProductiveApp v3.2
 * Design premium avec tooltips élégants
 * ================================================
 */

const Sidebar = (function() {
    'use strict';

    // === STORAGE ===
    const STORAGE_KEY = 'productiveapp_sidebar';

    // === STATE ===
    let state = {
        mobileOpen: false,
        activeItem: 'dashboard',
        userStatus: 'online',
        unreadMessages: 0
    };

    // === NAVIGATION CONFIG ===
    const navItems = [
        { id: 'dashboard', icon: 'home', label: 'Dashboard', tooltip: 'Tableau de bord principal' },
        { id: 'team-vision', icon: 'users', label: 'Vision Team', tooltip: 'Vue globale equipe' },
        { id: 'tasks', icon: 'check-square', label: 'Tâches', tooltip: 'Gérer vos tâches Kanban' },
        { id: 'notes', icon: 'file-text', label: 'Notes', tooltip: 'Éditeur de notes (Ctrl+N)' },
        { id: 'projects', icon: 'folder', label: 'Projets', tooltip: 'Vos projets' },
        { id: 'galaxy', icon: 'sparkles', label: 'Galaxy', tooltip: 'Vue Galaxy immersive' },
        { id: 'divider1', type: 'divider' },
        { id: 'mahayawen', icon: 'bot', label: 'Mahayawen', tooltip: 'Assistant IA Mahayawen', badge: true },
        { id: 'team-messaging', icon: 'messages', label: 'TeamTalk', tooltip: 'TeamTalk' },
        { id: 'campaigns', icon: 'mail', label: 'Campagnes', tooltip: 'Email Campaigns', tag: 'NEW' },
        { id: 'journal', icon: 'book-open', label: 'Journal', tooltip: 'Journal d\'activité' },
        { id: 'divider2', type: 'divider' },
        { id: 'psycho-audit', icon: 'brain', label: 'Psycho-Audit', tooltip: 'Analyse comportementale', tag: 'NEW' },
        { id: 'analytics', icon: 'bar-chart-2', label: 'Analytics', tooltip: 'Statistiques détaillées' },
        { id: 'reports', icon: 'file-bar-chart', label: 'Rapports', tooltip: 'Générer des rapports' },
        { id: 'accounting', icon: 'dollar-sign', label: 'Comptabilité', tooltip: 'Gestion financière' },
        { id: 'gamification', icon: 'trophy', label: 'Gamification', tooltip: 'XP, niveaux et achievements' }
    ];

    const footerItems = [
        { id: 'settings', icon: 'settings', label: 'Paramètres', tooltip: 'Réglages de l\'app' },
        { id: 'theme', icon: 'palette', label: 'Thème', tooltip: 'Changer le thème visuel' },
        { id: 'help', icon: 'help-circle', label: 'Aide', tooltip: 'Aide et raccourcis' },
        { id: 'logout', icon: 'log-out', label: 'Déconnexion', tooltip: 'Se déconnecter' }
    ];

    // === ICONS SVG ===
    const icons = {
        home: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        users: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        'check-square': '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        sparkles: '<svg viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>',
        'messages': '<svg viewBox="0 0 24 24"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>',
        'bot': '<svg viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
        'book-open': '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        brain: '<svg viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        'bar-chart-2': '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'file-bar-chart': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>',
        settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        palette: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.28-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67H16c3.05 0 5.56-2.5 5.56-5.56C21.97 6.01 17.46 2 12 2z"/></svg>',
        'help-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        'log-out': '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        'dollar-sign': '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        trophy: '<svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
    };

    // === TOOLTIP ELEMENT ===
    let tooltipEl = null;

    function getIcon(name) {
        return icons[name] || icons.home;
    }

    // === RENDER ===
    function render() {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;

        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const userName = user?.name || 'Utilisateur';
        const userAvatar = user?.avatar || '👤';
        const isImageAvatar = userAvatar && userAvatar.includes('http');

        sidebar.innerHTML = `
            <!-- HEADER -->
            <div class="sidebar-header">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png"
                     alt="ProductiveApp"
                     class="sidebar-logo"
                     onclick="Sidebar.goHome()">
                <div class="sidebar-brand">
                    <span class="sidebar-brand-name">ProductiveApp</span>
                    <span class="sidebar-brand-version">v3.2</span>
                </div>
            </div>

            <!-- PROFILE -->
            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    ${isImageAvatar
                        ? `<img src="${userAvatar}" alt="${userName}">`
                        : `<div class="sidebar-avatar-emoji">${userAvatar}</div>`
                    }
                    <div class="sidebar-status-dot ${state.userStatus}"
                         onclick="Sidebar.toggleStatusDropdown(event)"
                         title="Changer de statut"></div>
                    <div class="sidebar-status-dropdown" id="status-dropdown">
                        <div class="sidebar-status-option" onclick="Sidebar.setStatus('online')">
                            <span class="status-dot online"></span>
                            <span>En ligne</span>
                        </div>
                        <div class="sidebar-status-option" onclick="Sidebar.setStatus('busy')">
                            <span class="status-dot busy"></span>
                            <span>Occupé</span>
                        </div>
                        <div class="sidebar-status-option" onclick="Sidebar.setStatus('away')">
                            <span class="status-dot away"></span>
                            <span>Absent</span>
                        </div>
                        <div class="sidebar-status-option" onclick="Sidebar.setStatus('offline')">
                            <span class="status-dot offline"></span>
                            <span>Invisible</span>
                        </div>
                    </div>
                </div>
                <div class="sidebar-profile-info">
                    <div class="sidebar-profile-name">${userName}</div>
                    <div class="sidebar-profile-status">${getStatusLabel(state.userStatus)}</div>
                </div>
            </div>

            <!-- NAVIGATION -->
            <nav class="sidebar-nav">
                ${navItems.map(item => renderNavItem(item)).join('')}
            </nav>

            <!-- FOOTER -->
            <div class="sidebar-footer">
                ${footerItems.map(item => renderNavItem(item, true)).join('')}
            </div>
        `;

        // Add body class
        document.body.classList.add('has-sidebar');

        // Setup tooltips
        setupTooltips();
    }

    function renderNavItem(item) {
        if (item.type === 'divider') {
            return '<div class="sidebar-divider"></div>';
        }

        const isActive = state.activeItem === item.id;
        const badgeCount = item.badge ? state.unreadMessages : 0;

        return `
            <div class="sidebar-item ${isActive ? 'active' : ''}"
                 data-id="${item.id}"
                 data-tooltip="${item.tooltip}"
                 onclick="Sidebar.navigate('${item.id}')">
                <span class="sidebar-item-icon">${getIcon(item.icon)}</span>
                <span class="sidebar-label">${item.label}</span>
                ${item.tag ? `<span class="sidebar-tag ${item.tag.toLowerCase()}">${item.tag}</span>` : ''}
                ${badgeCount > 0 ? `<span class="sidebar-badge">${badgeCount}</span>` : ''}
            </div>
        `;
    }

    function getStatusLabel(status) {
        const labels = { online: 'En ligne', busy: 'Occupé', away: 'Absent', offline: 'Invisible' };
        return labels[status] || 'En ligne';
    }

    // === TOOLTIPS ===
    let sidebarHovered = false;

    function setupTooltips() {
        // Create tooltip element if not exists
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'sidebar-tooltip';
            document.body.appendChild(tooltipEl);
        }

        // Track sidebar hover state
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) {
            sidebar.addEventListener('mouseenter', () => { sidebarHovered = true; hideTooltip(); });
            sidebar.addEventListener('mouseleave', () => { sidebarHovered = false; });
        }

        // Add event listeners to all items with tooltips
        document.querySelectorAll('.sidebar-item[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', showTooltip);
            el.addEventListener('mouseleave', hideTooltip);
        });
    }

    function showTooltip(e) {
        const target = e.currentTarget;
        const text = target.dataset.tooltip;
        if (!text || !tooltipEl) return;

        // Don't show on mobile or when sidebar is expanded (hovered)
        if (window.innerWidth <= 768) return;
        if (sidebarHovered) return;

        const rect = target.getBoundingClientRect();
        tooltipEl.textContent = text;
        tooltipEl.style.top = `${rect.top + rect.height / 2}px`;
        tooltipEl.style.transform = `translateY(-50%)`;
        tooltipEl.classList.add('visible');
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.classList.remove('visible');
        }
    }

    // === NAVIGATION ===
    function navigate(itemId) {
        state.activeItem = itemId;

        // Update visual state
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });

        // Execute action
        executeNavigation(itemId);

        // Close mobile
        if (window.innerWidth <= 768) {
            closeMobile();
        }
    }

    function executeNavigation(itemId) {
        // Use ViewRouter for main views
        const routedViews = ['dashboard', 'tasks', 'projects', 'notes', 'galaxy', 'analytics', 'reports', 'accounting', 'psycho-audit', 'gamification', 'team-vision'];

        if (routedViews.includes(itemId) && typeof ViewRouter !== 'undefined') {
            // Map sidebar IDs to router IDs
            const routerIdMap = { 'psycho-audit': 'psychoAudit', 'team-vision': 'teamVision' };
            const routerId = routerIdMap[itemId] || itemId;
            ViewRouter.navigate(routerId);
            return;
        }

        switch (itemId) {
            case 'galaxy':
                openGalaxy();
                break;
            case 'mahayawen':
                openChatbot();
                break;
            case 'team-messaging':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('teamMessaging');
                break;
            case 'campaigns':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('campaigns');
                break;
            case 'journal':
                // Navigate to tasks then scroll
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('tasks');
                setTimeout(scrollToJournal, 100);
                break;
            case 'psycho-audit':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('psychoAudit');
                break;
            case 'analytics':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('analytics');
                break;
            case 'reports':
                if (typeof ViewRouter !== 'undefined') ViewRouter.navigate('reports');
                break;
            case 'settings':
                console.log('Settings - Coming soon');
                break;
            case 'theme':
                toggleThemeModal();
                break;
            case 'help':
                console.log('Help - Coming soon');
                break;
            case 'logout':
                logout();
                break;
        }
    }

    // === NAVIGATION HELPERS ===
    function goHome() {
        if (typeof ViewRouter !== 'undefined') {
            ViewRouter.navigate('dashboard');
        }
    }

    function openGalaxy() {
        const icon = document.getElementById('galaxy-icon');
        if (icon) icon.click();
    }

    function openChatbot() {
        // Toggle: ouvre si fermé, ferme si ouvert
        const toggle = document.getElementById('chatbot-toggle');
        if (toggle) toggle.click();
    }

    function scrollToJournal() {
        const journal = document.querySelector('.journal-section');
        if (journal) journal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openPremiumReport() {
        const btn = document.getElementById('premium-report-btn');
        if (btn) btn.click();
    }

    function scrollToReports() {
        const reports = document.querySelector('.journal-report');
        if (reports) reports.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function toggleThemeModal() {
        const btn = document.getElementById('theme-btn');
        if (btn) btn.click();
    }

    function logout() {
        if (typeof Auth !== 'undefined' && Auth.logout) {
            Auth.logout();
        } else {
            const btn = document.getElementById('logout-btn');
            if (btn) btn.click();
        }
    }

    // === STATUS ===
    function toggleStatusDropdown(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    }

    function setStatus(newStatus) {
        state.userStatus = newStatus;

        const dot = document.querySelector('.sidebar-status-dot');
        if (dot) dot.className = `sidebar-status-dot ${newStatus}`;

        const statusText = document.querySelector('.sidebar-profile-status');
        if (statusText) statusText.textContent = getStatusLabel(newStatus);

        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) dropdown.classList.remove('active');

        saveState();
    }

    // === MOBILE ===
    function toggleMobile() {
        state.mobileOpen = !state.mobileOpen;
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-mobile-overlay');

        if (sidebar) sidebar.classList.toggle('open', state.mobileOpen);
        if (overlay) overlay.classList.toggle('active', state.mobileOpen);
    }

    function closeMobile() {
        state.mobileOpen = false;
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-mobile-overlay');

        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }

    // === SEARCH ===
    function openSearch() {
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.classList.add('active');
            const input = overlay.querySelector('.global-search-input');
            if (input) setTimeout(() => input.focus(), 100);
        }
    }

    function closeSearch() {
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // === STATE ===
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            userStatus: state.userStatus
        }));
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.userStatus = parsed.userStatus || 'online';
            }
        } catch (e) {
            console.warn('Sidebar: Could not load state', e);
        }
    }

    // === KEYBOARD SHORTCUTS ===
    function initShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K: Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            // Escape: Close search
            if (e.key === 'Escape') {
                closeSearch();
            }
            // Ctrl+G: Galaxy
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                navigate('galaxy');
            }
            // Ctrl+M: Messaging
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                navigate('messaging');
            }
        });
    }

    // === INIT ===
    function init() {
        console.log('🎨 Sidebar: Initializing...');
        loadState();
        render();
        initShortcuts();

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sidebar-avatar')) {
                const dropdown = document.getElementById('status-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });

        // Mobile overlay
        const overlay = document.getElementById('sidebar-mobile-overlay');
        if (overlay) overlay.addEventListener('click', closeMobile);

        // Search modal
        const searchOverlay = document.getElementById('global-search-overlay');
        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) closeSearch();
            });
        }

        console.log('✅ Sidebar: Ready');
    }

    // === PUBLIC API ===
    return {
        init,
        render,
        navigate,
        goHome,
        toggleMobile,
        closeMobile,
        openSearch,
        closeSearch,
        toggleStatusDropdown,
        setStatus,

        get state() { return state; },
        setUnreadMessages(count) {
            state.unreadMessages = count;
            const badge = document.querySelector('.sidebar-item[data-id="messaging"] .sidebar-badge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        },
        setActiveItem(itemId) {
            state.activeItem = itemId;
            document.querySelectorAll('.sidebar-item').forEach(el => {
                el.classList.toggle('active', el.dataset.id === itemId);
            });
        }
    };
})();

if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
}
