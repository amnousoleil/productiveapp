"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = void 0;
const ADMIN_EMAIL = 'contact@mahagiri.fr';
/**
 * Middleware to check if the authenticated user is the super-admin
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.email !== ADMIN_EMAIL) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=admin.middleware.js.map