/**
 * Accounting View Module
 * ProductiveApp v4.0 - Vue Comptabilite
 */

const AccountingView = (function() {
    'use strict';

    let state = { dashboard: null, invoices: [], categories: [], filters: {} };

    const icons = {
        plus: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
    };

    function formatMoney(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    }

    async function loadData() {
        try {
            const [dashboard, invoicesRes, categories] = await Promise.all([
                AccountingApi.getDashboard(),
                AccountingApi.getInvoices({ limit: 20 }),
                AccountingApi.getCategories()
            ]);
            state.dashboard = dashboard;
            state.invoices = invoicesRes.data || invoicesRes || [];
            state.categories = categories;
        } catch (e) {
            console.error('AccountingView: Error loading data', e);
            state.dashboard = { total_income: 0, total_expense: 0, balance: 0, invoice_count: 0 };
        }
    }

    function getCategoryName(categoryId) {
        const cat = state.categories.find(c => c.id === categoryId);
        return cat ? cat.name : '-';
    }

    function getCategoryColor(categoryId) {
        const cat = state.categories.find(c => c.id === categoryId);
        return cat ? cat.color : '#6b7280';
    }

    function render() {
        const container = document.getElementById('view-accounting');
        if (!container) return;

        const d = state.dashboard || {};
        const invoices = Array.isArray(state.invoices) ? state.invoices : [];

        container.innerHTML = `
            <div class="accounting-view">
                <header class="accounting-header">
                    <h1>Comptabilite</h1>
                    <div class="accounting-actions">
                        <button class="btn-icon" onclick="AccountingView.refresh()" title="Rafraichir">${icons.refresh}</button>
                        <button class="btn-primary" onclick="AccountingView.showCreateModal()">${icons.plus} Nouvelle facture</button>
                    </div>
                </header>

                <div class="accounting-stats">
                    <div class="stat-card income"><span class="stat-label">Revenus</span><span class="stat-value">${formatMoney(d.total_income)}</span></div>
                    <div class="stat-card expense"><span class="stat-label">Depenses</span><span class="stat-value">${formatMoney(d.total_expense)}</span></div>
                    <div class="stat-card balance ${d.balance >= 0 ? 'positive' : 'negative'}"><span class="stat-label">Balance</span><span class="stat-value">${formatMoney(d.balance)}</span></div>
                    <div class="stat-card count"><span class="stat-label">Factures</span><span class="stat-value">${d.invoice_count || 0}</span></div>
                </div>

                <div class="accounting-filters">
                    <select id="filter-type" onchange="AccountingView.applyFilters()">
                        <option value="">Tous types</option>
                        <option value="income">Revenus</option>
                        <option value="expense">Depenses</option>
                    </select>
                    <select id="filter-status" onchange="AccountingView.applyFilters()">
                        <option value="">Tous statuts</option>
                        <option value="draft">Brouillon</option>
                        <option value="validated">Validee</option>
                        <option value="paid">Payee</option>
                    </select>
                </div>

                <div class="invoices-list">
                    <table class="invoices-table">
                        <thead><tr><th>Date</th><th>Fournisseur</th><th>Categorie</th><th>Type</th><th>Montant TTC</th><th>Statut</th></tr></thead>
                        <tbody>
                            ${invoices.length === 0 ? '<tr><td colspan="6" class="empty">Aucune facture</td></tr>' : invoices.map(inv => `
                                <tr data-id="${inv.id}">
                                    <td>${formatDate(inv.date_facture)}</td>
                                    <td>${inv.fournisseur || '-'}</td>
                                    <td><span class="cat-badge" style="background:${getCategoryColor(inv.category_id)}">${getCategoryName(inv.category_id)}</span></td>
                                    <td><span class="type-badge ${inv.type}">${inv.type === 'income' ? 'Revenu' : 'Depense'}</span></td>
                                    <td class="amount ${inv.type}">${formatMoney(inv.montant_ttc)}</td>
                                    <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div id="accounting-modal" class="modal hidden"></div>
        `;
        injectStyles();
    }

    function showCreateModal() {
        const modal = document.getElementById('accounting-modal');
        if (!modal) return;

        const catOptions = state.categories.map(c =>
            `<option value="${c.id}" style="color:${c.color}">${c.name} (${c.type})</option>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <h2>Nouvelle facture</h2>
                <form id="invoice-form">
                    <label>Type<select name="type" required><option value="expense">Depense</option><option value="income">Revenu</option></select></label>
                    <label>Fournisseur<input type="text" name="fournisseur" required></label>
                    <label>Categorie<select name="category_id">${catOptions}</select></label>
                    <label>Montant HT<input type="number" name="montant_ht" step="0.01" required></label>
                    <label>TVA (%)<input type="number" name="tva_rate" value="20" step="0.1"></label>
                    <label>Date<input type="date" name="date_facture" required></label>
                    <label>Reference<input type="text" name="reference"></label>
                    <div class="modal-actions">
                        <button type="button" onclick="AccountingView.closeModal()">Annuler</button>
                        <button type="submit" class="btn-primary">Creer</button>
                    </div>
                </form>
            </div>
        `;
        modal.classList.remove('hidden');

        document.getElementById('invoice-form').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const ht = parseFloat(fd.get('montant_ht')) || 0;
            const tva = parseFloat(fd.get('tva_rate')) || 20;
            const data = {
                type: fd.get('type'),
                fournisseur: fd.get('fournisseur'),
                category_id: fd.get('category_id') || null,
                montant_ht: ht,
                tva_rate: tva,
                montant_tva: ht * tva / 100,
                montant_ttc: ht * (1 + tva / 100),
                date_facture: fd.get('date_facture'),
                reference: fd.get('reference') || null
            };
            try {
                await AccountingApi.createInvoice(data);
                closeModal();
                refresh();
            } catch (err) { alert('Erreur: ' + err.message); }
        };
    }

    function closeModal() {
        const modal = document.getElementById('accounting-modal');
        if (modal) modal.classList.add('hidden');
    }

    async function applyFilters() {
        const type = document.getElementById('filter-type')?.value;
        const status = document.getElementById('filter-status')?.value;
        state.filters = { type, status };
        const res = await AccountingApi.getInvoices({ ...state.filters, limit: 50 });
        state.invoices = res.data || res || [];
        render();
    }

    async function refresh() {
        await loadData();
        render();
    }

    function init() {
        console.log('AccountingView: Initializing...');
        refresh();
    }

    function injectStyles() {
        if (document.getElementById('accounting-styles')) return;
        const style = document.createElement('style');
        style.id = 'accounting-styles';
        style.textContent = `
            .accounting-view { padding: 24px; max-width: 1200px; margin: 0 auto; }
            .accounting-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .accounting-header h1 { font-size: 24px; font-weight: 600; color: var(--text-primary, #fff); }
            .accounting-actions { display: flex; gap: 12px; }
            .accounting-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .stat-card { background: var(--card-bg, #1e1e2e); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; }
            .stat-label { font-size: 12px; color: var(--text-secondary, #888); margin-bottom: 8px; }
            .stat-value { font-size: 24px; font-weight: 700; }
            .stat-card.income .stat-value { color: #22c55e; }
            .stat-card.expense .stat-value { color: #ef4444; }
            .stat-card.balance.positive .stat-value { color: #22c55e; }
            .stat-card.balance.negative .stat-value { color: #ef4444; }
            .accounting-filters { display: flex; gap: 12px; margin-bottom: 16px; }
            .accounting-filters select { padding: 8px 12px; border-radius: 8px; background: var(--input-bg, #2a2a3e); border: 1px solid var(--border, #3a3a4e); color: var(--text-primary, #fff); }
            .invoices-table { width: 100%; border-collapse: collapse; background: var(--card-bg, #1e1e2e); border-radius: 12px; overflow: hidden; }
            .invoices-table th, .invoices-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border, #2a2a3e); }
            .invoices-table th { font-size: 12px; color: var(--text-secondary, #888); font-weight: 500; }
            .invoices-table td.empty { text-align: center; color: var(--text-secondary, #888); padding: 40px; }
            .cat-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #fff; }
            .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .type-badge.income { background: rgba(34,197,94,0.2); color: #22c55e; }
            .type-badge.expense { background: rgba(239,68,68,0.2); color: #ef4444; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; background: var(--bg-tertiary, #3a3a4e); }
            .status-badge.validated { background: rgba(34,197,94,0.2); color: #22c55e; }
            .status-badge.paid { background: rgba(59,130,246,0.2); color: #3b82f6; }
            .amount.income { color: #22c55e; }
            .amount.expense { color: #ef4444; }
            .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .modal.hidden { display: none; }
            .modal-content { background: var(--card-bg, #1e1e2e); padding: 24px; border-radius: 16px; width: 400px; max-width: 90vw; }
            .modal-content h2 { margin-bottom: 20px; }
            .modal-content label { display: block; margin-bottom: 12px; font-size: 13px; color: var(--text-secondary, #888); }
            .modal-content input, .modal-content select { width: 100%; padding: 10px; margin-top: 4px; border-radius: 8px; background: var(--input-bg, #2a2a3e); border: 1px solid var(--border, #3a3a4e); color: var(--text-primary, #fff); }
            .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
            .btn-primary { background: #8b5cf6; color: #fff; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
            .btn-icon { background: transparent; border: 1px solid var(--border, #3a3a4e); padding: 8px; border-radius: 8px; cursor: pointer; color: var(--text-primary, #fff); }
            @media (max-width: 768px) { .accounting-stats { grid-template-columns: repeat(2, 1fr); } }
        `;
        document.head.appendChild(style);
    }

    return { init, refresh, render, showCreateModal, closeModal, applyFilters };
})();

if (typeof window !== 'undefined') {
    window.AccountingView = AccountingView;
}
