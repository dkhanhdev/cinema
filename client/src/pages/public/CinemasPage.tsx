import React, { useEffect, useState } from 'react';
import { Cinema } from '../../types';
import { cinemaApi } from '../../api';
import { MapPin, Phone, Sparkles, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CinemasPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cinemaApi
      .getAll()
      .then((res: any) => {
        setCinemas(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const cities = ['ALL', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];

  const filteredCinemas = cinemas.filter((c) => {
    if (selectedCity === 'ALL') return true;
    return c.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Film className="w-7 h-7 text-brand-500" />
          Hệ Thống Cụm Rạp CineBook
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Trải nghiệm điện ảnh đỉnh cao tại tất cả các cụm rạp trên toàn quốc.
        </p>
      </div>

      {/* City Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCity === city
                ? 'bg-brand-600 text-white shadow-glow-red'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {city === 'ALL' ? 'Tất cả khu vực' : city}
          </button>
        ))}
      </div>

      {/* Cinemas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="bg-neutral-900/80 rounded-2xl overflow-hidden border border-neutral-800 hover:border-brand-500/50 transition duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={cinema.image}
                  alt={cinema.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                  {cinema.city}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{cinema.name}</h3>
                  <div className="flex items-start gap-2 text-xs text-neutral-400">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>{cinema.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                    <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span>Hotline: {cinema.hotline}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cinema.facilities?.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/movies?status=NOW_SHOWING`}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-glow-red"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xem Lịch Chiếu Tại Rạp Này</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
