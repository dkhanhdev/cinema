import React, { useState, useEffect } from 'react';
import { checkinApi, bookingApi, showtimeApi } from '../../api';
import { Booking, Showtime } from '../../types';
import { useToastStore } from '../../stores/useToastStore';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import {
  QrCode,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Ticket,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState<'qr' | 'search' | 'schedule'>('qr');

  // QR & Search State
  const [ticketCode, setTicketCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
    booking?: Booking;
    alreadyCheckedIn?: boolean;
  } | null>(null);

  // Search Bookings List
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Today's Showtimes
  const [todayShowtimes, setTodayShowtimes] = useState<Showtime[]>([]);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);

  // Verify Ticket
  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || ticketCode).trim();
    if (!code) {
      toast.warning('Vui lòng nhập hoặc quét mã vé!');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res: any = await checkinApi.verifyTicket(code);
      setVerificationResult(res.data);
      if (res.data?.valid) {
        toast.success(res.data.message || 'Vé hợp lệ!');
      } else {
        toast.warning(res.data?.message || 'Vé không hợp lệ!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi kiểm tra vé');
      setVerificationResult({
        valid: false,
        message: err.message || 'Không tìm thấy vé trong hệ thống.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Confirm Check-in
  const handleConfirmCheckin = async () => {
    if (!verificationResult?.booking?._id) return;

    setIsConfirming(true);
    try {
      const res: any = await checkinApi.confirmCheckIn(verificationResult.booking._id);
      toast.success('Xác nhận check-in thành công! Khách hàng có thể vào rạp.');
      setVerificationResult({
        ...verificationResult,
        alreadyCheckedIn: true,
        booking: res.data,
      });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi check-in');
    } finally {
      setIsConfirming(false);
    }
  };

  // Search Bookings
  const handleSearchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res: any = await bookingApi.getAll({ search: searchQuery.trim(), limit: 20 });
      setSearchResults(res.data || []);
      if ((res.data || []).length === 0) {
        toast.info('Không tìm thấy đơn đặt vé nào phù hợp.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tìm kiếm đơn vé');
    } finally {
      setIsSearching(false);
    }
  };

  // Load Today Showtimes
  const loadShowtimes = async () => {
    setIsLoadingShowtimes(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res: any = await showtimeApi.getAll({ date: today });
      setTodayShowtimes(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingShowtimes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadShowtimes();
    }
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4" />
            Cổng Nhân Viên Soát Vé
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Staff Portal & Quét Vé Check-in
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'qr'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Quét / Nhập QR</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Tìm Booking</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Chiếu Hôm Nay</span>
          </button>
        </div>
      </div>

      {/* Tab 1: QR Scan & Verify */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Verification Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Kiểm Tra & Xác Thực Mã Vé
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-400">
                Nhập chuỗi QR Token hoặc Mã Đặt Vé (VD: CB861347, CB789456)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Quét mã hoặc nhập mã vé..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  onClick={() => handleVerify()}
                  disabled={isVerifying}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Kiểm Tra</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Code Pills */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <span className="text-[11px] font-semibold text-neutral-500">Mã vé mẫu để test:</span>
              <div className="flex flex-wrap gap-2">
                {['CB789456', 'CB861347'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setTicketCode(code);
                      handleVerify(code);
                    }}
                    className="px-3 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 text-xs font-mono font-bold rounded-lg transition"
                  >
                    #{code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Result Card */}
          <div>
            {verificationResult ? (
              <div
                className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 animate-fade-in ${
                  verificationResult.valid
                    ? 'bg-neutral-900 border-emerald-500/40 shadow-emerald-950/20'
                    : 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/20'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                  {verificationResult.valid ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                  )}
                  <div>
                    <h3
                      className={`text-lg font-black ${
                        verificationResult.valid ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {verificationResult.valid ? 'VÉ HỢP LỆ (VALID)' : 'VÉ KHÔNG HỢP LỆ'}
                    </h3>
                    <p className="text-xs text-neutral-400">{verificationResult.message}</p>
                  </div>
                </div>

                {/* Ticket Details */}
                {verificationResult.booking && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-neutral-500 block">Tên Phim:</span>
                        <p className="font-extrabold text-white text-sm">
                          {verificationResult.booking.showtimeId?.movieId?.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Mã Đơn Vé:</span>
                        <p className="font-mono font-bold text-amber-400 text-sm">
                          #{verificationResult.booking.bookingCode}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                      <div>
                        <span className="text-neutral-500 block">Rạp Chiếu:</span>
                        <p className="font-semibold text-white">
                          {verificationResult.booking.showtimeId?.cinemaId?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Phòng Chiếu:</span>
                        <p className="font-semibold text-white">
                          {verificationResult.booking.showtimeId?.screenId?.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                      <div>
                        <span className="text-neutral-500 block">Suất Chiếu:</span>
                        <p className="font-bold text-brand-400">
                          {formatTimeVN(verificationResult.booking.showtimeId?.startTime)} -{' '}
                          {formatDateVN(verificationResult.booking.showtimeId?.startTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Vị Trí Ghế:</span>
                        <p className="font-black text-amber-400 text-sm">
                          {verificationResult.booking.seats?.map((s) => s.seatNumber).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-neutral-500 block">Khách Hàng:</span>
                      <p className="font-semibold text-white">
                        {verificationResult.booking.userId?.fullName} ({verificationResult.booking.userId?.phone || verificationResult.booking.userId?.email})
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-neutral-800">
                      {verificationResult.alreadyCheckedIn ? (
                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-bold text-neutral-400 text-xs">
                          ✓ Vé này đã được check-in vào rạp
                        </div>
                      ) : (
                        <button
                          onClick={handleConfirmCheckin}
                          disabled={isConfirming}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                        >
                          {isConfirming ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>XÁC NHẬN SOÁT VÉ VÀO RẠP</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[320px] rounded-3xl bg-neutral-900/40 border border-neutral-800/60 border-dashed flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-500">
                <QrCode className="w-12 h-12 text-neutral-700" />
                <p className="text-xs">
                  Kết quả xác thực vé sẽ hiển thị tại đây sau khi quét hoặc kiểm tra mã vé.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Search Booking */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <form onSubmit={handleSearchBookings} className="flex gap-2 max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã vé (VD: CB861347)..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Results Table */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Mã Vé</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Phim</th>
                    <th className="py-3 px-4">Suất Chiếu</th>
                    <th className="py-3 px-4">Ghế</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {searchResults.map((b) => (
                    <tr key={b._id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        #{b.bookingCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {b.userId?.fullName || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {b.showtimeId?.movieId?.title}
                      </td>
                      <td className="py-3.5 px-4">
                        {formatTimeVN(b.showtimeId?.startTime)} ({formatDateVN(b.showtimeId?.startTime)})
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-300">
                        {b.seats?.map((s) => s.seatNumber).join(', ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'CHECKED_IN'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('qr');
                            setTicketCode(b.bookingCode);
                            handleVerify(b.bookingCode);
                          }}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                        >
                          Kiểm Tra
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Today's Showtimes */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Danh Sách Suất Chiếu Hôm Nay
            </h3>
            <button
              onClick={loadShowtimes}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayShowtimes.map((st) => (
              <div
                key={st._id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">
                      {st.movieId?.title}
                    </h4>
                    <p className="text-xs text-neutral-400">{st.cinemaId?.name}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-400">
                    {st.screenId?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {formatTimeVN(st.startTime)}
                  </span>
                  <span className="text-amber-400 font-semibold">{formatVND(st.basePrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
