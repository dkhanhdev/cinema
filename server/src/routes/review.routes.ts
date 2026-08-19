import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createReviewSchema } from '../validators/index.js';

const router = Router();

router.get('/movie/:movieId', ReviewController.getByMovie);
router.post('/', authenticate, validateBody(createReviewSchema), ReviewController.create);
router.delete('/:id', authenticate, ReviewController.delete);

export const reviewRoutes = router;
