import { Router } from 'express';
import { ShowtimeController } from '../controllers/showtime.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createShowtimeSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.get('/', ShowtimeController.getAll);
router.get('/:id', ShowtimeController.getById);
router.get('/:id/seats', optionalAuth, ShowtimeController.getSeats);

// Admin Only
router.post('/', authenticate, authorize([UserRole.ADMIN]), validateBody(createShowtimeSchema), ShowtimeController.create);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), ShowtimeController.delete);

export const showtimeRoutes = router;
