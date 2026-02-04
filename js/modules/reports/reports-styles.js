/**
 * REPORTS STYLES - ProductiveApp v4.0
 * Styles CSS pour le module Rapports
 */

const ReportsStyles = (function() {
    'use strict';

    function inject() {
        if (document.getElementById('reports-view-styles')) return;

        var styles = document.createElement('style');
        styles.id = 'reports-view-styles';
        styles.textContent = `
            .reports-page { padding: 0; max-width: 1200px; margin: 0 auto; }
            .reports-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
            .period-selector { display: flex; gap: 8px; background: var(--surface, #1a1a2e); padding: 4px; border-radius: 12px; }
            .period-btn { padding: 10px 20px; border: none; background: transparent; color: var(--text-muted, #888); border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
            .period-btn:hover { color: var(--text, #fff); }
            .period-btn.active { background: var(--primary, #E07840); color: white; }
            .period-navigation { display: flex; align-items: center; gap: 12px; }
            .nav-btn { width: 36px; height: 36px; border: none; background: var(--surface, #1a1a2e); color: var(--text, #fff); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .nav-btn:hover { background: var(--surface-hover, #252540); }
            .nav-btn svg { width: 18px; height: 18px; }
            .period-label { font-weight: 600; color: var(--text, #fff); min-width: 150px; text-align: center; }

            /* Summary Cards */
            .reports-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
            .summary-card { background: var(--surface, #1a1a2e); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s, box-shadow 0.2s; }
            .summary-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
            .summary-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .summary-icon svg { width: 24px; height: 24px; }
            .summary-icon.green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
            .summary-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
            .summary-icon.orange { background: rgba(224, 120, 64, 0.15); color: #E07840; }
            .summary-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .summary-content { flex: 1; }
            .summary-value { font-size: 28px; font-weight: 700; color: var(--text, #fff); line-height: 1; }
            .summary-label { font-size: 13px; color: var(--text-muted, #888); margin-top: 4px; }

            /* Section */
            .reports-section { margin-top: 32px; }
            .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; color: var(--text, #fff); margin-bottom: 16px; }
            .section-title svg { width: 20px; height: 20px; color: var(--primary, #E07840); }

            /* Reports List */
            .reports-list { display: flex; flex-direction: column; gap: 12px; }
            .report-item { background: var(--surface, #1a1a2e); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
            .report-item:hover { border-color: var(--primary, #E07840); background: var(--surface-hover, #252540); }
            .report-item-left { display: flex; align-items: center; gap: 16px; }
            .report-date { display: flex; flex-direction: column; }
            .report-date-main { font-weight: 600; color: var(--text, #fff); }
            .report-date-sub { font-size: 12px; color: var(--text-muted, #888); }
            .report-score-badge { padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 14px; }
            .score-excellent { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
            .score-good { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
            .score-average { background: rgba(234, 179, 8, 0.15); color: #eab308; }
            .score-low { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .report-stats { display: flex; gap: 24px; color: var(--text-muted, #888); font-size: 13px; }
            .report-stat { display: flex; align-items: center; gap: 6px; }
            .report-stat svg { width: 14px; height: 14px; }
            .empty-state { text-align: center; padding: 48px 20px; color: var(--text-muted, #888); }
            .empty-state svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

            /* Modal */
            .report-detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
            .modal-backdrop { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); }
            .modal-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 700px; max-height: 85vh; background: var(--background, #0f0f1a); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; }
            .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border, #333); display: flex; align-items: center; gap: 16px; }
            .modal-header h2 { font-size: 18px; font-weight: 600; color: var(--text, #fff); }
            .btn-back { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--surface, #1a1a2e); border: none; border-radius: 8px; color: var(--text, #fff); cursor: pointer; font-size: 14px; }
            .btn-back svg { width: 16px; height: 16px; }
            .modal-body { padding: 24px; overflow-y: auto; }

            /* Detail Content */
            .detail-header { text-align: center; margin-bottom: 32px; }
            .detail-score { font-size: 64px; font-weight: 800; background: linear-gradient(135deg, var(--primary, #E07840), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .detail-period { color: var(--text-muted, #888); margin-top: 8px; }
            .detail-section { margin-bottom: 24px; }
            .detail-section-title { font-weight: 600; color: var(--text, #fff); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            .detail-section-title svg { width: 18px; height: 18px; color: var(--primary, #E07840); }
            .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .detail-stat { background: var(--surface, #1a1a2e); padding: 16px; border-radius: 12px; }
            .detail-stat-label { font-size: 12px; color: var(--text-muted, #888); margin-bottom: 4px; }
            .detail-stat-value { font-size: 20px; font-weight: 700; color: var(--text, #fff); }
            .progress-bar-container { margin-top: 8px; }
            .progress-bar { height: 8px; background: var(--surface-hover, #252540); border-radius: 4px; overflow: hidden; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary, #E07840), #f59e0b); border-radius: 4px; transition: width 0.5s ease; }
            .summary-loading, .reports-loading { text-align: center; padding: 24px; color: var(--text-muted, #888); }

            @media (max-width: 768px) {
                .reports-filters { flex-direction: column; align-items: stretch; }
                .period-navigation { justify-content: center; }
                .report-stats { display: none; }
                .detail-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(styles);
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.ReportsStyles = ReportsStyles;
}
