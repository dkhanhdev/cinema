import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createBookingSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.post('/', authenticate, validateBody(createBookingSchema), BookingController.create);
router.get('/my', authenticate, BookingController.getMyBookings);
router.get('/all', authenticate, authorize([UserRole.ADMIN, UserRole.STAFF]), BookingController.getAll);
router.get('/:id', authenticate, BookingController.getById);

export const bookingRoutes = router;
