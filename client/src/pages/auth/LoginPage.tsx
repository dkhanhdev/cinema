import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { Film, Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Đăng nhập thành công! Chào mừng bạn trở lại.');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-glow-red">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">
              CINE<span className="text-brand-500">BOOK</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs text-neutral-400">
            Trải nghiệm đặt vé siêu tốc và nhận đặc quyền thành viên CineBook
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                Địa chỉ Email
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-500" />
                  Mật khẩu
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-glow-red flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block text-center">
              ⚡ Đăng nhập nhanh tài khoản mẫu:
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@cinebook.com', 'admin123')}
                className="p-2 rounded-xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold transition text-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff@cinebook.com', 'staff123')}
                className="p-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold transition text-center"
              >
                🎫 Staff QR
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user@cinebook.com', 'user123')}
                className="p-2 rounded-xl bg-brand-950/30 hover:bg-brand-950/60 border border-brand-500/40 text-brand-300 font-bold transition text-center"
              >
                👤 User Demo
              </button>
            </div>
          </div>
        </div>

        {/* Register Link Footer */}
        <p className="text-center text-xs text-neutral-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-brand-400 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
