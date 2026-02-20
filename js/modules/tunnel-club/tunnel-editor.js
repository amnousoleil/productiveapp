/**
 * ================================================
 * TUNNEL EDITOR v1.0
 * Éditeur de pages de tunnel avec preview temps réel
 * ================================================
 */

const TunnelEditor = (function() {
    'use strict';

    let overlay = null;
    let currentTunnel = null;
    let currentPage = 'vente';
    let currentDevice = 'desktop';
    let activeSection = null;
    let isSaving = false;

    const PAGE_CONFIG = {
        capture: { label: 'Capture', icon: '📧', desc: 'Page opt-in et collecte d\'emails' },
        vente: { label: 'Vente', icon: '💰', desc: 'Présentation de l\'offre et bénéfices' },
        checkout: { label: 'Checkout', icon: '🛒', desc: 'Formulaire de paiement' },
        merci: { label: 'Merci', icon: '🎉', desc: 'Confirmation et prochaine étape' }
    };

    const SECTIONS_BY_PAGE = {
        capture: [
            { key: 'hero', icon: '🎯', label: 'Bandeau principal (Hero)' },
            { key: 'social_proof', icon: '⭐', label: 'Preuves sociales' },
            { key: 'form', icon: '📝', label: 'Formulaire opt-in' }
        ],
        vente: [
            { key: 'hero', icon: '🎯', label: 'Bandeau principal' },
            { key: 'benefits', icon: '✅', label: 'Bénéfices / Avantages' },
            { key: 'testimonials', icon: '💬', label: 'Témoignages' },
            { key: 'pricing', icon: '💰', label: 'Bloc prix' },
            { key: 'faq', icon: '❓', label: 'FAQ' },
            { key: 'guarantee', icon: '🛡', label: 'Garantie' }
        ],
        checkout: [
            { key: 'summary', icon: '📋', label: 'Résumé commande' },
            { key: 'payment_form', icon: '💳', label: 'Formulaire paiement' },
            { key: 'security', icon: '🔒', label: 'Badges sécurité' }
        ],
        merci: [
            { key: 'confirmation', icon: '🎉', label: 'Message de confirmation' },
            { key: 'next_step', icon: '→', label: 'Prochaine étape / Accès' },
            { key: 'upsell', icon: '📈', label: 'Upsell (optionnel)' }
        ]
    };

    // ──────────────────────────────────────────
    // INITIALISATION
    // ──────────────────────────────────────────

    async function open(tunnelId) {
        try {
            currentTunnel = await TunnelApi.getById(tunnelId);
            if (!currentTunnel) {
                if (typeof Toast !== 'undefined') Toast.error('Tunnel introuvable');
                return;
            }
            currentPage = currentTunnel.currentPage || 'vente';
            _createOverlay();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            _renderAll();
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error('Erreur lors de l\'ouverture');
        }
    }

    function close() {
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        // Refresh la liste
        if (typeof TunnelClub !== 'undefined') TunnelClub.refresh();
    }

    function _createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tc-editor-overlay';
            overlay.id = 'tc-editor-overlay';
            document.body.appendChild(overlay);
        }
    }

    // ──────────────────────────────────────────
    // RENDU
    // ──────────────────────────────────────────

    function _renderAll() {
        if (!overlay || !currentTunnel) return;

        overlay.innerHTML = `
            ${_renderHeader()}
            <div class="tc-editor-body">
                ${_renderSidebar()}
                ${_renderPreviewArea()}
                ${_renderPropsPanel()}
            </div>
        `;

        _attachEditorEvents();
        _updatePreview();
    }

    function _renderHeader() {
        const pageItems = Object.entries(PAGE_CONFIG).map(([key, cfg]) => `
            <button class="tc-editor-tab${currentPage === key ? ' active' : ''}" data-page="${key}">
                ${cfg.icon} ${cfg.label}
            </button>
        `).join('');

        return `
            <div class="tc-editor-header">
                <button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-editor-back">← Retour</button>
                <span class="tc-editor-title">${_esc(currentTunnel.name || 'Éditeur')}</span>
                <div class="tc-editor-tabs">
                    ${pageItems}
                </div>
                <div style="display:flex;gap:8px;margin-left:auto;">
                    <button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-btn-ai-regen">✨ Regénérer IA</button>
                    <button class="tc-btn tc-btn-secondary tc-btn-sm" id="tc-btn-save">
                        💾 Sauvegarder
                    </button>
                    ${currentTunnel.status !== 'published'
                        ? `<button class="tc-btn tc-btn-primary tc-btn-sm" id="tc-btn-publish">🚀 Publier</button>`
                        : `<button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-btn-unpublish">⏸ Mettre en pause</button>`
                    }
                </div>
            </div>
        `;
    }

    function _renderSidebar() {
        const sections = SECTIONS_BY_PAGE[currentPage] || [];
        return `
            <div class="tc-editor-sidebar">
                <div class="tc-editor-sidebar-section">
                    <div class="tc-editor-sidebar-title">Sections — ${PAGE_CONFIG[currentPage]?.label || ''}</div>
                    ${sections.map(s => `
                        <div class="tc-section-block${activeSection === s.key ? ' active' : ''}" data-section="${s.key}">
                            <span class="tc-section-block-icon">${s.icon}</span>
                            <span class="tc-section-block-name">${s.label}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="tc-editor-sidebar-section">
                    <div class="tc-editor-sidebar-title">Paiements</div>
                    <div class="tc-section-block" data-panel="payments">
                        <span class="tc-section-block-icon">💳</span>
                        <span class="tc-section-block-name">Configurer paiements</span>
                    </div>
                </div>
                <div class="tc-editor-sidebar-section">
                    <div class="tc-editor-sidebar-title">Paramètres</div>
                    <div class="tc-section-block" data-panel="settings">
                        <span class="tc-section-block-icon">⚙️</span>
                        <span class="tc-section-block-name">Options du tunnel</span>
                    </div>
                    <div class="tc-section-block" data-panel="seo">
                        <span class="tc-section-block-icon">🔍</span>
                        <span class="tc-section-block-name">SEO & Méta</span>
                    </div>
                </div>
            </div>
        `;
    }

    function _renderPreviewArea() {
        return `
            <div class="tc-editor-preview">
                <div class="tc-editor-preview-toolbar">
                    <div class="tc-device-btns">
                        <button class="tc-device-btn${currentDevice === 'desktop' ? ' active' : ''}" data-device="desktop" title="Desktop">🖥</button>
                        <button class="tc-device-btn${currentDevice === 'tablet' ? ' active' : ''}" data-device="tablet" title="Tablette">📱</button>
                        <button class="tc-device-btn${currentDevice === 'mobile' ? ' active' : ''}" data-device="mobile" title="Mobile">📲</button>
                    </div>
                    <div class="tc-url-display" style="flex:1;font-size:12px;padding:4px 10px;">
                        🔒 giri-app.com/t/${_esc(currentTunnel.url || 'votre-tunnel')}/${currentPage}
                    </div>
                    <button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-btn-open-preview">↗ Ouvrir</button>
                </div>
                <div class="tc-editor-preview-content">
                    <div class="tc-page-frame ${currentDevice}" id="tc-page-frame">
                        <div id="tc-preview-content" style="min-height:400px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function _renderPropsPanel() {
        return `
            <div class="tc-editor-props" id="tc-props-panel">
                <div class="tc-editor-props-title">Propriétés</div>
                <p style="font-size:13px;color:var(--text-muted);">
                    Cliquez sur une section pour l'éditer.
                </p>
                ${_renderDefaultProps()}
            </div>
        `;
    }

    function _renderDefaultProps() {
        return `
            <div class="tc-accordion open">
                <div class="tc-accordion-header">
                    🎨 Apparence
                    <span>▼</span>
                </div>
                <div class="tc-accordion-content">
                    <div class="tc-form-group">
                        <label class="tc-form-label">Couleur</label>
                        <div class="tc-color-picker">
                            ${['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6'].map(c => `
                                <div class="tc-color-swatch${(currentTunnel.color||'#6366f1')===c?' selected':''}" style="background:${c};" data-prop-color="${c}"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Icône</label>
                        <input type="text" class="tc-input" value="${_esc(currentTunnel.icon||'🚀')}" id="tc-prop-icon" style="font-size:20px;text-align:center;width:60px;">
                    </div>
                </div>
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // PREVIEW HTML
    // ──────────────────────────────────────────

    function _updatePreview() {
        const frame = document.getElementById('tc-preview-content');
        if (!frame) return;
        frame.innerHTML = _generatePageHtml(currentPage);
    }

    function _generatePageHtml(page) {
        const color = currentTunnel.color || '#6366f1';
        const icon = currentTunnel.icon || '🚀';
        const content = currentTunnel.aiContent || {};
        const productName = currentTunnel.product || 'Votre produit';
        const price = currentTunnel.price ? `${currentTunnel.price}${currentTunnel.currency}` : '197€';

        const styles = `
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: Inter, -apple-system, sans-serif; color: #111; }
                .hero { background: linear-gradient(135deg, ${color}, ${color}cc); padding: 60px 32px; text-align: center; color: #fff; }
                .hero-icon { font-size: 48px; margin-bottom: 16px; }
                .hero h1 { font-size: 1.8em; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
                .hero p { font-size: 1em; opacity: 0.9; margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto; }
                .cta-btn { display: inline-block; background: #fff; color: ${color}; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 1em; cursor: pointer; text-decoration: none; }
                .section { padding: 40px 32px; }
                .section-title { font-size: 1.4em; font-weight: 700; text-align: center; margin-bottom: 24px; }
                .benefit-item { display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start; }
                .benefit-check { width: 24px; height: 24px; border-radius: 50%; background: ${color}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; margin-top: 2px; }
                .price-box { background: #f8f8f8; border-radius: 16px; padding: 32px; text-align: center; max-width: 400px; margin: 0 auto; }
                .price-main { font-size: 2.5em; font-weight: 800; color: ${color}; }
                .price-cta { display: block; background: ${color}; color: #fff; padding: 14px 32px; border-radius: 30px; font-weight: 700; margin-top: 20px; cursor: pointer; }
                .guarantee-box { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px; }
                .faq-item { border-bottom: 1px solid #eee; padding: 16px 0; }
                .faq-q { font-weight: 600; margin-bottom: 8px; }
                .faq-a { color: #666; font-size: 0.9em; }
                .form-field { margin-bottom: 12px; }
                .form-field label { display: block; font-size: 0.85em; font-weight: 600; margin-bottom: 4px; color: #555; }
                .form-field input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95em; }
                .checkout-btn { width: 100%; background: ${color}; color: #fff; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 1em; cursor: pointer; margin-top: 16px; border: none; }
                .thanks-box { text-align: center; padding: 60px 32px; }
                .thanks-icon { font-size: 64px; margin-bottom: 16px; }
                .thanks-title { font-size: 2em; font-weight: 800; margin-bottom: 12px; }
                .thanks-desc { color: #666; margin-bottom: 32px; }
                .thanks-cta { background: ${color}; color: #fff; padding: 14px 32px; border-radius: 30px; font-weight: 700; display: inline-block; cursor: pointer; }
                .testimonial { background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
                .test-stars { color: #f59e0b; font-size: 1.2em; margin-bottom: 8px; }
                .test-text { font-style: italic; margin-bottom: 8px; color: #444; }
                .test-author { font-weight: 600; font-size: 0.85em; color: #888; }
            </style>
        `;

        const pages = {
            capture: () => `
                ${styles}
                <div class="hero">
                    <div class="hero-icon">${icon}</div>
                    <h1>${_esc(content.headline || `Obtenez ${productName} gratuitement`)}</h1>
                    <p>${_esc(content.subheadline || 'Entrez votre email pour accéder immédiatement')}</p>
                </div>
                <div class="section">
                    <div style="max-width:400px;margin:0 auto;">
                        <div class="form-field">
                            <label>Prénom</label>
                            <input type="text" placeholder="Votre prénom...">
                        </div>
                        <div class="form-field">
                            <label>Email</label>
                            <input type="email" placeholder="votre@email.com">
                        </div>
                        <div class="cta-btn" style="display:block;text-align:center;background:${color};color:#fff;border-radius:8px;margin-top:8px;">
                            ${_esc(content.cta || 'Oui, je veux accéder →')}
                        </div>
                        <p style="text-align:center;font-size:0.8em;color:#999;margin-top:8px;">🔒 0 spam. Désinscription en 1 clic.</p>
                    </div>
                </div>
                <div class="section" style="background:#f9f9f9;">
                    <div style="max-width:500px;margin:0 auto;">
                        ${['formateurs', 'coaches', 'thérapeutes'].map(role => `
                            <div class="testimonial">
                                <div class="test-stars">★★★★★</div>
                                <div class="test-text">"Excellent ! J'ai adoré cette formation. Mes résultats ont triplé en 30 jours."</div>
                                <div class="test-author">— ${role.charAt(0).toUpperCase()+role.slice(1)} satisfait(e)</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,

            vente: () => `
                ${styles}
                <div class="hero">
                    <div class="hero-icon">${icon}</div>
                    <h1>${_esc(content.headline || productName)}</h1>
                    <p>${_esc(content.subheadline || currentTunnel.description || '')}</p>
                    <span class="cta-btn">${_esc(content.cta || 'Je veux accéder →')}</span>
                </div>
                <div class="section">
                    <div class="section-title">Ce que vous obtenez</div>
                    <div style="max-width:500px;margin:0 auto;">
                        ${(content.benefits || ['Avantage 1', 'Avantage 2', 'Avantage 3', 'Avantage 4']).map(b => `
                            <div class="benefit-item">
                                <div class="benefit-check">✓</div>
                                <div>${_esc(b)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="section" style="background:#f9f9f9;">
                    <div class="section-title">Ils en parlent</div>
                    <div style="max-width:500px;margin:0 auto;">
                        <div class="testimonial">
                            <div class="test-stars">★★★★★</div>
                            <div class="test-text">"Une transformation incroyable. Je recommande vivement !"</div>
                            <div class="test-author">— Client vérifié</div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="price-box">
                        <div style="font-size:0.9em;color:#666;margin-bottom:4px;">Accès complet</div>
                        <div class="price-main">${price}</div>
                        <div style="font-size:0.85em;color:#999;margin:8px 0;">ou 3x ${Math.round((currentTunnel.price||197)/3)}${currentTunnel.currency}</div>
                        <span class="price-cta">${_esc(content.cta || 'Accéder maintenant →')}</span>
                        <div style="margin-top:12px;font-size:0.8em;color:#999;">🔒 Paiement 100% sécurisé</div>
                    </div>
                    ${content.guarantee ? `
                        <div class="guarantee-box" style="max-width:400px;margin:16px auto 0;">
                            🛡 ${_esc(content.guarantee)}
                        </div>
                    ` : ''}
                </div>
                ${(content.faq||[]).length > 0 ? `
                <div class="section" style="background:#f9f9f9;">
                    <div class="section-title">Questions fréquentes</div>
                    <div style="max-width:600px;margin:0 auto;">
                        ${(content.faq||[]).map(item => `
                            <div class="faq-item">
                                <div class="faq-q">❓ ${_esc(item.q||'')}</div>
                                <div class="faq-a">${_esc(item.a||'')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            `,

            checkout: () => `
                ${styles}
                <div style="max-width:600px;margin:0 auto;padding:32px;">
                    <h1 style="font-size:1.5em;font-weight:700;margin-bottom:8px;">Finaliser votre commande</h1>
                    <p style="color:#666;margin-bottom:24px;">Commande sécurisée et cryptée</p>

                    <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin-bottom:24px;">
                        <div style="font-weight:700;margin-bottom:4px;">${_esc(productName)}</div>
                        <div style="color:#666;font-size:0.9em;">${_esc(currentTunnel.description||'')}</div>
                        <div style="margin-top:12px;font-size:1.3em;font-weight:700;color:${color};">${price}</div>
                    </div>

                    <div class="form-field"><label>Prénom</label><input type="text" placeholder="Votre prénom"></div>
                    <div class="form-field"><label>Nom</label><input type="text" placeholder="Votre nom"></div>
                    <div class="form-field"><label>Email</label><input type="email" placeholder="email@exemple.com"></div>
                    <div style="border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:12px;background:#fff;">
                        <div style="font-size:0.85em;font-weight:600;color:#555;margin-bottom:8px;">Numéro de carte</div>
                        <div style="font-size:0.95em;color:#aaa;">•••• •••• •••• 4242</div>
                    </div>
                    <button class="checkout-btn">🔒 Payer ${price} maintenant</button>
                    <p style="text-align:center;font-size:0.8em;color:#999;margin-top:8px;">
                        🛡 SSL 256 bits · Visa · Mastercard · PayPal
                    </p>
                </div>
            `,

            merci: () => `
                ${styles}
                <div class="thanks-box">
                    <div class="thanks-icon">🎉</div>
                    <h1 class="thanks-title">Merci pour votre commande !</h1>
                    <p class="thanks-desc">Votre accès à <strong>${_esc(productName)}</strong> est confirmé.<br>Vérifiez votre email pour les détails.</p>
                    <span class="thanks-cta">Accéder à mon achat →</span>
                    <div style="margin-top:32px;font-size:0.85em;color:#999;">
                        Un email de confirmation a été envoyé à votre adresse.
                    </div>
                </div>
            `
        };

        return pages[page] ? pages[page]() : `<div style="padding:40px;text-align:center;color:#999;">Page "${page}" — contenu à configurer</div>`;
    }

    // ──────────────────────────────────────────
    // PANNEAU PROPRIÉTÉS PAR SECTION
    // ──────────────────────────────────────────

    function _renderSectionProps(sectionKey) {
        const content = currentTunnel.aiContent || {};
        const propPanels = {
            hero: () => `
                <div class="tc-editor-props-title">🎯 Hero — Bandeau principal</div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Titre principal</label>
                    <textarea class="tc-textarea" id="tc-prop-headline" style="min-height:70px;">${_esc(content.headline||'')}</textarea>
                </div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Sous-titre</label>
                    <textarea class="tc-textarea" id="tc-prop-subheadline" style="min-height:60px;">${_esc(content.subheadline||'')}</textarea>
                </div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Bouton (CTA)</label>
                    <input type="text" class="tc-input" id="tc-prop-cta" value="${_esc(content.cta||'')}">
                </div>
                <button class="tc-btn tc-btn-primary" id="tc-save-section" style="width:100%;justify-content:center;">💾 Appliquer</button>
                <button class="tc-btn tc-btn-ghost" id="tc-regen-section" style="width:100%;justify-content:center;margin-top:8px;">✨ Regénérer avec l'IA</button>
            `,
            benefits: () => `
                <div class="tc-editor-props-title">✅ Bénéfices</div>
                <div id="tc-benefits-list">
                    ${(content.benefits||['Avantage 1','Avantage 2','Avantage 3']).map((b, i) => `
                        <div class="tc-form-group">
                            <label class="tc-form-label">Avantage ${i+1}</label>
                            <input type="text" class="tc-input tc-benefit-input" value="${_esc(b)}" data-idx="${i}">
                        </div>
                    `).join('')}
                </div>
                <button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-add-benefit" style="width:100%;justify-content:center;margin-bottom:12px;">+ Ajouter un avantage</button>
                <button class="tc-btn tc-btn-primary" id="tc-save-section" style="width:100%;justify-content:center;">💾 Appliquer</button>
            `,
            pricing: () => `
                <div class="tc-editor-props-title">💰 Prix</div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Prix</label>
                    <input type="number" class="tc-input" id="tc-prop-price" value="${currentTunnel.price||''}">
                </div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Devise</label>
                    <select class="tc-select" id="tc-prop-currency">
                        <option value="€" ${currentTunnel.currency==='€'?'selected':''}>€ Euro</option>
                        <option value="$" ${currentTunnel.currency==='$'?'selected':''}>$ Dollar</option>
                        <option value="£" ${currentTunnel.currency==='£'?'selected':''}>£ Livre</option>
                        <option value="FCFA" ${currentTunnel.currency==='FCFA'?'selected':''}>FCFA</option>
                    </select>
                </div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Texte bouton d'achat</label>
                    <input type="text" class="tc-input" id="tc-prop-buy-cta" value="${_esc(content.cta||'Accéder maintenant →')}">
                </div>
                <button class="tc-btn tc-btn-primary" id="tc-save-section" style="width:100%;justify-content:center;">💾 Appliquer</button>
            `,
            guarantee: () => `
                <div class="tc-editor-props-title">🛡 Garantie</div>
                <div class="tc-form-group">
                    <label class="tc-form-label">Texte de garantie</label>
                    <textarea class="tc-textarea" id="tc-prop-guarantee">${_esc(content.guarantee||'Satisfait ou remboursé 30 jours')}</textarea>
                </div>
                <button class="tc-btn tc-btn-primary" id="tc-save-section" style="width:100%;justify-content:center;">💾 Appliquer</button>
            `,
            faq: () => `
                <div class="tc-editor-props-title">❓ FAQ</div>
                <div id="tc-faq-list">
                    ${(content.faq||[]).map((item, i) => `
                        <div class="tc-form-group" style="border:1px solid var(--border);border-radius:8px;padding:12px;">
                            <label class="tc-form-label">Question ${i+1}</label>
                            <input type="text" class="tc-input tc-faq-q" value="${_esc(item.q||'')}" data-idx="${i}" style="margin-bottom:8px;">
                            <label class="tc-form-label">Réponse</label>
                            <textarea class="tc-textarea tc-faq-a" data-idx="${i}" style="min-height:60px;">${_esc(item.a||'')}</textarea>
                        </div>
                    `).join('')}
                </div>
                <button class="tc-btn tc-btn-ghost tc-btn-sm" id="tc-add-faq" style="width:100%;justify-content:center;margin-bottom:12px;">+ Ajouter une question</button>
                <button class="tc-btn tc-btn-primary" id="tc-save-section" style="width:100%;justify-content:center;">💾 Appliquer</button>
            `
        };

        return (propPanels[sectionKey] ? propPanels[sectionKey]() : `
            <div class="tc-editor-props-title">${SECTIONS_BY_PAGE[currentPage]?.find(s=>s.key===sectionKey)?.label || sectionKey}</div>
            <p style="font-size:13px;color:var(--text-muted);">Éditeur de section à venir.</p>
        `) + `
        <div style="margin-top:16px;">
            ${_renderDefaultProps()}
        </div>
        `;
    }

    // ──────────────────────────────────────────
    // ÉVÉNEMENTS
    // ──────────────────────────────────────────

    function _attachEditorEvents() {
        // Fermer
        document.getElementById('tc-editor-back')?.addEventListener('click', close);

        // Tabs pages
        overlay.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = btn.dataset.page;
                _renderAll();
            });
        });

        // Devices
        overlay.querySelectorAll('[data-device]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentDevice = btn.dataset.device;
                overlay.querySelectorAll('[data-device]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const frame = document.getElementById('tc-page-frame');
                if (frame) {
                    frame.className = `tc-page-frame ${currentDevice}`;
                }
            });
        });

        // Sections sidebar
        overlay.querySelectorAll('[data-section]').forEach(el => {
            el.addEventListener('click', () => {
                activeSection = el.dataset.section;
                overlay.querySelectorAll('[data-section]').forEach(e => e.classList.remove('active'));
                el.classList.add('active');
                const propsPanel = document.getElementById('tc-props-panel');
                if (propsPanel) propsPanel.innerHTML = _renderSectionProps(activeSection);
                _attachPropsEvents();
            });
        });

        // Panneaux spéciaux
        overlay.querySelectorAll('[data-panel]').forEach(el => {
            el.addEventListener('click', () => {
                const panel = el.dataset.panel;
                if (panel === 'payments') _openPaymentConfig();
                if (panel === 'settings') _openSettings();
                if (panel === 'seo') _openSeoPanel();
            });
        });

        // Couleur principale
        overlay.querySelectorAll('[data-prop-color]').forEach(swatch => {
            swatch.addEventListener('click', async () => {
                currentTunnel.color = swatch.dataset.propColor;
                overlay.querySelectorAll('[data-prop-color]').forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
                _updatePreview();
                await TunnelApi.update(currentTunnel.id, { color: currentTunnel.color });
            });
        });

        // Icône
        document.getElementById('tc-prop-icon')?.addEventListener('change', async (e) => {
            currentTunnel.icon = e.target.value;
            _updatePreview();
        });

        // Sauvegarder
        document.getElementById('tc-btn-save')?.addEventListener('click', _save);

        // Publier
        document.getElementById('tc-btn-publish')?.addEventListener('click', async () => {
            await TunnelApi.publish(currentTunnel.id);
            currentTunnel.status = 'published';
            if (typeof Toast !== 'undefined') Toast.success('🚀 Tunnel publié !');
            _renderAll();
        });

        // Pause
        document.getElementById('tc-btn-unpublish')?.addEventListener('click', async () => {
            await TunnelApi.pause(currentTunnel.id);
            currentTunnel.status = 'paused';
            if (typeof Toast !== 'undefined') Toast.info('Tunnel mis en pause');
            _renderAll();
        });

        // Regénérer IA
        document.getElementById('tc-btn-ai-regen')?.addEventListener('click', _regenWithAI);
    }

    function _attachPropsEvents() {
        document.getElementById('tc-save-section')?.addEventListener('click', _saveSectionProps);
        document.getElementById('tc-add-benefit')?.addEventListener('click', _addBenefit);
        document.getElementById('tc-add-faq')?.addEventListener('click', _addFaqItem);
        document.getElementById('tc-regen-section')?.addEventListener('click', _regenSection);
    }

    async function _saveSectionProps() {
        if (!currentTunnel.aiContent) currentTunnel.aiContent = {};
        const content = currentTunnel.aiContent;

        const headline = document.getElementById('tc-prop-headline')?.value;
        const subheadline = document.getElementById('tc-prop-subheadline')?.value;
        const cta = document.getElementById('tc-prop-cta')?.value;
        const guarantee = document.getElementById('tc-prop-guarantee')?.value;
        const price = document.getElementById('tc-prop-price')?.value;
        const currency = document.getElementById('tc-prop-currency')?.value;

        if (headline !== undefined) content.headline = headline;
        if (subheadline !== undefined) content.subheadline = subheadline;
        if (cta !== undefined) content.cta = cta;
        if (guarantee !== undefined) content.guarantee = guarantee;
        if (price !== undefined) currentTunnel.price = parseFloat(price) || 0;
        if (currency !== undefined) currentTunnel.currency = currency;

        // Benefits
        const benefitInputs = document.querySelectorAll('.tc-benefit-input');
        if (benefitInputs.length > 0) {
            content.benefits = Array.from(benefitInputs).map(i => i.value).filter(Boolean);
        }

        // FAQ
        const faqQs = document.querySelectorAll('.tc-faq-q');
        const faqAs = document.querySelectorAll('.tc-faq-a');
        if (faqQs.length > 0) {
            content.faq = Array.from(faqQs).map((q, i) => ({
                q: q.value,
                a: faqAs[i]?.value || ''
            })).filter(item => item.q);
        }

        await _save();
        _updatePreview();
        if (typeof Toast !== 'undefined') Toast.success('Section mise à jour');
    }

    function _addBenefit() {
        const list = document.getElementById('tc-benefits-list');
        if (!list) return;
        const idx = list.querySelectorAll('.tc-benefit-input').length;
        const div = document.createElement('div');
        div.className = 'tc-form-group';
        div.innerHTML = `
            <label class="tc-form-label">Avantage ${idx + 1}</label>
            <input type="text" class="tc-input tc-benefit-input" placeholder="Nouvel avantage..." data-idx="${idx}">
        `;
        list.appendChild(div);
        div.querySelector('input')?.focus();
    }

    function _addFaqItem() {
        const list = document.getElementById('tc-faq-list');
        if (!list) return;
        const idx = list.querySelectorAll('.tc-faq-q').length;
        const div = document.createElement('div');
        div.className = 'tc-form-group';
        div.style.cssText = 'border:1px solid var(--border);border-radius:8px;padding:12px;';
        div.innerHTML = `
            <label class="tc-form-label">Question ${idx + 1}</label>
            <input type="text" class="tc-input tc-faq-q" placeholder="Votre question..." data-idx="${idx}" style="margin-bottom:8px;">
            <label class="tc-form-label">Réponse</label>
            <textarea class="tc-textarea tc-faq-a" data-idx="${idx}" style="min-height:60px;" placeholder="La réponse..."></textarea>
        `;
        list.appendChild(div);
        div.querySelector('input')?.focus();
    }

    async function _save() {
        if (isSaving) return;
        isSaving = true;
        const btn = document.getElementById('tc-btn-save');
        if (btn) btn.textContent = '⏳ Sauvegarde...';
        try {
            await TunnelApi.update(currentTunnel.id, {
                price: currentTunnel.price,
                currency: currentTunnel.currency,
                color: currentTunnel.color,
                icon: currentTunnel.icon,
                aiContent: currentTunnel.aiContent,
                currentPage
            });
            if (btn) btn.textContent = '✅ Sauvegardé';
            setTimeout(() => { if (btn) btn.textContent = '💾 Sauvegarder'; }, 2000);
        } catch (e) {
            if (btn) btn.textContent = '💾 Sauvegarder';
        }
        isSaving = false;
    }

    async function _regenWithAI() {
        if (typeof Toast !== 'undefined') Toast.info('Regénération IA en cours...');
        try {
            const newContent = await TunnelApi.generateWithAI({
                product: currentTunnel.product,
                description: currentTunnel.description,
                price: currentTunnel.price,
                currency: currentTunnel.currency,
                audience: currentTunnel.audience,
                tone: currentTunnel.tone
            });
            currentTunnel.aiContent = newContent;
            await TunnelApi.update(currentTunnel.id, { aiContent: newContent });
            _updatePreview();
            if (typeof Toast !== 'undefined') Toast.success('Contenu regénéré avec succès !');
        } catch (e) {
            if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la regénération');
        }
    }

    async function _regenSection() {
        if (typeof Toast !== 'undefined') Toast.info('Regénération de la section...');
        await _regenWithAI();
    }

    function _openPaymentConfig() {
        if (typeof TunnelStats !== 'undefined') {
            TunnelStats.openPayments(currentTunnel.id);
        } else {
            if (typeof Toast !== 'undefined') Toast.info('Configuration paiements — disponible dans l\'onglet Statistiques');
        }
    }

    function _openSettings() {
        const propsPanel = document.getElementById('tc-props-panel');
        if (!propsPanel) return;
        propsPanel.innerHTML = `
            <div class="tc-editor-props-title">⚙️ Paramètres</div>
            <div class="tc-form-group">
                <label class="tc-form-label">Nom du tunnel</label>
                <input type="text" class="tc-input" id="tc-setting-name" value="${_esc(currentTunnel.name||'')}">
            </div>
            <div class="tc-form-group">
                <label class="tc-form-label">URL</label>
                <input type="text" class="tc-input" id="tc-setting-url" value="${_esc(currentTunnel.url||'')}">
            </div>
            <div class="tc-form-group">
                <label class="tc-form-label">Description</label>
                <textarea class="tc-textarea" id="tc-setting-desc">${_esc(currentTunnel.description||'')}</textarea>
            </div>
            <button class="tc-btn tc-btn-primary" id="tc-save-settings" style="width:100%;justify-content:center;">💾 Sauvegarder</button>
        `;
        document.getElementById('tc-save-settings')?.addEventListener('click', async () => {
            currentTunnel.name = document.getElementById('tc-setting-name')?.value || currentTunnel.name;
            currentTunnel.url = document.getElementById('tc-setting-url')?.value || currentTunnel.url;
            currentTunnel.description = document.getElementById('tc-setting-desc')?.value || currentTunnel.description;
            await TunnelApi.update(currentTunnel.id, { name: currentTunnel.name, url: currentTunnel.url, description: currentTunnel.description });
            if (typeof Toast !== 'undefined') Toast.success('Paramètres sauvegardés');
            document.querySelector('.tc-editor-title').textContent = currentTunnel.name;
        });
    }

    function _openSeoPanel() {
        const propsPanel = document.getElementById('tc-props-panel');
        if (!propsPanel) return;
        propsPanel.innerHTML = `
            <div class="tc-editor-props-title">🔍 SEO & Méta</div>
            <div class="tc-form-group">
                <label class="tc-form-label">Titre SEO</label>
                <input type="text" class="tc-input" value="${_esc(currentTunnel.product||'')} — ${_esc(currentTunnel.description||'')}" maxlength="60">
                <small style="color:var(--text-muted);font-size:11px;">Max 60 caractères</small>
            </div>
            <div class="tc-form-group">
                <label class="tc-form-label">Description méta</label>
                <textarea class="tc-textarea" maxlength="160">${_esc(currentTunnel.description||'')}</textarea>
                <small style="color:var(--text-muted);font-size:11px;">Max 160 caractères</small>
            </div>
            <div class="tc-form-group">
                <label class="tc-form-label">Image Open Graph (URL)</label>
                <input type="url" class="tc-input" placeholder="https://...">
            </div>
            <button class="tc-btn tc-btn-primary" style="width:100%;justify-content:center;">💾 Sauvegarder SEO</button>
        `;
    }

    // ──────────────────────────────────────────
    // UTILITAIRES
    // ──────────────────────────────────────────

    function _esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ──────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────

    return { open, close };

})();

window.TunnelEditor = TunnelEditor;
