"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const tasks_service_js_1 = require("../tasks/tasks.service.js");
const onboarding_service_js_1 = require("../onboarding/onboarding.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
class AuthController {
    async register(req, res, next) {
        try {
            const input = validation_js_1.registerSchema.parse(req.body);
            const ip = req.ip;
            const userAgent = req.headers['user-agent'];
            const result = await auth_service_js_1.authService.register(input, ip, userAgent);
            // Setup onboarding data for the new user
            await onboarding_service_js_1.onboardingService.setupNewUserWorkspace(result.user.id, result.user.name, result.user.email);
            res.status(201).json((0, helpers_js_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const input = validation_js_1.loginSchema.parse(req.body);
            const ip = req.ip;
            const userAgent = req.headers['user-agent'];
            const result = await auth_service_js_1.authService.login(input, ip, userAgent);
            res.json((0, helpers_js_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.user.id;
            const sessionId = req.session.id;
            const token = req.headers.authorization.substring(7);
            // Reset all in_progress tasks to todo before logout
            // This provides implicit time tracking - no in_progress tasks = employee not active
            const resetCount = await tasks_service_js_1.tasksService.resetUserTasksOnLogout(userId);
            await auth_service_js_1.authService.logout(userId, sessionId, token);
            res.json((0, helpers_js_1.successResponse)({
                message: 'Logged out successfully',
                tasks_reset: resetCount
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAll(req, res, next) {
        try {
            const userId = req.user.id;
            await auth_service_js_1.authService.logoutAll(userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Logged out from all devices' }));
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = validation_js_1.refreshTokenSchema.parse(req.body);
            const ip = req.ip;
            const userAgent = req.headers['user-agent'];
            const tokens = await auth_service_js_1.authService.refresh(refreshToken, ip, userAgent);
            res.json((0, helpers_js_1.successResponse)({ tokens }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await auth_service_js_1.authService.getMe(userId);
            res.json((0, helpers_js_1.successResponse)({ user }));
        }
        catch (error) {
            next(error);
        }
    }
    async updatePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const input = validation_js_1.updatePasswordSchema.parse(req.body);
            await auth_service_js_1.authService.updatePassword(userId, {
                currentPassword: input.currentPassword,
                newPassword: input.newPassword,
            });
            res.json((0, helpers_js_1.successResponse)({ message: 'Password updated successfully' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getSessions(req, res, next) {
        try {
            const userId = req.user.id;
            const currentSessionId = req.session.id;
            const sessions = await auth_service_js_1.authService.getSessions(userId, currentSessionId);
            res.json((0, helpers_js_1.successResponse)({ sessions }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSession(req, res, next) {
        try {
            const userId = req.user.id;
            const sessionId = req.params.sessionId;
            await auth_service_js_1.authService.deleteSession(userId, sessionId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Session deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = validation_js_1.forgotPasswordSchema.parse(req.body);
            await auth_service_js_1.authService.forgotPassword(email);
            res.json((0, helpers_js_1.successResponse)({
                message: 'If the email exists, a password reset link has been sent',
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const input = validation_js_1.resetPasswordSchema.parse(req.body);
            await auth_service_js_1.authService.resetPassword(input.token, input.password);
            res.json((0, helpers_js_1.successResponse)({ message: 'Password reset successfully' }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map