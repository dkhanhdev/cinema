import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { movieRoutes } from './movie.routes.js';
import { cinemaRoutes } from './cinema.routes.js';
import { showtimeRoutes } from './showtime.routes.js';
import { seatRoutes } from './seat.routes.js';
import { bookingRoutes } from './booking.routes.js';
import { couponRoutes } from './coupon.routes.js';
import { reviewRoutes } from './review.routes.js';
import { checkinRoutes } from './checkin.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { TmdbService } from '../services/tmdb.service.js';

const router = Router();

// Dedicated TMDB Direct Debug Endpoints
router.get('/debug/tmdb-now-playing', async (req: Request, res: Response) => {
  try {
    const result = await TmdbService.getNowPlaying(1);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(502).json({
      success: false,
      source: 'TMDB_DIRECT',
      error: error.message || 'TMDB request failed',
    });
  }
});

router.get('/debug/tmdb-movie/:tmdbId', async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId as string, 10);
    const movie = await TmdbService.getMovieDetail(tmdbId);
    res.status(200).json({
      tmdbId: movie.tmdbId,
      title: movie.title,
      release_date: movie.releaseDate,
      poster_path: movie.posterPath,
      backdrop_path: movie.backdropPath,
      detail: movie,
    });
  } catch (error: any) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.get('/debug/tmdb-movie/:tmdbId/videos', async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId as string, 10);
    const videos = await TmdbService.getMovieVideos(tmdbId);
    res.status(200).json(videos);
  } catch (error: any) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/cinemas', cinemaRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/seats', seatRoutes);
router.use('/bookings', bookingRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/checkin', checkinRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
