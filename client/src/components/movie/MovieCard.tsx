import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Movie, MovieStatus } from '../../types';
import { Star, Clock, Play, Ticket } from 'lucide-react';
import { TrailerModal } from '../common/TrailerModal';
import { getTmdbImageUrl, handleImageError } from '../../utils/image';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  // Determine TMDB Movie Identifier
  const movieId = (movie as any).tmdbId || (movie as any).id || movie._id;

  // Determine age badge color
  let ageBadgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (movie.ageRating === 'C18') {
    ageBadgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  } else if (movie.ageRating === 'C16' || movie.ageRating === 'C13') {
    ageBadgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  }

  const posterSrc = getTmdbImageUrl(movie.posterUrl || (movie as any).posterPath, 'w500');

  return (
    <>
      <div className="group relative bg-neutral-900/60 rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-brand-500/40 hover:shadow-glow-red transition-all duration-300 flex flex-col h-full">
        {/* Poster Wrapper with fixed aspect-ratio */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
          <img
            src={posterSrc}
            alt={movie.title}
            onError={(e) => handleImageError(e, false)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-90 transition" />

          {/* Badges on Top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border ${ageBadgeBg} backdrop-blur-md`}>
              {movie.ageRating || 'C13'}
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{(movie.voteAverage || 8.0).toFixed(1)}</span>
            </div>
          </div>

          {/* Hover Overlay Action Buttons */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 opacity-0 group-hover:opacity-100 bg-neutral-950/70 backdrop-blur-xs transition duration-300">
            {movie.trailerUrl && (
              <button
                onClick={() => setShowTrailer(true)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-brand-600 border border-white/20 hover:border-brand-500 flex items-center justify-center text-white transition transform hover:scale-110 shadow-lg"
                title="Xem Trailer"
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </button>
            )}

            <Link
              to={`/movies/${movieId}`}
              className="w-full max-w-[180px] py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-red flex items-center justify-center gap-1.5 transition transform hover:-translate-y-0.5"
            >
              <Ticket className="w-4 h-4" />
              <span>{movie.status === MovieStatus.NOW_SHOWING ? 'Đặt Vé Ngay' : 'Xem Chi Tiết'}</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {movie.durationMin || 120} phút
              </span>
              <span>•</span>
              <span className="truncate">{movie.genres?.slice(0, 2).join(', ') || 'Chiếu Rạp'}</span>
            </div>

            <Link to={`/movies/${movieId}`}>
              <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition line-clamp-1">
                {movie.title}
              </h3>
            </Link>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                {movie.originalTitle}
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">
              {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
            </span>
            <Link
              to={`/movies/${movieId}`}
              className="text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              Chi tiết →
            </Link>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </>
  );
};
