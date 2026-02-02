/**
 * ================================================
 * SIDEBAR MODULE - ProductiveApp v3.1
 * Navigation centralisée premium
 * ================================================
 */

const Sidebar = (function() {
    'use strict';

    // === CONFIGURATION ===
    const STORAGE_KEY = 'productiveapp_sidebar';
    const SHORTCUTS = {
        search: { key: 'k', ctrl: true },
        newNote: { key: 'n', ctrl: true },
        messaging: { key: 'm', ctrl: true },
        galaxy: { key: 'g', ctrl: true },
        settings: { key: ',', ctrl: true }
    };

    // === STATE ===
    let state = {
        collapsed: false,
        mobileOpen: false,
        activeItem: 'dashboard',
        sectionsState: {
            workspace: true,
            communication: true,
            tools: false
        },
        userStatus: 'online',
        unreadMessages: 0,
        notifications: 0,
        searchOpen: false
    };

    // === NAVIGATION ITEMS ===
    const navConfig = {
        workspace: {
            title: 'Workspace',
            items: [
                { id: 'dashboard', icon: 'home', label: 'Dashboard', shortcut: null },
                { id: 'galaxy', icon: 'sparkles', label: 'Galaxie View', shortcut: 'Ctrl+G' },
                { id: 'notes', icon: 'file-text', label: 'Notes', badge: null, expandable: true },
                { id: 'projects', icon: 'folder', label: 'Projets', expandable: true },
                { id: 'tasks', icon: 'check-square', label: 'Tâches', active: true }
            ]
        },
        communication: {
            title: 'Communication',
            items: [
                { id: 'messaging', icon: 'message-circle', label: 'Messagerie', badge: 'unread', shortcut: 'Ctrl+M' },
                { id: 'journal', icon: 'book-open', label: 'Journal' }
            ]
        },
        tools: {
            title: 'Outils Pro',
            items: [
                { id: 'psycho-audit', icon: 'brain', label: 'Psycho-Audit', tag: 'NEW' },
                { id: 'gamification', icon: 'trophy', label: 'Gamification', tag: 'SOON' },
                { id: 'analytics', icon: 'bar-chart-2', label: 'Analytics' },
                { id: 'reports', icon: 'file-bar-chart', label: 'Rapports' }
            ]
        }
    };

    // === ICONS (Lucide-style SVG) ===
    const icons = {
        home: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        sparkles: '<svg viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        'check-square': '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        'book-open': '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        brain: '<svg viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        trophy: '<svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
        'bar-chart-2': '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'file-bar-chart': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>',
        settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        palette: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
        'help-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        'log-out': '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        'chevron-left': '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
        'chevron-down': '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
        x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    };

    // === RENDER FUNCTIONS ===

    function getIcon(name) {
        return icons[name] || icons.home;
    }

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
                    <span class="sidebar-brand-version">v3.1</span>
                </div>
                <button class="sidebar-toggle" onclick="Sidebar.toggle()" title="Réduire/Agrandir">
                    ${getIcon('chevron-left')}
                </button>
            </div>

            <!-- SEARCH -->
            <div class="sidebar-search">
                <button class="sidebar-search-btn" onclick="Sidebar.openSearch()">
                    ${getIcon('search')}
                    <span class="sidebar-search-text">Recherche globale</span>
                    <kbd class="sidebar-search-kbd">⌘K</kbd>
                </button>
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
                ${state.notifications > 0 ? `<span class="sidebar-notif-badge">${state.notifications}</span>` : ''}
            </div>

            <!-- NAVIGATION -->
            <nav class="sidebar-nav">
                ${renderSections()}
            </nav>

            <!-- FOOTER -->
            <div class="sidebar-footer">
                <div class="sidebar-footer-item" onclick="Sidebar.openSettings()" data-tooltip="Paramètres">
                    ${getIcon('settings')}
                    <span>Paramètres</span>
                </div>
                <div class="sidebar-footer-item" onclick="Sidebar.toggleThemeModal()" data-tooltip="Thème">
                    ${getIcon('palette')}
                    <span>Thème</span>
                </div>
                <div class="sidebar-footer-item" onclick="Sidebar.openHelp()" data-tooltip="Aide">
                    ${getIcon('help-circle')}
                    <span>Aide</span>
                </div>
                <div class="sidebar-footer-item" onclick="Sidebar.logout()" data-tooltip="Déconnexion">
                    ${getIcon('log-out')}
                    <span>Déconnexion</span>
                </div>
            </div>
        `;

        updateSidebarState();
    }

    function renderSections() {
        let html = '';

        for (const [sectionId, section] of Object.entries(navConfig)) {
            const isCollapsed = !state.sectionsState[sectionId];

            html += `
                <div class="sidebar-section ${isCollapsed ? 'collapsed' : ''}" data-section="${sectionId}">
                    <div class="sidebar-section-header" onclick="Sidebar.toggleSection('${sectionId}')">
                        <span class="sidebar-section-title">${section.title}</span>
                        ${getIcon('chevron-down')}
                    </div>
                    <div class="sidebar-section-items" style="max-height: ${isCollapsed ? '0' : '500px'}">
                        ${section.items.map(item => renderNavItem(item)).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }

    function renderNavItem(item) {
        const isActive = state.activeItem === item.id;
        const badgeValue = item.badge === 'unread' ? state.unreadMessages : item.badge;

        return `
            <div class="sidebar-item ${isActive ? 'active' : ''} ${item.expandable ? 'expandable' : ''}"
                 data-id="${item.id}"
                 data-tooltip="${item.label}"
                 onclick="Sidebar.navigate('${item.id}')">
                <span class="sidebar-item-icon sidebar-icon">${getIcon(item.icon)}</span>
                <span class="sidebar-item-label">${item.label}</span>
                ${item.shortcut ? `<kbd class="sidebar-search-kbd" style="font-size:10px">${item.shortcut.replace('Ctrl+', '⌘')}</kbd>` : ''}
                ${badgeValue && badgeValue > 0 ? `<span class="sidebar-item-badge">${badgeValue}</span>` : ''}
                ${item.tag ? `<span class="sidebar-item-new">${item.tag}</span>` : ''}
            </div>
            ${item.expandable ? renderSubItems(item.id) : ''}
        `;
    }

    function renderSubItems(parentId) {
        // Get dynamic data from app state
        let subitems = [];

        if (parentId === 'projects' && typeof AppState !== 'undefined') {
            const projects = AppState.projects || [];
            subitems = projects.slice(0, 5).map(p => ({
                id: `project-${p.id}`,
                label: p.name,
                unread: false
            }));
        } else if (parentId === 'notes') {
            // Placeholder for notes - to be connected to notes module
            subitems = [
                { id: 'note-recent', label: 'Notes récentes', unread: false }
            ];
        }

        if (subitems.length === 0) return '';

        return `
            <div class="sidebar-subitems">
                ${subitems.map(sub => `
                    <div class="sidebar-subitem ${sub.unread ? 'unread' : ''}"
                         onclick="Sidebar.navigateSubitem('${sub.id}')">
                        <span class="sidebar-subitem-dot"></span>
                        <span>${sub.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function getStatusLabel(status) {
        const labels = {
            online: 'En ligne',
            busy: 'Occupé',
            away: 'Absent',
            offline: 'Invisible'
        };
        return labels[status] || 'En ligne';
    }

    // === STATE MANAGEMENT ===

    function updateSidebarState() {
        const sidebar = document.getElementById('app-sidebar');
        const body = document.body;

        if (!sidebar) return;

        // Collapsed state
        sidebar.classList.toggle('collapsed', state.collapsed);
        body.classList.toggle('sidebar-collapsed', state.collapsed);
        body.classList.toggle('sidebar-open', !state.collapsed);

        // Mobile state
        sidebar.classList.toggle('open', state.mobileOpen);

        const overlay = document.getElementById('sidebar-mobile-overlay');
        if (overlay) {
            overlay.classList.toggle('active', state.mobileOpen);
        }
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            collapsed: state.collapsed,
            sectionsState: state.sectionsState,
            userStatus: state.userStatus
        }));
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.collapsed = parsed.collapsed ?? false;
                state.sectionsState = { ...state.sectionsState, ...parsed.sectionsState };
                state.userStatus = parsed.userStatus || 'online';
            }
        } catch (e) {
            console.warn('Sidebar: Could not load saved state', e);
        }
    }

    // === ACTIONS ===

    function toggle() {
        state.collapsed = !state.collapsed;
        updateSidebarState();
        saveState();
    }

    function toggleMobile() {
        state.mobileOpen = !state.mobileOpen;
        updateSidebarState();
    }

    function closeMobile() {
        state.mobileOpen = false;
        updateSidebarState();
    }

    function toggleSection(sectionId) {
        state.sectionsState[sectionId] = !state.sectionsState[sectionId];

        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) {
            section.classList.toggle('collapsed', !state.sectionsState[sectionId]);
            const items = section.querySelector('.sidebar-section-items');
            if (items) {
                items.style.maxHeight = state.sectionsState[sectionId] ? '500px' : '0';
            }
        }

        saveState();
    }

    function navigate(itemId) {
        state.activeItem = itemId;

        // Update visual state
        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === itemId);
        });

        // Handle expandable items
        const item = document.querySelector(`.sidebar-item[data-id="${itemId}"]`);
        if (item && item.classList.contains('expandable')) {
            item.classList.toggle('expanded');
        }

        // Dispatch navigation event
        const event = new CustomEvent('sidebar:navigate', {
            detail: { id: itemId }
        });
        document.dispatchEvent(event);

        // Execute navigation action
        executeNavigation(itemId);

        // Close mobile sidebar after navigation
        if (window.innerWidth <= 768) {
            closeMobile();
        }
    }

    function executeNavigation(itemId) {
        switch (itemId) {
            case 'dashboard':
                goHome();
                break;
            case 'galaxy':
                openGalaxy();
                break;
            case 'tasks':
                showTasks();
                break;
            case 'journal':
                scrollToJournal();
                break;
            case 'messaging':
                openChatbot();
                break;
            case 'psycho-audit':
                openPremiumReport();
                break;
            case 'reports':
                scrollToReports();
                break;
            case 'analytics':
                // Future: open analytics dashboard
                console.log('Analytics - Coming soon');
                break;
            case 'gamification':
                // Future: open gamification panel
                console.log('Gamification - Coming soon');
                break;
            case 'notes':
                // Future: open notes module
                console.log('Notes - Coming soon');
                break;
            case 'projects':
                openProjectsModal();
                break;
        }
    }

    function navigateSubitem(subitemId) {
        const event = new CustomEvent('sidebar:subitem', {
            detail: { id: subitemId }
        });
        document.dispatchEvent(event);

        // Handle project navigation
        if (subitemId.startsWith('project-')) {
            const projectId = subitemId.replace('project-', '');
            filterByProject(projectId);
        }
    }

    // === NAVIGATION HELPERS ===

    function goHome() {
        // Reset filters and show dashboard view
        if (typeof AppState !== 'undefined') {
            AppState.setFilter('project', 'all');
        }

        // Click the "All" project chip
        const allChip = document.querySelector('.project-chip[data-project="all"]');
        if (allChip) allChip.click();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openGalaxy() {
        const galaxyIcon = document.getElementById('galaxy-icon');
        if (galaxyIcon) galaxyIcon.click();
    }

    function showTasks() {
        const columnsView = document.getElementById('columns-view');
        const bubblesView = document.getElementById('bubbles-view');

        if (columnsView) {
            columnsView.classList.remove('hidden');
            if (bubblesView) bubblesView.classList.add('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function scrollToJournal() {
        const journal = document.querySelector('.journal-section');
        if (journal) {
            journal.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function openChatbot() {
        const chatWindow = document.getElementById('chatbot-window');
        if (chatWindow && chatWindow.classList.contains('hidden')) {
            const toggle = document.getElementById('chatbot-toggle');
            if (toggle) toggle.click();
        }
    }

    function openPremiumReport() {
        const premiumBtn = document.getElementById('premium-report-btn');
        if (premiumBtn) premiumBtn.click();
    }

    function scrollToReports() {
        const reports = document.querySelector('.journal-report');
        if (reports) {
            reports.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function openProjectsModal() {
        const addProjectBtn = document.getElementById('add-project-btn');
        if (addProjectBtn) addProjectBtn.click();
    }

    function filterByProject(projectId) {
        const chip = document.querySelector(`.project-chip[data-project="${projectId}"]`);
        if (chip) chip.click();
    }

    // === STATUS ===

    function toggleStatusDropdown(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    function setStatus(newStatus) {
        state.userStatus = newStatus;

        // Update UI
        const dot = document.querySelector('.sidebar-status-dot');
        if (dot) {
            dot.className = `sidebar-status-dot ${newStatus}`;
        }

        const statusText = document.querySelector('.sidebar-profile-status');
        if (statusText) {
            statusText.textContent = getStatusLabel(newStatus);
        }

        // Close dropdown
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) dropdown.classList.remove('active');

        saveState();

        // Emit event for external handling
        document.dispatchEvent(new CustomEvent('sidebar:status', {
            detail: { status: newStatus }
        }));
    }

    // === SEARCH ===

    function openSearch() {
        state.searchOpen = true;
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.classList.add('active');
            const input = overlay.querySelector('.global-search-input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    function closeSearch() {
        state.searchOpen = false;
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    function handleSearch(query) {
        if (!query || query.length < 2) {
            renderSearchResults([]);
            return;
        }

        const results = [];
        const q = query.toLowerCase();

        // Search tasks
        if (typeof AppState !== 'undefined' && AppState.tasks) {
            AppState.tasks.forEach(task => {
                if (task.text?.toLowerCase().includes(q)) {
                    results.push({
                        type: 'task',
                        icon: 'check-square',
                        title: task.text.substring(0, 50),
                        meta: `Tâche - ${task.project || 'Sans projet'}`,
                        action: () => highlightTask(task.id)
                    });
                }
            });
        }

        // Search projects
        if (typeof AppState !== 'undefined' && AppState.projects) {
            AppState.projects.forEach(project => {
                if (project.name?.toLowerCase().includes(q)) {
                    results.push({
                        type: 'project',
                        icon: 'folder',
                        title: project.name,
                        meta: 'Projet',
                        action: () => filterByProject(project.id)
                    });
                }
            });
        }

        renderSearchResults(results.slice(0, 10));
    }

    function renderSearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="global-search-empty">Aucun résultat</div>';
            return;
        }

        container.innerHTML = results.map((r, i) => `
            <div class="global-search-result ${i === 0 ? 'selected' : ''}" data-index="${i}">
                <div class="global-search-result-icon">${getIcon(r.icon)}</div>
                <div class="global-search-result-content">
                    <div class="global-search-result-title">${escapeHtml(r.title)}</div>
                    <div class="global-search-result-meta">${r.meta}</div>
                </div>
            </div>
        `).join('');

        // Store results for keyboard navigation
        container._results = results;
    }

    function highlightTask(taskId) {
        closeSearch();
        const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskEl) {
            taskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            taskEl.classList.add('highlight');
            setTimeout(() => taskEl.classList.remove('highlight'), 2000);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === FOOTER ACTIONS ===

    function openSettings() {
        // Future: open settings modal
        console.log('Settings - Coming soon');

        // For now, dispatch event
        document.dispatchEvent(new CustomEvent('sidebar:settings'));
    }

    function toggleThemeModal() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) themeBtn.click();
    }

    function openHelp() {
        // Future: open help/onboarding
        console.log('Help - Coming soon');

        document.dispatchEvent(new CustomEvent('sidebar:help'));
    }

    function logout() {
        if (typeof Auth !== 'undefined' && Auth.logout) {
            Auth.logout();
        } else {
            // Fallback
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.click();
        }
    }

    // === KEYBOARD SHORTCUTS ===

    function initShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global search: Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (state.searchOpen) {
                    closeSearch();
                } else {
                    openSearch();
                }
            }

            // Close search on Escape
            if (e.key === 'Escape' && state.searchOpen) {
                closeSearch();
            }

            // Galaxy: Ctrl+G
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                navigate('galaxy');
            }

            // Messaging: Ctrl+M
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                navigate('messaging');
            }

            // New note: Ctrl+N (prevent default browser behavior)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                // Only if notes module is active
                if (state.activeItem === 'notes') {
                    e.preventDefault();
                    console.log('New note shortcut');
                }
            }

            // Settings: Ctrl+,
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                openSettings();
            }
        });
    }

    // === RESPONSIVE ===

    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

        if (isMobile) {
            state.mobileOpen = false;
            updateSidebarState();
        } else if (isTablet) {
            state.collapsed = true;
            updateSidebarState();
        }
    }

    // === INITIALIZATION ===

    function init() {
        console.log('🎨 Sidebar: Initializing...');
        loadState();
        render();
        initShortcuts();

        // Handle window resize
        window.addEventListener('resize', debounce(handleResize, 150));

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            // Status dropdown
            if (!e.target.closest('.sidebar-avatar')) {
                const dropdown = document.getElementById('status-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });

        // Mobile overlay click
        const overlay = document.getElementById('sidebar-mobile-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeMobile);
        }

        // Search input handler
        const searchInput = document.querySelector('.global-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                handleSearch(e.target.value);
            }, 200));

            // Keyboard navigation in search results
            searchInput.addEventListener('keydown', (e) => {
                const container = document.getElementById('search-results');
                if (!container || !container._results) return;

                const results = container.querySelectorAll('.global-search-result');
                const selected = container.querySelector('.global-search-result.selected');
                let currentIndex = Array.from(results).indexOf(selected);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentIndex = Math.min(currentIndex + 1, results.length - 1);
                    results.forEach((r, i) => r.classList.toggle('selected', i === currentIndex));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentIndex = Math.max(currentIndex - 1, 0);
                    results.forEach((r, i) => r.classList.toggle('selected', i === currentIndex));
                } else if (e.key === 'Enter' && currentIndex >= 0) {
                    e.preventDefault();
                    const action = container._results[currentIndex]?.action;
                    if (action) action();
                }
            });
        }

        // Search overlay close
        const searchOverlay = document.getElementById('global-search-overlay');
        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    closeSearch();
                }
            });
        }

        // Initial responsive check
        handleResize();

        console.log('✅ Sidebar: Initialized and rendered');
    }

    function debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // === PUBLIC API ===
    return {
        init,
        render,
        toggle,
        toggleMobile,
        closeMobile,
        toggleSection,
        navigate,
        navigateSubitem,
        goHome,
        openSearch,
        closeSearch,
        toggleStatusDropdown,
        setStatus,
        openSettings,
        toggleThemeModal,
        openHelp,
        logout,

        // State accessors
        get state() { return state; },
        setUnreadMessages(count) {
            state.unreadMessages = count;
            render();
        },
        setNotifications(count) {
            state.notifications = count;
            render();
        },
        setActiveItem(itemId) {
            state.activeItem = itemId;
            document.querySelectorAll('.sidebar-item').forEach(el => {
                el.classList.toggle('active', el.dataset.id === itemId);
            });
        }
    };
})();

// Auto-initialize when DOM is ready (will be called from app-modular.js)
if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
}
