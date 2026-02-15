/**
 * GoalsView - Vue Objectifs Financiers
 */
const GoalsView = (function() {
  'use strict';

  function render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:1000px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <h2 style="margin:0;color:var(--text-primary)">Objectifs financiers</h2>
            <p style="margin:4px 0 0;color:var(--text-secondary);font-size:0.9rem">Suivez vos objectifs de CA, depenses et epargne</p>
          </div>
          <button onclick="GoalsView.showCreate()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ Objectif</button>
        </div>
        <div id="goals-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px"></div>
        <div id="goals-list"></div>
      </div>
      <div id="goals-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadData();
  }

  async function loadData() {
    try {
      var data = await GoalsApi.dashboard();
      renderSummary(data);
      renderList(data.goals || []);
    } catch (e) { console.error('Goals load:', e); }
  }

  function renderSummary(data) {
    var el = document.getElementById('goals-summary');
    if (!el) return;
    el.innerHTML = [
      { label: 'Total', value: data.total || 0, color: '#3B82F6' },
      { label: 'Actifs', value: data.active || 0, color: '#F59E0B' },
      { label: 'Completes', value: data.completed || 0, color: '#10B981' },
    ].map(function(c) {
      return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)"><div style="font-size:0.85rem;color:var(--text-secondary)">' + c.label + '</div><div style="font-size:1.8rem;font-weight:700;color:' + c.color + ';margin-top:4px">' + c.value + '</div></div>';
    }).join('');
  }

  function renderList(goals) {
    var el = document.getElementById('goals-list');
    if (!el) return;
    if (!goals.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucun objectif. Creez-en un!</div>'; return; }
    el.innerHTML = goals.map(function(g) {
      var pct = g.progress || 0;
      var barColor = pct >= 100 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#3B82F6';
      var typeLabels = { revenue: 'Chiffre d\'affaires', savings: 'Epargne', expense_limit: 'Plafond depenses', clients: 'Clients' };
      return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid var(--border-color)">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">' +
          '<div><div style="font-weight:600;color:var(--text-primary)">' + esc(g.title) + '</div><div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px">' + (typeLabels[g.type] || g.type) + (g.target_date ? ' - Echeance: ' + new Date(g.target_date).toLocaleDateString('fr-FR') : '') + '</div></div>' +
          '<div style="display:flex;gap:6px"><button onclick="GoalsView.refreshGoal(\'' + g.id + '\')" title="Actualiser" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-tertiary);color:var(--text-primary);cursor:pointer;font-size:0.8rem">↻</button><button onclick="GoalsView.deleteGoal(\'' + g.id + '\')" title="Supprimer" style="padding:4px 8px;border-radius:6px;border:1px solid #EF4444;background:transparent;color:#EF4444;cursor:pointer;font-size:0.8rem">✕</button></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="flex:1;background:var(--bg-tertiary);border-radius:8px;height:12px;overflow:hidden"><div style="height:100%;width:' + Math.min(pct, 100) + '%;background:' + barColor + ';border-radius:8px;transition:width 0.5s"></div></div>' +
          '<span style="font-weight:700;color:' + barColor + ';min-width:50px;text-align:right">' + pct.toFixed(1) + '%</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.85rem"><span style="color:var(--text-secondary)">Actuel: ' + fmt(g.current_amount) + '</span><span style="color:var(--text-secondary)">Cible: ' + fmt(g.target_amount) + '</span></div>' +
      '</div>';
    }).join('');
  }

  function showCreate() {
    var modal = document.getElementById('goals-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:450px;border:1px solid var(--border-color)"><h3 style="margin:0 0 16px;color:var(--text-primary)">Nouvel objectif</h3><div style="display:flex;flex-direction:column;gap:12px"><input id="goal-title" placeholder="Titre" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><select id="goal-type" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><option value="revenue">Chiffre d\'affaires</option><option value="savings">Epargne</option><option value="expense_limit">Plafond depenses</option><option value="clients">Nombre de clients</option></select><input id="goal-target" type="number" placeholder="Montant cible (EUR)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><input id="goal-date" type="date" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><textarea id="goal-desc" placeholder="Description (optionnel)" rows="2" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);resize:vertical;font-family:inherit"></textarea></div><div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end"><button onclick="GoalsView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Annuler</button><button onclick="GoalsView.saveGoal()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Creer</button></div></div>';
  }

  async function saveGoal() {
    var title = document.getElementById('goal-title')?.value?.trim();
    var target = parseFloat(document.getElementById('goal-target')?.value);
    if (!title || !target) return;
    try {
      await GoalsApi.create({ title: title, type: document.getElementById('goal-type')?.value || 'revenue', target_amount: target, target_date: document.getElementById('goal-date')?.value || undefined, description: document.getElementById('goal-desc')?.value || undefined });
      closeModal(); loadData();
    } catch (e) { console.error('Create goal error:', e); }
  }

  async function refreshGoal(id) { try { await GoalsApi.refresh(id); loadData(); } catch (e) { console.error('Refresh goal:', e); } }
  async function deleteGoal(id) { if (!confirm('Supprimer cet objectif ?')) return; try { await GoalsApi.remove(id); loadData(); } catch (e) { console.error('Delete goal:', e); } }
  function closeModal() { var m = document.getElementById('goals-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function fmt(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { render: render, refresh: loadData, showCreate: showCreate, saveGoal: saveGoal, refreshGoal: refreshGoal, deleteGoal: deleteGoal, closeModal: closeModal };
})();
if (typeof window !== 'undefined') window.GoalsView = GoalsView;
