// js/modules/giri-vision/giri-vision-ui.js
export const giriVisionUI = {
    addMessage(role, content) {
        const chatContainer = document.getElementById('giri-chat-messages');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `giri-message ${role}`;

        const avatar = role === 'user' ? '👤' : '🔮';
        const name = role === 'user' ? 'Toi' : 'Mahayawen';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-name">${name}</div>
                <div class="message-text">${this.formatMessage(content)}</div>
            </div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },

    formatMessage(text) {
        return text.replace(/\n/g, '<br>');
    },

    clearChat() {
        const chatContainer = document.getElementById('giri-chat-messages');
        if (chatContainer) {
            chatContainer.innerHTML = '';
        }
    }
};
