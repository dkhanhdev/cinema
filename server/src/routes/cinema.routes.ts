import { Router } from 'express';
import { CinemaController } from '../controllers/cinema.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createCinemaSchema, updateCinemaSchema, createScreenSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.get('/', CinemaController.getAll);
router.get('/:id', CinemaController.getById);
router.get('/:id/screens', CinemaController.getScreens);

// Admin Only
router.post('/', authenticate, authorize([UserRole.ADMIN]), validateBody(createCinemaSchema), CinemaController.create);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), validateBody(updateCinemaSchema), CinemaController.update);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), CinemaController.delete);
router.post('/:id/screens', authenticate, authorize([UserRole.ADMIN]), validateBody(createScreenSchema), CinemaController.createScreen);

export const cinemaRoutes = router;
