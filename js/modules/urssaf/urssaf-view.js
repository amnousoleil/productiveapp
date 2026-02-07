/**
 * URSSAFView - Vue URSSAF Cotisations et D\u00e9clarations
 */
const URSSAFView = (function() {
  'use strict';
  let _tab = 'summary';
  let _year = new Date().getFullYear();

  function render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:1100px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="margin:0;color:var(--text-primary)">URSSAF & Cotisations</h2>
          <button onclick="URSSAFView.showSimulator()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Simulateur</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button onclick="URSSAFView.switchTab('summary')" id="urs-tab-summary" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Synth\u00e8se annuelle</button>
          <button onclick="URSSAFView.switchTab('declarations')" id="urs-tab-declarations" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">D\u00e9clarations</button>
        </div>
        <div id="urssaf-content"></div>
      </div>
      <div id="urssaf-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadData();
  }

  function switchTab(tab) {
    _tab = tab;
    ['summary', 'declarations'].forEach(function(t) {
      var btn = document.getElementById('urs-tab-' + t);
      if (btn) { btn.style.background = t === tab ? 'var(--accent-color)' : 'var(--bg-secondary)'; btn.style.color = t === tab ? '#fff' : 'var(--text-primary)'; }
    });
    loadData();
  }

  async function loadData() {
    var el = document.getElementById('urssaf-content');
    if (!el) return;
    try {
      if (_tab === 'declarations') {
        var decls = await URSSAFApi.listDeclarations();
        renderDeclarations(el, decls || []);
      } else {
        var summary = await URSSAFApi.annualSummary(_year);
        renderSummary(el, summary || {});
      }
    } catch (e) { console.error('URSSAF load:', e); el.innerHTML = '<div style="color:var(--text-secondary);padding:20px">Erreur chargement</div>'; }
  }

  function renderSummary(el, s) {
    var pct = s.plafond_utilise || 0;
    var pctColor = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981';
    var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">';
    html += '<button onclick="URSSAFView.changeYear(-1)" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">&lt;</button>';
    html += '<span style="font-size:1.2rem;font-weight:700;color:var(--text-primary)">' + _year + '</span>';
    html += '<button onclick="URSSAFView.changeYear(1)" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">&gt;</button></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px">';
    html += card('Chiffre d\'affaires', fmt(s.total_ca), '#3B82F6');
    html += card('Cotisations', fmt(s.total_cotisations), '#EF4444');
    html += card('Net apr\u00e8s cotisations', fmt(s.total_net), '#10B981');
    html += card('Trimestres d\u00e9clar\u00e9s', (s.quarters_declared || 0) + '/4', '#8B5CF6');
    html += '</div>';
    // Plafond bar
    html += '<div style="background:var(--bg-secondary);border-radius:12px;padding:20px;border:1px solid var(--border-color);margin-bottom:20px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-weight:600;color:var(--text-primary)">Plafond micro-entrepreneur</span><span style="color:' + pctColor + ';font-weight:600">' + pct + '%</span></div>';
    html += '<div style="background:var(--bg-primary);border-radius:8px;height:12px;overflow:hidden"><div style="height:100%;border-radius:8px;background:' + pctColor + ';width:' + Math.min(pct, 100) + '%;transition:width 0.5s"></div></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.8rem;color:var(--text-secondary)"><span>' + fmt(s.total_ca) + '</span><span>' + fmt(s.plafond) + '</span></div>';
    if (s.alert) html += '<div style="margin-top:10px;padding:8px 12px;border-radius:8px;background:#FEF2F2;color:#EF4444;font-size:0.85rem;font-weight:600">' + esc(s.alert) + '</div>';
    html += '</div>';
    // Declarations per quarter
    var decls = s.declarations || [];
    if (decls.length) {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">';
      decls.forEach(function(d) {
        var stColor = d.status === 'submitted' ? '#10B981' : d.status === 'draft' ? '#F59E0B' : '#6B7280';
        html += '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:600;color:var(--text-primary)">T' + d.quarter + ' ' + d.year + '</span><span style="padding:4px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;background:' + stColor + '20;color:' + stColor + '">' + (d.status === 'submitted' ? 'D\u00e9clar\u00e9' : 'Brouillon') + '</span></div>' +
          '<div style="font-size:0.85rem;color:var(--text-secondary)">CA: ' + fmt(d.chiffre_affaires) + '</div>' +
          '<div style="font-size:0.85rem;color:var(--text-secondary)">Cotisations: ' + fmt(d.cotisations_amount) + '</div>' +
          '<div style="font-size:0.85rem;color:var(--text-secondary)">Net: ' + fmt(d.net_amount) + '</div></div>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderDeclarations(el, decls) {
    var html = '<div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button onclick="URSSAFView.showNewDeclaration()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ Nouvelle d\u00e9claration</button></div>';
    if (!decls.length) { html += '<div style="text-align:center;padding:40px;color:var(--text-secondary)">Aucune d\u00e9claration</div>'; el.innerHTML = html; return; }
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    decls.forEach(function(d) {
      var stColor = d.status === 'submitted' ? '#10B981' : '#F59E0B';
      html += '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center">' +
        '<div><div style="font-weight:600;color:var(--text-primary)">T' + d.quarter + ' ' + d.year + ' - ' + esc(d.activity_type || 'BNC') + '</div><div style="font-size:0.85rem;color:var(--text-secondary)">CA: ' + fmt(d.chiffre_affaires) + ' | Cotisations: ' + fmt(d.cotisations_amount) + ' | Net: ' + fmt(d.net_amount) + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px"><span style="padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:' + stColor + '20;color:' + stColor + '">' + (d.status === 'submitted' ? 'D\u00e9clar\u00e9' : 'Brouillon') + '</span>' +
        (d.status === 'draft' ? '<button onclick="URSSAFView.submitDecl(\'' + d.id + '\')" style="padding:4px 10px;border-radius:8px;border:none;background:#10B981;color:#fff;cursor:pointer;font-size:0.8rem">D\u00e9clarer</button>' : '') +
        '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function showSimulator() {
    var modal = document.getElementById('urssaf-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:500px;border:1px solid var(--border-color)">' +
      '<h3 style="margin:0 0 16px;color:var(--text-primary)">Simulateur de cotisations</h3>' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<input id="urs-ca" type="number" placeholder="Chiffre d\'affaires (\u20ac)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">' +
      '<select id="urs-type" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><option value="BNC">BNC - Prestations lib\u00e9rales</option><option value="BIC_service">BIC - Services</option><option value="BIC_vente">BIC - Vente</option><option value="liberal_cipav">Lib\u00e9ral CIPAV</option></select>' +
      '<label style="display:flex;align-items:center;gap:8px;color:var(--text-secondary)"><input type="checkbox" id="urs-acre"> ACRE (r\u00e9duction 50%)</label>' +
      '</div>' +
      '<div id="urs-sim-result" style="margin-top:16px"></div>' +
      '<div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">' +
      '<button onclick="URSSAFView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Fermer</button>' +
      '<button onclick="URSSAFView.runSimulation()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Calculer</button></div></div>';
  }

  async function runSimulation() {
    var ca = parseFloat(document.getElementById('urs-ca')?.value);
    var type = document.getElementById('urs-type')?.value || 'BNC';
    var acre = document.getElementById('urs-acre')?.checked || false;
    if (!ca || ca <= 0) return;
    var resEl = document.getElementById('urs-sim-result');
    if (!resEl) return;
    try {
      var r = await URSSAFApi.simulate({ ca: ca, activity_type: type, acre: acre });
      resEl.innerHTML = '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">Cotisations de base</div><div style="font-weight:600;color:var(--text-primary);text-align:right">' + fmt(r.cotisations?.base) + '</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">Formation</div><div style="font-weight:600;color:var(--text-primary);text-align:right">' + fmt(r.cotisations?.formation) + '</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">CFE</div><div style="font-weight:600;color:var(--text-primary);text-align:right">' + fmt(r.cotisations?.cfe) + '</div>' +
        '<div style="border-top:1px solid var(--border-color);padding-top:8px;font-weight:600;color:var(--text-primary)">Total cotisations</div><div style="border-top:1px solid var(--border-color);padding-top:8px;font-weight:700;color:#EF4444;text-align:right">' + fmt(r.cotisations?.total) + '</div>' +
        '<div style="font-weight:600;color:var(--text-primary)">Net apr\u00e8s cotisations</div><div style="font-weight:700;color:#10B981;text-align:right">' + fmt(r.net_after_cotisations) + '</div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary)">Taux effectif</div><div style="font-weight:600;color:var(--text-primary);text-align:right">' + (r.taux_effectif || 0) + '%</div>' +
        '</div></div>';
    } catch (e) { resEl.innerHTML = '<div style="color:#EF4444">Erreur simulation</div>'; }
  }

  function showNewDeclaration() {
    var modal = document.getElementById('urssaf-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    var q = Math.ceil((new Date().getMonth() + 1) / 3);
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:500px;border:1px solid var(--border-color)">' +
      '<h3 style="margin:0 0 16px;color:var(--text-primary)">Nouvelle d\u00e9claration</h3>' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<select id="urs-dq" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><option value="1"' + (q===1?' selected':'') + '>T1 (Jan-Mar)</option><option value="2"' + (q===2?' selected':'') + '>T2 (Avr-Jun)</option><option value="3"' + (q===3?' selected':'') + '>T3 (Jul-Sep)</option><option value="4"' + (q===4?' selected':'') + '>T4 (Oct-D\u00e9c)</option></select>' +
      '<input id="urs-dy" type="number" value="' + _year + '" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"></div>' +
      '<select id="urs-dat" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><option value="BNC">BNC</option><option value="BIC_service">BIC Services</option><option value="BIC_vente">BIC Vente</option><option value="liberal_cipav">Lib\u00e9ral CIPAV</option></select>' +
      '<input id="urs-dca" type="number" placeholder="Chiffre d\'affaires (\u20ac)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">' +
      '<label style="display:flex;align-items:center;gap:8px;color:var(--text-secondary)"><input type="checkbox" id="urs-dacre"> ACRE</label>' +
      '<button onclick="URSSAFView.autoCalc()" style="padding:8px 16px;border-radius:8px;border:1px solid var(--accent-color);background:transparent;color:var(--accent-color);cursor:pointer;font-size:0.85rem">Auto-calculer depuis les factures</button>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">' +
      '<button onclick="URSSAFView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Annuler</button>' +
      '<button onclick="URSSAFView.saveDeclaration()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">Cr\u00e9er</button></div></div>';
  }

  async function autoCalc() {
    var q = parseInt(document.getElementById('urs-dq')?.value) || 1;
    var y = parseInt(document.getElementById('urs-dy')?.value) || _year;
    try {
      var r = await URSSAFApi.autoCalculate(q, y);
      var caEl = document.getElementById('urs-dca');
      if (caEl) caEl.value = r.chiffre_affaires || 0;
    } catch (e) { console.error('Auto-calc:', e); }
  }

  async function saveDeclaration() {
    var quarter = parseInt(document.getElementById('urs-dq')?.value);
    var year = parseInt(document.getElementById('urs-dy')?.value);
    var activity_type = document.getElementById('urs-dat')?.value || 'BNC';
    var ca = parseFloat(document.getElementById('urs-dca')?.value);
    var acre = document.getElementById('urs-dacre')?.checked || false;
    if (!quarter || !year || !ca) return;
    try { await URSSAFApi.createDeclaration({ quarter: quarter, year: year, activity_type: activity_type, chiffre_affaires: ca, acre: acre }); closeModal(); loadData(); } catch (e) { console.error('Create decl:', e); }
  }

  async function submitDecl(id) { try { await URSSAFApi.updateDeclaration(id, { status: 'submitted' }); loadData(); } catch (e) { console.error('Submit:', e); } }

  function changeYear(delta) { _year += delta; loadData(); }
  function closeModal() { var m = document.getElementById('urssaf-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function card(label, value, color) { return '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color);text-align:center"><div style="font-size:1.5rem;font-weight:700;color:' + color + '">' + value + '</div><div style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px">' + label + '</div></div>'; }
  function fmt(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { render: render, refresh: loadData, switchTab: switchTab, showSimulator: showSimulator, runSimulation: runSimulation, showNewDeclaration: showNewDeclaration, saveDeclaration: saveDeclaration, autoCalc: autoCalc, submitDecl: submitDecl, changeYear: changeYear, closeModal: closeModal };
})();
if (typeof window !== 'undefined') window.URSSAFView = URSSAFView;
