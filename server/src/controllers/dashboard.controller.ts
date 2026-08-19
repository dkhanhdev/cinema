import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class DashboardController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await DashboardService.getSummary();
      sendSuccess(res, summary, 'Lấy dữ liệu thống kê tổng quan thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }
}
