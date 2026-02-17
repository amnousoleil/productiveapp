/**
 * ContractsView - Vue Contrats et Signatures electroniques
 */
const ContractsView = (function() {
  'use strict';
  let _tab = 'contracts';

  function render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:1100px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="margin:0;color:var(--text-primary)">Contrats</h2>
          <button onclick="ContractsView.showCreate()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ Nouveau contrat</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button onclick="ContractsView.switchTab('contracts')" id="ct-tab-contracts" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Contrats</button>
          <button onclick="ContractsView.switchTab('templates')" id="ct-tab-templates" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Templates</button>
        </div>
        <div id="contracts-content"></div>
      </div>
      <div id="contracts-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadData();
  }

  function switchTab(tab) {
    _tab = tab;
    ['contracts', 'templates'].forEach(function(t) {
      var btn = document.getElementById('ct-tab-' + t);
      if (btn) { btn.style.background = t === tab ? 'var(--accent-color)' : 'var(--bg-secondary)'; btn.style.color = t === tab ? '#fff' : 'var(--text-primary)'; }
    });
    loadData();
  }

  async function loadData() {
    var el = document.getElementById('contracts-content');
    if (!el) return;
    try {
      if (_tab === 'templates') {
        var tpls = await ContractsApi.listTemplates();
        renderTemplates(el, tpls || []);
      } else {
        var res = await ContractsApi.listContracts({});
        renderContracts(el, (res && res.data) || res || []);
      }
    } catch (e) { console.error('Contracts load:', e); el.innerHTML = '<div style="color:var(--text-secondary);padding:20px">Erreur chargement</div>'; }
  }

  function renderContracts(el, contracts) {
    if (!contracts.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucun contrat</div>'; return; }
    var statusColors = { draft: '#6B7280', sent: '#3B82F6', signed: '#10B981', expired: '#EF4444', cancelled: '#9CA3AF' };
    var statusLabels = { draft: 'Brouillon', sent: 'Envoye', signed: 'Signe', expired: 'Expire', cancelled: 'Annule' };
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">' + contracts.map(function(c) {
      var color = statusColors[c.status] || '#6B7280';
      return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center">' +
        '<div><div style="font-weight:600;color:var(--text-primary)">' + esc(c.title) + '</div><div style="font-size:0.85rem;color:var(--text-secondary);margin-top:2px">' + (c.contact_name ? esc(c.contact_name) + ' - ' : '') + fmt(c.value) + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px"><span style="padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:' + color + '20;color:' + color + '">' + (statusLabels[c.status] || c.status) + '</span>' +
        (c.status === 'draft' ? '<button onclick="ContractsView.sendSign(\'' + c.id + '\')" style="padding:6px 12px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-size:0.8rem">Envoyer</button>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  }

  function renderTemplates(el, tpls) {
    if (!tpls.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucun template</div>'; return; }
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">' + tpls.map(function(t) {
      return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)"><div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">' + esc(t.name) + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">' + (t.category || 'General') + '</div></div>';
    }).join('') + '</div>';
  }

  function showCreate() {
    var modal = document.getElementById('contracts-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:600px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color)"><h3 style="margin:0 0 16px;color:var(--text-primary)">Nouveau contrat</h3><div style="display:flex;flex-direction:column;gap:12px"><input id="ct-title" placeholder="Titre du contrat" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><input id="ct-value" type="number" placeholder="Valeur (EUR)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><input id="ct-end" type="date" placeholder="Date fin" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"></div><textarea id="ct-content" placeholder="Contenu du contrat..." rows="8" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);resize:vertical;font-family:inherit"></textarea></div><div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end"><button onclick="ContractsView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Annuler</button><button onclick="ContractsView.saveContract()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Creer</button></div></div>';
  }

  async function saveContract() {
    var title = document.getElementById('ct-title')?.value?.trim();
    var content = document.getElementById('ct-content')?.value?.trim();
    if (!title || !content) return;
    try {
      await ContractsApi.createContract({ title: title, content: content, value: parseFloat(document.getElementById('ct-value')?.value) || 0, end_date: document.getElementById('ct-end')?.value || undefined });
      closeModal(); loadData();
    } catch (e) { console.error('Create contract:', e); }
  }

  async function sendSign(id) {
    var email = prompt('Email du signataire:');
    var name = prompt('Nom du signataire:');
    if (!email || !name) return;
    try { await ContractsApi.sendForSignature(id, { signer_email: email, signer_name: name }); loadData(); } catch (e) { console.error('Send signature:', e); }
  }

  function closeModal() { var m = document.getElementById('contracts-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function fmt(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { render: render, refresh: loadData, switchTab: switchTab, showCreate: showCreate, saveContract: saveContract, sendSign: sendSign, closeModal: closeModal };
})();
if (typeof window !== 'undefined') window.ContractsView = ContractsView;
