import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { authApi } from '../../api';
import { User, Mail, Phone, ShieldCheck, Ticket, LogOut, Save, QrCode, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout, isStaff, isAdmin } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res: any = await authApi.updateMe({ fullName, phone, avatar });
      updateUser(res.data);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất tài khoản.');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Link to="/login" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Vui lòng đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
          alt={user.fullName}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-brand-500 shadow-glow-red"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl font-extrabold text-white">{user.fullName}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {user.role}
            </span>
          </div>

          <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-500" />
            {user.email}
          </p>

          <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
            <Link
              to="/tickets"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <Ticket className="w-3.5 h-3.5 text-brand-500" />
              <span>Vé Của Tôi</span>
            </Link>

            {isStaff && (
              <Link
                to="/staff/checkin"
                className="px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Staff Check-in</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
          <User className="w-5 h-5 text-brand-500" />
          Chỉnh Sửa Thông Tin Cá Nhân
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Họ và Tên *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Số Điện Thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-semibold">URL Ảnh Đại Diện (Avatar)</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-glow-red flex items-center gap-2 transition"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
