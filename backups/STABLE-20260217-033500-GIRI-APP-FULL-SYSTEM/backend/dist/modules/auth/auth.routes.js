"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../../middleware/rateLimit.middleware.js");
const constants_js_1 = require("../../config/constants.js");
const router = (0, express_1.Router)();
// Rate limiters - production hardened
const passwordResetLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: constants_js_1.RATE_LIMITS.PASSWORD_RESET.windowMs,
    max: constants_js_1.RATE_LIMITS.PASSWORD_RESET.max,
    keyPrefix: 'password-reset',
});
const refreshLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: constants_js_1.RATE_LIMITS.REFRESH.windowMs,
    max: constants_js_1.RATE_LIMITS.REFRESH.max,
    keyPrefix: 'refresh',
});
// Public routes - rate limited
router.post('/register', rateLimit_middleware_js_1.registerRateLimiter, auth_controller_js_1.authController.register.bind(auth_controller_js_1.authController));
router.post('/login', rateLimit_middleware_js_1.loginRateLimiter, auth_controller_js_1.authController.login.bind(auth_controller_js_1.authController));
router.post('/refresh', refreshLimiter, auth_controller_js_1.authController.refresh.bind(auth_controller_js_1.authController));
router.post('/forgot-password', passwordResetLimiter, auth_controller_js_1.authController.forgotPassword.bind(auth_controller_js_1.authController));
router.post('/reset-password', passwordResetLimiter, auth_controller_js_1.authController.resetPassword.bind(auth_controller_js_1.authController));
// Protected routes
router.use(auth_middleware_js_1.authMiddleware);
router.get('/me', auth_controller_js_1.authController.getMe.bind(auth_controller_js_1.authController));
router.post('/logout', auth_controller_js_1.authController.logout.bind(auth_controller_js_1.authController));
router.post('/logout-all', auth_controller_js_1.authController.logoutAll.bind(auth_controller_js_1.authController));
router.put('/password', auth_controller_js_1.authController.updatePassword.bind(auth_controller_js_1.authController));
router.get('/sessions', auth_controller_js_1.authController.getSessions.bind(auth_controller_js_1.authController));
router.delete('/sessions/:sessionId', auth_controller_js_1.authController.deleteSession.bind(auth_controller_js_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map