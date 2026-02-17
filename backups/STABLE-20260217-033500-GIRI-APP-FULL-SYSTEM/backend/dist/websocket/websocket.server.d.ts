/**
 * WEBSOCKET SERVER
 * Real-time notifications & updates
 */
import { WebSocket } from 'ws';
import type { Server } from 'http';
export declare class WSServer {
    private wss;
    private clients;
    constructor(server: Server);
    private setupServer;
    private handleMessage;
    private handleClose;
    private startHeartbeat;
    send(ws: WebSocket, message: {
        type: string;
        payload: any;
    }): void;
    broadcast(message: {
        type: string;
        payload: any;
    }): void;
    sendToUser(userId: string, message: {
        type: string;
        payload: any;
    }): void;
    getStats(): {
        totalConnections: number;
        uniqueUsers: number;
    };
}
export declare function initWebSocket(server: Server): WSServer;
export declare function getWebSocketServer(): WSServer | null;
//# sourceMappingURL=websocket.server.d.ts.map