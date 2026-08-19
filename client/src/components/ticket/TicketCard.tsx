import React from 'react';
import { Booking } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Ticket, MapPin, Calendar, Clock, QrCode, Printer } from 'lucide-react';

interface TicketCardProps {
  booking: Booking;
  onOpenQr?: (booking: Booking) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ booking, onOpenQr }) => {
  const movie = booking.showtimeId?.movieId;
  const cinema = booking.showtimeId?.cinemaId;
  const screen = booking.showtimeId?.screenId;
  const showtime = booking.showtimeId;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl transition hover:border-brand-500/40">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-rose-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-200 block">
              Vé Xem Phim Điện Tử
            </span>
            <h3 className="text-base sm:text-lg font-black truncate max-w-[240px] sm:max-w-md">
              {movie?.title}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-brand-200 block uppercase">Mã Đặt Vé</span>
          <span className="text-sm sm:text-base font-black tracking-widest bg-black/25 px-2.5 py-0.5 rounded-lg">
            #{booking.bookingCode}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="sm:col-span-2 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-neutral-500 font-semibold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" /> Rạp Chiếu:
            </span>
            <p className="font-bold text-white text-sm">{cinema?.name}</p>
            <p className="text-neutral-400 text-[11px]">{cinema?.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
            <div>
              <span className="text-neutral-500 font-semibold block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-500" /> Ngày chiếu:
              </span>
              <p className="font-bold text-white">{showtime ? formatDateVN(showtime.startTime) : ''}</p>
            </div>
            <div>
              <span className="text-neutral-500 font-semibold block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" /> Suất chiếu:
              </span>
              <p className="font-bold text-brand-400 text-sm">
                {showtime ? formatTimeVN(showtime.startTime) : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
            <div>
              <span className="text-neutral-500 font-semibold block">Phòng:</span>
              <p className="font-bold text-white">{screen?.name}</p>
            </div>
            <div>
              <span className="text-neutral-500 font-semibold block">Vị trí ghế:</span>
              <p className="font-extrabold text-amber-400 text-sm">
                {booking.seats?.map((s) => s.seatNumber).join(', ')}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
            <span className="text-neutral-400">Tổng thanh toán:</span>
            <span className="font-extrabold text-white text-sm">{formatVND(booking.finalPrice)}</span>
          </div>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
          {booking.qrCodeUrl ? (
            <img
              src={booking.qrCodeUrl}
              alt={booking.bookingCode}
              className="w-28 h-28 object-contain bg-white p-1 rounded-xl"
            />
          ) : (
            <div className="w-28 h-28 bg-white/10 rounded-xl flex items-center justify-center text-xs text-neutral-400">
              QR Code
            </div>
          )}
          {onOpenQr && (
            <button
              onClick={() => onOpenQr(booking)}
              className="px-3 py-1 bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
            >
              <QrCode className="w-3 h-3" />
              <span>Phóng to QR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
