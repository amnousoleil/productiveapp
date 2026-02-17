/**
 * CHAT UI - ProductiveApp v4.0
 * Rendu HTML des messages et indicateurs
 */

const ChatUI = (function() {
    'use strict';

    var icons = {
        send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    function getIcon(name) {
        return icons[name] || '';
    }

    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function formatTime(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function renderMessage(message, containerId) {
        var messagesContainer = document.getElementById(containerId || 'chat-messages');
        if (!messagesContainer) return;

        var div = document.createElement('div');
        div.className = 'chat-message ' + (message.isUser ? 'user' : 'bot');
        div.innerHTML = 
            '<div class="chat-message-avatar">' +
                (message.isUser ? icons.user : icons.bot) +
            '</div>' +
            '<div class="chat-message-content">' +
                '<div class="chat-message-text">' + formatMessage(message.text) + '</div>' +
                '<div class="chat-message-time">' + formatTime(message.timestamp) + '</div>' +
            '</div>';

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping(containerId) {
        var messagesContainer = document.getElementById(containerId || 'chat-messages');
        if (!messagesContainer) return;

        var typing = document.createElement('div');
        typing.id = 'chat-typing';
        typing.className = 'chat-message bot typing';
        typing.innerHTML = 
            '<div class="chat-message-avatar">' + icons.bot + '</div>' +
            '<div class="chat-message-content">' +
                '<div class="chat-typing-dots">' +
                    '<span></span><span></span><span></span>' +
                '</div>' +
            '</div>';
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
        var typing = document.getElementById('chat-typing');
        if (typing) typing.remove();
    }

    function buildTemplate() {
        return '<div class="chat-view">' +
            '<div class="chat-view-header">' +
                '<div class="chat-view-title">' +
                    '<span class="chat-view-icon">' + icons.sparkle + '</span>' +
                    '<div>' +
                        '<h2>Mahayawen</h2>' +
                        '<span class="chat-view-status">En ligne</span>' +
                    '</div>' +
                '</div>' +
                '<div class="chat-view-actions">' +
                    '<button class="chat-action-btn" onclick="ChatView.showHelp()" title="Aide">' +
                        icons.help +
                    '</button>' +
                    '<button class="chat-action-btn" onclick="ChatView.clearHistory()" title="Effacer l\'historique">' +
                        icons.trash +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="chat-messages" id="chat-messages"></div>' +
            '<div class="chat-quick-actions">' +
                '<button class="chat-quick-btn" onclick="ChatView.quickAction(\'tasks\')">📋 Mes taches</button>' +
                '<button class="chat-quick-btn" onclick="ChatView.quickAction(\'productivity\')">💡 Conseils</button>' +
                '<button class="chat-quick-btn" onclick="ChatView.quickAction(\'help\')">❓ Aide</button>' +
            '</div>' +
            '<div class="chat-input-container">' +
                '<input type="text" id="chat-input" class="chat-input" placeholder="Posez une question..." onkeypress="if(event.key === \'Enter\') ChatView.handleSubmit()" autocomplete="off">' +
                '<button class="chat-send-btn" onclick="ChatView.handleSubmit()">' +
                    icons.send +
                '</button>' +
            '</div>' +
        '</div>';
    }

    return {
        getIcon: getIcon,
        formatMessage: formatMessage,
        formatTime: formatTime,
        renderMessage: renderMessage,
        showTyping: showTyping,
        hideTyping: hideTyping,
        buildTemplate: buildTemplate
    };
})();

if (typeof window !== 'undefined') {
    window.ChatUI = ChatUI;
}
