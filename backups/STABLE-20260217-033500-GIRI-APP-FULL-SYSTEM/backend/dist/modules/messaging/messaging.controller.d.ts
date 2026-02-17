import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class MessagingController {
    createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    leaveConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    pinMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    unpinMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getPinnedMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    searchMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const messagingController: MessagingController;
//# sourceMappingURL=messaging.controller.d.ts.map