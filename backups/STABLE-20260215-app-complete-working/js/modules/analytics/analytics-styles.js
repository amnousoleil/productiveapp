/**
 * Analytics Styles Module
 * CSS injection for analytics view
 */

var AnalyticsStyles = (function() {
    'use strict';

    function inject() {
        if (document.getElementById('analytics-view-styles')) return;

        var style = document.createElement('style');
        style.id = 'analytics-view-styles';
        style.textContent = [
            '.analytics-page{padding:0;max-width:1200px;margin:0 auto}',
            '.analytics-period-selector{display:flex;gap:8px;margin-bottom:24px;background:var(--surface,#1a1a2e);padding:4px;border-radius:12px;width:fit-content}',
            '.period-btn{padding:10px 20px;border:none;background:transparent;color:var(--text-muted,#888);border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.2s}',
            '.period-btn:hover{color:var(--text,#fff)}',
            '.period-btn.active{background:var(--primary,#8b5cf6);color:white}',
            '.analytics-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}',
            '@media(max-width:768px){.analytics-stats-row{grid-template-columns:repeat(2,1fr)}}',
            '.analytics-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}',
            '@media(max-width:768px){.analytics-grid{grid-template-columns:1fr}}',
            '.analytics-card{background:var(--surface,#1a1a2e);border-radius:16px;padding:20px;margin-bottom:16px}',
            '.analytics-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
            '.analytics-card-header h3{margin:0;font-size:16px;font-weight:600;color:var(--text,#fff)}',
            '.analytics-chart{height:200px}',
            '.analytics-chart svg{width:100%;height:100%}',
            '.analytics-heatmap{height:120px;overflow-x:auto}',
            '.analytics-heatmap svg{min-width:100%;height:100%}',
            '.streak-main{text-align:center;padding:20px 0}',
            '.streak-icon{font-size:48px;margin-bottom:8px}',
            '.streak-value{font-size:48px;font-weight:800;color:var(--text,#fff)}',
            '.streak-label{color:var(--text-muted,#888);font-size:14px}',
            '.streak-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border,#333)}',
            '.streak-stat{text-align:center}',
            '.streak-stat-value{display:block;font-weight:600;color:var(--text,#fff)}',
            '.streak-stat-label{font-size:11px;color:var(--text-muted,#888)}',
            '.activity-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border,#333)}',
            '.activity-item:last-child{border-bottom:none}',
            '.activity-icon{width:32px;height:32px;border-radius:8px;background:var(--surface-hover,#252540);display:flex;align-items:center;justify-content:center}',
            '.activity-content{flex:1}',
            '.activity-content strong{display:block;color:var(--text,#fff)}',
            '.activity-action{font-size:12px;color:var(--text-muted,#888)}',
            '.activity-time{font-size:12px;color:var(--text-muted,#888)}',
            '.stat-icon.green{color:#22c55e}',
            '.stat-icon.blue{color:#3b82f6}',
            '.stat-icon.orange{color:#f59e0b}',
            '.stat-icon.up{color:#22c55e}',
            '.stat-icon.down{color:#ef4444}',
            '.loading,.error,.empty-state{text-align:center;padding:40px;color:var(--text-muted,#888)}'
        ].join('\n');

        document.head.appendChild(style);
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsStyles = AnalyticsStyles;
}
