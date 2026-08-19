import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createMovieSchema, updateMovieSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

// TMDB Dynamic Discovery Endpoints (Registered before /:id)
router.get('/now-playing', MovieController.getNowPlaying);
router.get('/upcoming', MovieController.getUpcoming);
router.get('/popular', MovieController.getPopular);
router.get('/search', MovieController.search);
router.get('/tmdb/:tmdbId', MovieController.getTmdbDetail);
router.get('/tmdb/:tmdbId/videos', MovieController.getTmdbVideos);
router.get('/tmdb/:tmdbId/credits', MovieController.getTmdbCredits);
router.post('/sync-tmdb', authenticate, authorize([UserRole.ADMIN]), MovieController.syncTmdb);

// Movies Management
router.get('/', MovieController.getAll);
router.get('/:id', MovieController.getById);

// Admin Only
router.post('/', authenticate, authorize([UserRole.ADMIN]), validateBody(createMovieSchema), MovieController.create);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), validateBody(updateMovieSchema), MovieController.update);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), MovieController.delete);

export const movieRoutes = router;
