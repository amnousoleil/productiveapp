import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { loginRateLimiter, registerRateLimiter, createRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { RATE_LIMITS } from '../../config/constants.js';

const router = Router();

// Rate limiters - production hardened
const passwordResetLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.PASSWORD_RESET.windowMs,
  max: RATE_LIMITS.PASSWORD_RESET.max,
  keyPrefix: 'password-reset',
});

const refreshLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.REFRESH.windowMs,
  max: RATE_LIMITS.REFRESH.max,
  keyPrefix: 'refresh',
});

// Public routes - rate limited
router.post('/register', registerRateLimiter, authController.register.bind(authController));
router.post('/login', loginRateLimiter, authController.login.bind(authController));
router.post('/refresh', refreshLimiter, authController.refresh.bind(authController));
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', passwordResetLimiter, authController.resetPassword.bind(authController));

// Protected routes
router.use(authMiddleware);
router.get('/me', authController.getMe.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/logout-all', authController.logoutAll.bind(authController));
router.put('/password', authController.updatePassword.bind(authController));
router.get('/sessions', authController.getSessions.bind(authController));
router.delete('/sessions/:sessionId', authController.deleteSession.bind(authController));

export default router;
