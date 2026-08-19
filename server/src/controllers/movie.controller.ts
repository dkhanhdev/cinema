import { Request, Response } from 'express';
import { TmdbService } from '../services/tmdb.service.js';
import { MovieModel } from '../models/Movie.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class MovieController {
  /**
   * 1. GET /api/movies/now-playing (100% TMDB DIRECT)
   */
  static async getNowPlaying(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await TmdbService.getNowPlaying(page);

      res.status(200).json({
        success: true,
        source: result.source,
        todayVN: result.todayVN,
        region: result.region,
        language: result.language,
        count: result.count,
        movies: result.movies,
        data: result.movies,
      });
    } catch (error: any) {
      console.error(`[MovieController] getNowPlaying Error:`, error.message);
      res.status(502).json({
        success: false,
        source: 'TMDB',
        error: error.message || 'TMDB API unavailable',
      });
    }
  }

  /**
   * 2. GET /api/movies/upcoming (100% TMDB DIRECT)
   */
  static async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await TmdbService.getUpcoming(page);

      res.status(200).json({
        success: true,
        source: result.source,
        todayVN: result.todayVN,
        region: result.region,
        language: result.language,
        count: result.count,
        movies: result.movies,
        data: result.movies,
      });
    } catch (error: any) {
      console.error(`[MovieController] getUpcoming Error:`, error.message);
      res.status(502).json({
        success: false,
        source: 'TMDB',
        error: error.message || 'TMDB API unavailable',
      });
    }
  }

  /**
   * 3. GET /api/movies/popular
   */
  static async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await TmdbService.getNowPlaying(page);
      sendSuccess(res, result.movies, 'Lấy danh sách phim phổ biến thành công');
    } catch (error: any) {
      sendError(res, error.message, 502);
    }
  }

  /**
   * 4. GET /api/movies/tmdb/:tmdbId (Direct TMDB Details)
   */
  static async getTmdbDetail(req: Request, res: Response): Promise<void> {
    try {
      const tmdbId = parseInt(req.params.tmdbId as string, 10);
      if (isNaN(tmdbId)) {
        sendError(res, 'TMDB ID không hợp lệ', 400);
        return;
      }

      const movie = await TmdbService.getMovieDetail(tmdbId);
      console.log(`[MovieDetail] TMDB ID: ${tmdbId} | Title: "${movie.title}"`);
      sendSuccess(res, movie, 'Lấy chi tiết phim TMDB thành công');
    } catch (error: any) {
      console.error(`[MovieController] getTmdbDetail Error:`, error.message);
      sendError(res, error.message, 502);
    }
  }

  /**
   * 5. GET /api/movies/tmdb/:tmdbId/videos (Direct TMDB Trailers)
   */
  static async getTmdbVideos(req: Request, res: Response): Promise<void> {
    try {
      const tmdbId = parseInt(req.params.tmdbId as string, 10);
      if (isNaN(tmdbId)) {
        sendError(res, 'TMDB ID không hợp lệ', 400);
        return;
      }

      const videos = await TmdbService.getMovieVideos(tmdbId);
      sendSuccess(res, videos, 'Lấy danh sách video TMDB thành công');
    } catch (error: any) {
      sendError(res, error.message, 502);
    }
  }

  /**
   * 6. GET /api/movies/tmdb/:tmdbId/credits (Direct TMDB Credits)
   */
  static async getTmdbCredits(req: Request, res: Response): Promise<void> {
    try {
      const tmdbId = parseInt(req.params.tmdbId as string, 10);
      if (isNaN(tmdbId)) {
        sendError(res, 'TMDB ID không hợp lệ', 400);
        return;
      }

      const credits = await TmdbService.getMovieCredits(tmdbId);
      sendSuccess(res, credits, 'Lấy thông tin diễn viên TMDB thành công');
    } catch (error: any) {
      sendError(res, error.message, 502);
    }
  }

  /**
   * 7. GET /api/movies/:id (Generic detail mapping for TMDB ID or MongoDB ID)
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const tmdbId = parseInt(id, 10);

      if (!isNaN(tmdbId)) {
        const movie = await TmdbService.getMovieDetail(tmdbId);
        sendSuccess(res, movie, 'Lấy chi tiết phim thành công');
        return;
      }

      // If MongoDB ObjectId
      const dbMovie = await MovieModel.findById(id);
      if (dbMovie) {
        sendSuccess(res, dbMovie, 'Lấy chi tiết phim thành công');
        return;
      }

      sendError(res, 'Không tìm thấy bộ phim', 404);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  /**
   * 8. GET /api/movies/search
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || (req.query.query as string) || '';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      if (!query) {
        const result = await TmdbService.getNowPlaying(page);
        sendSuccess(res, result.movies, 'Danh sách phim đang chiếu');
        return;
      }

      const results = await TmdbService.searchMovies(query, page);
      sendSuccess(res, results, 'Tìm kiếm phim TMDB thành công');
    } catch (error: any) {
      sendError(res, error.message, 502);
    }
  }

  /**
   * 9. GET /api/movies (All movies in MongoDB for Admin)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const skip = (page - 1) * limit;

      const [movies, total] = await Promise.all([
        MovieModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        MovieModel.countDocuments(),
      ]);

      sendSuccess(res, movies, 'Danh sách phim trong hệ thống', 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const movie = await MovieModel.create({ ...req.body, lastSyncedAt: new Date() });
      sendSuccess(res, movie, 'Tạo phim mới thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const movie = await MovieModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      sendSuccess(res, movie, 'Cập nhật phim thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await MovieModel.findByIdAndDelete(req.params.id);
      sendSuccess(res, null, 'Xóa phim thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async syncTmdb(req: Request, res: Response): Promise<void> {
    try {
      TmdbService.clearCache();
      const result = await TmdbService.getNowPlaying(1);
      sendSuccess(
        res,
        {
          syncedCount: result.count,
          lastSyncTime: new Date().toISOString(),
        },
        'Xóa cache và làm mới dữ liệu TMDB thành công!'
      );
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
