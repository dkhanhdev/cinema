import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBookingStore } from '../../stores/useBookingStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { bookingApi } from '../../api';
import { PaymentMethod } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { ShieldCheck, CreditCard, Wallet, QrCode, Lock, CheckCircle2, ChevronLeft } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { selectedShowtime, selectedSeats, getTotalPrice, resetBooking } = useBookingStore();
  const { user } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedShowtime || selectedSeats.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-white mb-2">Chưa có vé nào được chọn</h2>
        <p className="text-sm text-neutral-400 mb-4">Vui lòng chọn suất chiếu và ghế ngồi trước khi thanh toán.</p>
        <Link to="/" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold">
          Quay lại chọn vé
        </Link>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res: any = await bookingApi.create({
        showtimeId: selectedShowtime._id,
        seatIds: selectedSeats.map((s) => s._id),
        paymentMethod,
      });

      toast.success('Thanh toán thành công! Vé điện tử đã được khởi tạo.');
      resetBooking();
      navigate(`/booking/success/${res.data._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Thanh toán không thành công');
      setIsProcessing(false);
    }
  };

  const paymentOptions = [
    {
      id: PaymentMethod.VNPAY,
      name: 'VNPAY-QR',
      desc: 'Quét mã QR qua ứng dụng ngân hàng hoặc ví VNPAY',
      icon: <QrCode className="w-6 h-6 text-blue-400" />,
      tag: 'Phổ biến nhất',
    },
    {
      id: PaymentMethod.MOMO,
      name: 'Ví MoMo',
      desc: 'Thanh toán trực tiếp qua ứng dụng Ví MoMo',
      icon: <Wallet className="w-6 h-6 text-pink-400" />,
    },
    {
      id: PaymentMethod.ZALOPAY,
      name: 'ZaloPay',
      desc: 'Thanh toán nhanh qua ví điện tử ZaloPay',
      icon: <Wallet className="w-6 h-6 text-cyan-400" />,
    },
    {
      id: PaymentMethod.CREDIT_CARD,
      name: 'Thẻ Quốc Tế (Visa / Master / JCB)',
      desc: 'Cổng thanh toán bảo mật tiêu chuẩn quốc tế',
      icon: <CreditCard className="w-6 h-6 text-amber-400" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back Button */}
      <Link
        to={`/booking/showtimes/${selectedShowtime._id}`}
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại chọn ghế</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Payment Methods & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Thông Tin Khách Hàng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Họ và tên:</span>
                <span className="font-semibold text-white">{user?.fullName || 'Khách vãng lai'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Email nhận vé điện tử:</span>
                <span className="font-semibold text-white">{user?.email}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Số điện thoại:</span>
                <span className="font-semibold text-white">{user?.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-500" />
              Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === opt.id
                      ? 'bg-brand-950/20 border-brand-500 ring-1 ring-brand-500'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">{opt.name}</span>
                        {opt.tag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === opt.id ? 'border-brand-500 bg-brand-500' : 'border-neutral-700'
                  }`}>
                    {paymentMethod === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Final Order Summary */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl">
          <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
            Tóm Tắt Đơn Hàng
          </h3>

          <div className="flex gap-3">
            <img
              src={selectedShowtime.movieId?.posterUrl}
              alt={selectedShowtime.movieId?.title}
              className="w-14 h-20 rounded-lg object-cover border border-neutral-800"
            />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-white leading-tight">{selectedShowtime.movieId?.title}</h4>
              <p className="text-neutral-400">{selectedShowtime.cinemaId?.name}</p>
              <p className="text-neutral-400">{selectedShowtime.screenId?.name}</p>
              <p className="text-brand-400 font-semibold">
                {formatTimeVN(selectedShowtime.startTime)} • {formatDateVN(selectedShowtime.startTime)}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Ghế đã chọn:</span>
              <span className="text-white font-bold">
                {selectedSeats.map((s) => s.seatNumber).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Số lượng:</span>
              <span className="text-white font-semibold">{selectedSeats.length} vé</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-neutral-800">
            <div className="flex justify-between text-neutral-400">
              <span>Tạm tính:</span>
              <span className="text-white">{formatVND(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Phí tiện ích:</span>
              <span className="text-emerald-400 font-semibold">Miễn phí (0đ)</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-neutral-800">
              <span>Tổng thanh toán:</span>
              <span className="text-brand-400">{formatVND(totalPrice)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý giao dịch...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Xác nhận & Thanh toán</span>
              </div>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mã hóa bảo mật 256-bit PCI-DSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
