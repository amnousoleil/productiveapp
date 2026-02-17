/**
 * AccDocuments - Devis (Quotes) et Avoirs (Credit Notes) Management
 * ProductiveApp Accounting
 * @version 1.0.0
 */
const AccDocuments = (function() {
    'use strict';

    const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    const DATEFMT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const QUOTE_STATUS = {
        draft:     { label: 'Brouillon',    color: 'var(--text-secondary)', bg: 'rgba(128,128,128,.12)' },
        sent:      { label: 'Envoye',       color: '#8b5cf6',              bg: 'rgba(139,92,246,.12)' },
        accepted:  { label: 'Accepte',      color: 'var(--success-color)', bg: 'rgba(34,197,94,.12)' },
        rejected:  { label: 'Refuse',       color: 'var(--danger-color)',  bg: 'rgba(239,68,68,.12)' },
        expired:   { label: 'Expire',       color: 'var(--warning-color)', bg: 'rgba(245,158,11,.12)' },
        converted: { label: 'Converti',     color: '#059669',              bg: 'rgba(5,150,105,.12)' }
    };

    const CREDIT_STATUS = {
        draft:     { label: 'Brouillon', color: 'var(--text-secondary)', bg: 'rgba(128,128,128,.12)' },
        validated: { label: 'Valide',    color: 'var(--success-color)',  bg: 'rgba(34,197,94,.12)' },
        applied:   { label: 'Applique',  color: '#059669',              bg: 'rgba(5,150,105,.12)' },
        cancelled: { label: 'Annule',    color: 'var(--danger-color)',  bg: 'rgba(239,68,68,.12)' }
    };

    const TVA_RATES = [
        { value: 0, label: '0%' }, { value: 5.5, label: '5,5%' },
        { value: 10, label: '10%' }, { value: 20, label: '20%' }
    ];

    var SS = 'padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);font-size:.85rem;';
    var IS = SS + 'box-sizing:border-box;';
    var THS = 'padding:8px 10px;text-align:left;font-weight:600;color:var(--text-secondary);font-size:.8rem;white-space:nowrap;';
    var TDS = 'padding:10px;color:var(--text-primary);';

    function _abtn(c) { return 'padding:3px 8px;border:1px solid '+c+';border-radius:4px;background:transparent;color:'+c+';cursor:pointer;font-size:.75rem;white-space:nowrap;'; }
    function _mbtn(c) { return 'padding:8px 18px;border:1px solid '+c+';border-radius:8px;background:transparent;cursor:pointer;font-weight:600;font-size:.9rem;color:'+c+';'; }

    var _ctn = null, _activeTab = 'quotes';

    /* ==================== RENDER ==================== */
    function render(container) {
        _ctn = container;
        _ctn.innerHTML = '';
        _ctn.appendChild(_tabBar());
        var content = _mk('div'); content.id = 'acc-doc-content';
        _ctn.appendChild(content);
        _renderActiveTab();
    }

    /* ==================== SUB-TABS ==================== */
    function _tabBar() {
        var d = _mk('div');
        d.style.cssText = 'display:flex;gap:0;border-bottom:2px solid var(--border-color);margin-bottom:16px;';
        d.innerHTML =
            '<button class="acc-doc-tab" data-tab="quotes" style="'+_tabS(true)+'">Devis</button>' +
            '<button class="acc-doc-tab" data-tab="credits" style="'+_tabS(false)+'">Avoirs</button>';
        d.querySelectorAll('.acc-doc-tab').forEach(function(btn){
            btn.onclick = function(){
                _activeTab = btn.getAttribute('data-tab');
                d.querySelectorAll('.acc-doc-tab').forEach(function(b){
                    b.style.cssText = _tabS(b.getAttribute('data-tab')===_activeTab);
                });
                _renderActiveTab();
            };
        });
        return d;
    }

    function _tabS(active) {
        return 'padding:10px 24px;border:none;border-bottom:2px solid '+(active?'var(--accent-primary)':'transparent')+
            ';background:transparent;color:'+(active?'var(--accent-primary)':'var(--text-secondary)')+
            ';cursor:pointer;font-weight:600;font-size:.95rem;margin-bottom:-2px;transition:all .2s;';
    }

    function _renderActiveTab() {
        var w = _ctn.querySelector('#acc-doc-content');
        w.innerHTML = '';
        if (_activeTab === 'quotes') _renderQuotes(w);
        else _renderCredits(w);
    }

    /* ==================== QUOTES (DEVIS) ==================== */
    async function _renderQuotes(w) {
        var hdr = _mk('div');
        hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;';
        hdr.innerHTML = '<h3 style="margin:0;color:var(--text-primary)">Devis</h3>' +
            '<button id="acc-doc-newq" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">+ Nouveau devis</button>';
        hdr.querySelector('#acc-doc-newq').onclick = function(){ _quoteForm(null); };
        w.appendChild(hdr);

        var tw = _mk('div'); tw.id = 'acc-doc-qtw';
        tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Chargement des devis...</div>';
        w.appendChild(tw);

        try {
            var res = await AccountingApi.getQuotes();
            var quotes = res.data || res.quotes || res || [];
            if (!Array.isArray(quotes)) quotes = [];
            _renderQuoteTable(quotes, tw);
        } catch(err) {
            tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger-color)">Erreur : '+_e(err.message)+'</div>';
        }
    }

    function _renderQuoteTable(quotes, tw) {
        if (!quotes.length) {
            tw.innerHTML = '<div style="text-align:center;padding:50px 20px">' +
                '<div style="font-size:3rem;margin-bottom:12px;opacity:.5">&#128221;</div>' +
                '<h3 style="color:var(--text-primary);margin:0 0 8px">Aucun devis</h3>' +
                '<p style="color:var(--text-secondary);margin:0">Creez votre premier devis pour demarrer.</p></div>';
            return;
        }

        var h = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.9rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'">Date</th><th style="'+THS+'">N&deg; Devis</th>' +
            '<th style="'+THS+'">Client</th><th style="'+THS+'text-align:right">Montant TTC</th>' +
            '<th style="'+THS+'">Statut</th><th style="'+THS+'">Actions</th></tr></thead><tbody>';

        quotes.forEach(function(q) {
            var st = QUOTE_STATUS[q.status] || QUOTE_STATUS.draft;
            var dt = q.date ? DATEFMT.format(new Date(q.date)) : '-';
            h += '<tr data-id="'+q.id+'" style="border-bottom:1px solid var(--border-color)">' +
                '<td style="'+TDS+'">'+dt+'</td>' +
                '<td style="'+TDS+'font-family:monospace">'+_e(q.reference||'-')+'</td>' +
                '<td style="'+TDS+'">'+_e(q.client_name||q.contact_name||'-')+'</td>' +
                '<td style="'+TDS+'text-align:right;font-family:monospace;font-weight:600">'+EUR.format(q.total_ttc||0)+'</td>' +
                '<td style="'+TDS+'"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.8rem;font-weight:600;color:'+st.color+';background:'+st.bg+'">'+st.label+'</span></td>' +
                '<td style="'+TDS+'">'+_quoteActs(q)+'</td></tr>';
        });

        h += '</tbody></table></div>';
        tw.innerHTML = h;

        tw.querySelectorAll('[data-act]').forEach(function(btn){
            btn.onclick = function(ev){
                ev.stopPropagation();
                var a = btn.getAttribute('data-act');
                var id = btn.closest('tr').getAttribute('data-id');
                _quoteAction(a, id);
            };
        });
    }

    function _quoteActs(q) {
        var s = q.status, b = '';
        if (s==='draft') {
            b += '<button data-act="editq" style="'+_abtn('var(--text-primary)')+'">Modifier</button>';
            b += '<button data-act="sendq" style="'+_abtn('#8b5cf6')+'">Envoyer</button>';
        }
        if (s==='sent'||s==='accepted') {
            b += '<button data-act="convertq" style="'+_abtn('var(--success-color)')+'">Convertir en facture</button>';
        }
        b += '<button data-act="pdfq" style="'+_abtn('var(--accent-primary)')+'">PDF</button>';
        if (s==='draft'||s==='sent') {
            b += '<button data-act="delq" style="'+_abtn('var(--danger-color)')+'">Suppr.</button>';
        }
        return '<div style="display:flex;gap:4px;flex-wrap:wrap">'+b+'</div>';
    }

    function _quoteAction(a, id) {
        switch(a) {
            case 'editq': _editQuote(id); break;
            case 'sendq': _sendQuote(id); break;
            case 'convertq': _convertQuote(id); break;
            case 'pdfq': _pdfPreview('quote', id); break;
            case 'delq': _deleteQuote(id); break;
        }
    }

    /* ==================== QUOTE FORM ==================== */
    function _quoteForm(quote) {
        var isEdit = !!quote;
        var ov = _overlay();
        var bd = ov.querySelector('.acc-mb');
        var contacts = AccState.getState('contacts') || [];
        var lines = (quote && (quote.line_items||quote.lines)) || [{description:'',quantity:1,unit_price:0,tva_rate:20}];

        var cOp = '<option value="">-- Selectionner un client --</option>' + contacts.map(function(c){
            var s = quote && String(quote.contact_id)===String(c.id) ? ' selected':'';
            return '<option value="'+c.id+'"'+s+'>'+_e(c.name)+'</option>';
        }).join('');

        var today = new Date().toISOString().substring(0,10);
        var futureDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0,10);
        var qD = quote ? (quote.date||'').substring(0,10) : today;
        var qV = quote ? (quote.valid_until||'').substring(0,10) : futureDate;
        var year = new Date().getFullYear();
        var refPlaceholder = 'DE-'+year+'-0001';

        var f = '<h2 style="margin:0 0 20px;color:var(--text-primary)">'+(isEdit?'Modifier le devis':'Nouveau devis')+'</h2><form id="acc-qf">';
        f += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
        f += _fg('Client *','<select name="contact_id" required style="'+SS+'width:100%">'+cOp+'</select>');
        f += _fg('Reference','<input type="text" name="reference" style="'+IS+'width:100%" value="'+_e(quote?quote.reference||'':'')+'" placeholder="'+refPlaceholder+'">');
        f += _fg('Date du devis *','<input type="date" name="date" required style="'+IS+'width:100%" value="'+qD+'">');
        f += _fg('Valide jusqu\'au','<input type="date" name="valid_until" style="'+IS+'width:100%" value="'+qV+'">');
        f += '</div>';

        f += '<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
            '<h3 style="margin:0;color:var(--text-primary);font-size:1rem">Lignes</h3>' +
            '<button type="button" id="acc-qaddl" style="padding:4px 12px;border:1px dashed var(--border-color);border-radius:6px;background:transparent;color:var(--accent-primary);cursor:pointer;font-size:.85rem">+ Ajouter une ligne</button></div>';
        f += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'width:38%">Description</th><th style="'+THS+'width:10%;text-align:right">Qte</th>' +
            '<th style="'+THS+'width:15%;text-align:right">PU HT</th><th style="'+THS+'width:12%">TVA %</th>' +
            '<th style="'+THS+'width:15%;text-align:right">Total HT</th><th style="'+THS+'width:10%"></th>' +
            '</tr></thead><tbody id="acc-qlns"></tbody></table></div></div>';

        f += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:20px">' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total HT</span><span style="font-family:monospace" id="acc-qht">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total TVA</span><span style="font-family:monospace" id="acc-qtv">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px;padding-top:6px;border-top:2px solid var(--border-color)"><span style="font-weight:700;color:var(--text-primary)">Total TTC</span><span style="font-family:monospace;font-weight:700;font-size:1.1rem" id="acc-qtc">'+EUR.format(0)+'</span></div></div>';

        f += _fg('Notes et conditions','<textarea name="notes" rows="3" placeholder="Conditions de vente, delais de livraison..." style="'+IS+'width:100%;resize:vertical;font-family:inherit">'+_e(quote?quote.notes||'':'')+'</textarea>');

        f += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border-color)">' +
            '<button type="button" class="acc-ccl" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer;font-weight:600;font-size:.9rem">Annuler</button>' +
            '<button type="button" id="acc-qprev" style="padding:8px 18px;border:1px solid var(--accent-primary);border-radius:8px;background:transparent;color:var(--accent-primary);cursor:pointer;font-weight:600;font-size:.9rem">Apercu PDF</button>' +
            '<button type="submit" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Enregistrer</button></div></form>';

        bd.innerHTML = f;

        var tbody = ov.querySelector('#acc-qlns');
        lines.forEach(function(l){ _addDocLine(tbody, l, ov, 'q'); });
        _calcDoc(ov, 'q');

        ov.querySelector('#acc-qaddl').onclick = function(){ _addDocLine(tbody, {description:'',quantity:1,unit_price:0,tva_rate:20}, ov, 'q'); };
        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };
        ov.querySelector('#acc-qprev').onclick = function(){ _pdfPreviewFromForm(ov, 'quote'); };

        ov.querySelector('#acc-qf').onsubmit = async function(ev){
            ev.preventDefault();
            await _saveQuote(ov, isEdit ? quote.id : null);
        };

        _showOv(ov);
    }

    async function _editQuote(id) {
        try { var r = await AccountingApi.getQuote(id); _quoteForm(r.data||r); }
        catch(e) { _toast('Erreur lors du chargement du devis.','error'); }
    }

    async function _saveQuote(ov, exId) {
        var form = ov.querySelector('#acc-qf');
        var fd = new FormData(form);
        var items = _collectLines(ov);
        if (!items) return;

        var tH=0, tV=0;
        items.forEach(function(l){ var h=l.quantity*l.unit_price; tH+=h; tV+=h*(l.tva_rate/100); });

        var payload = {
            contact_id: fd.get('contact_id'), reference: fd.get('reference')||null,
            date: fd.get('date'), valid_until: fd.get('valid_until')||null,
            notes: fd.get('notes')||null, line_items: items,
            total_ht: Math.round(tH*100)/100, total_tva: Math.round(tV*100)/100,
            total_ttc: Math.round((tH+tV)*100)/100, status: 'draft'
        };

        try {
            _setLd(ov,true);
            if (exId) { await AccountingApi.updateQuote(exId, payload); _toast('Devis mis a jour.','success'); }
            else { await AccountingApi.createQuote(payload); _toast('Devis cree.','success'); }
            _closeOv(ov); _renderActiveTab();
        } catch(err) { _toast('Erreur : '+(err.message||'Impossible de sauvegarder.'),'error'); }
        finally { _setLd(ov,false); }
    }

    async function _sendQuote(id) {
        if (!confirm('Envoyer ce devis au client ?')) return;
        try { await AccountingApi.updateQuoteStatus(id,'sent'); _toast('Devis envoye.','success'); _renderActiveTab(); }
        catch(e) { _toast("Erreur lors de l'envoi du devis.",'error'); }
    }

    async function _convertQuote(id) {
        var ov = _overlay('480px');
        var bd = ov.querySelector('.acc-mb');
        bd.innerHTML = '<h2 style="margin:0 0 12px;color:var(--text-primary)">Convertir en facture</h2>' +
            '<p style="color:var(--text-secondary);margin:0 0 20px">Cette action va creer une nouvelle facture a partir de ce devis. Le devis sera marque comme converti.</p>' +
            '<div style="display:flex;justify-content:flex-end;gap:8px">' +
            '<button class="acc-ccl" style="'+_mbtn('var(--text-secondary)')+'">Annuler</button>' +
            '<button class="acc-cfm" style="padding:8px 18px;border:none;border-radius:8px;background:var(--success-color);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Confirmer la conversion</button></div>';

        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };
        ov.querySelector('.acc-cfm').onclick = async function(){
            try {
                _setLd(ov,true);
                var res = await AccountingApi.convertQuoteToInvoice(id);
                var newInvoice = res.data || res;
                _toast('Facture creee a partir du devis (ref: '+(newInvoice.reference||newInvoice.id)+').','success');
                _closeOv(ov); _renderActiveTab();
            } catch(e) { _toast('Erreur lors de la conversion.','error'); }
            finally { _setLd(ov,false); }
        };
        _showOv(ov);
    }

    async function _deleteQuote(id) {
        if (!confirm('Supprimer ce devis ? Cette action est irreversible.')) return;
        try { await AccountingApi.deleteQuote(id); _toast('Devis supprime.','success'); _renderActiveTab(); }
        catch(e) { _toast('Erreur lors de la suppression.','error'); }
    }

    /* ==================== CREDIT NOTES (AVOIRS) ==================== */
    async function _renderCredits(w) {
        var hdr = _mk('div');
        hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;';
        hdr.innerHTML = '<h3 style="margin:0;color:var(--text-primary)">Avoirs</h3>' +
            '<button id="acc-doc-newc" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">+ Nouvel avoir</button>';
        hdr.querySelector('#acc-doc-newc').onclick = function(){ _creditForm(null); };
        w.appendChild(hdr);

        var tw = _mk('div'); tw.id = 'acc-doc-ctw';
        tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Chargement des avoirs...</div>';
        w.appendChild(tw);

        try {
            var res = await AccountingApi.getCreditNotes();
            var credits = res.data || res.credit_notes || res || [];
            if (!Array.isArray(credits)) credits = [];
            _renderCreditTable(credits, tw);
        } catch(err) {
            tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger-color)">Erreur : '+_e(err.message)+'</div>';
        }
    }

    function _renderCreditTable(credits, tw) {
        if (!credits.length) {
            tw.innerHTML = '<div style="text-align:center;padding:50px 20px">' +
                '<div style="font-size:3rem;margin-bottom:12px;opacity:.5">&#128203;</div>' +
                '<h3 style="color:var(--text-primary);margin:0 0 8px">Aucun avoir</h3>' +
                '<p style="color:var(--text-secondary);margin:0">Creez votre premier avoir pour commencer.</p></div>';
            return;
        }

        var h = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.9rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'">Date</th><th style="'+THS+'">N&deg; Avoir</th>' +
            '<th style="'+THS+'">Client</th><th style="'+THS+'">Facture liee</th>' +
            '<th style="'+THS+'text-align:right">Montant TTC</th>' +
            '<th style="'+THS+'">Statut</th><th style="'+THS+'">Actions</th></tr></thead><tbody>';

        credits.forEach(function(c) {
            var st = CREDIT_STATUS[c.status] || CREDIT_STATUS.draft;
            var dt = c.date ? DATEFMT.format(new Date(c.date)) : '-';
            h += '<tr data-id="'+c.id+'" style="border-bottom:1px solid var(--border-color)">' +
                '<td style="'+TDS+'">'+dt+'</td>' +
                '<td style="'+TDS+'font-family:monospace">'+_e(c.reference||'-')+'</td>' +
                '<td style="'+TDS+'">'+_e(c.client_name||c.contact_name||'-')+'</td>' +
                '<td style="'+TDS+'font-family:monospace">'+_e(c.invoice_reference||'-')+'</td>' +
                '<td style="'+TDS+'text-align:right;font-family:monospace;font-weight:600;color:var(--danger-color)">- '+EUR.format(Math.abs(c.total_ttc||0))+'</td>' +
                '<td style="'+TDS+'"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.8rem;font-weight:600;color:'+st.color+';background:'+st.bg+'">'+st.label+'</span></td>' +
                '<td style="'+TDS+'">'+_creditActs(c)+'</td></tr>';
        });

        h += '</tbody></table></div>';
        tw.innerHTML = h;

        tw.querySelectorAll('[data-act]').forEach(function(btn){
            btn.onclick = function(ev){
                ev.stopPropagation();
                var a = btn.getAttribute('data-act');
                var id = btn.closest('tr').getAttribute('data-id');
                _creditAction(a, id);
            };
        });
    }

    function _creditActs(c) {
        var s = c.status, b = '';
        if (s==='draft') {
            b += '<button data-act="editc" style="'+_abtn('var(--text-primary)')+'">Modifier</button>';
            b += '<button data-act="validatec" style="'+_abtn('var(--success-color)')+'">Valider</button>';
        }
        b += '<button data-act="pdfc" style="'+_abtn('var(--accent-primary)')+'">PDF</button>';
        if (s==='draft') b += '<button data-act="delc" style="'+_abtn('var(--danger-color)')+'">Suppr.</button>';
        return '<div style="display:flex;gap:4px;flex-wrap:wrap">'+b+'</div>';
    }

    function _creditAction(a, id) {
        switch(a) {
            case 'editc': _editCredit(id); break;
            case 'validatec': _validateCredit(id); break;
            case 'pdfc': _pdfPreview('credit', id); break;
            case 'delc': _deleteCredit(id); break;
        }
    }

    /* ==================== CREDIT NOTE FORM ==================== */
    function _creditForm(credit) {
        var isEdit = !!credit;
        var ov = _overlay();
        var bd = ov.querySelector('.acc-mb');
        var contacts = AccState.getState('contacts') || [];
        var lines = (credit && (credit.line_items||credit.lines)) || [{description:'',quantity:1,unit_price:0,tva_rate:20}];

        var cOp = '<option value="">-- Selectionner un client --</option>' + contacts.map(function(c){
            var s = credit && String(credit.contact_id)===String(c.id) ? ' selected':'';
            return '<option value="'+c.id+'"'+s+'>'+_e(c.name)+'</option>';
        }).join('');

        var today = new Date().toISOString().substring(0,10);
        var cD = credit ? (credit.date||'').substring(0,10) : today;

        var f = '<h2 style="margin:0 0 20px;color:var(--text-primary)">'+(isEdit?'Modifier l\'avoir':'Nouvel avoir')+'</h2><form id="acc-cf">';
        f += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
        f += _fg('Client *','<select name="contact_id" required style="'+SS+'width:100%">'+cOp+'</select>');
        f += _fg('Reference','<input type="text" name="reference" style="'+IS+'width:100%" value="'+_e(credit?credit.reference||'':'')+'" placeholder="AV-2026-0001">');
        f += _fg('Date *','<input type="date" name="date" required style="'+IS+'width:100%" value="'+cD+'">');
        f += _fg('Facture d\'origine','<input type="text" name="invoice_reference" style="'+IS+'width:100%" value="'+_e(credit?credit.invoice_reference||'':'')+'" placeholder="FA-2026-XXXX">');
        f += '</div>';

        f += '<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
            '<h3 style="margin:0;color:var(--text-primary);font-size:1rem">Lignes (montants a crediter)</h3>' +
            '<button type="button" id="acc-caddl" style="padding:4px 12px;border:1px dashed var(--border-color);border-radius:6px;background:transparent;color:var(--accent-primary);cursor:pointer;font-size:.85rem">+ Ajouter une ligne</button></div>';
        f += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'width:38%">Description</th><th style="'+THS+'width:10%;text-align:right">Qte</th>' +
            '<th style="'+THS+'width:15%;text-align:right">PU HT</th><th style="'+THS+'width:12%">TVA %</th>' +
            '<th style="'+THS+'width:15%;text-align:right">Total HT</th><th style="'+THS+'width:10%"></th>' +
            '</tr></thead><tbody id="acc-clns"></tbody></table></div></div>';

        f += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:20px">' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total HT</span><span style="font-family:monospace" id="acc-cht">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total TVA</span><span style="font-family:monospace" id="acc-ctv">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px;padding-top:6px;border-top:2px solid var(--border-color)"><span style="font-weight:700;color:var(--danger-color)">Avoir TTC</span><span style="font-family:monospace;font-weight:700;font-size:1.1rem;color:var(--danger-color)" id="acc-ctc">- '+EUR.format(0)+'</span></div></div>';

        f += _fg('Motif','<textarea name="notes" rows="2" placeholder="Motif de l\'avoir..." style="'+IS+'width:100%;resize:vertical;font-family:inherit">'+_e(credit?credit.notes||'':'')+'</textarea>');

        f += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border-color)">' +
            '<button type="button" class="acc-ccl" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer;font-weight:600;font-size:.9rem">Annuler</button>' +
            '<button type="submit" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Enregistrer</button></div></form>';

        bd.innerHTML = f;

        var tbody = ov.querySelector('#acc-clns');
        lines.forEach(function(l){ _addDocLine(tbody, l, ov, 'c'); });
        _calcDoc(ov, 'c');

        ov.querySelector('#acc-caddl').onclick = function(){ _addDocLine(tbody, {description:'',quantity:1,unit_price:0,tva_rate:20}, ov, 'c'); };
        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };

        ov.querySelector('#acc-cf').onsubmit = async function(ev){
            ev.preventDefault();
            await _saveCredit(ov, isEdit ? credit.id : null);
        };

        _showOv(ov);
    }

    async function _editCredit(id) {
        try { var r = await AccountingApi.getCreditNote(id); _creditForm(r.data||r); }
        catch(e) { _toast('Erreur lors du chargement de l\'avoir.','error'); }
    }

    async function _saveCredit(ov, exId) {
        var form = ov.querySelector('#acc-cf');
        var fd = new FormData(form);
        var items = _collectLines(ov);
        if (!items) return;

        var tH=0, tV=0;
        items.forEach(function(l){ var h=l.quantity*l.unit_price; tH+=h; tV+=h*(l.tva_rate/100); });

        var payload = {
            contact_id: fd.get('contact_id'), reference: fd.get('reference')||null,
            date: fd.get('date'), invoice_reference: fd.get('invoice_reference')||null,
            notes: fd.get('notes')||null, line_items: items,
            total_ht: -Math.round(tH*100)/100, total_tva: -Math.round(tV*100)/100,
            total_ttc: -Math.round((tH+tV)*100)/100, status: 'draft'
        };

        try {
            _setLd(ov,true);
            if (exId) { await AccountingApi.updateCreditNote(exId, payload); _toast('Avoir mis a jour.','success'); }
            else { await AccountingApi.createCreditNote(payload); _toast('Avoir cree.','success'); }
            _closeOv(ov); _renderActiveTab();
        } catch(err) { _toast('Erreur : '+(err.message||'Impossible de sauvegarder.'),'error'); }
        finally { _setLd(ov,false); }
    }

    async function _validateCredit(id) {
        if (!confirm('Valider cet avoir ? Cette action est irreversible.')) return;
        try { await AccountingApi.updateCreditNoteStatus(id,'validated'); _toast('Avoir valide.','success'); _renderActiveTab(); }
        catch(e) { _toast('Erreur lors de la validation.','error'); }
    }

    async function _deleteCredit(id) {
        if (!confirm('Supprimer cet avoir ?')) return;
        try { await AccountingApi.deleteCreditNote(id); _toast('Avoir supprime.','success'); _renderActiveTab(); }
        catch(e) { _toast('Erreur lors de la suppression.','error'); }
    }

    /* ==================== SHARED LINE ITEMS ==================== */
    function _addDocLine(tbody, ln, ctx, prefix) {
        var tr = document.createElement('tr');
        tr.className = 'acc-lr';
        tr.style.borderBottom = '1px solid var(--border-color)';
        var tvO = TVA_RATES.map(function(r){ return '<option value="'+r.value+'"'+((ln.tva_rate||0)==r.value?' selected':'')+'>'+r.label+'</option>'; }).join('');
        tr.innerHTML =
            '<td style="padding:6px 4px"><input type="text" name="ld" value="'+_e(ln.description||'')+'" placeholder="Description" required style="'+IS+'width:100%;padding:4px 8px"></td>' +
            '<td style="padding:6px 4px"><input type="number" name="lq" value="'+(ln.quantity||1)+'" min="0" step="0.01" style="'+IS+'width:100%;padding:4px 8px;text-align:right"></td>' +
            '<td style="padding:6px 4px"><input type="number" name="lp" value="'+(ln.unit_price||0)+'" min="0" step="0.01" style="'+IS+'width:100%;padding:4px 8px;text-align:right"></td>' +
            '<td style="padding:6px 4px"><select name="lt" style="'+SS+'width:100%;padding:4px 6px">'+tvO+'</select></td>' +
            '<td style="padding:6px 4px;text-align:right;font-family:monospace" class="acc-ltot">'+EUR.format(0)+'</td>' +
            '<td style="padding:6px 4px;text-align:center"><button type="button" class="acc-lrm" style="border:none;background:transparent;color:var(--danger-color);cursor:pointer;font-size:1.2rem;padding:2px 6px" title="Supprimer">&times;</button></td>';

        tr.querySelector('.acc-lrm').onclick = function(){ tr.remove(); _calcDoc(ctx, prefix); };
        ['lq','lp','lt'].forEach(function(n){
            var inp = tr.querySelector('[name="'+n+'"]');
            inp.oninput = function(){ _calcDoc(ctx, prefix); };
            inp.onchange = function(){ _calcDoc(ctx, prefix); };
        });
        tbody.appendChild(tr);
        _calcDoc(ctx, prefix);
    }

    function _calcDoc(ctx, prefix) {
        if (!ctx) return;
        var tH=0, tV=0;
        ctx.querySelectorAll('.acc-lr').forEach(function(r){
            var q = parseFloat(r.querySelector('[name="lq"]').value)||0;
            var p = parseFloat(r.querySelector('[name="lp"]').value)||0;
            var t = parseFloat(r.querySelector('[name="lt"]').value)||0;
            var lh = q*p;
            r.querySelector('.acc-ltot').textContent = EUR.format(lh);
            tH += lh; tV += lh*(t/100);
        });
        var eH=ctx.querySelector('#acc-'+prefix+'ht');
        var eV=ctx.querySelector('#acc-'+prefix+'tv');
        var eT=ctx.querySelector('#acc-'+prefix+'tc');
        if(eH) eH.textContent = EUR.format(tH);
        if(eV) eV.textContent = EUR.format(tV);
        if(eT) {
            if (prefix==='c') eT.textContent = '- '+EUR.format(tH+tV);
            else eT.textContent = EUR.format(tH+tV);
        }
    }

    function _collectLines(ctx) {
        var items = [];
        ctx.querySelectorAll('.acc-lr').forEach(function(r){
            items.push({
                description: r.querySelector('[name="ld"]').value,
                quantity: parseFloat(r.querySelector('[name="lq"]').value)||0,
                unit_price: parseFloat(r.querySelector('[name="lp"]').value)||0,
                tva_rate: parseFloat(r.querySelector('[name="lt"]').value)||0
            });
        });
        if (!items.length) { _toast('Ajoutez au moins une ligne.','warning'); return null; }
        if (items.some(function(l){ return !l.description.trim(); })) {
            _toast('Toutes les lignes doivent avoir une description.','warning'); return null;
        }
        return items;
    }

    /* ==================== PDF PREVIEW ==================== */
    async function _pdfPreview(type, id) {
        try {
            var res;
            if (type==='quote') res = await AccountingApi.getQuote(id);
            else res = await AccountingApi.getCreditNote(id);
            var data = res.data || res;
            _renderPdfView(data, type);
        } catch(e) { _toast('Erreur lors du chargement du document.','error'); }
    }

    function _pdfPreviewFromForm(ov, type) {
        var form = ov.querySelector('form');
        var fd = new FormData(form);
        var items = _collectLines(ov);
        if (!items) return;

        var tH=0, tV=0;
        items.forEach(function(l){ var h=l.quantity*l.unit_price; tH+=h; tV+=h*(l.tva_rate/100); });

        var contacts = AccState.getState('contacts') || [];
        var contactId = fd.get('contact_id');
        var contact = contacts.find(function(c){ return String(c.id)===String(contactId); });

        var data = {
            reference: fd.get('reference') || (type==='quote'?'DE-BROUILLON':'AV-BROUILLON'),
            date: fd.get('date'), valid_until: fd.get('valid_until')||null,
            client_name: contact ? contact.name : '-',
            client_address: contact ? contact.address : '',
            client_email: contact ? contact.email : '',
            line_items: items, notes: fd.get('notes')||'',
            total_ht: tH, total_tva: tV, total_ttc: tH+tV
        };
        _renderPdfView(data, type);
    }

    function _renderPdfView(data, type) {
        var ov = _overlay('800px');
        var bd = ov.querySelector('.acc-mb');
        var company = AccState.getState('company') || {};
        var lines = data.line_items || data.lines || [];
        var docTitle = type==='quote' ? 'DEVIS' : (type==='credit' ? 'AVOIR' : 'FACTURE');

        var tH = data.total_ht||0, tV = data.total_tva||0, tT = data.total_ttc||0;

        var p = '<div id="acc-pdf-zone" style="background:#fff;color:#333;padding:40px;font-family:Arial,sans-serif;font-size:14px;max-width:800px;margin:0 auto">';

        p += '<div style="display:flex;justify-content:space-between;margin-bottom:40px">';
        p += '<div>';
        if (company.logo_url) p += '<img src="'+_e(company.logo_url)+'" alt="Logo" style="max-height:60px;margin-bottom:8px;display:block">';
        p += '<strong style="font-size:16px">'+_e(company.name||'Votre Entreprise')+'</strong><br>';
        if (company.address) p += _e(company.address)+'<br>';
        if (company.phone) p += _e(company.phone)+'<br>';
        if (company.email) p += _e(company.email);
        p += '</div>';
        p += '<div style="text-align:right">';
        p += '<strong style="color:'+_e(data.client_name||'-')+'">'+_e(data.client_name||'-')+'</strong><br>';
        if (data.client_address) p += _e(data.client_address)+'<br>';
        if (data.client_email) p += _e(data.client_email);
        p += '</div></div>';

        p += '<div style="text-align:center;margin-bottom:30px">';
        p += '<h1 style="margin:0;font-size:24px;color:#333">'+docTitle+'</h1>';
        p += '<div style="margin-top:8px;color:#666">';
        p += 'N&deg; '+_e(data.reference||'-');
        if (data.date) p += ' | Date : '+DATEFMT.format(new Date(data.date));
        if (data.valid_until) p += ' | Valide jusqu\'au : '+DATEFMT.format(new Date(data.valid_until));
        if (data.due_date) p += ' | Echeance : '+DATEFMT.format(new Date(data.due_date));
        p += '</div></div>';

        p += '<table style="width:100%;border-collapse:collapse;margin-bottom:30px">';
        p += '<thead><tr style="background:#f5f5f5">' +
            '<th style="padding:10px;text-align:left;border-bottom:2px solid #333">Description</th>' +
            '<th style="padding:10px;text-align:right;border-bottom:2px solid #333">Qte</th>' +
            '<th style="padding:10px;text-align:right;border-bottom:2px solid #333">PU HT</th>' +
            '<th style="padding:10px;text-align:right;border-bottom:2px solid #333">TVA</th>' +
            '<th style="padding:10px;text-align:right;border-bottom:2px solid #333">Total HT</th></tr></thead><tbody>';

        if (lines.length) {
            lines.forEach(function(l){
                var lt = (l.quantity||1)*(l.unit_price||0);
                p += '<tr><td style="padding:8px 10px;border-bottom:1px solid #ddd">'+_e(l.description||'-')+'</td>' +
                    '<td style="padding:8px 10px;text-align:right;border-bottom:1px solid #ddd">'+(l.quantity||1)+'</td>' +
                    '<td style="padding:8px 10px;text-align:right;border-bottom:1px solid #ddd">'+EUR.format(l.unit_price||0)+'</td>' +
                    '<td style="padding:8px 10px;text-align:right;border-bottom:1px solid #ddd">'+(l.tva_rate||0)+'%</td>' +
                    '<td style="padding:8px 10px;text-align:right;border-bottom:1px solid #ddd">'+EUR.format(lt)+'</td></tr>';
            });
        }
        p += '</tbody></table>';

        p += '<div style="display:flex;justify-content:flex-end;margin-bottom:30px"><div style="width:280px">' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0"><span>Total HT</span><span>'+EUR.format(tH)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0"><span>TVA</span><span>'+EUR.format(tV)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #333;font-weight:700;font-size:16px">' +
            '<span>Total TTC</span><span>'+(type==='credit'?'- ':'')+EUR.format(Math.abs(tT))+'</span></div></div></div>';

        if (data.notes) {
            p += '<div style="margin-bottom:20px;padding:12px;background:#f9f9f9;border-radius:4px"><strong>Notes et conditions :</strong><br>' +
                '<span style="white-space:pre-wrap">'+_e(data.notes)+'</span></div>';
        }

        if (company.payment_terms) {
            p += '<div style="margin-bottom:20px"><strong>Conditions de paiement :</strong><br>'+_e(company.payment_terms)+'</div>';
        }

        if (company.cgv) {
            p += '<div style="font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:12px;margin-top:20px">' +
                '<strong>Conditions Generales de Vente</strong><br>'+_e(company.cgv)+'</div>';
        }

        p += '</div>';

        bd.innerHTML = p +
            '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;margin-top:16px;border-top:1px solid var(--border-color)">' +
            '<button class="acc-ccl" style="'+_mbtn('var(--text-secondary)')+'">Fermer</button>' +
            '<button id="acc-pdf-print" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Imprimer / PDF</button></div>';

        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };
        ov.querySelector('#acc-pdf-print').onclick = function(){
            var zone = ov.querySelector('#acc-pdf-zone');
            var win = window.open('','_blank');
            win.document.write('<html><head><title>'+docTitle+' '+_e(data.reference||'')+'</title>' +
                '<style>body{margin:0;padding:20px;font-family:Arial,sans-serif}@media print{body{padding:0}}</style></head><body>' +
                zone.innerHTML+'</body></html>');
            win.document.close();
            win.focus();
            setTimeout(function(){ win.print(); }, 300);
        };

        _showOv(ov);
    }

    /* ==================== OVERLAY / MODAL ==================== */
    function _overlay(maxW) {
        var ov = _mk('div');
        ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;padding:20px;overflow-y:auto;';
        var m = _mk('div');
        m.style.cssText = 'background:var(--bg-primary);border-radius:12px;max-width:'+(maxW||'780px')+';width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);transform:translateY(10px);transition:transform .2s;';
        m.innerHTML = '<div style="display:flex;justify-content:flex-end;padding:12px 16px 0"><button class="acc-mx" style="border:none;background:transparent;font-size:1.5rem;cursor:pointer;color:var(--text-secondary);padding:4px 8px;line-height:1">&times;</button></div><div class="acc-mb" style="padding:0 24px 24px"></div>';
        m.querySelector('.acc-mx').onclick = function(){ _closeOv(ov); };
        ov.onclick = function(ev){ if(ev.target===ov) _closeOv(ov); };
        document.addEventListener('keydown', function h(ev){ if(ev.key==='Escape'){_closeOv(ov);document.removeEventListener('keydown',h);} });
        ov.appendChild(m);
        return ov;
    }

    function _showOv(ov) {
        document.body.appendChild(ov);
        requestAnimationFrame(function(){ ov.style.opacity='1'; ov.querySelector(':scope > div').style.transform='translateY(0)'; });
    }

    function _closeOv(ov) {
        if(!ov) return; ov.style.opacity='0';
        var m=ov.querySelector(':scope > div'); if(m) m.style.transform='translateY(10px)';
        setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); },220);
    }

    function _setLd(ctx,on) {
        ctx.querySelectorAll('button[type="submit"],.acc-cfm').forEach(function(b){ b.disabled=on; b.style.opacity=on?'.6':'1'; });
    }

    /* ==================== UTILITIES ==================== */
    function _mk(t) { return document.createElement(t); }
    function _e(s) { if(s==null) return ''; var d=document.createElement('div'); d.textContent=String(s); return d.innerHTML; }
    function _toast(m,t) {
        if(typeof window.showToast==='function') window.showToast(m,t);
        else if(typeof Notify!=='undefined'&&Notify.show) Notify.show(m,t);
        else console.log('[AccDocuments]',t,m);
    }
    function _fg(l,html) { return '<div style="margin-bottom:12px"><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.85rem">'+l+'</label>'+html+'</div>'; }

    function refresh() { if(_ctn) _renderActiveTab(); }

    return { render: render, refresh: refresh };
})();
