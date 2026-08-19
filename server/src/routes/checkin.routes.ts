import { Router } from 'express';
import { CheckinController } from '../controllers/checkin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { verifyCheckinSchema, confirmCheckinSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.post(
  '/verify',
  authenticate,
  authorize([UserRole.STAFF, UserRole.ADMIN]),
  validateBody(verifyCheckinSchema),
  CheckinController.verifyTicket
);

router.post(
  '/confirm',
  authenticate,
  authorize([UserRole.STAFF, UserRole.ADMIN]),
  validateBody(confirmCheckinSchema),
  CheckinController.confirmCheckIn
);

export const checkinRoutes = router;
