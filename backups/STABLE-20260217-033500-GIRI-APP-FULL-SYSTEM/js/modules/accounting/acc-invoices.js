/**
 * AccInvoices - Module de gestion avancee des factures
 * ProductiveApp Accounting
 * @version 1.0.0
 */
const AccInvoices = (function() {
    'use strict';

    const PER_PAGE = 15;
    const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    const DATEFMT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const STATUS_MAP = {
        draft:     { label: 'Brouillon',  color: 'var(--text-secondary)', bg: 'rgba(128,128,128,.12)' },
        pending:   { label: 'En attente', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,.12)' },
        validated: { label: 'Validee',    color: 'var(--success-color)',  bg: 'rgba(34,197,94,.12)' },
        paid:      { label: 'Payee',      color: '#059669',              bg: 'rgba(5,150,105,.12)' },
        overdue:   { label: 'En retard',  color: 'var(--danger-color)',  bg: 'rgba(239,68,68,.12)' },
        cancelled: { label: 'Annulee',    color: 'var(--text-secondary)', bg: 'rgba(128,128,128,.08)', strike: true },
        sent:      { label: 'Envoyee',    color: '#8b5cf6',              bg: 'rgba(139,92,246,.12)' }
    };

    const TYPE_MAP = {
        income:  { label: 'Revenu',  color: 'var(--success-color)', bg: 'rgba(34,197,94,.15)' },
        expense: { label: 'Depense', color: 'var(--danger-color)',  bg: 'rgba(239,68,68,.15)' }
    };

    const TVA_RATES = [
        { value: 0, label: '0%' }, { value: 5.5, label: '5,5%' },
        { value: 10, label: '10%' }, { value: 20, label: '20%' }
    ];

    const PAY_METHODS = [
        { value: 'bank_transfer', label: 'Virement bancaire' },
        { value: 'card', label: 'Carte bancaire' },
        { value: 'check', label: 'Cheque' },
        { value: 'cash', label: 'Especes' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'other', label: 'Autre' }
    ];

    var SS = 'padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);font-size:.85rem;';
    var IS = SS + 'box-sizing:border-box;';
    var THS = 'padding:8px 10px;text-align:left;font-weight:600;color:var(--text-secondary);font-size:.8rem;white-space:nowrap;';
    var TDS = 'padding:10px;color:var(--text-primary);';

    function _abtn(c) { return 'padding:3px 8px;border:1px solid '+c+';border-radius:4px;background:transparent;color:'+c+';cursor:pointer;font-size:.75rem;white-space:nowrap;'; }
    function _mbtn(c) { return 'padding:8px 18px;border:1px solid '+c+';border-radius:8px;background:transparent;cursor:pointer;font-weight:600;font-size:.9rem;color:'+c+';'; }
    function _pbtn(a) { return 'padding:6px 12px;border:1px solid '+(a?'var(--accent-primary)':'var(--border-color)')+';border-radius:6px;background:'+(a?'var(--accent-primary)':'transparent')+';color:'+(a?'#fff':'var(--text-primary)')+';cursor:pointer;font-size:.85rem;'; }

    var _ctn = null, _page = 1;
    var _flt = { type:'', status:'', category:'', dateFrom:'', dateTo:'', search:'' };

    /* ==================== RENDER ==================== */
    function render(container) {
        _ctn = container;
        _ctn.innerHTML = '';
        _ctn.appendChild(_headerBar());
        _ctn.appendChild(_filterBar());
        var tw = _mk('div'); tw.id = 'acc-inv-tw';
        tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Chargement des factures...</div>';
        _ctn.appendChild(tw);
        var pg = _mk('div'); pg.id = 'acc-inv-pg';
        pg.style.cssText = 'display:flex;justify-content:center;gap:4px;padding:16px 0;';
        _ctn.appendChild(pg);
        _load();
    }

    /* ==================== HEADER ==================== */
    function _headerBar() {
        var d = _mk('div');
        d.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:16px 0;';
        d.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px">' +
            '<h2 style="margin:0;color:var(--text-primary);font-size:1.4rem">Factures</h2>' +
            '<span id="acc-inv-badge" style="background:var(--accent-primary);color:#fff;border-radius:12px;padding:2px 10px;font-size:.8rem;font-weight:600">0</span></div>' +
            '<button id="acc-inv-new" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">+ Nouvelle facture</button>';
        d.querySelector('#acc-inv-new').onclick = function() { _formModal(null); };
        return d;
    }

    /* ==================== FILTERS ==================== */
    function _filterBar() {
        var d = _mk('div');
        d.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:12px 0;align-items:center;';
        var cats = AccState.getState('categories') || [];
        var co = '<option value="">Toutes categories</option>' + cats.map(function(c){return '<option value="'+c.id+'">'+_e(c.name)+'</option>';}).join('');
        var so = '<option value="">Tous</option>' + Object.keys(STATUS_MAP).map(function(k){return '<option value="'+k+'">'+STATUS_MAP[k].label+'</option>';}).join('');

        d.innerHTML =
            '<select id="acc-f-t" style="'+SS+'"><option value="">Tous</option><option value="expense">Depenses</option><option value="income">Revenus</option></select>' +
            '<select id="acc-f-s" style="'+SS+'">'+so+'</select>' +
            '<select id="acc-f-c" style="'+SS+'">'+co+'</select>' +
            '<input type="date" id="acc-f-d1" style="'+IS+'" title="Date debut">' +
            '<input type="date" id="acc-f-d2" style="'+IS+'" title="Date fin">' +
            '<input type="text" id="acc-f-q" placeholder="Fournisseur, reference..." style="'+IS+'min-width:180px">' +
            '<button id="acc-f-r" style="padding:6px 14px;border:1px solid var(--border-color);border-radius:6px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:.85rem">Reinitialiser</button>';

        var ch = function(id,k){ d.querySelector(id).onchange = function(ev){ _flt[k]=ev.target.value; _page=1; _load(); }; };
        ch('#acc-f-t','type'); ch('#acc-f-s','status'); ch('#acc-f-c','category');
        ch('#acc-f-d1','dateFrom'); ch('#acc-f-d2','dateTo');
        d.querySelector('#acc-f-q').addEventListener('input', _deb(function(ev){ _flt.search=ev.target.value.trim(); _page=1; _load(); }, 350));
        d.querySelector('#acc-f-r').onclick = function(){
            _flt={type:'',status:'',category:'',dateFrom:'',dateTo:'',search:''};
            d.querySelectorAll('select').forEach(function(s){s.value='';});
            d.querySelectorAll('input').forEach(function(i){i.value='';});
            _page=1; _load();
        };
        return d;
    }

    /* ==================== DATA LOADING ==================== */
    async function _load() {
        var tw = _ctn.querySelector('#acc-inv-tw');
        tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Chargement...</div>';
        try {
            var p = { page: _page, limit: PER_PAGE };
            if (_flt.type) p.type = _flt.type;
            if (_flt.status) p.status = _flt.status;
            if (_flt.category) p.category_id = _flt.category;
            if (_flt.dateFrom) p.date_from = _flt.dateFrom;
            if (_flt.dateTo) p.date_to = _flt.dateTo;
            if (_flt.search) p.search = _flt.search;

            var res = await AccountingApi.getInvoices(p);
            var inv = res.data || res.invoices || res || [];
            var total = res.total != null ? res.total : (Array.isArray(inv) ? inv.length : 0);
            if (!Array.isArray(inv)) inv = [];

            var b = _ctn.querySelector('#acc-inv-badge');
            if (b) b.textContent = total;
            _renderTable(inv, tw);
            _renderPag(total);
        } catch(err) {
            tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger-color)">Erreur : '+_e(err.message)+'</div>';
        }
    }

    /* ==================== TABLE ==================== */
    function _renderTable(inv, tw) {
        if (!inv.length) {
            tw.innerHTML = '<div style="text-align:center;padding:60px 20px">' +
                '<div style="font-size:3rem;margin-bottom:12px;opacity:.5">📄</div>' +
                '<h3 style="color:var(--text-primary);margin:0 0 8px">Aucune facture trouvée</h3>' +
                '<p style="color:var(--text-secondary);margin:0 0 20px">Créez votre première facture pour commencer à suivre vos finances.</p>' +
                '<button id="acc-inv-en" class="acc-quick-btn-prem primary">➕ Nouvelle facture</button></div>';
            var b = tw.querySelector('#acc-inv-en');
            if (b) b.onclick = function(){ _formModal(null); };
            return;
        }

        var h = '<div class="acc-inv-table-wrap"><table class="acc-inv-table-prem">' +
            '<thead><tr>' +
            '<th>Date</th><th>N°</th>' +
            '<th>Fournisseur / Client</th><th>Catégorie</th>' +
            '<th>Type</th><th style="text-align:right">Montant TTC</th>' +
            '<th>Statut</th><th class="acc-inv-actions-cell">Actions</th></tr></thead><tbody>';

        inv.forEach(function(i) {
            var st  = STATUS_MAP[i.status] || STATUS_MAP.draft;
            var tp  = TYPE_MAP[i.type]     || TYPE_MAP.expense;
            var dt  = i.date ? DATEFMT.format(new Date(i.date)) : '-';
            var cn  = _catName(i.category_id);
            var name = _e(i.contact_name || i.client_name || '-');
            var initials = name.replace(/[^A-Za-zÀ-ÿ]/g, '').substring(0, 2).toUpperCase() || '??';
            var statusCls = i.status || 'draft';

            h += '<tr data-id="'+i.id+'" class="acc-ir" style="cursor:pointer'+(st.strike?';opacity:.65':'')+'">' +
                '<td style="font-size:13px;color:var(--text-secondary,#8f9bb3);white-space:nowrap">'+dt+'</td>' +
                '<td style="font-family:monospace;font-size:13px;font-weight:600;color:var(--text-secondary,#8f9bb3)">'+_e(i.reference||'—')+'</td>' +
                '<td><div class="acc-inv-client-cell">' +
                    '<div class="acc-inv-avatar">'+initials+'</div>' +
                    '<div><div class="acc-inv-client-name">'+name+'</div>' +
                    '<div class="acc-inv-client-email">'+_e(cn)+'</div></div>' +
                '</div></td>' +
                '<td><span class="acc-status-prem '+(i.type==='income'?'paid':'sent')+'" style="font-size:11px">'+tp.label+'</span></td>' +
                '<td style="text-align:right"><span class="acc-inv-amount-prem '+(i.type||'')+'">'+EUR.format(i.total_ttc||0)+'</span></td>' +
                '<td><span class="acc-status-prem '+statusCls+'">'+st.label+'</span></td>' +
                '<td class="acc-inv-actions-cell">'+_rowActsPrem(i)+'</td></tr>';
        });

        h += '</tbody></table></div>';
        tw.innerHTML = h;

        tw.querySelectorAll('[data-act]').forEach(function(btn){
            btn.onclick = function(ev){ ev.stopPropagation(); _dispatch(btn.getAttribute('data-act'), btn.closest('tr').getAttribute('data-id')); };
        });
        tw.querySelectorAll('.acc-ir').forEach(function(row){
            row.onclick = function(ev){ if(ev.target.closest('[data-act]')) return; _detailModal(row.getAttribute('data-id')); };
        });
    }

    function _rowActsPrem(i) {
        var s = i.status;
        var btns = '';
        // Icônes SVG compacts
        var icons = {
            view:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
            edit:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            validate: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
            pay:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
            send:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>',
            remind:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
            pdf:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
            del:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
        };

        btns += '<button class="acc-inv-action-btn" data-act="view" title="Voir">'+icons.view+'</button>';
        if (s==='draft'||s==='pending') btns += '<button class="acc-inv-action-btn" data-act="edit" title="Modifier">'+icons.edit+'</button>';
        if (s==='draft') btns += '<button class="acc-inv-action-btn" data-act="validate" title="Valider">'+icons.validate+'</button>';
        if (s==='validated'||s==='sent'||s==='overdue') btns += '<button class="acc-inv-action-btn" data-act="pay" title="Marquer payée">'+icons.pay+'</button>';
        if ((s==='validated'||s==='sent'||s==='overdue') && i.type==='income') btns += '<button class="acc-inv-action-btn stripe" data-act="stripe" title="Payer en ligne (Stripe)">💳</button>';
        if (s==='validated') btns += '<button class="acc-inv-action-btn" data-act="send" title="Envoyer">'+icons.send+'</button>';
        if (s==='sent'||s==='overdue') btns += '<button class="acc-inv-action-btn" data-act="remind" title="Relance">'+icons.remind+'</button>';
        btns += '<button class="acc-inv-action-btn" data-act="pdf" title="Télécharger PDF">'+icons.pdf+'</button>';
        if (s!=='paid'&&s!=='cancelled') btns += '<button class="acc-inv-action-btn" data-act="delete" title="Supprimer" style="color:var(--fin-danger,#ff3d71)">'+icons.del+'</button>';
        return '<div style="display:flex;gap:5px;align-items:center">'+btns+'</div>';
    }

    // Alias pour compatibilité (anciens appels éventuels)
    function _rowActs(i) { return _rowActsPrem(i); }

    /* ==================== PAGINATION ==================== */
    function _renderPag(total) {
        var w = _ctn.querySelector('#acc-inv-pg');
        var pages = Math.ceil(total / PER_PAGE);
        if (pages <= 1) { w.innerHTML = ''; return; }
        var h = '<button data-p="'+(_page-1)+'" style="'+_pbtn(false)+'"'+(_page<=1?' disabled':'')+'>&#171; Prec.</button>';
        for (var i=1;i<=pages;i++) {
            if (pages>7) {
                if (i===1||i===pages||(i>=_page-1&&i<=_page+1))
                    h += '<button data-p="'+i+'" style="'+_pbtn(i===_page)+'">'+i+'</button>';
                else if (i===_page-2||i===_page+2)
                    h += '<span style="padding:6px 4px;color:var(--text-secondary)">...</span>';
            } else {
                h += '<button data-p="'+i+'" style="'+_pbtn(i===_page)+'">'+i+'</button>';
            }
        }
        h += '<button data-p="'+(_page+1)+'" style="'+_pbtn(false)+'"'+(_page>=pages?' disabled':'')+'>Suiv. &#187;</button>';
        w.innerHTML = h;
        w.querySelectorAll('[data-p]').forEach(function(btn){
            btn.onclick = function(){ var p=parseInt(btn.getAttribute('data-p'),10); if(p>=1&&p<=pages&&p!==_page){_page=p;_load();} };
        });
    }

    /* ==================== DISPATCH ==================== */
    function _dispatch(a, id) {
        switch(a){
            case 'view': _detailModal(id); break;
            case 'edit': _editModal(id); break;
            case 'validate': _validate(id); break;
            case 'pay': _payModal(id); break;
            case 'send': _sendModal(id); break;
            case 'remind': _remind(id); break;
            case 'delete': _del(id); break;
            case 'duplicate': _dup(id); break;
            case 'stripe': _stripeCheckout(id); break;
        }
    }

    /* ==================== STRIPE CHECKOUT ==================== */
    async function _stripeCheckout(id) {
        try {
            var status = await AccountingApi.getStripeStatus();
            if (!status || !status.enabled) {
                _toast('Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env', 'warning');
                return;
            }
            _toast('Création du lien de paiement...', 'info');
            var baseUrl = window.location.origin + window.location.pathname;
            var result = await AccountingApi.createCheckoutSession(
                id,
                baseUrl + '?payment=success&invoice=' + id,
                baseUrl + '?payment=cancel&invoice=' + id
            );
            if (result && result.checkout_url) {
                window.open(result.checkout_url, '_blank');
            } else {
                _toast('Lien de paiement généré', 'success');
            }
        } catch (err) {
            _toast('Erreur Stripe : ' + (err.message || 'Impossible de créer le paiement'), 'error');
        }
    }

    /* ==================== DETAIL MODAL ==================== */
    async function _detailModal(id) {
        try {
            var r = await AccountingApi.getInvoice(id);
            var d = r.data || r;
            var st = STATUS_MAP[d.status] || STATUS_MAP.draft;
            var tp = TYPE_MAP[d.type] || TYPE_MAP.expense;
            var lines = d.line_items || d.lines || [];
            var hist = d.history || d.status_history || [];

            var ov = _overlay();
            var bd = ov.querySelector('.acc-mb');

            var x = '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">' +
                '<div><h2 style="margin:0 0 8px;color:var(--text-primary)">Facture '+_e(d.reference||d.id)+'</h2>' +
                '<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.8rem;font-weight:600;color:'+st.color+';background:'+st.bg+';margin-right:8px">'+st.label+'</span>' +
                '<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.8rem;font-weight:600;color:'+tp.color+';background:'+tp.bg+'">'+tp.label+'</span></div>' +
                '<div style="font-size:1.6rem;font-weight:700;color:var(--text-primary);font-family:monospace">'+EUR.format(d.total_ttc||0)+'</div></div>';

            x += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">';
            x += _df('Fournisseur / Client', d.contact_name||d.client_name||'-');
            x += _df('Date de facturation', d.date?DATEFMT.format(new Date(d.date)):'-');
            x += _df("Date d'echeance", d.due_date?DATEFMT.format(new Date(d.due_date)):'-');
            x += _df('Categorie', _catName(d.category_id));
            x += _df('Departement', d.department||'-');
            x += _df('Type de document', d.document_type||'Facture');
            x += '</div>';

            if (d.scan_url) {
                x += '<div style="margin-bottom:20px"><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:6px;font-size:.85rem">Piece jointe</label>' +
                    '<img src="'+_e(d.scan_url)+'" alt="Scan" loading="lazy" style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid var(--border-color)"></div>';
            }

            x += '<h3 style="color:var(--text-primary);margin:0 0 12px;font-size:1rem">Lignes de facturation</h3>' +
                '<table style="width:100%;border-collapse:collapse;font-size:.85rem;margin-bottom:20px">' +
                '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
                '<th style="'+THS+'">Description</th><th style="'+THS+'text-align:right">Qte</th>' +
                '<th style="'+THS+'text-align:right">PU HT</th><th style="'+THS+'text-align:right">TVA</th>' +
                '<th style="'+THS+'text-align:right">Total HT</th></tr></thead><tbody>';

            if (lines.length) {
                lines.forEach(function(l){
                    var lt = (l.quantity||1)*(l.unit_price||0);
                    x += '<tr style="border-bottom:1px solid var(--border-color)">' +
                        '<td style="'+TDS+'">'+_e(l.description||'-')+'</td>' +
                        '<td style="'+TDS+'text-align:right">'+(l.quantity||1)+'</td>' +
                        '<td style="'+TDS+'text-align:right;font-family:monospace">'+EUR.format(l.unit_price||0)+'</td>' +
                        '<td style="'+TDS+'text-align:right">'+(l.tva_rate||0)+'%</td>' +
                        '<td style="'+TDS+'text-align:right;font-family:monospace">'+EUR.format(lt)+'</td></tr>';
                });
            } else {
                x += '<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-secondary)">Aucune ligne</td></tr>';
            }
            x += '</tbody></table>';

            var tvaTot = d.total_tva!=null?d.total_tva:((d.total_ttc||0)-(d.total_ht||0));
            x += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:24px">' +
                '<div style="display:flex;justify-content:space-between;width:250px"><span style="color:var(--text-secondary)">Total HT</span><span style="font-family:monospace">'+EUR.format(d.total_ht||0)+'</span></div>' +
                '<div style="display:flex;justify-content:space-between;width:250px"><span style="color:var(--text-secondary)">TVA</span><span style="font-family:monospace">'+EUR.format(tvaTot)+'</span></div>' +
                '<div style="display:flex;justify-content:space-between;width:250px;padding-top:6px;border-top:2px solid var(--border-color)"><span style="font-weight:700;color:var(--text-primary)">Total TTC</span><span style="font-family:monospace;font-weight:700;font-size:1.1rem">'+EUR.format(d.total_ttc||0)+'</span></div></div>';

            if (d.notes) {
                x += '<div style="margin-bottom:20px"><h3 style="color:var(--text-primary);font-size:1rem;margin:0 0 8px">Notes</h3>' +
                    '<p style="color:var(--text-secondary);margin:0;white-space:pre-wrap">'+_e(d.notes)+'</p></div>';
            }

            if (hist.length) {
                x += '<div style="margin-bottom:20px"><h3 style="color:var(--text-primary);font-size:1rem;margin:0 0 12px">Historique</h3>' +
                    '<ul style="list-style:none;padding:0;margin:0;border-left:2px solid var(--border-color);padding-left:16px">';
                hist.forEach(function(ev){
                    x += '<li style="position:relative;padding:8px 0"><div style="position:absolute;left:-22px;top:12px;width:12px;height:12px;border-radius:50%;background:var(--accent-primary);border:2px solid var(--bg-primary)"></div>' +
                        '<span style="font-size:.8rem;color:var(--text-secondary)">'+(ev.date?DATEFMT.format(new Date(ev.date)):'-')+'</span> ' +
                        '<span style="color:var(--text-primary)">'+_e(ev.event||ev.action||'-')+'</span>' +
                        (ev.user?' <span style="color:var(--text-secondary);font-size:.85rem">par '+_e(ev.user)+'</span>':'')+'</li>';
                });
                x += '</ul></div>';
            }

            x += '<div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border-color)">';
            if (d.status==='draft') {
                x += '<button data-act="edit" style="'+_mbtn('var(--accent-primary)')+'">Modifier</button>';
                x += '<button data-act="validate" style="'+_mbtn('var(--success-color)')+'">Valider</button>';
            }
            if (d.status==='validated') {
                x += '<button data-act="send" style="'+_mbtn('#8b5cf6')+'">Envoyer</button>';
                x += '<button data-act="pay" style="'+_mbtn('var(--success-color)')+'">Marquer payee</button>';
            }
            if (d.status==='sent'||d.status==='overdue') {
                x += '<button data-act="pay" style="'+_mbtn('var(--success-color)')+'">Marquer payee</button>';
                x += '<button data-act="remind" style="'+_mbtn('var(--warning-color)')+'">Envoyer relance</button>';
            }
            x += '<button data-act="duplicate" style="'+_mbtn('var(--text-secondary)')+'">Dupliquer</button></div>';

            bd.innerHTML = x;
            _showOv(ov);

            ov.querySelectorAll('[data-act]').forEach(function(btn){
                btn.onclick = function(){ _closeOv(ov); _dispatch(btn.getAttribute('data-act'), d.id); };
            });
        } catch(err) { _toast('Erreur lors du chargement de la facture.','error'); }
    }

    /* ==================== CREATE/EDIT FORM MODAL ==================== */
    function _formModal(invoice) {
        var isEdit = !!invoice;
        var ov = _overlay();
        var bd = ov.querySelector('.acc-mb');
        var contacts = AccState.getState('contacts') || [];
        var categories = AccState.getState('categories') || [];
        var departments = AccState.getState('departments') || [];
        var lines = (invoice && (invoice.line_items||invoice.lines)) || [{description:'',quantity:1,unit_price:0,tva_rate:20}];

        var cOp = '<option value="">-- Selectionner --</option>' + contacts.map(function(c){
            var s = invoice && String(invoice.contact_id)===String(c.id) ? ' selected':'';
            return '<option value="'+c.id+'"'+s+'>'+_e(c.name)+'</option>';
        }).join('');
        var caOp = '<option value="">-- Selectionner --</option>' + categories.map(function(c){
            var s = invoice && String(invoice.category_id)===String(c.id) ? ' selected':'';
            return '<option value="'+c.id+'"'+s+'>'+_e(c.name)+'</option>';
        }).join('');
        var dpOp = '<option value="">-- Aucun --</option>' + departments.map(function(d){
            var did=d.id||d, dn=d.name||d;
            var s = invoice && invoice.department===did ? ' selected':'';
            return '<option value="'+did+'"'+s+'>'+_e(dn)+'</option>';
        }).join('');

        var today = new Date().toISOString().substring(0,10);
        var iD = invoice ? (invoice.date||'').substring(0,10) : today;
        var iDu = invoice ? (invoice.due_date||'').substring(0,10) : '';

        var f = '<h2 style="margin:0 0 20px;color:var(--text-primary)">'+(isEdit?'Modifier la facture':'Nouvelle facture')+'</h2><form id="acc-inv-fm">';
        f += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
        f += _fg('Type *','<select name="type" required style="'+SS+'width:100%"><option value="expense"'+(invoice&&invoice.type==='expense'?' selected':'')+'>Depense</option><option value="income"'+(invoice&&invoice.type==='income'?' selected':'')+'>Revenu</option></select>');
        f += _fg('Type de document','<select name="document_type" style="'+SS+'width:100%"><option value="invoice"'+(invoice&&invoice.document_type==='invoice'?' selected':'')+'>Facture</option><option value="credit_note"'+(invoice&&invoice.document_type==='credit_note'?' selected':'')+'>Avoir</option><option value="proforma"'+(invoice&&invoice.document_type==='proforma'?' selected':'')+'>Proforma</option></select>');
        f += _fg('Fournisseur / Client *','<select name="contact_id" required style="'+SS+'width:100%">'+cOp+'</select>');
        f += _fg('Reference','<input type="text" name="reference" style="'+IS+'width:100%" value="'+_e(invoice?invoice.reference||'':'')+'" placeholder="FA-2026-0001">');
        f += _fg('Date de facturation *','<input type="date" name="date" required style="'+IS+'width:100%" value="'+iD+'">');
        f += _fg("Date d'echeance",'<input type="date" name="due_date" style="'+IS+'width:100%" value="'+iDu+'">');
        f += _fg('Categorie','<select name="category_id" style="'+SS+'width:100%">'+caOp+'</select>');
        f += _fg('Departement','<select name="department" style="'+SS+'width:100%">'+dpOp+'</select>');
        f += '</div>';

        f += '<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
            '<h3 style="margin:0;color:var(--text-primary);font-size:1rem">Lignes</h3>' +
            '<button type="button" id="acc-addl" style="padding:4px 12px;border:1px dashed var(--border-color);border-radius:6px;background:transparent;color:var(--accent-primary);cursor:pointer;font-size:.85rem">+ Ajouter une ligne</button></div>';
        f += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'width:38%">Description</th><th style="'+THS+'width:10%;text-align:right">Qte</th>' +
            '<th style="'+THS+'width:15%;text-align:right">PU HT</th><th style="'+THS+'width:12%">TVA %</th>' +
            '<th style="'+THS+'width:15%;text-align:right">Total HT</th><th style="'+THS+'width:10%"></th>' +
            '</tr></thead><tbody id="acc-lns"></tbody></table></div></div>';

        f += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:20px">' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total HT</span><span style="font-family:monospace" id="acc-ht">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px"><span style="color:var(--text-secondary)">Total TVA</span><span style="font-family:monospace" id="acc-tv">'+EUR.format(0)+'</span></div>' +
            '<div style="display:flex;justify-content:space-between;width:260px;padding-top:6px;border-top:2px solid var(--border-color)"><span style="font-weight:700;color:var(--text-primary)">Total TTC</span><span style="font-family:monospace;font-weight:700;font-size:1.1rem" id="acc-tc">'+EUR.format(0)+'</span></div></div>';

        f += '<div style="margin-bottom:20px"><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.85rem">Notes</label>' +
            '<textarea name="notes" rows="3" placeholder="Notes internes..." style="'+IS+'width:100%;resize:vertical;font-family:inherit">'+_e(invoice?invoice.notes||'':'')+'</textarea></div>';

        f += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border-color)">' +
            '<button type="button" id="acc-cn" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer;font-weight:600;font-size:.9rem">Annuler</button>' +
            '<button type="submit" name="sa" value="draft" style="padding:8px 18px;border:1px solid var(--accent-primary);border-radius:8px;background:transparent;color:var(--accent-primary);cursor:pointer;font-weight:600;font-size:.9rem">Enregistrer en brouillon</button>' +
            '<button type="submit" name="sa" value="validate" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Enregistrer et valider</button></div></form>';

        bd.innerHTML = f;

        var tbody = ov.querySelector('#acc-lns');
        lines.forEach(function(l){ _addLine(tbody, l, ov); });
        _calc(ov);

        ov.querySelector('#acc-addl').onclick = function(){ _addLine(tbody, {description:'',quantity:1,unit_price:0,tva_rate:20}, ov); };
        ov.querySelector('#acc-cn').onclick = function(){ _closeOv(ov); };

        var sAct = 'draft';
        ov.querySelectorAll('[name="sa"]').forEach(function(btn){ btn.onclick = function(){ sAct = btn.value; }; });
        ov.querySelector('#acc-inv-fm').onsubmit = async function(ev){
            ev.preventDefault();
            await _save(ov, sAct, isEdit ? invoice.id : null);
        };

        _showOv(ov);
    }

    async function _editModal(id) {
        try { var r = await AccountingApi.getInvoice(id); _formModal(r.data||r); }
        catch(err) { _toast('Erreur lors du chargement.','error'); }
    }

    /* ==================== LINE ITEMS ==================== */
    function _addLine(tbody, ln, ctx) {
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

        tr.querySelector('.acc-lrm').onclick = function(){ tr.remove(); _calc(ctx); };
        ['lq','lp','lt'].forEach(function(n){
            var inp = tr.querySelector('[name="'+n+'"]');
            inp.oninput = function(){ _calc(ctx); };
            inp.onchange = function(){ _calc(ctx); };
        });
        tbody.appendChild(tr);
        _calc(ctx);
    }

    function _calc(ctx) {
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
        var eH=ctx.querySelector('#acc-ht'), eV=ctx.querySelector('#acc-tv'), eT=ctx.querySelector('#acc-tc');
        if(eH) eH.textContent = EUR.format(tH);
        if(eV) eV.textContent = EUR.format(tV);
        if(eT) eT.textContent = EUR.format(tH+tV);
    }

    /* ==================== SAVE ==================== */
    async function _save(ov, action, exId) {
        var form = ov.querySelector('#acc-inv-fm');
        var fd = new FormData(form);
        var items = [];
        ov.querySelectorAll('.acc-lr').forEach(function(r){
            items.push({
                description: r.querySelector('[name="ld"]').value,
                quantity: parseFloat(r.querySelector('[name="lq"]').value)||0,
                unit_price: parseFloat(r.querySelector('[name="lp"]').value)||0,
                tva_rate: parseFloat(r.querySelector('[name="lt"]').value)||0
            });
        });
        if (!items.length) { _toast('Ajoutez au moins une ligne de facturation.','warning'); return; }
        if (items.some(function(l){ return !l.description.trim(); })) {
            _toast('Toutes les lignes doivent avoir une description.','warning'); return;
        }
        var tH=0, tV=0;
        items.forEach(function(l){ var h=l.quantity*l.unit_price; tH+=h; tV+=h*(l.tva_rate/100); });

        var payload = {
            type: fd.get('type'), document_type: fd.get('document_type'),
            contact_id: fd.get('contact_id'), reference: fd.get('reference')||null,
            date: fd.get('date'), due_date: fd.get('due_date')||null,
            category_id: fd.get('category_id')||null, department: fd.get('department')||null,
            notes: fd.get('notes')||null, line_items: items,
            total_ht: Math.round(tH*100)/100, total_tva: Math.round(tV*100)/100,
            total_ttc: Math.round((tH+tV)*100)/100,
            status: action==='validate'?'validated':'draft'
        };
        try {
            _setLd(ov, true);
            if (exId) { await AccountingApi.updateInvoice(exId, payload); _toast('Facture mise a jour.','success'); }
            else { await AccountingApi.createInvoice(payload); _toast('Facture creee.','success'); }
            _closeOv(ov); _load();
        } catch(err) { _toast('Erreur : '+(err.message||'Impossible de sauvegarder.'),'error'); }
        finally { _setLd(ov, false); }
    }

    /* ==================== QUICK ACTIONS ==================== */
    async function _validate(id) {
        if (!confirm('Valider cette facture ? Cette action est irreversible.')) return;
        try { await AccountingApi.updateInvoiceStatus(id,'validated'); _toast('Facture validee.','success'); _load(); }
        catch(e) { _toast('Erreur lors de la validation.','error'); }
    }

    function _payModal(id) {
        var ov = _overlay('480px');
        var bd = ov.querySelector('.acc-mb');
        bd.innerHTML = '<h2 style="margin:0 0 20px;color:var(--text-primary)">Marquer comme payee</h2><form id="acc-pf">' +
            _fg('Mode de paiement *','<select name="pm" required style="'+SS+'width:100%">'+PAY_METHODS.map(function(m){return '<option value="'+m.value+'">'+m.label+'</option>';}).join('')+'</select>') +
            _fg('Date de paiement *','<input type="date" name="pd" required style="'+IS+'width:100%" value="'+new Date().toISOString().substring(0,10)+'">') +
            _fg('Reference de paiement','<input type="text" name="pr" style="'+IS+'width:100%" placeholder="N de transaction, cheque...">') +
            '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border-color)">' +
            '<button type="button" class="acc-ccl" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer;font-weight:600;font-size:.9rem">Annuler</button>' +
            '<button type="submit" style="padding:8px 18px;border:none;border-radius:8px;background:var(--success-color);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Confirmer le paiement</button></div></form>';

        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };
        ov.querySelector('#acc-pf').onsubmit = async function(ev){
            ev.preventDefault(); var fd = new FormData(ev.target);
            try {
                _setLd(ov,true);
                await AccountingApi.updateInvoiceStatus(id,'paid',{
                    payment_method: fd.get('pm'), payment_date: fd.get('pd'),
                    payment_reference: fd.get('pr')||null
                });
                _toast('Facture marquee comme payee.','success'); _closeOv(ov); _load();
            } catch(e){ _toast('Erreur lors du paiement.','error'); }
            finally{ _setLd(ov,false); }
        };
        _showOv(ov);
    }

    async function _sendModal(id) {
        var ov = _overlay('500px');
        var bd = ov.querySelector('.acc-mb');
        bd.innerHTML = '<h2 style="margin:0 0 8px;color:var(--text-primary)">Envoyer la facture</h2>' +
            '<p style="color:var(--text-secondary);margin:0 0 16px">Confirmer l\'envoi par email au contact associe.</p>' +
            _fg('Email destinataire','<input type="email" id="acc-se" style="'+IS+'width:100%" placeholder="email@exemple.fr">') +
            _fg('Message personnalise (optionnel)','<textarea id="acc-sm" rows="3" style="'+IS+'width:100%;resize:vertical;font-family:inherit" placeholder="Bonjour, veuillez trouver ci-joint..."></textarea>') +
            '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid var(--border-color)">' +
            '<button class="acc-ccl" style="padding:8px 18px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer;font-weight:600;font-size:.9rem">Annuler</button>' +
            '<button class="acc-cfm" style="padding:8px 18px;border:none;border-radius:8px;background:var(--accent-primary);color:#fff;cursor:pointer;font-weight:600;font-size:.9rem">Envoyer</button></div>';

        ov.querySelector('.acc-ccl').onclick = function(){ _closeOv(ov); };
        ov.querySelector('.acc-cfm').onclick = async function(){
            try {
                _setLd(ov,true);
                await AccountingApi.sendInvoice(id,{
                    email: ov.querySelector('#acc-se').value||null,
                    message: ov.querySelector('#acc-sm').value||null
                });
                _toast('Facture envoyee.','success'); _closeOv(ov); _load();
            } catch(e){ _toast("Erreur lors de l'envoi.",'error'); }
            finally{ _setLd(ov,false); }
        };
        _showOv(ov);
    }

    async function _remind(id) {
        if (!confirm('Envoyer une relance pour cette facture en retard ?')) return;
        try { await AccountingApi.sendReminder(id); _toast('Relance envoyee.','success'); _load(); }
        catch(e){ _toast("Erreur lors de l'envoi de la relance.",'error'); }
    }

    async function _del(id) {
        if (!confirm('Supprimer cette facture ? Cette action est irreversible.')) return;
        try { await AccountingApi.deleteInvoice(id); _toast('Facture supprimee.','success'); _load(); }
        catch(e){ _toast('Erreur lors de la suppression.','error'); }
    }

    async function _dup(id) {
        try {
            var r = await AccountingApi.getInvoice(id);
            var d = r.data||r;
            var c = Object.assign({},d);
            delete c.id; c.reference=''; c.status='draft';
            c.date = new Date().toISOString().substring(0,10);
            c.due_date=''; c.history=[]; c.status_history=[];
            _formModal(c);
            _toast('Facture dupliquee en brouillon.','info');
        } catch(e){ _toast('Erreur lors de la duplication.','error'); }
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
    function _catName(cid) {
        if(!cid) return '-';
        var cs = AccState.getState('categories')||[];
        var f = cs.find(function(c){ return String(c.id)===String(cid); });
        return f ? f.name : '-';
    }
    function _deb(fn,ms) { var t; return function(){ var c=this,a=arguments; clearTimeout(t); t=setTimeout(function(){fn.apply(c,a);},ms); }; }
    function _toast(m,t) {
        if(typeof window.showToast==='function') window.showToast(m,t);
        else if(typeof Notify!=='undefined'&&Notify.show) Notify.show(m,t);
        else console.log('[AccInvoices]',t,m);
    }
    function _df(l,v) { return '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:2px;font-size:.8rem">'+l+'</label><span style="color:var(--text-primary)">'+_e(v)+'</span></div>'; }
    function _fg(l,html) { return '<div style="margin-bottom:12px"><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.85rem">'+l+'</label>'+html+'</div>'; }

    function refresh() { if(_ctn) _load(); }

    return { render: render, refresh: refresh };
})();
