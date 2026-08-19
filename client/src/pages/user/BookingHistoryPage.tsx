import React, { useEffect, useState } from 'react';
import { bookingApi } from '../../api';
import { Booking } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Ticket, QrCode, Calendar, Clock, MapPin, CheckCircle, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQrBooking, setActiveQrBooking] = useState<Booking | null>(null);

  useEffect(() => {
    bookingApi
      .getMy()
      .then((res: any) => {
        setBookings(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Ticket className="w-6 h-6 text-brand-500" />
          Vé Của Tôi (Lịch Sử Đặt Vé)
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Quản lý toàn bộ vé xem phim điện tử và mã QR check-in tại rạp.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Ticket className="w-12 h-12 mx-auto text-neutral-600" />
          <h3 className="text-base font-bold text-white">Bạn chưa có đơn đặt vé nào</h3>
          <p className="text-xs text-neutral-400">Hãy chọn ngay một bộ phim yêu thích để thưởng thức!</p>
          <Link
            to="/movies?status=NOW_SHOWING"
            className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-red transition"
          >
            Khám phá phim đang chiếu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const movie = booking.showtimeId?.movieId;
            const cinema = booking.showtimeId?.cinemaId;
            const screen = booking.showtimeId?.screenId;
            const showtime = booking.showtimeId;

            let statusBadge = (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Đã thanh toán
              </span>
            );
            if (booking.bookingStatus === 'CHECKED_IN') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Đã Check-in
                </span>
              );
            }

            return (
              <div
                key={booking._id}
                className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-lg"
              >
                {/* Left: Movie & Showtime Details */}
                <div className="flex gap-4 items-start">
                  <img
                    src={movie?.posterUrl}
                    alt={movie?.title}
                    className="w-16 h-24 rounded-xl object-cover border border-neutral-800 flex-shrink-0"
                  />
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm sm:text-base">
                        {movie?.title}
                      </span>
                      {statusBadge}
                    </div>

                    <p className="text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      {cinema?.name} ({screen?.name})
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-neutral-300">
                      <span className="flex items-center gap-1 font-semibold text-brand-400">
                        <Clock className="w-3.5 h-3.5" />
                        {showtime ? formatTimeVN(showtime.startTime) : ''}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {showtime ? formatDateVN(showtime.startTime) : ''}
                      </span>
                    </div>

                    <p className="text-neutral-400">
                      Ghế: <span className="font-bold text-amber-400">{booking.seats?.map((s) => s.seatNumber).join(', ')}</span>
                      <span className="text-neutral-500 ml-2">({booking.seats?.length} vé - {formatVND(booking.finalPrice)})</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                  <span className="text-xs text-neutral-500 font-mono font-bold">
                    #{booking.bookingCode}
                  </span>
                  <button
                    onClick={() => setActiveQrBooking(booking)}
                    className="px-4 py-2 bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mở Mã QR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {activeQrBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl text-center">
            <button
              onClick={() => setActiveQrBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                Mã QR Check-in
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {activeQrBooking.showtimeId?.movieId?.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Mã vé: {activeQrBooking.bookingCode}
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl mx-auto w-fit shadow-xl">
              {activeQrBooking.qrCodeUrl && (
                <img
                  src={activeQrBooking.qrCodeUrl}
                  alt={`QR ${activeQrBooking.bookingCode}`}
                  className="w-44 h-44 object-contain"
                />
              )}
            </div>

            <div className="text-xs text-neutral-300 space-y-1 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-500">Rạp:</span>
                <span className="font-semibold text-white">{activeQrBooking.showtimeId?.cinemaId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phòng:</span>
                <span className="font-semibold text-white">{activeQrBooking.showtimeId?.screenId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ghế:</span>
                <span className="font-bold text-amber-400">
                  {activeQrBooking.seats?.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Giờ chiếu:</span>
                <span className="font-semibold text-brand-400">
                  {formatTimeVN(activeQrBooking.showtimeId?.startTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
