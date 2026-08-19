import { Request, Response } from 'express';
import { ShowtimeService } from '../services/showtime.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class ShowtimeController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, movieTmdbId, cinemaId, date } = req.query;
      const showtimes = await ShowtimeService.getShowtimes({
        movieTmdbId: (movieTmdbId as string) || (movieId as string),
        movieId: movieId as string,
        cinemaId: cinemaId as string,
        date: date as string,
      });
      sendSuccess(res, showtimes, 'Lấy danh sách lịch chiếu thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const showtime = await ShowtimeService.getShowtimeById(id);
      sendSuccess(res, showtime, 'Lấy chi tiết suất chiếu thành công');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  static async getSeats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const data = await ShowtimeService.getShowtimeSeatsWithStatus(id, userId);
      sendSuccess(res, data, 'Lấy sơ đồ ghế thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { movieTmdbId, movieId, cinemaId, screenId, startTime, basePrice, format } = req.body;
      const showtime = await ShowtimeService.createShowtime({
        movieTmdbId: Number(movieTmdbId) || 202601,
        movieId,
        cinemaId,
        screenId,
        startTime,
        basePrice,
        format,
      });
      sendSuccess(res, showtime, 'Tạo suất chiếu thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await ShowtimeService.deleteShowtime(id);
      sendSuccess(res, null, 'Hủy suất chiếu thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
