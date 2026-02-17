/**
 * AccMobile - Interactions mobiles premium pour le module Comptabilité
 * Features:
 *   - FAB bouton scan rapide
 *   - Swipe-to-action sur les lignes factures
 *   - Voice input via Mahayawen (Web Speech API)
 *   - Haptic feedback (Vibration API)
 *   - Bottom sheet pour actions contextuelles
 *   - Scanner plein écran mobile
 *   - Pull-to-refresh
 */
const AccMobile = (function() {
    'use strict';

    var isMobile = window.innerWidth <= 768;
    var fabEl = null;
    var bottomSheetEl = null;
    var speechRecognition = null;
    var activeVoiceInput = null;
    var swipeState = null;
    var initialized = false;

    /* ================================================================
       INIT — S'initialise quand la vue accounting est rendue
       ================================================================ */
    function init() {
        if (!isMobile) return;
        if (initialized) return;
        initialized = true;

        // Écouter les redimensionnements
        window.addEventListener('resize', function() {
            isMobile = window.innerWidth <= 768;
        });

        _createFAB();
        _createBottomSheet();
        _initSpeechAPI();
        _watchAccView();

        console.log('[AccMobile] ✅ Initialisé — mode mobile');
    }

    /* ================================================================
       FAB — Bouton Scan Rapide
       ================================================================ */
    function _createFAB() {
        if (document.getElementById('acc-fab-scan')) return;

        fabEl = document.createElement('button');
        fabEl.id = 'acc-fab-scan';
        fabEl.className = 'acc-fab-scan';
        fabEl.setAttribute('aria-label', 'Scanner une facture');
        fabEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M3 9h2M19 9h2M3 15h2M19 15h2M9 3v2M15 3v2M9 19v2M15 19v2"/>
        </svg>`;

        fabEl.addEventListener('click', function() {
            _haptic('medium');
            // Si on est dans la vue accounting, basculer sur l'onglet scanner
            var accView = document.getElementById('view-accounting');
            if (accView && accView.style.display !== 'none') {
                if (typeof AccountingView !== 'undefined' && AccountingView.switchToTab) {
                    AccountingView.switchToTab('scanner');
                } else {
                    // Fallback: cliquer sur l'onglet scanner
                    var scanTab = document.querySelector('.acc-tab[data-tab="scanner"]');
                    if (scanTab) scanTab.click();
                }
                // Mode fullscreen sur mobile
                setTimeout(_enterScannerFullscreen, 300);
            } else {
                // Naviguer vers accounting puis scanner
                if (typeof Sidebar !== 'undefined' && Sidebar.navigate) {
                    Sidebar.navigate('accounting');
                }
                setTimeout(function() {
                    var scanTab = document.querySelector('.acc-tab[data-tab="scanner"]');
                    if (scanTab) {
                        scanTab.click();
                        setTimeout(_enterScannerFullscreen, 300);
                    }
                }, 500);
            }
        });

        document.body.appendChild(fabEl);

        // Afficher le FAB uniquement dans la vue accounting
        _updateFabVisibility();
    }

    function _updateFabVisibility() {
        if (!fabEl) return;
        var accView = document.getElementById('view-accounting');
        var visible = accView && accView.style.display !== 'none' && isMobile;
        fabEl.style.display = visible ? 'flex' : 'none';
    }

    /* ================================================================
       SCANNER FULLSCREEN
       ================================================================ */
    function _enterScannerFullscreen() {
        var scannerEl = document.querySelector('.acc-scanner');
        if (!scannerEl || !isMobile) return;

        scannerEl.classList.add('acc-scanner-fullscreen');

        // Ajouter bouton fermer
        var existing = scannerEl.querySelector('.acc-fullscreen-close');
        if (!existing) {
            var closeBtn = document.createElement('button');
            closeBtn.className = 'acc-fullscreen-close';
            closeBtn.innerHTML = '✕';
            closeBtn.addEventListener('click', _exitScannerFullscreen);
            var header = scannerEl.querySelector('.acc-scanner-header');
            if (header) header.style.position = 'relative';
            scannerEl.insertBefore(closeBtn, scannerEl.firstChild);
        }

        // Bloquer le scroll body
        document.body.style.overflow = 'hidden';
        // Vibrer légèrement
        _haptic('light');
    }

    function _exitScannerFullscreen() {
        var scannerEl = document.querySelector('.acc-scanner');
        if (!scannerEl) return;
        scannerEl.classList.remove('acc-scanner-fullscreen');
        document.body.style.overflow = '';
    }

    /* ================================================================
       BOTTOM SHEET — Actions contextuelles
       ================================================================ */
    function _createBottomSheet() {
        if (document.getElementById('acc-bottom-sheet')) return;

        var overlay = document.createElement('div');
        overlay.className = 'acc-bottom-sheet-overlay';
        overlay.id = 'acc-bottom-sheet-overlay';
        overlay.innerHTML = `
        <div class="acc-bottom-sheet" id="acc-bottom-sheet">
            <div class="acc-sheet-handle"></div>
            <div class="acc-sheet-title" id="acc-sheet-title">Actions</div>
            <div class="acc-sheet-actions" id="acc-sheet-actions"></div>
        </div>`;

        // Fermer en cliquant sur l'overlay
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) hideBottomSheet();
        });

        // Fermer avec swipe down
        var sheet = overlay.querySelector('.acc-bottom-sheet');
        var startY = 0;
        sheet.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        sheet.addEventListener('touchend', function(e) {
            var dy = e.changedTouches[0].clientY - startY;
            if (dy > 60) hideBottomSheet();
        }, { passive: true });

        document.body.appendChild(overlay);
        bottomSheetEl = overlay;
    }

    function showBottomSheet(title, actions) {
        if (!bottomSheetEl) _createBottomSheet();
        var titleEl = document.getElementById('acc-sheet-title');
        var actionsEl = document.getElementById('acc-sheet-actions');
        if (titleEl) titleEl.textContent = title || 'Actions';
        if (actionsEl) {
            actionsEl.innerHTML = actions.map(function(a) {
                return `<button class="acc-sheet-action-btn${a.danger?' danger':''}" data-action="${a.action||''}" data-id="${a.id||''}">
                    ${a.icon ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">${a.icon}</svg>` : ''}
                    ${a.label}
                </button>`;
            }).join('');
            actionsEl.querySelectorAll('.acc-sheet-action-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    _haptic('light');
                    hideBottomSheet();
                    var action = btn.dataset.action;
                    var id = btn.dataset.id;
                    if (action && typeof AccountingView !== 'undefined') {
                        var fakeEl = document.createElement('div');
                        fakeEl.dataset.id = id;
                        if (typeof AccountingView.handleActionPublic === 'function') {
                            AccountingView.handleActionPublic(action, fakeEl);
                        }
                    }
                });
            });
        }
        // Ajouter bouton Annuler en bas
        var cancel = document.createElement('button');
        cancel.className = 'acc-sheet-action-btn';
        cancel.style.cssText = 'margin-top:8px;opacity:.6;justify-content:center;';
        cancel.textContent = 'Annuler';
        cancel.addEventListener('click', hideBottomSheet);
        actionsEl.appendChild(cancel);

        bottomSheetEl.classList.add('visible');
        _haptic('light');
    }

    function hideBottomSheet() {
        if (bottomSheetEl) bottomSheetEl.classList.remove('visible');
    }

    /* ================================================================
       SWIPE TO ACTION — Sur les lignes factures
       ================================================================ */
    function initSwipeOnRows() {
        if (!isMobile) return;
        var rows = document.querySelectorAll('.acc-inv-table-prem tbody tr');
        rows.forEach(function(row) {
            if (row.dataset.swipeInit) return;
            row.dataset.swipeInit = '1';
            _addSwipeToRow(row);
        });
    }

    function _addSwipeToRow(row) {
        var startX = 0;
        var currentX = 0;
        var isDragging = false;
        var threshold = 80;
        var id = row.querySelector('[data-id]') ? row.querySelector('[data-id]').dataset.id : null;

        row.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        row.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            currentX = e.touches[0].clientX - startX;
            // Limiter le swipe
            currentX = Math.max(-threshold * 1.2, Math.min(threshold * 1.2, currentX));
            row.style.transform = 'translateX(' + currentX + 'px)';
            row.style.transition = 'none';
        }, { passive: true });

        row.addEventListener('touchend', function() {
            isDragging = false;
            row.style.transition = 'transform .2s cubic-bezier(0.32, 0.72, 0, 1)';

            if (currentX < -threshold && id) {
                // Swipe gauche → Payer/Valider
                _haptic('medium');
                row.style.transform = 'translateX(0)';
                // Afficher confirmation
                showBottomSheet('Facture ' + (id || ''), [
                    { action: 'pay-invoice', id: id, label: 'Marquer comme payée', icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>' },
                    { action: 'send-invoice', id: id, label: 'Envoyer par email', icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' },
                    { action: 'view-invoice', id: id, label: 'Voir le détail', icon: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' },
                    { action: 'delete-invoice', id: id, label: 'Supprimer', danger: true, icon: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>' }
                ]);
            } else if (currentX > threshold && id) {
                // Swipe droite → Voir détail
                _haptic('light');
                row.style.transform = 'translateX(0)';
                var fakeEl = document.createElement('div');
                fakeEl.dataset.id = id;
                if (typeof AccountingView !== 'undefined' && AccountingView.handleActionPublic) {
                    AccountingView.handleActionPublic('view-invoice', fakeEl);
                }
            } else {
                row.style.transform = 'translateX(0)';
            }
            currentX = 0;
        }, { passive: true });
    }

    /* ================================================================
       VOICE INPUT — Mahayawen Dictée (Web Speech API)
       ================================================================ */
    function _initSpeechAPI() {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        speechRecognition = new SpeechRecognition();
        speechRecognition.lang = 'fr-FR';
        speechRecognition.continuous = false;
        speechRecognition.interimResults = true;

        speechRecognition.onresult = function(event) {
            var transcript = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (activeVoiceInput) {
                activeVoiceInput.value = transcript;
                // Si dernier résultat, classifier avec Mahayawen
                if (event.results[event.results.length - 1].isFinal) {
                    _handleVoiceComplete(transcript);
                }
            }
        };

        speechRecognition.onend = function() {
            _stopVoiceAll();
        };

        speechRecognition.onerror = function(e) {
            console.warn('[AccMobile] Speech error:', e.error);
            _stopVoiceAll();
        };
    }

    function _handleVoiceComplete(transcript) {
        // Envoyer à Mahayawen pour complétion intelligente des champs
        if (!transcript || typeof ApiAi === 'undefined') return;

        var systemPrompt = `Tu es un assistant comptable qui aide à remplir des formulaires de notes de frais.
L'utilisateur dicte une dépense. Tu extrais les informations et réponds UNIQUEMENT en JSON:
{"fournisseur":"", "montant":"", "date":"YYYY-MM-DD", "type":"expense", "notes":"", "suggested_category":""}`;

        ApiAi.generate('Dictée: ' + transcript, systemPrompt).then(function(raw) {
            try {
                var m = raw.match(/\{[\s\S]*\}/);
                if (!m) return;
                var data = JSON.parse(m[0]);
                // Remplir les champs du formulaire
                _fillFormFields(data);
                if (typeof window.showToast === 'function') {
                    window.showToast('🎙️ Mahayawen a rempli le formulaire', 'success');
                }
            } catch(e) {}
        }).catch(function() {});
    }

    function _fillFormFields(data) {
        var fields = {
            'fournisseur': data.fournisseur,
            'reference': data.reference,
            'montant_ht': data.montant,
            'date_facture': data.date,
            'notes': data.notes
        };
        Object.keys(fields).forEach(function(name) {
            if (!fields[name]) return;
            var el = document.querySelector('[name="' + name + '"]');
            if (el) el.value = fields[name];
        });
    }

    function startVoiceInput(inputEl, btnEl) {
        if (!speechRecognition) {
            if (typeof window.showToast === 'function') {
                window.showToast('Reconnaissance vocale non supportée', 'error');
            }
            return;
        }
        activeVoiceInput = inputEl;
        if (btnEl) btnEl.classList.add('recording');
        _haptic('light');
        try {
            speechRecognition.start();
        } catch(e) {
            speechRecognition.stop();
            setTimeout(function() { speechRecognition.start(); }, 200);
        }
    }

    function _stopVoiceAll() {
        activeVoiceInput = null;
        document.querySelectorAll('.acc-voice-btn.recording').forEach(function(btn) {
            btn.classList.remove('recording');
        });
    }

    /* ================================================================
       INJECT VOICE BUTTONS dans les formulaires
       ================================================================ */
    function injectVoiceButtons() {
        if (!isMobile) return;
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        // Champs texte dans les formulaires acc
        var targets = [
            { selector: '[name="fournisseur"]', label: 'Fournisseur' },
            { selector: '[name="notes"]', label: 'Notes' },
            { selector: '#acc-f-q', label: 'Recherche' }
        ];

        targets.forEach(function(t) {
            var input = document.querySelector(t.selector);
            if (!input || input.dataset.voiceInit) return;
            input.dataset.voiceInit = '1';

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'acc-voice-btn';
            btn.title = 'Dicter ' + t.label;
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>`;

            btn.addEventListener('click', function() {
                if (btn.classList.contains('recording')) {
                    speechRecognition && speechRecognition.stop();
                    _stopVoiceAll();
                } else {
                    startVoiceInput(input, btn);
                }
            });

            // Wrapper flex autour de l'input
            var parent = input.parentElement;
            if (parent) {
                var wrapper = document.createElement('div');
                wrapper.style.cssText = 'display:flex;align-items:center;gap:8px;';
                parent.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                wrapper.appendChild(btn);
            }
        });
    }

    /* ================================================================
       HAPTIC FEEDBACK
       ================================================================ */
    function _haptic(type) {
        if (!navigator.vibrate) return;
        var patterns = {
            light: [10],
            medium: [20],
            heavy: [40],
            success: [10, 50, 20],
            error: [100, 50, 100]
        };
        navigator.vibrate(patterns[type] || [10]);
    }

    /* ================================================================
       PULL TO REFRESH
       ================================================================ */
    function initPullToRefresh(container, onRefresh) {
        if (!isMobile || !container) return;
        var startY = 0;
        var pulling = false;
        var threshold = 70;
        var indicator = null;

        container.addEventListener('touchstart', function(e) {
            if (container.scrollTop === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            if (!pulling) return;
            var dy = e.touches[0].clientY - startY;
            if (dy > 0 && dy < threshold * 1.5) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);padding:8px 16px;background:rgba(0,0,0,.6);color:#fff;border-radius:0 0 8px 8px;font-size:.8rem;pointer-events:none;z-index:100;';
                    indicator.textContent = 'Tirer pour actualiser...';
                    container.style.position = 'relative';
                    container.appendChild(indicator);
                }
                var pct = Math.min(dy / threshold, 1);
                indicator.style.opacity = pct;
                indicator.textContent = dy > threshold ? '↑ Relâcher pour actualiser' : '↓ Tirer pour actualiser...';
            }
        }, { passive: true });

        container.addEventListener('touchend', function(e) {
            if (!pulling) return;
            pulling = false;
            var dy = e.changedTouches[0].clientY - startY;
            if (indicator) {
                indicator.remove();
                indicator = null;
            }
            if (dy > threshold && onRefresh) {
                _haptic('medium');
                onRefresh();
            }
        }, { passive: true });
    }

    /* ================================================================
       WATCHER — Detecte quand la vue accounting est visible
       ================================================================ */
    function _watchAccView() {
        // Observer les changements de style sur la vue accounting
        var accView = document.getElementById('view-accounting');
        if (!accView) {
            // Réessayer dans 1 seconde
            setTimeout(_watchAccView, 1000);
            return;
        }

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                if (m.attributeName === 'style' || m.attributeName === 'class') {
                    _updateFabVisibility();
                    // Réinitialiser les swipes quand le contenu change
                    setTimeout(initSwipeOnRows, 300);
                    setTimeout(injectVoiceButtons, 500);
                }
            });
        });

        observer.observe(accView, { attributes: true });

        // Observer aussi les changements de contenu dans acc-tab-content
        var contentEl = document.getElementById('acc-tab-content');
        if (contentEl) {
            var contentObserver = new MutationObserver(function() {
                setTimeout(initSwipeOnRows, 200);
                setTimeout(injectVoiceButtons, 300);
                _exitScannerFullscreen(); // Quitter fullscreen si on change d'onglet
            });
            contentObserver.observe(contentEl, { childList: true, subtree: false });
        }

        // Init initial
        _updateFabVisibility();
        setTimeout(initSwipeOnRows, 500);
        setTimeout(injectVoiceButtons, 600);
    }

    /* ================================================================
       EXPOSE API PUBLIQUE
       ================================================================ */
    return {
        init: init,
        showBottomSheet: showBottomSheet,
        hideBottomSheet: hideBottomSheet,
        initSwipeOnRows: initSwipeOnRows,
        injectVoiceButtons: injectVoiceButtons,
        initPullToRefresh: initPullToRefresh,
        startVoiceInput: startVoiceInput,
        enterScannerFullscreen: _enterScannerFullscreen,
        exitScannerFullscreen: _exitScannerFullscreen,
        haptic: _haptic,
        isMobile: function() { return isMobile; }
    };
})();

/* Auto-init sur DOMContentLoaded ou immédiatement si déjà chargé */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { AccMobile.init(); });
} else {
    setTimeout(function() { AccMobile.init(); }, 500);
}
