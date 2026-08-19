import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { Film, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      await register({ fullName, email, phone, password });
      toast.success('Đăng ký tài khoản thành công! Chào mừng đến với CineBook.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-glow-red">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">
              CINE<span className="text-brand-500">BOOK</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Đăng Ký Thành Viên</h2>
          <p className="text-xs text-neutral-400">
            Tạo tài khoản để nhận điểm thưởng và đặt vé ưu tiên hàng đầu
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-500" />
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-500" />
                Số Điện Thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-500" />
                  Mật Khẩu *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-400 mb-1">
                  Nhập Lại *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Hoàn Tất Đăng Ký</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
