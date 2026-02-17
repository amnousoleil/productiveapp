/**
 * Gamification View - Styles Module
 * CSS injection for gamification-view.js
 */

const GVStyles = (function() {
    'use strict';

    function inject() {
        if (document.getElementById('gamification-view-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'gamification-view-styles';
        styles.textContent = `
            .gamification-page { max-width: 1400px; margin: 0 auto; padding: 0; }
            .gamif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
            .gamif-level-display { display: flex; align-items: center; gap: 16px; background: var(--surface, #1a1a2e); padding: 12px 20px; border-radius: 16px; }
            .level-badge { width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
            .level-number { font-size: 20px; font-weight: 800; color: white; }
            .xp-bar-wrapper { min-width: 200px; }
            .xp-bar { height: 12px; background: var(--surface-hover, #252540); border-radius: 6px; overflow: hidden; }
            .xp-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 6px; transition: width 0.5s ease; }
            .xp-text { font-size: 12px; color: var(--text-muted, #888); margin-top: 4px; text-align: center; }
            .gamif-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
            .stat-card { background: var(--surface, #1a1a2e); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
            .stat-card:hover { transform: translateY(-2px); }
            .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .stat-icon svg { width: 24px; height: 24px; }
            .stat-icon.gold { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
            .stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
            .stat-icon.orange { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .stat-icon.green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
            .stat-value { font-size: 28px; font-weight: 700; color: var(--text, #fff); }
            .stat-label { font-size: 13px; color: var(--text-muted, #888); }
            .gamif-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
            @media (max-width: 1024px) { .gamif-grid { grid-template-columns: 1fr; } }
            .gamif-section { background: var(--surface, #1a1a2e); border-radius: 16px; padding: 24px; }
            .section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: var(--text, #fff); margin-bottom: 20px; }
            .section-title svg { width: 20px; height: 20px; color: var(--primary, #E07840); }
            .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
            .badge-item { background: var(--background, #0f0f1a); border-radius: 12px; padding: 16px; text-align: center; transition: all 0.2s; border: 2px solid transparent; cursor: pointer; position: relative; }
            .badge-item:hover { transform: translateY(-4px); }
            .badge-item.unlocked { border-color: var(--badge-color, #9ca3af); }
            .badge-item.locked { opacity: 0.5; filter: grayscale(0.8); }
            .badge-item.common { --badge-color: #9ca3af; }
            .badge-item.rare { --badge-color: #3b82f6; }
            .badge-item.epic { --badge-color: #8b5cf6; }
            .badge-item.legendary { --badge-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
            .badge-icon { font-size: 32px; margin-bottom: 8px; }
            .badge-name { font-size: 13px; font-weight: 600; color: var(--text, #fff); margin-bottom: 4px; }
            .badge-rarity { font-size: 11px; color: var(--badge-color); text-transform: uppercase; letter-spacing: 0.5px; }
            .badge-date { font-size: 10px; color: var(--text-muted, #888); margin-top: 4px; }
            .badge-lock { position: absolute; top: 8px; right: 8px; opacity: 0.5; }
            .badge-lock svg { width: 14px; height: 14px; }
            .badge-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: var(--surface, #1a1a2e); border: 1px solid var(--border, #333); border-radius: 8px; padding: 12px; width: 200px; z-index: 100; opacity: 0; visibility: hidden; transition: all 0.2s; pointer-events: none; }
            .badge-item:hover .badge-tooltip { opacity: 1; visibility: visible; bottom: calc(100% + 8px); }
            .badge-tooltip-title { font-weight: 600; color: var(--text, #fff); margin-bottom: 4px; }
            .badge-tooltip-desc { font-size: 12px; color: var(--text-muted, #888); }
            .badge-tooltip-reward { font-size: 11px; color: #f59e0b; margin-top: 8px; }
            .leaderboard-list { display: flex; flex-direction: column; gap: 8px; }
            .leaderboard-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--background, #0f0f1a); border-radius: 10px; transition: all 0.2s; }
            .leaderboard-item:hover { background: var(--surface-hover, #252540); }
            .leaderboard-item.top-1 { background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(245, 158, 11, 0.3); }
            .leaderboard-item.top-2 { background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05)); border: 1px solid rgba(192, 192, 192, 0.2); }
            .leaderboard-item.top-3 { background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05)); border: 1px solid rgba(205, 127, 50, 0.2); }
            .rank-badge { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; background: var(--surface, #1a1a2e); color: var(--text-muted, #888); }
            .top-1 .rank-badge { background: #f59e0b; color: white; }
            .top-2 .rank-badge { background: #c0c0c0; color: #333; }
            .top-3 .rank-badge { background: #cd7f32; color: white; }
            .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary, #E07840); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; }
            .user-info { flex: 1; }
            .user-name { font-weight: 500; color: var(--text, #fff); }
            .user-level { font-size: 12px; color: var(--text-muted, #888); }
            .user-xp { font-weight: 600; color: #f59e0b; }
            .streak-calendar { display: flex; flex-wrap: wrap; gap: 4px; }
            .streak-day { width: 20px; height: 20px; border-radius: 4px; background: var(--surface-hover, #252540); transition: all 0.2s; }
            .streak-day.active { background: #22c55e; }
            .streak-day.today { border: 2px solid var(--primary, #E07840); }
            .streak-day:hover { transform: scale(1.2); }
            .xp-history-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
            .xp-history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--background, #0f0f1a); border-radius: 10px; }
            .xp-history-left { display: flex; align-items: center; gap: 12px; }
            .xp-reason-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
            .xp-reason-icon svg { width: 18px; height: 18px; }
            .xp-reason-text { font-size: 14px; color: var(--text, #fff); }
            .xp-reason-time { font-size: 12px; color: var(--text-muted, #888); }
            .xp-amount { font-weight: 700; color: #22c55e; font-size: 16px; }
            .xp-amount.negative { color: #ef4444; }
            .loading { text-align: center; padding: 24px; color: var(--text-muted, #888); }
            .empty-state { text-align: center; padding: 32px; color: var(--text-muted, #888); }
            .streak-section, .history-section { margin-bottom: 24px; }
            @media (max-width: 768px) {
                .gamif-header { flex-direction: column; align-items: flex-start; }
                .gamif-level-display { width: 100%; }
                .badges-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
            }
        `;
        document.head.appendChild(styles);
    }

    return { inject };
})();

if (typeof window !== 'undefined') {
    window.GVStyles = GVStyles;
}
