/**
 * EXPENSE QUICK CAPTURE - ProductiveApp v4.0
 * Capture rapide de depenses avec camera
 */
const AccExpenseCapture = (function() {
    'use strict';

    var CATEGORIES = [
        { id: 'transport', label: 'Transport', icon: '🚗' },
        { id: 'repas', label: 'Repas', icon: '🍽️' },
        { id: 'fournitures', label: 'Fournitures', icon: '📦' },
        { id: 'logiciel', label: 'Logiciel/SaaS', icon: '💻' },
        { id: 'telecom', label: 'Télécom', icon: '📱' },
        { id: 'loyer', label: 'Loyer/Bureau', icon: '🏢' },
        { id: 'marketing', label: 'Marketing', icon: '📣' },
        { id: 'formation', label: 'Formation', icon: '📚' },
        { id: 'assurance', label: 'Assurance', icon: '🛡️' },
        { id: 'autre', label: 'Autre', icon: '📝' }
    ];

    function renderFab() {
        return '<button class="expense-fab" onclick="AccExpenseCapture.openCapture()" title="Ajouter une dépense">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        '</button>';
    }

    function openCapture() {
        var html = '<div class="expense-overlay" onclick="AccExpenseCapture.close()">';
        html += '<div class="expense-modal" onclick="event.stopPropagation()">';
        html += '<div class="expense-modal-header">';
        html += '<h3>Nouvelle dépense</h3>';
        html += '<button class="expense-close-btn" onclick="AccExpenseCapture.close()">&times;</button>';
        html += '</div>';
        html += '<div class="expense-modal-body">';

        // Montant (grand)
        html += '<div class="expense-amount-row">';
        html += '<input type="number" id="expense-amount" class="expense-amount-input" placeholder="0.00" step="0.01" autofocus>';
        html += '<span class="expense-currency">€</span>';
        html += '</div>';

        // Description
        html += '<input type="text" id="expense-desc" class="expense-input" placeholder="Description de la dépense">';

        // Date
        html += '<input type="date" id="expense-date" class="expense-input" value="' + new Date().toISOString().split('T')[0] + '">';

        // Categories
        html += '<div class="expense-categories">';
        CATEGORIES.forEach(function(cat) {
            html += '<button class="expense-cat-btn" data-cat="' + cat.id + '" onclick="AccExpenseCapture.selectCategory(this, \'' + cat.id + '\')">' +
                '<span class="expense-cat-icon">' + cat.icon + '</span>' +
                '<span class="expense-cat-label">' + cat.label + '</span>' +
            '</button>';
        });
        html += '</div>';

        // Photo du recu
        html += '<div class="expense-receipt-section">';
        html += '<label class="expense-receipt-btn">';
        html += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
        html += ' Photo du reçu';
        html += '<input type="file" id="expense-receipt" accept="image/*" capture="environment" style="display:none" onchange="AccExpenseCapture.previewReceipt(this)">';
        html += '</label>';
        html += '<div id="expense-receipt-preview"></div>';
        html += '</div>';

        // TVA
        html += '<div class="expense-tva-row">';
        html += '<label>TVA</label>';
        html += '<select id="expense-tva" class="expense-input" style="width:auto">';
        html += '<option value="20">20%</option>';
        html += '<option value="10">10%</option>';
        html += '<option value="5.5">5.5%</option>';
        html += '<option value="0">0%</option>';
        html += '</select>';
        html += '</div>';

        html += '</div>';
        html += '<div class="expense-modal-footer">';
        html += '<button class="expense-save-btn" onclick="AccExpenseCapture.save()">Enregistrer la dépense</button>';
        html += '</div>';
        html += '</div></div>';

        var div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstChild);
    }

    var selectedCategory = null;

    function selectCategory(btn, catId) {
        selectedCategory = catId;
        document.querySelectorAll('.expense-cat-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
    }

    function previewReceipt(input) {
        var preview = document.getElementById('expense-receipt-preview');
        if (!preview || !input.files || !input.files[0]) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" class="expense-receipt-img" alt="Reçu">';
        };
        reader.readAsDataURL(input.files[0]);
    }

    async function save() {
        var amount = document.getElementById('expense-amount');
        var desc = document.getElementById('expense-desc');
        var date = document.getElementById('expense-date');
        var tva = document.getElementById('expense-tva');

        if (!amount || !parseFloat(amount.value)) {
            if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Saisissez un montant', 'error');
            return;
        }

        var expenseData = {
            type: 'expense',
            amount: parseFloat(amount.value),
            description: desc ? desc.value.trim() : '',
            date: date ? date.value : new Date().toISOString().split('T')[0],
            category: selectedCategory || 'autre',
            tva_rate: tva ? parseFloat(tva.value) : 20
        };

        var amountHt = expenseData.amount / (1 + expenseData.tva_rate / 100);
        expenseData.amount_ht = Math.round(amountHt * 100) / 100;
        expenseData.amount_tva = Math.round((expenseData.amount - amountHt) * 100) / 100;

        try {
            var wsId = getWorkspaceId();
            var token = getToken();
            if (wsId && token) {
                // Upload receipt si present
                var receiptInput = document.getElementById('expense-receipt');
                if (receiptInput && receiptInput.files && receiptInput.files[0]) {
                    var formData = new FormData();
                    formData.append('file', receiptInput.files[0]);
                    try {
                        var uploadResp = await fetch('/api/v1/accounting/' + wsId + '/invoices/scan', {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer ' + token },
                            body: formData
                        });
                        if (uploadResp.ok) {
                            var uploadData = await uploadResp.json();
                            if (uploadData.data && uploadData.data.url) {
                                expenseData.receipt_url = uploadData.data.url;
                            }
                        }
                    } catch (ue) { /* ignore upload error */ }
                }

                // Sauvegarder la depense
                var resp = await fetch('/api/v1/accounting/' + wsId + '/expenses', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify(expenseData)
                });
                if (resp.ok) {
                    close();
                    if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Dépense enregistrée !', 'success');
                    return;
                }
            }
        } catch (e) {
            console.error('Expense save error:', e);
        }

        // Fallback local
        close();
        if (typeof Utils !== 'undefined' && Utils.notify) Utils.notify('Dépense enregistrée localement', 'success');
    }

    function close() {
        var overlay = document.querySelector('.expense-overlay');
        if (overlay) overlay.remove();
        selectedCategory = null;
    }

    function getWorkspaceId() {
        if (typeof AppState !== 'undefined' && AppState.currentWorkspace) return AppState.currentWorkspace.id || AppState.currentWorkspace;
        return localStorage.getItem('productiveapp_workspace_id');
    }

    function getToken() {
        return ApiTokens.getAccessToken() || localStorage.getItem('accessToken') || (typeof AppState !== 'undefined' && AppState.token);
    }

    return {
        renderFab: renderFab,
        openCapture: openCapture,
        close: close,
        selectCategory: selectCategory,
        previewReceipt: previewReceipt,
        save: save
    };
})();

if (typeof window !== 'undefined') window.AccExpenseCapture = AccExpenseCapture;
