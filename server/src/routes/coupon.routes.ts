import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { UserRole } from '../constants/index.js';

const router = Router();

// Public: Validate coupon
router.post('/validate', CouponController.validate);

// Admin Only (RBAC Enforcement)
router.get('/', authenticate, authorize([UserRole.ADMIN]), CouponController.getAll);
router.post('/', authenticate, authorize([UserRole.ADMIN]), CouponController.create);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), CouponController.update);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), CouponController.delete);

export const couponRoutes = router;
