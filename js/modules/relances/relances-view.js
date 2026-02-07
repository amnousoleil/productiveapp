/**
 * RelancesView - Vue Relances automatiques
 */
const RelancesView = (function() {
  'use strict';
  let _tab = 'overdue';

  function render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:1100px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="margin:0;color:var(--text-primary)">Relances automatiques</h2>
          <div style="display:flex;gap:8px">
            <button onclick="RelancesView.scheduleAll()" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Planifier</button>
            <button onclick="RelancesView.processAll()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Envoyer les relances</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button onclick="RelancesView.switchTab('overdue')" id="rel-tab-overdue" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Impay\u00e9es</button>
          <button onclick="RelancesView.switchTab('reminders')" id="rel-tab-reminders" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Relances</button>
          <button onclick="RelancesView.switchTab('settings')" id="rel-tab-settings" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Param\u00e8tres</button>
        </div>
        <div id="relances-content"></div>
      </div>`;
    loadData();
  }

  function switchTab(tab) {
    _tab = tab;
    ['overdue', 'reminders', 'settings'].forEach(function(t) {
      var btn = document.getElementById('rel-tab-' + t);
      if (btn) { btn.style.background = t === tab ? 'var(--accent-color)' : 'var(--bg-secondary)'; btn.style.color = t === tab ? '#fff' : 'var(--text-primary)'; }
    });
    loadData();
  }

  async function loadData() {
    var el = document.getElementById('relances-content');
    if (!el) return;
    try {
      if (_tab === 'settings') { renderSettings(el); }
      else if (_tab === 'reminders') {
        var reminders = await RelancesApi.listReminders();
        renderReminders(el, reminders || []);
      } else {
        var report = await RelancesApi.getOverdueReport();
        renderOverdue(el, report || {});
      }
    } catch (e) { console.error('Relances load:', e); el.innerHTML = '<div style="color:var(--text-secondary);padding:20px">Erreur chargement</div>'; }
  }

  function renderOverdue(el, report) {
    var invoices = report.overdue_invoices || [];
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px">';
    html += card('Factures en retard', report.total_overdue || invoices.length, '#EF4444');
    html += card('Montant total', fmt(report.total_amount || invoices.reduce(function(s, i) { return s + parseFloat(i.montant_ttc || 0); }, 0)), '#F59E0B');
    html += card('Retard moyen', (report.avg_days_overdue || 0) + ' jours', '#6B7280');
    html += '</div>';
    if (!invoices.length) { html += '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucune facture en retard</div>'; }
    else {
      html += '<div style="display:flex;flex-direction:column;gap:10px">';
      invoices.forEach(function(inv) {
        var days = inv.days_overdue || Math.floor((Date.now() - new Date(inv.date_echeance).getTime()) / 86400000);
        var urgency = days > 60 ? '#EF4444' : days > 30 ? '#F59E0B' : '#3B82F6';
        html += '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);border-left:4px solid ' + urgency + ';display:flex;justify-content:space-between;align-items:center">' +
          '<div><div style="font-weight:600;color:var(--text-primary)">' + esc(inv.reference || inv.numero || 'Facture') + '</div><div style="font-size:0.85rem;color:var(--text-secondary)">' + esc(inv.contact_name || '') + ' - ' + fmt(inv.montant_ttc) + '</div></div>' +
          '<div style="display:flex;align-items:center;gap:10px"><span style="padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:' + urgency + '20;color:' + urgency + '">' + days + ' jours</span></div></div>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderReminders(el, reminders) {
    if (!reminders.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucune relance planifi\u00e9e</div>'; return; }
    var tierColors = { 1: '#3B82F6', 2: '#F59E0B', 3: '#EF4444' };
    var tierLabels = { 1: 'Rappel amical', 2: 'Relance ferme', 3: 'Mise en demeure' };
    var statusLabels = { pending: 'En attente', sent: 'Envoy\u00e9e', cancelled: 'Annul\u00e9e' };
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">' + reminders.map(function(r) {
      var color = tierColors[r.tier] || '#6B7280';
      return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center">' +
        '<div><div style="font-weight:600;color:var(--text-primary)">' + esc(r.invoice_reference || 'Facture') + ' - ' + (tierLabels[r.tier] || 'Palier ' + r.tier) + '</div><div style="font-size:0.85rem;color:var(--text-secondary)">Pr\u00e9vue: ' + fmtDate(r.scheduled_date || r.created_at) + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px"><span style="padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:' + color + '20;color:' + color + '">' + (statusLabels[r.status] || r.status) + '</span>' +
        (r.status === 'pending' ? '<button onclick="RelancesView.cancel(\'' + r.id + '\')" style="padding:4px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-secondary);cursor:pointer;font-size:0.8rem">Annuler</button>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  }

  async function renderSettings(el) {
    try {
      var settings = await RelancesApi.getSettings();
      var s = settings || { tiers: [{ delay_days: 7, subject: 'Rappel de paiement' }, { delay_days: 15, subject: 'Relance' }, { delay_days: 30, subject: 'Dernière relance' }] };
      var tiers = s.tiers || s || [];
      if (!Array.isArray(tiers)) tiers = [tiers];
      el.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<div style="background:var(--bg-secondary);border-radius:12px;padding:20px;border:1px solid var(--border-color)">' +
        '<h3 style="margin:0 0 16px;color:var(--text-primary)">Paliers de relance</h3>' +
        '<div style="display:flex;flex-direction:column;gap:12px">' +
        tiers.map(function(t, i) {
          return '<div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:12px;background:var(--bg-primary);border-radius:8px">' +
            '<span style="font-weight:600;color:var(--accent-color)">Palier ' + (i + 1) + '</span>' +
            '<div style="display:flex;gap:12px;align-items:center"><label style="color:var(--text-secondary);font-size:0.85rem">Apr\u00e8s <input type="number" value="' + (t.delay_days || 7) + '" id="rel-delay-' + i + '" style="width:60px;padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);text-align:center"> jours</label>' +
            '<input value="' + esc(t.subject || '') + '" id="rel-subject-' + i + '" placeholder="Objet" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"></div></div>';
        }).join('') +
        '</div>' +
        '<button onclick="RelancesView.saveSettings(' + tiers.length + ')" style="margin-top:12px;padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600;align-self:flex-end">Sauvegarder</button>' +
        '</div></div>';
    } catch (e) { el.innerHTML = '<div style="color:var(--text-secondary);padding:20px">Erreur chargement param\u00e8tres</div>'; }
  }

  async function saveSettings(count) {
    var tiers = [];
    for (var i = 0; i < count; i++) {
      tiers.push({ delay_days: parseInt(document.getElementById('rel-delay-' + i)?.value) || 7, subject: document.getElementById('rel-subject-' + i)?.value || '' });
    }
    try { await RelancesApi.updateSettings({ tiers: tiers }); } catch (e) { console.error('Save settings:', e); }
  }

  async function scheduleAll() { try { var r = await RelancesApi.schedule(); console.log('Scheduled:', r); loadData(); } catch (e) { console.error('Schedule:', e); } }
  async function processAll() { try { var r = await RelancesApi.process(); console.log('Processed:', r); loadData(); } catch (e) { console.error('Process:', e); } }
  async function cancel(id) { try { await RelancesApi.cancelReminder(id); loadData(); } catch (e) { console.error('Cancel:', e); } }

  function card(label, value, color) { return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);text-align:center"><div style="font-size:1.5rem;font-weight:700;color:' + color + '">' + value + '</div><div style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px">' + label + '</div></div>'; }
  function fmt(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0); }
  function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('fr-FR'); } catch(e) { return d; } }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { render: render, refresh: loadData, switchTab: switchTab, scheduleAll: scheduleAll, processAll: processAll, cancel: cancel, saveSettings: saveSettings };
})();
if (typeof window !== 'undefined') window.RelancesView = RelancesView;
