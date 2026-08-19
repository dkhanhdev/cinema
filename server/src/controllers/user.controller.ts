import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { role, search, page, limit } = req.query;
      const result = await UserService.getAllUsers({
        role: role as any,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      sendSuccess(res, result.users, 'Lấy danh sách người dùng thành công', 200, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await UserService.getUserById(id);
      sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await UserService.updateUserRole(id, req.body);
      sendSuccess(res, user, 'Cập nhật quyền người dùng thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await UserService.deleteUser(id);
      sendSuccess(res, null, 'Xóa người dùng thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
