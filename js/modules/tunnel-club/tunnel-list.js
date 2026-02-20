/**
 * ================================================
 * TUNNEL LIST v1.0
 * Dashboard principal + liste des tunnels
 * ================================================
 */

const TunnelList = (function() {
    'use strict';

    let container = null;
    let currentFilter = 'all';

    // ──────────────────────────────────────────
    // RENDU PRINCIPAL
    // ──────────────────────────────────────────

    async function render(el) {
        container = el;
        container.innerHTML = '<div class="tc-wrapper"><div class="tc-skeleton" style="height:200px;margin-bottom:24px;"></div><div class="tc-skeleton" style="height:400px;"></div></div>';

        try {
            const [stats, tunnels] = await Promise.all([
                TunnelApi.getGlobalStats(),
                TunnelApi.getAll()
            ]);

            container.innerHTML = `
                <div class="tc-wrapper">
                    ${_renderHeader()}
                    ${_renderStats(stats)}
                    ${_renderTunnelList(tunnels)}
                </div>
            `;

            _attachEvents();
        } catch (err) {
            container.innerHTML = `<div class="tc-wrapper"><div class="tc-empty-state"><div class="tc-empty-state-icon">⚠️</div><h3>Erreur de chargement</h3><p>${err.message}</p></div></div>`;
        }
    }

    function _renderHeader() {
        return `
            <div class="tc-header">
                <div class="tc-header-left">
                    <h1>
                        <span class="tc-logo">⚡</span>
                        Tunnel Club
                    </h1>
                    <p>Créez des tunnels de vente haute conversion avec l'IA</p>
                </div>
                <div class="tc-header-actions">
                    <button class="tc-btn tc-btn-secondary tc-btn-sm" id="tc-btn-stats">
                        📊 Statistiques
                    </button>
                    <button class="tc-btn tc-btn-primary" id="tc-btn-create-main">
                        ✨ Créer un tunnel
                    </button>
                </div>
            </div>
        `;
    }

    function _renderStats(stats) {
        const fmtNum = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
        const fmtMoney = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k€' : n + '€';

        return `
            <div class="tc-stats-grid">
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">⚡</div>
                    <div class="tc-stat-value">${stats.tunnels}</div>
                    <div class="tc-stat-label">Tunnels créés</div>
                    <div class="tc-stat-change positive">↑ ${stats.published} publiés</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">👁</div>
                    <div class="tc-stat-value">${fmtNum(stats.visits)}</div>
                    <div class="tc-stat-label">Visites totales</div>
                    <div class="tc-stat-change positive">↑ taux conv. ${stats.conversionRate}%</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">📧</div>
                    <div class="tc-stat-value">${fmtNum(stats.leads)}</div>
                    <div class="tc-stat-label">Leads capturés</div>
                    <div class="tc-stat-change positive">↑ Ce mois</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">💰</div>
                    <div class="tc-stat-value">${fmtMoney(stats.revenue)}</div>
                    <div class="tc-stat-label">Revenus générés</div>
                    <div class="tc-stat-change positive">↑ ${stats.sales} ventes</div>
                </div>
            </div>
        `;
    }

    function _renderTunnelList(tunnels) {
        return `
            <div class="tc-section-header">
                <h2 class="tc-section-title">Mes tunnels</h2>
                <div class="tc-section-actions">
                    <input type="text" class="tc-input" id="tc-search" placeholder="🔍 Rechercher..." style="width:200px;padding:8px 12px;">
                </div>
            </div>

            <div class="tc-filters">
                <button class="tc-filter-btn active" data-filter="all">Tous (${tunnels.length})</button>
                <button class="tc-filter-btn" data-filter="published">Publiés (${tunnels.filter(t=>t.status==='published').length})</button>
                <button class="tc-filter-btn" data-filter="draft">Brouillons (${tunnels.filter(t=>t.status==='draft').length})</button>
                <button class="tc-filter-btn" data-filter="paused">En pause (${tunnels.filter(t=>t.status==='paused').length})</button>
            </div>

            <div class="tc-tunnels-grid" id="tc-tunnels-grid">
                ${_renderCreateCard()}
                ${tunnels.map(t => _renderTunnelCard(t)).join('')}
            </div>
        `;
    }

    function _renderCreateCard() {
        return `
            <div class="tc-tunnel-card-create" id="tc-create-card">
                <div class="tc-tunnel-card-create-icon">✨</div>
                <strong>Créer un nouveau tunnel</strong>
                <span>L'IA génère tout pour vous en quelques minutes</span>
            </div>
        `;
    }

    function _renderTunnelCard(tunnel) {
        const statusLabels = { draft: 'Brouillon', published: 'Publié', paused: 'En pause' };
        const fmtMoney = n => n ? n.toLocaleString('fr-FR') + '€' : '0€';
        const pageCount = (tunnel.pages || []).length;

        return `
            <div class="tc-tunnel-card" data-id="${tunnel.id}">
                <div class="tc-tunnel-preview" style="background: linear-gradient(135deg, ${tunnel.color || '#6366f1'}, ${_darken(tunnel.color || '#6366f1')});">
                    <span class="tc-tunnel-preview-icon">${tunnel.icon || '🚀'}</span>
                    <div class="tc-tunnel-preview-pages">
                        ${(tunnel.pages || []).map((p, i) => `<div class="tc-page-dot${i === 0 ? ' active' : ''}"></div>`).join('')}
                    </div>
                    <span class="tc-tunnel-status-badge ${tunnel.status}">${statusLabels[tunnel.status] || tunnel.status}</span>
                </div>
                <div class="tc-tunnel-body">
                    <h3 class="tc-tunnel-name">${_esc(tunnel.name)}</h3>
                    <p class="tc-tunnel-product">${_esc(tunnel.product || '')} · ${pageCount} pages</p>
                    <div class="tc-tunnel-metrics">
                        <div class="tc-metric">
                            <span class="tc-metric-value">${tunnel.stats?.visits || 0}</span>
                            <span class="tc-metric-label">Visites</span>
                        </div>
                        <div class="tc-metric">
                            <span class="tc-metric-value">${tunnel.stats?.leads || 0}</span>
                            <span class="tc-metric-label">Leads</span>
                        </div>
                        <div class="tc-metric">
                            <span class="tc-metric-value">${fmtMoney(tunnel.stats?.revenue || 0)}</span>
                            <span class="tc-metric-label">Revenus</span>
                        </div>
                    </div>
                    <div class="tc-tunnel-actions">
                        <button class="tc-btn tc-btn-primary tc-btn-sm" data-action="edit" data-id="${tunnel.id}">
                            ✏️ Éditer
                        </button>
                        ${tunnel.status === 'published'
                            ? `<button class="tc-btn tc-btn-ghost tc-btn-sm" data-action="pause" data-id="${tunnel.id}">⏸ Pause</button>`
                            : `<button class="tc-btn tc-btn-secondary tc-btn-sm" data-action="publish" data-id="${tunnel.id}">🚀 Publier</button>`
                        }
                        <button class="tc-btn tc-btn-ghost tc-btn-sm tc-btn-icon" data-action="stats" data-id="${tunnel.id}" title="Statistiques">📊</button>
                        <button class="tc-btn tc-btn-ghost tc-btn-sm tc-btn-icon" data-action="duplicate" data-id="${tunnel.id}" title="Dupliquer">📋</button>
                        <button class="tc-btn tc-btn-danger tc-btn-sm tc-btn-icon" data-action="delete" data-id="${tunnel.id}" title="Supprimer">🗑</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // EVENTS
    // ──────────────────────────────────────────

    function _attachEvents() {
        // Bouton créer (header)
        document.getElementById('tc-btn-create-main')?.addEventListener('click', () => {
            if (typeof TunnelClub !== 'undefined') TunnelClub.openGenerator();
        });

        // Carte créer
        document.getElementById('tc-create-card')?.addEventListener('click', () => {
            if (typeof TunnelClub !== 'undefined') TunnelClub.openGenerator();
        });

        // Bouton stats global → Dashboard analytics
        document.getElementById('tc-btn-stats')?.addEventListener('click', () => {
            if (typeof TunnelAnalytics !== 'undefined') {
                TunnelAnalytics.open();
            } else if (typeof TunnelClub !== 'undefined') {
                TunnelClub.showStats();
            }
        });

        // Filtres
        document.querySelectorAll('.tc-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tc-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                _applyFilter();
            });
        });

        // Recherche
        document.getElementById('tc-search')?.addEventListener('input', (e) => {
            _applySearch(e.target.value);
        });

        // Actions sur les tunnels
        document.getElementById('tc-tunnels-grid')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;
            await _handleAction(action, id);
        });
    }

    async function _handleAction(action, id) {
        switch (action) {
            case 'edit':
                if (typeof TunnelEditor !== 'undefined') TunnelEditor.open(id);
                break;

            case 'publish':
                btn_disable(action, id);
                await TunnelApi.publish(id);
                if (typeof Toast !== 'undefined') Toast.success('Tunnel publié avec succès !');
                refresh();
                break;

            case 'pause':
                await TunnelApi.pause(id);
                if (typeof Toast !== 'undefined') Toast.info('Tunnel mis en pause');
                refresh();
                break;

            case 'duplicate':
                await TunnelApi.duplicate(id);
                if (typeof Toast !== 'undefined') Toast.success('Tunnel dupliqué !');
                refresh();
                break;

            case 'stats':
                if (typeof TunnelStats !== 'undefined') TunnelStats.open(id);
                break;

            case 'delete':
                if (typeof ConfirmModal !== 'undefined') {
                    const ok = await ConfirmModal.confirmDelete('ce tunnel');
                    if (!ok) return;
                }
                await TunnelApi.remove(id);
                if (typeof Toast !== 'undefined') Toast.success('Tunnel supprimé');
                refresh();
                break;
        }
    }

    function btn_disable(action, id) {
        // Feedback visuel
    }

    function _applyFilter() {
        const cards = document.querySelectorAll('.tc-tunnel-card[data-id]');
        cards.forEach(card => {
            const id = card.dataset.id;
            const status = card.querySelector('.tc-tunnel-status-badge')?.className.replace('tc-tunnel-status-badge ', '') || '';
            const visible = currentFilter === 'all' || status === currentFilter;
            card.style.display = visible ? '' : 'none';
        });
    }

    function _applySearch(query) {
        const q = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.tc-tunnel-card[data-id]');
        cards.forEach(card => {
            const name = card.querySelector('.tc-tunnel-name')?.textContent.toLowerCase() || '';
            const product = card.querySelector('.tc-tunnel-product')?.textContent.toLowerCase() || '';
            card.style.display = (!q || name.includes(q) || product.includes(q)) ? '' : 'none';
        });
    }

    // ──────────────────────────────────────────
    // UTILITAIRES
    // ──────────────────────────────────────────

    function _esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function _darken(hex) {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
        } catch (e) { return '#4f46e5'; }
    }

    // ──────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────

    async function refresh() {
        if (container) await render(container);
    }

    return { render, refresh };

})();

window.TunnelList = TunnelList;
