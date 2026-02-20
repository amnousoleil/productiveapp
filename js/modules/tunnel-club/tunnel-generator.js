/**
 * ================================================
 * TUNNEL GENERATOR v1.0
 * Wizard de création IA en 5 étapes
 * ================================================
 */

const TunnelGenerator = (function() {
    'use strict';

    let overlay = null;
    let currentStep = 1;
    const TOTAL_STEPS = 5;

    let formData = {
        name: '',
        product: '',
        description: '',
        price: '',
        currency: '€',
        audience: '',
        tone: 'professionnel',
        style: 'moderne',
        color: '#6366f1',
        icon: '🚀',
        aiContent: null
    };

    const STYLES = [
        { key: 'moderne', icon: '⚡', label: 'Moderne', desc: 'Clean, minimaliste, conversions élevées' },
        { key: 'elegant', icon: '✨', label: 'Élégant', desc: 'Premium, haut de gamme, luxe' },
        { key: 'energique', icon: '🔥', label: 'Énergique', desc: 'Dynamique, urgent, FOMO' },
        { key: 'nature', icon: '🌿', label: 'Nature', desc: 'Doux, authentique, bio' },
        { key: 'tech', icon: '💻', label: 'Tech', desc: 'Pro, expertise, autorité' },
        { key: 'fun', icon: '🎉', label: 'Fun', desc: 'Coloré, accessible, jeune' }
    ];

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#84cc16', '#f97316'];

    const ICONS = ['🚀', '💡', '⚡', '🎯', '🔥', '💎', '🌟', '🎓', '💰', '🧠', '🏆', '✨', '🌿', '💪', '🎉', '📈'];

    const TONES = [
        { key: 'professionnel', label: 'Professionnel', desc: 'Autorité et expertise' },
        { key: 'inspirant', label: 'Inspirant', desc: 'Motivation et transformation' },
        { key: 'amical', label: 'Amical', desc: 'Accessible et chaleureux' },
        { key: 'urgent', label: 'Urgent', desc: 'Scarcité et FOMO' }
    ];

    // ──────────────────────────────────────────
    // INITIALISATION
    // ──────────────────────────────────────────

    function open() {
        _reset();
        _createOverlay();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        _renderStep(1);
    }

    function close() {
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function _reset() {
        currentStep = 1;
        formData = {
            name: '',
            product: '',
            description: '',
            price: '',
            currency: '€',
            audience: '',
            tone: 'professionnel',
            style: 'moderne',
            color: '#6366f1',
            icon: '🚀',
            aiContent: null
        };
    }

    function _createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tc-wizard-overlay';
            overlay.id = 'tc-wizard-overlay';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div class="tc-wizard" id="tc-wizard">
                <div class="tc-wizard-header">
                    <h2 class="tc-wizard-title">✨ Créer un tunnel avec l'IA</h2>
                    <button class="tc-wizard-close" id="tc-wizard-close">✕</button>
                </div>
                ${_renderStepsBar()}
                <div class="tc-wizard-body" id="tc-wizard-body">
                    <!-- Contenu dynamique -->
                </div>
                <div class="tc-wizard-footer" id="tc-wizard-footer">
                    <!-- Boutons dynamiques -->
                </div>
            </div>
        `;

        document.getElementById('tc-wizard-close')?.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    }

    function _renderStepsBar() {
        const steps = ['Produit', 'Style', 'Génération IA', 'Preview', 'Publication'];
        return `
            <div class="tc-wizard-steps">
                ${steps.map((label, i) => `
                    <div class="tc-wizard-step${currentStep === i + 1 ? ' active' : currentStep > i + 1 ? ' done' : ''}" data-step="${i + 1}">
                        <div class="tc-step-circle">${currentStep > i + 1 ? '✓' : i + 1}</div>
                        <span class="tc-step-label">${label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // RENDU PAR ÉTAPE
    // ──────────────────────────────────────────

    function _renderStep(step) {
        currentStep = step;
        const body = document.getElementById('tc-wizard-body');
        const footer = document.getElementById('tc-wizard-footer');
        const stepsBar = overlay.querySelector('.tc-wizard-steps');
        if (stepsBar) stepsBar.outerHTML = _renderStepsBar();

        switch (step) {
            case 1: body.innerHTML = _step1(); break;
            case 2: body.innerHTML = _step2(); break;
            case 3: body.innerHTML = _step3(); _runAI(); break;
            case 4: body.innerHTML = _step4(); break;
            case 5: body.innerHTML = _step5(); break;
        }

        footer.innerHTML = _renderFooter(step);
        _attachStepEvents(step);
    }

    // Étape 1 : Informations produit
    function _step1() {
        return `
            <div class="tc-wizard-step-content active" id="tc-step-1">
                <p class="tc-step-description">Décrivez votre produit ou service pour que l'IA crée un tunnel parfaitement adapté.</p>

                <div class="tc-form-group">
                    <label class="tc-form-label">Nom de votre produit / offre *</label>
                    <div class="tc-input-with-ai">
                        <input type="text" class="tc-input" id="tc-f-product" placeholder="ex: Formation Productivité Pro, Coaching Business..." value="${_esc(formData.product)}">
                        <button class="tc-ai-btn" id="tc-ai-suggest-name" title="Suggérer un nom avec l'IA">✨ IA</button>
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Description <span>(qu'est-ce que ça apporte ?)</span></label>
                    <textarea class="tc-textarea" id="tc-f-desc" placeholder="ex: Apprenez à doubler votre productivité en 30 jours grâce à des techniques testées par 10 000 entrepreneurs...">${_esc(formData.description)}</textarea>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="tc-form-group">
                        <label class="tc-form-label">Prix de vente</label>
                        <div style="display:flex;gap:8px;">
                            <input type="number" class="tc-input" id="tc-f-price" placeholder="197" value="${formData.price}" style="flex:1;">
                            <select class="tc-select" id="tc-f-currency" style="width:80px;">
                                <option value="€" ${formData.currency==='€'?'selected':''}>€</option>
                                <option value="$" ${formData.currency==='$'?'selected':''}>$</option>
                                <option value="£" ${formData.currency==='£'?'selected':''}>£</option>
                                <option value="FCFA" ${formData.currency==='FCFA'?'selected':''}>XOF</option>
                            </select>
                        </div>
                    </div>
                    <div class="tc-form-group">
                        <label class="tc-form-label">Audience cible</label>
                        <input type="text" class="tc-input" id="tc-f-audience" placeholder="ex: entrepreneurs, freelances, étudiants..." value="${_esc(formData.audience)}">
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Ton de communication</label>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${TONES.map(t => `
                            <label style="cursor:pointer;">
                                <input type="radio" name="tc-tone" value="${t.key}" ${formData.tone === t.key ? 'checked' : ''} style="display:none;">
                                <span class="tc-style-option${formData.tone === t.key ? ' selected' : ''}" style="display:inline-block;padding:8px 14px;font-size:13px;" data-tone="${t.key}">
                                    ${t.label}
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Étape 2 : Style
    function _step2() {
        return `
            <div class="tc-wizard-step-content active" id="tc-step-2">
                <p class="tc-step-description">Choisissez le style visuel de votre tunnel. Vous pourrez personnaliser les couleurs dans l'éditeur.</p>

                <div class="tc-form-group">
                    <label class="tc-form-label">Style visuel</label>
                    <div class="tc-style-grid">
                        ${STYLES.map(s => `
                            <div class="tc-style-option${formData.style === s.key ? ' selected' : ''}" data-style="${s.key}">
                                <span class="tc-style-option-icon">${s.icon}</span>
                                <div class="tc-style-option-label">${s.label}</div>
                                <div class="tc-style-option-desc">${s.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Couleur principale</label>
                    <div class="tc-color-picker" id="tc-color-picker">
                        ${COLORS.map(c => `
                            <div class="tc-color-swatch${formData.color === c ? ' selected' : ''}" style="background:${c};" data-color="${c}"></div>
                        `).join('')}
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Icône du tunnel</label>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${ICONS.map(icon => `
                            <button class="tc-btn tc-btn-ghost${formData.icon === icon ? ' tc-btn-primary' : ''}" data-icon="${icon}" style="font-size:20px;width:44px;height:44px;padding:0;justify-content:center;">${icon}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Nom interne du tunnel <span>(pour vous)</span></label>
                    <input type="text" class="tc-input" id="tc-f-name" placeholder="ex: Funnel Formation Jan 2026" value="${_esc(formData.name)}">
                </div>
            </div>
        `;
    }

    // Étape 3 : Génération IA
    function _step3() {
        return `
            <div class="tc-wizard-step-content active" id="tc-step-3">
                <div class="tc-ai-loader" id="tc-ai-loader">
                    <span class="tc-ai-loader-icon">⚙️</span>
                    <h3>L'IA génère votre tunnel...</h3>
                    <p>Création du copywriting haute conversion</p>
                    <div class="tc-ai-progress">
                        <div class="tc-ai-progress-bar" id="tc-ai-progress-bar"></div>
                    </div>
                    <ul class="tc-ai-steps-list" id="tc-ai-steps-list">
                        <li data-ai-step="1">⏳ Analyse du produit et de l'audience...</li>
                        <li data-ai-step="2">⏳ Rédaction du copywriting...</li>
                        <li data-ai-step="3">⏳ Création des titres accrocheurs...</li>
                        <li data-ai-step="4">⏳ Génération des FAQ et garanties...</li>
                        <li data-ai-step="5">⏳ Assemblage du tunnel complet...</li>
                    </ul>
                </div>
                <div id="tc-ai-error" style="display:none;text-align:center;padding:24px;">
                    <span style="font-size:48px;">⚠️</span>
                    <h3 style="color:var(--text);margin:12px 0 8px;">Génération partiellement réussie</h3>
                    <p style="color:var(--text-muted);">Tunnel créé avec un template optimisé. Personnalisez-le dans l'éditeur.</p>
                </div>
            </div>
        `;
    }

    // Étape 4 : Preview
    function _step4() {
        const content = formData.aiContent;
        const productName = formData.product || 'Votre produit';
        const price = formData.price ? `${formData.price}${formData.currency}` : 'Sur devis';
        const color = formData.color;
        const benefits = content?.benefits || ['Avantage 1', 'Avantage 2', 'Avantage 3', 'Avantage 4'];

        const previewHtml = `
            <html>
            <head><style>
                body{margin:0;font-family:Inter,sans-serif;background:#fff;color:#111;}
                .hero{background:linear-gradient(135deg,${color},${color}cc);padding:60px 40px;text-align:center;color:#fff;}
                .hero h1{font-size:2em;font-weight:800;margin:0 0 12px;}
                .hero p{font-size:1.1em;opacity:0.9;margin:0 0 24px;}
                .hero .cta{background:#fff;color:${color};padding:14px 32px;border-radius:30px;font-weight:700;font-size:1.1em;display:inline-block;cursor:pointer;}
                .benefits{padding:40px;max-width:600px;margin:0 auto;}
                .benefits h2{font-size:1.4em;font-weight:700;text-align:center;margin-bottom:24px;}
                .benefit{display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;}
                .benefit-icon{width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
                .price-block{background:#f9f9f9;padding:32px 40px;text-align:center;}
                .price-block .price{font-size:2.5em;font-weight:800;color:${color};}
                .price-block .cta{background:${color};color:#fff;padding:16px 40px;border-radius:30px;font-weight:700;font-size:1.1em;display:inline-block;cursor:pointer;margin-top:16px;}
                .guarantee{padding:24px 40px;text-align:center;font-size:0.9em;color:#666;}
            </style></head>
            <body>
                <div class="hero">
                    <div style="font-size:2em;margin-bottom:12px;">${formData.icon}</div>
                    <h1>${content?.headline || productName}</h1>
                    <p>${content?.subheadline || formData.description || 'Découvrez notre offre exclusive'}</p>
                    <div class="cta">${content?.cta || 'Je veux accéder →'}</div>
                </div>
                <div class="benefits">
                    <h2>Ce que vous allez obtenir</h2>
                    ${benefits.map(b => `
                        <div class="benefit">
                            <div class="benefit-icon">✓</div>
                            <div>${b}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="price-block">
                    <div style="font-size:0.9em;color:#999;margin-bottom:4px;">Accès complet</div>
                    <div class="price">${price}</div>
                    <div class="cta">${content?.cta || 'Accéder maintenant →'}</div>
                    <div style="margin-top:12px;font-size:0.85em;color:#999;">🔒 Paiement sécurisé · 100% sécurisé</div>
                </div>
                ${content?.guarantee ? `<div class="guarantee">🛡 ${content.guarantee}</div>` : ''}
            </body>
            </html>
        `;

        return `
            <div class="tc-wizard-step-content active" id="tc-step-4">
                <p class="tc-step-description">Voici votre tunnel généré. Vous pourrez le personnaliser en détail dans l'éditeur après création.</p>

                <div class="tc-preview-container">
                    <div class="tc-preview-toolbar">
                        <div class="tc-preview-dots">
                            <div class="tc-preview-dot"></div>
                            <div class="tc-preview-dot"></div>
                            <div class="tc-preview-dot"></div>
                        </div>
                        <div class="tc-preview-url">🔒 giri-app.com/${formData.url || 'votre-tunnel'}</div>
                    </div>
                    <iframe class="tc-preview-iframe" srcdoc="${_escHtml(previewHtml)}" style="min-height:350px;"></iframe>
                </div>

                ${content ? `
                <div style="margin-top:16px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px;">
                    <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px;">📋 Contenu généré par l'IA</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;color:var(--text-muted);">
                        <div><strong style="color:var(--text);">Titre :</strong> ${_esc(content.headline || '')}</div>
                        <div><strong style="color:var(--text);">CTA :</strong> ${_esc(content.cta || '')}</div>
                        <div><strong style="color:var(--text);">Avantages :</strong> ${(content.benefits || []).length} générés</div>
                        <div><strong style="color:var(--text);">FAQ :</strong> ${(content.faq || []).length} questions</div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Étape 5 : Publication
    function _step5() {
        return `
            <div class="tc-wizard-step-content active" id="tc-step-5">
                <p class="tc-step-description">Votre tunnel est prêt ! Configurez les derniers détails avant de lancer.</p>

                <div class="tc-form-group">
                    <label class="tc-form-label">URL personnalisée</label>
                    <div class="tc-url-display">
                        <span>giri-app.com/t/</span>
                        <input type="text" class="tc-input" id="tc-f-url" value="${formData.url || _slugify(formData.product)}" style="border:none;background:transparent;padding:0;font-family:monospace;flex:1;">
                    </div>
                </div>

                <div class="tc-form-group">
                    <label class="tc-form-label">Mode de lancement</label>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <label class="tc-section-block" style="cursor:pointer;">
                            <input type="radio" name="tc-launch" value="draft" checked style="margin:0;">
                            <div>
                                <div class="tc-section-block-name">Enregistrer en brouillon</div>
                                <div style="font-size:12px;color:var(--text-muted);">Personnalisez avant de publier</div>
                            </div>
                        </label>
                        <label class="tc-section-block" style="cursor:pointer;">
                            <input type="radio" name="tc-launch" value="published" style="margin:0;">
                            <div>
                                <div class="tc-section-block-name">🚀 Publier maintenant</div>
                                <div style="font-size:12px;color:var(--text-muted);">Le tunnel est accessible immédiatement</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1));border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:16px;margin-top:8px;">
                    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px;">✅ Votre tunnel inclut :</div>
                    <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--text-muted);">
                        <div>📄 Page de capture (opt-in)</div>
                        <div>💰 Page de vente avec copywriting IA</div>
                        <div>🛒 Page de checkout</div>
                        <div>🎉 Page de remerciement</div>
                        <div>📊 Tableau de bord analytics</div>
                    </div>
                </div>
            </div>
        `;
    }

    function _renderFooter(step) {
        if (step === 3) {
            return `<div class="tc-wizard-footer-left">Génération en cours...</div><div class="tc-wizard-footer-right"></div>`;
        }

        return `
            <div class="tc-wizard-footer-left">Étape ${step} / ${TOTAL_STEPS}</div>
            <div class="tc-wizard-footer-right">
                ${step > 1 && step !== 3 ? `<button class="tc-btn tc-btn-ghost" id="tc-btn-prev">← Retour</button>` : ''}
                ${step < TOTAL_STEPS
                    ? `<button class="tc-btn tc-btn-primary" id="tc-btn-next">${step === 2 ? '✨ Générer avec l\'IA →' : 'Suivant →'}</button>`
                    : `<button class="tc-btn tc-btn-primary" id="tc-btn-finish">🚀 Créer mon tunnel</button>`
                }
            </div>
        `;
    }

    // ──────────────────────────────────────────
    // EVENTS PAR ÉTAPE
    // ──────────────────────────────────────────

    function _attachStepEvents(step) {
        document.getElementById('tc-btn-next')?.addEventListener('click', () => _nextStep());
        document.getElementById('tc-btn-prev')?.addEventListener('click', () => _renderStep(step - 1));
        document.getElementById('tc-btn-finish')?.addEventListener('click', () => _finish());

        if (step === 1) {
            document.getElementById('tc-ai-suggest-name')?.addEventListener('click', _aiSuggestName);
            document.querySelectorAll('[data-tone]').forEach(el => {
                el.closest('label')?.querySelector('input[type=radio]')?.addEventListener('change', () => {
                    formData.tone = el.dataset.tone;
                    document.querySelectorAll('[data-tone]').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                });
                el.addEventListener('click', () => {
                    formData.tone = el.dataset.tone;
                    document.querySelectorAll('[data-tone]').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                    const radio = el.closest('label')?.querySelector('input[type=radio]');
                    if (radio) radio.checked = true;
                });
            });
        }

        if (step === 2) {
            document.querySelectorAll('[data-style]').forEach(el => {
                el.addEventListener('click', () => {
                    formData.style = el.dataset.style;
                    document.querySelectorAll('[data-style]').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                });
            });

            document.querySelectorAll('[data-color]').forEach(el => {
                el.addEventListener('click', () => {
                    formData.color = el.dataset.color;
                    document.querySelectorAll('[data-color]').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                });
            });

            document.querySelectorAll('[data-icon]').forEach(el => {
                el.addEventListener('click', () => {
                    formData.icon = el.dataset.icon;
                    document.querySelectorAll('[data-icon]').forEach(e => {
                        e.classList.remove('tc-btn-primary');
                        e.classList.add('tc-btn-ghost');
                    });
                    el.classList.add('tc-btn-primary');
                    el.classList.remove('tc-btn-ghost');
                });
            });
        }
    }

    // ──────────────────────────────────────────
    // NAVIGATION
    // ──────────────────────────────────────────

    function _nextStep() {
        _collectFormData();
        if (currentStep === 1 && !formData.product.trim()) {
            if (typeof Toast !== 'undefined') Toast.error('Veuillez indiquer le nom de votre produit');
            return;
        }
        _renderStep(currentStep + 1);
    }

    function _collectFormData() {
        if (currentStep === 1) {
            formData.product = document.getElementById('tc-f-product')?.value.trim() || formData.product;
            formData.description = document.getElementById('tc-f-desc')?.value.trim() || formData.description;
            formData.price = document.getElementById('tc-f-price')?.value || formData.price;
            formData.currency = document.getElementById('tc-f-currency')?.value || formData.currency;
            formData.audience = document.getElementById('tc-f-audience')?.value.trim() || formData.audience;
        }
        if (currentStep === 2) {
            formData.name = document.getElementById('tc-f-name')?.value.trim() || `Tunnel ${formData.product}`;
        }
        if (currentStep === 5) {
            formData.url = document.getElementById('tc-f-url')?.value.trim() || formData.url;
        }
    }

    // ──────────────────────────────────────────
    // GÉNÉRATION IA
    // ──────────────────────────────────────────

    async function _runAI() {
        const progressBar = document.getElementById('tc-ai-progress-bar');
        const steps = document.querySelectorAll('[data-ai-step]');
        const loader = document.getElementById('tc-ai-loader');

        const setProgress = (pct, stepNum) => {
            if (progressBar) progressBar.style.width = pct + '%';
            steps.forEach((el, i) => {
                if (i + 1 < stepNum) {
                    el.innerHTML = el.innerHTML.replace('⏳', '✅');
                    el.className = 'done';
                } else if (i + 1 === stepNum) {
                    el.className = 'active';
                }
            });
        };

        try {
            setProgress(20, 1);
            await _sleep(800);
            setProgress(40, 2);

            const aiResult = await TunnelApi.generateWithAI(formData);
            formData.aiContent = aiResult;
            formData.url = formData.url || _slugify(formData.product);

            setProgress(60, 3); await _sleep(600);
            setProgress(80, 4); await _sleep(500);
            setProgress(100, 5); await _sleep(400);

            // Avancer à l'étape preview
            setTimeout(() => _renderStep(4), 500);

        } catch (err) {
            console.warn('TunnelGenerator: AI failed', err);
            const errorEl = document.getElementById('tc-ai-error');
            if (loader) loader.style.display = 'none';
            if (errorEl) errorEl.style.display = 'block';
            formData.aiContent = null;
            setTimeout(() => _renderStep(4), 2000);
        }
    }

    async function _aiSuggestName() {
        const btn = document.getElementById('tc-ai-suggest-name');
        const input = document.getElementById('tc-f-product');
        const desc = document.getElementById('tc-f-desc')?.value || '';

        if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

        try {
            if (typeof ApiAi !== 'undefined') {
                const prompt = `Suggère 3 noms accrocheurs pour un produit/service: "${desc}". Format: liste numérotée, noms courts et impactants.`;
                const resp = await ApiAi.generate(prompt);
                const text = resp?.data?.text || resp?.text || '';
                const names = text.match(/\d\.\s*(.+)/g);
                if (names && names.length > 0 && input) {
                    const name = names[0].replace(/^\d\.\s*/, '').trim();
                    input.value = name;
                    formData.product = name;
                }
            }
        } catch (e) {
            if (typeof Toast !== 'undefined') Toast.info('Suggestion IA non disponible');
        }

        if (btn) { btn.disabled = false; btn.innerHTML = '✨ IA'; }
    }

    // ──────────────────────────────────────────
    // FINALISATION
    // ──────────────────────────────────────────

    async function _finish() {
        _collectFormData();
        const btn = document.getElementById('tc-btn-finish');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Création...'; }

        try {
            const launchMode = document.querySelector('input[name="tc-launch"]:checked')?.value || 'draft';
            const tunnel = await TunnelApi.create({
                ...formData,
                status: launchMode
            });

            close();

            if (typeof Toast !== 'undefined') {
                Toast.success(`✅ Tunnel "${tunnel.name}" créé !`);
            }

            // Ouvrir l'éditeur
            setTimeout(() => {
                if (typeof TunnelEditor !== 'undefined') {
                    TunnelEditor.open(tunnel.id);
                } else if (typeof TunnelClub !== 'undefined') {
                    TunnelClub.refresh();
                }
            }, 500);

        } catch (err) {
            if (btn) { btn.disabled = false; btn.textContent = '🚀 Créer mon tunnel'; }
            if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la création');
        }
    }

    // ──────────────────────────────────────────
    // UTILITAIRES
    // ──────────────────────────────────────────

    function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function _esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function _escHtml(html) {
        return html.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function _slugify(text) {
        return (text || 'tunnel')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 50)
            .trim();
    }

    // ──────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────

    return { open, close };

})();

window.TunnelGenerator = TunnelGenerator;
