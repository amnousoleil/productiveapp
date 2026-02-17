"use strict";
/**
 * WEBSOCKET SERVER
 * Real-time notifications & updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSServer = void 0;
exports.initWebSocket = initWebSocket;
exports.getWebSocketServer = getWebSocketServer;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
class WSServer {
    wss;
    clients = new Map();
    constructor(server) {
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws',
        });
        this.setupServer();
        this.startHeartbeat();
    }
    setupServer() {
        this.wss.on('connection', (ws, req) => {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            if (!token) {
                ws.close(4001, 'No token provided');
                return;
            }
            // Vérifier token JWT
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
                ws.userId = decoded.userId;
                ws.isAlive = true;
                // Ajouter à la map des clients
                if (!this.clients.has(ws.userId)) {
                    this.clients.set(ws.userId, new Set());
                }
                this.clients.get(ws.userId).add(ws);
                console.log(`✅ WebSocket connected: ${ws.userId} (total: ${this.wss.clients.size})`);
                // Setup handlers
                ws.on('message', (data) => this.handleMessage(ws, data));
                ws.on('pong', () => { ws.isAlive = true; });
                ws.on('close', () => this.handleClose(ws));
                // Send welcome message
                this.send(ws, { type: 'connected', payload: { userId: ws.userId } });
            }
            catch (error) {
                console.error('WebSocket auth error:', error);
                ws.close(4002, 'Invalid token');
            }
        });
    }
    handleMessage(ws, data) {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 WS message from ${ws.userId}:`, message.type);
            // Echo back for testing
            if (message.type === 'ping') {
                this.send(ws, { type: 'pong', payload: { timestamp: Date.now() } });
            }
        }
        catch (error) {
            console.error('WS message parse error:', error);
        }
    }
    handleClose(ws) {
        if (ws.userId) {
            const userClients = this.clients.get(ws.userId);
            if (userClients) {
                userClients.delete(ws);
                if (userClients.size === 0) {
                    this.clients.delete(ws.userId);
                }
            }
            console.log(`❌ WebSocket disconnected: ${ws.userId} (total: ${this.wss.clients.size})`);
        }
    }
    startHeartbeat() {
        const interval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // 30s heartbeat
        this.wss.on('close', () => clearInterval(interval));
    }
    // Public methods pour envoyer des messages
    send(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    broadcast(message) {
        this.wss.clients.forEach((ws) => this.send(ws, message));
    }
    sendToUser(userId, message) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.forEach((ws) => this.send(ws, message));
        }
    }
    getStats() {
        return {
            totalConnections: this.wss.clients.size,
            uniqueUsers: this.clients.size,
        };
    }
}
exports.WSServer = WSServer;
let wsServer = null;
function initWebSocket(server) {
    if (!wsServer) {
        wsServer = new WSServer(server);
        console.log('🔌 WebSocket server initialized on /ws');
    }
    return wsServer;
}
function getWebSocketServer() {
    return wsServer;
}
//# sourceMappingURL=websocket.server.js.map