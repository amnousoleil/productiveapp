/**
 * PSYCHO-AUDIT STYLES - CSS injection
 * ProductiveApp v5.0
 */

const PaStyles = (function() {
    'use strict';

    function inject() {
        if (document.getElementById('psycho-audit-styles')) return;

        var style = document.createElement('style');
        style.id = 'psycho-audit-styles';
        style.textContent = [
            '.psycho-audit-view { padding: 24px; max-width: 800px; margin: 0 auto; }',
            '.audit-header { text-align: center; margin-bottom: 32px; }',
            '.audit-header h1 { font-size: 28px; font-weight: 700; color: var(--primary, #8b5cf6); margin-bottom: 8px; }',
            '.audit-header .subtitle { color: var(--text-secondary, #888); font-size: 14px; }',
            '',
            '/* Questionnaire */',
            '.questionnaire { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; }',
            '.questionnaire h2 { font-size: 18px; margin-bottom: 8px; color: var(--text, #fff); }',
            '.questionnaire-intro { color: var(--text-secondary, #888); font-size: 13px; margin-bottom: 24px; }',
            '.axis-group { margin-bottom: 24px; padding: 20px; background: var(--surface-hover, #2a2a3e); border-radius: 14px; }',
            '.axis-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border, #333); }',
            '.axis-icon { font-size: 22px; }',
            '.axis-label { color: var(--primary, #8b5cf6); font-size: 15px; font-weight: 600; }',
            '.question-item { margin-bottom: 16px; padding: 14px; background: var(--surface, #1e1e2e); border-radius: 10px; }',
            '.question-item:last-child { margin-bottom: 0; }',
            '.question-text { color: var(--text, #fff); font-size: 14px; line-height: 1.5; margin-bottom: 12px; }',
            '.question-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }',
            '.question-icon { font-size: 20px; }',
            '.question-label { color: var(--text, #fff); font-size: 14px; }',
            '.stars-container { display: flex; gap: 8px; justify-content: center; }',
            '.star-btn { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.15s; }',
            '.star-btn:hover { transform: scale(1.2); }',
            '.star-btn.filled svg polygon { fill: var(--accent, #f59e0b); stroke: var(--accent, #f59e0b); }',
            '.btn-analyze { width: 100%; padding: 16px; margin-top: 24px; background: linear-gradient(135deg, var(--primary, #8b5cf6), #6366f1); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s, opacity 0.2s; }',
            '.btn-analyze:hover:not(:disabled) { transform: translateY(-2px); }',
            '.btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }',
            '.hint { text-align: center; color: var(--text-secondary, #888); font-size: 12px; margin-top: 12px; }',
            '',
            '/* Results */',
            '.results { display: flex; flex-direction: column; gap: 24px; }',
            '.score-section { text-align: center; padding: 32px; background: var(--surface, #1e1e2e); border-radius: 16px; }',
            '.score-badge { display: inline-flex; align-items: baseline; padding: 16px 32px; border-radius: 16px; border: 2px solid; }',
            '.score-value { font-size: 48px; font-weight: 800; }',
            '.score-max { font-size: 24px; opacity: 0.6; margin-left: 4px; }',
            '.score-label { font-size: 18px; font-weight: 600; margin-top: 12px; }',
            '.score-date { color: var(--text-secondary, #888); font-size: 13px; margin-top: 8px; }',
            '.xp-badge { display: inline-block; margin-top: 12px; padding: 6px 12px; background: var(--accent, #f59e0b); color: #000; border-radius: 20px; font-size: 12px; font-weight: 700; }',
            '',
            '/* Radar */',
            '.radar-section { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; text-align: center; }',
            '.radar-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--text, #fff); }',
            '.radar-container { display: flex; justify-content: center; }',
            '',
            '/* Recommendations */',
            '.recommendations-section { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; }',
            '.recommendations-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--text, #fff); }',
            '.recommendation-item { display: flex; gap: 12px; padding: 14px; background: var(--surface-hover, #2a2a3e); border-radius: 10px; margin-bottom: 10px; }',
            '.rec-icon { font-size: 20px; }',
            '.rec-area { font-size: 12px; color: var(--text-secondary, #888); margin-bottom: 4px; }',
            '.rec-text { color: var(--text, #fff); font-size: 14px; }',
            '',
            '/* Trends */',
            '.trends-section { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; }',
            '.trends-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--text, #fff); }',
            '.trends-chart { height: 120px; margin-bottom: 12px; }',
            '.trends-svg, .evolution-svg { width: 100%; height: 100%; }',
            '.trends-empty, .chart-empty { color: var(--text-secondary, #888); font-size: 13px; text-align: center; padding: 24px; }',
            '.trends-comparison { text-align: center; font-size: 14px; color: var(--text-secondary, #888); }',
            '.trends-diff { font-weight: 700; }',
            '',
            '/* History */',
            '.history-section { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; }',
            '.history-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--text, #fff); }',
            '.history-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border, #333); }',
            '.history-item:last-child { border-bottom: none; }',
            '.history-date { font-size: 13px; color: var(--text-secondary, #888); width: 80px; }',
            '.history-bar { flex: 1; height: 8px; background: var(--surface-hover, #2a2a3e); border-radius: 4px; overflow: hidden; }',
            '.history-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }',
            '.history-score { font-size: 14px; font-weight: 700; width: 40px; text-align: right; }',
            '',
            '/* New Audit Button */',
            '.btn-new-audit { width: 100%; padding: 14px; background: var(--surface, #1e1e2e); color: var(--text, #fff); border: 2px solid var(--border, #333); border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }',
            '.btn-new-audit:hover { border-color: var(--primary, #8b5cf6); background: var(--surface-hover, #2a2a3e); }',
            '',
            '/* AI Report */',
            '.ai-report-section { background: var(--surface, #1e1e2e); border-radius: 16px; padding: 24px; }',
            '.ai-report-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--text, #fff); }',
            '.pa-report-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }',
            '.pa-report-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }',
            '.pa-report-container { margin-top: 16px; }',
            '.pa-report-loading { text-align: center; padding: 32px; color: var(--text-secondary, #888); }',
            '.pa-report-loading .loading-spinner { width: 32px; height: 32px; border: 3px solid var(--border, #333); border-top-color: var(--accent, #f59e0b); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }',
            '@keyframes spin { to { transform: rotate(360deg); } }',
            '.pa-report-content { background: var(--surface-hover, #2a2a3e); border-radius: 12px; padding: 20px; color: var(--text, #fff); font-size: 14px; line-height: 1.6; }',
            '.pa-report-content h3 { font-size: 18px; color: var(--primary, #8b5cf6); margin: 16px 0 8px; }',
            '.pa-report-content h4 { font-size: 15px; color: var(--accent, #f59e0b); margin: 12px 0 6px; }',
            '.pa-report-content ul { margin: 8px 0; padding-left: 20px; }',
            '.pa-report-content li { margin: 4px 0; }',
            '.pa-report-content pre { background: var(--surface, #1e1e2e); padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; }',
            '.pa-report-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }',
            '.pa-report-table td { padding: 8px; border: 1px solid var(--border, #333); }',
            '.pa-report-content hr { border: none; border-top: 1px solid var(--border, #333); margin: 16px 0; }',
            '.pa-report-empty { text-align: center; color: var(--text-secondary, #888); padding: 24px; }',
            '',
            '@media (max-width: 600px) {',
            '    .psycho-audit-view { padding: 16px; }',
            '    .audit-header h1 { font-size: 22px; }',
            '    .score-value { font-size: 36px; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.PaStyles = PaStyles;
}
