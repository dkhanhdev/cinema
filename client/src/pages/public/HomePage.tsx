import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Movie, Cinema, Showtime } from '../../types';
import { movieApi, cinemaApi, showtimeApi } from '../../api';
import { MovieCard } from '../../components/movie/MovieCard';
import { TrailerModal } from '../../components/common/TrailerModal';
import { Play, Ticket, Sparkles, Search, Shield, Zap, Award, Film, Calendar, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { getTmdbImageUrl, handleImageError } from '../../utils/image';

export const HomePage: React.FC = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick booking state
  const [qbMovie, setQbMovie] = useState('');
  const [qbCinema, setQbCinema] = useState('');
  const [qbShowtimes, setQbShowtimes] = useState<Showtime[]>([]);
  const [qbSelectedShowtime, setQbSelectedShowtime] = useState('');

  // Hero Carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

  const navigate = useNavigate();

  const fetchMoviesData = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    console.log('[FRONTEND] Fetching /api/movies/now-playing');

    try {
      const [npRes, ucRes, cinemasRes] = await Promise.allSettled([
        movieApi.getNowPlaying(1),
        movieApi.getUpcoming(1),
        cinemaApi.getAll(),
      ]);

      if (npRes.status === 'fulfilled') {
        const resData = npRes.value as any;
        const npData = resData.movies || resData.data || [];
        setNowPlayingMovies(npData);

        npData.forEach((m: any) => {
          console.log(`[FRONTEND] Received movie ID: ${m.tmdbId || m.id || m._id} | Title: "${m.title}"`);
        });
      } else {
        console.error('[FRONTEND] Now playing fetch error:', npRes.reason);
        setErrorMsg('Không thể tải dữ liệu phim.');
      }

      if (ucRes.status === 'fulfilled') {
        const resData = ucRes.value as any;
        const ucData = resData.movies || resData.data || [];
        setUpcomingMovies(ucData);
      }

      if (cinemasRes.status === 'fulfilled') {
        setCinemas((cinemasRes.value as any).data || []);
      }
    } catch (err: any) {
      console.error('[FRONTEND] Fetch data failed:', err);
      setErrorMsg('Không thể tải dữ liệu phim.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, []);

  // Fetch showtimes for quick booking widget
  useEffect(() => {
    if (qbMovie && qbCinema) {
      showtimeApi.getAll({ movieId: qbMovie, cinemaId: qbCinema }).then((res: any) => {
        setQbShowtimes(res.data || []);
        if (res.data && res.data.length > 0) {
          setQbSelectedShowtime(res.data[0]._id);
        } else {
          setQbSelectedShowtime('');
        }
      });
    } else {
      setQbShowtimes([]);
      setQbSelectedShowtime('');
    }
  }, [qbMovie, qbCinema]);

  const displayedMovies = activeTab === 'NOW_SHOWING' ? nowPlayingMovies : upcomingMovies;
  const featuredHeroes = nowPlayingMovies.slice(0, 4);
  const currentHero = featuredHeroes[heroIndex] || nowPlayingMovies[0] || displayedMovies[0];

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (qbSelectedShowtime) {
      navigate(`/booking/showtimes/${qbSelectedShowtime}`);
    }
  };

  // Filter movies
  const genresList = ['ALL', 'Hành Động', 'Tâm Lý', 'Hài Hước', 'Khoa Học Viễn Tưởng', 'Gia Đình', 'Hoạt Hình', 'Kinh Dị'];

  const filteredMovies = displayedMovies.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.director?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre =
      selectedGenre === 'ALL' ||
      m.genres?.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()));
    return matchSearch && matchGenre;
  });

  return (
    <div className="space-y-16">
      {/* 1. Hero Banner Carousel */}
      {currentHero && (
        <div className="relative w-full h-[580px] lg:h-[640px] overflow-hidden -mt-6">
          <div className="absolute inset-0">
            <img
              src={getTmdbImageUrl(currentHero.backdropUrl || currentHero.posterUrl, 'w1280', true)}
              alt={currentHero.title}
              onError={(e) => handleImageError(e, true)}
              className="w-full h-full object-cover object-center animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent w-full lg:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-2xl lg:max-w-3xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-brand-600/90 text-white text-xs font-extrabold uppercase rounded-lg shadow-glow-red tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  TMDB DIRECT (region=VN)
                </span>
                <span className="px-2.5 py-1 bg-neutral-900/80 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg backdrop-blur-md">
                  ★ {currentHero.voteAverage?.toFixed(1) || '8.0'} / 10
                </span>
                <span className="px-2 py-1 bg-neutral-900/80 text-neutral-300 border border-neutral-700 text-xs font-semibold rounded-lg">
                  {currentHero.ageRating || 'C13'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight glow-text-red">
                {currentHero.title}
              </h1>

              {currentHero.originalTitle && currentHero.originalTitle !== currentHero.title && (
                <p className="text-sm font-medium text-neutral-400">
                  {currentHero.originalTitle} • {currentHero.durationMin || 120} phút • {currentHero.genres?.join(', ') || 'Chiếu Rạp'}
                </p>
              )}

              <p className="text-neutral-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl">
                {currentHero.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/${currentHero._id || currentHero.tmdbId}`}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-glow-red flex items-center gap-2 transition transform hover:-translate-y-0.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Xem Lịch Chiếu</span>
                </Link>

                {currentHero.trailerUrl && (
                  <button
                    onClick={() => setTrailerMovie(currentHero)}
                    className="px-5 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl border border-neutral-700 backdrop-blur-md flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Xem Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {featuredHeroes.length > 1 && (
              <div className="absolute bottom-6 left-4 sm:left-8 flex items-center gap-2">
                {featuredHeroes.map((m, idx) => (
                  <button
                    key={m._id || m.tmdbId || idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === heroIndex ? 'w-8 bg-brand-500 shadow-glow-red' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Quick Booking Bar Widget */}
        <div className="relative -mt-10 z-20 bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-2xl">
          <form onSubmit={handleQuickBook} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-brand-500" />
                1. Chọn Phim
              </label>
              <select
                value={qbMovie}
                onChange={(e) => setQbMovie(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="">-- Chọn phim đang chiếu --</option>
                {nowPlayingMovies.map((m) => (
                  <option key={m._id || m.tmdbId} value={m._id || m.tmdbId}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                2. Chọn Rạp
              </label>
              <select
                value={qbCinema}
                onChange={(e) => setQbCinema(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="">-- Chọn cụm rạp --</option>
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                3. Chọn Suất Chiếu
              </label>
              <select
                value={qbSelectedShowtime}
                onChange={(e) => setQbSelectedShowtime(e.target.value)}
                disabled={qbShowtimes.length === 0}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition disabled:opacity-50"
              >
                {qbShowtimes.length === 0 ? (
                  <option value="">Chưa có suất chiếu</option>
                ) : (
                  qbShowtimes.map((st) => (
                    <option key={st._id} value={st._id}>
                      {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {st.screenId?.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="pt-2 sm:pt-5">
              <button
                type="submit"
                disabled={!qbSelectedShowtime}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-glow-red transition flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Đặt Ghế Ngay</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. Movies Showcase Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('NOW_SHOWING')}
                className={`text-lg sm:text-xl font-extrabold pb-1 transition relative ${
                  activeTab === 'NOW_SHOWING'
                    ? 'text-white after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-brand-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Phim Đang Chiếu ({nowPlayingMovies.length})
              </button>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => setActiveTab('COMING_SOON')}
                className={`text-lg sm:text-xl font-extrabold pb-1 transition relative ${
                  activeTab === 'COMING_SOON'
                    ? 'text-white after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-brand-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Phim Sắp Chiếu ({upcomingMovies.length})
              </button>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm phim theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genresList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedGenre === g
                    ? 'bg-brand-600 text-white shadow-glow-red'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {g === 'ALL' ? 'Tất cả thể loại' : g}
              </button>
            ))}
          </div>

          {/* Error State (Zero Mock Fallback) */}
          {errorMsg && (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-rose-300">{errorMsg}</p>
              <button
                onClick={fetchMoviesData}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử Lại</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="aspect-[2/3] rounded-2xl bg-neutral-900 animate-pulse" />
              ))}
            </div>
          ) : filteredMovies.length === 0 && !errorMsg ? (
            <div className="py-16 text-center text-neutral-500 space-y-2">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Không tìm thấy bộ phim nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie._id || movie.tmdbId} movie={movie} />
              ))}
            </div>
          )}
        </div>

        {/* 4. Experience Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Giữ Ghế Realtime Không Tranh Chấp</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hệ thống WebSocket Socket.IO đồng bộ hóa ghế ngồi thời gian thực, giữ chỗ tức thì trong 5 phút cho đến khi bạn thanh toán.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Chuẩn Chiếu IMAX Laser & Dolby Atmos</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Màn hình khổng lồ độ phân giải 4K cùng hệ thống âm thanh vòm đa chiều mang lại cảm giác đắm chìm trọn vẹn trong từng thước phim.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Vé Điện Tử QR Check-in Siêu Tốc</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Không cần in vé giấy, chỉ cần mở mã QR bảo mật trên điện thoại để nhân viên rạp quét qua cổng trong 1 giây.
            </p>
          </div>
        </div>
      </div>

      {trailerMovie && (
        <TrailerModal
          isOpen={!!trailerMovie}
          onClose={() => setTrailerMovie(null)}
          trailerUrl={trailerMovie.trailerUrl}
          movieTitle={trailerMovie.title}
        />
      )}
    </div>
  );
};
