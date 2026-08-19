import React, { useEffect, useState } from 'react';
import { bookingApi } from '../../api';
import { Booking } from '../../types';
import { TicketCard } from '../../components/ticket/TicketCard';
import { Ticket, X, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TicketsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalBooking, setActiveModalBooking] = useState<Booking | null>(null);

  useEffect(() => {
    bookingApi
      .getMy()
      .then((res: any) => {
        setBookings(res.data || []);
      })
      .catch(console.error)
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
      <div className="border-b border-neutral-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-brand-500" />
            Vé Điện Tử Của Tôi (My Tickets)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Danh sách toàn bộ vé xem phim điện tử và mã QR bảo mật để qua cổng soát vé.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Ticket className="w-12 h-12 mx-auto text-neutral-600" />
          <h3 className="text-base font-bold text-white">Bạn chưa có vé nào</h3>
          <p className="text-xs text-neutral-400">Hãy chọn ngay một bộ phim bom tấn để thưởng thức!</p>
          <Link
            to="/movies?status=NOW_SHOWING"
            className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-red transition"
          >
            Khám phá phim đang chiếu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <TicketCard
              key={booking._id}
              booking={booking}
              onOpenQr={(b) => setActiveModalBooking(b)}
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl text-center">
            <button
              onClick={() => setActiveModalBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                Mã QR Check-in
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {activeModalBooking.showtimeId?.movieId?.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Mã vé: #{activeModalBooking.bookingCode}
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl mx-auto w-fit shadow-xl">
              {activeModalBooking.qrCodeUrl && (
                <img
                  src={activeModalBooking.qrCodeUrl}
                  alt={`QR ${activeModalBooking.bookingCode}`}
                  className="w-48 h-48 object-contain"
                />
              )}
            </div>

            <div className="text-xs text-neutral-300 space-y-1 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-500">Rạp:</span>
                <span className="font-semibold text-white">
                  {activeModalBooking.showtimeId?.cinemaId?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ghế:</span>
                <span className="font-bold text-amber-400">
                  {activeModalBooking.seats?.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
