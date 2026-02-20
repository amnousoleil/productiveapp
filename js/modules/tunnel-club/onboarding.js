/**
 * ================================================
 * TUNNEL CLUB — Onboarding Wizard v1.0
 * Wizard 3 étapes : Subdomain → Personnalisation → Confirmation
 * ================================================
 */

const TunnelClubOnboarding = (function() {
    'use strict';

    const API_BASE = '/api/v1/tenants';

    // ──────────────────────────────────────────
    // HELPERS API
    // ──────────────────────────────────────────

    function _getToken() {
        return localStorage.getItem('productive_token') || sessionStorage.getItem('productive_token') || '';
    }

    function _headers() {
        const token = _getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    async function _request(method, path, body = null) {
        const res = await fetch(API_BASE + path, {
            method,
            headers: _headers(),
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Erreur API');
        return data;
    }

    // ──────────────────────────────────────────
    // STATE
    // ──────────────────────────────────────────

    let _step = 1;
    let _form = {
        subdomain: '',
        displayName: '',
        primaryColor: '#6c63ff',
        secondaryColor: '#00d9a6'
    };
    let _subdomainTimer = null;
    let _subdomainValid = false;
    let _container = null;

    // ──────────────────────────────────────────
    // ENTRÉE PRINCIPALE
    // ──────────────────────────────────────────

    /**
     * Vérifie si l'utilisateur a un tenant et affiche
     * soit le wizard, soit redirige vers le dashboard TC.
     */
    async function show(container) {
        _container = container;
        _step = 1;
        _form = { subdomain: '', displayName: '', primaryColor: '#6c63ff', secondaryColor: '#00d9a6' };

        _setLoading(container);

        try {
            const data = await _request('GET', '/my-tenant');

            if (data.hasTenant) {
                // Déjà inscrit → rendre le dashboard Tunnel Club normal
                if (typeof TunnelClub !== 'undefined' && typeof TunnelClub.renderDashboard === 'function') {
                    TunnelClub.renderDashboard(container, data);
                } else if (typeof TunnelList !== 'undefined') {
                    TunnelList.render(container);
                } else {
                    container.innerHTML = `<div class="tc-wrapper"><p style="padding:2rem;color:var(--text-secondary)">Chargement du dashboard...</p></div>`;
                }
                return;
            }

            // Pas encore de tenant → wizard
            _renderStep(container);

        } catch (e) {
            console.error('[Onboarding] Erreur check tenant:', e);
            _renderStep(container); // Afficher le wizard même en cas d'erreur
        }
    }

    function _setLoading(container) {
        container.innerHTML = `
            <div class="tc-onboarding-loading">
                <div class="tc-spinner"></div>
                <p>Chargement...</p>
            </div>`;
    }

    // ──────────────────────────────────────────
    // RENDU WIZARD
    // ──────────────────────────────────────────

    function _renderStep(container) {
        const steps = { 1: _renderStep1, 2: _renderStep2, 3: _renderStep3 };
        const fn = steps[_step];
        if (fn) fn(container);
    }

    // ÉTAPE 1 — Choisir son subdomain
    function _renderStep1(container) {
        container.innerHTML = `
        <div class="tc-onboarding">
            <div class="tc-onboarding-inner">
                <div class="tc-onboarding-header">
                    <div class="tc-onboarding-logo">⚡</div>
                    <h1>Bienvenue sur Tunnel Club</h1>
                    <p>Créez votre espace en quelques secondes</p>
                    <div class="tc-onboarding-steps">
                        <div class="tc-step active">1</div>
                        <div class="tc-step-line"></div>
                        <div class="tc-step">2</div>
                        <div class="tc-step-line"></div>
                        <div class="tc-step">3</div>
                    </div>
                </div>

                <div class="tc-onboarding-card">
                    <h2>Choisissez votre adresse</h2>
                    <p class="tc-onboarding-hint">C'est l'URL que vos clients utiliseront pour accéder à vos tunnels et formations.</p>

                    <div class="tc-subdomain-field">
                        <div class="tc-subdomain-input-wrap">
                            <input
                                type="text"
                                id="tc-subdomain-input"
                                class="tc-input"
                                placeholder="mon-espace"
                                autocomplete="off"
                                spellcheck="false"
                                maxlength="32"
                                value="${_form.subdomain}"
                            />
                            <span class="tc-subdomain-suffix">.giri-app.com</span>
                        </div>
                        <div id="tc-subdomain-status" class="tc-subdomain-status"></div>
                    </div>

                    <div id="tc-subdomain-preview" class="tc-subdomain-preview" style="display:none">
                        <span class="tc-preview-label">Votre URL :</span>
                        <span id="tc-preview-url" class="tc-preview-url"></span>
                    </div>

                    <div class="tc-subdomain-rules">
                        <small>• 4 à 32 caractères &nbsp;•&nbsp; Lettres minuscules, chiffres, tirets &nbsp;•&nbsp; Ne commence/finit pas par un tiret</small>
                    </div>
                </div>

                <div class="tc-onboarding-footer">
                    <button class="tc-btn tc-btn-primary" id="tc-step1-next" disabled>
                        Continuer →
                    </button>
                </div>
            </div>
        </div>`;

        _bindStep1();
    }

    function _bindStep1() {
        const input = document.getElementById('tc-subdomain-input');
        const nextBtn = document.getElementById('tc-step1-next');

        if (!input) return;

        input.addEventListener('input', () => {
            const val = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            input.value = val;
            _form.subdomain = val;
            _subdomainValid = false;
            nextBtn.disabled = true;

            clearTimeout(_subdomainTimer);

            const status = document.getElementById('tc-subdomain-status');
            const preview = document.getElementById('tc-subdomain-preview');

            if (val.length < 4) {
                status.innerHTML = val.length > 0 ? '<span class="tc-status-error">Trop court (minimum 4 caractères)</span>' : '';
                preview.style.display = 'none';
                return;
            }

            status.innerHTML = '<span class="tc-status-checking">⟳ Vérification...</span>';

            _subdomainTimer = setTimeout(async () => {
                try {
                    const data = await _request('GET', `/check-subdomain/${val}`);
                    if (data.available) {
                        status.innerHTML = '<span class="tc-status-ok">✓ Disponible !</span>';
                        document.getElementById('tc-preview-url').textContent = data.fullUrl;
                        preview.style.display = 'flex';
                        _subdomainValid = true;
                        nextBtn.disabled = false;
                    } else {
                        status.innerHTML = `<span class="tc-status-error">✗ ${data.reason || 'Non disponible'}</span>`;
                        preview.style.display = 'none';
                        _subdomainValid = false;
                        nextBtn.disabled = true;
                    }
                } catch (e) {
                    status.innerHTML = '<span class="tc-status-error">Erreur de vérification</span>';
                }
            }, 500);
        });

        nextBtn.addEventListener('click', () => {
            if (_subdomainValid) {
                _step = 2;
                _renderStep(_container);
            }
        });

        // Focus auto
        setTimeout(() => input.focus(), 100);
    }

    // ÉTAPE 2 — Personnalisation
    function _renderStep2(container) {
        container.innerHTML = `
        <div class="tc-onboarding">
            <div class="tc-onboarding-inner">
                <div class="tc-onboarding-header">
                    <div class="tc-onboarding-logo">🎨</div>
                    <h1>Personnalisez votre espace</h1>
                    <p>Donnez une identité à <strong>${_form.subdomain}.giri-app.com</strong></p>
                    <div class="tc-onboarding-steps">
                        <div class="tc-step done">✓</div>
                        <div class="tc-step-line active"></div>
                        <div class="tc-step active">2</div>
                        <div class="tc-step-line"></div>
                        <div class="tc-step">3</div>
                    </div>
                </div>

                <div class="tc-onboarding-card">
                    <div class="tc-field">
                        <label for="tc-display-name">Nom d'affichage *</label>
                        <input
                            type="text"
                            id="tc-display-name"
                            class="tc-input"
                            placeholder="Ex: Coaching par Marie"
                            maxlength="100"
                            value="${_form.displayName}"
                        />
                        <small>Nom affiché à vos clients sur vos pages</small>
                    </div>

                    <div class="tc-field">
                        <label>Couleurs de votre marque</label>
                        <div class="tc-colors-row">
                            <div class="tc-color-item">
                                <label for="tc-color-primary">Principale</label>
                                <div class="tc-color-picker-wrap">
                                    <input type="color" id="tc-color-primary" value="${_form.primaryColor}" />
                                    <span id="tc-color-primary-hex" class="tc-color-hex">${_form.primaryColor}</span>
                                </div>
                            </div>
                            <div class="tc-color-item">
                                <label for="tc-color-secondary">Accent</label>
                                <div class="tc-color-picker-wrap">
                                    <input type="color" id="tc-color-secondary" value="${_form.secondaryColor}" />
                                    <span id="tc-color-secondary-hex" class="tc-color-hex">${_form.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tc-preview-brand" id="tc-preview-brand">
                        <div class="tc-preview-brand-bar" id="tc-preview-bar" style="background: linear-gradient(135deg, ${_form.primaryColor}, ${_form.secondaryColor})">
                            <span>${_form.displayName || 'Votre espace'}</span>
                        </div>
                        <div class="tc-preview-brand-url">${_form.subdomain}.giri-app.com</div>
                    </div>
                </div>

                <div class="tc-onboarding-footer">
                    <button class="tc-btn tc-btn-ghost" id="tc-step2-back">← Retour</button>
                    <button class="tc-btn tc-btn-primary" id="tc-step2-next">Continuer →</button>
                </div>
            </div>
        </div>`;

        _bindStep2();
    }

    function _bindStep2() {
        const nameInput = document.getElementById('tc-display-name');
        const colorPrimary = document.getElementById('tc-color-primary');
        const colorSecondary = document.getElementById('tc-color-secondary');
        const previewBar = document.getElementById('tc-preview-bar');

        function updatePreview() {
            _form.displayName = nameInput.value.trim();
            _form.primaryColor = colorPrimary.value;
            _form.secondaryColor = colorSecondary.value;

            document.getElementById('tc-color-primary-hex').textContent = colorPrimary.value;
            document.getElementById('tc-color-secondary-hex').textContent = colorSecondary.value;

            previewBar.style.background = `linear-gradient(135deg, ${_form.primaryColor}, ${_form.secondaryColor})`;
            previewBar.querySelector('span').textContent = _form.displayName || 'Votre espace';
        }

        nameInput.addEventListener('input', updatePreview);
        colorPrimary.addEventListener('input', updatePreview);
        colorSecondary.addEventListener('input', updatePreview);

        document.getElementById('tc-step2-back').addEventListener('click', () => {
            _step = 1;
            _renderStep(_container);
        });

        document.getElementById('tc-step2-next').addEventListener('click', () => {
            _form.displayName = nameInput.value.trim();
            if (!_form.displayName) {
                nameInput.focus();
                nameInput.style.borderColor = 'var(--error, #ef4444)';
                return;
            }
            _step = 3;
            _renderStep(_container);
        });

        setTimeout(() => nameInput.focus(), 100);
    }

    // ÉTAPE 3 — Confirmation
    function _renderStep3(container) {
        container.innerHTML = `
        <div class="tc-onboarding">
            <div class="tc-onboarding-inner">
                <div class="tc-onboarding-header">
                    <div class="tc-onboarding-logo">🚀</div>
                    <h1>Tout est prêt !</h1>
                    <p>Vérifiez et lancez votre espace</p>
                    <div class="tc-onboarding-steps">
                        <div class="tc-step done">✓</div>
                        <div class="tc-step-line active"></div>
                        <div class="tc-step done">✓</div>
                        <div class="tc-step-line active"></div>
                        <div class="tc-step active">3</div>
                    </div>
                </div>

                <div class="tc-onboarding-card tc-recap">
                    <div class="tc-recap-row">
                        <span class="tc-recap-label">Adresse</span>
                        <span class="tc-recap-value tc-recap-url">
                            <span class="tc-url-badge" style="background: linear-gradient(135deg, ${_form.primaryColor}, ${_form.secondaryColor})">⚡</span>
                            ${_form.subdomain}.giri-app.com
                        </span>
                    </div>
                    <div class="tc-recap-row">
                        <span class="tc-recap-label">Nom affiché</span>
                        <span class="tc-recap-value">${_form.displayName}</span>
                    </div>
                    <div class="tc-recap-row">
                        <span class="tc-recap-label">Couleur principale</span>
                        <span class="tc-recap-value">
                            <span class="tc-color-swatch" style="background:${_form.primaryColor}"></span>
                            ${_form.primaryColor}
                        </span>
                    </div>
                    <div class="tc-recap-row">
                        <span class="tc-recap-label">Couleur accent</span>
                        <span class="tc-recap-value">
                            <span class="tc-color-swatch" style="background:${_form.secondaryColor}"></span>
                            ${_form.secondaryColor}
                        </span>
                    </div>
                    <div class="tc-recap-row">
                        <span class="tc-recap-label">Plan</span>
                        <span class="tc-recap-value"><span class="tc-badge-free">Free</span> · Évolutif à tout moment</span>
                    </div>
                </div>

                <div id="tc-create-error" class="tc-create-error" style="display:none"></div>

                <div class="tc-onboarding-footer">
                    <button class="tc-btn tc-btn-ghost" id="tc-step3-back">← Retour</button>
                    <button class="tc-btn tc-btn-primary tc-btn-launch" id="tc-step3-create">
                        <span id="tc-create-label">🎉 Créer mon espace</span>
                    </button>
                </div>
            </div>
        </div>`;

        _bindStep3();
    }

    function _bindStep3() {
        document.getElementById('tc-step3-back').addEventListener('click', () => {
            _step = 2;
            _renderStep(_container);
        });

        document.getElementById('tc-step3-create').addEventListener('click', _doCreate);
    }

    async function _doCreate() {
        const btn = document.getElementById('tc-step3-create');
        const label = document.getElementById('tc-create-label');
        const errorDiv = document.getElementById('tc-create-error');

        btn.disabled = true;
        label.textContent = '⟳ Création en cours...';
        errorDiv.style.display = 'none';

        try {
            const data = await _request('POST', '/create', {
                subdomain: _form.subdomain,
                displayName: _form.displayName,
                primaryColor: _form.primaryColor,
                secondaryColor: _form.secondaryColor
            });

            if (data.success) {
                _renderSuccess(data);
            } else {
                throw new Error(data.error || 'Erreur création');
            }
        } catch (e) {
            btn.disabled = false;
            label.textContent = '🎉 Créer mon espace';
            errorDiv.textContent = e.message || 'Une erreur est survenue, veuillez réessayer.';
            errorDiv.style.display = 'block';
        }
    }

    // SUCCÈS — confettis + redirection
    function _renderSuccess(data) {
        if (!_container) return;

        _container.innerHTML = `
        <div class="tc-onboarding tc-onboarding-success">
            <div class="tc-onboarding-inner">
                <div class="tc-success-icon">🎉</div>
                <h1>Votre espace est créé !</h1>
                <p class="tc-success-url">${data.url || `https://${_form.subdomain}.giri-app.com`}</p>
                <p class="tc-success-msg">Félicitations ${_form.displayName} ! Créez votre premier tunnel de vente maintenant.</p>
                <button class="tc-btn tc-btn-primary tc-btn-launch" id="tc-go-dashboard">
                    Aller au dashboard →
                </button>
            </div>
        </div>`;

        _launchConfetti();

        document.getElementById('tc-go-dashboard').addEventListener('click', () => {
            // Recharger le module tunnel-club (sans onboarding cette fois)
            if (typeof TunnelList !== 'undefined') {
                TunnelList.render(_container);
            } else if (typeof TunnelClub !== 'undefined') {
                TunnelClub.init();
            }
        });
    }

    // Confettis légers (CSS + JS natif)
    function _launchConfetti() {
        const colors = [_form.primaryColor, _form.secondaryColor, '#fbbf24', '#f87171', '#34d399'];
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
        document.body.appendChild(container);

        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 6;
            const startX = Math.random() * 100;
            const delay = Math.random() * 1.5;
            const duration = Math.random() * 1.5 + 2;

            el.style.cssText = `
                position:absolute;top:-10px;left:${startX}%;
                width:${size}px;height:${size}px;
                background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
                opacity:1;animation:tcConfettiFall ${duration}s ease-in ${delay}s forwards;
            `;
            container.appendChild(el);
        }

        // Injection keyframe si absente
        if (!document.getElementById('tc-confetti-style')) {
            const style = document.createElement('style');
            style.id = 'tc-confetti-style';
            style.textContent = `
                @keyframes tcConfettiFall {
                    0%  { transform: translateY(0) rotate(0deg);   opacity: 1; }
                    100%{ transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => container.remove(), 4000);
    }

    // ──────────────────────────────────────────
    // API PUBLIQUE
    // ──────────────────────────────────────────

    return { show };

})();
