/**
 * DEVIS / QUOTES - ProductiveApp v4.0
 * Gestion des devis avec conversion en facture
 */
const AccQuotes = (function() {
    'use strict';

    var quotes = [];
    var currentQuote = null;

    var STATUS_LABELS = {
        draft: { label: 'Brouillon', color: '#6b7280', icon: '📝' },
        sent: { label: 'Envoyé', color: '#3b82f6', icon: '📤' },
        accepted: { label: 'Accepté', color: '#10b981', icon: '✅' },
        refused: { label: 'Refusé', color: '#ef4444', icon: '❌' },
        expired: { label: 'Expiré', color: '#9ca3af', icon: '⏰' }
    };

    async function loadQuotes() {
        try {
            var wsId = getWorkspaceId();
            var token = getToken();
            if (!wsId || !token) return;
            var resp = await fetch('/api/v1/accounting/' + wsId + '/documents?type=quote', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resp.ok) {
                var data = await resp.json();
                quotes = data.data || data || [];
            }
        } catch (e) {
            console.error('AccQuotes load error:', e);
        }
    }

    function render() {
        var html = '<div class="acc-quotes-container">';
        html += '<div class="acc-quotes-header">';
        html += '<h3>Devis & Propositions</h3>';
        html += '<button class="acc-quotes-new-btn" onclick="AccQuotes.showCreateForm()">+ Nouveau devis</button>';
        html += '</div>';

        // Stats
        var stats = getStats();
        html += '<div class="acc-quotes-stats">';
        html += renderStat('Total', quotes.length, 'var(--text)');
        html += renderStat('En attente', stats.pending, '#3b82f6');
        html += renderStat('Acceptés', stats.accepted, '#10b981');
        html += renderStat('Montant total', formatCurrency(stats.totalAmount), 'var(--accent)');
        html += '</div>';

        // Liste
        html += '<div class="acc-quotes-list">';
        if (!quotes.length) {
            html += '<div class="acc-quotes-empty">';
            html += '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
            html += '<p>Aucun devis créé</p>';
            html += '<button class="acc-quotes-new-btn" onclick="AccQuotes.showCreateForm()">Créer votre premier devis</button>';
            html += '</div>';
        } else {
            quotes.forEach(function(q) {
                html += renderQuoteCard(q);
            });
        }
        html += '</div></div>';
        return html;
    }

    function renderQuoteCard(q) {
        var statusInfo = STATUS_LABELS[q.status] || STATUS_LABELS.draft;
        var clientName = q.client_name || q.contact_name || 'Client inconnu';
        var amount = q.total_ttc || q.total || q.amount || 0;
        var date = q.created_at ? new Date(q.created_at).toLocaleDateString('fr-FR') : '';
        var validUntil = q.valid_until ? new Date(q.valid_until).toLocaleDateString('fr-FR') : '';

        var html = '<div class="acc-quote-card" onclick="AccQuotes.showDetail(\'' + q.id + '\')">';
        html += '<div class="acc-quote-card-header">';
        html += '<div class="acc-quote-ref">' + escHtml(q.reference || q.number || 'D-' + String(q.id).substring(0, 8)) + '</div>';
        html += '<span class="acc-quote-status" style="background:' + statusInfo.color + '">' + statusInfo.label + '</span>';
        html += '</div>';
        html += '<div class="acc-quote-client">' + escHtml(clientName) + '</div>';
        html += '<div class="acc-quote-details">';
        html += '<span class="acc-quote-amount">' + formatCurrency(amount) + '</span>';
        if (date) html += '<span class="acc-quote-date">' + date + '</span>';
        if (validUntil) html += '<span class="acc-quote-validity">Valide jusqu\'au ' + validUntil + '</span>';
        html += '</div>';
        html += '<div class="acc-quote-actions">';
        if (q.status === 'draft' || q.status === 'sent') {
            html += '<button class="acc-quote-action-btn" onclick="event.stopPropagation();AccQuotes.convertToInvoice(\'' + q.id + '\')">Convertir en facture</button>';
        }
        html += '<button class="acc-quote-action-btn secondary" onclick="event.stopPropagation();AccQuotes.duplicateQuote(\'' + q.id + '\')">Dupliquer</button>';
        html += '</div></div>';
        return html;
    }

    function renderStat(label, value, color) {
        return '<div class="acc-quote-stat"><div class="acc-quote-stat-value" style="color:' + color + '">' + value + '</div><div class="acc-quote-stat-label">' + label + '</div></div>';
    }

    function getStats() {
        var s = { pending: 0, accepted: 0, refused: 0, totalAmount: 0 };
        quotes.forEach(function(q) {
            if (q.status === 'sent' || q.status === 'draft') s.pending++;
            if (q.status === 'accepted') s.accepted++;
            if (q.status === 'refused') s.refused++;
            s.totalAmount += parseFloat(q.total_ttc || q.total || q.amount || 0);
        });
        return s;
    }

    function showCreateForm() {
        var html = '<div class="acc-quotes-overlay" onclick="AccQuotes.closeForm()">';
        html += '<div class="acc-quotes-form-modal" onclick="event.stopPropagation()">';
        html += '<div class="acc-quotes-form-header"><h3>Nouveau devis</h3><button onclick="AccQuotes.closeForm()">&times;</button></div>';
        html += '<div class="acc-quotes-form-body">';
        html += '<div class="acc-form-group"><label>Client</label><input type="text" id="quote-client" placeholder="Nom du client" class="acc-form-input"></div>';
        html += '<div class="acc-form-group"><label>Objet</label><input type="text" id="quote-subject" placeholder="Objet du devis" class="acc-form-input"></div>';
        html += '<div class="acc-form-row">';
        html += '<div class="acc-form-group"><label>Validité (jours)</label><input type="number" id="quote-validity" value="30" class="acc-form-input"></div>';
        html += '<div class="acc-form-group"><label>Conditions</label><select id="quote-payment-terms" class="acc-form-input"><option value="30">30 jours</option><option value="15">15 jours</option><option value="0">Comptant</option><option value="60">60 jours</option></select></div>';
        html += '</div>';

        // Lignes du devis
        html += '<div class="acc-form-group"><label>Lignes du devis</label>';
        html += '<div id="quote-lines">';
        html += renderQuoteLine(0);
        html += '</div>';
        html += '<button class="acc-quote-add-line-btn" onclick="AccQuotes.addLine()">+ Ajouter une ligne</button>';
        html += '</div>';

        html += '<div class="acc-form-group"><label>Notes</label><textarea id="quote-notes" placeholder="Conditions particulières..." class="acc-form-input" rows="3"></textarea></div>';

        html += '<div class="acc-quotes-form-footer">';
        html += '<button class="acc-btn secondary" onclick="AccQuotes.closeForm()">Annuler</button>';
        html += '<button class="acc-btn primary" onclick="AccQuotes.saveQuote(\'draft\')">Sauvegarder brouillon</button>';
        html += '<button class="acc-btn accent" onclick="AccQuotes.saveQuote(\'sent\')">Envoyer</button>';
        html += '</div></div></div></div>';

        var div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstChild);
    }

    var lineCount = 1;

    function renderQuoteLine(idx) {
        return '<div class="acc-quote-line" data-line="' + idx + '">' +
            '<input type="text" placeholder="Description" class="acc-form-input quote-line-desc">' +
            '<input type="number" placeholder="Qté" value="1" class="acc-form-input quote-line-qty" style="width:70px">' +
            '<input type="number" placeholder="Prix HT" class="acc-form-input quote-line-price" style="width:100px">' +
            '<select class="acc-form-input quote-line-tva" style="width:80px"><option value="20">20%</option><option value="10">10%</option><option value="5.5">5.5%</option><option value="0">0%</option></select>' +
            '<button class="acc-quote-remove-line" onclick="this.parentElement.remove()">&times;</button>' +
        '</div>';
    }

    function addLine() {
        var container = document.getElementById('quote-lines');
        if (!container) return;
        var div = document.createElement('div');
        div.innerHTML = renderQuoteLine(lineCount++);
        container.appendChild(div.firstChild);
    }

    async function saveQuote(status) {
        var client = document.getElementById('quote-client');
        var subject = document.getElementById('quote-subject');
        var validity = document.getElementById('quote-validity');
        var notes = document.getElementById('quote-notes');
        var terms = document.getElementById('quote-payment-terms');

        if (!client || !client.value.trim()) {
            if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Veuillez saisir un client', 'error');
            return;
        }

        var lines = [];
        document.querySelectorAll('.acc-quote-line').forEach(function(el) {
            var desc = el.querySelector('.quote-line-desc');
            var qty = el.querySelector('.quote-line-qty');
            var price = el.querySelector('.quote-line-price');
            var tva = el.querySelector('.quote-line-tva');
            if (desc && desc.value.trim() && price && price.value) {
                lines.push({
                    description: desc.value.trim(),
                    quantity: parseFloat(qty ? qty.value : 1) || 1,
                    unit_price: parseFloat(price.value) || 0,
                    tva_rate: parseFloat(tva ? tva.value : 20) || 20
                });
            }
        });

        if (!lines.length) {
            if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Ajoutez au moins une ligne', 'error');
            return;
        }

        var totalHt = 0, totalTva = 0;
        lines.forEach(function(l) {
            var ht = l.quantity * l.unit_price;
            totalHt += ht;
            totalTva += ht * (l.tva_rate / 100);
        });

        var validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (parseInt(validity ? validity.value : 30) || 30));

        var quoteData = {
            type: 'quote',
            client_name: client.value.trim(),
            subject: subject ? subject.value.trim() : '',
            status: status,
            items: lines,
            total_ht: totalHt,
            total_tva: totalTva,
            total_ttc: totalHt + totalTva,
            valid_until: validUntil.toISOString(),
            payment_terms: terms ? parseInt(terms.value) : 30,
            notes: notes ? notes.value.trim() : ''
        };

        try {
            var wsId = getWorkspaceId();
            var token = getToken();
            if (wsId && token) {
                var resp = await fetch('/api/v1/accounting/' + wsId + '/documents', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify(quoteData)
                });
                if (resp.ok) {
                    var data = await resp.json();
                    quotes.unshift(data.data || data);
                }
            }
        } catch (e) {
            // Sauvegarde locale en fallback
            quoteData.id = 'local-' + Date.now();
            quoteData.created_at = new Date().toISOString();
            quotes.unshift(quoteData);
        }

        closeForm();
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify('Devis ' + (status === 'sent' ? 'envoyé' : 'sauvegardé'), 'success');
        }
        // Re-render si dans la vue compta
        if (typeof AccountingView !== 'undefined' && AccountingView.refresh) {
            AccountingView.refresh();
        }
    }

    async function convertToInvoice(quoteId) {
        var quote = quotes.find(function(q) { return q.id === quoteId; });
        if (!quote) return;

        try {
            var wsId = getWorkspaceId();
            var token = getToken();
            if (wsId && token) {
                var resp = await fetch('/api/v1/accounting/' + wsId + '/documents/' + quoteId + '/convert', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target_type: 'invoice' })
                });
                if (resp.ok) {
                    quote.status = 'accepted';
                    if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Devis converti en facture !', 'success');
                    return;
                }
            }
        } catch (e) {
            console.error('Convert to invoice error:', e);
        }
        // Fallback : marquer comme accepte
        quote.status = 'accepted';
        if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Devis marqué comme accepté', 'success');
    }

    function duplicateQuote(quoteId) {
        var quote = quotes.find(function(q) { return q.id === quoteId; });
        if (!quote) return;
        var dup = JSON.parse(JSON.stringify(quote));
        dup.id = 'dup-' + Date.now();
        dup.status = 'draft';
        dup.created_at = new Date().toISOString();
        dup.reference = (dup.reference || '') + ' (copie)';
        quotes.unshift(dup);
        if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Devis dupliqué', 'success');
    }

    function showDetail(quoteId) {
        currentQuote = quotes.find(function(q) { return q.id === quoteId; });
        if (!currentQuote) return;
        // Pour l'instant, affiche les infos dans une notification
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify('Devis : ' + (currentQuote.client_name || '') + ' — ' + formatCurrency(currentQuote.total_ttc || 0), 'info');
        }
    }

    function closeForm() {
        var overlay = document.querySelector('.acc-quotes-overlay');
        if (overlay) overlay.remove();
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    }

    function escHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function getWorkspaceId() {
        if (typeof AppState !== 'undefined' && AppState.currentWorkspace) return AppState.currentWorkspace.id || AppState.currentWorkspace;
        return localStorage.getItem('productiveapp_workspace_id');
    }

    function getToken() {
        return ApiTokens.getAccessToken() || localStorage.getItem('accessToken') || (typeof AppState !== 'undefined' && AppState.token);
    }

    return {
        loadQuotes: loadQuotes,
        render: render,
        showCreateForm: showCreateForm,
        closeForm: closeForm,
        addLine: addLine,
        saveQuote: saveQuote,
        convertToInvoice: convertToInvoice,
        duplicateQuote: duplicateQuote,
        showDetail: showDetail
    };
})();

if (typeof window !== 'undefined') window.AccQuotes = AccQuotes;
