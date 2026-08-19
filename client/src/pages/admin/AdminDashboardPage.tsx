import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api';
import { DashboardSummary } from '../../types';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { DollarSign, Ticket, Film, Building, Users, TrendingUp, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((res: any) => {
        setSummary(res.data);
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

  const maxRevenue = Math.max(...(summary?.revenueByDay?.map((d) => d.revenue) || [1000000]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header & Subnav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-amber-400" />
            Bảng Điều Khiển Quản Trị (Admin Dashboard)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng hợp dữ liệu doanh thu, số lượng vé bán ra và các hoạt động rạp chiếu.
          </p>
        </div>

        {/* Admin Navigation Shortlinks */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/movies"
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white rounded-xl transition"
          >
            🎬 Quản lý Phim
          </Link>
          <Link
            to="/admin/showtimes"
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white rounded-xl transition"
          >
            📅 Lịch Chiếu
          </Link>
          <Link
            to="/admin/cinemas"
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white rounded-xl transition"
          >
            🏛️ Rạp & Phòng
          </Link>
          <Link
            to="/admin/bookings"
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white rounded-xl transition"
          >
            🎟️ Toàn bộ Vé
          </Link>
        </div>
      </div>

      {/* 1. Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-brand-500">
            <span className="text-xs font-semibold text-neutral-400">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white glow-text-red">
            {formatVND(summary?.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">+12.5% so với tuần trước</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-neutral-400">Vé đã bán</span>
            <Ticket className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {summary?.totalTicketsSold || 0} vé
          </p>
          <span className="text-[10px] text-amber-400 font-medium">Tỷ lệ lấp đầy: ~68%</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold text-neutral-400">Tổng phim</span>
            <Film className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {summary?.totalMovies || 0} phim
          </p>
          <span className="text-[10px] text-blue-400 font-medium">Kết nối TMDB trực tiếp</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold text-neutral-400">Cụm rạp</span>
            <Building className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {summary?.totalCinemas || 0} rạp
          </p>
          <span className="text-[10px] text-purple-400 font-medium">TP.HCM, HN, Đà Nẵng</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-neutral-400">Khách hàng</span>
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {summary?.totalUsers || 0} user
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">Tài khoản thành viên</span>
        </div>
      </div>

      {/* 2. Charts & Top Movies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: 7-Day Revenue Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
            </h3>
            <span className="text-xs text-neutral-400">Đơn vị: VNĐ</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-neutral-800">
            {summary?.revenueByDay && summary.revenueByDay.length > 0 ? (
              summary.revenueByDay.map((day) => {
                const heightPercent = Math.max(15, Math.round((day.revenue / maxRevenue) * 100));
                return (
                  <div key={day._id} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-black/90 text-[10px] text-white py-1 px-2 rounded border border-neutral-700 whitespace-nowrap z-20 pointer-events-none">
                      {formatVND(day.revenue)} ({day.bookingsCount} đơn)
                    </div>

                    <div className="w-full max-w-[40px] bg-neutral-800 rounded-t-lg overflow-hidden h-44 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-brand-600 to-rose-400 group-hover:from-brand-500 group-hover:to-rose-300 transition-all rounded-t-lg shadow-glow-red"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {day._id.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Top Movies Ranking */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Top Phim Bán Chạy Nhất
          </h3>

          <div className="space-y-3">
            {summary?.topMovies && summary.topMovies.length > 0 ? (
              summary.topMovies.map((movie, idx) => (
                <div
                  key={movie._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                >
                  <span className="w-5 text-center font-extrabold text-amber-400 text-sm">
                    #{idx + 1}
                  </span>
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-10 h-14 rounded-lg object-cover border border-neutral-800"
                  />
                  <div className="flex-1 truncate">
                    <p className="font-bold text-white truncate">{movie.title}</p>
                    <p className="text-[11px] text-neutral-400">{movie.tickets} vé đã bán</p>
                    <p className="text-[11px] text-brand-400 font-semibold">{formatVND(movie.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">Chưa có giao dịch phim nào</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recent Bookings Table */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            Đơn Đặt Vé Gần Đây
          </h3>
          <Link to="/admin/bookings" className="text-xs text-brand-400 hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                <th className="pb-3 pr-4">Mã Vé</th>
                <th className="pb-3 pr-4">Khách Hàng</th>
                <th className="pb-3 pr-4">Bộ Phim</th>
                <th className="pb-3 pr-4">Số Ghế</th>
                <th className="pb-3 pr-4">Tổng Tiền</th>
                <th className="pb-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {summary?.recentBookings?.map((b) => (
                <tr key={b._id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                  <td className="py-3 pr-4 font-mono font-bold text-white">#{b.bookingCode}</td>
                  <td className="py-3 pr-4">{b.userId?.fullName || 'Khách vãng lai'}</td>
                  <td className="py-3 pr-4 font-medium text-white">{b.showtimeId?.movieId?.title}</td>
                  <td className="py-3 pr-4 font-bold text-amber-400">{b.seats?.map((s) => s.seatNumber).join(', ')}</td>
                  <td className="py-3 pr-4 font-extrabold text-brand-400">{formatVND(b.finalPrice)}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {b.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
