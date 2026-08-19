import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Showtime, Seat } from '../../types';
import { showtimeApi } from '../../api';
import { useRealtimeSeats } from '../../hooks/useRealtimeSeats';
import { useBookingStore } from '../../stores/useBookingStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { SeatGrid } from '../../components/seatmap/SeatGrid';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Clock, Ticket, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [initialSeats, setInitialSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes in seconds

  const { isAuthenticated } = useAuthStore();
  const { selectedSeats, setSelectedShowtime, getTotalPrice, resetBooking } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showtimeId) return;
    setIsLoading(true);
    showtimeApi
      .getSeats(showtimeId)
      .then((res: any) => {
        setShowtime(res.data.showtime);
        setInitialSeats(res.data.seats || []);
        setSelectedShowtime(res.data.showtime);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [showtimeId]);

  // Realtime hook for socket lock/unlock
  const { seats, toggleSeat } = useRealtimeSeats(showtimeId || '', initialSeats);

  // 7-min hold countdown timer
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setTimeLeft(420);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeats.length]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/checkout` } });
      return;
    }
    navigate('/booking/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-white mb-2">Suất chiếu không tồn tại</h2>
        <Link to="/" className="text-sm text-brand-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const selectedSeatIds = selectedSeats.map((s) => s._id);
  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Top Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={showtime.movieId?.posterUrl}
            alt={showtime.movieId?.title}
            className="w-12 h-16 rounded-lg object-cover border border-neutral-700"
          />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
              {showtime.movieId?.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {showtime.cinemaId?.name} • <span className="text-brand-400 font-semibold">{showtime.screenId?.name}</span>
            </p>
            <p className="text-xs text-neutral-400">
              Suất chiếu: <span className="text-white font-medium">{formatTimeVN(showtime.startTime)}</span> - {formatDateVN(showtime.startTime)}
            </p>
          </div>
        </div>

        {/* Realtime Hold Timer */}
        {selectedSeats.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-950/40 border border-amber-500/40 rounded-xl animate-pulse">
            <Clock className="w-5 h-5 text-amber-400" />
            <div className="text-right">
              <span className="text-[11px] text-amber-300 block">Thời gian giữ ghế:</span>
              <span className="text-base font-extrabold text-white tracking-wider">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Seat Map (Left) & Order Summary Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Interactive Seat Matrix */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl flex flex-col items-center">
          <SeatGrid
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={toggleSeat}
            basePrice={showtime.basePrice}
          />
        </div>

        {/* Right 1 Col: Booking Sidebar Summary */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl sticky top-24">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Ticket className="w-5 h-5 text-brand-500" />
            Thông Tin Đặt Vé
          </h2>

          {/* Selected Seats List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-400">Ghế đã chọn:</span>
            {selectedSeats.length === 0 ? (
              <div className="p-4 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                Vui lòng chọn ghế ngồi trên sơ đồ
              </div>
            ) : (
              <div className="space-y-2">
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
                          <p className="text-[10px] text-neutral-500">Hàng {seat.row} - Cột {seat.col}</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">{formatVND(price)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-3 border-t border-neutral-800 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Số lượng ghế:</span>
              <span className="text-white font-semibold">{selectedSeats.length} ghế</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Giá vé tiêu chuẩn:</span>
              <span className="text-white">{formatVND(showtime.basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
              <span>Tổng thanh toán:</span>
              <span className="text-brand-400 text-base">{formatVND(totalPrice)}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="space-y-3 pt-2">
            <button
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <span>Tiếp tục thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ghế được giữ an toàn trong 7 phút</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
