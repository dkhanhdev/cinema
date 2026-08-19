import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Showtime } from '../../types';
import { movieApi, showtimeApi } from '../../api';
import { TrailerModal } from '../../components/common/TrailerModal';
import { Star, Clock, Calendar, Play, MapPin, Film, AlertCircle } from 'lucide-react';
import { formatDateVN, formatTimeVN, formatVND } from '../../utils/format';
import { getTmdbImageUrl, handleImageError } from '../../utils/image';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any | null>(null);
  const [credits, setCredits] = useState<{ director: string; cast: any[] }>({ director: '', cast: [] });
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 7-day date window starting from today
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
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);

    // 1. Fetch TMDB Movie Detail
    const pDetail = movieApi.getTmdbDetail(id).then((res) => {
      const data = res.data?.data || res.data;
      setMovie(data);
      console.log(`[MovieDetail] TMDB ID: ${id} | Title: "${data.title}"`);
      return data;
    });

    // 2. Fetch TMDB Videos / Trailer
    const pVideos = movieApi.getTmdbVideos(id).then((res) => {
      const trailer = res.data?.data?.selectedTrailer || null;
      setTrailerUrl(trailer);
      console.log(`[Trailer] TMDB ID: ${id} | Trailer URL: ${trailer || 'None'}`);
    }).catch(() => setTrailerUrl(null));

    // 3. Fetch TMDB Credits
    const pCredits = movieApi.getTmdbCredits(id).then((res) => {
      const c = res.data?.data || { director: '', cast: [] };
      setCredits(c);
    }).catch(() => setCredits({ director: '', cast: [] }));

    // 4. Fetch CineBook MongoDB Showtimes for this movieTmdbId & activeDate
    const pShowtimes = showtimeApi.getAll({ movieTmdbId: id, date: activeDate }).then((res) => {
      const list = res.data?.data || [];
      setShowtimes(list);
      console.log(`[Showtime] Movie TMDB ID: ${id} | Date VN: ${activeDate} | Count: ${list.length}`);
    }).catch(() => setShowtimes([]));

    Promise.all([pDetail, pVideos, pCredits, pShowtimes])
      .catch((err) => {
        console.error(`[MovieDetailPage] Error fetching data:`, err);
        setErrorMsg(err.response?.data?.error || err.message || 'Không thể tải dữ liệu phim từ TMDB.');
      })
      .finally(() => setIsLoading(false));
  }, [id, activeDate]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        <p className="text-sm text-neutral-400">Đang tải thông tin phim từ TMDB...</p>
      </div>
    );
  }

  if (errorMsg || !movie) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">
          {errorMsg || 'Không thể tải dữ liệu phim từ TMDB.'}
        </h2>
        <p className="text-sm text-neutral-400 mb-4">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl"
          >
            Thử lại
          </button>
          <Link to="/" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Group showtimes by Cinema
  const cinemaMap = new Map<string, { cinema: any; showtimes: Showtime[] }>();
  showtimes.forEach((st) => {
    const cId = (st.cinemaId as any)?._id || 'unknown';
    const existing = cinemaMap.get(cId) || { cinema: st.cinemaId, showtimes: [] };
    existing.showtimes.push(st);
    cinemaMap.set(cId, existing);
  });

  const backdropSrc = getTmdbImageUrl(movie.backdropUrl || movie.backdropPath || movie.posterUrl, 'w1280', true);
  const posterSrc = getTmdbImageUrl(movie.posterUrl || movie.posterPath, 'w500');

  return (
    <div className="space-y-12">
      {/* 1. Backdrop Banner Header */}
      <div className="relative w-full h-[420px] lg:h-[500px] overflow-hidden -mt-6">
        <img
          src={backdropSrc}
          alt={movie.title}
          onError={(e) => handleImageError(e, true)}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[2px]" />
      </div>

      {/* 2. Movie Info Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="w-56 sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/80 bg-neutral-900 mx-auto md:mx-0 aspect-[2/3]">
            <img
              src={posterSrc}
              alt={movie.title}
              onError={(e) => handleImageError(e, false)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-brand-600/90 text-white text-xs font-extrabold uppercase rounded-lg shadow-glow-red">
                {movie.status === 'COMING_SOON' ? 'Sắp Chiếu' : 'Đang Chiếu'}
              </span>
              <span className="px-2.5 py-1 bg-neutral-900/80 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {(movie.voteAverage || 8.0).toFixed(1)} / 10
              </span>
              <span className="px-2.5 py-1 bg-neutral-900/80 text-neutral-300 border border-neutral-700 text-xs font-semibold rounded-lg">
                Độ tuổi: {movie.ageRating || 'C13'}
              </span>
              <span className="px-2.5 py-1 bg-neutral-900/80 text-neutral-300 border border-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {movie.durationMin || 120} phút
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm font-medium text-neutral-400 -mt-2">
                Tên gốc: {movie.originalTitle}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres?.map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-full text-xs font-medium"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Crew & Cast Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-neutral-800/80 text-xs text-neutral-300">
              <div>
                <span className="text-neutral-500 block mb-0.5">Đạo diễn:</span>
                <span className="font-semibold text-white">{credits.director || movie.director || 'Đang cập nhật'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-0.5">Khởi chiếu:</span>
                <span className="font-semibold text-white">{formatDateVN(movie.releaseDate)}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-neutral-500 block mb-0.5">Diễn viên chính:</span>
                <span className="font-semibold text-white">
                  {credits.cast.length > 0
                    ? credits.cast.slice(0, 5).map((c) => c.name).join(', ')
                    : movie.cast?.join(', ') || 'Đang cập nhật'}
                </span>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-400 mb-1.5">
                Nội dung phim
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {movie.synopsis || movie.overview}
              </p>
            </div>

            {/* Trailer Action */}
            <div className="pt-2 flex items-center gap-3">
              {trailerUrl ? (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 border border-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-glow-red"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Xem Trailer Phim</span>
                </button>
              ) : (
                <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs rounded-xl">
                  Trailer chưa có
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Showtime Scheduling Section */}
        <div className="mt-16 space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-500" />
              Lịch Chiếu & Mua Vé
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Chọn ngày và suất chiếu phù hợp để tiếp tục chọn ghế trực tiếp tại rạp.
            </p>
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

          {/* Showtimes by Cinema */}
          {cinemaMap.size > 0 ? (
            <div className="space-y-6">
              {Array.from(cinemaMap.values()).map(({ cinema, showtimes }) => (
                <div
                  key={cinema?._id || Math.random()}
                  className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4"
                >
                  {/* Cinema Header */}
                  <div className="flex items-start justify-between border-b border-neutral-800/80 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        {cinema?.name || 'Rạp CineBook'}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{cinema?.address || ''}</p>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                      {cinema?.city || 'Toàn Quốc'}
                    </span>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="flex flex-wrap gap-3">
                    {showtimes.map((st) => (
                      <Link
                        key={st._id}
                        to={`/booking/showtimes/${st._id}`}
                        className="group flex flex-col p-3 rounded-xl bg-neutral-950 hover:bg-brand-600 border border-neutral-800 hover:border-brand-500 transition-all text-center min-w-[120px]"
                      >
                        <span className="text-sm font-extrabold text-white group-hover:text-white">
                          {formatTimeVN(st.startTime)}
                        </span>
                        <span className="text-[11px] text-neutral-400 group-hover:text-white/90">
                          {st.screenId?.name || 'Phòng chiếu'}
                        </span>
                        <span className="text-[10px] text-amber-400 group-hover:text-amber-200 font-semibold mt-1">
                          Từ {formatVND(st.basePrice)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center text-neutral-400">
              <Film className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              Chưa có suất chiếu nào cho ngày này tại hệ thống CineBook.
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          trailerUrl={trailerUrl}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
};
