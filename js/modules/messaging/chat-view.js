/**
 * CHAT VIEW - ProductiveApp v4.0
 * Orchestrateur - utilise ChatStyles, ChatUI, ChatHistory, ChatResponses
 */

const ChatView = (function() {
    'use strict';

    var CONFIG = {
        containerId: 'view-messaging',
        typingDelay: 800
    };

    var messages = [];
    var isTyping = false;

    function addMessage(text, isUser) {
        var message = ChatHistory.addMessage(messages, text, isUser);
        ChatUI.renderMessage(message);
        return message;
    }

    function handleSubmit() {
        var input = document.getElementById('chat-input');
        if (!input) return;

        var text = input.value.trim();
        if (!text || isTyping) return;

        addMessage(text, true);
        input.value = '';

        isTyping = true;
        ChatUI.showTyping();

        setTimeout(function() {
            ChatUI.hideTyping();
            isTyping = false;
            var response = ChatResponses.generate(text);
            addMessage(response, false);
        }, CONFIG.typingDelay + Math.random() * 500);
    }

    function clearHistory() {
        if (!confirm('Voulez-vous vraiment effacer l\'historique de conversation ?')) {
            return;
        }
        messages = [];
        ChatHistory.clear();
        render();
        setTimeout(function() {
            addMessage(ChatResponses.getClearedMessage(), false);
        }, 300);
    }

    function quickAction(type) {
        var input = document.getElementById('chat-input');
        var queries = {
            tasks: 'Montre-moi un resume de mes taches',
            productivity: 'Donne-moi des conseils de productivite',
            help: 'Comment utiliser ProductiveApp ?'
        };

        if (input && queries[type]) {
            input.value = queries[type];
            handleSubmit();
        }
    }

    function showHelp() {
        addMessage('aide', true);
        isTyping = true;
        ChatUI.showTyping();
        setTimeout(function() {
            ChatUI.hideTyping();
            isTyping = false;
            addMessage(ChatResponses.getHelpMessage(), false);
        }, CONFIG.typingDelay);
    }

    function render() {
        var container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.error('ChatView: Container not found:', CONFIG.containerId);
            return;
        }

        ChatStyles.inject();
        container.innerHTML = ChatUI.buildTemplate();

        messages = ChatHistory.load();
        var messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messages.forEach(function(msg) {
                ChatUI.renderMessage(msg);
            });
        }

        if (messages.length === 0) {
            setTimeout(function() {
                addMessage(ChatResponses.getWelcomeMessage(), false);
            }, 500);
        }

        setTimeout(function() {
            var input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 100);

        console.log('💬 ChatView rendered');
    }

    function refresh() {
        render();
    }

    function init() {
        console.log('💬 ChatView: Initialized');
    }

    return {
        init: init,
        render: render,
        refresh: refresh,
        handleSubmit: handleSubmit,
        clearHistory: clearHistory,
        quickAction: quickAction,
        showHelp: showHelp
    };
})();

if (typeof window !== 'undefined') {
    window.ChatView = ChatView;
    window.MessagingView = ChatView;
}

console.log('📦 chat/chat-view.js loaded');
