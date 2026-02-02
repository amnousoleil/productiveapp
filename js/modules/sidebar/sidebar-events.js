/**
 * SIDEBAR EVENTS - Event handlers and tooltips
 * ProductiveApp v4.0
 */

const SidebarEvents = (function() {
    'use strict';

    let tooltipEl = null;

    /**
     * Setup tooltips
     */
    function setupTooltips() {
        // Create tooltip element
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'sidebar-tooltip';
            document.body.appendChild(tooltipEl);
        }

        // Add listeners to items
        document.querySelectorAll('.sidebar-item[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', showTooltip);
            el.addEventListener('mouseleave', hideTooltip);
        });
    }

    /**
     * Show tooltip
     */
    function showTooltip(e) {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar || sidebar.classList.contains('expanded')) return;
        if (window.innerWidth <= 768) return;

        const target = e.currentTarget;
        const text = target.dataset.tooltip;
        if (!text || !tooltipEl) return;

        const rect = target.getBoundingClientRect();
        tooltipEl.textContent = text;
        tooltipEl.style.top = `${rect.top + rect.height / 2}px`;
        tooltipEl.classList.add('visible');
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.classList.remove('visible');
        }
    }

    /**
     * Toggle status dropdown
     */
    function toggleStatus(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    /**
     * Set user status
     */
    function setStatus(newStatus) {
        Sidebar.state.userStatus = newStatus;

        // Update UI
        const dot = document.querySelector('.sidebar-status-dot');
        if (dot) {
            dot.className = `sidebar-status-dot ${newStatus}`;
        }

        const statusText = document.querySelector('.sidebar-profile-status');
        if (statusText) {
            const labels = { online: 'En ligne', busy: 'Occupé', away: 'Absent', offline: 'Invisible' };
            statusText.textContent = labels[newStatus] || 'En ligne';
        }

        // Close dropdown
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }

        Sidebar.saveState();
    }

    /**
     * Toggle mobile sidebar
     */
    function toggleMobile() {
        Sidebar.state.mobileOpen = !Sidebar.state.mobileOpen;
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.toggle('expanded', Sidebar.state.mobileOpen);
        }
        if (overlay) {
            overlay.classList.toggle('active', Sidebar.state.mobileOpen);
        }
    }

    /**
     * Close mobile sidebar
     */
    function closeMobile() {
        Sidebar.state.mobileOpen = false;
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.remove('expanded');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    /**
     * Initialize events
     */
    function init() {
        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sidebar-avatar')) {
                const dropdown = document.getElementById('status-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });

        // Close sidebar on outside click (when expanded)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('app-sidebar');
            if (!sidebar || !Sidebar.state.expanded) return;

            // Check if click is outside sidebar
            if (!e.target.closest('#app-sidebar') && !e.target.closest('.sidebar-mobile-toggle')) {
                Sidebar.collapse();
            }
        });

        // Overlay click to close (for mobile)
        const overlay = document.getElementById('sidebar-mobile-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                Sidebar.collapse();
                closeMobile();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+B: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                Sidebar.toggle();
            }
            // Escape: Close sidebar
            if (e.key === 'Escape' && Sidebar.state.expanded) {
                Sidebar.collapse();
            }
        });
    }

    return {
        setupTooltips,
        showTooltip,
        hideTooltip,
        toggleStatus,
        setStatus,
        toggleMobile,
        closeMobile,
        init
    };
})();

if (typeof window !== 'undefined') {
    window.SidebarEvents = SidebarEvents;
}
