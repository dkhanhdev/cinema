import { Response } from 'express';
import { CheckinService } from '../services/checkin.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class CheckinController {
  static async verifyTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      if (!code) {
        sendError(res, 'Vui lòng cung cấp mã vé hoặc quét QR.', 400);
        return;
      }

      const result = await CheckinService.verifyTicket(code);
      sendSuccess(res, result, result.message);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async confirmCheckIn(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.body;
      const staffUserId = req.user?.userId || '';

      if (!bookingId) {
        sendError(res, 'Thiếu thông tin bookingId.', 400);
        return;
      }

      const booking = await CheckinService.confirmCheckIn(bookingId, staffUserId);
      sendSuccess(res, booking, 'Xác nhận Check-in thành công!');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
