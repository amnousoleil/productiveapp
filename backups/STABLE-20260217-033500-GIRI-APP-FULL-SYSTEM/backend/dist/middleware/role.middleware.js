"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireGuest = exports.requireMember = exports.requireAdmin = exports.requireOwner = void 0;
exports.hasRole = hasRole;
exports.roleMiddleware = roleMiddleware;
exports.hasPermission = hasPermission;
exports.permissionMiddleware = permissionMiddleware;
exports.requireAny = requireAny;
exports.requireRole = requireRole;
const helpers_js_1 = require("../utils/helpers.js");
const ROLE_HIERARCHY = {
    owner: 4,
    admin: 3,
    member: 2,
    guest: 1,
};
function hasRole(userRole, requiredRole) {
    if (!userRole)
        return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
function roleMiddleware(requiredRole) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw helpers_js_1.AppError.unauthorized();
            }
            if (!req.workspaceMember) {
                throw helpers_js_1.AppError.forbidden('Workspace membership required');
            }
            if (!hasRole(req.workspaceMember.role, requiredRole)) {
                throw helpers_js_1.AppError.forbidden(`Role '${requiredRole}' or higher is required`);
            }
            next();
        }
        catch (error) {
            if (error instanceof helpers_js_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                });
                return;
            }
            next(error);
        }
    };
}
exports.requireOwner = roleMiddleware('owner');
exports.requireAdmin = roleMiddleware('admin');
exports.requireMember = roleMiddleware('member');
exports.requireGuest = roleMiddleware('guest');
function hasPermission(req, permission) {
    if (!req.workspaceMember)
        return false;
    // Owner and admin have all permissions
    if (hasRole(req.workspaceMember.role, 'admin'))
        return true;
    // Check specific permissions
    const permissions = req.workspaceMember.permissions;
    if (!permissions)
        return false;
    return permissions[permission] === true;
}
function permissionMiddleware(permission) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw helpers_js_1.AppError.unauthorized();
            }
            if (!hasPermission(req, permission)) {
                throw helpers_js_1.AppError.forbidden(`Permission '${permission}' is required`);
            }
            next();
        }
        catch (error) {
            if (error instanceof helpers_js_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                });
                return;
            }
            next(error);
        }
    };
}
function requireAny(...roles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw helpers_js_1.AppError.unauthorized();
            }
            if (!req.workspaceMember) {
                throw helpers_js_1.AppError.forbidden('Workspace membership required');
            }
            const userRole = req.workspaceMember.role;
            if (!roles.includes(userRole)) {
                throw helpers_js_1.AppError.forbidden(`One of the following roles is required: ${roles.join(', ')}`);
            }
            next();
        }
        catch (error) {
            if (error instanceof helpers_js_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                });
                return;
            }
            next(error);
        }
    };
}
// Alias for requireAny that takes an array
function requireRole(roles) {
    return requireAny(...roles);
}
//# sourceMappingURL=role.middleware.js.map