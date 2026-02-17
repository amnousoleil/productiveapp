import { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare function getConfig(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateConfig(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function uploadLogo(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteLogo(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=config.controller.d.ts.map