/**
 * AccountingView - Orchestrateur principal du module Comptabilite
 * Systeme a 8 onglets avec delegation vers sous-modules
 * Pattern IIFE avec rendu innerHTML et delegation d'evenements
 */
const AccountingView = (function() {
    'use strict';

    var container = null;
    var initialized = false;
    var chartsInstances = {};

    var currencyFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    var numberFmt = new Intl.NumberFormat('fr-FR');
    var dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // =====================================================
    // CONFIGURATION DES ONGLETS
    // =====================================================

    var TABS = [
        {
            id: 'dashboard',
            label: 'Tableau de bord',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="10" width="7" height="11" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/></svg>',
            render: renderDashboard,
            load: loadDashboard
        },
        {
            id: 'invoices',
            label: 'Factures',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            render: renderInvoices,
            load: loadInvoices
        },
        {
            id: 'scanner',
            label: 'Scanner',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
            render: renderScanner,
            load: function() { return Promise.resolve(); }
        },
        {
            id: 'expenses',
            label: 'Notes de frais',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
            render: renderExpenses,
            load: loadExpenses
        },
        {
            id: 'tva',
            label: 'TVA',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            render: renderTVA,
            load: loadTVA
        },
        {
            id: 'budgets',
            label: 'Budgets',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
            render: renderBudgets,
            load: loadBudgets
        },
        {
            id: 'bank',
            label: 'Banque',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
            render: renderBank,
            load: loadBank
        },
        {
            id: 'contacts',
            label: 'Contacts',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
            render: renderContacts,
            load: loadContacts
        },
        {
            id: 'recurring',
            label: 'Recurrentes',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
            render: renderRecurring,
            load: loadRecurring
        }
    ];

    // =====================================================
    // ICONES SVG
    // =====================================================

    var ICONS = {
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>',
        upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>'
    };

    // =====================================================
    // INITIALISATION
    // =====================================================

    function init() {
        container = document.getElementById('view-accounting');
        if (!container) {
            console.error('[AccountingView] Container #view-accounting introuvable');
            return;
        }

        AccStyles.inject();

        renderShell();
        bindEvents();
        switchTab('dashboard');
        initialized = true;
    }

    function refresh() {
        if (!initialized) {
            init();
            return;
        }
        var currentTab = AccState.get('currentTab') || 'dashboard';
        var tab = TABS.find(function(t) { return t.id === currentTab; });
        if (tab && tab.load) {
            tab.load().then(function() {
                renderTabContent(tab);
            }).catch(function(err) {
                console.error('[AccountingView] Erreur refresh:', err);
            });
        }
    }

    // =====================================================
    // RENDU DE LA COQUILLE (SHELL)
    // =====================================================

    function renderShell() {
        var alertCounts = AccState.get('alerts').counts;
        var totalAlerts = (alertCounts.warning || 0) + (alertCounts.critical || 0);

        var html = '<div class="acc-wrapper">';

        // En-tete
        html += '<div class="acc-header">';
        html += '<div class="acc-header-left">';
        html += '<h1 class="acc-header-title">Comptabilite</h1>';
        html += '</div>';
        html += '<div class="acc-header-actions">';
        html += '<button class="acc-btn" data-action="open-scanner">' + TABS[2].icon + ' Scanner</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="create-invoice">' + ICONS.plus + ' Creer facture</button>';
        html += '<button class="acc-btn" data-action="export-menu">' + ICONS.download + ' Export</button>';
        html += '<button class="acc-btn acc-btn-icon" data-action="open-settings" title="Parametres societe">' + ICONS.settings + '</button>';
        html += '</div>';
        html += '</div>';

        // Onglets
        html += '<div class="acc-tabs">';
        TABS.forEach(function(tab) {
            var isActive = tab.id === (AccState.get('currentTab') || 'dashboard');
            html += '<button class="acc-tab' + (isActive ? ' active' : '') + '" data-tab="' + tab.id + '">';
            html += tab.icon;
            html += '<span>' + tab.label + '</span>';
            if (tab.id === 'dashboard' && totalAlerts > 0) {
                html += '<span class="acc-tab-badge">' + totalAlerts + '</span>';
            }
            html += '</button>';
        });
        html += '</div>';

        // Contenu
        html += '<div class="acc-content" id="acc-tab-content"></div>';

        html += '</div>';

        // Modal overlay
        html += '<div class="acc-modal-overlay" id="acc-modal-overlay">';
        html += '<div class="acc-modal" id="acc-modal"></div>';
        html += '</div>';

        container.innerHTML = html;
    }

    // =====================================================
    // DELEGATION D'EVENEMENTS
    // =====================================================

    function bindEvents() {
        container.addEventListener('click', function(e) {
            var target = e.target.closest('[data-tab]');
            if (target) {
                switchTab(target.getAttribute('data-tab'));
                return;
            }

            var action = e.target.closest('[data-action]');
            if (action) {
                handleAction(action.getAttribute('data-action'), action);
                return;
            }

            var modalClose = e.target.closest('.acc-modal-close');
            if (modalClose) {
                closeModal();
                return;
            }

            // Fermer modal en cliquant sur l'overlay
            if (e.target.id === 'acc-modal-overlay') {
                closeModal();
                return;
            }
        });

        container.addEventListener('change', function(e) {
            var filterEl = e.target.closest('[data-filter]');
            if (filterEl) {
                handleFilterChange(filterEl);
                return;
            }
        });

        container.addEventListener('input', function(e) {
            var searchEl = e.target.closest('[data-search]');
            if (searchEl) {
                clearTimeout(searchEl._debounce);
                searchEl._debounce = setTimeout(function() {
                    handleSearchInput(searchEl);
                }, 350);
                return;
            }
        });
    }

    // =====================================================
    // NAVIGATION ONGLETS
    // =====================================================

    function switchTab(tabId) {
        AccState.setState('currentTab', tabId);

        // Mettre a jour les onglets actifs
        var tabs = container.querySelectorAll('.acc-tab');
        tabs.forEach(function(t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
        });

        var tab = TABS.find(function(t) { return t.id === tabId; });
        if (!tab) return;

        var content = document.getElementById('acc-tab-content');
        if (!content) return;

        // Afficher chargement
        content.innerHTML = '<div class="acc-loading"><div class="acc-loading-spinner"></div>Chargement...</div>';

        // Charger les donnees puis rendre
        tab.load().then(function() {
            renderTabContent(tab);
        }).catch(function(err) {
            console.error('[AccountingView] Erreur chargement onglet ' + tabId + ':', err);
            content.innerHTML = '<div class="acc-empty"><div class="acc-empty-title">Erreur de chargement</div>' +
                '<div class="acc-empty-desc">' + (err.message || 'Une erreur est survenue') + '</div>' +
                '<button class="acc-btn acc-btn-primary" data-action="retry-tab">Reessayer</button></div>';
        });
    }

    function renderTabContent(tab) {
        var content = document.getElementById('acc-tab-content');
        if (!content) return;

        // ── Délégation vers modules premium ──────────────────────────────
        // Dashboard premium avec KPI sparklines + charts line+area
        if (tab.id === 'dashboard' && typeof AccDashboard !== 'undefined') {
            content.innerHTML = '';
            AccDashboard.refresh(content);
            return;
        }
        // Factures premium avec tableau avancé (avatars, icônes SVG, hover)
        if (tab.id === 'invoices' && typeof AccInvoices !== 'undefined') {
            content.innerHTML = '';
            AccInvoices.render(content);
            return;
        }
        // Scanner FinScan premium
        if (tab.id === 'scanner' && typeof AccScanner !== 'undefined') {
            content.innerHTML = '';
            AccScanner.render(content);
            return;
        }
        // ─────────────────────────────────────────────────────────────────

        content.innerHTML = tab.render();
        if (tab.id === 'recurring' && typeof AccRecurring !== 'undefined') {
            var rc = document.getElementById('acc-recurring-container');
            if (rc) AccRecurring.render(rc);
        }
    }

    // =====================================================
    // GESTIONNAIRE D'ACTIONS
    // =====================================================

    function handleAction(action, el) {
        switch (action) {
            case 'open-scanner':
                switchTab('scanner');
                break;
            case 'create-invoice':
                openInvoiceModal();
                break;
            case 'export-menu':
                openExportModal();
                break;
            case 'open-settings':
                openSettingsModal();
                break;
            case 'retry-tab':
                switchTab(AccState.get('currentTab'));
                break;
            case 'view-invoice':
                viewInvoice(el.getAttribute('data-id'));
                break;
            case 'edit-invoice':
                editInvoice(el.getAttribute('data-id'));
                break;
            case 'delete-invoice':
                deleteInvoice(el.getAttribute('data-id'));
                break;
            case 'pay-invoice':
                markInvoicePaid(el.getAttribute('data-id'));
                break;
            case 'send-invoice':
                sendInvoiceAction(el.getAttribute('data-id'));
                break;
            case 'send-reminder':
                sendReminderAction(el.getAttribute('data-id'));
                break;
            case 'scan-upload':
                triggerScanUpload();
                break;
            case 'scan-camera':
                triggerScanCamera();
                break;
            case 'create-expense':
                openExpenseModal();
                break;
            case 'submit-expense':
                submitExpense(el.getAttribute('data-id'));
                break;
            case 'approve-expense':
                approveExpense(el.getAttribute('data-id'));
                break;
            case 'reject-expense':
                rejectExpense(el.getAttribute('data-id'));
                break;
            case 'create-budget':
                openBudgetModal();
                break;
            case 'import-bank':
                openBankImportModal();
                break;
            case 'auto-match':
                autoMatchBank();
                break;
            case 'match-tx':
                matchTransaction(el.getAttribute('data-tx-id'));
                break;
            case 'unmatch-tx':
                unmatchTransaction(el.getAttribute('data-tx-id'));
                break;
            case 'create-contact':
                openContactModal();
                break;
            case 'view-contact':
                viewContact(el.getAttribute('data-id'));
                break;
            case 'mark-alert-read':
                markAlertRead(el.getAttribute('data-id'));
                break;
            case 'dismiss-alert':
                dismissAlert(el.getAttribute('data-id'));
                break;
            case 'save-modal':
                saveModalForm();
                break;
            case 'prev-page':
                changePage(-1);
                break;
            case 'next-page':
                changePage(1);
                break;
            default:
                console.log('[AccountingView] Action non geree:', action);
        }
    }

    // =====================================================
    // ONGLET: TABLEAU DE BORD
    // =====================================================

    function loadDashboard() {
        AccState.setLoading('dashboard', true);
        var year = AccState.get('currentYear');
        return Promise.all([
            AccountingApi.getDashboard(year).catch(function() { return null; }),
            AccountingApi.getAlerts(true).catch(function() { return { items: [], counts: { info: 0, warning: 0, critical: 0 } }; })
        ]).then(function(results) {
            AccState.setState('dashboard', results[0]);
            if (results[1]) AccState.setState('alerts', results[1]);
            AccState.setLoading('dashboard', false);
        }).catch(function() {
            AccState.setLoading('dashboard', false);
        });
    }

    function renderDashboard() {
        var data = AccState.get('dashboard');
        var alerts = AccState.get('alerts');

        if (!data) {
            return '<div class="acc-empty">' +
                '<div class="acc-empty-title">Aucune donnee disponible</div>' +
                '<div class="acc-empty-desc">Les donnees du tableau de bord se chargeront automatiquement.</div>' +
                '</div>';
        }

        var html = '';

        // Cartes statistiques
        html += '<div class="acc-stats-grid">';
        html += renderStatCard('Chiffre d\'affaires', data.revenue || 0, 'green', data.revenueGrowth, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>');
        html += renderStatCard('Depenses', data.expenses || 0, 'red', data.expenseGrowth, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/></svg>');
        html += renderStatCard('Benefice net', data.profit || 0, 'blue', data.profitGrowth, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>');
        html += renderStatCard('Factures en attente', data.pendingInvoices || 0, 'orange', null, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>', true);
        html += '</div>';

        // Alertes critiques
        if (alerts && alerts.items && alerts.items.length > 0) {
            var criticals = alerts.items.filter(function(a) { return a.severity === 'critical' || a.severity === 'warning'; }).slice(0, 3);
            if (criticals.length > 0) {
                html += '<div class="acc-section">';
                html += '<div class="acc-section-title">' + ICONS.alert + ' Alertes</div>';
                html += '<div class="acc-alerts-list">';
                criticals.forEach(function(alert) {
                    html += renderAlertCard(alert);
                });
                html += '</div></div>';
            }
        }

        // Graphiques
        html += '<div class="acc-charts-grid">';
        html += '<div class="acc-chart-card">';
        html += '<div class="acc-chart-title">Revenus vs Depenses (mensuel)</div>';
        html += '<div class="acc-chart-container"><canvas id="acc-chart-revenue"></canvas></div>';
        html += '</div>';
        html += '<div class="acc-chart-card">';
        html += '<div class="acc-chart-title">Repartition des depenses</div>';
        html += '<div class="acc-chart-container"><canvas id="acc-chart-expenses-pie"></canvas></div>';
        html += '</div>';
        html += '</div>';

        // Factures recentes
        html += '<div class="acc-section">';
        html += '<div class="acc-section-title">Factures recentes</div>';
        if (data.recentInvoices && data.recentInvoices.length > 0) {
            html += '<div class="acc-table-wrapper"><table class="acc-table">';
            html += '<thead><tr><th>Numero</th><th>Client</th><th>Date</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>';
            html += '<tbody>';
            data.recentInvoices.forEach(function(inv) {
                html += '<tr>';
                html += '<td><strong>' + esc(inv.number || inv.invoice_number || '-') + '</strong></td>';
                html += '<td>' + esc(inv.contact_name || inv.client || '-') + '</td>';
                html += '<td>' + formatDate(inv.date || inv.created_at) + '</td>';
                html += '<td>' + currencyFmt.format(inv.total || inv.amount || 0) + '</td>';
                html += '<td>' + renderBadge(inv.status) + '</td>';
                html += '<td class="acc-table-actions">';
                html += '<button class="acc-btn acc-btn-sm" data-action="view-invoice" data-id="' + inv.id + '" title="Voir">' + ICONS.eye + '</button>';
                html += '</td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<div class="acc-empty"><div class="acc-empty-desc">Aucune facture recente</div></div>';
        }
        html += '</div>';

        return html;
    }

    function renderStatCard(label, value, color, growth, icon, isCount) {
        var formattedValue = isCount ? numberFmt.format(value) : currencyFmt.format(value);
        var trendHtml = '';
        if (growth !== null && growth !== undefined) {
            var dir = growth >= 0 ? 'up' : 'down';
            var sign = growth >= 0 ? '+' : '';
            trendHtml = '<span class="acc-stat-trend ' + dir + '">' + sign + growth.toFixed(1) + '%</span>';
        }
        return '<div class="acc-stat-card">' +
            '<div class="acc-stat-header">' +
            '<div class="acc-stat-icon ' + color + '">' + icon + '</div>' +
            trendHtml +
            '</div>' +
            '<div class="acc-stat-value">' + formattedValue + '</div>' +
            '<div class="acc-stat-label">' + label + '</div>' +
            '</div>';
    }

    function initDashboardCharts() {
        destroyCharts();
        var data = AccState.get('dashboard');
        if (!data) return;

        // Graphique revenus vs depenses
        var revenueCanvas = document.getElementById('acc-chart-revenue');
        if (revenueCanvas && typeof Chart !== 'undefined') {
            var months = data.monthlyData || [];
            var labels = months.map(function(m) { return m.label || m.month || ''; });
            var revenues = months.map(function(m) { return m.revenue || 0; });
            var expenses = months.map(function(m) { return m.expenses || 0; });

            chartsInstances.revenue = new Chart(revenueCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        {
                            label: 'Revenus',
                            data: revenues.length > 0 ? revenues : [0,0,0,0,0,0,0,0,0,0,0,0],
                            backgroundColor: 'rgba(0, 184, 148, 0.7)',
                            borderRadius: 6
                        },
                        {
                            label: 'Depenses',
                            data: expenses.length > 0 ? expenses : [0,0,0,0,0,0,0,0,0,0,0,0],
                            backgroundColor: 'rgba(231, 76, 60, 0.7)',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: function(v) { return currencyFmt.format(v); } } }
                    }
                }
            });
        }

        // Graphique repartition depenses (pie)
        var pieCanvas = document.getElementById('acc-chart-expenses-pie');
        if (pieCanvas && typeof Chart !== 'undefined') {
            var cats = data.expensesByCategory || [];
            var catLabels = cats.map(function(c) { return c.name || c.category || 'Autre'; });
            var catValues = cats.map(function(c) { return c.amount || c.total || 0; });
            var catColors = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#fd79a8', '#00cec9', '#636e72', '#a29bfe', '#ffeaa7'];

            if (catLabels.length === 0) {
                catLabels = ['Aucune donnee'];
                catValues = [1];
                catColors = ['#dfe6e9'];
            }

            chartsInstances.expensesPie = new Chart(pieCanvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: catLabels,
                    datasets: [{
                        data: catValues,
                        backgroundColor: catColors.slice(0, catLabels.length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } },
                    cutout: '65%'
                }
            });
        }
    }

    function destroyCharts() {
        Object.keys(chartsInstances).forEach(function(key) {
            if (chartsInstances[key]) {
                chartsInstances[key].destroy();
                chartsInstances[key] = null;
            }
        });
    }

    // =====================================================
    // ONGLET: FACTURES
    // =====================================================

    function loadInvoices() {
        AccState.setLoading('invoices', true);
        var filters = AccState.get('filters').invoices;
        return AccountingApi.getInvoices(filters).then(function(result) {
            AccState.setState('invoices', {
                data: result.data || result.invoices || result || [],
                pagination: result.pagination || null
            });
            AccState.setLoading('invoices', false);
        }).catch(function() {
            AccState.setLoading('invoices', false);
        });
    }

    function renderInvoices() {
        var state = AccState.get('invoices');
        var filters = AccState.get('filters').invoices;
        var invoices = state.data || [];
        var html = '';

        // Barre de filtres
        html += '<div class="acc-filter-bar">';
        html += '<div class="acc-search-wrapper">' + ICONS.search +
            '<input type="text" class="acc-search-input" placeholder="Rechercher une facture..." data-search="invoices" value="' + esc(filters.search || '') + '"></div>';
        html += '<select class="acc-select" data-filter="invoices-status">';
        html += '<option value="">Tous les statuts</option>';
        html += '<option value="draft"' + (filters.status === 'draft' ? ' selected' : '') + '>Brouillon</option>';
        html += '<option value="pending"' + (filters.status === 'pending' ? ' selected' : '') + '>En attente</option>';
        html += '<option value="sent"' + (filters.status === 'sent' ? ' selected' : '') + '>Envoyee</option>';
        html += '<option value="paid"' + (filters.status === 'paid' ? ' selected' : '') + '>Payee</option>';
        html += '<option value="overdue"' + (filters.status === 'overdue' ? ' selected' : '') + '>En retard</option>';
        html += '</select>';
        html += '<select class="acc-select" data-filter="invoices-type">';
        html += '<option value="">Tous les types</option>';
        html += '<option value="invoice"' + (filters.type === 'invoice' ? ' selected' : '') + '>Facture</option>';
        html += '<option value="quote"' + (filters.type === 'quote' ? ' selected' : '') + '>Devis</option>';
        html += '<option value="credit_note"' + (filters.type === 'credit_note' ? ' selected' : '') + '>Avoir</option>';
        html += '</select>';
        html += '<button class="acc-btn acc-btn-primary" data-action="create-invoice">' + ICONS.plus + ' Nouvelle facture</button>';
        html += '</div>';

        // Tableau
        if (invoices.length === 0) {
            html += '<div class="acc-empty">' +
                '<div class="acc-empty-title">Aucune facture trouvee</div>' +
                '<div class="acc-empty-desc">Creez votre premiere facture ou modifiez les filtres.</div>' +
                '<button class="acc-btn acc-btn-primary" data-action="create-invoice">' + ICONS.plus + ' Creer une facture</button></div>';
            return html;
        }

        html += '<div class="acc-table-wrapper"><table class="acc-table">';
        html += '<thead><tr><th>Numero</th><th>Client</th><th>Date</th><th>Echeance</th><th>Montant HT</th><th>TTC</th><th>Statut</th><th>Actions</th></tr></thead>';
        html += '<tbody>';
        invoices.forEach(function(inv) {
            html += '<tr>';
            html += '<td><strong>' + esc(inv.number || inv.invoice_number || '-') + '</strong></td>';
            html += '<td>' + esc(inv.contact_name || inv.client || '-') + '</td>';
            html += '<td>' + formatDate(inv.date || inv.issue_date || inv.created_at) + '</td>';
            html += '<td>' + formatDate(inv.due_date) + '</td>';
            html += '<td>' + currencyFmt.format(inv.subtotal || inv.amount_ht || 0) + '</td>';
            html += '<td><strong>' + currencyFmt.format(inv.total || inv.amount_ttc || 0) + '</strong></td>';
            html += '<td>' + renderBadge(inv.status) + '</td>';
            html += '<td class="acc-table-actions">';
            html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="view-invoice" data-id="' + inv.id + '" title="Voir">' + ICONS.eye + '</button>';
            html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="edit-invoice" data-id="' + inv.id + '" title="Modifier">' + ICONS.edit + '</button>';
            if (inv.status === 'sent' || inv.status === 'pending') {
                html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="pay-invoice" data-id="' + inv.id + '" title="Marquer payee">' + ICONS.check + '</button>';
            }
            if (inv.status === 'draft') {
                html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="send-invoice" data-id="' + inv.id + '" title="Envoyer">' + ICONS.send + '</button>';
            }
            if (inv.status === 'overdue') {
                html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="send-reminder" data-id="' + inv.id + '" title="Relancer">' + ICONS.alert + '</button>';
            }
            html += '<button class="acc-btn acc-btn-sm acc-btn-icon acc-btn-danger" data-action="delete-invoice" data-id="' + inv.id + '" title="Supprimer">' + ICONS.trash + '</button>';
            html += '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        html += renderPagination(state.pagination);
        return html;
    }

    // =====================================================
    // ONGLET: SCANNER
    // =====================================================

    function renderScanner() {
        var html = '<div class="acc-scanner">';
        html += '<div class="acc-scanner-zone" id="acc-scanner-drop">';
        html += '<div class="acc-scanner-icon">';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>';
        html += '</div>';
        html += '<div class="acc-scanner-title">Scanner une facture</div>';
        html += '<div class="acc-scanner-desc">Glissez-deposez une image ou un PDF, ou cliquez pour selectionner</div>';
        html += '<input type="file" id="acc-scan-input" accept="image/*,application/pdf" style="display:none" multiple>';
        html += '</div>';

        html += '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:32px;">';
        html += '<button class="acc-btn acc-btn-primary" data-action="scan-upload">' + ICONS.upload + ' Importer fichier</button>';
        html += '<button class="acc-btn" data-action="scan-camera">' + TABS[2].icon + ' Utiliser la camera</button>';
        html += '</div>';

        html += '<div id="acc-scan-results"></div>';
        html += '</div>';

        // Bind drag & drop apres le rendu
        setTimeout(function() { bindScannerDragDrop(); }, 50);

        return html;
    }

    function bindScannerDragDrop() {
        var zone = document.getElementById('acc-scanner-drop');
        if (!zone) return;

        zone.addEventListener('click', function() {
            var input = document.getElementById('acc-scan-input');
            if (input) input.click();
        });

        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            zone.classList.add('dragging');
        });

        zone.addEventListener('dragleave', function() {
            zone.classList.remove('dragging');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            zone.classList.remove('dragging');
            if (e.dataTransfer.files.length > 0) {
                processScanFiles(e.dataTransfer.files);
            }
        });

        var input = document.getElementById('acc-scan-input');
        if (input) {
            input.addEventListener('change', function() {
                if (input.files.length > 0) {
                    processScanFiles(input.files);
                }
            });
        }
    }

    function processScanFiles(files) {
        var resultsEl = document.getElementById('acc-scan-results');
        if (!resultsEl) return;

        resultsEl.innerHTML = '<div class="acc-loading"><div class="acc-loading-spinner"></div>Analyse en cours...</div>';

        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        var apiCall = files.length > 1 ? AccountingApi.batchScanInvoices(formData) : AccountingApi.scanInvoice(formData);

        apiCall.then(function(result) {
            renderScanResults(result);
        }).catch(function(err) {
            resultsEl.innerHTML = '<div class="acc-empty"><div class="acc-empty-title">Erreur lors de l\'analyse</div>' +
                '<div class="acc-empty-desc">' + esc(err.message || 'Veuillez reessayer') + '</div></div>';
        });
    }

    function renderScanResults(result) {
        var el = document.getElementById('acc-scan-results');
        if (!el) return;

        var data = result.data || result;
        var conf = data.confidence || 0;
        var confClass = conf >= 0.8 ? 'high' : (conf >= 0.5 ? 'medium' : 'low');
        var confLabel = conf >= 0.8 ? 'Confiance elevee' : (conf >= 0.5 ? 'Confiance moyenne' : 'Confiance faible');

        var html = '<div class="acc-scanner-results" style="max-width:600px;margin:0 auto;text-align:left;">';
        html += '<div class="acc-confidence ' + confClass + '">' + ICONS.check + ' ' + confLabel + ' (' + Math.round(conf * 100) + '%)</div>';

        html += '<div class="acc-extraction-form">';
        html += '<div class="acc-form-section-title">Donnees extraites</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Fournisseur</label><input type="text" class="acc-form-input" id="scan-vendor" value="' + esc(data.vendor || data.supplier || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Numero facture</label><input type="text" class="acc-form-input" id="scan-number" value="' + esc(data.invoice_number || data.number || '') + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Date</label><input type="date" class="acc-form-input" id="scan-date" value="' + esc(data.date || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Echeance</label><input type="date" class="acc-form-input" id="scan-due" value="' + esc(data.due_date || '') + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Montant HT</label><input type="number" class="acc-form-input" id="scan-ht" step="0.01" value="' + (data.amount_ht || data.subtotal || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">TVA</label><input type="number" class="acc-form-input" id="scan-tva" step="0.01" value="' + (data.tva || data.tax || '') + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Total TTC</label><input type="number" class="acc-form-input" id="scan-ttc" step="0.01" value="' + (data.amount_ttc || data.total || '') + '"></div>';

        html += '<div style="display:flex;gap:10px;margin-top:16px;">';
        html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Creer la facture</button>';
        html += '<button class="acc-btn" data-action="open-scanner">Nouveau scan</button>';
        html += '</div>';
        html += '</div></div>';

        el.innerHTML = html;
    }

    function triggerScanUpload() {
        var input = document.getElementById('acc-scan-input');
        if (input) input.click();
    }

    function triggerScanCamera() {
        var input = document.getElementById('acc-scan-input');
        if (input) {
            input.setAttribute('capture', 'environment');
            input.click();
            setTimeout(function() { input.removeAttribute('capture'); }, 100);
        }
    }

    // =====================================================
    // ONGLET: NOTES DE FRAIS
    // =====================================================

    function loadExpenses() {
        AccState.setLoading('expenses', true);
        var filters = AccState.get('filters').expenses;
        return AccountingApi.getExpenseReports(filters).then(function(result) {
            AccState.setState('expenses', {
                data: result.data || result.reports || result || [],
                pagination: result.pagination || null
            });
            AccState.setLoading('expenses', false);
        }).catch(function() { AccState.setLoading('expenses', false); });
    }

    function renderExpenses() {
        var state = AccState.get('expenses');
        var filters = AccState.get('filters').expenses;
        var expenses = state.data || [];
        var html = '';

        // Timeline du workflow
        html += '<div class="acc-timeline">';
        var steps = [
            { label: 'Brouillon', id: 'draft' },
            { label: 'Soumise', id: 'submitted' },
            { label: 'En revision', id: 'review' },
            { label: 'Approuvee', id: 'approved' },
            { label: 'Remboursee', id: 'reimbursed' }
        ];
        steps.forEach(function(step, i) {
            if (i > 0) html += '<div class="acc-timeline-line"></div>';
            html += '<div class="acc-timeline-step">';
            html += '<div class="acc-timeline-dot pending">' + (i + 1) + '</div>';
            html += '<span class="acc-timeline-label">' + step.label + '</span>';
            html += '</div>';
        });
        html += '</div>';

        // Filtres
        html += '<div class="acc-filter-bar">';
        html += '<div class="acc-search-wrapper">' + ICONS.search +
            '<input type="text" class="acc-search-input" placeholder="Rechercher une note de frais..." data-search="expenses" value="' + esc(filters.search || '') + '"></div>';
        html += '<select class="acc-select" data-filter="expenses-status">';
        html += '<option value="">Tous les statuts</option>';
        html += '<option value="draft"' + (filters.status === 'draft' ? ' selected' : '') + '>Brouillon</option>';
        html += '<option value="submitted"' + (filters.status === 'submitted' ? ' selected' : '') + '>Soumise</option>';
        html += '<option value="approved"' + (filters.status === 'approved' ? ' selected' : '') + '>Approuvee</option>';
        html += '<option value="rejected"' + (filters.status === 'rejected' ? ' selected' : '') + '>Rejetee</option>';
        html += '</select>';
        html += '<button class="acc-btn acc-btn-primary" data-action="create-expense">' + ICONS.plus + ' Nouvelle note</button>';
        html += '</div>';

        if (expenses.length === 0) {
            html += '<div class="acc-empty"><div class="acc-empty-title">Aucune note de frais</div>' +
                '<div class="acc-empty-desc">Creez votre premiere note de frais.</div></div>';
            return html;
        }

        html += '<div class="acc-table-wrapper"><table class="acc-table">';
        html += '<thead><tr><th>Titre</th><th>Auteur</th><th>Date</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>';
        html += '<tbody>';
        expenses.forEach(function(exp) {
            html += '<tr>';
            html += '<td><strong>' + esc(exp.title || exp.name || '-') + '</strong></td>';
            html += '<td>' + esc(exp.author || exp.submitted_by || '-') + '</td>';
            html += '<td>' + formatDate(exp.date || exp.created_at) + '</td>';
            html += '<td>' + currencyFmt.format(exp.total || exp.amount || 0) + '</td>';
            html += '<td>' + renderBadge(exp.status) + '</td>';
            html += '<td class="acc-table-actions">';
            html += '<button class="acc-btn acc-btn-sm" data-action="view-invoice" data-id="' + exp.id + '">' + ICONS.eye + '</button>';
            if (exp.status === 'draft') {
                html += '<button class="acc-btn acc-btn-sm acc-btn-primary" data-action="submit-expense" data-id="' + exp.id + '">Soumettre</button>';
            }
            if (exp.status === 'submitted') {
                html += '<button class="acc-btn acc-btn-sm" style="color:#00b894;" data-action="approve-expense" data-id="' + exp.id + '">Approuver</button>';
                html += '<button class="acc-btn acc-btn-sm acc-btn-danger" data-action="reject-expense" data-id="' + exp.id + '">Rejeter</button>';
            }
            html += '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        html += renderPagination(state.pagination);
        return html;
    }

    // =====================================================
    // ONGLET: TVA
    // =====================================================

    function loadTVA() {
        AccState.setLoading('tva', true);
        var year = AccState.get('currentYear');
        var quarter = AccState.get('currentQuarter');
        return AccountingApi.getTVASummary(year, quarter).then(function(result) {
            AccState.setState('tva', result);
            AccState.setLoading('tva', false);
        }).catch(function() { AccState.setLoading('tva', false); });
    }

    function renderTVA() {
        var tva = AccState.get('tva');
        var year = AccState.get('currentYear');
        var html = '';

        html += '<div class="acc-section-title">Declaration TVA - ' + year + '</div>';

        if (!tva) {
            html += '<div class="acc-empty"><div class="acc-empty-desc">Aucune donnee TVA disponible</div></div>';
            return html;
        }

        // Cartes resumees
        var collected = tva.tva_collected || tva.collected || 0;
        var deductible = tva.tva_deductible || tva.deductible || 0;
        var net = collected - deductible;

        html += '<div class="acc-tva-summary">';
        html += '<div class="acc-tva-card"><div class="acc-tva-card-label">TVA Collectee</div><div class="acc-tva-card-value">' + currencyFmt.format(collected) + '</div></div>';
        html += '<div class="acc-tva-card"><div class="acc-tva-card-label">TVA Deductible</div><div class="acc-tva-card-value">' + currencyFmt.format(deductible) + '</div></div>';
        html += '<div class="acc-tva-card"><div class="acc-tva-card-label">TVA Nette</div><div class="acc-tva-card-value ' + (net >= 0 ? 'negative' : 'positive') + '">' + currencyFmt.format(Math.abs(net)) + (net >= 0 ? ' a payer' : ' credit') + '</div></div>';
        html += '</div>';

        // Tableau trimestriel
        var quarters = tva.quarters || tva.quarterly || [];
        if (quarters.length > 0) {
            html += '<div class="acc-section-title">Detail par trimestre</div>';
            html += '<div class="acc-table-wrapper"><table class="acc-table quarter-table">';
            html += '<thead><tr><th>Trimestre</th><th>TVA Collectee</th><th>TVA Deductible</th><th>Solde</th><th>Actions</th></tr></thead>';
            html += '<tbody>';
            quarters.forEach(function(q) {
                var qNet = (q.collected || 0) - (q.deductible || 0);
                html += '<tr>';
                html += '<td><strong>T' + (q.quarter || q.q) + '</strong></td>';
                html += '<td>' + currencyFmt.format(q.collected || 0) + '</td>';
                html += '<td>' + currencyFmt.format(q.deductible || 0) + '</td>';
                html += '<td class="' + (qNet >= 0 ? '' : 'acc-variance positive') + '"><strong>' + currencyFmt.format(qNet) + '</strong></td>';
                html += '<td><button class="acc-btn acc-btn-sm" data-action="export-menu">' + ICONS.download + ' Exporter</button></td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }

        return html;
    }

    // =====================================================
    // ONGLET: BUDGETS
    // =====================================================

    function loadBudgets() {
        AccState.setLoading('budgets', true);
        var year = AccState.get('currentYear');
        return Promise.all([
            AccountingApi.getBudgets(year).catch(function() { return null; }),
            AccountingApi.getBudgetVariance(year).catch(function() { return []; }),
            AccountingApi.getDepartments().catch(function() { return []; })
        ]).then(function(results) {
            AccState.setState('budgets', {
                overview: results[0],
                variance: results[1] && results[1].data ? results[1].data : (results[1] || [])
            });
            AccState.setState('departments', results[2].data || results[2] || []);
            AccState.setLoading('budgets', false);
        }).catch(function() { AccState.setLoading('budgets', false); });
    }

    function renderBudgets() {
        var budgets = AccState.get('budgets');
        var departments = AccState.get('departments');
        var variance = budgets.variance || [];
        var html = '';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
        html += '<div class="acc-section-title" style="margin:0;">Budgets - ' + AccState.get('currentYear') + '</div>';
        html += '<button class="acc-btn acc-btn-primary" data-action="create-budget">' + ICONS.plus + ' Definir un budget</button>';
        html += '</div>';

        if (variance.length === 0) {
            html += '<div class="acc-empty"><div class="acc-empty-title">Aucun budget defini</div>' +
                '<div class="acc-empty-desc">Definissez des budgets par departement pour suivre vos depenses.</div></div>';
            return html;
        }

        html += '<div class="acc-budget-grid">';
        variance.forEach(function(item) {
            var budget = item.budget || item.allocated || 0;
            var spent = item.spent || item.actual || 0;
            var pct = budget > 0 ? Math.min((spent / budget) * 100, 150) : 0;
            var diff = budget - spent;
            var colorClass = pct < 75 ? 'green' : (pct < 100 ? 'orange' : 'red');
            var varianceClass = diff >= 0 ? 'positive' : 'negative';

            html += '<div class="acc-budget-card">';
            html += '<div class="acc-budget-header">';
            html += '<span class="acc-budget-dept">' + esc(item.department || item.name || 'Non assigne') + '</span>';
            html += '<span class="acc-budget-amount">' + currencyFmt.format(budget) + '</span>';
            html += '</div>';
            html += '<div class="acc-progress-bar"><div class="acc-progress-fill ' + colorClass + '" style="width:' + Math.min(pct, 100) + '%"></div></div>';
            html += '<div class="acc-budget-meta">';
            html += '<span>Depense: ' + currencyFmt.format(spent) + ' (' + pct.toFixed(0) + '%)</span>';
            html += '<span class="acc-variance ' + varianceClass + '">' + (diff >= 0 ? '+' : '') + currencyFmt.format(diff) + '</span>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        return html;
    }

    // =====================================================
    // ONGLET: BANQUE
    // =====================================================

    function loadBank() {
        AccState.setLoading('bank', true);
        var filters = AccState.get('filters').bank;
        return AccountingApi.getBankTransactions(filters).then(function(result) {
            AccState.setState('bankTransactions', {
                data: result.data || result.transactions || result || [],
                pagination: result.pagination || null
            });
            AccState.setLoading('bank', false);
        }).catch(function() { AccState.setLoading('bank', false); });
    }

    function renderBank() {
        var state = AccState.get('bankTransactions');
        var filters = AccState.get('filters').bank;
        var txs = state.data || [];
        var html = '';

        // Filtres
        html += '<div class="acc-filter-bar">';
        html += '<div class="acc-search-wrapper">' + ICONS.search +
            '<input type="text" class="acc-search-input" placeholder="Rechercher une transaction..." data-search="bank" value="' + esc(filters.search || '') + '"></div>';
        html += '<select class="acc-select" data-filter="bank-reconciled">';
        html += '<option value="">Toutes</option>';
        html += '<option value="true"' + (filters.reconciled === 'true' ? ' selected' : '') + '>Rapprochees</option>';
        html += '<option value="false"' + (filters.reconciled === 'false' ? ' selected' : '') + '>Non rapprochees</option>';
        html += '</select>';
        html += '<button class="acc-btn" data-action="auto-match">' + ICONS.refresh + ' Rapprochement auto</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="import-bank">' + ICONS.upload + ' Importer</button>';
        html += '</div>';

        if (txs.length === 0) {
            html += '<div class="acc-empty"><div class="acc-empty-title">Aucune transaction bancaire</div>' +
                '<div class="acc-empty-desc">Importez vos releves bancaires (CSV, OFX) pour demarrer le rapprochement.</div></div>';
            return html;
        }

        html += '<div class="acc-bank-list">';
        txs.forEach(function(tx) {
            var isMatched = tx.matched || tx.reconciled || tx.invoice_id;
            var amountClass = (tx.amount || 0) >= 0 ? 'credit' : 'debit';

            html += '<div class="acc-bank-item ' + (isMatched ? 'matched' : 'unmatched') + '">';
            html += '<div class="acc-bank-date">' + formatDate(tx.date || tx.transaction_date) + '</div>';
            html += '<div class="acc-bank-desc">' + esc(tx.description || tx.label || '-') + '</div>';
            html += '<div class="acc-bank-amount ' + amountClass + '">' + currencyFmt.format(tx.amount || 0) + '</div>';
            html += '<div class="acc-bank-match">';
            if (isMatched) {
                html += '<span class="acc-badge acc-badge-paid">Rapprochee</span>';
                html += '<button class="acc-btn acc-btn-sm" data-action="unmatch-tx" data-tx-id="' + tx.id + '">Defaire</button>';
            } else {
                html += '<button class="acc-btn acc-btn-sm acc-btn-primary" data-action="match-tx" data-tx-id="' + tx.id + '">Rapprocher</button>';
            }
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        html += renderPagination(state.pagination);
        return html;
    }

    // =====================================================
    // ONGLET: CONTACTS
    // =====================================================

    function loadContacts() {
        AccState.setLoading('contacts', true);
        var filters = AccState.get('filters').contacts;
        return AccountingApi.getContacts(filters).then(function(result) {
            AccState.setState('contacts', {
                data: result.data || result.contacts || result || [],
                pagination: result.pagination || null
            });
            AccState.setLoading('contacts', false);
        }).catch(function() { AccState.setLoading('contacts', false); });
    }

    function renderContacts() {
        var state = AccState.get('contacts');
        var filters = AccState.get('filters').contacts;
        var contacts = state.data || [];
        var html = '';

        // Filtres
        html += '<div class="acc-filter-bar">';
        html += '<div class="acc-search-wrapper">' + ICONS.search +
            '<input type="text" class="acc-search-input" placeholder="Rechercher un contact..." data-search="contacts" value="' + esc(filters.search || '') + '"></div>';
        html += '<select class="acc-select" data-filter="contacts-type">';
        html += '<option value="">Tous les types</option>';
        html += '<option value="client"' + (filters.type === 'client' ? ' selected' : '') + '>Client</option>';
        html += '<option value="supplier"' + (filters.type === 'supplier' ? ' selected' : '') + '>Fournisseur</option>';
        html += '<option value="both"' + (filters.type === 'both' ? ' selected' : '') + '>Les deux</option>';
        html += '</select>';
        html += '<button class="acc-btn acc-btn-primary" data-action="create-contact">' + ICONS.plus + ' Nouveau contact</button>';
        html += '</div>';

        if (contacts.length === 0) {
            html += '<div class="acc-empty"><div class="acc-empty-title">Aucun contact</div>' +
                '<div class="acc-empty-desc">Ajoutez vos clients et fournisseurs.</div></div>';
            return html;
        }

        html += '<div class="acc-contacts-grid">';
        contacts.forEach(function(c) {
            var initials = getInitials(c.name || c.company_name || '?');
            html += '<div class="acc-contact-card" data-action="view-contact" data-id="' + c.id + '">';
            html += '<div class="acc-contact-avatar">' + initials + '</div>';
            html += '<div class="acc-contact-name">' + esc(c.name || '-') + '</div>';
            html += '<div class="acc-contact-company">' + esc(c.company_name || c.company || '') + '</div>';
            if (c.email) html += '<div class="acc-contact-email">' + esc(c.email) + '</div>';
            html += '<div class="acc-contact-meta">';
            html += '<span>' + esc(c.type === 'client' ? 'Client' : (c.type === 'supplier' ? 'Fournisseur' : (c.type || ''))) + '</span>';
            html += '<span>' + (c.invoice_count || 0) + ' facture(s)</span>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        html += renderPagination(state.pagination);
        return html;
    }

    // =====================================================
    // ONGLET RECURRENTES (delegation vers AccRecurring)
    // =====================================================

    function loadRecurring() {
        return Promise.resolve();
    }

    function renderRecurring() {
        return '<div id="acc-recurring-container" style="padding:0"></div>';
    }

    // =====================================================
    // ACTIONS FACTURES
    // =====================================================

    function viewInvoice(id) {
        AccountingApi.getInvoice(id).then(function(result) {
            var inv = result.data || result;
            openModal('Facture ' + (inv.number || inv.invoice_number || ''), renderInvoiceDetail(inv));
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Impossible de charger la facture'), 'error');
        });
    }

    function renderInvoiceDetail(inv) {
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-form-row">';
        html += '<div><span class="acc-form-label">Statut</span><div>' + renderBadge(inv.status) + '</div></div>';
        html += '<div><span class="acc-form-label">Date</span><div>' + formatDate(inv.date || inv.issue_date || inv.created_at) + '</div></div>';
        html += '</div>';
        html += '<div class="acc-form-row" style="margin-top:12px;">';
        html += '<div><span class="acc-form-label">Client</span><div>' + esc(inv.contact_name || inv.client || '-') + '</div></div>';
        html += '<div><span class="acc-form-label">Echeance</span><div>' + formatDate(inv.due_date) + '</div></div>';
        html += '</div>';

        // Lignes
        var items = inv.items || inv.line_items || [];
        if (items.length > 0) {
            html += '<div style="margin-top:20px;">';
            html += '<div class="acc-line-items">';
            html += '<div class="acc-line-items-header"><span>Description</span><span>Qte</span><span>P.U.</span><span>Total</span><span></span></div>';
            items.forEach(function(item) {
                html += '<div class="acc-line-item-row">';
                html += '<span>' + esc(item.description || item.name || '') + '</span>';
                html += '<span>' + (item.quantity || 1) + '</span>';
                html += '<span>' + currencyFmt.format(item.unit_price || item.price || 0) + '</span>';
                html += '<span>' + currencyFmt.format(item.total || (item.quantity || 1) * (item.unit_price || 0)) + '</span>';
                html += '<span></span>';
                html += '</div>';
            });
            html += '<div class="acc-line-items-total">';
            html += '<div class="acc-line-items-total-row"><span class="acc-line-items-total-label">Sous-total HT</span><span class="acc-line-items-total-value">' + currencyFmt.format(inv.subtotal || inv.amount_ht || 0) + '</span></div>';
            html += '<div class="acc-line-items-total-row"><span class="acc-line-items-total-label">TVA</span><span class="acc-line-items-total-value">' + currencyFmt.format(inv.tax || inv.tva || 0) + '</span></div>';
            html += '<div class="acc-line-items-total-row"><span class="acc-line-items-total-label">Total TTC</span><span class="acc-line-items-total-value grand">' + currencyFmt.format(inv.total || inv.amount_ttc || 0) + '</span></div>';
            html += '</div>';
            html += '</div></div>';
        } else {
            html += '<div style="margin-top:16px;"><span class="acc-form-label">Total TTC</span><div style="font-size:1.3rem;font-weight:700;">' + currencyFmt.format(inv.total || inv.amount_ttc || 0) + '</div></div>';
        }

        html += '</div>';
        html += '<div class="acc-modal-footer">';
        if (inv.status === 'draft') {
            html += '<button class="acc-btn acc-btn-primary" data-action="send-invoice" data-id="' + inv.id + '">Envoyer</button>';
        }
        if (inv.status === 'sent' || inv.status === 'pending') {
            html += '<button class="acc-btn acc-btn-primary" data-action="pay-invoice" data-id="' + inv.id + '">Marquer payee</button>';
        }
        html += '<button class="acc-btn" data-action="edit-invoice" data-id="' + inv.id + '">Modifier</button>';
        html += '</div>';
        return html;
    }

    function editInvoice(id) {
        AccountingApi.getInvoice(id).then(function(result) {
            var inv = result.data || result;
            openModal('Modifier facture ' + (inv.number || ''), renderInvoiceForm(inv));
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Impossible de charger'), 'error');
        });
    }

    function deleteInvoice(id) {
        if (!confirm('Etes-vous sur de vouloir supprimer cette facture ?')) return;
        AccountingApi.deleteInvoice(id).then(function() {
            showToast('Facture supprimee', 'success');
            loadInvoices().then(function() { renderTabContent(TABS[1]); });
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Echec de la suppression'), 'error');
        });
    }

    function markInvoicePaid(id) {
        AccountingApi.markInvoicePaid(id, { paid_at: new Date().toISOString().split('T')[0] }).then(function() {
            showToast('Facture marquee comme payee', 'success');
            closeModal();
            loadInvoices().then(function() { renderTabContent(TABS[1]); });
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Echec'), 'error');
        });
    }

    function sendInvoiceAction(id) {
        AccountingApi.sendInvoice(id).then(function() {
            showToast('Facture envoyee', 'success');
            closeModal();
            loadInvoices().then(function() { renderTabContent(TABS[1]); });
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Echec de l\'envoi'), 'error');
        });
    }

    function sendReminderAction(id) {
        AccountingApi.sendReminder(id).then(function() {
            showToast('Relance envoyee', 'success');
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Echec de la relance'), 'error');
        });
    }

    // =====================================================
    // ACTIONS NOTES DE FRAIS
    // =====================================================

    function submitExpense(id) {
        AccountingApi.submitExpenseReport(id).then(function() {
            showToast('Note de frais soumise', 'success');
            loadExpenses().then(function() { renderTabContent(TABS[3]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    function approveExpense(id) {
        AccountingApi.approveExpenseReport(id).then(function() {
            showToast('Note de frais approuvee', 'success');
            loadExpenses().then(function() { renderTabContent(TABS[3]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    function rejectExpense(id) {
        var reason = prompt('Raison du rejet :');
        if (reason === null) return;
        AccountingApi.rejectExpenseReport(id, { reason: reason }).then(function() {
            showToast('Note de frais rejetee', 'success');
            loadExpenses().then(function() { renderTabContent(TABS[3]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    // =====================================================
    // ACTIONS BANQUE
    // =====================================================

    function autoMatchBank() {
        showToast('Rapprochement automatique en cours...', 'info');
        AccountingApi.autoMatchBankTransactions().then(function(result) {
            var count = result.matched_count || result.count || 0;
            showToast(count + ' transaction(s) rapprochee(s)', 'success');
            loadBank().then(function() { renderTabContent(TABS[6]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    function matchTransaction(txId) {
        var invoiceId = prompt('ID de la facture a rapprocher :');
        if (!invoiceId) return;
        AccountingApi.matchBankTransaction(txId, invoiceId).then(function() {
            showToast('Transaction rapprochee', 'success');
            loadBank().then(function() { renderTabContent(TABS[6]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    function unmatchTransaction(txId) {
        AccountingApi.unmatchBankTransaction(txId).then(function() {
            showToast('Rapprochement annule', 'success');
            loadBank().then(function() { renderTabContent(TABS[6]); });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    // =====================================================
    // ACTIONS CONTACTS
    // =====================================================

    function viewContact(id) {
        AccountingApi.getContact(id).then(function(result) {
            var c = result.data || result;
            var html = '<div class="acc-modal-body">';
            html += '<div style="text-align:center;margin-bottom:20px;">';
            html += '<div class="acc-contact-avatar" style="margin:0 auto 12px;width:64px;height:64px;font-size:1.5rem;">' + getInitials(c.name || '?') + '</div>';
            html += '<div style="font-size:1.1rem;font-weight:700;">' + esc(c.name || '-') + '</div>';
            html += '<div style="color:var(--text-secondary,#666);">' + esc(c.company_name || '') + '</div>';
            html += '</div>';
            html += '<div class="acc-form-row">';
            html += '<div class="acc-form-group"><span class="acc-form-label">Email</span><div>' + esc(c.email || '-') + '</div></div>';
            html += '<div class="acc-form-group"><span class="acc-form-label">Telephone</span><div>' + esc(c.phone || '-') + '</div></div>';
            html += '</div>';
            html += '<div class="acc-form-row">';
            html += '<div class="acc-form-group"><span class="acc-form-label">Adresse</span><div>' + esc(c.address || '-') + '</div></div>';
            html += '<div class="acc-form-group"><span class="acc-form-label">Type</span><div>' + esc(c.type || '-') + '</div></div>';
            html += '</div>';
            if (c.siret) html += '<div class="acc-form-group"><span class="acc-form-label">SIRET</span><div>' + esc(c.siret) + '</div></div>';
            if (c.vat_number) html += '<div class="acc-form-group"><span class="acc-form-label">N. TVA</span><div>' + esc(c.vat_number) + '</div></div>';
            html += '</div>';
            openModal('Contact - ' + esc(c.name || ''), html);
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    // =====================================================
    // ACTIONS ALERTES
    // =====================================================

    function markAlertRead(id) {
        AccountingApi.markAlertRead(id).then(function() {
            loadDashboard().then(function() { renderTabContent(TABS[0]); });
        }).catch(function() {});
    }

    function dismissAlert(id) {
        AccountingApi.dismissAlert(id).then(function() {
            loadDashboard().then(function() { renderTabContent(TABS[0]); });
        }).catch(function() {});
    }

    // =====================================================
    // MODALES
    // =====================================================

    function openModal(title, bodyHtml) {
        var overlay = document.getElementById('acc-modal-overlay');
        var modal = document.getElementById('acc-modal');
        if (!overlay || !modal) return;

        modal.innerHTML = '<div class="acc-modal-header">' +
            '<span class="acc-modal-title">' + title + '</span>' +
            '<button class="acc-modal-close">' + ICONS.close + '</button>' +
            '</div>' + bodyHtml;
        overlay.classList.add('open');
    }

    function closeModal() {
        var overlay = document.getElementById('acc-modal-overlay');
        if (overlay) overlay.classList.remove('open');
    }

    function openInvoiceModal(invoice) {
        var title = invoice ? 'Modifier la facture' : 'Nouvelle facture';
        openModal(title, renderInvoiceForm(invoice));
    }

    function renderInvoiceForm(inv) {
        var data = inv || {};
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-form-section"><div class="acc-form-section-title">Informations generales</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Type</label><select class="acc-form-select" id="modal-type">';
        html += '<option value="invoice"' + (data.type === 'invoice' || !data.type ? ' selected' : '') + '>Facture</option>';
        html += '<option value="quote"' + (data.type === 'quote' ? ' selected' : '') + '>Devis</option>';
        html += '<option value="credit_note"' + (data.type === 'credit_note' ? ' selected' : '') + '>Avoir</option>';
        html += '</select></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Client</label><input type="text" class="acc-form-input" id="modal-client" value="' + esc(data.contact_name || data.client || '') + '" placeholder="Nom du client"></div>';
        html += '</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Date d\'emission</label><input type="date" class="acc-form-input" id="modal-date" value="' + esc(data.date || data.issue_date || new Date().toISOString().split('T')[0]) + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Date d\'echeance</label><input type="date" class="acc-form-input" id="modal-due" value="' + esc(data.due_date || '') + '"></div>';
        html += '</div></div>';

        html += '<div class="acc-form-section"><div class="acc-form-section-title">Montants</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Montant HT</label><input type="number" class="acc-form-input" id="modal-ht" step="0.01" value="' + (data.subtotal || data.amount_ht || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Taux TVA (%)</label><input type="number" class="acc-form-input" id="modal-tva-rate" value="' + (data.tva_rate || 20) + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Description</label><textarea class="acc-form-textarea" id="modal-desc" rows="3">' + esc(data.description || data.notes || '') + '</textarea></div>';
        html += '</div>';

        html += '</div>';
        html += '<div class="acc-modal-footer">';
        html += '<button class="acc-btn" onclick="AccountingView.closeModal()">Annuler</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Enregistrer</button>';
        html += '</div>';

        // Stocker l'ID pour la sauvegarde
        if (data.id) {
            html = '<input type="hidden" id="modal-entity-id" value="' + data.id + '">' + html;
        }

        return html;
    }

    function openExpenseModal() {
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Titre</label><input type="text" class="acc-form-input" id="modal-title" placeholder="Titre de la note de frais"></div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Date</label><input type="date" class="acc-form-input" id="modal-date" value="' + new Date().toISOString().split('T')[0] + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Montant</label><input type="number" class="acc-form-input" id="modal-amount" step="0.01"></div>';
        html += '</div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Description</label><textarea class="acc-form-textarea" id="modal-desc" rows="3"></textarea></div>';
        html += '</div>';
        html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Annuler</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Creer</button></div>';
        openModal('Nouvelle note de frais', html);
    }

    function openBudgetModal() {
        var departments = AccState.get('departments') || [];
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Departement</label><select class="acc-form-select" id="modal-dept">';
        html += '<option value="">Selectionner...</option>';
        departments.forEach(function(d) {
            html += '<option value="' + d.id + '">' + esc(d.name) + '</option>';
        });
        html += '</select></div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Annee</label><input type="number" class="acc-form-input" id="modal-year" value="' + AccState.get('currentYear') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Montant alloue</label><input type="number" class="acc-form-input" id="modal-amount" step="0.01"></div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Annuler</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Definir</button></div>';
        openModal('Definir un budget', html);
    }

    function openBankImportModal() {
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-scanner-zone" style="cursor:pointer;" onclick="document.getElementById(\'modal-bank-file\').click()">';
        html += '<div class="acc-scanner-icon" style="width:60px;height:60px;">' + ICONS.upload + '</div>';
        html += '<div class="acc-scanner-title">Importer un releve bancaire</div>';
        html += '<div class="acc-scanner-desc">Formats acceptes: CSV, OFX, QIF</div>';
        html += '<input type="file" id="modal-bank-file" accept=".csv,.ofx,.qif" style="display:none">';
        html += '</div>';
        html += '</div>';
        html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Fermer</button></div>';
        openModal('Importer des transactions', html);
    }

    function openContactModal(contact) {
        var data = contact || {};
        var title = data.id ? 'Modifier le contact' : 'Nouveau contact';
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Nom</label><input type="text" class="acc-form-input" id="modal-name" value="' + esc(data.name || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Societe</label><input type="text" class="acc-form-input" id="modal-company" value="' + esc(data.company_name || '') + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Email</label><input type="email" class="acc-form-input" id="modal-email" value="' + esc(data.email || '') + '"></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Telephone</label><input type="text" class="acc-form-input" id="modal-phone" value="' + esc(data.phone || '') + '"></div>';
        html += '</div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">Adresse</label><textarea class="acc-form-textarea" id="modal-address" rows="2">' + esc(data.address || '') + '</textarea></div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label class="acc-form-label">Type</label><select class="acc-form-select" id="modal-type">';
        html += '<option value="client"' + (data.type === 'client' ? ' selected' : '') + '>Client</option>';
        html += '<option value="supplier"' + (data.type === 'supplier' ? ' selected' : '') + '>Fournisseur</option>';
        html += '<option value="both"' + (data.type === 'both' ? ' selected' : '') + '>Les deux</option>';
        html += '</select></div>';
        html += '<div class="acc-form-group"><label class="acc-form-label">SIRET</label><input type="text" class="acc-form-input" id="modal-siret" value="' + esc(data.siret || '') + '"></div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Annuler</button>';
        html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Enregistrer</button></div>';
        if (data.id) html = '<input type="hidden" id="modal-entity-id" value="' + data.id + '">' + html;
        openModal(title, html);
    }

    function openExportModal() {
        var year = AccState.get('currentYear');
        var html = '<div class="acc-modal-body">';
        html += '<div class="acc-section-title">Exports disponibles</div>';

        var exports = [
            { label: 'FEC (Fichier des Ecritures Comptables)', action: 'export-fec', desc: 'Export legal obligatoire' },
            { label: 'Declaration TVA', action: 'export-tva', desc: 'Annee ' + year },
            { label: 'Bilan comptable', action: 'export-bilan', desc: 'Annee ' + year },
            { label: 'Factures (CSV)', action: 'export-invoices', desc: 'Toutes les factures' },
            { label: 'Notes de frais (CSV)', action: 'export-expenses', desc: 'Toutes les notes' }
        ];

        exports.forEach(function(exp) {
            html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border-color,#f0f0f0);">';
            html += '<div><div style="font-weight:600;font-size:0.9rem;">' + exp.label + '</div><div style="font-size:0.8rem;color:var(--text-secondary,#999);">' + exp.desc + '</div></div>';
            html += '<button class="acc-btn acc-btn-sm" data-action="' + exp.action + '">' + ICONS.download + ' Exporter</button>';
            html += '</div>';
        });

        html += '</div>';
        html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Fermer</button></div>';
        openModal('Exports', html);
    }

    function openSettingsModal() {
        AccountingApi.getCompanySettings().then(function(result) {
            var settings = result.data || result || {};
            var html = '<div class="acc-modal-body">';
            html += '<div class="acc-form-section"><div class="acc-form-section-title">Informations de la societe</div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">Nom</label><input type="text" class="acc-form-input" id="modal-company-name" value="' + esc(settings.name || '') + '"></div>';
            html += '<div class="acc-form-row">';
            html += '<div class="acc-form-group"><label class="acc-form-label">SIRET</label><input type="text" class="acc-form-input" id="modal-company-siret" value="' + esc(settings.siret || '') + '"></div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">N. TVA</label><input type="text" class="acc-form-input" id="modal-company-vat" value="' + esc(settings.vat_number || '') + '"></div>';
            html += '</div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">Adresse</label><textarea class="acc-form-textarea" id="modal-company-address" rows="2">' + esc(settings.address || '') + '</textarea></div>';
            html += '<div class="acc-form-row">';
            html += '<div class="acc-form-group"><label class="acc-form-label">Email</label><input type="email" class="acc-form-input" id="modal-company-email" value="' + esc(settings.email || '') + '"></div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">Telephone</label><input type="text" class="acc-form-input" id="modal-company-phone" value="' + esc(settings.phone || '') + '"></div>';
            html += '</div></div>';

            html += '<div class="acc-form-section"><div class="acc-form-section-title">Parametres de facturation</div>';
            html += '<div class="acc-form-row">';
            html += '<div class="acc-form-group"><label class="acc-form-label">Taux TVA par defaut (%)</label><input type="number" class="acc-form-input" id="modal-company-tva" value="' + (settings.default_tva_rate || 20) + '"></div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">Delai de paiement (jours)</label><input type="number" class="acc-form-input" id="modal-company-payment" value="' + (settings.payment_terms || 30) + '"></div>';
            html += '</div>';
            html += '<div class="acc-form-group"><label class="acc-form-label">Mentions legales</label><textarea class="acc-form-textarea" id="modal-company-legal" rows="3">' + esc(settings.legal_notice || '') + '</textarea></div>';
            html += '</div></div>';

            html += '<div class="acc-modal-footer"><button class="acc-btn" onclick="AccountingView.closeModal()">Annuler</button>';
            html += '<button class="acc-btn acc-btn-primary" data-action="save-modal">Enregistrer</button></div>';
            openModal('Parametres de la societe', html);
        }).catch(function(err) {
            showToast('Erreur: ' + (err.message || 'Impossible de charger les parametres'), 'error');
        });
    }

    function saveModalForm() {
        var currentTab = AccState.get('currentTab');

        // Detection du contexte de la modale
        if (document.getElementById('modal-company-name')) {
            // Sauvegarde parametres societe
            var data = {
                name: val('modal-company-name'),
                siret: val('modal-company-siret'),
                vat_number: val('modal-company-vat'),
                address: val('modal-company-address'),
                email: val('modal-company-email'),
                phone: val('modal-company-phone'),
                default_tva_rate: parseFloat(val('modal-company-tva')) || 20,
                payment_terms: parseInt(val('modal-company-payment')) || 30,
                legal_notice: val('modal-company-legal')
            };
            AccountingApi.updateCompanySettings(data).then(function() {
                showToast('Parametres enregistres', 'success');
                closeModal();
            }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
            return;
        }

        if (document.getElementById('modal-dept')) {
            // Sauvegarde budget
            var budgetData = {
                department_id: val('modal-dept'),
                year: parseInt(val('modal-year')),
                amount: parseFloat(val('modal-amount')) || 0
            };
            AccountingApi.setBudget(budgetData).then(function() {
                showToast('Budget defini', 'success');
                closeModal();
                loadBudgets().then(function() { renderTabContent(TABS[5]); });
            }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
            return;
        }

        if (document.getElementById('modal-title') && currentTab === 'expenses') {
            // Sauvegarde note de frais
            var expData = {
                title: val('modal-title'),
                date: val('modal-date'),
                amount: parseFloat(val('modal-amount')) || 0,
                description: val('modal-desc')
            };
            AccountingApi.createExpenseReport(expData).then(function() {
                showToast('Note de frais creee', 'success');
                closeModal();
                loadExpenses().then(function() { renderTabContent(TABS[3]); });
            }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
            return;
        }

        if (document.getElementById('modal-name') && (currentTab === 'contacts' || document.getElementById('modal-siret'))) {
            // Sauvegarde contact
            var contactData = {
                name: val('modal-name'),
                company_name: val('modal-company'),
                email: val('modal-email'),
                phone: val('modal-phone'),
                address: val('modal-address'),
                type: val('modal-type'),
                siret: val('modal-siret')
            };
            var entityId = val('modal-entity-id');
            var api = entityId ? AccountingApi.updateContact(entityId, contactData) : AccountingApi.createContact(contactData);
            api.then(function() {
                showToast(entityId ? 'Contact modifie' : 'Contact cree', 'success');
                closeModal();
                loadContacts().then(function() { renderTabContent(TABS[7]); });
            }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
            return;
        }

        // Sauvegarde facture (defaut)
        var ht = parseFloat(val('modal-ht') || val('scan-ht')) || 0;
        var tvaRate = parseFloat(val('modal-tva-rate') || '20');
        var tvaAmount = ht * tvaRate / 100;
        var invoiceData = {
            type: val('modal-type') || 'invoice',
            contact_name: val('modal-client') || val('scan-vendor') || '',
            issue_date: val('modal-date') || val('scan-date') || new Date().toISOString().split('T')[0],
            due_date: val('modal-due') || val('scan-due') || '',
            subtotal: ht,
            tva_rate: tvaRate,
            tax: tvaAmount,
            total: ht + tvaAmount,
            description: val('modal-desc') || '',
            invoice_number: val('scan-number') || ''
        };
        var invId = val('modal-entity-id');
        var invoiceApi = invId ? AccountingApi.updateInvoice(invId, invoiceData) : AccountingApi.createInvoice(invoiceData);
        invoiceApi.then(function() {
            showToast(invId ? 'Facture modifiee' : 'Facture creee', 'success');
            closeModal();
            loadInvoices().then(function() {
                if (AccState.get('currentTab') === 'invoices') renderTabContent(TABS[1]);
            });
        }).catch(function(err) { showToast('Erreur: ' + (err.message || 'Echec'), 'error'); });
    }

    // =====================================================
    // FILTRES ET RECHERCHE
    // =====================================================

    function handleFilterChange(el) {
        var filterKey = el.getAttribute('data-filter');
        var parts = filterKey.split('-');
        var section = parts[0];
        var field = parts.slice(1).join('-');
        var fieldMap = { status: 'status', type: 'type', reconciled: 'reconciled' };
        var mappedField = fieldMap[field] || field;

        AccState.setFilter(section, mappedField, el.value);

        var currentTab = AccState.get('currentTab');
        var tab = TABS.find(function(t) { return t.id === currentTab; });
        if (tab && tab.load) {
            tab.load().then(function() { renderTabContent(tab); });
        }
    }

    function handleSearchInput(el) {
        var section = el.getAttribute('data-search');
        AccState.setFilter(section, 'search', el.value);

        var currentTab = AccState.get('currentTab');
        var tab = TABS.find(function(t) { return t.id === currentTab; });
        if (tab && tab.load) {
            tab.load().then(function() { renderTabContent(tab); });
        }
    }

    function changePage(delta) {
        var currentTab = AccState.get('currentTab');
        var stateKey = currentTab === 'invoices' ? 'invoices' : (currentTab === 'expenses' ? 'expenses' : (currentTab === 'bank' ? 'bankTransactions' : 'contacts'));
        var data = AccState.get(stateKey);
        if (!data || !data.pagination) return;

        var current = data.pagination.page || data.pagination.current_page || 1;
        var total = data.pagination.total_pages || data.pagination.totalPages || 1;
        var newPage = current + delta;
        if (newPage < 1 || newPage > total) return;

        AccState.setFilter(currentTab === 'bankTransactions' ? 'bank' : currentTab, 'page', newPage);

        var tab = TABS.find(function(t) { return t.id === currentTab; });
        if (tab && tab.load) {
            tab.load().then(function() { renderTabContent(tab); });
        }
    }

    // =====================================================
    // COMPOSANTS UTILITAIRES
    // =====================================================

    function renderBadge(status) {
        var labels = {
            draft: 'Brouillon', pending: 'En attente', sent: 'Envoyee', paid: 'Payee',
            overdue: 'En retard', cancelled: 'Annulee', approved: 'Approuvee',
            rejected: 'Rejetee', submitted: 'Soumise', reimbursed: 'Remboursee'
        };
        var label = labels[status] || status || '-';
        var cls = 'acc-badge-' + (status || 'draft');
        return '<span class="acc-badge ' + cls + '">' + label + '</span>';
    }

    function renderAlertCard(alert) {
        var severity = alert.severity || 'info';
        var isRead = alert.read || alert.is_read;
        var html = '<div class="acc-alert-card' + (isRead ? ' read' : '') + '">';
        html += '<div class="acc-alert-icon ' + severity + '">' + ICONS.alert + '</div>';
        html += '<div class="acc-alert-body">';
        html += '<div class="acc-alert-title">' + esc(alert.title || 'Alerte') + '</div>';
        html += '<div class="acc-alert-message">' + esc(alert.message || '') + '</div>';
        html += '<div class="acc-alert-time">' + formatDate(alert.created_at) + '</div>';
        html += '</div>';
        html += '<div class="acc-alert-actions">';
        if (!isRead) {
            html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="mark-alert-read" data-id="' + alert.id + '" title="Marquer comme lu">' + ICONS.check + '</button>';
        }
        html += '<button class="acc-btn acc-btn-sm acc-btn-icon" data-action="dismiss-alert" data-id="' + alert.id + '" title="Ignorer">' + ICONS.close + '</button>';
        html += '</div></div>';
        return html;
    }

    function renderPagination(pagination) {
        if (!pagination) return '';
        var current = pagination.page || pagination.current_page || 1;
        var total = pagination.total_pages || pagination.totalPages || 1;
        if (total <= 1) return '';

        var html = '<div class="acc-pagination">';
        html += '<button class="acc-pagination-btn" data-action="prev-page"' + (current <= 1 ? ' disabled' : '') + '>Precedent</button>';
        html += '<span class="acc-pagination-info">Page ' + current + ' sur ' + total + '</span>';
        html += '<button class="acc-pagination-btn" data-action="next-page"' + (current >= total ? ' disabled' : '') + '>Suivant</button>';
        html += '</div>';
        return html;
    }

    // =====================================================
    // UTILITAIRES
    // =====================================================

    function esc(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return dateFmt.format(d);
        } catch (e) {
            return dateStr;
        }
    }

    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    }

    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function showToast(message, type) {
        // Utiliser le systeme de toast de l'app s'il existe
        if (typeof Toast !== 'undefined' && Toast.show) {
            Toast.show(message, type);
            return;
        }
        if (typeof AppToast !== 'undefined' && AppToast.show) {
            AppToast.show(message, type);
            return;
        }
        // Fallback: toast simple
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;color:#fff;font-size:0.9rem;z-index:100000;animation:acc-fadeIn 0.3s ease;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        toast.style.background = type === 'error' ? '#e74c3c' : (type === 'success' ? '#00b894' : '#0984e3');
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // =====================================================
    // INTERFACE PUBLIQUE
    // =====================================================

    return {
        init: init,
        refresh: refresh,
        closeModal: closeModal
    };
})();
