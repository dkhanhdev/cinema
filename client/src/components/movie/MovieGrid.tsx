import React from 'react';
import { Movie } from '../../types';
import { MovieCard } from './MovieCard';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'Không tìm thấy bộ phim nào phù hợp.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="space-y-3 rounded-2xl bg-neutral-900/60 p-3 border border-neutral-800 animate-pulse">
            <div className="aspect-[2/3] w-full rounded-xl bg-neutral-800" />
            <div className="h-4 w-3/4 rounded bg-neutral-800" />
            <div className="h-3 w-1/2 rounded bg-neutral-800/60" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center rounded-2xl bg-rose-950/20 border border-rose-500/30 p-8 space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Đã xảy ra lỗi khi tải dữ liệu</h3>
        <p className="text-xs text-neutral-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-8 space-y-3">
        <Film className="w-12 h-12 text-neutral-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Danh sách phim trống</h3>
        <p className="text-xs text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie._id || movie.tmdbId} movie={movie} />
      ))}
    </div>
  );
};
