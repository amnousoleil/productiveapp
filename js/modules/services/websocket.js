/**
 * WebSocket Service - Real-time notifications
 * ProductiveApp v4.0
 */

const WebSocketService = (function() {
    'use strict';

    let socket = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT = 5;
    const RECONNECT_DELAY = 3000;
    const listeners = new Map();

    function connect() {
        if (socket && socket.readyState === WebSocket.OPEN) return;

        // FIX: Use ApiTokens to get the correct token key
        const token = (typeof ApiTokens !== 'undefined' && ApiTokens.getAccessToken)
            ? ApiTokens.getAccessToken()
            : localStorage.getItem('accessToken');

        if (!token) {
            console.warn('🔌 WS: No token found');
            return;
        }

        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${location.host}/ws?token=${token}`;

        try {
            socket = new WebSocket(wsUrl);
            setupHandlers();
        } catch (e) {
            scheduleReconnect();
        }
    }

    function setupHandlers() {
        socket.onopen = () => {
            console.log('🔌 WS: Connected');
            reconnectAttempts = 0;
            emit('connected');
        };

        socket.onmessage = (e) => {
            try {
                const { type, payload } = JSON.parse(e.data);
                handleMessage(type, payload);
            } catch (err) {}
        };

        socket.onclose = (e) => {
            emit('disconnected');
            if (e.code !== 1000) scheduleReconnect();
        };

        socket.onerror = () => emit('error');
    }

    function handleMessage(type, payload) {
        switch (type) {
            case 'notification':
                showNotification(payload);
                break;
            case 'xp_gained':
                showXPToast(payload);
                break;
            case 'achievement':
                showAchievementToast(payload);
                break;
        }
        emit(type, payload);
    }

    function showNotification(p) {
        if (Notification.permission === 'granted') {
            new Notification(p.title || 'ProductiveApp', {
                body: p.body,
                icon: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png'
            });
        }
    }

    function showXPToast(p) {
        const t = document.createElement('div');
        t.className = 'xp-toast';
        t.innerHTML = `<span>⚡</span> +${p.amount} XP`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    function showAchievementToast(p) {
        const t = document.createElement('div');
        t.className = 'achievement-toast';
        t.innerHTML = `<span>🏆</span><div><strong>${p.title}</strong><small>${p.description}</small></div>`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 5000);
    }

    function scheduleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT) return;
        reconnectAttempts++;
        setTimeout(() => document.visibilityState !== 'hidden' && connect(), RECONNECT_DELAY * reconnectAttempts);
    }

    function send(type, payload) {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, payload }));
            return true;
        }
        return false;
    }

    function on(event, cb) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(cb);
        return () => listeners.get(event)?.delete(cb);
    }

    function emit(event, data) {
        listeners.get(event)?.forEach(cb => cb(data));
    }

    function disconnect() {
        socket?.close(1000);
        socket = null;
    }

    async function requestPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        return (await Notification.requestPermission()) === 'granted';
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !socket?.readyState) connect();
    });

    return { connect, disconnect, send, on, requestPermission };
})();

if (typeof window !== 'undefined') window.WebSocketService = WebSocketService;
