/**
 * PortalView - Vue Portail Client (gestion des tokens d'acces)
 */
const PortalView = (function() {
  'use strict';

  function render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:1100px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <h2 style="margin:0;color:var(--text-primary)">Portail Client</h2>
            <p style="margin:4px 0 0;color:var(--text-secondary);font-size:0.9rem">G\u00e9n\u00e9rez des liens s\u00e9curis\u00e9s pour que vos clients acc\u00e8dent \u00e0 leurs factures et contrats</p>
          </div>
          <button onclick="PortalView.showGenerate()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ G\u00e9n\u00e9rer un lien</button>
        </div>
        <div id="portal-content"></div>
      </div>
      <div id="portal-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadData();
  }

  async function loadData() {
    var el = document.getElementById('portal-content');
    if (!el) return;
    try {
      var tokens = await PortalApi.listTokens();
      renderTokens(el, tokens || []);
    } catch (e) { console.error('Portal load:', e); el.innerHTML = '<div style="color:var(--text-secondary);padding:20px">Erreur chargement</div>'; }
  }

  function renderTokens(el, tokens) {
    if (!tokens.length) { el.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-secondary)"><div style="font-size:3rem;margin-bottom:16px">&#128279;</div><div style="font-size:1.1rem;margin-bottom:8px">Aucun lien client actif</div><div style="font-size:0.9rem">G\u00e9n\u00e9rez un lien pour partager factures et contrats avec un client</div></div>'; return; }
    var html = '<div style="display:flex;flex-direction:column;gap:10px">';
    tokens.forEach(function(t) {
      var active = t.status === 'active' && (!t.expires_at || new Date(t.expires_at) > new Date());
      var color = active ? '#10B981' : '#EF4444';
      var portalUrl = window.location.origin + '/api/v1/portal/client/' + t.token;
      html += '<div style="background:var(--bg-secondary);border-radius:12px;padding:16px;border:1px solid var(--border-color)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-weight:600;color:var(--text-primary)">' + esc(t.contact_name || t.client_name || 'Client') + '</div>' +
        '<span style="padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:' + color + '20;color:' + color + '">' + (active ? 'Actif' : 'R\u00e9voqu\u00e9') + '</span></div>' +
        '<div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px">' + esc(t.contact_email || t.client_email || '') + (t.expires_at ? ' \u2022 Expire: ' + fmtDate(t.expires_at) : '') + '</div>' +
        (active ? '<div style="display:flex;gap:8px;align-items:center"><input value="' + esc(portalUrl) + '" readonly style="flex:1;padding:6px 10px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-secondary);font-size:0.8rem">' +
        '<button onclick="PortalView.copyLink(\'' + esc(portalUrl) + '\')" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);cursor:pointer;font-size:0.8rem">Copier</button>' +
        '<button onclick="PortalView.revoke(\'' + t.id + '\')" style="padding:6px 12px;border-radius:6px;border:none;background:#EF4444;color:#fff;cursor:pointer;font-size:0.8rem">R\u00e9voquer</button></div>' : '') +
        '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function showGenerate() {
    var modal = document.getElementById('portal-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:24px;width:90%;max-width:500px;border:1px solid var(--border-color)">' +
      '<h3 style="margin:0 0 16px;color:var(--text-primary)">G\u00e9n\u00e9rer un lien client</h3>' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<input id="ptl-name" placeholder="Nom du client" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">' +
      '<input id="ptl-email" type="email" placeholder="Email du client" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">' +
      '<input id="ptl-contact" placeholder="ID contact (optionnel)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)">' +
      '<select id="ptl-exp" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary)"><option value="30">Expire dans 30 jours</option><option value="90">Expire dans 90 jours</option><option value="365">Expire dans 1 an</option><option value="">Sans expiration</option></select>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">' +
      '<button onclick="PortalView.closeModal()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Annuler</button>' +
      '<button onclick="PortalView.generateToken()" style="padding:8px 20px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">G\u00e9n\u00e9rer</button></div></div>';
  }

  async function generateToken() {
    var name = document.getElementById('ptl-name')?.value?.trim();
    var email = document.getElementById('ptl-email')?.value?.trim();
    var contact = document.getElementById('ptl-contact')?.value?.trim();
    var exp = document.getElementById('ptl-exp')?.value;
    if (!name || !email) return;
    var data = { client_name: name, client_email: email };
    if (contact) data.contact_id = contact;
    if (exp) data.expires_days = parseInt(exp);
    try { await PortalApi.generateToken(data); closeModal(); loadData(); } catch (e) { console.error('Generate token:', e); }
  }

  async function revoke(id) { try { await PortalApi.revokeToken(id); loadData(); } catch (e) { console.error('Revoke:', e); } }

  function copyLink(url) {
    if (navigator.clipboard) { navigator.clipboard.writeText(url); }
    else { var ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
  }

  function closeModal() { var m = document.getElementById('portal-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('fr-FR'); } catch(e) { return d; } }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { render: render, refresh: loadData, showGenerate: showGenerate, generateToken: generateToken, revoke: revoke, copyLink: copyLink, closeModal: closeModal };
})();
if (typeof window !== 'undefined') window.PortalView = PortalView;
