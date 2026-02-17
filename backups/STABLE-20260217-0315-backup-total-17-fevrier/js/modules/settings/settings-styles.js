/**
 * SETTINGS STYLES - ProductiveApp v4.0
 * Injection CSS pour le module Settings
 */

const SettingsStyles = (function() {
    'use strict';

    function inject() {
        if (document.getElementById('settings-view-styles')) return;

        var styles = document.createElement('style');
        styles.id = 'settings-view-styles';
        styles.textContent = [
            '/* Action Buttons for Data section */',
            '.settings-action-btn {',
            '    display: flex;',
            '    align-items: center;',
            '    gap: 14px;',
            '    width: 100%;',
            '    padding: 14px 16px;',
            '    background: rgba(255, 255, 255, 0.03);',
            '    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));',
            '    border-radius: 10px;',
            '    cursor: pointer;',
            '    transition: all 0.2s ease;',
            '    text-align: left;',
            '}',
            '.settings-action-btn:hover {',
            '    background: rgba(255, 255, 255, 0.06);',
            '    border-color: var(--primary, #8b5cf6);',
            '}',
            '.settings-action-btn.danger:hover {',
            '    background: rgba(239, 68, 68, 0.1);',
            '    border-color: #ef4444;',
            '}',
            '.settings-action-icon {',
            '    width: 40px;',
            '    height: 40px;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    background: rgba(139, 92, 246, 0.15);',
            '    border-radius: 10px;',
            '}',
            '.settings-action-btn.danger .settings-action-icon {',
            '    background: rgba(239, 68, 68, 0.15);',
            '}',
            '.settings-action-icon svg {',
            '    width: 20px;',
            '    height: 20px;',
            '    stroke: var(--primary, #8b5cf6);',
            '}',
            '.settings-action-btn.danger .settings-action-icon svg {',
            '    stroke: #ef4444;',
            '}',
            '.settings-action-info {',
            '    display: flex;',
            '    flex-direction: column;',
            '    gap: 2px;',
            '}',
            '.settings-action-label {',
            '    font-size: 14px;',
            '    font-weight: 500;',
            '    color: var(--text, #fafafa);',
            '}',
            '.settings-action-btn.danger .settings-action-label {',
            '    color: #ef4444;',
            '}',
            '.settings-action-desc {',
            '    font-size: 12px;',
            '    color: var(--text-muted, #71717a);',
            '}',
            '',
            '/* Toast animations */',
            '@keyframes slideInRight {',
            '    from { transform: translateX(100%); opacity: 0; }',
            '    to { transform: translateX(0); opacity: 1; }',
            '}',
            '@keyframes slideOutRight {',
            '    from { transform: translateX(0); opacity: 1; }',
            '    to { transform: translateX(100%); opacity: 0; }',
            '}',
            '',
            '/* Theme card improvements */',
            '.settings-theme-card {',
            '    padding: 12px;',
            '    border-radius: 10px;',
            '    border: 2px solid var(--border, rgba(255, 255, 255, 0.08));',
            '    cursor: pointer;',
            '    transition: all 0.2s ease;',
            '    text-align: center;',
            '    background: rgba(255, 255, 255, 0.02);',
            '}',
            '.settings-theme-card:hover {',
            '    border-color: var(--primary, #8b5cf6);',
            '    transform: translateY(-2px);',
            '}',
            '.settings-theme-card.active {',
            '    border-color: var(--primary, #8b5cf6);',
            '    background: rgba(139, 92, 246, 0.1);',
            '}',
            '.settings-theme-preview {',
            '    width: 100%;',
            '    height: 50px;',
            '    border-radius: 6px;',
            '    margin-bottom: 8px;',
            '}',
            '.settings-theme-name {',
            '    font-size: 13px;',
            '    font-weight: 600;',
            '    color: var(--text, #fafafa);',
            '}',
            '',
            '/* Toggle row */',
            '.settings-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.06)); }',
            '/* Inline input */',
            '.settings-input-inline { background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text); font-size: 18px; font-weight: 600; padding: 4px 0; width: 100%; outline: none; }',
            '.settings-input-inline:focus { border-color: var(--primary, #8b5cf6); }',
            '/* Primary button */',
            '.settings-btn.primary { background: var(--primary, #8b5cf6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: opacity 0.2s; }',
            '.settings-btn.primary:hover { opacity: 0.9; }'
        ].join('\n');

        document.head.appendChild(styles);
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.SettingsStyles = SettingsStyles;
}
