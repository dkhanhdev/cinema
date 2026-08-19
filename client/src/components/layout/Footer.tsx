import React from 'react';
import { Film, Sparkles, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 text-neutral-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-glow-red">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                CINE<span className="text-brand-500">BOOK</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hệ thống rạp chiếu phim kỹ thuật số chuẩn quốc tế với trải nghiệm âm thanh sống động Dolby Atmos và hình ảnh IMAX Laser siêu thực.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Realtime Seat Booking Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Khám phá</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/movies?status=NOW_SHOWING" className="hover:text-brand-500 transition">Phim Đang Chiếu</Link></li>
              <li><Link to="/movies?status=COMING_SOON" className="hover:text-brand-500 transition">Phim Sắp Chiếu</Link></li>
              <li><Link to="/cinemas" className="hover:text-brand-500 transition">Cụm Rạp Toàn Quốc</Link></li>
              <li><Link to="/my-bookings" className="hover:text-brand-500 transition">Tra Cứu Vé Đã Đặt</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Chính sách & Hỗ trợ</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="hover:text-white transition cursor-pointer">Điều khoản sử dụng</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Chính sách bảo mật thông tin</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Quy định đổi trả vé</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Câu hỏi thường gặp (FAQ)</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Liên hệ & Tổng đài</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>Vincom Center Landmark 81, 720A Điện Biên Phủ, Q. Bình Thạnh, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="font-semibold text-white">1900 6868 (8:00 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>support@cinebook.com</span>
              </div>
              <div className="pt-2 flex items-center gap-2 text-emerald-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Thanh toán bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 CineBook Media Inc. All rights reserved.</p>
          <p>Powered by React, TypeScript, Node.js, Socket.IO & TMDB API</p>
        </div>
      </div>
    </footer>
  );
};
