/**
 * CHAT STYLES - ProductiveApp v4.0
 * Injection CSS pour le module Chat
 */
const ChatStyles = (function() {
    'use strict';
    let injected = false;

    const CSS = `
.chat-view { display:flex; flex-direction:column; height:100%; background:var(--background,#0a0a0f); }
.chat-view-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:var(--surface,#12121a); border-bottom:1px solid var(--border,rgba(255,255,255,0.08)); }
.chat-view-title { display:flex; align-items:center; gap:14px; }
.chat-view-icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2)); border-radius:12px; }
.chat-view-icon svg { width:24px; height:24px; stroke:#8b5cf6; }
.chat-view-title h2 { margin:0; font-size:18px; font-weight:600; color:var(--text,#fafafa); }
.chat-view-status { font-size:12px; color:#22c55e; display:flex; align-items:center; gap:6px; }
.chat-view-status::before { content:''; width:8px; height:8px; background:#22c55e; border-radius:50%; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.chat-view-actions { display:flex; gap:8px; }
.chat-action-btn { width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border:1px solid var(--border,rgba(255,255,255,0.08)); border-radius:10px; cursor:pointer; transition:all 0.2s ease; }
.chat-action-btn svg { width:18px; height:18px; stroke:var(--text-muted,#71717a); }
.chat-action-btn:hover { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.3); }
.chat-action-btn:hover svg { stroke:#8b5cf6; }
.chat-messages { flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:16px; }
.chat-message { display:flex; gap:12px; max-width:85%; animation:fadeIn 0.3s ease; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.chat-message.user { flex-direction:row-reverse; margin-left:auto; }
.chat-message-avatar { width:36px; height:36px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--surface,#12121a); border-radius:10px; border:1px solid var(--border,rgba(255,255,255,0.08)); }
.chat-message-avatar svg { width:18px; height:18px; stroke:var(--text-muted,#71717a); }
.chat-message.bot .chat-message-avatar { background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2)); }
.chat-message.bot .chat-message-avatar svg { stroke:#8b5cf6; }
.chat-message.user .chat-message-avatar { background:rgba(34,197,94,0.15); }
.chat-message.user .chat-message-avatar svg { stroke:#22c55e; }
.chat-message-content { display:flex; flex-direction:column; gap:4px; }
.chat-message-text { padding:14px 18px; border-radius:16px; font-size:14px; line-height:1.6; color:var(--text,#fafafa); }
.chat-message.bot .chat-message-text { background:var(--surface,#12121a); border:1px solid var(--border,rgba(255,255,255,0.08)); border-bottom-left-radius:4px; }
.chat-message.user .chat-message-text { background:linear-gradient(135deg,#8b5cf6,#6366f1); border-bottom-right-radius:4px; }
.chat-message-time { font-size:11px; color:var(--text-muted,#71717a); padding:0 4px; }
.chat-message.user .chat-message-time { text-align:right; }
.chat-typing-dots { display:flex; gap:4px; padding:14px 18px; }
.chat-typing-dots span { width:8px; height:8px; background:var(--text-muted,#71717a); border-radius:50%; animation:typing 1.4s infinite; }
.chat-typing-dots span:nth-child(2) { animation-delay:0.2s; }
.chat-typing-dots span:nth-child(3) { animation-delay:0.4s; }
@keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-8px);opacity:1} }
.chat-quick-actions { display:flex; gap:8px; padding:12px 24px; border-top:1px solid var(--border,rgba(255,255,255,0.05)); overflow-x:auto; }
.chat-quick-btn { padding:8px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--border,rgba(255,255,255,0.08)); border-radius:20px; font-size:13px; color:var(--text,#fafafa); cursor:pointer; white-space:nowrap; transition:all 0.2s ease; }
.chat-quick-btn:hover { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.3); }
.chat-input-container { display:flex; gap:12px; padding:16px 24px 24px; background:var(--surface,#12121a); border-top:1px solid var(--border,rgba(255,255,255,0.08)); }
.chat-input { flex:1; padding:14px 18px; background:var(--background,#0a0a0f); border:1px solid var(--border,rgba(255,255,255,0.1)); border-radius:12px; font-size:14px; color:var(--text,#fafafa); outline:none; transition:border-color 0.2s ease; }
.chat-input:focus { border-color:#8b5cf6; }
.chat-input::placeholder { color:var(--text-muted,#71717a); }
.chat-send-btn { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#8b5cf6,#6366f1); border:none; border-radius:12px; cursor:pointer; transition:all 0.2s ease; }
.chat-send-btn svg { width:20px; height:20px; stroke:white; }
.chat-send-btn:hover { transform:scale(1.05); box-shadow:0 4px 20px rgba(139,92,246,0.4); }
.chat-send-btn:active { transform:scale(0.95); }
.chat-messages::-webkit-scrollbar { width:6px; }
.chat-messages::-webkit-scrollbar-track { background:transparent; }
.chat-messages::-webkit-scrollbar-thumb { background:var(--border,rgba(255,255,255,0.1)); border-radius:3px; }
.chat-messages::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
`;

    function inject() {
        if (injected) return;
        var style = document.createElement('style');
        style.id = 'chat-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
        injected = true;
    }

    return { inject: inject };
})();

if (typeof window !== 'undefined') {
    window.ChatStyles = ChatStyles;
}
