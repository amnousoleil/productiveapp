/**
 * AccStyles - Injection CSS complete pour le module Comptabilite
 * Tous les styles utilisent les variables CSS du theme pour la compatibilite
 */
const AccStyles = (function() {
    'use strict';

    let injected = false;

    function inject() {
        if (injected) return;
        injected = true;

        var style = document.createElement('style');
        style.id = 'acc-styles';
        style.textContent = getCSS();
        document.head.appendChild(style);
    }

    function getCSS() {
        return '' +

        /* ========== CONTENEUR PRINCIPAL ========== */
        '#view-accounting { padding: 0; height: 100%; display: flex; flex-direction: column; }' +
        '.acc-wrapper { display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative; }' +

        /* ========== EN-TETE ========== */
        '.acc-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border-color, #e0e0e0); background: var(--bg-primary, #ffffff); flex-shrink: 0; }' +
        '.acc-header-left { display: flex; align-items: center; gap: 12px; }' +
        '.acc-header-title { font-size: 1.4rem; font-weight: 700; color: var(--text-primary, #1a1a2e); margin: 0; }' +
        '.acc-header-actions { display: flex; gap: 8px; align-items: center; }' +
        '.acc-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color, #e0e0e0); background: var(--bg-secondary, #f5f5f5); color: var(--text-primary, #333); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }' +
        '.acc-btn:hover { background: var(--accent-primary, #6c5ce7); color: #fff; border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-btn-primary { background: var(--accent-primary, #6c5ce7); color: #fff; border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }' +
        '.acc-btn-danger { background: #e74c3c; color: #fff; border-color: #e74c3c; }' +
        '.acc-btn-danger:hover { background: #c0392b; }' +
        '.acc-btn-sm { padding: 5px 10px; font-size: 0.8rem; }' +
        '.acc-btn-icon { padding: 8px; border-radius: 8px; }' +
        '.acc-btn svg { width: 16px; height: 16px; }' +

        /* ========== ONGLETS ========== */
        '.acc-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border-color, #e0e0e0); background: var(--bg-primary, #ffffff); overflow-x: auto; flex-shrink: 0; padding: 0 24px; scrollbar-width: none; -ms-overflow-style: none; }' +
        '.acc-tabs::-webkit-scrollbar { display: none; }' +
        '.acc-tab { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; background: transparent; color: var(--text-secondary, #666); font-size: 0.85rem; font-weight: 500; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s ease; white-space: nowrap; position: relative; }' +
        '.acc-tab:hover { color: var(--accent-primary, #6c5ce7); background: var(--bg-secondary, #f8f9fa); }' +
        '.acc-tab.active { color: var(--accent-primary, #6c5ce7); border-bottom-color: var(--accent-primary, #6c5ce7); font-weight: 600; }' +
        '.acc-tab svg { width: 18px; height: 18px; }' +
        '.acc-tab-badge { position: absolute; top: 6px; right: 6px; min-width: 18px; height: 18px; border-radius: 9px; background: #e74c3c; color: #fff; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }' +

        /* ========== CONTENU ========== */
        '.acc-content { flex: 1; overflow-y: auto; padding: 24px; background: var(--bg-secondary, #f8f9fa); }' +
        '.acc-section { margin-bottom: 24px; }' +
        '.acc-section-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary, #1a1a2e); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }' +

        /* ========== CHARGEMENT ========== */
        '.acc-loading { display: flex; align-items: center; justify-content: center; padding: 60px; color: var(--text-secondary, #666); font-size: 0.95rem; }' +
        '.acc-loading-spinner { width: 32px; height: 32px; border: 3px solid var(--border-color, #e0e0e0); border-top-color: var(--accent-primary, #6c5ce7); border-radius: 50%; animation: acc-spin 0.8s linear infinite; margin-right: 12px; }' +
        '@keyframes acc-spin { to { transform: rotate(360deg); } }' +

        /* ========== ETAT VIDE ========== */
        '.acc-empty { text-align: center; padding: 60px 20px; color: var(--text-secondary, #999); }' +
        '.acc-empty svg { width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.4; }' +
        '.acc-empty-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 8px; }' +
        '.acc-empty-desc { font-size: 0.9rem; margin-bottom: 20px; }' +

        /* ========== DASHBOARD - CARTES STATISTIQUES ========== */
        '.acc-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }' +
        '.acc-stat-card { background: var(--bg-primary, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); transition: transform 0.2s ease, box-shadow 0.2s ease; }' +
        '.acc-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }' +
        '.acc-stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }' +
        '.acc-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }' +
        '.acc-stat-icon svg { width: 20px; height: 20px; color: #fff; }' +
        '.acc-stat-icon.green { background: linear-gradient(135deg, #00b894, #00cec9); }' +
        '.acc-stat-icon.blue { background: linear-gradient(135deg, #0984e3, #6c5ce7); }' +
        '.acc-stat-icon.orange { background: linear-gradient(135deg, #fdcb6e, #e17055); }' +
        '.acc-stat-icon.red { background: linear-gradient(135deg, #e74c3c, #fd79a8); }' +
        '.acc-stat-icon.purple { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }' +
        '.acc-stat-trend { font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 12px; }' +
        '.acc-stat-trend.up { color: #00b894; background: rgba(0,184,148,0.1); }' +
        '.acc-stat-trend.down { color: #e74c3c; background: rgba(231,76,60,0.1); }' +
        '.acc-stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-primary, #1a1a2e); margin-bottom: 4px; }' +
        '.acc-stat-label { font-size: 0.8rem; color: var(--text-secondary, #999); font-weight: 500; }' +

        /* ========== DASHBOARD - GRAPHIQUES ========== */
        '.acc-charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }' +
        '.acc-chart-card { background: var(--bg-primary, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); }' +
        '.acc-chart-title { font-size: 0.95rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 16px; }' +
        '.acc-chart-container { position: relative; height: 280px; }' +

        /* ========== SCANNER ========== */
        '.acc-scanner { text-align: center; padding: 40px 20px; }' +
        '.acc-scanner-zone { width: 100%; max-width: 500px; margin: 0 auto 24px; padding: 60px 40px; border: 3px dashed var(--border-color, #ddd); border-radius: 16px; background: var(--bg-primary, #fff); cursor: pointer; transition: all 0.3s ease; }' +
        '.acc-scanner-zone:hover { border-color: var(--accent-primary, #6c5ce7); background: rgba(108,92,231,0.03); }' +
        '.acc-scanner-zone.dragging { border-color: var(--accent-primary, #6c5ce7); background: rgba(108,92,231,0.08); transform: scale(1.02); }' +
        '.acc-scanner-icon { width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary, #6c5ce7), var(--accent-secondary, #a29bfe)); display: flex; align-items: center; justify-content: center; }' +
        '.acc-scanner-icon svg { width: 36px; height: 36px; color: #fff; }' +
        '.acc-scanner-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 8px; }' +
        '.acc-scanner-desc { font-size: 0.85rem; color: var(--text-secondary, #999); }' +
        '.acc-scanner-preview { display: grid; grid-template-columns: 200px 1fr; gap: 24px; max-width: 700px; margin: 0 auto; text-align: left; }' +
        '.acc-scanner-thumb { width: 200px; height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color, #ddd); }' +
        '.acc-scanner-results { padding: 10px 0; }' +
        '.acc-confidence { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 16px; }' +
        '.acc-confidence.high { background: rgba(0,184,148,0.12); color: #00b894; }' +
        '.acc-confidence.medium { background: rgba(253,203,110,0.2); color: #e17055; }' +
        '.acc-confidence.low { background: rgba(231,76,60,0.12); color: #e74c3c; }' +
        '.acc-extraction-form { display: flex; flex-direction: column; gap: 12px; }' +
        '.acc-extraction-row { display: flex; gap: 12px; }' +

        /* ========== FACTURES - TABLEAU ========== */
        '.acc-filter-bar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; align-items: center; }' +
        '.acc-search-input { flex: 1; min-width: 200px; padding: 9px 14px 9px 36px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.85rem; outline: none; transition: border-color 0.2s; }' +
        '.acc-search-input:focus { border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-search-wrapper { position: relative; flex: 1; min-width: 200px; }' +
        '.acc-search-wrapper svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-secondary, #999); pointer-events: none; }' +
        '.acc-select { padding: 9px 14px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.85rem; outline: none; cursor: pointer; }' +
        '.acc-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border-color, #e0e0e0); background: var(--bg-primary, #fff); }' +
        '.acc-table { width: 100%; border-collapse: collapse; }' +
        '.acc-table th { padding: 12px 16px; text-align: left; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #666); text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg-secondary, #f8f9fa); border-bottom: 1px solid var(--border-color, #e0e0e0); white-space: nowrap; }' +
        '.acc-table td { padding: 12px 16px; font-size: 0.85rem; color: var(--text-primary, #333); border-bottom: 1px solid var(--border-color, #f0f0f0); vertical-align: middle; }' +
        '.acc-table tr:last-child td { border-bottom: none; }' +
        '.acc-table tr:hover { background: var(--bg-secondary, #f8f9fa); }' +
        '.acc-table-actions { display: flex; gap: 6px; }' +

        /* ========== BADGES DE STATUT ========== */
        '.acc-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }' +
        '.acc-badge-draft { background: rgba(108,117,125,0.12); color: #6c757d; }' +
        '.acc-badge-pending { background: rgba(253,203,110,0.2); color: #e17055; }' +
        '.acc-badge-sent { background: rgba(9,132,227,0.12); color: #0984e3; }' +
        '.acc-badge-paid { background: rgba(0,184,148,0.12); color: #00b894; }' +
        '.acc-badge-overdue { background: rgba(231,76,60,0.12); color: #e74c3c; }' +
        '.acc-badge-cancelled { background: rgba(99,99,99,0.12); color: #636363; }' +
        '.acc-badge-approved { background: rgba(0,184,148,0.12); color: #00b894; }' +
        '.acc-badge-rejected { background: rgba(231,76,60,0.12); color: #e74c3c; }' +
        '.acc-badge-submitted { background: rgba(108,92,231,0.12); color: #6c5ce7; }' +

        /* ========== NOTES DE FRAIS - TIMELINE ========== */
        '.acc-timeline { display: flex; align-items: center; gap: 0; margin-bottom: 20px; padding: 16px 20px; background: var(--bg-primary, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e0e0e0); overflow-x: auto; }' +
        '.acc-timeline-step { display: flex; align-items: center; gap: 8px; white-space: nowrap; }' +
        '.acc-timeline-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }' +
        '.acc-timeline-dot.done { background: var(--accent-primary, #6c5ce7); color: #fff; }' +
        '.acc-timeline-dot.current { background: #fdcb6e; color: #333; animation: acc-pulse 2s infinite; }' +
        '.acc-timeline-dot.pending { background: var(--bg-secondary, #f0f0f0); color: var(--text-secondary, #999); }' +
        '@keyframes acc-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(253,203,110,0.4); } 50% { box-shadow: 0 0 0 8px rgba(253,203,110,0); } }' +
        '.acc-timeline-label { font-size: 0.8rem; color: var(--text-secondary, #666); }' +
        '.acc-timeline-line { flex: 1; min-width: 20px; height: 2px; background: var(--border-color, #e0e0e0); margin: 0 8px; }' +
        '.acc-timeline-line.done { background: var(--accent-primary, #6c5ce7); }' +
        '.acc-approval-actions { display: flex; gap: 10px; margin-top: 16px; }' +

        /* ========== TVA ========== */
        '.acc-tva-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }' +
        '.acc-tva-card { background: var(--bg-primary, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); text-align: center; }' +
        '.acc-tva-card-label { font-size: 0.8rem; color: var(--text-secondary, #999); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }' +
        '.acc-tva-card-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary, #333); }' +
        '.acc-tva-card-value.positive { color: #00b894; }' +
        '.acc-tva-card-value.negative { color: #e74c3c; }' +
        '.acc-quarter-table { width: 100%; }' +

        /* ========== BUDGETS ========== */
        '.acc-budget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }' +
        '.acc-budget-card { background: var(--bg-primary, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); }' +
        '.acc-budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }' +
        '.acc-budget-dept { font-size: 1rem; font-weight: 600; color: var(--text-primary, #333); }' +
        '.acc-budget-amount { font-size: 0.85rem; color: var(--text-secondary, #666); }' +
        '.acc-progress-bar { height: 10px; background: var(--bg-secondary, #f0f0f0); border-radius: 5px; overflow: hidden; margin-bottom: 8px; }' +
        '.acc-progress-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }' +
        '.acc-progress-fill.green { background: linear-gradient(90deg, #00b894, #55efc4); }' +
        '.acc-progress-fill.orange { background: linear-gradient(90deg, #fdcb6e, #e17055); }' +
        '.acc-progress-fill.red { background: linear-gradient(90deg, #e74c3c, #fd79a8); }' +
        '.acc-budget-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary, #666); }' +
        '.acc-variance { font-weight: 600; }' +
        '.acc-variance.positive { color: #00b894; }' +
        '.acc-variance.negative { color: #e74c3c; }' +

        /* ========== BANQUE - RAPPROCHEMENT ========== */
        '.acc-bank-list { display: flex; flex-direction: column; gap: 8px; }' +
        '.acc-bank-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-primary, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e0e0e0); transition: border-color 0.2s; }' +
        '.acc-bank-item:hover { border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-bank-item.matched { border-left: 4px solid #00b894; }' +
        '.acc-bank-item.unmatched { border-left: 4px solid #fdcb6e; }' +
        '.acc-bank-date { font-size: 0.8rem; color: var(--text-secondary, #666); min-width: 90px; }' +
        '.acc-bank-desc { flex: 1; font-size: 0.9rem; color: var(--text-primary, #333); }' +
        '.acc-bank-amount { font-size: 1rem; font-weight: 600; min-width: 100px; text-align: right; }' +
        '.acc-bank-amount.credit { color: #00b894; }' +
        '.acc-bank-amount.debit { color: #e74c3c; }' +
        '.acc-bank-match { display: flex; align-items: center; gap: 8px; }' +
        '.acc-bank-match-label { font-size: 0.75rem; color: var(--text-secondary, #999); }' +

        /* ========== CONTACTS ========== */
        '.acc-contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }' +
        '.acc-contact-card { background: var(--bg-primary, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e0e0e0); cursor: pointer; transition: all 0.2s ease; }' +
        '.acc-contact-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-contact-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary, #6c5ce7), var(--accent-secondary, #a29bfe)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; }' +
        '.acc-contact-name { font-size: 1rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 4px; }' +
        '.acc-contact-company { font-size: 0.85rem; color: var(--text-secondary, #666); margin-bottom: 8px; }' +
        '.acc-contact-email { font-size: 0.8rem; color: var(--accent-primary, #6c5ce7); }' +
        '.acc-contact-meta { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color, #f0f0f0); font-size: 0.8rem; color: var(--text-secondary, #666); }' +
        '.acc-contact-detail { position: absolute; top: 0; right: -420px; width: 420px; height: 100%; background: var(--bg-primary, #fff); box-shadow: -4px 0 24px rgba(0,0,0,0.15); z-index: 100; transition: right 0.3s ease; overflow-y: auto; }' +
        '.acc-contact-detail.open { right: 0; }' +
        '.acc-contact-detail-header { padding: 20px; border-bottom: 1px solid var(--border-color, #e0e0e0); display: flex; align-items: center; justify-content: space-between; }' +
        '.acc-contact-detail-body { padding: 20px; }' +

        /* ========== ALERTES ========== */
        '.acc-alerts-list { display: flex; flex-direction: column; gap: 10px; }' +
        '.acc-alert-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px; border-radius: 12px; border: 1px solid var(--border-color, #e0e0e0); background: var(--bg-primary, #fff); transition: opacity 0.3s; }' +
        '.acc-alert-card.read { opacity: 0.6; }' +
        '.acc-alert-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }' +
        '.acc-alert-icon svg { width: 18px; height: 18px; }' +
        '.acc-alert-icon.info { background: rgba(9,132,227,0.12); color: #0984e3; }' +
        '.acc-alert-icon.warning { background: rgba(253,203,110,0.2); color: #e17055; }' +
        '.acc-alert-icon.critical { background: rgba(231,76,60,0.12); color: #e74c3c; }' +
        '.acc-alert-body { flex: 1; }' +
        '.acc-alert-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 4px; }' +
        '.acc-alert-message { font-size: 0.83rem; color: var(--text-secondary, #666); line-height: 1.4; }' +
        '.acc-alert-time { font-size: 0.75rem; color: var(--text-secondary, #999); margin-top: 6px; }' +
        '.acc-alert-actions { display: flex; gap: 6px; flex-shrink: 0; }' +

        /* ========== MODALES ========== */
        '.acc-modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }' +
        '.acc-modal-overlay.open { opacity: 1; visibility: visible; }' +
        '.acc-modal { background: var(--bg-primary, #fff); border-radius: 16px; width: 90%; max-width: 640px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); transform: translateY(20px); transition: transform 0.3s ease; }' +
        '.acc-modal-overlay.open .acc-modal { transform: translateY(0); }' +
        '.acc-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-color, #e0e0e0); }' +
        '.acc-modal-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary, #333); }' +
        '.acc-modal-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--bg-secondary, #f0f0f0); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }' +
        '.acc-modal-close:hover { background: #e0e0e0; }' +
        '.acc-modal-body { padding: 24px; }' +
        '.acc-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-color, #e0e0e0); }' +

        /* ========== FORMULAIRES ========== */
        '.acc-form-group { margin-bottom: 16px; }' +
        '.acc-form-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #666); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }' +
        '.acc-form-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }' +
        '.acc-form-input:focus { border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-form-textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.9rem; outline: none; resize: vertical; min-height: 80px; box-sizing: border-box; }' +
        '.acc-form-select { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.9rem; outline: none; cursor: pointer; box-sizing: border-box; }' +
        '.acc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }' +
        '.acc-form-section { margin-bottom: 24px; }' +
        '.acc-form-section-title { font-size: 0.95rem; font-weight: 600; color: var(--text-primary, #333); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color, #f0f0f0); }' +

        /* ========== PAGINATION ========== */
        '.acc-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; }' +
        '.acc-pagination-btn { padding: 8px 14px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; background: var(--bg-primary, #fff); color: var(--text-primary, #333); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }' +
        '.acc-pagination-btn:hover { border-color: var(--accent-primary, #6c5ce7); color: var(--accent-primary, #6c5ce7); }' +
        '.acc-pagination-btn.active { background: var(--accent-primary, #6c5ce7); color: #fff; border-color: var(--accent-primary, #6c5ce7); }' +
        '.acc-pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }' +
        '.acc-pagination-info { font-size: 0.8rem; color: var(--text-secondary, #666); }' +

        /* ========== TOOLTIP ========== */
        '.acc-tooltip { position: relative; }' +
        '.acc-tooltip::after { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-4px); padding: 6px 10px; background: #333; color: #fff; font-size: 0.75rem; border-radius: 6px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 100; }' +
        '.acc-tooltip:hover::after { opacity: 1; }' +

        /* ========== RESPONSIVE ========== */
        '@media (max-width: 1200px) {' +
            '.acc-stats-grid { grid-template-columns: repeat(2, 1fr); }' +
            '.acc-charts-grid { grid-template-columns: 1fr; }' +
        '}' +
        '@media (max-width: 768px) {' +
            '.acc-header { flex-direction: column; gap: 12px; padding: 12px 16px; }' +
            '.acc-header-actions { width: 100%; justify-content: flex-end; }' +
            '.acc-tabs { padding: 0 12px; }' +
            '.acc-tab { padding: 10px 14px; font-size: 0.8rem; }' +
            '.acc-content { padding: 16px; }' +
            '.acc-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }' +
            '.acc-stat-card { padding: 14px; }' +
            '.acc-stat-value { font-size: 1.4rem; }' +
            '.acc-tva-summary { grid-template-columns: 1fr; }' +
            '.acc-budget-grid { grid-template-columns: 1fr; }' +
            '.acc-contacts-grid { grid-template-columns: 1fr; }' +
            '.acc-scanner-preview { grid-template-columns: 1fr; }' +
            '.acc-scanner-thumb { width: 100%; height: 200px; }' +
            '.acc-filter-bar { flex-direction: column; }' +
            '.acc-search-wrapper { min-width: 100%; }' +
            '.acc-form-row { grid-template-columns: 1fr; }' +
            '.acc-bank-item { flex-wrap: wrap; }' +
            '.acc-contact-detail { width: 100%; right: -100%; }' +
            '.acc-modal { width: 95%; max-height: 90vh; }' +
        '}' +
        '@media (max-width: 480px) {' +
            '.acc-stats-grid { grid-template-columns: 1fr; }' +
            '.acc-tab { padding: 8px 10px; font-size: 0.75rem; }' +
            '.acc-tab svg { width: 14px; height: 14px; }' +
            '.acc-table th, .acc-table td { padding: 8px 10px; font-size: 0.8rem; }' +
        '}' +

        '';
    }

    return { inject: inject };
})();
