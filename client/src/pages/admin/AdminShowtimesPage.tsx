import React, { useEffect, useState } from 'react';
import { Showtime, Movie, Cinema } from '../../types';
import { showtimeApi, movieApi, cinemaApi } from '../../api';
import { useToastStore } from '../../stores/useToastStore';
import { formatVND, formatDateVN, formatTimeVN } from '../../utils/format';
import { Calendar, Plus, Trash2, X, Clock, MapPin, Film } from 'lucide-react';

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    startTime: '',
    basePrice: 90000,
  });

  const toast = useToastStore();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stRes, mRes, cRes] = await Promise.all([
        showtimeApi.getAll(),
        movieApi.getAll({ limit: 50 }),
        cinemaApi.getAll(),
      ]);
      setShowtimes((stRes as any).data || []);
      setMovies((mRes as any).data || []);
      setCinemas((cRes as any).data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch screens when cinema selected in modal
  useEffect(() => {
    if (formData.cinemaId) {
      cinemaApi.getScreens(formData.cinemaId).then((res: any) => {
        setScreens(res.data || []);
        if (res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, screenId: res.data[0]._id }));
        }
      });
    }
  }, [formData.cinemaId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy suất chiếu này?')) return;
    try {
      await showtimeApi.delete(id);
      toast.success('Hủy suất chiếu thành công');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi hủy suất chiếu');
    }
  };

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await showtimeApi.create(formData);
      toast.success('Thêm suất chiếu mới thành công!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo suất chiếu (có thể bị trùng giờ)');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-brand-500" />
            Quản Lý Suất Chiếu (Showtime Scheduling)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Lên lịch chiếu phim với thuật toán tự động ngăn chặn xung đột giờ cùng phòng.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              movieId: movies[0]?._id || '',
              cinemaId: cinemas[0]?._id || '',
              screenId: '',
              startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
              basePrice: 90000,
            });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-red flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Suất Chiếu Mới</span>
        </button>
      </div>

      {/* Showtimes Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold">
                <th className="py-3.5 px-4">Tên Phim</th>
                <th className="py-3.5 px-4">Cụm Rạp</th>
                <th className="py-3.5 px-4">Phòng Chiếu</th>
                <th className="py-3.5 px-4">Giờ Bắt Đầu</th>
                <th className="py-3.5 px-4">Giá Vé Cơ Bản</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {showtimes.map((st) => (
                <tr key={st._id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <img
                      src={st.movieId?.posterUrl}
                      alt={st.movieId?.title}
                      className="w-8 h-11 rounded object-cover"
                    />
                    <span>{st.movieId?.title}</span>
                  </td>
                  <td className="py-3 px-4">{st.cinemaId?.name}</td>
                  <td className="py-3 px-4 font-medium text-brand-400">{st.screenId?.name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {formatTimeVN(st.startTime)} ({formatDateVN(st.startTime)})
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">{formatVND(st.basePrice)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(st._id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                      title="Hủy suất chiếu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Thêm Suất Chiếu Mới</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShowtime} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Chọn Phim *</label>
                <select
                  required
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.durationMin} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Chọn Cụm Rạp *</label>
                <select
                  required
                  value={formData.cinemaId}
                  onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Chọn Phòng Chiếu *</label>
                <select
                  required
                  value={formData.screenId}
                  onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  {screens.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.screenType}) - {s.totalSeats} ghế
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Thời Gian Bắt Đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Giá Vé Cơ Bản (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value, 10) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-red"
                >
                  Tạo Suất Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
