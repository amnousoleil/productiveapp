/**
 * AccScanner - FinScan: Capture camera + extraction IA de factures
 * Feature hero du module comptabilite
 */
const AccScanner = (function() {
    'use strict';
    const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    let currentFile = null;
    let batchMode = false;
    let batchQueue = [];
    let batchResults = [];
    let extractionData = null;
    let categories = [];

    function render(container) {
        container.innerHTML = `
        <div class="acc-scanner">
            <div class="acc-scanner-header">
                <h2>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M3 15h2M19 15h2M9 3v2M15 3v2M9 19v2M15 19v2"/></svg>
                    FinScan - Scanner Intelligent
                </h2>
                <label class="acc-toggle">
                    <input type="checkbox" id="acc-batch-toggle" ${batchMode ? 'checked' : ''}>
                    <span class="acc-toggle-slider"></span>
                    Mode batch
                </label>
            </div>

            <div id="acc-scan-zone" class="acc-scan-zone">
                <div class="acc-scan-dropzone" id="acc-dropzone">
                    <div class="acc-scan-camera-btn" id="acc-camera-btn">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                    <p class="acc-scan-text">Prenez en photo votre facture</p>
                    <p class="acc-scan-subtext">ou glissez un fichier ici (JPEG, PNG, PDF)</p>
                    <input type="file" id="acc-file-input" accept="image/*,application/pdf" capture="environment" style="display:none" ${batchMode ? 'multiple' : ''}>
                </div>
            </div>

            <div id="acc-preview-zone" class="acc-preview-zone" style="display:none">
                <div class="acc-preview-img-container">
                    <img id="acc-preview-img" src="" alt="Apercu facture">
                </div>
                <div class="acc-preview-actions">
                    <button class="acc-btn secondary" id="acc-scan-cancel">Annuler</button>
                    <button class="acc-btn primary" id="acc-scan-analyze">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Analyser avec l'IA
                    </button>
                </div>
            </div>

            <div id="acc-loading-zone" class="acc-scan-loading" style="display:none">
                <div class="acc-spinner-large"></div>
                <p>Analyse IA en cours...</p>
                <p class="acc-scan-subtext">GPT-4 Vision extrait les donnees de votre facture</p>
            </div>

            <div id="acc-result-zone" class="acc-result-zone" style="display:none"></div>

            <div id="acc-batch-zone" class="acc-batch-zone" style="display:${batchMode ? 'block' : 'none'}">
                <h3>File d'attente <span id="acc-batch-count">${batchQueue.length} fichier(s)</span></h3>
                <div id="acc-batch-list" class="acc-batch-list"></div>
                <button class="acc-btn primary" id="acc-batch-process" ${batchQueue.length === 0 ? 'disabled' : ''}>Traiter toutes les factures</button>
            </div>
        </div>`;

        bindEvents(container);
    }

    function bindEvents(container) {
        const fileInput = document.getElementById('acc-file-input');
        const cameraBtn = document.getElementById('acc-camera-btn');
        const dropzone = document.getElementById('acc-dropzone');
        const batchToggle = document.getElementById('acc-batch-toggle');
        const cancelBtn = document.getElementById('acc-scan-cancel');
        const analyzeBtn = document.getElementById('acc-scan-analyze');
        const batchProcessBtn = document.getElementById('acc-batch-process');

        if (cameraBtn) cameraBtn.onclick = () => fileInput && fileInput.click();
        if (dropzone) {
            dropzone.onclick = (e) => { if (e.target === dropzone || dropzone.contains(e.target)) fileInput && fileInput.click(); };
            dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
            dropzone.ondragleave = () => dropzone.classList.remove('dragover');
            dropzone.ondrop = (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); };
        }
        if (fileInput) fileInput.onchange = (e) => handleFiles(e.target.files);
        if (batchToggle) batchToggle.onchange = (e) => { batchMode = e.target.checked; render(container); };
        if (cancelBtn) cancelBtn.onclick = () => resetScan(container);
        if (analyzeBtn) analyzeBtn.onclick = () => analyzeInvoice(container);
        if (batchProcessBtn) batchProcessBtn.onclick = () => processBatch(container);

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'save-invoice') saveExtractedInvoice(container);
            if (action === 'scan-next') resetScan(container);
        });
    }

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        if (batchMode) {
            for (let i = 0; i < files.length; i++) {
                batchQueue.push(files[i]);
            }
            renderBatchList();
            return;
        }
        currentFile = files[0];
        showPreview();
    }

    function showPreview() {
        if (!currentFile) return;
        document.getElementById('acc-scan-zone').style.display = 'none';
        document.getElementById('acc-preview-zone').style.display = 'flex';
        const img = document.getElementById('acc-preview-img');
        if (currentFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(currentFile);
        } else {
            img.src = '';
            img.alt = currentFile.name + ' (PDF)';
        }
    }

    async function analyzeInvoice(container) {
        if (!currentFile) return;
        document.getElementById('acc-preview-zone').style.display = 'none';
        document.getElementById('acc-loading-zone').style.display = 'flex';

        try {
            const formData = new FormData();
            formData.append('image', currentFile);
            const result = await AccountingApi.scanInvoice(formData);
            extractionData = result;
            showExtractionResults(container);
        } catch (e) {
            console.error('Scan error:', e);
            document.getElementById('acc-loading-zone').style.display = 'none';
            document.getElementById('acc-scan-zone').style.display = 'block';
            alert('Erreur lors de l\'analyse: ' + (e.message || 'Erreur inconnue'));
        }
    }

    function showExtractionResults(container) {
        document.getElementById('acc-loading-zone').style.display = 'none';
        const zone = document.getElementById('acc-result-zone');
        zone.style.display = 'block';

        const inv = extractionData?.invoice || {};
        const ext = extractionData?.extraction || {};
        const confidence = ext.confidence || 0;
        const confClass = confidence >= 85 ? 'high' : confidence >= 60 ? 'medium' : 'low';
        const confLabel = confidence >= 85 ? 'Confiance elevee' : confidence >= 60 ? 'A verifier' : 'Saisie requise';
        const cats = AccState.getState().categories || [];

        zone.innerHTML = `
        <div class="acc-extraction">
            <div class="acc-confidence-bar">
                <div class="acc-confidence-fill ${confClass}" style="width:${confidence}%"></div>
                <span class="acc-confidence-label">${confidence}% - ${confLabel}</span>
            </div>

            <form id="acc-extraction-form" class="acc-form">
                <div class="acc-form-row">
                    <div class="acc-form-group">
                        <label>Fournisseur ${confidenceDot(inv.fournisseur)}</label>
                        <input type="text" name="fournisseur" value="${escHtml(inv.fournisseur || '')}" required>
                    </div>
                    <div class="acc-form-group">
                        <label>Reference</label>
                        <input type="text" name="reference" value="${escHtml(inv.reference || '')}">
                    </div>
                </div>
                <div class="acc-form-row">
                    <div class="acc-form-group">
                        <label>Date facture ${confidenceDot(inv.date_facture)}</label>
                        <input type="date" name="date_facture" value="${inv.date_facture || new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="acc-form-group">
                        <label>Date echeance</label>
                        <input type="date" name="date_echeance" value="${inv.date_echeance || ''}">
                    </div>
                </div>
                <div class="acc-form-row thirds">
                    <div class="acc-form-group">
                        <label>Montant HT ${confidenceDot(inv.montant_ht)}</label>
                        <input type="number" name="montant_ht" value="${inv.montant_ht || 0}" step="0.01" required>
                    </div>
                    <div class="acc-form-group">
                        <label>Taux TVA</label>
                        <select name="tva_rate">
                            <option value="20" ${(inv.tva_rate || 20) == 20 ? 'selected' : ''}>20%</option>
                            <option value="10" ${inv.tva_rate == 10 ? 'selected' : ''}>10%</option>
                            <option value="5.5" ${inv.tva_rate == 5.5 ? 'selected' : ''}>5.5%</option>
                            <option value="0" ${inv.tva_rate == 0 ? 'selected' : ''}>0%</option>
                        </select>
                    </div>
                    <div class="acc-form-group">
                        <label>Montant TTC</label>
                        <input type="number" name="montant_ttc" value="${inv.montant_ttc || 0}" step="0.01" readonly>
                    </div>
                </div>
                <div class="acc-form-row">
                    <div class="acc-form-group">
                        <label>Type</label>
                        <select name="type">
                            <option value="expense" selected>Depense</option>
                            <option value="income">Revenu</option>
                        </select>
                    </div>
                    <div class="acc-form-group">
                        <label>Categorie ${ext.suggested_category ? '<span class="acc-ai-suggest">IA: ' + ext.suggested_category + '</span>' : ''}</label>
                        <select name="category_id">
                            <option value="">-- Choisir --</option>
                            ${cats.map(c => `<option value="${c.id}" ${c.slug === ext.suggested_category ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="acc-form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="2" placeholder="Notes optionnelles...">${inv.notes || ''}</textarea>
                </div>
                <div class="acc-form-actions">
                    <button type="button" class="acc-btn primary" data-action="save-invoice">Valider et sauvegarder</button>
                    <button type="button" class="acc-btn secondary" data-action="scan-next">Scanner suivante</button>
                </div>
            </form>
        </div>`;

        // Auto-calc TTC when HT or TVA changes
        const form = document.getElementById('acc-extraction-form');
        if (form) {
            const calcTTC = () => {
                const ht = parseFloat(form.montant_ht.value) || 0;
                const rate = parseFloat(form.tva_rate.value) || 0;
                form.montant_ttc.value = (ht * (1 + rate / 100)).toFixed(2);
            };
            form.montant_ht.addEventListener('input', calcTTC);
            form.tva_rate.addEventListener('change', calcTTC);
        }
    }

    function confidenceDot(value) {
        if (value && value !== '' && value !== '0' && value !== 0) {
            return '<span class="acc-conf-dot high" title="Detecte par l\'IA"></span>';
        }
        return '<span class="acc-conf-dot low" title="Non detecte"></span>';
    }

    async function saveExtractedInvoice(container) {
        const form = document.getElementById('acc-extraction-form');
        if (!form) return;
        const ht = parseFloat(form.montant_ht.value) || 0;
        const rate = parseFloat(form.tva_rate.value) || 20;
        const tva = ht * rate / 100;
        const ttc = ht + tva;

        const data = {
            type: form.type.value,
            fournisseur: form.fournisseur.value,
            reference: form.reference.value || undefined,
            montant_ht: ht,
            montant_tva: parseFloat(tva.toFixed(2)),
            montant_ttc: parseFloat(ttc.toFixed(2)),
            tva_rate: rate,
            date_facture: form.date_facture.value,
            date_echeance: form.date_echeance.value || undefined,
            category_id: form.category_id.value || undefined,
            notes: form.notes.value || undefined,
            source: 'scan'
        };

        try {
            await AccountingApi.createInvoice(data);
            showToast('Facture enregistree avec succes !', 'success');
            resetScan(container);
        } catch (e) {
            console.error('Save error:', e);
            alert('Erreur: ' + (e.message || 'Impossible de sauvegarder'));
        }
    }

    function resetScan(container) {
        currentFile = null;
        extractionData = null;
        render(container);
    }

    function renderBatchList() {
        const list = document.getElementById('acc-batch-list');
        const count = document.getElementById('acc-batch-count');
        if (count) count.textContent = batchQueue.length + ' fichier(s)';
        if (!list) return;
        list.innerHTML = batchQueue.map((f, i) => `
            <div class="acc-batch-item">
                <span class="acc-batch-name">${escHtml(f.name)}</span>
                <span class="acc-batch-size">${(f.size / 1024).toFixed(0)} Ko</span>
                <span class="acc-batch-status" id="acc-batch-status-${i}">En attente</span>
            </div>
        `).join('');
        const btn = document.getElementById('acc-batch-process');
        if (btn) btn.disabled = batchQueue.length === 0;
    }

    async function processBatch(container) {
        batchResults = [];
        for (let i = 0; i < batchQueue.length; i++) {
            const statusEl = document.getElementById('acc-batch-status-' + i);
            if (statusEl) { statusEl.textContent = 'Analyse...'; statusEl.className = 'acc-batch-status processing'; }
            try {
                const formData = new FormData();
                formData.append('image', batchQueue[i]);
                const result = await AccountingApi.scanInvoice(formData);
                batchResults.push({ success: true, data: result, file: batchQueue[i].name });
                if (statusEl) { statusEl.textContent = 'OK'; statusEl.className = 'acc-batch-status success'; }
            } catch (e) {
                batchResults.push({ success: false, error: e.message, file: batchQueue[i].name });
                if (statusEl) { statusEl.textContent = 'Erreur'; statusEl.className = 'acc-batch-status error'; }
            }
        }
        const ok = batchResults.filter(r => r.success).length;
        showToast(`Batch termine: ${ok}/${batchQueue.length} factures traitees`, ok === batchQueue.length ? 'success' : 'warning');
        batchQueue = [];
    }

    function showToast(msg, type) {
        if (typeof window.showToast === 'function') { window.showToast(msg, type); return; }
        const t = document.createElement('div');
        t.className = 'acc-toast ' + (type || 'info');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
    }

    function escHtml(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    async function refresh(container) {
        try { categories = await AccountingApi.getCategories(); AccState.setState('categories', Array.isArray(categories) ? categories : []); } catch(e) {}
        render(container);
    }

    return { render, refresh };
})();
