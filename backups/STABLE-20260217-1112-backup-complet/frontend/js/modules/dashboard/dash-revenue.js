/**
 * REVENUE DASHBOARD WIDGET - ProductiveApp v4.0
 * Widget revenus sur le dashboard
 */
const DashRevenue = (function() {
    'use strict';

    async function render() {
        var wsId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
        if (!wsId) return '';

        var data = { revenue: 0, pending: 0, overdue: 0, count: 0 };
        try {
            var resp = await ApiFetch.fetchWithAuth('/accounting/workspace/' + wsId + '/analytics/dashboard');
            if (resp && resp.data) {
                data.revenue = parseFloat(resp.data.total_paid || resp.data.revenue || 0);
                data.pending = parseFloat(resp.data.total_pending || resp.data.pending || 0);
                data.overdue = parseFloat(resp.data.total_overdue || resp.data.overdue || 0);
                data.count = resp.data.invoice_count || 0;
            }
        } catch (e) {
            // Silently fail - widget optional
        }

        return '<div class="dash-revenue-widget">' +
            '<div class="dash-revenue-header">' +
                '<h3><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Revenus</h3>' +
            '</div>' +
            '<div class="dash-revenue-grid">' +
                '<div class="dash-rev-card dash-rev-success">' +
                    '<span class="dash-rev-value">' + formatMoney(data.revenue) + '</span>' +
                    '<span class="dash-rev-label">Encaisse</span>' +
                '</div>' +
                '<div class="dash-rev-card dash-rev-warning">' +
                    '<span class="dash-rev-value">' + formatMoney(data.pending) + '</span>' +
                    '<span class="dash-rev-label">En attente</span>' +
                '</div>' +
                '<div class="dash-rev-card dash-rev-danger">' +
                    '<span class="dash-rev-value">' + formatMoney(data.overdue) + '</span>' +
                    '<span class="dash-rev-label">En retard</span>' +
                '</div>' +
                '<div class="dash-rev-card">' +
                    '<span class="dash-rev-value">' + data.count + '</span>' +
                    '<span class="dash-rev-label">Factures</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function formatMoney(n) {
        if (!n || isNaN(n)) return '0 EUR';
        return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
    }

    return { render: render };
})();

if (typeof window !== 'undefined') window.DashRevenue = DashRevenue;
