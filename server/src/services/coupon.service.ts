import { CouponModel, ICoupon, DiscountType } from '../models/Coupon.model.js';

export class CouponService {
  static async getAllCoupons(filters?: { isActive?: boolean }): Promise<ICoupon[]> {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return CouponModel.find(query).sort({ createdAt: -1 });
  }

  static async createCoupon(data: Partial<ICoupon>): Promise<ICoupon> {
    const existing = await CouponModel.findOne({ code: data.code?.toUpperCase() });
    if (existing) {
      throw new Error('Mã giảm giá này đã tồn tại.');
    }
    return CouponModel.create({
      ...data,
      code: data.code?.toUpperCase(),
    });
  }

  static async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const coupon = await CouponModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!coupon) {
      throw new Error('Mã giảm giá không tồn tại.');
    }
    return coupon;
  }

  static async deleteCoupon(id: string): Promise<void> {
    const res = await CouponModel.findByIdAndDelete(id);
    if (!res) {
      throw new Error('Mã giảm giá không tồn tại.');
    }
  }

  static async validateAndApply(code: string, orderTotal: number): Promise<{ valid: boolean; discountAmount: number; finalPrice: number; message?: string }> {
    const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, message: 'Mã giảm giá đã hết hạn sử dụng.' };
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, message: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    if (orderTotal < coupon.minOrderValue) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, message: `Đơn hàng tối thiểu phải từ ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng.` };
    }

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalPrice = Math.max(0, orderTotal - discountAmount);
    return {
      valid: true,
      discountAmount,
      finalPrice,
    };
  }
}
