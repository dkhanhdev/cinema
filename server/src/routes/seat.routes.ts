import { Router } from 'express';
import { SeatController } from '../controllers/seat.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { holdSeatSchema, releaseSeatSchema } from '../validators/index.js';

const router = Router();

router.post('/hold', optionalAuth, validateBody(holdSeatSchema), SeatController.holdSeat);
router.post('/release', optionalAuth, validateBody(releaseSeatSchema), SeatController.releaseSeat);

export const seatRoutes = router;
