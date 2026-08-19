import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.get('/summary', authenticate, authorize([UserRole.ADMIN]), DashboardController.getSummary);

export const dashboardRoutes = router;
