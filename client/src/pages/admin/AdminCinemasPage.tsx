import React, { useEffect, useState } from 'react';
import { Cinema } from '../../types';
import { cinemaApi } from '../../api';
import { useToastStore } from '../../stores/useToastStore';
import { Building, Plus, Trash2, X, MapPin, Phone, Grid } from 'lucide-react';

export const AdminCinemasPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cinema modal
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    city: 'Hồ Chí Minh',
    address: '',
    hotline: '1900 6868',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    facilities: ['IMAX Laser', 'Dolby Atmos', 'VIP Lounge'],
  });

  // Screen modal
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [screenForm, setScreenForm] = useState({
    name: 'Phòng Chiếu 03 - Laser 4K',
    screenType: '2D',
    totalRows: 8,
    totalCols: 12,
  });

  const toast = useToastStore();

  const fetchCinemas = async () => {
    setIsLoading(true);
    try {
      const res: any = await cinemaApi.getAll();
      setCinemas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleCreateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cinemaApi.create(cinemaForm);
      toast.success('Thêm cụm rạp mới thành công');
      setShowCinemaModal(false);
      fetchCinemas();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thêm rạp');
    }
  };

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cinemaApi.createScreen(selectedCinemaId, screenForm);
      toast.success('Đã tạo phòng chiếu & sinh tự động ma trận ghế ngồi thành công!');
      setShowScreenModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo phòng chiếu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Building className="w-7 h-7 text-brand-500" />
            Quản Lý Cụm Rạp & Phòng Chiếu (Cinema & Screen Manager)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Quản lý các địa điểm rạp và cấu hình ma trận ghế tự động theo từng định dạng phòng chiếu.
          </p>
        </div>

        <button
          onClick={() => setShowCinemaModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-red flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Rạp Mới</span>
        </button>
      </div>

      {/* Cinemas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cinemas.map((cinema) => (
          <div
            key={cinema._id}
            className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white">{cinema.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 text-neutral-300 border border-neutral-800">
                  {cinema.city}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                {cinema.address}
              </p>
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                {cinema.hotline}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCinemaId(cinema._id);
                  setShowScreenModal(true);
                }}
                className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Grid className="w-3.5 h-3.5 text-brand-500" />
                <span>+ Thêm Phòng Chiếu</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cinema Modal */}
      {showCinemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Thêm Cụm Rạp Mới</h3>
              <button
                onClick={() => setShowCinemaModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCinema} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên Cụm Rạp *</label>
                <input
                  type="text"
                  required
                  value={cinemaForm.name}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                  placeholder="VD: CineBook Aeon Mall Hà Đông"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Khu vực / Thành phố *</label>
                <select
                  value={cinemaForm.city}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={cinemaForm.address}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Hotline</label>
                <input
                  type="text"
                  value={cinemaForm.hotline}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, hotline: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCinemaModal(false)}
                  className="px-5 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-red"
                >
                  Lưu Cụm Rạp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen & Auto Seat Matrix Modal */}
      {showScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Tạo Phòng Chiếu & Sơ Đồ Ghế</h3>
              <button
                onClick={() => setShowScreenModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScreen} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên Phòng Chiếu *</label>
                <input
                  type="text"
                  required
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Định dạng màn chiếu</label>
                <select
                  value={screenForm.screenType}
                  onChange={(e) => setScreenForm({ ...screenForm, screenType: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="2D">2D Tiêu chuẩn</option>
                  <option value="3D">3D RealD</option>
                  <option value="IMAX">IMAX Laser</option>
                  <option value="4DX">4DX Motion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Số hàng ghế (Rows)</label>
                  <input
                    type="number"
                    min="4"
                    max="15"
                    value={screenForm.totalRows}
                    onChange={(e) => setScreenForm({ ...screenForm, totalRows: parseInt(e.target.value, 10) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-neutral-500">VD: 8 hàng (A - H)</span>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Số ghế mỗi hàng (Cols)</label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={screenForm.totalCols}
                    onChange={(e) => setScreenForm({ ...screenForm, totalCols: parseInt(e.target.value, 10) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-neutral-500">VD: 12 ghế / hàng</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <span className="text-white font-semibold block">Quy tắc sinh ghế tự động:</span>
                <p>• Hàng A-C: Ghế Standard (Giá gốc)</p>
                <p>• Hàng D-G: Ghế VIP (+20,000đ)</p>
                <p>• Hàng cuối H: Ghế Đôi Sweetbox (+50,000đ)</p>
                <p className="text-amber-400 font-bold">Tổng ghế tự động tạo: {screenForm.totalRows * screenForm.totalCols} ghế</p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScreenModal(false)}
                  className="px-5 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-red"
                >
                  Tạo Sơ Đồ Ghế
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
