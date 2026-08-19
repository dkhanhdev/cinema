import React from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl?: string;
  movieTitle?: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerUrl,
  movieTitle,
}) => {
  if (!isOpen || !trailerUrl) return null;

  // Extract YouTube ID
  let videoId = '';
  if (trailerUrl.includes('v=')) {
    videoId = trailerUrl.split('v=')[1]?.split('&')[0];
  } else if (trailerUrl.includes('youtu.be/')) {
    videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
  } else if (trailerUrl.includes('embed/')) {
    videoId = trailerUrl.split('embed/')[1]?.split('?')[0];
  }

  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
    : trailerUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <h3 className="text-lg font-bold text-white truncate pr-4">
            🎬 Trailer: {movieTitle || 'Xem Trailer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-black">
          {videoId ? (
            <iframe
              src={embedUrl}
              title={movieTitle || 'Trailer'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
              Không thể tải video trailer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
