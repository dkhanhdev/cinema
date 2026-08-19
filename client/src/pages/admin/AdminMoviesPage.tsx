import React, { useEffect, useState } from 'react';
import { movieApi, SyncTmdbResponse } from '../../api';
import { Movie, MovieStatus } from '../../types';
import { useToastStore } from '../../stores/useToastStore';
import { formatVND, formatDateVN } from '../../utils/format';
import {
  Film,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  Star,
  Globe,
} from 'lucide-react';

export const AdminMoviesPage: React.FC = () => {
  const toast = useToastStore();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncTmdbResponse | null>(null);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const res: any = await movieApi.getAll({ limit: 50 });
      setMovies(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách phim');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSyncTmdb = async () => {
    setIsSyncing(true);
    try {
      const res: any = await movieApi.syncTmdb();
      setSyncResult(res.data);
      toast.success('Đồng bộ dữ liệu phim từ TMDB thành công!');
      fetchMovies();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đồng bộ TMDB');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa/lưu trữ bộ phim này?')) return;
    try {
      await movieApi.delete(id);
      toast.success('Thao tác xóa phim thành công!');
      fetchMovies();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa phim');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5 mb-1">
            <Film className="w-4 h-4" />
            TMDB Auto Sync & Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quản Lý Phim & Đồng Bộ TMDB
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Dữ liệu phim được đồng bộ tự động từ The Movie Database (TMDB) với ưu tiên thị trường Việt Nam (region=VN).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncTmdb}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-glow-red transition transform hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ TMDB...' : 'Đồng bộ phim từ TMDB'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 shadow-xl space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Kết Quả Đồng Bộ TMDB Mới Nhất
            </h3>
            <span className="text-[11px] text-neutral-400">
              Thời gian: {new Date(syncResult.lastSyncTime).toLocaleTimeString('vi-VN')} ({formatDateVN(syncResult.lastSyncTime)})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Thêm mới:</span>
              <span className="font-extrabold text-emerald-400 text-sm">+{syncResult.addedCount} phim</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Cập nhật:</span>
              <span className="font-extrabold text-blue-400 text-sm">{syncResult.updatedCount} phim</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Đổi trạng thái:</span>
              <span className="font-extrabold text-amber-400 text-sm">{syncResult.statusChangedCount} phim</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Tổng đồng bộ:</span>
              <span className="font-extrabold text-white text-sm">{syncResult.totalSynced} phim</span>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="group rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between shadow-xl transition hover:border-brand-500/50"
          >
            <div className="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                    movie.status === MovieStatus.NOW_SHOWING
                      ? 'bg-brand-600 text-white shadow-glow-red'
                      : movie.status === MovieStatus.COMING_SOON
                      ? 'bg-amber-500/90 text-black font-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {movie.status === MovieStatus.NOW_SHOWING
                    ? 'Đang chiếu'
                    : movie.status === MovieStatus.COMING_SOON
                    ? 'Sắp chiếu'
                    : 'Đã kết thúc'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white border border-white/10 flex items-center gap-1 w-fit">
                  <Globe className="w-3 h-3 text-brand-400" />
                  VN
                </span>
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400" />
                {movie.voteAverage.toFixed(1)}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
              <div>
                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand-400 transition">
                  {movie.title}
                </h3>
                {movie.originalTitle && (
                  <p className="text-[11px] text-neutral-400 truncate">{movie.originalTitle}</p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                  <span>{movie.durationMin} phút</span>
                  <span>•</span>
                  <span>{movie.ageRating}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">
                  TMDB ID: {movie.tmdbId || 'N/A'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                    title="Xóa phim"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
