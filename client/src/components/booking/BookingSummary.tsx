import React from 'react';
import { Showtime, Seat } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Ticket, ArrowRight, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

interface BookingSummaryProps {
  showtime: Showtime;
  selectedSeats: Seat[];
  onProceed: () => void;
  isLoading?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  showtime,
  selectedSeats,
  onProceed,
  isLoading = false,
}) => {
  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + (showtime.basePrice + (seat.priceModifier || 0)),
    0
  );

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl sticky top-24">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
        <Ticket className="w-5 h-5 text-brand-500" />
        Tóm Tắt Đặt Vé
      </h2>

      {/* Movie & Showtime Brief */}
      <div className="flex gap-3">
        <img
          src={showtime.movieId?.posterUrl}
          alt={showtime.movieId?.title}
          className="w-14 h-20 rounded-xl object-cover border border-neutral-800"
        />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-white leading-tight line-clamp-2">
            {showtime.movieId?.title}
          </h4>
          <p className="text-neutral-400">{showtime.cinemaId?.name}</p>
          <p className="text-brand-400 font-semibold">{showtime.screenId?.name}</p>
          <p className="text-neutral-400">
            {formatTimeVN(showtime.startTime)} - {formatDateVN(showtime.startTime)}
          </p>
        </div>
      </div>

      {/* Selected Seats List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-neutral-400">Ghế đã chọn:</span>
        {selectedSeats.length === 0 ? (
          <div className="p-4 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
            Vui lòng chọn ghế ngồi trên sơ đồ
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedSeats.map((seat) => {
              const price = showtime.basePrice + (seat.priceModifier || 0);
              return (
                <div
                  key={seat._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
                      {seat.seatNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-white">Ghế {seat.type}</p>
                      <p className="text-[10px] text-neutral-500">
                        Hàng {seat.row} - Cột {seat.col}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatVND(price)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Calculation */}
      <div className="space-y-2 pt-3 border-t border-neutral-800 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Số lượng ghế:</span>
          <span className="text-white font-semibold">{selectedSeats.length} vé</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Giá vé cơ bản:</span>
          <span className="text-white">{formatVND(showtime.basePrice)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
          <span>Tổng thanh toán:</span>
          <span className="text-brand-400 text-base">{formatVND(totalPrice)}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-3 pt-2">
        <button
          disabled={selectedSeats.length === 0 || isLoading}
          onClick={onProceed}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
        >
          <span>Tiếp tục thanh toán</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Giữ ghế an toàn trong 7 phút</span>
        </div>
      </div>
    </div>
  );
};
