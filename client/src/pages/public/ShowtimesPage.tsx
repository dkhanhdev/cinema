import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { showtimeApi, cinemaApi } from '../../api';
import { Showtime, Cinema } from '../../types';
import { ShowtimeSelector } from '../../components/showtime/ShowtimeSelector';
import { Calendar, MapPin, Film, AlertCircle } from 'lucide-react';

export const ShowtimesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cinemaIdParam = searchParams.get('cinemaId') || '';

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>(cinemaIdParam);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    return {
      dateStr: dStr,
      dayName: i === 0 ? 'Hôm nay' : d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
    };
  });

  const activeDate = selectedDate || next7Days[0].dateStr;

  useEffect(() => {
    cinemaApi.getAll().then((res: any) => setCinemas(res.data || [])).catch(console.error);
  }, []);

  const fetchShowtimes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await showtimeApi.getAll({
        cinemaId: selectedCinema || undefined,
        date: activeDate,
      });
      setShowtimes(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải lịch chiếu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [selectedCinema, activeDate]);

  const handleCinemaChange = (cId: string) => {
    setSelectedCinema(cId);
    if (cId) {
      setSearchParams({ cinemaId: cId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-brand-500" />
            Lịch Chiếu Phim Toàn Quốc
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tra cứu suất chiếu theo cụm rạp và ngày chiếu để đặt chỗ tức thì.
          </p>
        </div>

        {/* Cinema Filter Dropdown */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <select
            value={selectedCinema}
            onChange={(e) => handleCinemaChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">-- Tất cả cụm rạp --</option>
            {cinemas.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {next7Days.map(({ dateStr, dayName, dayNumber, month }) => {
          const isSelected = activeDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[90px] py-3 px-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-brand-600 border-brand-500 text-white shadow-glow-red scale-105'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span className="text-[11px] font-bold uppercase">{dayName}</span>
              <span className="text-lg font-extrabold">{dayNumber}/{month}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : error ? (
        <div className="py-16 text-center rounded-2xl bg-rose-950/20 border border-rose-500/30 p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-xs text-neutral-300">{error}</p>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-8 space-y-3">
          <Film className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có suất chiếu phù hợp cho ngày này</h3>
          <p className="text-xs text-neutral-400">Vui lòng chọn ngày khác hoặc cụm rạp khác.</p>
        </div>
      ) : (
        <ShowtimeSelector showtimes={showtimes} />
      )}
    </div>
  );
};
