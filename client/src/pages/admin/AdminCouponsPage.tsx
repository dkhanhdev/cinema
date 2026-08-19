import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { useToastStore } from '../../stores/useToastStore';
import { formatVND, formatDateVN } from '../../utils/format';
import { Tag, Plus, Trash2, Check, X, Percent, DollarSign, Calendar } from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const toast = useToastStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(100000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(50000);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(100);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res: any = await axiosClient.get('/coupons');
      setCoupons(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/coupons', {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount: discountType === 'PERCENTAGE' ? Number(maxDiscountAmount) : undefined,
        validUntil: new Date(validUntil),
        usageLimit: Number(usageLimit),
      });
      toast.success('Tạo mã giảm giá thành công!');
      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo mã giảm giá');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await axiosClient.delete(`/coupons/${id}`);
      toast.success('Xóa mã giảm giá thành công!');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa mã');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
            <Tag className="w-4 h-4" />
            Marketing & Promotion
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quản Lý Mã Giảm Giá (Coupons)
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-glow-red transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Mới</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 relative overflow-hidden shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-brand-600/20 text-brand-400 border border-brand-500/30 rounded-lg text-sm font-mono font-black tracking-wider">
                  {coupon.code}
                </span>
                <p className="text-xs text-neutral-400 mt-2">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `Giảm ${coupon.discountValue}% (Tối đa ${formatVND(coupon.maxDiscountAmount || 0)})`
                    : `Giảm trực tiếp ${formatVND(coupon.discountValue)}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(coupon._id)}
                className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-neutral-800 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Đơn tối thiểu:</span>
                <span className="font-semibold text-white">{formatVND(coupon.minOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hạn dùng:</span>
                <span className="font-semibold text-white">{formatDateVN(coupon.validUntil)}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã dùng / Giới hạn:</span>
                <span className="font-bold text-amber-400">
                  {coupon.usedCount} / {coupon.usageLimit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" />
                Tạo Mã Giảm Giá Mới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Mã Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VD: CINE50K, TET2026"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Loại giảm giá</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">
                    {discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền (VNĐ)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Đơn tối thiểu</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Giảm tối đa</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Hạn dùng</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Số lượt dùng</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-glow-red"
                >
                  Tạo Mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
