/**
 * Certificate Settings v1.0 — Giri Tunnel Club
 * Personnalisation des certificats (logo, signature, couleur, footer)
 * Accessible via le dashboard Giri Tunnel Club
 */
var CertificateSettings = (function() {
    'use strict';

    var API_BASE = '/api/v1/tenants/certificate';

    // ── API helpers ──────────────────────────────────────────────────────────

    function _getToken() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getToken) return ApiTokens.getToken() || '';
        return localStorage.getItem('accessToken') || '';
    }

    function _authHeaders() {
        return { 'Authorization': 'Bearer ' + _getToken() };
    }

    async function _getSettings() {
        var res = await fetch(API_BASE, { headers: _authHeaders() });
        if (!res.ok) throw new Error('Impossible de charger les paramètres');
        var d = await res.json();
        return d.settings || {};
    }

    async function _saveSettings(footerText, primaryColor) {
        var res = await fetch(API_BASE, {
            method: 'PUT',
            headers: Object.assign({ 'Content-Type': 'application/json' }, _authHeaders()),
            body: JSON.stringify({ footer_text: footerText, primary_color: primaryColor })
        });
        var d = await res.json();
        if (!d.success) throw new Error(d.error || 'Erreur lors de la sauvegarde');
        return d.settings;
    }

    async function _uploadImage(field, file) {
        var formData = new FormData();
        formData.append('file', file);
        var res = await fetch(API_BASE + '/' + field, {
            method: 'POST',
            headers: _authHeaders(),
            body: formData
        });
        var d = await res.json();
        if (!d.success) throw new Error(d.error || 'Erreur upload');
        return d;
    }

    // ── Modal UI ─────────────────────────────────────────────────────────────

    function _buildModal(settings) {
        var logoUrl = settings.certificate_logo_url || '';
        var sigUrl = settings.certificate_signature_url || '';
        var footer = settings.certificate_footer_text || 'Ce certificat atteste de la complétion avec succès de la formation.';
        var color = settings.certificate_primary_color || '#8B5CF6';

        return '<div id="cert-settings-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)">' +
            '<div style="background:var(--bg-secondary,#1a1a2e);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:20px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;padding:32px;box-shadow:0 25px 60px rgba(0,0,0,0.5)">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">' +
                    '<div>' +
                        '<h2 style="font-size:1.2rem;font-weight:700;color:var(--text,#fff);margin:0 0 4px">🎓 Personnaliser les certificats</h2>' +
                        '<p style="font-size:0.85rem;color:var(--text-muted,rgba(255,255,255,0.55));margin:0">Logo, signature, couleur et texte de vos certificats de formation</p>' +
                    '</div>' +
                    '<button id="cert-settings-close" style="background:rgba(255,255,255,0.08);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:16px;color:var(--text-muted,rgba(255,255,255,0.6));display:flex;align-items:center;justify-content:center">✕</button>' +
                '</div>' +

                // ── Logo upload ──
                '<div style="margin-bottom:20px">' +
                    '<label style="font-size:0.8rem;font-weight:600;color:var(--text-muted,rgba(255,255,255,0.6));text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:10px">Logo de l\'entreprise</label>' +
                    '<div style="display:flex;align-items:center;gap:16px">' +
                        '<div id="cert-logo-preview" style="width:80px;height:56px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">' +
                            (logoUrl ? '<img src="' + logoUrl + '" style="max-width:100%;max-height:100%;object-fit:contain" onerror="this.parentNode.innerHTML=\'<span style=color:rgba(255,255,255,0.3);font-size:12px>Logo</span>\'">' : '<span style="color:rgba(255,255,255,0.3);font-size:11px">Logo</span>') +
                        '</div>' +
                        '<div>' +
                            '<label class="tc-btn tc-btn-secondary tc-btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">📤 Choisir un logo<input type="file" id="cert-logo-input" accept="image/*" style="display:none"></label>' +
                            '<p style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin:6px 0 0">JPG, PNG, WebP ou SVG — max 3 Mo</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                // ── Signature upload ──
                '<div style="margin-bottom:20px">' +
                    '<label style="font-size:0.8rem;font-weight:600;color:var(--text-muted,rgba(255,255,255,0.6));text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:10px">Signature</label>' +
                    '<div style="display:flex;align-items:center;gap:16px">' +
                        '<div id="cert-sig-preview" style="width:120px;height:56px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">' +
                            (sigUrl ? '<img src="' + sigUrl + '" style="max-width:100%;max-height:100%;object-fit:contain" onerror="this.parentNode.innerHTML=\'<span style=color:rgba(255,255,255,0.3);font-size:12px>Signature</span>\'">' : '<span style="color:rgba(255,255,255,0.3);font-size:11px">Signature</span>') +
                        '</div>' +
                        '<div>' +
                            '<label class="tc-btn tc-btn-secondary tc-btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">✍️ Choisir une signature<input type="file" id="cert-sig-input" accept="image/*" style="display:none"></label>' +
                            '<p style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin:6px 0 0">Image PNG avec fond transparent recommandée</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                // ── Color picker ──
                '<div style="margin-bottom:20px">' +
                    '<label style="font-size:0.8rem;font-weight:600;color:var(--text-muted,rgba(255,255,255,0.6));text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:10px">Couleur principale</label>' +
                    '<div style="display:flex;align-items:center;gap:12px">' +
                        '<input type="color" id="cert-color-input" value="' + color + '" style="width:44px;height:44px;border-radius:10px;border:2px solid rgba(255,255,255,0.15);background:none;cursor:pointer;padding:2px">' +
                        '<input type="text" id="cert-color-text" value="' + color + '" placeholder="#8B5CF6" style="flex:1;padding:12px 16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:0.9rem;font-family:monospace">' +
                        '<div id="cert-color-swatch" style="width:44px;height:44px;border-radius:10px;background:' + color + ';border:2px solid rgba(255,255,255,0.15)"></div>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;margin-top:10px">' +
                        ['#8B5CF6','#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#1F2937'].map(function(c) {
                            return '<div class="cert-color-preset" data-color="' + c + '" style="width:24px;height:24px;border-radius:6px;background:' + c + ';cursor:pointer;border:2px solid ' + (c === color ? '#fff' : 'transparent') + ';transition:border-color .15s" title="' + c + '"></div>';
                        }).join('') +
                    '</div>' +
                '</div>' +

                // ── Footer text ──
                '<div style="margin-bottom:24px">' +
                    '<label style="font-size:0.8rem;font-weight:600;color:var(--text-muted,rgba(255,255,255,0.6));text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:10px">Texte de bas de page</label>' +
                    '<textarea id="cert-footer-input" rows="3" style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:0.9rem;resize:vertical;box-sizing:border-box" placeholder="Ce certificat atteste de la complétion avec succès de la formation.">' + _escHtml(footer) + '</textarea>' +
                '</div>' +

                // ── Preview link ──
                '<div id="cert-settings-msg" style="margin-bottom:16px;font-size:0.875rem;min-height:20px;text-align:center"></div>' +

                // ── Actions ──
                '<div style="display:flex;gap:12px;justify-content:flex-end">' +
                    '<button id="cert-preview-btn" class="tc-btn tc-btn-ghost tc-btn-sm">👁 Aperçu</button>' +
                    '<button id="cert-save-btn" class="tc-btn tc-btn-primary">💾 Enregistrer</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function _escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _showMsg(text, isErr) {
        var el = document.getElementById('cert-settings-msg');
        if (!el) return;
        el.style.color = isErr ? '#f87171' : '#4ade80';
        el.textContent = text;
        setTimeout(function() { if (el) el.textContent = ''; }, 3500);
    }

    function _bindEvents() {
        // Close
        document.getElementById('cert-settings-close')?.addEventListener('click', function() {
            var overlay = document.getElementById('cert-settings-overlay');
            if (overlay) overlay.remove();
        });

        // Close on overlay click
        document.getElementById('cert-settings-overlay')?.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });

        // Logo upload
        document.getElementById('cert-logo-input')?.addEventListener('change', async function() {
            var file = this.files && this.files[0];
            if (!file) return;
            _showMsg('Upload du logo en cours...', false);
            try {
                var result = await _uploadImage('logo', file);
                var preview = document.getElementById('cert-logo-preview');
                if (preview) preview.innerHTML = '<img src="' + result.url + '" style="max-width:100%;max-height:100%;object-fit:contain">';
                _showMsg('✓ Logo mis à jour', false);
            } catch(e) { _showMsg('Erreur : ' + e.message, true); }
        });

        // Signature upload
        document.getElementById('cert-sig-input')?.addEventListener('change', async function() {
            var file = this.files && this.files[0];
            if (!file) return;
            _showMsg('Upload de la signature en cours...', false);
            try {
                var result = await _uploadImage('signature', file);
                var preview = document.getElementById('cert-sig-preview');
                if (preview) preview.innerHTML = '<img src="' + result.url + '" style="max-width:100%;max-height:100%;object-fit:contain">';
                _showMsg('✓ Signature mise à jour', false);
            } catch(e) { _showMsg('Erreur : ' + e.message, true); }
        });

        // Color picker sync
        var colorInput = document.getElementById('cert-color-input');
        var colorText = document.getElementById('cert-color-text');
        var colorSwatch = document.getElementById('cert-color-swatch');

        if (colorInput) {
            colorInput.addEventListener('input', function() {
                if (colorText) colorText.value = this.value;
                if (colorSwatch) colorSwatch.style.background = this.value;
            });
        }
        if (colorText) {
            colorText.addEventListener('input', function() {
                var val = this.value.trim();
                if (/^#[0-9A-Fa-f]{3,8}$/.test(val)) {
                    if (colorInput) colorInput.value = val;
                    if (colorSwatch) colorSwatch.style.background = val;
                }
            });
        }

        // Color presets
        document.querySelectorAll('.cert-color-preset').forEach(function(el) {
            el.addEventListener('click', function() {
                var c = this.dataset.color;
                if (colorInput) colorInput.value = c;
                if (colorText) colorText.value = c;
                if (colorSwatch) colorSwatch.style.background = c;
                document.querySelectorAll('.cert-color-preset').forEach(function(p) {
                    p.style.borderColor = p.dataset.color === c ? '#fff' : 'transparent';
                });
            });
        });

        // Save
        document.getElementById('cert-save-btn')?.addEventListener('click', async function() {
            var btn = this;
            btn.disabled = true;
            btn.textContent = 'Enregistrement...';
            var footer = document.getElementById('cert-footer-input')?.value || '';
            var color = colorText?.value || '#8B5CF6';
            try {
                await _saveSettings(footer, color);
                _showMsg('✓ Paramètres enregistrés avec succès', false);
                btn.textContent = '✓ Enregistré';
                setTimeout(function() { btn.disabled = false; btn.textContent = '💾 Enregistrer'; }, 2000);
            } catch(e) {
                _showMsg('Erreur : ' + e.message, true);
                btn.disabled = false;
                btn.textContent = '💾 Enregistrer';
            }
        });

        // Preview — open a sample certificate
        document.getElementById('cert-preview-btn')?.addEventListener('click', function() {
            window.open('/api/v1/certificates/preview-sample', '_blank');
        });
    }

    // ── Public API ───────────────────────────────────────────────────────────

    async function open() {
        // Remove existing modal if any
        var existing = document.getElementById('cert-settings-overlay');
        if (existing) { existing.remove(); return; }

        // Show loading state
        var loadingEl = document.createElement('div');
        loadingEl.id = 'cert-settings-overlay';
        loadingEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
        loadingEl.innerHTML = '<div style="color:#fff;font-size:1rem">Chargement...</div>';
        document.body.appendChild(loadingEl);

        try {
            var settings = await _getSettings();
            loadingEl.outerHTML = _buildModal(settings);
            // Re-get after DOM replacement
            _bindEvents();
        } catch(e) {
            loadingEl.remove();
            alert('Impossible de charger les paramètres certificat : ' + e.message);
        }
    }

    return { open: open };
})();

if (typeof window !== 'undefined') window.CertificateSettings = CertificateSettings;
console.log('certificate-settings.js v1.0 loaded');
