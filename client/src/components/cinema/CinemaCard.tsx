import React from 'react';
import { Link } from 'react-router-dom';
import { Cinema } from '../../types';
import { MapPin, Phone, Sparkles } from 'lucide-react';

interface CinemaCardProps {
  cinema: Cinema;
}

export const CinemaCard: React.FC<CinemaCardProps> = ({ cinema }) => {
  return (
    <div className="group bg-neutral-900/80 rounded-2xl overflow-hidden border border-neutral-800 hover:border-brand-500/50 transition duration-300 flex flex-col justify-between shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
        <img
          src={cinema.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'}
          alt={cinema.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
          {cinema.city}
        </div>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-brand-400 transition">
            {cinema.name}
          </h3>
          <div className="flex items-start gap-2 text-xs text-neutral-400">
            <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{cinema.address}</span>
          </div>
          {cinema.hotline && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
              <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Hotline: {cinema.hotline}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-neutral-800">
          {cinema.facilities && cinema.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cinema.facilities.map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950 text-neutral-300 border border-neutral-800"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          <Link
            to={`/showtimes?cinemaId=${cinema._id}`}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-glow-red"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xem Lịch Chiếu Tại Rạp Này</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
