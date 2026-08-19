import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Showtime } from '../../types';
import { formatDateVN, formatTimeVN, formatVND } from '../../utils/format';
import { Calendar, MapPin, Film, Clock } from 'lucide-react';

interface ShowtimeSelectorProps {
  showtimes: Showtime[];
  initialDate?: string;
}

export const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({
  showtimes,
  initialDate,
}) => {
  // Extract distinct dates
  const datesSet = new Set<string>();
  showtimes.forEach((st) => {
    const dStr = new Date(st.startTime).toISOString().split('T')[0];
    datesSet.add(dStr);
  });
  const availableDates = Array.from(datesSet).sort();

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || availableDates[0] || '');

  const activeDate = selectedDate || availableDates[0] || '';

  // Filter showtimes for the chosen date
  const filtered = showtimes.filter((st) => {
    if (!activeDate) return true;
    return new Date(st.startTime).toISOString().split('T')[0] === activeDate;
  });

  // Group by cinema
  const cinemaMap = new Map<string, { cinema: any; showtimes: Showtime[] }>();
  filtered.forEach((st) => {
    const cId = (st.cinemaId as any)?._id || (st.cinemaId as any)?.name || 'default';
    const existing = cinemaMap.get(cId) || { cinema: st.cinemaId, showtimes: [] };
    existing.showtimes.push(st);
    cinemaMap.set(cId, existing);
  });

  return (
    <div className="space-y-6">
      {/* Date Selector Tabs */}
      {availableDates.length > 0 ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {availableDates.map((dateStr) => {
            const isSelected = activeDate === dateStr;
            const d = new Date(dateStr);
            const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dateNum = d.getDate();
            const monthNum = d.getMonth() + 1;

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
                <span className="text-lg font-extrabold">{dateNum}/{monthNum}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500 text-xs">
          Chưa có lịch chiếu khả dụng.
        </div>
      )}

      {/* Showtimes by Cinema */}
      <div className="space-y-6">
        {Array.from(cinemaMap.values()).map(({ cinema, showtimes: cShowtimes }) => (
          <div
            key={cinema._id || cinema.name}
            className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4"
          >
            {/* Cinema Header */}
            <div className="flex items-start justify-between border-b border-neutral-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  {cinema.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{cinema.address}</p>
              </div>
              <span className="text-xs font-semibold text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                {cinema.city}
              </span>
            </div>

            {/* Showtime Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cShowtimes.map((st) => (
                <Link
                  key={st._id}
                  to={`/seats/${st._id}`}
                  className="group flex flex-col p-3 rounded-xl bg-neutral-950 hover:bg-brand-600 border border-neutral-800 hover:border-brand-500 transition-all text-center"
                >
                  <span className="text-sm font-extrabold text-white group-hover:text-white">
                    {formatTimeVN(st.startTime)}
                  </span>
                  <span className="text-[11px] text-neutral-400 group-hover:text-white/90">
                    {st.screenId?.name || 'Phòng chiếu'}
                  </span>
                  <span className="text-[10px] text-amber-400 group-hover:text-amber-200 font-semibold mt-1">
                    {formatVND(st.basePrice)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
