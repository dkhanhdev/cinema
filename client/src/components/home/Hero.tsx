import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Movie, MovieStatus } from '../../types';
import { Play, Ticket, Star, Clock, Sparkles } from 'lucide-react';
import { TrailerModal } from '../common/TrailerModal';

interface HeroProps {
  movies: Movie[];
}

export const Hero: React.FC<HeroProps> = ({ movies }) => {
  const featuredMovies = movies.filter((m) => m.status === MovieStatus.NOW_SHOWING).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

  const current = featuredMovies[currentIndex] || movies[0];

  if (!current) {
    return (
      <div className="w-full h-[480px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-neutral-600 text-sm">Đang tải phim nổi bật...</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden -mt-6">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={current.backdropUrl || current.posterUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center animate-fade-in"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070b] via-[#07070b]/85 to-transparent w-full lg:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-transparent to-[#07070b]/40" />
        </div>

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-2xl lg:max-w-3xl">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-brand-600 text-white text-xs font-extrabold uppercase rounded-lg shadow-glow-red tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Bom Tấn Chiếu Rạp
              </span>
              <span className="px-2.5 py-1 bg-black/60 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg backdrop-blur-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {current.voteAverage.toFixed(1)} / 10
              </span>
              <span className="px-2.5 py-1 bg-black/60 text-neutral-300 border border-neutral-700 text-xs font-semibold rounded-lg">
                {current.ageRating}
              </span>
              <span className="px-2.5 py-1 bg-black/60 text-neutral-300 border border-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {current.durationMin} phút
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight glow-text-red">
              {current.title}
            </h1>

            {current.originalTitle && current.originalTitle !== current.title && (
              <p className="text-xs sm:text-sm font-medium text-neutral-400">
                {current.originalTitle} • {current.genres?.join(', ')}
              </p>
            )}

            <p className="text-neutral-300 text-xs sm:text-sm line-clamp-3 leading-relaxed max-w-xl">
              {current.synopsis}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/movies/${current._id}`}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-glow-red flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Ticket className="w-4 h-4" />
                <span>Đặt Vé Ngay</span>
              </Link>

              {current.trailerUrl && (
                <button
                  onClick={() => setTrailerMovie(current)}
                  className="px-5 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-neutral-700 backdrop-blur-md flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Xem Trailer</span>
                </button>
              )}
            </div>
          </div>

          {/* Dots Carousel Navigator */}
          {featuredMovies.length > 1 && (
            <div className="absolute bottom-6 left-4 sm:left-8 flex items-center gap-2">
              {featuredMovies.map((m, idx) => (
                <button
                  key={m._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-brand-500 shadow-glow-red'
                      : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
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
    </>
  );
};
