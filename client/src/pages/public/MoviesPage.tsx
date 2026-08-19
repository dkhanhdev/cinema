import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Movie } from '../../types';
import { movieApi } from '../../api';
import { MovieCard } from '../../components/movie/MovieCard';
import { Search, Filter, Film, AlertCircle, RefreshCw } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') === 'COMING_SOON' ? 'COMING_SOON' : 'NOW_SHOWING';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<'NOW_SHOWING' | 'COMING_SOON'>(initialStatus);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus === 'COMING_SOON' && status !== 'COMING_SOON') {
      setStatus('COMING_SOON');
    } else if (urlStatus === 'NOW_SHOWING' && status !== 'NOW_SHOWING') {
      setStatus('NOW_SHOWING');
    }
  }, [searchParams]);

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    console.log(`[MoviePage] Fetching /api/movies/${status === 'NOW_SHOWING' ? 'now-playing' : 'upcoming'}`);

    try {
      let res: any;
      if (status === 'NOW_SHOWING') {
        res = await movieApi.getNowPlaying(1);
      } else {
        res = await movieApi.getUpcoming(1);
      }
      const data = res.data?.movies || res.data?.data || res.data || [];
      console.log(`[MoviePage] Received ${data.length} movies from TMDB API`);
      setMovies(data);
    } catch (err: any) {
      console.error('[MoviePage] Fetch failed:', err);
      setErrorMsg(err.response?.data?.error || 'Không thể tải danh sách phim từ TMDB API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [status]);

  const handleTabChange = (newStatus: 'NOW_SHOWING' | 'COMING_SOON') => {
    setStatus(newStatus);
    setSearchParams({ status: newStatus });
  };

  const genresList = ['ALL', 'Hành Động', 'Tâm Lý', 'Hài Hước', 'Khoa Học Viễn Tưởng', 'Gia Đình', 'Hoạt Hình', 'Kinh Dị'];

  const filteredMovies = movies.filter((m) => {
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.originalTitle?.toLowerCase().includes(search.toLowerCase());
    const matchGenre =
      genre === 'ALL' || m.genres?.some((g) => g.toLowerCase().includes(genre.toLowerCase()));
    return matchSearch && matchGenre;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4 animate-fade-in">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleTabChange('NOW_SHOWING')}
            className={`text-xl sm:text-2xl font-extrabold pb-1 transition relative ${
              status === 'NOW_SHOWING'
                ? 'text-white after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-brand-500'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Phim Đang Chiếu
          </button>
          <span className="text-neutral-700">|</span>
          <button
            onClick={() => handleTabChange('COMING_SOON')}
            className={`text-xl sm:text-2xl font-extrabold pb-1 transition relative ${
              status === 'COMING_SOON'
                ? 'text-white after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-brand-500'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Phim Sắp Chiếu
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm phim theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs text-neutral-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Thể loại:
        </span>
        {genresList.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              genre === g
                ? 'bg-brand-600 text-white shadow-glow-red'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {g === 'ALL' ? 'Tất cả' : g}
          </button>
        ))}
      </div>

      {/* Error State on TMDB Failure */}
      {errorMsg && (
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-rose-300">{errorMsg}</p>
          <button
            onClick={fetchMovies}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử Lại</span>
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="aspect-[2/3] rounded-2xl bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : filteredMovies.length === 0 && !errorMsg ? (
        <div className="py-20 text-center text-neutral-500 space-y-2">
          <Film className="w-12 h-12 mx-auto text-neutral-700" />
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
  );
};
