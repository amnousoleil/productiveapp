/**
 * ================================================
 * TUNNEL STATS v1.0
 * Statistiques par tunnel + configuration paiements
 * ================================================
 */

const TunnelStats = (function() {
    'use strict';

    let overlay = null;
    let currentTunnelId = null;
    let currentView = 'stats'; // 'stats' | 'leads' | 'payments' | 'formation' | 'tracking'
    let _trackingData = null; // cache des pixels du tenant
    let _formationsCache = null;

    // ──────────────────────────────────────────
    // OUVERTURE
    // ──────────────────────────────────────────

    async function open(tunnelId) {
        currentTunnelId = tunnelId;
        currentView = 'stats';
        _createOverlay();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        await _render();
    }

    async function openPayments(tunnelId) {
        currentTunnelId = tunnelId;
        currentView = 'payments';
        _createOverlay();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        await _render();
    }

    function close() {
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function _createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tc-wizard-overlay';
            overlay.id = 'tc-stats-overlay';
            document.body.appendChild(overlay);
        }
    }

    // ──────────────────────────────────────────
    // RENDU PRINCIPAL
    // ──────────────────────────────────────────

    async function _render() {
        if (!overlay) return;

        const [tunnel, leads, paymentConfig] = await Promise.all([
            TunnelApi.getById(currentTunnelId),
            TunnelApi.getLeads(currentTunnelId),
            TunnelApi.getPaymentConfig(currentTunnelId)
        ]);

        if (!tunnel) {
            overlay.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Tunnel introuvable</div>';
            return;
        }

        // Charger les pixels de tracking (pour l'onglet Tracking)
        if (currentView === 'tracking' || !_trackingData) {
            try {
                const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : (localStorage.getItem('productive_token') || '');
                const resp = await fetch('/api/v1/tenants/my-tenant', { headers: { 'Authorization': `Bearer ${token}` } });
                if (resp.ok) {
                    const d = await resp.json();
                    _trackingData = d.hasTenant ? {
                        facebookPixelId:    d.tenant.facebook_pixel_id    || '',
                        googleAnalyticsId:  d.tenant.google_analytics_id  || '',
                        googleTagManagerId: d.tenant.google_tag_manager_id || '',
                        tiktokPixelId:      d.tenant.tiktok_pixel_id      || '',
                    } : {};
                }
            } catch (e) { _trackingData = {}; }
        }

        // Charger les formations disponibles (pour l'onglet Formation)
        let formationData = { formations: [], linkedFormationId: null };
        if (currentView === 'formation' || !_formationsCache) {
            try {
                const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : '';
                const wsId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : '';
                const resp = await fetch(
                    `/api/v1/tunnels/workspace/${wsId}/${currentTunnelId}/formations`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (resp.ok) {
                    _formationsCache = await resp.json();
                    formationData = _formationsCache;
                }
            } catch (e) { /* silencieux */ }
        } else {
            formationData = _formationsCache;
        }

        overlay.innerHTML = `
            <div class="tc-wizard" style="max-width:900px;">
                <div class="tc-wizard-header">
                    <h2 class="tc-wizard-title">📊 ${_esc(tunnel.name)}</h2>
                    <button class="tc-wizard-close" id="tc-stats-close">✕</button>
                </div>
                <div style="padding:0 28px;">
                    <div class="tc-filters" style="margin:16px 0 0;">
                        <button class="tc-filter-btn${currentView==='stats'?' active':''}" data-tab="stats">📊 Statistiques</button>
                        <button class="tc-filter-btn${currentView==='leads'?' active':''}" data-tab="leads">📧 Leads (${leads.length})</button>
                        <button class="tc-filter-btn${currentView==='payments'?' active':''}" data-tab="payments">💳 Paiements</button>
                        <button class="tc-filter-btn${currentView==='formation'?' active':''}${formationData.linkedFormationId?' tc-filter-linked':''}" data-tab="formation">
                            🎓 Formation${formationData.linkedFormationId?' ●':''}
                        </button>
                        <button class="tc-filter-btn${currentView==='tracking'?' active':''}" data-tab="tracking">📈 Tracking</button>
                    </div>
                </div>
                <div class="tc-wizard-body" id="tc-stats-body" style="padding:24px 28px;">
                    ${currentView === 'stats'     ? _renderStats(tunnel) : ''}
                    ${currentView === 'leads'     ? _renderLeads(leads, tunnel) : ''}
                    ${currentView === 'payments'  ? _renderPayments(paymentConfig, tunnel) : ''}
                    ${currentView === 'formation' ? _renderFormation(formationData, tunnel) : ''}
                    ${currentView === 'tracking'  ? _renderTracking(_trackingData) : ''}
                </div>
            </div>
        `;

        // Events
        document.getElementById('tc-stats-close')?.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        overlay.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentView = btn.dataset.tab;
                _render();
            });
        });

        _attachPaymentEvents(paymentConfig, tunnel);
        if (currentView === 'formation') _attachFormationEvents(formationData, tunnel);
        if (currentView === 'tracking') _attachTrackingEvents();
        _drawCharts(tunnel);
    }

    // ──────────────────────────────────────────
    // ONGLET STATS
    // ──────────────────────────────────────────

    function _renderStats(tunnel) {
        const s = tunnel.stats || {};
        const conv = s.visits > 0 ? ((s.leads / s.visits) * 100).toFixed(1) : 0;
        const closeRate = s.leads > 0 ? ((s.sales / s.leads) * 100).toFixed(1) : 0;
        const avgValue = s.sales > 0 ? (s.revenue / s.sales).toFixed(0) : 0;

        return `
            <!-- KPIs top -->
            <div class="tc-stats-grid" style="margin-bottom:24px;">
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">👁</div>
                    <div class="tc-stat-value">${(s.visits||0).toLocaleString('fr-FR')}</div>
                    <div class="tc-stat-label">Visites</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">📧</div>
                    <div class="tc-stat-value">${(s.leads||0).toLocaleString('fr-FR')}</div>
                    <div class="tc-stat-label">Leads</div>
                    <div class="tc-stat-change ${conv>10?'positive':''}">Conv. ${conv}%</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">🛒</div>
                    <div class="tc-stat-value">${(s.sales||0).toLocaleString('fr-FR')}</div>
                    <div class="tc-stat-label">Ventes</div>
                    <div class="tc-stat-change ${closeRate>5?'positive':''}">Taux ${closeRate}%</div>
                </div>
                <div class="tc-stat-card">
                    <div class="tc-stat-icon">💰</div>
                    <div class="tc-stat-value">${(s.revenue||0).toLocaleString('fr-FR')}€</div>
                    <div class="tc-stat-label">Revenus</div>
                    <div class="tc-stat-change positive">Panier moy. ${avgValue}€</div>
                </div>
            </div>

            <!-- Funnel de conversion -->
            <div class="tc-chart-container" style="margin-bottom:20px;">
                <div class="tc-chart-header">
                    <div class="tc-chart-title">Entonnoir de conversion</div>
                </div>
                <div class="tc-funnel-chart">
                    ${_renderFunnelBar('Visites', s.visits||0, s.visits||1, '#6366f1')}
                    ${_renderFunnelBar('Leads', s.leads||0, s.visits||1, '#8b5cf6')}
                    ${_renderFunnelBar('Ajouts panier', Math.round((s.leads||0)*0.4), s.visits||1, '#a855f7')}
                    ${_renderFunnelBar('Ventes', s.sales||0, s.visits||1, '#ec4899')}
                </div>
            </div>

            <!-- Graphique simulé -->
            <div class="tc-chart-container">
                <div class="tc-chart-header">
                    <div class="tc-chart-title">Évolution sur 7 jours</div>
                    <div class="tc-chart-legend">
                        <div class="tc-legend-item"><div class="tc-legend-dot" style="background:#6366f1;"></div>Visites</div>
                        <div class="tc-legend-item"><div class="tc-legend-dot" style="background:#10b981;"></div>Leads</div>
                    </div>
                </div>
                <canvas id="tc-chart-evolution" height="120"></canvas>
            </div>

            <!-- Informations tunnel -->
            <div style="margin-top:20px;background:var(--bg-tertiary);border-radius:12px;padding:16px;">
                <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px;">ℹ️ Informations tunnel</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                    <div><span style="color:var(--text-muted);">Statut :</span> <strong style="color:${tunnel.status==='published'?'#10b981':tunnel.status==='paused'?'#f59e0b':'#a0a0a0'}">${tunnel.status}</strong></div>
                    <div><span style="color:var(--text-muted);">Prix :</span> <strong>${tunnel.price||0}${tunnel.currency||'€'}</strong></div>
                    <div><span style="color:var(--text-muted);">Pages :</span> <strong>${(tunnel.pages||[]).length}</strong></div>
                    <div><span style="color:var(--text-muted);">URL :</span> <span style="font-family:monospace;font-size:12px;">/${tunnel.url||''}</span></div>
                    <div><span style="color:var(--text-muted);">Créé le :</span> <strong>${_formatDate(tunnel.createdAt)}</strong></div>
                    <div><span style="color:var(--text-muted);">Modifié :</span> <strong>${_formatDate(tunnel.updatedAt)}</strong></div>
                </div>
            </div>
        `;
    }

    function _renderFunnelBar(label, value, total, color) {
        const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
        return `
            <div class="tc-funnel-step">
                <div class="tc-funnel-step-label">${label}</div>
                <div class="tc-funnel-bar-container">
                    <div class="tc-funnel-bar" style="width:${Math.max(pct, 5)}%;background:${color};">
                        ${pct.toFixed(1)}%
                    </div>
                </div>
                <div class="tc-funnel-step-count">${value.toLocaleString('fr-FR')}</div>
            </div>
        `;
    }

    function _drawCharts(tunnel) {
        const canvas = document.getElementById('tc-chart-evolution');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.offsetWidth || 800;
        const H = 120;
        canvas.width = W;
        canvas.height = H;

        // Données simulées sur 7 jours
        const days = 7;
        const visits = Array.from({length: days}, (_, i) => Math.round((tunnel.stats?.visits||100) * (0.1 + Math.random() * 0.2)));
        const leads = visits.map(v => Math.round(v * (0.05 + Math.random() * 0.15)));

        const maxV = Math.max(...visits, 1);
        const padding = { left: 40, right: 20, top: 10, bottom: 30 };
        const w = W - padding.left - padding.right;
        const h = H - padding.top - padding.bottom;

        const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

        // Fond grille
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(W - padding.right, y);
            ctx.stroke();
        }

        function drawLine(data, color) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            data.forEach((v, i) => {
                const x = padding.left + (i / (days - 1)) * w;
                const y = padding.top + h - (v / maxV) * h;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Remplissage
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = padding.left + (i / (days - 1)) * w;
                const y = padding.top + h - (v / maxV) * h;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.lineTo(W - padding.right, padding.top + h);
            ctx.lineTo(padding.left, padding.top + h);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, color + '40');
            grad.addColorStop(1, color + '00');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        drawLine(visits, '#6366f1');
        drawLine(leads, '#10b981');

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
            const x = padding.left + (i / (days - 1)) * w;
            ctx.fillText(label, x, H - 8);
        });
    }

    // ──────────────────────────────────────────
    // ONGLET LEADS
    // ──────────────────────────────────────────

    function _renderLeads(leads, tunnel) {
        if (!leads.length) {
            return `
                <div class="tc-empty-state">
                    <div class="tc-empty-state-icon">📧</div>
                    <h3>Aucun lead pour l'instant</h3>
                    <p>Les leads apparaîtront ici quand des visiteurs s'inscriront via votre tunnel.</p>
                </div>
            `;
        }

        const statusColors = {
            nouveau: '#6366f1',
            qualifié: '#f59e0b',
            client: '#10b981'
        };

        return `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div style="font-size:15px;font-weight:700;color:var(--text);">${leads.length} leads capturés</div>
                <button class="tc-btn tc-btn-secondary tc-btn-sm" id="tc-export-leads">⬇️ Exporter CSV</button>
            </div>
            <div style="overflow-x:auto;">
                <table class="tc-leads-table">
                    <thead>
                        <tr>
                            <th>Prospect</th>
                            <th>Email</th>
                            <th>Source</th>
                            <th>Statut</th>
                            <th>Valeur</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leads.map(lead => `
                            <tr>
                                <td>
                                    <div class="tc-lead-info">
                                        <div class="tc-lead-avatar">${(lead.name||'?').charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div class="tc-lead-name">${_esc(lead.name||'Anonyme')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="color:var(--text-muted);font-size:13px;">${_esc(lead.email||'')}</td>
                                <td><span class="tc-tag">${_esc(lead.source||'Organique')}</span></td>
                                <td>
                                    <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;background:${statusColors[lead.status]||'#6366f1'}22;color:${statusColors[lead.status]||'#6366f1'};">
                                        ${lead.status||'nouveau'}
                                    </span>
                                </td>
                                <td style="font-weight:600;color:${lead.value>0?'#10b981':'var(--text-muted)'};">
                                    ${lead.value > 0 ? lead.value + '€' : '—'}
                                </td>
                                <td style="color:var(--text-muted);font-size:12px;">${_formatDate(lead.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // ONGLET PAIEMENTS
    // ──────────────────────────────────────────

    function _renderPayments(config, tunnel) {
        config = config || {};
        const stripe = config.stripe || {};
        const paypal = config.paypal || {};
        const wa = config.whatsapp || {};

        return `
            <div style="font-size:14px;color:var(--text-muted);margin-bottom:24px;">
                Connectez vos solutions de paiement pour recevoir des paiements dans votre tunnel.
            </div>

            <div class="tc-payments-grid">
                <!-- Stripe -->
                <div class="tc-payment-card">
                    <span class="tc-payment-logo">💳</span>
                    <div class="tc-payment-name">Stripe</div>
                    <div class="tc-payment-desc">Cartes bancaires, Apple Pay, Google Pay — international</div>
                    <div class="tc-payment-status ${stripe.connected?'connected':'disconnected'}">
                        ${stripe.connected ? '✅ Connecté' : '○ Non configuré'}
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Clé publique</label>
                        <input type="text" class="tc-input" id="tc-stripe-pk" placeholder="pk_live_..." value="${_esc(stripe.publicKey||'')}" style="font-family:monospace;font-size:12px;">
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Mode</label>
                        <select class="tc-select" id="tc-stripe-mode">
                            <option value="test" ${stripe.mode!=='live'?'selected':''}>Test (sandbox)</option>
                            <option value="live" ${stripe.mode==='live'?'selected':''}>Production (live)</option>
                        </select>
                    </div>
                    <button class="tc-btn tc-btn-primary tc-btn-sm" id="tc-save-stripe" style="width:100%;justify-content:center;">💾 Sauvegarder Stripe</button>
                </div>

                <!-- PayPal -->
                <div class="tc-payment-card">
                    <span class="tc-payment-logo">🅿️</span>
                    <div class="tc-payment-name">PayPal</div>
                    <div class="tc-payment-desc">Paiements PayPal — idéal pour l'international</div>
                    <div class="tc-payment-status ${paypal.connected?'connected':'disconnected'}">
                        ${paypal.connected ? '✅ Connecté' : '○ Non configuré'}
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Client ID PayPal</label>
                        <input type="text" class="tc-input" id="tc-paypal-id" placeholder="AaBbCcDd..." value="${_esc(paypal.clientId||'')}" style="font-family:monospace;font-size:12px;">
                    </div>
                    <button class="tc-btn tc-btn-primary tc-btn-sm" id="tc-save-paypal" style="width:100%;justify-content:center;">💾 Sauvegarder PayPal</button>
                </div>

                <!-- WhatsApp -->
                <div class="tc-payment-card">
                    <span class="tc-payment-logo">💬</span>
                    <div class="tc-payment-name">WhatsApp Business</div>
                    <div class="tc-payment-desc">Redirige vers WhatsApp pour valider manuellement</div>
                    <div class="tc-payment-status ${wa.connected?'connected':'disconnected'}">
                        ${wa.connected ? '✅ Connecté' : '○ Non configuré'}
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Numéro WhatsApp</label>
                        <input type="tel" class="tc-input" id="tc-wa-phone" placeholder="+33612345678" value="${_esc(wa.phone||'')}">
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Message pré-rempli</label>
                        <textarea class="tc-textarea" id="tc-wa-message" style="min-height:60px;">${_esc(wa.message||`Bonjour, je souhaite commander ${tunnel.product||'votre produit'}`)}</textarea>
                    </div>
                    <button class="tc-btn tc-btn-primary tc-btn-sm" id="tc-save-wa" style="width:100%;justify-content:center;">💾 Sauvegarder WhatsApp</button>
                </div>
            </div>

            <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:16px;margin-top:8px;">
                <div style="font-size:13px;font-weight:700;color:#f59e0b;margin-bottom:6px;">⚠️ Note importante</div>
                <div style="font-size:13px;color:var(--text-muted);">
                    Les clés API sont stockées localement sur votre navigateur. Pour une utilisation en production, configurez-les dans les paramètres backend du serveur pour plus de sécurité.
                </div>
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // ONGLET FORMATION
    // ──────────────────────────────────────────

    function _renderFormation(data, tunnel) {
        const formations = data.formations || [];
        const linkedId = data.linkedFormationId;

        const formationOptions = formations.length
            ? formations.map(f => `
                <div class="tc-formation-option${f.id === linkedId ? ' tc-formation-selected' : ''}"
                     data-fid="${_esc(f.id)}" style="
                    display:flex;align-items:center;gap:12px;padding:12px 16px;
                    border-radius:10px;border:2px solid ${f.id === linkedId ? 'var(--primary)' : 'rgba(var(--border-rgb,180,180,200),0.3)'};
                    cursor:pointer;margin-bottom:8px;transition:all 0.2s;background:${f.id === linkedId ? 'rgba(108,99,255,0.08)' : 'transparent'};
                ">
                    <span style="font-size:22px;">${f.status === 'published' ? '✅' : '📝'}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;font-size:14px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(f.title)}</div>
                        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                            ${f.students_count} étudiant${f.students_count !== 1 ? 's' : ''} · ${f.status === 'published' ? 'Publiée' : 'Brouillon'}
                        </div>
                    </div>
                    ${f.id === linkedId ? '<span style="color:var(--primary);font-weight:700;font-size:12px;">LIÉE</span>' : ''}
                </div>`).join('')
            : `<div style="text-align:center;padding:32px;color:var(--text-muted);background:rgba(var(--border-rgb,180,180,200),0.1);border-radius:12px;">
                <div style="font-size:36px;margin-bottom:12px;">🎓</div>
                <div style="font-size:14px;font-weight:600;margin-bottom:6px;">Aucune formation créée</div>
                <div style="font-size:13px;">Créez d'abord une formation dans Giri Academy.</div>
               </div>`;

        return `
            <div>
                <div style="margin-bottom:20px;">
                    <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px;">🔗 Lier une formation à ce tunnel</div>
                    <div style="font-size:13px;color:var(--text-muted);line-height:1.6;">
                        Quand un visiteur achète sur ce tunnel, il reçoit automatiquement un email avec l'accès à la formation liée.
                        ${linkedId ? '<br><span style="color:#10b981;font-weight:600;">✅ Une formation est actuellement liée.</span>' : ''}
                    </div>
                </div>

                <div id="tc-formation-list" style="margin-bottom:16px;">${formationOptions}</div>

                ${linkedId ? `
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                    <span style="font-size:20px;">✅</span>
                    <div style="flex:1;font-size:13px;color:var(--text);">
                        Accès accordé automatiquement après chaque achat confirmé.
                        <button id="tc-unlink-formation" style="margin-left:12px;background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;font-weight:600;text-decoration:underline;">Délier</button>
                    </div>
                </div>` : ''}

                <div style="border-top:1px solid rgba(var(--border-rgb,180,180,200),0.2);padding-top:16px;margin-top:8px;">
                    <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;">⚡ Confirmer une vente manuellement</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Pour les paiements WhatsApp ou virements, confirmez manuellement pour envoyer l'accès étudiant.</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                        <input type="email" id="tc-complete-email" class="tc-input" placeholder="Email de l'acheteur">
                        <input type="text" id="tc-complete-name" class="tc-input" placeholder="Nom (optionnel)">
                    </div>
                    <input type="text" id="tc-complete-saleid" class="tc-input" placeholder="ID de vente (optionnel)" style="margin-bottom:10px;">
                    <button id="tc-complete-sale-btn" class="tc-btn tc-btn-primary" style="width:100%;justify-content:center;">
                        🎉 Confirmer la vente et envoyer l'accès
                    </button>
                </div>
            </div>
        `;
    }

    function _attachFormationEvents(data, tunnel) {
        // Sélection d'une formation
        document.querySelectorAll('.tc-formation-option').forEach(el => {
            el.addEventListener('click', async () => {
                const fid = el.dataset.fid;
                const isAlreadyLinked = fid === data.linkedFormationId;
                if (isAlreadyLinked) return;

                el.style.opacity = '0.6';
                const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : '';
                const wsId  = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : '';

                const resp = await fetch(`/api/v1/tunnels/workspace/${wsId}/${currentTunnelId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ linkedFormationId: fid })
                });

                if (resp.ok) {
                    _formationsCache = null; // invalider le cache
                    if (typeof Toast !== 'undefined') Toast.success('Formation liée avec succès !');
                    await _render();
                } else {
                    el.style.opacity = '';
                    if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la liaison');
                }
            });
        });

        // Délier la formation
        document.getElementById('tc-unlink-formation')?.addEventListener('click', async () => {
            const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : '';
            const wsId  = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : '';

            const resp = await fetch(`/api/v1/tunnels/workspace/${wsId}/${currentTunnelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ linkedFormationId: null })
            });

            if (resp.ok) {
                _formationsCache = null;
                if (typeof Toast !== 'undefined') Toast.success('Formation déliée');
                await _render();
            }
        });

        // Confirmer vente manuelle
        document.getElementById('tc-complete-sale-btn')?.addEventListener('click', async () => {
            const email  = document.getElementById('tc-complete-email')?.value?.trim();
            const name   = document.getElementById('tc-complete-name')?.value?.trim();
            const saleId = document.getElementById('tc-complete-saleid')?.value?.trim();

            if (!email || !email.includes('@')) {
                if (typeof Toast !== 'undefined') Toast.error('Veuillez saisir un email valide');
                return;
            }

            const btn = document.getElementById('tc-complete-sale-btn');
            if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi en cours...'; }

            const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : '';
            const wsId  = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : '';

            const resp = await fetch(
                `/api/v1/tunnels/workspace/${wsId}/${currentTunnelId}/complete-sale`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ saleId: saleId || undefined, customerEmail: email, customerName: name || undefined })
                }
            );

            const result = await resp.json().catch(() => ({}));

            if (resp.ok) {
                const msg = result.formationAccess?.emailSent
                    ? `✅ Vente confirmée — Email d'accès envoyé à ${email}`
                    : `✅ Vente confirmée — Accès accordé à ${email}`;
                if (typeof Toast !== 'undefined') Toast.success(msg);
                document.getElementById('tc-complete-email').value = '';
                document.getElementById('tc-complete-name').value = '';
                document.getElementById('tc-complete-saleid').value = '';
            } else {
                const errMsg = result.error || 'Erreur lors de la confirmation';
                if (typeof Toast !== 'undefined') Toast.error(errMsg);
            }

            if (btn) { btn.disabled = false; btn.textContent = '🎉 Confirmer la vente et envoyer l\'accès'; }
        });
    }

    function _attachPaymentEvents(config, tunnel) {
        // Export CSV leads
        document.getElementById('tc-export-leads')?.addEventListener('click', () => _exportLeadsCSV(tunnel));

        // Stripe save
        document.getElementById('tc-save-stripe')?.addEventListener('click', async () => {
            const pk = document.getElementById('tc-stripe-pk')?.value || '';
            const mode = document.getElementById('tc-stripe-mode')?.value || 'test';
            const newConfig = {
                ...(config || {}),
                stripe: { connected: pk.length > 10, publicKey: pk, mode }
            };
            await TunnelApi.savePaymentConfig(currentTunnelId, newConfig);
            if (typeof Toast !== 'undefined') Toast.success('Configuration Stripe sauvegardée');
            await _render();
        });

        // PayPal save
        document.getElementById('tc-save-paypal')?.addEventListener('click', async () => {
            const clientId = document.getElementById('tc-paypal-id')?.value || '';
            const newConfig = {
                ...(config || {}),
                paypal: { connected: clientId.length > 5, clientId }
            };
            await TunnelApi.savePaymentConfig(currentTunnelId, newConfig);
            if (typeof Toast !== 'undefined') Toast.success('Configuration PayPal sauvegardée');
            await _render();
        });

        // WhatsApp save
        document.getElementById('tc-save-wa')?.addEventListener('click', async () => {
            const phone = document.getElementById('tc-wa-phone')?.value || '';
            const message = document.getElementById('tc-wa-message')?.value || '';
            const newConfig = {
                ...(config || {}),
                whatsapp: { connected: phone.length > 8, phone, message }
            };
            await TunnelApi.savePaymentConfig(currentTunnelId, newConfig);
            if (typeof Toast !== 'undefined') Toast.success('Configuration WhatsApp sauvegardée');
            await _render();
        });
    }

    // ──────────────────────────────────────────
    // EXPORT CSV
    // ──────────────────────────────────────────

    async function _exportLeadsCSV(tunnel) {
        const leads = await TunnelApi.getLeads(currentTunnelId);
        const header = ['Nom', 'Email', 'Source', 'Statut', 'Valeur', 'Date'];
        const rows = leads.map(l => [
            l.name || '',
            l.email || '',
            l.source || '',
            l.status || '',
            l.value || '0',
            _formatDate(l.createdAt)
        ]);

        const csvContent = '\uFEFF' + [header, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads-${tunnel.url || 'tunnel'}-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        if (typeof Toast !== 'undefined') Toast.success(`${leads.length} leads exportés`);
    }

    // ──────────────────────────────────────────
    // ONGLET TRACKING
    // ──────────────────────────────────────────

    function _renderTracking(data) {
        const d = data || {};

        function pixelRow(id, icon, label, placeholder, fieldKey, docUrl) {
            const val = _esc(d[fieldKey] || '');
            const hasVal = !!d[fieldKey];
            return `
            <div class="tc-tracking-row" data-field="${fieldKey}">
                <div class="tc-tracking-icon">${icon}</div>
                <div class="tc-tracking-info">
                    <div class="tc-tracking-label">${label}</div>
                    <div class="tc-tracking-input-wrap">
                        <input
                            type="text"
                            class="tc-tracking-input"
                            id="tc-track-${fieldKey}"
                            placeholder="${placeholder}"
                            value="${val}"
                            autocomplete="off"
                            spellcheck="false"
                        />
                        ${hasVal ? `<span class="tc-tracking-badge-active">✓ Actif</span>` : ''}
                    </div>
                    <div class="tc-tracking-actions">
                        <button class="tc-btn-save-pixel" data-field="${fieldKey}">Enregistrer</button>
                        ${hasVal ? `<button class="tc-btn-clear-pixel" data-field="${fieldKey}" data-dbfield="${_dbField(fieldKey)}">Supprimer</button>` : ''}
                        <a href="${docUrl}" target="_blank" rel="noopener" class="tc-tracking-doc">Documentation ↗</a>
                    </div>
                </div>
            </div>`;
        }

        return `
        <div class="tc-tracking-wrap">
            <div class="tc-tracking-header">
                <h3>📈 Pixels de tracking</h3>
                <p>Connectez vos outils de marketing pour suivre les conversions sur tous vos tunnels.</p>
            </div>

            <div class="tc-tracking-events">
                <div class="tc-tracking-event-badge">PageView</div>
                <div class="tc-tracking-event-badge">ViewContent</div>
                <div class="tc-tracking-event-badge">InitiateCheckout</div>
                <div class="tc-tracking-event-badge">Purchase</div>
            </div>

            <div class="tc-tracking-list">
                ${pixelRow('facebookPixelId', '📘', 'Facebook / Meta Pixel', 'Ex: 1234567890123456', 'facebookPixelId', 'https://www.facebook.com/business/help/952192354843755')}
                ${pixelRow('googleAnalyticsId', '📊', 'Google Analytics 4 (GA4)', 'Ex: G-XXXXXXXXXX', 'googleAnalyticsId', 'https://support.google.com/analytics/answer/9304153')}
                ${pixelRow('googleTagManagerId', '🏷️', 'Google Tag Manager (GTM)', 'Ex: GTM-XXXXXXX', 'googleTagManagerId', 'https://support.google.com/tagmanager/answer/6103696')}
                ${pixelRow('tiktokPixelId', '🎵', 'TikTok Pixel', 'Ex: XXXXXXXXXXXXXXXXXXXXXXXX', 'tiktokPixelId', 'https://ads.tiktok.com/help/article/tiktok-pixel')}
            </div>

            <div class="tc-tracking-info-box">
                <strong>🔄 Application automatique</strong><br>
                Les pixels sont injectés sur toutes les pages de vos tunnels publiés :
                page de capture, page de vente, checkout et page de confirmation.
            </div>

            <div id="tc-tracking-feedback" class="tc-tracking-feedback" style="display:none;"></div>
        </div>`;
    }

    function _dbField(fieldKey) {
        const map = {
            facebookPixelId:    'facebook_pixel_id',
            googleAnalyticsId:  'google_analytics_id',
            googleTagManagerId: 'google_tag_manager_id',
            tiktokPixelId:      'tiktok_pixel_id',
        };
        return map[fieldKey] || fieldKey;
    }

    function _attachTrackingEvents() {
        const feedback = document.getElementById('tc-tracking-feedback');

        function showFeedback(msg, ok = true) {
            if (!feedback) return;
            feedback.textContent = msg;
            feedback.style.display = 'block';
            feedback.style.background = ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
            feedback.style.color = ok ? '#10b981' : '#ef4444';
            setTimeout(() => { feedback.style.display = 'none'; }, 3000);
        }

        async function savePixel(fieldKey) {
            const input = document.getElementById(`tc-track-${fieldKey}`);
            if (!input) return;
            const value = input.value.trim();
            const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : (localStorage.getItem('productive_token') || '');
            try {
                const resp = await fetch('/api/v1/tenants/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ [fieldKey]: value || null })
                });
                const data = await resp.json();
                if (data.success) {
                    _trackingData = { ..._trackingData, [fieldKey]: value };
                    showFeedback('✓ Pixel enregistré avec succès !');
                } else {
                    showFeedback('Erreur : ' + (data.error || 'Impossible de sauvegarder'), false);
                }
            } catch (e) {
                showFeedback('Erreur réseau', false);
            }
        }

        async function clearPixel(fieldKey, dbField) {
            const token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : (localStorage.getItem('productive_token') || '');
            try {
                const resp = await fetch('/api/v1/tenants/tracking/clear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ field: dbField })
                });
                const data = await resp.json();
                if (data.success) {
                    _trackingData = { ..._trackingData, [fieldKey]: '' };
                    showFeedback('Pixel supprimé.');
                    setTimeout(() => _render(), 500); // Re-render pour retirer le badge
                } else {
                    showFeedback('Erreur suppression', false);
                }
            } catch (e) {
                showFeedback('Erreur réseau', false);
            }
        }

        document.querySelectorAll('.tc-btn-save-pixel').forEach(btn => {
            btn.addEventListener('click', () => savePixel(btn.dataset.field));
        });

        document.querySelectorAll('.tc-btn-clear-pixel').forEach(btn => {
            btn.addEventListener('click', () => clearPixel(btn.dataset.field, btn.dataset.dbfield));
        });

        // Sauvegarde au Enter
        document.querySelectorAll('.tc-tracking-input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const fieldKey = input.id.replace('tc-track-', '');
                    savePixel(fieldKey);
                }
            });
        });
    }

    // ──────────────────────────────────────────
    // UTILITAIRES
    // ──────────────────────────────────────────

    function _esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function _formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
        } catch (e) { return dateStr; }
    }

    // ──────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────

    return { open, openPayments, close };

})();

window.TunnelStats = TunnelStats;
