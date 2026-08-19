import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class BookingController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Vui lòng đăng nhập để đặt vé.', 401);
        return;
      }

      const { showtimeId, seatIds, paymentMethod } = req.body;
      const booking = await BookingService.createBooking({
        userId: req.user.userId,
        showtimeId,
        seatIds,
        paymentMethod,
      });

      sendSuccess(res, booking, 'Đặt vé thành công!', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async getMyBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Vui lòng đăng nhập.', 401);
        return;
      }
      const bookings = await BookingService.getMyBookings(req.user.userId);
      sendSuccess(res, bookings, 'Lấy lịch sử đặt vé thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bookingId = req.params.id as string;
      const booking = await BookingService.getBookingById(bookingId);
      sendSuccess(res, booking, 'Lấy chi tiết vé thành công');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, page, limit } = req.query;
      const result = await BookingService.getAllBookings({
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      sendSuccess(res, result.bookings, 'Lấy danh sách đặt vé thành công', 200, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  }
}
