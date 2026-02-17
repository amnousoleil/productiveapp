/**
 * AccRecurring - Module de gestion des factures recurrentes
 * ProductiveApp Accounting v3.0
 */
const AccRecurring = (function() {
    'use strict';

    var EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    var DATEFMT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    var FREQ_MAP = {
        weekly:     { label: 'Hebdomadaire', short: 'Hebdo' },
        biweekly:   { label: 'Bimensuelle',  short: 'Bi-mens.' },
        monthly:    { label: 'Mensuelle',    short: 'Mensuel' },
        quarterly:  { label: 'Trimestrielle', short: 'Trim.' },
        semiannual: { label: 'Semestrielle', short: 'Sem.' },
        annual:     { label: 'Annuelle',     short: 'Annuel' }
    };

    var STATUS_MAP = {
        active:  { label: 'Active',  color: 'var(--success-color)', bg: 'rgba(34,197,94,.12)' },
        paused:  { label: 'En pause', color: 'var(--warning-color)', bg: 'rgba(245,158,11,.12)' },
        ended:   { label: 'Terminee', color: 'var(--text-secondary)', bg: 'rgba(128,128,128,.12)' }
    };

    var SS = 'padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);font-size:.85rem;';
    var IS = SS + 'box-sizing:border-box;width:100%;';
    var THS = 'padding:8px 10px;text-align:left;font-weight:600;color:var(--text-secondary);font-size:.8rem;white-space:nowrap;';
    var TDS = 'padding:10px;color:var(--text-primary);';

    function _abtn(c) { return 'padding:3px 8px;border:1px solid '+c+';border-radius:4px;background:transparent;color:'+c+';cursor:pointer;font-size:.75rem;white-space:nowrap;'; }
    function _mbtn(c) { return 'padding:8px 18px;border:1px solid '+c+';border-radius:8px;background:transparent;cursor:pointer;font-weight:600;font-size:.9rem;color:'+c+';'; }
    function _pbtn(a) { return 'padding:6px 12px;border:1px solid '+(a?'var(--accent-primary)':'var(--border-color)')+';border-radius:6px;background:'+(a?'var(--accent-primary)':'transparent')+';color:'+(a?'#fff':'var(--text-primary)')+';cursor:pointer;font-size:.85rem;'; }

    var _ctn = null, _page = 1, _data = [];

    function _e(s) { var d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
    function _mk(t) { return document.createElement(t); }

    function _toast(m,t) {
        if (typeof window.showToast === 'function') window.showToast(m,t);
        else console.log('[AccRecurring]', t, m);
    }

    /* ==================== RENDER ==================== */
    function render(container) {
        _ctn = container;
        _ctn.innerHTML = '';

        // Header
        var hdr = _mk('div');
        hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;';
        hdr.innerHTML = '<div><h2 style="margin:0;color:var(--text-primary);font-size:1.3rem">Factures recurrentes</h2>' +
            '<p style="margin:4px 0 0;color:var(--text-secondary);font-size:.85rem">Automatisez la generation de vos factures periodiques</p></div>' +
            '<div style="display:flex;gap:8px">' +
            '<button id="acc-rec-process" style="'+_mbtn('var(--success-color)')+'">Generer maintenant</button>' +
            '<button id="acc-rec-add" style="'+_mbtn('var(--accent-primary)')+'">+ Nouvelle recurrence</button></div>';
        _ctn.appendChild(hdr);

        // Table wrapper
        var tw = _mk('div');
        tw.id = 'acc-rec-tw';
        tw.style.cssText = 'border:1px solid var(--border-color);border-radius:12px;overflow-x:auto;';
        _ctn.appendChild(tw);

        // Events
        _ctn.querySelector('#acc-rec-add').onclick = function() { _formModal(null); };
        _ctn.querySelector('#acc-rec-process').onclick = _processNow;

        _load();
    }

    async function _load() {
        try {
            var r = await AccountingApi.getRecurringInvoices({ page: _page, limit: 50 });
            _data = (r && r.data) ? r.data : (Array.isArray(r) ? r : []);
            _renderTable();
        } catch(err) {
            _toast('Erreur chargement recurrences : ' + (err.message || ''), 'error');
        }
    }

    function _renderTable() {
        var tw = _ctn.querySelector('#acc-rec-tw');
        if (!_data.length) {
            tw.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">' +
                '<p style="font-size:1.1rem;margin:0 0 8px">Aucune facture recurrente</p>' +
                '<p style="font-size:.85rem">Creez un modele pour automatiser vos factures periodiques.</p></div>';
            return;
        }

        var h = '<table style="width:100%;border-collapse:collapse;font-size:.85rem">' +
            '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
            '<th style="'+THS+'">Fournisseur</th>' +
            '<th style="'+THS+'">Montant TTC</th>' +
            '<th style="'+THS+'">Frequence</th>' +
            '<th style="'+THS+'">Prochaine</th>' +
            '<th style="'+THS+'">Fin</th>' +
            '<th style="'+THS+'">Generees</th>' +
            '<th style="'+THS+'">Statut</th>' +
            '<th style="'+THS+'">Actions</th></tr></thead><tbody>';

        _data.forEach(function(r) {
            var st = STATUS_MAP[r.status] || STATUS_MAP.active;
            var fr = FREQ_MAP[r.frequency] || { short: r.frequency };
            h += '<tr data-id="'+r.id+'" style="border-bottom:1px solid var(--border-color);cursor:pointer">' +
                '<td style="'+TDS+'font-weight:500">'+_e(r.fournisseur||'-')+'</td>' +
                '<td style="'+TDS+'font-family:monospace;text-align:right">'+EUR.format(r.montant_ttc||0)+'</td>' +
                '<td style="'+TDS+'">'+fr.short+'</td>' +
                '<td style="'+TDS+'">'+(r.next_generation_date?DATEFMT.format(new Date(r.next_generation_date)):'-')+'</td>' +
                '<td style="'+TDS+'">'+(r.end_date?DATEFMT.format(new Date(r.end_date)):'-')+'</td>' +
                '<td style="'+TDS+'text-align:center">'+(r.generated_count||0)+'</td>' +
                '<td style="'+TDS+'"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.75rem;font-weight:600;color:'+st.color+';background:'+st.bg+'">'+st.label+'</span></td>' +
                '<td style="'+TDS+'">'+_rowActs(r)+'</td></tr>';
        });
        h += '</tbody></table>';
        tw.innerHTML = h;

        tw.querySelectorAll('[data-act]').forEach(function(btn) {
            btn.onclick = function(ev) {
                ev.stopPropagation();
                var act = btn.getAttribute('data-act');
                var id = btn.closest('tr').getAttribute('data-id');
                _dispatch(act, id);
            };
        });
    }

    function _rowActs(r) {
        var b = '';
        b += '<button data-act="edit" style="'+_abtn('var(--accent-primary)')+'">Modifier</button>';
        if (r.status === 'active') b += '<button data-act="pause" style="'+_abtn('var(--warning-color)')+'">Pause</button>';
        if (r.status === 'paused') b += '<button data-act="resume" style="'+_abtn('var(--success-color)')+'">Reprendre</button>';
        b += '<button data-act="delete" style="'+_abtn('var(--danger-color)')+'">Suppr.</button>';
        return '<div style="display:flex;gap:4px;flex-wrap:wrap">'+b+'</div>';
    }

    function _dispatch(act, id) {
        switch(act) {
            case 'edit': _formModal(id); break;
            case 'pause': _pause(id); break;
            case 'resume': _resume(id); break;
            case 'delete': _del(id); break;
        }
    }

    /* ==================== FORM MODAL ==================== */
    async function _formModal(existingId) {
        var existing = null;
        if (existingId) {
            try {
                var r = await AccountingApi.getRecurringInvoice(existingId);
                existing = r.data || r;
            } catch(e) { _toast('Erreur chargement', 'error'); return; }
        }

        var ov = _overlay();
        var bd = ov.querySelector('.acc-mb');
        bd.style.maxWidth = '600px';

        var title = existing ? 'Modifier la recurrence' : 'Nouvelle facture recurrente';
        var h = '<h2 style="margin:0 0 20px;color:var(--text-primary)">'+title+'</h2>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += _field('Fournisseur / Client *', '<input id="rf-fournisseur" style="'+IS+'" value="'+_e(existing?existing.fournisseur:'')+'">');
        h += _field('Type', '<select id="rf-type" style="'+IS+'"><option value="expense"'+(existing&&existing.type==='expense'?' selected':'')+'>Depense</option><option value="income"'+(existing&&existing.type==='income'?' selected':'')+'>Revenu</option></select>');
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">';
        h += _field('Montant HT', '<input id="rf-ht" type="number" step="0.01" style="'+IS+'" value="'+(existing?existing.montant_ht||'':'')+'">');
        h += _field('TVA (%)', '<input id="rf-tva" type="number" step="0.1" style="'+IS+'" value="'+(existing?existing.tva_rate||20:20)+'">');
        h += _field('Montant TTC', '<input id="rf-ttc" type="number" step="0.01" style="'+IS+'" value="'+(existing?existing.montant_ttc||'':'')+'">');
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        var freqOpts = '';
        Object.keys(FREQ_MAP).forEach(function(k) {
            freqOpts += '<option value="'+k+'"'+(existing&&existing.frequency===k?' selected':'')+'>'+FREQ_MAP[k].label+'</option>';
        });
        h += _field('Frequence *', '<select id="rf-freq" style="'+IS+'">'+freqOpts+'</select>');
        h += _field('Date de debut *', '<input id="rf-start" type="date" style="'+IS+'" value="'+(existing?_isoDate(existing.start_date):_isoDate(new Date()))+'">');
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += _field('Date de fin (optionnel)', '<input id="rf-end" type="date" style="'+IS+'" value="'+(existing&&existing.end_date?_isoDate(existing.end_date):'')+'">');
        h += _field('Max. generations (optionnel)', '<input id="rf-max" type="number" style="'+IS+'" value="'+(existing&&existing.max_occurrences?existing.max_occurrences:'')+'">');
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="rf-autoval"'+(existing&&existing.auto_validate?' checked':'')+'>  Auto-valider</label>';
        h += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="rf-autosend"'+(existing&&existing.auto_send?' checked':'')+'>  Auto-envoyer</label>';
        h += '</div>';

        h += _field('Description / Notes', '<textarea id="rf-desc" rows="2" style="'+IS+'resize:vertical">'+(existing?_e(existing.description||''):'')+'</textarea>');

        h += '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">' +
            '<button id="rf-cancel" style="'+_mbtn('var(--text-secondary)')+'">Annuler</button>' +
            '<button id="rf-save" style="'+_mbtn('var(--accent-primary)')+'">Sauvegarder</button></div>';

        bd.innerHTML = h;

        // Auto-calc TTC when HT or TVA changes
        var htIn = bd.querySelector('#rf-ht'), tvaIn = bd.querySelector('#rf-tva'), ttcIn = bd.querySelector('#rf-ttc');
        function calcTTC() {
            var ht = parseFloat(htIn.value) || 0;
            var tva = parseFloat(tvaIn.value) || 0;
            ttcIn.value = (ht * (1 + tva / 100)).toFixed(2);
        }
        htIn.oninput = calcTTC;
        tvaIn.oninput = calcTTC;

        bd.querySelector('#rf-cancel').onclick = function() { _closeOv(ov); };
        bd.querySelector('#rf-save').onclick = async function() {
            var fournisseur = bd.querySelector('#rf-fournisseur').value.trim();
            var freq = bd.querySelector('#rf-freq').value;
            var startDate = bd.querySelector('#rf-start').value;

            if (!fournisseur) { _toast('Le fournisseur est requis', 'warning'); return; }
            if (!startDate) { _toast('La date de debut est requise', 'warning'); return; }

            var payload = {
                fournisseur: fournisseur,
                type: bd.querySelector('#rf-type').value,
                montant_ht: parseFloat(bd.querySelector('#rf-ht').value) || 0,
                tva_rate: parseFloat(bd.querySelector('#rf-tva').value) || 20,
                montant_ttc: parseFloat(bd.querySelector('#rf-ttc').value) || 0,
                frequency: freq,
                start_date: startDate,
                end_date: bd.querySelector('#rf-end').value || null,
                max_occurrences: parseInt(bd.querySelector('#rf-max').value) || null,
                auto_validate: bd.querySelector('#rf-autoval').checked,
                auto_send: bd.querySelector('#rf-autosend').checked,
                description: bd.querySelector('#rf-desc').value.trim() || null
            };

            try {
                if (existingId) {
                    await AccountingApi.updateRecurringInvoice(existingId, payload);
                    _toast('Recurrence mise a jour.', 'success');
                } else {
                    await AccountingApi.createRecurringInvoice(payload);
                    _toast('Recurrence creee.', 'success');
                }
                _closeOv(ov);
                _load();
            } catch(err) {
                _toast('Erreur : ' + (err.message || 'Impossible de sauvegarder'), 'error');
            }
        };
    }

    /* ==================== ACTIONS ==================== */
    async function _pause(id) {
        try {
            await AccountingApi.pauseRecurringInvoice(id);
            _toast('Recurrence mise en pause.', 'success');
            _load();
        } catch(e) { _toast('Erreur lors de la mise en pause.', 'error'); }
    }

    async function _resume(id) {
        try {
            await AccountingApi.resumeRecurringInvoice(id);
            _toast('Recurrence reprise.', 'success');
            _load();
        } catch(e) { _toast('Erreur lors de la reprise.', 'error'); }
    }

    async function _del(id) {
        if (!confirm('Supprimer cette recurrence ? Cette action est irreversible.')) return;
        try {
            await AccountingApi.deleteRecurringInvoice(id);
            _toast('Recurrence supprimee.', 'success');
            _load();
        } catch(e) { _toast('Erreur lors de la suppression.', 'error'); }
    }

    async function _processNow() {
        try {
            _toast('Generation des factures en cours...', 'info');
            var r = await AccountingApi.processRecurringInvoices();
            var count = (r && r.generated) || 0;
            _toast(count + ' facture(s) generee(s).', 'success');
            _load();
        } catch(e) { _toast('Erreur lors de la generation.', 'error'); }
    }

    /* ==================== HELPERS ==================== */
    function _field(label, input) {
        return '<div><label style="display:block;font-weight:600;color:var(--text-secondary);margin-bottom:4px;font-size:.8rem">'+label+'</label>'+input+'</div>';
    }

    function _isoDate(d) {
        if (!d) return '';
        var dt = d instanceof Date ? d : new Date(d);
        return dt.toISOString().split('T')[0];
    }

    function _overlay() {
        var ov = _mk('div');
        ov.className = 'acc-overlay';
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        ov.innerHTML = '<div class="acc-mb" style="background:var(--bg-primary);border-radius:16px;padding:24px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)"></div>';
        ov.addEventListener('click', function(ev) { if (ev.target === ov) _closeOv(ov); });
        document.body.appendChild(ov);
        return ov;
    }

    function _closeOv(ov) { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }

    /* ==================== PUBLIC API ==================== */
    return {
        render: render,
        load: _load
    };
})();

if (typeof window !== 'undefined') {
    window.AccRecurring = AccRecurring;
}
