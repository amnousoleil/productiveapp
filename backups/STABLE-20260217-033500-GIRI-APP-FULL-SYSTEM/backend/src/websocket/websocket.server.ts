/**
 * WEBSOCKET SERVER
 * Real-time notifications & updates
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WSServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
    });

    this.setupServer();
    this.startHeartbeat();
  }

  private setupServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'No token provided');
        return;
      }

      // Vérifier token JWT
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        ws.userId = decoded.userId;
        ws.isAlive = true;

        // Ajouter à la map des clients
        if (!this.clients.has(ws.userId)) {
          this.clients.set(ws.userId, new Set());
        }
        this.clients.get(ws.userId)!.add(ws);

        console.log(`✅ WebSocket connected: ${ws.userId} (total: ${this.wss.clients.size})`);

        // Setup handlers
        ws.on('message', (data) => this.handleMessage(ws, data));
        ws.on('pong', () => { ws.isAlive = true; });
        ws.on('close', () => this.handleClose(ws));

        // Send welcome message
        this.send(ws, { type: 'connected', payload: { userId: ws.userId } });

      } catch (error) {
        console.error('WebSocket auth error:', error);
        ws.close(4002, 'Invalid token');
      }
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 WS message from ${ws.userId}:`, message.type);

      // Echo back for testing
      if (message.type === 'ping') {
        this.send(ws, { type: 'pong', payload: { timestamp: Date.now() } });
      }
    } catch (error) {
      console.error('WS message parse error:', error);
    }
  }

  private handleClose(ws: AuthenticatedWebSocket) {
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

  private startHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
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

  public send(ws: WebSocket, message: { type: string; payload: any }) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public broadcast(message: { type: string; payload: any }) {
    this.wss.clients.forEach((ws) => this.send(ws, message));
  }

  public sendToUser(userId: string, message: { type: string; payload: any }) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((ws) => this.send(ws, message));
    }
  }

  public getStats() {
    return {
      totalConnections: this.wss.clients.size,
      uniqueUsers: this.clients.size,
    };
  }
}

let wsServer: WSServer | null = null;

export function initWebSocket(server: Server): WSServer {
  if (!wsServer) {
    wsServer = new WSServer(server);
    console.log('🔌 WebSocket server initialized on /ws');
  }
  return wsServer;
}

export function getWebSocketServer(): WSServer | null {
  return wsServer;
}
