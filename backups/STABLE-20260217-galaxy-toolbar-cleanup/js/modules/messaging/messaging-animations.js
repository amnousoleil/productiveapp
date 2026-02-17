/**
 * Messaging Animations Module - TeamTalk Pro
 * Handles all convivial animations for TeamTalk
 */

const MessagingAnimations = (function() {
    'use strict';

    /**
     * Animate new message entry
     */
    function animateNewMessage(messageElement) {
        if (!messageElement) return;

        // Add bounce animation
        messageElement.classList.add('msg-anim-new-message');

        // Remove class after animation
        setTimeout(() => {
            messageElement.classList.remove('msg-anim-new-message');
        }, 600);
    }

    /**
     * Animate message send (whoosh effect)
     */
    function animateSendMessage(inputElement) {
        if (!inputElement) return;

        // Add whoosh animation to input
        inputElement.classList.add('msg-anim-send-whoosh');

        setTimeout(() => {
            inputElement.classList.remove('msg-anim-send-whoosh');
        }, 400);

        // Show send success indicator
        showSendSuccess();
    }

    /**
     * Show send success indicator
     */
    function showSendSuccess() {
        const indicator = document.createElement('div');
        indicator.className = 'msg-anim-send-success';
        indicator.innerHTML = '✓';

        const inputArea = document.querySelector('.msg-input-area');
        if (!inputArea) return;

        inputArea.appendChild(indicator);

        setTimeout(() => {
            indicator.classList.add('msg-anim-send-success-fade');
            setTimeout(() => indicator.remove(), 300);
        }, 500);
    }

    /**
     * Pulse animation on avatar (user comes online)
     */
    function pulseAvatar(userId) {
        const avatars = document.querySelectorAll(`[data-user-id="${userId}"]`);

        avatars.forEach(avatar => {
            avatar.classList.add('msg-anim-avatar-pulse');

            setTimeout(() => {
                avatar.classList.remove('msg-anim-avatar-pulse');
            }, 1000);
        });
    }

    /**
     * Confetti animation (when message contains 🎉)
     */
    function triggerConfetti(messageElement) {
        if (!messageElement) return;

        const rect = messageElement.getBoundingClientRect();

        // Create confetti container
        const container = document.createElement('div');
        container.className = 'msg-anim-confetti-container';
        container.style.top = rect.top + 'px';
        container.style.left = rect.left + 'px';
        container.style.width = rect.width + 'px';
        container.style.height = rect.height + 'px';

        document.body.appendChild(container);

        // Generate 20 confetti pieces
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];

        for (let i = 0; i < 20; i++) {
            const piece = document.createElement('div');
            piece.className = 'msg-anim-confetti-piece';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.animationDelay = (Math.random() * 0.3) + 's';
            piece.style.animationDuration = (0.8 + Math.random() * 0.4) + 's';

            container.appendChild(piece);
        }

        // Remove after animation
        setTimeout(() => {
            container.remove();
        }, 1500);
    }

    /**
     * Heart burst animation (for reactions)
     */
    function heartBurst(element) {
        if (!element) return;

        const rect = element.getBoundingClientRect();

        // Create burst container
        const container = document.createElement('div');
        container.className = 'msg-anim-heart-burst';
        container.style.top = (rect.top + rect.height / 2) + 'px';
        container.style.left = (rect.left + rect.width / 2) + 'px';

        document.body.appendChild(container);

        // Generate hearts
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.className = 'msg-anim-heart';
            heart.innerHTML = '❤️';
            heart.style.setProperty('--angle', (i * 45) + 'deg');

            container.appendChild(heart);
        }

        // Remove after animation
        setTimeout(() => {
            container.remove();
        }, 1000);
    }

    /**
     * Smooth scroll to bottom of chat
     */
    function smoothScrollToBottom() {
        const messagesContainer = document.querySelector('.msg-messages');
        if (!messagesContainer) return;

        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    /**
     * Flash animation for notification
     */
    function flashNotification(conversationId) {
        const convItem = document.querySelector(`.msg-conv-item[data-id="${conversationId}"]`);
        if (!convItem) return;

        convItem.classList.add('msg-anim-flash');

        setTimeout(() => {
            convItem.classList.remove('msg-anim-flash');
        }, 600);
    }

    /**
     * Ripple effect on button click
     */
    function rippleEffect(button, event) {
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'msg-anim-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Shake animation (error feedback)
     */
    function shakeElement(element) {
        if (!element) return;

        element.classList.add('msg-anim-shake');

        setTimeout(() => {
            element.classList.remove('msg-anim-shake');
        }, 500);
    }

    /**
     * Fade in element
     */
    function fadeIn(element, duration = 300) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.display = 'block';

        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Fade out element
     */
    function fadeOut(element, duration = 300, callback) {
        if (!element) return;

        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.style.display = 'none';
            if (callback) callback();
        }, duration);
    }

    /**
     * Typing indicator animation (3 bouncing dots)
     */
    function startTypingAnimation() {
        // Animation is handled by CSS
        // This function exists for consistency
    }

    /**
     * Check message content for special animations
     */
    function checkForSpecialAnimations(content, messageElement) {
        // Check for party emoji 🎉
        if (content && (content.includes('🎉') || content.includes('🎊'))) {
            setTimeout(() => {
                triggerConfetti(messageElement);
            }, 300);
        }

        // Check for heart emoji ❤️
        if (content && (content.includes('❤️') || content.includes('💕') || content.includes('💖'))) {
            messageElement.classList.add('msg-anim-heart-glow');
        }

        // Check for fire emoji 🔥
        if (content && content.includes('🔥')) {
            messageElement.classList.add('msg-anim-fire-glow');
        }
    }

    /**
     * Auto-scroll when new message arrives
     */
    function autoScrollOnNewMessage(messageElement) {
        if (!messageElement) return;

        const messagesContainer = document.querySelector('.msg-messages');
        if (!messagesContainer) return;

        // Check if user is near bottom (within 100px)
        const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;

        if (isNearBottom) {
            smoothScrollToBottom();
        } else {
            // Show "new messages" indicator
            showNewMessagesIndicator();
        }
    }

    /**
     * Show "new messages" indicator
     */
    function showNewMessagesIndicator() {
        // Check if already exists
        if (document.getElementById('msg-new-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'msg-new-indicator';
        indicator.className = 'msg-new-indicator';
        indicator.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            Nouveaux messages
        `;

        indicator.addEventListener('click', () => {
            smoothScrollToBottom();
            indicator.remove();
        });

        const chatEl = document.getElementById('msg-chat');
        if (chatEl) {
            chatEl.appendChild(indicator);
        }
    }

    /**
     * Initialize animations system
     */
    function init() {
        // Add ripple effect to all buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.msg-new-btn, .msg-send-btn, .msg-chat-action');
            if (button) {
                rippleEffect(button, e);
            }
        });

        console.log('✅ Animations system initialized');
    }

    return {
        init,
        animateNewMessage,
        animateSendMessage,
        pulseAvatar,
        triggerConfetti,
        heartBurst,
        smoothScrollToBottom,
        flashNotification,
        rippleEffect,
        shakeElement,
        fadeIn,
        fadeOut,
        checkForSpecialAnimations,
        autoScrollOnNewMessage,
        showNewMessagesIndicator
    };
})();

if (typeof window !== 'undefined') {
    window.MessagingAnimations = MessagingAnimations;
}
