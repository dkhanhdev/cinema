import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class CouponController {
  // Admin: Get all coupons
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await CouponService.getAllCoupons();
      sendSuccess(res, coupons, 'Lấy danh sách mã giảm giá thành công');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  // Admin: Create coupon
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      sendSuccess(res, coupon, 'Tạo mã giảm giá thành công', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // Admin: Update coupon
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const coupon = await CouponService.updateCoupon(id, req.body);
      sendSuccess(res, coupon, 'Cập nhật mã giảm giá thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // Admin: Delete coupon
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await CouponService.deleteCoupon(id);
      sendSuccess(res, null, 'Xóa mã giảm giá thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // Public/User: Validate coupon for checkout
  static async validate(req: Request, res: Response): Promise<void> {
    try {
      const { code, amount } = req.body;
      if (!code) {
        sendError(res, 'Vui lòng nhập mã giảm giá', 400);
        return;
      }
      const result = await CouponService.validateAndApply(code, amount || 0);
      if (!result.valid) {
        sendError(res, result.message || 'Mã không hợp lệ', 400);
        return;
      }
      sendSuccess(res, result, 'Áp dụng mã giảm giá thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
