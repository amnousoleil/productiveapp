/**
 * ================================================
 * VISION PRO - Giri Vision v1.0
 * Module cash flow : forfaits séances + revenus
 * Gestion clients — Données en localStorage
 * ================================================
 */

const VisionPro = (function () {
    'use strict';

    const PACKAGES = [
        { id: 'starter', name: 'Starter', sessions: 1, price: 80, color: '#3b82f6' },
        { id: 'pack5', name: 'Pack 5', sessions: 5, price: 350, color: '#7c3aed' },
        { id: 'pack10', name: 'Pack 10', sessions: 10, price: 650, color: '#10b981' },
        { id: 'mensuel', name: 'Mensuel', sessions: 4, price: 280, color: '#f59e0b', badge: 'Populaire' },
        { id: 'intensif', name: 'Intensif', sessions: 20, price: 1200, color: '#ef4444' },
        { id: 'vip', name: 'VIP', sessions: 999, price: 499, color: '#eab308', badge: '∞ séances/mois' }
    ];

    function showPackages() {
        const existing = document.getElementById('vision-pro-overlay');
        if (existing) existing.remove();

        const stats = _getRevenueStats();
        const clients = _getClients();

        const overlay = document.createElement('div');
        overlay.className = 'vision-pro-overlay';
        overlay.id = 'vision-pro-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) closePackages(); };

        overlay.innerHTML = `
            <div class="vision-pro-modal">
                <div class="vision-pro-modal-header">
                    <h2 class="vision-pro-modal-title">💎 Forfaits & Revenus</h2>
                    <button class="vision-modal-close" onclick="VisionPro.closePackages()">✕</button>
                </div>

                <!-- Barre de revenu mensuel -->
                <div class="vision-revenue-bar" style="margin-bottom:20px">
                    <div class="vision-revenue-bar-header">
                        <span>💰 Revenus ce mois</span>
                        <span style="color:#10b981;font-weight:700">${stats.monthRevenue}€ / ${stats.target}€ objectif</span>
                    </div>
                    <div class="vision-revenue-progress">
                        <div class="vision-revenue-fill" style="width:${Math.min(100, stats.percent)}%"></div>
                    </div>
                </div>

                <!-- Grille forfaits -->
                <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);margin-bottom:12px">
                    Vos forfaits
                </p>
                <div class="vision-packages-grid">
                    ${PACKAGES.map(p => `
                        <div class="vision-pkg-card" onclick="VisionPro.selectPackage('${p.id}')">
                            ${p.badge ? `<div style="font-size:0.65rem;font-weight:700;color:${p.color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${p.badge}</div>` : ''}
                            <div class="vision-pkg-name" style="color:${p.color}">${p.name}</div>
                            <div class="vision-pkg-sessions">${p.sessions > 100 ? '∞' : p.sessions}</div>
                            <div class="vision-pkg-label">séance${p.sessions > 1 ? 's' : ''}</div>
                            <div class="vision-pkg-price" style="color:${p.color}">${p.price}€</div>
                            <div class="vision-pkg-per">${p.sessions > 1 && p.sessions < 100 ? `${Math.round(p.price/p.sessions)}€/séance` : 'par mois'}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Ajouter vente -->
                <div style="margin-bottom:20px;padding:16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:14px">
                    <p style="font-size:0.82rem;font-weight:700;color:#10b981;margin:0 0 10px">
                        ✅ Enregistrer une vente
                    </p>
                    <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end">
                        <div class="vision-form-group">
                            <label>Client</label>
                            <input type="text" id="gvp-client" class="vision-input" placeholder="Nom du client" list="gvp-clients-list">
                            <datalist id="gvp-clients-list">
                                ${clients.map(c => `<option value="${_esc(c.name)}">`).join('')}
                            </datalist>
                        </div>
                        <div class="vision-form-group">
                            <label>Forfait</label>
                            <select id="gvp-package" class="vision-input">
                                ${PACKAGES.map(p => `<option value="${p.id}">${p.name} — ${p.price}€</option>`).join('')}
                                <option value="custom">Montant libre</option>
                            </select>
                        </div>
                        <button class="vision-btn-primary" onclick="VisionPro.recordSale()" style="height:44px;padding:0 16px">
                            + Vente
                        </button>
                    </div>
                    <div id="gvp-custom-amount" style="display:none;margin-top:10px">
                        <input type="number" id="gvp-amount" class="vision-input" placeholder="Montant en €" min="0">
                    </div>
                </div>

                <!-- Historique ventes -->
                <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);margin-bottom:10px">
                    Dernières ventes
                </p>
                <div id="gvp-sales-list">
                    ${_renderSalesList()}
                </div>

                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
                    <button class="vision-btn-secondary" onclick="VisionPro.closePackages()">Fermer</button>
                    <button class="vision-btn-primary" onclick="VisionPro.exportRevenue()">
                        📊 Exporter CSV
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Gérer sélection forfait custom
        document.getElementById('gvp-package')?.addEventListener('change', (e) => {
            const custom = document.getElementById('gvp-custom-amount');
            if (custom) custom.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    function selectPackage(pkgId) {
        const sel = document.getElementById('gvp-package');
        if (sel) sel.value = pkgId;
    }

    function recordSale() {
        const clientEl = document.getElementById('gvp-client');
        const pkgEl = document.getElementById('gvp-package');
        const amountEl = document.getElementById('gvp-amount');

        const client = clientEl?.value.trim();
        if (!client) { typeof Toast !== 'undefined' && Toast.warning('Indiquez le nom du client'); return; }

        const pkgId = pkgEl?.value;
        let amount, pkgName;

        if (pkgId === 'custom') {
            amount = parseFloat(amountEl?.value);
            if (!amount || amount <= 0) { typeof Toast !== 'undefined' && Toast.warning('Indiquez un montant'); return; }
            pkgName = 'Montant libre';
        } else {
            const pkg = PACKAGES.find(p => p.id === pkgId);
            if (!pkg) return;
            amount = pkg.price;
            pkgName = pkg.name;
        }

        // Enregistrer la vente
        const sales = JSON.parse(localStorage.getItem('gv_sales') || '[]');
        sales.unshift({ client, pkgName, amount, date: new Date().toISOString() });
        localStorage.setItem('gv_sales', JSON.stringify(sales.slice(0, 200)));

        // Mettre à jour stats revenus
        const stats = JSON.parse(localStorage.getItem('gv_stats') || '{}');
        stats.revenue = (stats.revenue || 0) + amount;
        localStorage.setItem('gv_stats', JSON.stringify(stats));

        // Ajouter client si nouveau
        _addClient(client);

        // Mettre à jour UI
        const listEl = document.getElementById('gvp-sales-list');
        if (listEl) listEl.innerHTML = _renderSalesList();

        // Reset form
        if (clientEl) clientEl.value = '';
        if (amountEl) amountEl.value = '';

        typeof Toast !== 'undefined' && Toast.success(`Vente enregistrée : ${amount}€ — ${client}`);

        // Mettre à jour les stats dans le dashboard
        const revEl = document.getElementById('vstat-revenue');
        if (revEl) revEl.textContent = stats.revenue + '€';
    }

    function _renderSalesList() {
        const sales = JSON.parse(localStorage.getItem('gv_sales') || '[]');
        if (sales.length === 0) {
            return `<p style="font-size:0.8rem;color:rgba(255,255,255,0.3);text-align:center;padding:12px">Aucune vente enregistrée</p>`;
        }
        return sales.slice(0, 8).map(s => {
            const d = new Date(s.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' });
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);margin-bottom:6px">
                <div>
                    <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary,#fff)">${_esc(s.client)}</div>
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.35)">${_esc(s.pkgName)} · ${d}</div>
                </div>
                <div style="font-size:1rem;font-weight:800;color:#10b981">+${s.amount}€</div>
            </div>`;
        }).join('');
    }

    function _getRevenueStats() {
        const stats = JSON.parse(localStorage.getItem('gv_stats') || '{}');
        const sales = JSON.parse(localStorage.getItem('gv_sales') || '[]');
        const now = new Date();
        const monthRevenue = sales.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((sum, s) => sum + s.amount, 0);
        const target = stats.revenueTarget || 2000;
        return { monthRevenue, target, percent: Math.round(monthRevenue / target * 100) };
    }

    function _getClients() {
        return JSON.parse(localStorage.getItem('gv_clients') || '[]');
    }

    function _addClient(name) {
        const clients = _getClients();
        if (!clients.find(c => c.name === name)) {
            clients.unshift({ name, addedAt: new Date().toISOString() });
            localStorage.setItem('gv_clients', JSON.stringify(clients.slice(0, 500)));
            // Mettre à jour le compteur
            const s = JSON.parse(localStorage.getItem('gv_stats') || '{}');
            s.clients = clients.length;
            localStorage.setItem('gv_stats', JSON.stringify(s));
        }
    }

    function exportRevenue() {
        const sales = JSON.parse(localStorage.getItem('gv_sales') || '[]');
        if (sales.length === 0) { typeof Toast !== 'undefined' && Toast.warning('Aucune vente à exporter'); return; }

        const rows = [['Date', 'Client', 'Forfait', 'Montant (€)']];
        sales.forEach(s => {
            rows.push([new Date(s.date).toLocaleDateString('fr-FR'), s.client, s.pkgName, s.amount]);
        });

        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `giri-vision-revenus-${new Date().toISOString().slice(0,7)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        typeof Toast !== 'undefined' && Toast.success('Export CSV téléchargé');
    }

    function closePackages() {
        document.getElementById('vision-pro-overlay')?.remove();
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { showPackages, closePackages, selectPackage, recordSale, exportRevenue };
})();

if (typeof window !== 'undefined') window.VisionPro = VisionPro;
