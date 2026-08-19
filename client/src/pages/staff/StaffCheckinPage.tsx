import React, { useState } from 'react';
import { checkinApi } from '../../api';
import { Booking } from '../../types';
import { useToastStore } from '../../stores/useToastStore';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { QrCode, Scan, CheckCircle2, AlertTriangle, XCircle, Search, Sparkles, User, MapPin, Calendar, Clock } from 'lucide-react';

export const StaffCheckinPage: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    message: string;
    booking?: Booking;
    alreadyCheckedIn?: boolean;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const toast = useToastStore();

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode).trim();
    if (!code) {
      toast.warning('Vui lòng nhập hoặc quét mã vé.');
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res: any = await checkinApi.verifyTicket(code);
      setVerifyResult(res.data);
      if (res.data.valid) {
        toast.success('Vé hợp lệ! Sẵn sàng xác nhận vào rạp.');
      } else if (res.data.alreadyCheckedIn) {
        toast.warning('Vé này đã được check-in trước đó!');
      } else {
        toast.error(res.data.message || 'Vé không hợp lệ');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kiểm tra vé');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!verifyResult?.booking?._id) return;
    setIsConfirming(true);
    try {
      await checkinApi.confirmCheckIn(verifyResult.booking._id);
      toast.success(`Check-in thành công cho vé #${verifyResult.booking.bookingCode}!`);
      // Update state
      setVerifyResult((prev) =>
        prev
          ? {
              ...prev,
              valid: false,
              alreadyCheckedIn: true,
              message: 'Check-in thành công lúc ' + new Date().toLocaleTimeString('vi-VN'),
            }
          : null
      );
      setInputCode('');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xác nhận check-in');
    } finally {
      setIsConfirming(false);
    }
  };

  const booking = verifyResult?.booking;
  const movie = booking?.showtimeId?.movieId;
  const cinema = booking?.showtimeId?.cinemaId;
  const screen = booking?.showtimeId?.screenId;
  const showtime = booking?.showtimeId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-emerald-400" />
            Cổng Soát Vé Staff Check-in
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Quét mã QR trên điện thoại khách hàng hoặc nhập mã vé để xác thực vào rạp.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Máy quét sẵn sàng
        </span>
      </div>

      {/* Input / Scanner simulation widget */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập mã vé (VD: CB789456) hoặc dán chuỗi mã QR..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition uppercase font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg flex-shrink-0"
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            <span>Kiểm Tra Vé</span>
          </button>
        </form>

        {/* Quick Test Chip */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
          <span>Mã vé mẫu để test nhanh:</span>
          <button
            onClick={() => {
              setInputCode('CB789456');
              handleVerify('CB789456');
            }}
            className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-amber-400 font-mono font-bold rounded-lg transition"
          >
            CB789456 (Vé Seed)
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {verifyResult && (
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl animate-fade-in">
          {/* Status Header Banner */}
          <div
            className={`p-5 flex items-center justify-between ${
              verifyResult.valid
                ? 'bg-emerald-950/60 border-b border-emerald-500/40 text-emerald-300'
                : verifyResult.alreadyCheckedIn
                ? 'bg-amber-950/60 border-b border-amber-500/40 text-amber-300'
                : 'bg-rose-950/60 border-b border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {verifyResult.valid ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : verifyResult.alreadyCheckedIn ? (
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-400" />
              )}
              <div>
                <h3 className="text-base font-extrabold">{verifyResult.message}</h3>
                <p className="text-xs opacity-80">Mã vé: #{booking?.bookingCode}</p>
              </div>
            </div>

            {verifyResult.valid && (
              <button
                onClick={handleConfirmCheckIn}
                disabled={isConfirming}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm rounded-xl transition transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                {isConfirming ? 'Đang xử lý...' : '✓ XÁC NHẬN VÀO RẠP'}
              </button>
            )}
          </div>

          {/* Ticket Information Body */}
          {booking && (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4 md:col-span-2">
                <img
                  src={movie?.posterUrl}
                  alt={movie?.title}
                  className="w-20 h-28 rounded-xl object-cover border border-neutral-800 flex-shrink-0"
                />
                <div className="space-y-2 text-xs">
                  <h4 className="text-base font-extrabold text-white">{movie?.title}</h4>
                  <p className="text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    {cinema?.name} - <span className="text-white font-semibold">{screen?.name}</span>
                  </p>
                  <p className="text-neutral-300 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-brand-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {showtime ? formatTimeVN(showtime.startTime) : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {showtime ? formatDateVN(showtime.startTime) : ''}
                    </span>
                  </p>
                  <p className="text-neutral-400">
                    Khách hàng:{' '}
                    <span className="text-white font-semibold">
                      {booking.userId?.fullName || 'Khách vãng lai'} ({booking.userId?.phone || booking.userId?.email})
                    </span>
                  </p>
                </div>
              </div>

              {/* Seats Pill Box */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Vị trí ghế ngồi
                </span>
                <span className="text-2xl font-black text-amber-400 tracking-wider">
                  {booking.seats?.map((s) => s.seatNumber).join(', ')}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Tổng: {booking.seats?.length} người ({formatVND(booking.finalPrice)})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
