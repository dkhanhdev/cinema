import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { bookingApi } from '../../api';
import { Booking } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { CheckCircle2, Ticket, Printer, Home, QrCode, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (!bookingId) return;
    bookingApi
      .getById(bookingId)
      .then((res: any) => {
        setBooking(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy thông tin vé</h2>
        <Link to="/" className="text-sm text-brand-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const movie = booking.showtimeId?.movieId;
  const cinema = booking.showtimeId?.cinemaId;
  const screen = booking.showtimeId?.screenId;
  const showtime = booking.showtimeId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Success Notification Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Đặt Vé Xem Phim Thành Công!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Mã vé điện tử đã được kích hoạt. Bạn có thể xuất trình mã QR này trực tiếp tại quầy soát vé rạp để vào xem.
        </p>
      </div>

      {/* Cinematic E-Ticket Card Layout */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Ticket Header Gradient */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-rose-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-7 h-7" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-200">
                Vé Điện Tử / E-Ticket
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold">{movie?.title}</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-brand-200 block uppercase">Mã Đặt Vé</span>
            <span className="text-base sm:text-lg font-black tracking-widest bg-black/20 px-3 py-1 rounded-lg">
              {booking.bookingCode}
            </span>
          </div>
        </div>

        {/* Ticket Body Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Movie Poster & Main Details */}
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-500 font-semibold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500" /> Rạp Chiếu:
              </span>
              <p className="text-sm font-bold text-white">{cinema?.name}</p>
              <p className="text-neutral-400">{cinema?.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
              <div>
                <span className="text-neutral-500 font-semibold block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" /> Ngày chiếu:
                </span>
                <p className="font-bold text-white text-xs sm:text-sm">
                  {showtime ? formatDateVN(showtime.startTime) : ''}
                </p>
              </div>

              <div>
                <span className="text-neutral-500 font-semibold block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> Suất chiếu:
                </span>
                <p className="font-bold text-brand-400 text-sm sm:text-base">
                  {showtime ? formatTimeVN(showtime.startTime) : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
              <div>
                <span className="text-neutral-500 font-semibold block">Phòng chiếu:</span>
                <p className="font-bold text-white text-sm">{screen?.name}</p>
              </div>

              <div>
                <span className="text-neutral-500 font-semibold block">Ghế ngồi ({booking.seats?.length} vé):</span>
                <p className="font-extrabold text-white text-base text-amber-400">
                  {booking.seats?.map((s) => s.seatNumber).join(', ')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400">Tổng tiền đã thanh toán:</span>
              <span className="font-extrabold text-white text-sm sm:text-base">
                {formatVND(booking.finalPrice)}
              </span>
            </div>
          </div>

          {/* QR Code Scannable Section */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="p-2 bg-white rounded-xl shadow-lg">
              {booking.qrCodeUrl ? (
                <img
                  src={booking.qrCodeUrl}
                  alt={`QR Code ${booking.bookingCode}`}
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-neutral-800 text-xs">
                  Mã QR
                </div>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 text-center font-medium">
              Quét mã tại cửa kiểm soát
            </span>
          </div>
        </div>

        {/* Perforated Divider Visual Effect */}
        <div className="relative flex items-center justify-between px-2">
          <div className="w-6 h-6 rounded-full bg-[#07070b] -ml-3" />
          <div className="w-full border-t-2 border-dashed border-neutral-800" />
          <div className="w-6 h-6 rounded-full bg-[#07070b] -mr-3" />
        </div>

        {/* Ticket Footer Notes */}
        <div className="p-4 bg-neutral-950/60 text-center text-[11px] text-neutral-500">
          Vui lòng đến rạp trước 15 phút để nhận bắp nước và ổn định chỗ ngồi. Chúc bạn có trải nghiệm xem phim vui vẻ!
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          <span>In / Lưu Vé PDF</span>
        </button>

        <Link
          to="/my-bookings"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <Ticket className="w-4 h-4 text-brand-500" />
          <span>Xem Danh Sách Vé Của Tôi</span>
        </Link>

        <Link
          to="/"
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-red flex items-center gap-2 transition"
        >
          <Home className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </Link>
      </div>
    </div>
  );
};
