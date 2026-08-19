import React from 'react';
import { Seat, SeatStatus, SeatType } from '../../types';
import { Lock, Check, Ban } from 'lucide-react';
import { formatVND } from '../../utils/format';

interface SeatGridProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  basePrice: number;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  basePrice,
}) => {
  // Group seats by row letter
  const rowsMap = new Map<string, Seat[]>();
  seats.forEach((seat) => {
    const list = rowsMap.get(seat.row) || [];
    list.push(seat);
    rowsMap.set(seat.row, list);
  });

  const rowLetters = Array.from(rowsMap.keys()).sort();

  return (
    <div className="w-full flex flex-col items-center select-none py-6">
      {/* Screen Curved Header */}
      <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <div className="w-4/5 screen-curve"></div>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 -mt-2">
          Màn Hình Chiếu (Screen)
        </span>
      </div>

      {/* Seating Matrix Grid */}
      <div className="overflow-x-auto max-w-full pb-6 px-4">
        <div className="flex flex-col gap-2.5 min-w-[580px]">
          {rowLetters.map((rowLetter) => {
            const rowSeats = (rowsMap.get(rowLetter) || []).sort((a, b) => a.col - b.col);

            return (
              <div key={rowLetter} className="flex items-center justify-center gap-2">
                {/* Row Label Left */}
                <span className="w-6 text-center text-xs font-bold text-neutral-500">
                  {rowLetter}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat._id);
                    const isBooked = seat.status === SeatStatus.BOOKED;
                    const isDisabled = seat.status === SeatStatus.DISABLED || seat.isActive === false;
                    const isHeldOther = seat.status === SeatStatus.HELD && !seat.isHeldByMe && !isSelected;
                    const isHeldMe = seat.isHeldByMe || isSelected;

                    // Width for Couple seats vs regular
                    const isCouple = seat.type === SeatType.COUPLE;
                    const widthClass = isCouple ? 'w-14 sm:w-16' : 'w-7 sm:w-8';

                    let seatStyle = 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:border-brand-500 hover:scale-105';

                    if (isDisabled) {
                      seatStyle = 'bg-neutral-950 border-neutral-900 text-neutral-700 cursor-not-allowed opacity-40';
                    } else if (isBooked) {
                      seatStyle = 'bg-neutral-900 border-neutral-800/60 text-neutral-600 cursor-not-allowed opacity-50';
                    } else if (isHeldOther) {
                      seatStyle = 'bg-amber-950/40 border-amber-500/60 text-amber-400 cursor-not-allowed animate-pulse';
                    } else if (isHeldMe) {
                      seatStyle = 'bg-brand-600 border-brand-400 text-white shadow-glow-red scale-105 font-bold';
                    } else if (seat.type === SeatType.VIP) {
                      seatStyle = 'bg-amber-950/20 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:scale-105';
                    } else if (seat.type === SeatType.COUPLE) {
                      seatStyle = 'bg-pink-950/20 border-pink-500/40 text-pink-300 hover:border-pink-400 hover:scale-105';
                    }

                    return (
                      <button
                        key={seat._id}
                        disabled={isBooked || isHeldOther || isDisabled}
                        onClick={() => onToggleSeat(seat)}
                        className={`h-7 sm:h-8 rounded-lg border text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all transform duration-150 relative ${widthClass} ${seatStyle}`}
                        title={
                          isDisabled
                            ? `${seat.seatNumber} - Tạm khóa`
                            : isBooked
                            ? `${seat.seatNumber} - Đã bán`
                            : isHeldOther
                            ? `${seat.seatNumber} - Đang được giữ`
                            : `${seat.seatNumber} (${seat.type}) - ${formatVND(basePrice + seat.priceModifier)}`
                        }
                      >
                        {isDisabled ? (
                          <Ban className="w-3 h-3 text-neutral-600" />
                        ) : isBooked ? (
                          '✕'
                        ) : isHeldOther ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : isHeldMe ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <span>{seat.col}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row Label Right */}
                <span className="w-6 text-center text-xs font-bold text-neutral-500">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Seat Types Guide */}
      <div className="mt-8 pt-6 border-t border-neutral-800/80 w-full max-w-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-neutral-700 bg-neutral-800"></div>
            <span className="text-neutral-400">Thường</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-amber-500/50 bg-amber-950/30"></div>
            <span className="text-amber-400">VIP (+20k)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-5 rounded border border-pink-500/50 bg-pink-950/30"></div>
            <span className="text-pink-400">Đôi (+50k)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-brand-500 bg-brand-600 flex items-center justify-center text-white">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-white font-medium">Đang chọn</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-amber-500 bg-amber-950/60 flex items-center justify-center text-amber-400 animate-pulse">
              <Lock className="w-2.5 h-2.5" />
            </div>
            <span className="text-amber-300">Đang giữ</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-600">
              ✕
            </div>
            <span className="text-neutral-500">Đã bán</span>
          </div>
        </div>
      </div>
    </div>
  );
};
