/**
 * SIDEBAR EVENTS v5.0
 * ProductiveApp - Event handlers
 */

const SidebarEvents = (function() {
    'use strict';

    let tooltipEl = null;

    /**
     * Setup tooltips
     */
    function setupTooltips() {
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'sidebar-tooltip';
            document.body.appendChild(tooltipEl);
        }

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
        if (!sidebar || !sidebar.classList.contains('collapsed')) return;
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
            const labels = {
                online: 'En ligne',
                busy: 'Occupé',
                away: 'Absent',
                offline: 'Invisible'
            };
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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                Sidebar.toggleCollapse();
            }

            // Escape: Close sidebar on mobile
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('app-sidebar');
                if (sidebar?.classList.contains('mobile-open')) {
                    Sidebar.toggle();
                }
            }
        });

        console.log('✅ SidebarEvents: Ready');
    }

    return {
        setupTooltips,
        showTooltip,
        hideTooltip,
        toggleStatus,
        setStatus,
        init
    };
})();

if (typeof window !== 'undefined') {
    window.SidebarEvents = SidebarEvents;
}
