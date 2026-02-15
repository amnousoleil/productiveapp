/**
 * GALAXIE STYLES - CSS injection for Galaxie View overlay
 */
const GalaxieStyles = (function() {
    'use strict';

    const CSS = `
#galaxie-view-overlay.galaxie-view-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.95)!important;z-index:999999!important;flex-direction:column;opacity:1;transition:opacity .2s ease}
#galaxie-view-overlay.galaxie-view-overlay:not(.hidden){display:flex!important;visibility:visible!important;pointer-events:auto!important}
#galaxie-view-overlay.galaxie-view-overlay.hidden{display:none!important;visibility:hidden!important;opacity:0;pointer-events:none!important}
.galaxie-view-header{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#1a1a24;border-bottom:1px solid rgba(139,92,246,0.3)}
.galaxie-view-title{display:flex;align-items:center;gap:8px;font-family:'Inter',-apple-system,sans-serif;font-size:14px;font-weight:600;color:#a78bfa}
.galaxie-view-title svg{color:#8b5cf6}
.galaxie-view-close-btn{background:transparent;border:none;color:#6b7280;cursor:pointer;padding:8px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .15s ease}
.galaxie-view-close-btn:hover{background:rgba(139,92,246,0.2);color:#a78bfa}
.galaxie-view-iframe{flex:1;width:100%;border:none;background:#121212}
@keyframes galaxieViewFadeIn{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
.galaxie-view-overlay:not(.hidden){animation:galaxieViewFadeIn .2s ease forwards}
@media(max-width:768px){.galaxie-view-header{padding:6px 12px}.galaxie-view-title{font-size:13px}}
`;

    function inject() {
        if (document.getElementById('galaxie-view-styles')) return;
        var style = document.createElement('style');
        style.id = 'galaxie-view-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.GalaxieStyles = GalaxieStyles;
}
