import { Request, Response } from 'express';
import { CinemaService } from '../services/cinema.service.js';
import { ScreenService } from '../services/screen.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class CinemaController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const city = req.query.city as string;
      const cinemas = await CinemaService.getAllCinemas(city);
      sendSuccess(res, cinemas, 'Lấy danh sách rạp thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const cinema = await CinemaService.getCinemaById(id);
      sendSuccess(res, cinema, 'Lấy chi tiết rạp thành công');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const cinema = await CinemaService.createCinema(req.body);
      sendSuccess(res, cinema, 'Tạo rạp mới thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const cinema = await CinemaService.updateCinema(id, req.body);
      sendSuccess(res, cinema, 'Cập nhật rạp thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await CinemaService.deleteCinema(id);
      sendSuccess(res, null, 'Xóa rạp thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async getScreens(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const screens = await ScreenService.getScreensByCinema(id);
      sendSuccess(res, screens, 'Lấy danh sách phòng chiếu thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async createScreen(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, screenType, totalRows, totalCols } = req.body;
      const result = await ScreenService.createScreenWithSeats({
        cinemaId: id,
        name,
        screenType,
        totalRows,
        totalCols,
      });
      sendSuccess(res, result, 'Tạo phòng chiếu và sơ đồ ghế thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
