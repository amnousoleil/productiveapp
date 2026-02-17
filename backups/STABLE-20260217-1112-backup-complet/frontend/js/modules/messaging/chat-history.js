/**
 * CHAT HISTORY - ProductiveApp v4.0
 * Gestion de l'historique localStorage
 */

const ChatHistory = (function() {
    'use strict';

    var STORAGE_KEY = 'productiveapp_chat_history';
    var MAX_MESSAGES = 50;

    function save(messages) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
            console.warn('ChatHistory: Could not save', e);
        }
    }

    function load() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('ChatHistory: Could not load', e);
        }
        return [];
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function addMessage(messages, text, isUser) {
        var message = {
            id: Date.now(),
            text: text,
            isUser: isUser,
            timestamp: new Date().toISOString()
        };
        messages.push(message);

        // Keep only last N messages
        if (messages.length > MAX_MESSAGES) {
            messages = messages.slice(-MAX_MESSAGES);
        }

        save(messages);
        return message;
    }

    function getMaxMessages() {
        return MAX_MESSAGES;
    }

    return {
        save: save,
        load: load,
        clear: clear,
        addMessage: addMessage,
        getMaxMessages: getMaxMessages
    };
})();

if (typeof window !== 'undefined') {
    window.ChatHistory = ChatHistory;
}
