/**
 * Bug Report System v1.0
 * Bouton flottant + modal de rapport de bug avec capture auto
 */

const BugReport = (function () {
  'use strict';

  let modalEl = null;
  let isOpen = false;
  const capturedErrors = [];

  // ── Init ─────────────────────────────────────────────────

  function init() {
    if (document.getElementById('bug-report-fab')) return;
    injectCSS();
    createFAB();
    createModal();
    captureConsoleErrors();
  }

  // ── CSS injecté ───────────────────────────────────────────

  function injectCSS() {
    if (document.getElementById('bug-report-css')) return;
    const s = document.createElement('link');
    s.id = 'bug-report-css';
    s.rel = 'stylesheet';
    s.href = '/css/bug-report.css?v=101';
    document.head.appendChild(s);
  }

  // ── Bouton flottant ───────────────────────────────────────

  function createFAB() {
    const fab = document.createElement('button');
    fab.id = 'bug-report-fab';
    fab.className = 'bug-report-fab';
    fab.title = 'Signaler un bug';
    fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`;
    fab.addEventListener('click', open);
    document.body.appendChild(fab);
  }

  // ── Modal ─────────────────────────────────────────────────

  function createModal() {
    modalEl = document.createElement('div');
    modalEl.id = 'bug-report-modal-wrap';
    modalEl.className = 'bug-report-modal-wrap';
    modalEl.innerHTML = `
      <div class="bug-report-modal" role="dialog" aria-modal="true">
        <div class="brm-header">
          <span class="brm-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-right:8px;vertical-align:-3px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Signaler un bug
          </span>
          <button class="brm-close" id="bug-report-close">&times;</button>
        </div>

        <form id="bug-report-form" class="brm-form">
          <div class="brm-field">
            <label for="bug-title">Titre du problème <span class="brm-req">*</span></label>
            <input type="text" id="bug-title" placeholder="Ex: La page admin ne s'affiche pas" required maxlength="200" />
          </div>
          <div class="brm-field">
            <label for="bug-desc">Description <span class="brm-req">*</span></label>
            <textarea id="bug-desc" rows="4" placeholder="Décrivez le problème, les étapes pour le reproduire, ce que vous attendiez…" required></textarea>
          </div>
          <div class="brm-meta">
            <div class="brm-meta-item"><span class="brm-meta-k">Page</span><span class="brm-meta-v" id="bug-page">—</span></div>
            <div class="brm-meta-item"><span class="brm-meta-k">Erreurs JS</span><span class="brm-meta-v" id="bug-errors-count">0</span></div>
          </div>
          <pre id="bug-errors-preview" class="brm-errors-preview" style="display:none"></pre>
          <div class="brm-actions">
            <button type="button" class="brm-btn-cancel" id="bug-cancel">Annuler</button>
            <button type="submit" class="brm-btn-submit" id="bug-submit">
              <span id="bug-submit-txt">Envoyer &amp; analyser avec IA</span>
              <span id="bug-submit-spin" style="display:none">Envoi…</span>
            </button>
          </div>
        </form>

        <div id="bug-report-success" class="brm-success" style="display:none">
          <div class="brm-success-icon">✅</div>
          <h3>Rapport envoyé !</h3>
          <p>L'IA analyse votre rapport et proposera un fix automatique.<br>Validez-le dans <strong>Admin → Bugs</strong>.</p>
          <button class="brm-btn-submit" onclick="BugReport.close()">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    document.getElementById('bug-report-close').addEventListener('click', close);
    document.getElementById('bug-cancel').addEventListener('click', close);
    modalEl.addEventListener('click', (e) => { if (e.target === modalEl) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) close(); });
    document.getElementById('bug-report-form').addEventListener('submit', submit);
  }

  // ── Capture erreurs JS ────────────────────────────────────

  function captureConsoleErrors() {
    const orig = console.error.bind(console);
    console.error = function (...args) {
      capturedErrors.push(args.map(String).join(' ').slice(0, 300));
      if (capturedErrors.length > 10) capturedErrors.shift();
      orig(...args);
    };
    window.addEventListener('error', (e) => {
      capturedErrors.push(`${e.message} (${e.filename || '?'}:${e.lineno || '?'})`);
      if (capturedErrors.length > 10) capturedErrors.shift();
    });
    window.addEventListener('unhandledrejection', (e) => {
      capturedErrors.push(`UnhandledPromise: ${String(e.reason).slice(0, 200)}`);
      if (capturedErrors.length > 10) capturedErrors.shift();
    });
  }

  // ── Ouvrir / Fermer ───────────────────────────────────────

  function open() {
    if (isOpen) return;
    isOpen = true;

    document.getElementById('bug-page').textContent = window.location.pathname + window.location.hash;
    document.getElementById('bug-errors-count').textContent = String(capturedErrors.length);

    const preview = document.getElementById('bug-errors-preview');
    if (capturedErrors.length > 0) {
      preview.style.display = 'block';
      preview.textContent = capturedErrors.slice(-5).join('\n');
    } else {
      preview.style.display = 'none';
    }

    document.getElementById('bug-report-form').style.display = '';
    document.getElementById('bug-report-success').style.display = 'none';
    document.getElementById('bug-report-form').reset();

    modalEl.classList.add('visible');
    setTimeout(() => document.getElementById('bug-title').focus(), 100);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modalEl.classList.remove('visible');
  }

  // ── Soumission ────────────────────────────────────────────

  async function submit(e) {
    e.preventDefault();
    const title = document.getElementById('bug-title').value.trim();
    const description = document.getElementById('bug-desc').value.trim();
    if (!title || !description) return;

    const btn = document.getElementById('bug-submit');
    const txt = document.getElementById('bug-submit-txt');
    const spin = document.getElementById('bug-submit-spin');
    btn.disabled = true; txt.style.display = 'none'; spin.style.display = 'inline';

    try {
      const token = localStorage.getItem('productiveapp_token') ||
                    sessionStorage.getItem('productiveapp_token') || '';

      const res = await fetch('/api/v1/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title, description,
          page_url: window.location.pathname + window.location.hash,
          js_errors: capturedErrors.length > 0 ? capturedErrors.join('\n') : null
        })
      });

      if (res.ok) {
        document.getElementById('bug-report-form').style.display = 'none';
        document.getElementById('bug-report-success').style.display = 'flex';
      } else {
        const d = await res.json().catch(() => ({}));
        alert('Erreur: ' + (d.error || 'Impossible d\'envoyer le rapport'));
      }
    } catch {
      alert('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      btn.disabled = false; txt.style.display = 'inline'; spin.style.display = 'none';
    }
  }

  return { init, open, close };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => BugReport.init(), 2000));
} else {
  setTimeout(() => BugReport.init(), 2000);
}

if (typeof window !== 'undefined') window.BugReport = BugReport;
