import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, phone } = req.body;
      if (!email || !password || !fullName) {
        sendError(res, 'Vui lòng cung cấp email, mật khẩu và họ tên.', 400);
        return;
      }
      const result = await AuthService.register({ email, password, fullName, phone });
      sendSuccess(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        sendError(res, 'Vui lòng nhập email và mật khẩu.', 400);
        return;
      }
      const result = await AuthService.login({ email, password });
      sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, 'Vui lòng cung cấp refreshToken.', 400);
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken);
      sendSuccess(res, tokens, 'Làm mới token thành công');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa đăng nhập.', 401);
        return;
      }
      const user = await AuthService.getProfile(req.user.userId);
      sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa đăng nhập.', 401);
        return;
      }
      const user = await AuthService.updateProfile(req.user.userId, req.body);
      sendSuccess(res, user, 'Cập nhật thông tin thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
