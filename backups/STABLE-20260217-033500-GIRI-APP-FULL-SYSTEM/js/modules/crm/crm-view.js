/**
 * CRMView - Vue Pipeline CRM Kanban
 */
const CRMView = (function() {
  'use strict';
  let _container = null;
  let _board = [];
  let _stats = null;
  let _currentDeal = null;

  function render(container) {
    _container = container;
    container.innerHTML = `
      <div class="crm-wrapper" style="padding:20px;max-width:1400px;margin:0 auto">
        <div class="crm-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <h2 style="margin:0;font-size:1.5rem;color:var(--text-primary)">Pipeline CRM</h2>
            <p style="margin:4px 0 0;color:var(--text-secondary);font-size:0.9rem">Gerez vos prospects et opportunites</p>
          </div>
          <div style="display:flex;gap:10px">
            <button onclick="CRMView.refresh()" class="btn-secondary" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Actualiser</button>
            <button onclick="CRMView.showCreateDeal()" class="btn-primary" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ Nouveau deal</button>
          </div>
        </div>
        <div id="crm-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px"></div>
        <div id="crm-board" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:20px;min-height:400px"></div>
      </div>
      <div id="crm-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadData();
  }

  async function loadData() {
    try {
      const [boardRes, statsRes] = await Promise.all([CRMApi.getDealBoard(), CRMApi.getStats()]);
      _board = boardRes || [];
      _stats = statsRes || {};
      renderStats();
      renderBoard();
    } catch (e) { console.error('CRM load error:', e); }
  }

  function renderStats() {
    const s = _stats;
    const el = document.getElementById('crm-stats');
    if (!el || !s) return;
    const cards = [
      { label: 'Deals actifs', value: s.open_count || 0, color: '#3B82F6', icon: '📊' },
      { label: 'Valeur pipeline', value: formatMoney(s.open_value || 0), color: '#8B5CF6', icon: '💰' },
      { label: 'Gagnes', value: s.won_count || 0, color: '#10B981', icon: '🏆' },
      { label: 'Taux conversion', value: (s.conversion_rate || 0) + '%', color: '#F59E0B', icon: '📈' },
    ];
    el.innerHTML = cards.map(c => `
      <div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.85rem;color:var(--text-secondary)">${c.label}</span>
          <span style="font-size:1.2rem">${c.icon}</span>
        </div>
        <div style="font-size:1.5rem;font-weight:700;color:${c.color};margin-top:8px">${c.value}</div>
      </div>
    `).join('');
  }

  function renderBoard() {
    const el = document.getElementById('crm-board');
    if (!el) return;
    if (!_board.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucun pipeline. Creez votre premier deal!</div>'; return; }
    el.innerHTML = _board.map(col => `
      <div class="crm-column" data-stage="${col.stage}" style="min-width:260px;max-width:300px;flex:1;background:var(--bg-tertiary);border-radius:12px;padding:12px;border:1px solid var(--border-color)"
           ondragover="event.preventDefault();this.style.borderColor='var(--accent-color)'" ondragleave="this.style.borderColor='var(--border-color)'" ondrop="CRMView.handleDrop(event,'${col.stage}')">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ${col.color || '#666'}">
          <span style="font-weight:600;color:var(--text-primary);font-size:0.9rem">${col.label || col.stage}</span>
          <span style="background:var(--bg-secondary);padding:2px 8px;border-radius:12px;font-size:0.8rem;color:var(--text-secondary)">${col.count}</span>
        </div>
        ${col.count > 0 ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px">${formatMoney(col.total_value)}</div>` : ''}
        <div class="crm-cards" style="display:flex;flex-direction:column;gap:8px;min-height:60px">
          ${(col.deals || []).map(d => renderDealCard(d)).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderDealCard(d) {
    return `
      <div class="crm-card" draggable="true" ondragstart="CRMView.handleDragStart(event,'${d.id}')"
           onclick="CRMView.showDealDetail('${d.id}')"
           style="background:var(--bg-secondary);border-radius:8px;padding:12px;cursor:pointer;border:1px solid var(--border-color);transition:transform 0.15s,box-shadow 0.15s"
           onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
           onmouseleave="this.style.transform='none';this.style.boxShadow='none'">
        <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);margin-bottom:4px">${escHtml(d.title)}</div>
        ${d.contact_name ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px">👤 ${escHtml(d.contact_name)}</div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600;color:var(--accent-color);font-size:0.9rem">${formatMoney(d.amount)}</span>
          ${d.expected_close_date ? `<span style="font-size:0.75rem;color:var(--text-secondary)">${new Date(d.expected_close_date).toLocaleDateString('fr-FR', {day:'numeric',month:'short'})}</span>` : ''}
        </div>
      </div>`;
  }

  function showCreateDeal() {
    const modal = document.getElementById('crm-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:500px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color)">
        <h3 style="margin:0 0 16px;color:var(--text-primary)">Nouveau deal</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          <input id="deal-title" placeholder="Titre du deal" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:0.95rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <input id="deal-amount" type="number" placeholder="Montant (EUR)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">
            <input id="deal-close" type="date" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">
          </div>
          <textarea id="deal-desc" placeholder="Description (optionnel)" rows="3" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);resize:vertical;font-family:inherit"></textarea>
          <select id="deal-stage" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">
            <option value="lead">Prospect</option><option value="qualified">Qualifie</option><option value="proposal">Proposition</option><option value="negotiation">Negociation</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button onclick="CRMView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Annuler</button>
          <button onclick="CRMView.saveDeal()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Creer</button>
        </div>
      </div>`;
  }

  async function saveDeal() {
    const title = document.getElementById('deal-title')?.value?.trim();
    if (!title) return;
    try {
      await CRMApi.createDeal({
        title, amount: parseFloat(document.getElementById('deal-amount')?.value) || 0,
        expected_close_date: document.getElementById('deal-close')?.value || undefined,
        description: document.getElementById('deal-desc')?.value || undefined,
        stage: document.getElementById('deal-stage')?.value || 'lead'
      });
      closeModal();
      loadData();
    } catch (e) { console.error('Create deal error:', e); }
  }

  async function showDealDetail(id) {
    try {
      const deal = await CRMApi.getDeal(id);
      if (!deal) return;
      _currentDeal = deal;
      const modal = document.getElementById('crm-modal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:600px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color)">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
            <h3 style="margin:0;color:var(--text-primary)">${escHtml(deal.title)}</h3>
            <button onclick="CRMView.closeModal()" style="background:none;border:none;color:var(--text-secondary);font-size:1.5rem;cursor:pointer">&times;</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div style="background:var(--bg-secondary);border-radius:8px;padding:12px"><div style="font-size:0.8rem;color:var(--text-secondary)">Montant</div><div style="font-size:1.2rem;font-weight:700;color:var(--accent-color)">${formatMoney(deal.amount)}</div></div>
            <div style="background:var(--bg-secondary);border-radius:8px;padding:12px"><div style="font-size:0.8rem;color:var(--text-secondary)">Etape</div><div style="font-size:1rem;font-weight:600;color:var(--text-primary)">${deal.stage}</div></div>
            ${deal.contact_name ? `<div style="background:var(--bg-secondary);border-radius:8px;padding:12px"><div style="font-size:0.8rem;color:var(--text-secondary)">Contact</div><div style="color:var(--text-primary)">${escHtml(deal.contact_name)}</div></div>` : ''}
            ${deal.expected_close_date ? `<div style="background:var(--bg-secondary);border-radius:8px;padding:12px"><div style="font-size:0.8rem;color:var(--text-secondary)">Date cloture</div><div style="color:var(--text-primary)">${new Date(deal.expected_close_date).toLocaleDateString('fr-FR')}</div></div>` : ''}
          </div>
          ${deal.description ? `<div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin-bottom:16px;color:var(--text-primary)">${escHtml(deal.description)}</div>` : ''}
          <h4 style="color:var(--text-primary);margin:0 0 8px">Activites</h4>
          <div style="margin-bottom:12px;display:flex;gap:8px">
            <input id="activity-title" placeholder="Nouvelle activite..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">
            <select id="activity-type" style="padding:8px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">
              <option value="call">Appel</option><option value="email">Email</option><option value="meeting">RDV</option><option value="note">Note</option>
            </select>
            <button onclick="CRMView.addActivity('${deal.id}')" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer">+</button>
          </div>
          <div style="max-height:200px;overflow-y:auto">
            ${(deal.activities || []).map(a => `
              <div style="padding:8px 12px;border-left:3px solid var(--accent-color);margin-bottom:8px;background:var(--bg-secondary);border-radius:0 8px 8px 0">
                <div style="display:flex;justify-content:space-between"><span style="font-weight:600;color:var(--text-primary);font-size:0.85rem">${escHtml(a.title)}</span><span style="font-size:0.75rem;color:var(--text-secondary)">${new Date(a.created_at).toLocaleDateString('fr-FR')}</span></div>
                ${a.description ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px">${escHtml(a.description)}</div>` : ''}
              </div>
            `).join('') || '<div style="color:var(--text-secondary);font-size:0.85rem;padding:8px">Aucune activite</div>'}
          </div>
          <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
            <button onclick="CRMView.deleteDeal('${deal.id}')" style="padding:8px 16px;border-radius:8px;border:1px solid #EF4444;background:transparent;color:#EF4444;cursor:pointer">Supprimer</button>
            ${deal.stage === 'won' ? `<button onclick="CRMView.convertDeal('${deal.id}')" style="padding:8px 16px;border-radius:8px;border:none;background:#10B981;color:#fff;cursor:pointer;font-weight:600">Convertir en facture</button>` : ''}
          </div>
        </div>`;
    } catch (e) { console.error('Deal detail error:', e); }
  }

  async function addActivity(dealId) {
    const title = document.getElementById('activity-title')?.value?.trim();
    const type = document.getElementById('activity-type')?.value;
    if (!title) return;
    try { await CRMApi.addActivity(dealId, { type, title }); showDealDetail(dealId); } catch (e) { console.error('Add activity error:', e); }
  }

  async function deleteDeal(id) {
    if (!confirm('Supprimer ce deal ?')) return;
    try { await CRMApi.deleteDeal(id); closeModal(); loadData(); } catch (e) { console.error('Delete deal error:', e); }
  }

  async function convertDeal(id) {
    try { const r = await CRMApi.convertDeal(id); alert('Facture creee: ' + r.invoice_id); closeModal(); loadData(); } catch (e) { console.error('Convert error:', e); }
  }

  let _dragDealId = null;
  function handleDragStart(e, id) { _dragDealId = id; e.dataTransfer.effectAllowed = 'move'; }
  async function handleDrop(e, stage) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--border-color)';
    if (!_dragDealId) return;
    try { await CRMApi.moveDeal(_dragDealId, stage); _dragDealId = null; loadData(); } catch (err) { console.error('Move deal error:', err); }
  }

  function closeModal() { const m = document.getElementById('crm-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function formatMoney(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0); }
  function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return {
    render, refresh: loadData, showCreateDeal: showCreateDeal, saveDeal, showDealDetail,
    addActivity, deleteDeal, convertDeal, closeModal,
    handleDragStart, handleDrop
  };
})();
if (typeof window !== 'undefined') window.CRMView = CRMView;
