import React, { useEffect, useState } from 'react';
import { Booking } from '../../types';
import { bookingApi } from '../../api';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Ticket, Search, QrCode, Filter } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res: any = await bookingApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-brand-500" />
            Quản Lý Toàn Bộ Vé & Đơn Đặt (Booking Manager)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tra cứu thông tin vé của khách hàng, theo dõi trạng thái thanh toán và check-in.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mã vé (VD: CB789...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition uppercase"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CONFIRMED">CONFIRMED (Đã đặt)</option>
            <option value="CHECKED_IN">CHECKED_IN (Đã soát vé)</option>
            <option value="CANCELLED">CANCELLED (Hủy)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold">
                <th className="py-3.5 px-4">Mã Vé</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Phim & Rạp</th>
                <th className="py-3.5 px-4">Suất Chiếu</th>
                <th className="py-3.5 px-4">Ghế Ngồi</th>
                <th className="py-3.5 px-4">Tổng Tiền</th>
                <th className="py-3.5 px-4">Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái Vé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    Đang tải dữ liệu vé...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    Không tìm thấy đơn đặt vé nào.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-brand-400">#{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{b.userId?.fullName || 'Khách vãng lai'}</p>
                      <p className="text-[11px] text-neutral-500">{b.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{b.showtimeId?.movieId?.title}</p>
                      <p className="text-[11px] text-neutral-400">{b.showtimeId?.cinemaId?.name}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {b.showtimeId ? formatTimeVN(b.showtimeId.startTime) : ''} (
                      {b.showtimeId ? formatDateVN(b.showtimeId.startTime) : ''})
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {b.seats?.map((s) => s.seatNumber).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-white">{formatVND(b.finalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'CHECKED_IN'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
