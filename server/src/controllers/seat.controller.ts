import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { seatLockService } from '../services/seatLock.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class SeatController {
  static async holdSeat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { showtimeId, seatId } = req.body;
      const userId = req.user?.userId || `guest_${Date.now()}`;
      const userName = req.user?.fullName || 'Khách';

      const result = await seatLockService.holdSeat(showtimeId, seatId, userId, userName);
      if (!result.success) {
        sendError(res, result.message || 'Không thể giữ ghế', 400);
        return;
      }
      sendSuccess(res, { seatId, expiresAt: result.expiresAt }, 'Giữ ghế thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async releaseSeat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { showtimeId, seatId } = req.body;
      const userId = req.user?.userId || '';
      const released = seatLockService.releaseSeat(showtimeId, seatId, userId);
      sendSuccess(res, { released }, 'Nhả ghế thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
