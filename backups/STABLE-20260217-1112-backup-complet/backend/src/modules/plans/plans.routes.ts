import { Router } from 'express';
import { plansController } from './plans.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get current user's plan
router.get('/me', plansController.getMyPlan.bind(plansController));

// Get plan by user ID (admin use)
router.get('/user/:userId', plansController.getUserPlan.bind(plansController));

// Get all tier configurations
router.get('/features', plansController.getFeaturesByTier.bind(plansController));

// Check if current user can use a specific feature
router.get('/check/:feature', plansController.checkFeature.bind(plansController));

export default router;
