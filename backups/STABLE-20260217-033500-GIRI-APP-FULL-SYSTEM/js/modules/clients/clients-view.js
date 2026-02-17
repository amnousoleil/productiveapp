/**
 * CLIENTS VIEW - ProductiveApp v4.0
 * Mini-CRM pour freelancers
 */
const ClientsView = (function() {
    'use strict';

    var clients = [];
    var selectedClient = null;
    var loading = false;

    function init() {}

    function refresh() { render(); }

    async function loadClients() {
        loading = true;
        try {
            var wsId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
            if (!wsId) { clients = []; return; }
            var resp = await ApiFetch.fetchWithAuth('/accounting/workspace/' + wsId + '/contacts');
            clients = resp.data || resp.contacts || resp || [];
        } catch (e) {
            console.error('ClientsView: load error', e);
            clients = [];
        }
        loading = false;
    }

    async function render() {
        var container = document.getElementById('view-clients');
        if (!container) return;

        if (!clients.length && !loading) await loadClients();

        container.innerHTML = renderLayout();
    }

    function renderLayout() {
        var html = '<div class="clients-page">';
        html += '<div class="clients-header">' +
            '<div class="clients-header-left">' +
                '<h1 class="view-title"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Clients</h1>' +
                '<span class="clients-count">' + clients.length + ' client' + (clients.length !== 1 ? 's' : '') + '</span>' +
            '</div>' +
            '<button class="clients-add-btn" onclick="ClientsView.showAddForm()">' +
                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nouveau client' +
            '</button>' +
        '</div>';

        if (loading) {
            html += (typeof Skeletons !== 'undefined') ? Skeletons.render('list', 5) : '<p style="padding:20px;color:var(--text-muted);">Chargement...</p>';
        } else if (clients.length === 0) {
            html += (typeof EmptyStates !== 'undefined') ? EmptyStates.render('clients') : '<p style="padding:40px;text-align:center;color:var(--text-muted);">Aucun client</p>';
        } else {
            html += '<div class="clients-grid">';
            // Stats rapides
            html += renderStats();
            // Liste
            html += '<div class="clients-list">';
            clients.forEach(function(c) {
                html += renderClientCard(c);
            });
            html += '</div>';
            html += '</div>';
        }

        // Detail panel
        if (selectedClient) {
            html += renderDetailPanel(selectedClient);
        }

        html += '</div>';
        return html;
    }

    function renderStats() {
        var totalRevenue = 0;
        var activeCount = 0;
        clients.forEach(function(c) {
            if (c.total_invoiced) totalRevenue += parseFloat(c.total_invoiced) || 0;
            if (c.status !== 'inactive') activeCount++;
        });
        return '<div class="clients-stats">' +
            '<div class="clients-stat-card"><span class="stat-value">' + clients.length + '</span><span class="stat-label">Total clients</span></div>' +
            '<div class="clients-stat-card"><span class="stat-value">' + activeCount + '</span><span class="stat-label">Actifs</span></div>' +
            '<div class="clients-stat-card"><span class="stat-value">' + formatMoney(totalRevenue) + '</span><span class="stat-label">CA total</span></div>' +
        '</div>';
    }

    function renderClientCard(c) {
        var initials = getInitials(c.name || c.company_name || 'N/A');
        var revenue = c.total_invoiced ? formatMoney(parseFloat(c.total_invoiced)) : '-';
        return '<div class="client-card" onclick="ClientsView.selectClient(\'' + c.id + '\')">' +
            '<div class="client-avatar">' + initials + '</div>' +
            '<div class="client-info">' +
                '<div class="client-name">' + escHtml(c.company_name || c.name || 'Sans nom') + '</div>' +
                '<div class="client-email">' + escHtml(c.email || '') + '</div>' +
            '</div>' +
            '<div class="client-revenue">' + revenue + '</div>' +
        '</div>';
    }

    function renderDetailPanel(c) {
        return '<div class="client-detail-overlay" onclick="ClientsView.closeDetail()">' +
            '<div class="client-detail-panel" onclick="event.stopPropagation()">' +
                '<button class="client-detail-close" onclick="ClientsView.closeDetail()">&times;</button>' +
                '<div class="client-detail-header">' +
                    '<div class="client-avatar-lg">' + getInitials(c.name || c.company_name || '') + '</div>' +
                    '<h2>' + escHtml(c.company_name || c.name || 'Client') + '</h2>' +
                    '<p>' + escHtml(c.email || '') + '</p>' +
                '</div>' +
                '<div class="client-detail-body">' +
                    '<div class="client-detail-section">' +
                        '<h3>Informations</h3>' +
                        '<div class="client-detail-row"><span>Telephone</span><span>' + escHtml(c.phone || '-') + '</span></div>' +
                        '<div class="client-detail-row"><span>Adresse</span><span>' + escHtml(c.address || '-') + '</span></div>' +
                        '<div class="client-detail-row"><span>SIRET</span><span>' + escHtml(c.tax_id || c.siret || '-') + '</span></div>' +
                    '</div>' +
                    '<div class="client-detail-section">' +
                        '<h3>Facturation</h3>' +
                        '<div class="client-detail-row"><span>CA facture</span><span>' + formatMoney(parseFloat(c.total_invoiced || 0)) + '</span></div>' +
                        '<div class="client-detail-row"><span>Factures</span><span>' + (c.invoice_count || 0) + '</span></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function selectClient(id) {
        selectedClient = clients.find(function(c) { return c.id === id; }) || null;
        render();
    }

    function closeDetail() {
        selectedClient = null;
        render();
    }

    function showAddForm() {
        var name = prompt('Nom du client ou entreprise :');
        if (!name) return;
        var email = prompt('Email (optionnel) :') || '';
        addClient(name, email);
    }

    async function addClient(name, email) {
        try {
            var wsId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
            if (!wsId) return;
            await ApiFetch.fetchWithAuth('/accounting/workspace/' + wsId + '/contacts', {
                method: 'POST',
                body: JSON.stringify({ name: name, email: email, type: 'client' })
            });
            await loadClients();
            render();
        } catch (e) {
            console.error('Add client error:', e);
        }
    }

    function getInitials(name) {
        return name.split(' ').map(function(w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();
    }

    function formatMoney(n) {
        if (!n || isNaN(n)) return '0 EUR';
        return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
    }

    function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    return {
        init: init,
        refresh: refresh,
        render: render,
        selectClient: selectClient,
        closeDetail: closeDetail,
        showAddForm: showAddForm
    };
})();

if (typeof window !== 'undefined') window.ClientsView = ClientsView;
