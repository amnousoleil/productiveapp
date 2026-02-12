/**
 * SIDEBAR RENDER v5.0
 * ProductiveApp - Rendu de la sidebar
 */

(function() {
    'use strict';

    // Icons SVG (Lucide-style)
    const icons = {
        home: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'check-square': '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        sparkles: '<svg viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>',
        'messages': '<svg viewBox="0 0 24 24"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>',
        'bot': '<svg viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
        'book-open': '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        brain: '<svg viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        calculator: '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="16" y2="18"/></svg>',
        'file-bar-chart': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>',
        settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
        palette: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.28-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67H16c3.05 0 5.56-2.5 5.56-5.56C21.97 6.01 17.46 2 12 2z"/></svg>',
        'log-out': '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        'chevron-left': '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
        menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        mail: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        activity: '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        trophy: '<svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
        video: '<svg viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>',
        calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    };

    function getIcon(name) {
        return icons[name] || icons.home;
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

    /**
     * Rendu de la sidebar
     */
    Sidebar.render = function() {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) {
            console.warn('Sidebar: #app-sidebar not found');
            return;
        }

        const user = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        const userName = user?.name || 'Utilisateur';
        const userAvatar = user?.avatar || '👤';
        const isImageAvatar = userAvatar?.includes?.('http') || userAvatar?.startsWith?.('/uploads');
        const sidebarState = Sidebar.state;

        sidebar.innerHTML = `
            <!-- Bouton Chevron -->
            <button class="sidebar-collapse-btn" onclick="Sidebar.toggleCollapse()" title="Replier/Déplier">
                ${getIcon('chevron-left')}
            </button>

            <!-- Header -->
            <div class="sidebar-header">
                <img src="/assets/images/logos/logo.svg"
                     alt="Logo" class="sidebar-logo" onclick="Sidebar.navigate('dashboard')"
                     onerror="this.src='/assets/images/logos/logo.png'; this.onerror=()=>{this.style.display='none'; const fallback = document.createElement('span'); fallback.textContent='👑'; fallback.style.fontSize='32px'; fallback.style.cursor='pointer'; fallback.onclick=()=>Sidebar.navigate('dashboard'); this.parentElement.appendChild(fallback);};">
                <div class="sidebar-brand">
                    <div class="sidebar-brand-name">ProductiveApp</div>
                    <div class="sidebar-brand-version">v4.0</div>
                </div>
            </div>

            <!-- Profile -->
            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    ${isImageAvatar
                        ? `<img src="${userAvatar}" alt="${userName}">`
                        : `<div class="sidebar-avatar-emoji">${userAvatar}</div>`
                    }
                    <div class="sidebar-status-dot ${sidebarState.userStatus}"
                         onclick="SidebarEvents.toggleStatus(event)"></div>
                    <div class="sidebar-status-dropdown" id="status-dropdown">
                        ${['online', 'busy', 'away', 'offline'].map(s => `
                            <div class="sidebar-status-option" onclick="SidebarEvents.setStatus('${s}')">
                                <span class="status-dot ${s}"></span>
                                <span>${getStatusLabel(s)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="sidebar-profile-info">
                    <div class="sidebar-profile-name">${userName}</div>
                    <div class="sidebar-profile-status">${getStatusLabel(sidebarState.userStatus)}</div>
                </div>
            </div>

            <!-- Workspace Selector -->
            ${typeof WorkspacesModule !== 'undefined' && WorkspacesModule.workspaces?.length > 0
                ? WorkspacesModule.renderPremiumSelector()
                : ''
            }

            <!-- Navigation -->
            <nav class="sidebar-nav">
                ${Array.from(Sidebar.navItems).map(item => renderNavItem(item, sidebarState)).join('')}
            </nav>

            <!-- Footer -->
            <div class="sidebar-footer">
                ${Sidebar.footerItems.map(item => renderNavItem(item, sidebarState)).join('')}
            </div>
        `;

        // Créer overlay si nécessaire
        if (!document.getElementById('sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.onclick = () => {
                Sidebar.toggle();
            };
            document.body.appendChild(overlay);
        }

        // Setup tooltips
        if (typeof SidebarEvents !== 'undefined') {
            SidebarEvents.setupTooltips();
        }

        console.log('✅ Sidebar: Rendered');
    };

    function renderNavItem(item, state) {
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

    // Exposer
    Sidebar.icons = icons;
    Sidebar.getIcon = getIcon;
})();
