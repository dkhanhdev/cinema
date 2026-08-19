import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Film, User, LogOut, Ticket, ShieldCheck, QrCode, LayoutDashboard, Menu, X, Sparkles, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#07070b]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-glow-red group-hover:scale-105 transition transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              CINE<span className="text-brand-500">BOOK</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase -mt-1">
              Cinematic Experience
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            Trang Chủ
          </Link>
          <Link
            to="/movies"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/movies')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            Phim Chiếu Rạp
          </Link>
          <Link
            to="/showtimes"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/showtimes')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            Lịch Chiếu
          </Link>
          <Link
            to="/cinemas"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isActive('/cinemas')
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            Cụm Rạp
          </Link>
        </nav>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-3">
          {/* Staff QR Scanner Button */}
          {isStaff && (
            <Link
              to="/staff/checkin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-xl text-xs font-semibold transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Staff Check-in</span>
            </Link>
          )}

          {/* Admin Dashboard Button */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 rounded-xl text-xs font-semibold transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
          )}

          {/* User Account / Auth CTA */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-brand-500/50 bg-neutral-900 border border-neutral-800 transition"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden lg:block text-xs font-medium text-neutral-200 pr-1 truncate max-w-[120px]">
                  {user.fullName}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                    <p className="text-xs text-neutral-400 font-medium">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-800/70 rounded-xl transition"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    to="/tickets"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-800/70 rounded-xl transition"
                  >
                    <Ticket className="w-4 h-4 text-brand-500" />
                    <span>Vé của tôi (Lịch sử)</span>
                  </Link>

                  {isStaff && (
                    <Link
                      to="/staff/checkin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Quét QR Check-in</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-950/40 rounded-xl transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-neutral-800/80"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-red rounded-xl transition"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-[#07070b] px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Trang Chủ
          </Link>
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Phim Chiếu Rạp
          </Link>
          <Link
            to="/showtimes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Lịch Chiếu
          </Link>
          <Link
            to="/cinemas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Cụm Rạp
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Hồ Sơ Cá Nhân
              </Link>
              <Link
                to="/tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-brand-400 hover:bg-neutral-800"
              >
                Vé Của Tôi
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
