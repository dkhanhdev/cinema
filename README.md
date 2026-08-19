# 🎬 CineBook - Hệ Thống Đặt Vé Xem Phim Chuẩn Quốc Tế

![CineBook Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CineBook** là nền tảng đặt vé xem phim trực tuyến thời gian thực hiện đại, được xây dựng theo tiêu chuẩn **Clean Architecture** (Layered: Controller → Service → Model), giao diện **Dark Cinematic**, tích hợp cổng thanh toán mở rộng và hệ thống vé điện tử **Cryptographic QR Code**.

---

## ✨ Điểm Nổi Bật (Key Highlights)

- 🔒 **Khóa Ghế Thời Gian Thực (Realtime Seat Locking)**: Đồng bộ tức thì qua **Socket.IO**, tự động giữ ghế trong **5 phút**, chống triệt để **Race Condition & Double Booking**.
- 🎫 **Vé Điện Tử QR Bảo Mật (Cryptographic E-Ticket)**: Tự động sinh mã QR Base64 có chữ ký số HMAC-SHA256 chống làm giả vé.
- 🛡️ **Bảo Mật Phân Quyền Đa Tầng (Strict Backend RBAC)**: Quản lý 4 nhóm đối tượng `GUEST`, `USER`, `STAFF`, `ADMIN` với JWT Access Token + Refresh Token và Zod Validation.
- 🍿 **Tích Hợp TMDB Proxy An Toàn**: Toàn bộ dữ liệu phim, poster HD, backdrop, diễn viên và trailer YouTube được lấy qua Backend Proxy mà không để lộ `TMDB_API_KEY`.
- 💳 **Kiến Trúc Cổng Thanh Toán Mở Rộng (Strategy Pattern)**: Sẵn sàng cắm nối VNPay, MoMo, ZaloPay, Thẻ tín dụng và Mock Payment test.
- 📊 **Admin & Staff Portal**: Dashboard biểu đồ doanh thu 7 ngày, quản lý phòng & tự động sinh ma trận ghế (Standard, VIP, Couple), lên lịch chiếu chống trùng giờ, quản lý mã giảm giá (Coupons), và màn hình quét vé Check-in cho nhân viên.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism & Animations
- **State Management**: Zustand (Auth, Booking, Realtime Seats, Toasts)
- **Networking**: Axios + Socket.io-client
- **Icons & Effects**: Lucide React + Canvas Confetti

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose ODM (Indexes tối ưu)
- **Realtime Gateway**: Socket.IO
- **Validation**: Zod Schemas
- **Security & Auth**: JWT + bcryptjs + Helmet + CORS + Crypto HMAC-SHA256
- **QR Generation**: QRCode

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture)

```
CineBook Monorepo
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                # Axios Client & REST Services
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── common/         # Header, Footer, Toast, RoleGuard, Modal
│   │   │   ├── movie/          # MovieCard, MovieGrid
│   │   │   ├── cinema/         # CinemaCard
│   │   │   ├── showtime/       # ShowtimeSelector
│   │   │   ├── seatmap/        # SeatMap, SeatGrid (3D Curved Screen)
│   │   │   ├── booking/        # BookingSummary
│   │   │   └── ticket/         # TicketCard (Boarding Pass E-Ticket)
│   │   ├── hooks/              # useRealtimeSeats (Socket.IO Connection)
│   │   ├── pages/              # 10+ Pages (Home, Movies, Details, Cinemas, Showtimes, Seats, Checkout, Tickets, Staff, Admin)
│   │   ├── stores/             # Zustand Global Stores
│   │   └── types/              # TypeScript Shared Types & Enums
│
├── server/                     # Backend API & Socket Server (Express + Mongoose)
│   ├── src/
│   │   ├── config/             # DB & Env Configurations
│   │   ├── constants/          # UserRole, MovieStatus, SeatStatus, BookingStatus...
│   │   ├── models/             # Mongoose Models with compound indexes
│   │   ├── validators/         # Zod Validation Schemas
│   │   ├── middlewares/        # JWT Auth, RBAC Authorization, Error Handlers
│   │   ├── services/           # Business Logic Layer (Auth, Movie, TMDB, Showtime, SeatLock, Booking, Payment, Checkin, Dashboard)
│   │   ├── controllers/        # Express Request Handlers
│   │   ├── routes/             # REST API Routes (/api/v1/*)
│   │   └── sockets/            # Socket.IO Gateway (Room Management & Seat Locks)
│
├── test.js                     # Automated Full System E2E Test Suite (19 Tests)
└── package.json                # Root Concurrently Orchestrator
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án (Getting Started)

### 1. Yêu Cầu Môi Trường
- **Node.js**: `>= 18.x`
- **MongoDB**: Đang chạy tại `mongodb://127.0.0.1:27017/cinebook`

### 2. Cài Đặt Dependencies
```bash
# Cài đặt toàn bộ dependencies cho Root, Backend và Frontend
npm install
npm run install --prefix server
npm run install --prefix client
```

### 3. Cấu Hình Biến Môi Trường (Environment Variables)
- **Backend (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/cinebook
JWT_SECRET=cinebook_super_secret_jwt_key_2026_cinematic_experience
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cinebook_refresh_secret_jwt_key_2026_ultra_secure
JWT_REFRESH_EXPIRES_IN=30d
TMDB_API_KEY=
TMDB_BASE_URL=https://api.themoviedb.org/3
SEAT_HOLD_DURATION_MINUTES=5
```

- **Frontend (`client/.env`)**:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Khởi Tạo Dữ Liệu Mẫu (Seed Database)
```bash
npm run seed
```
> Script sẽ tự động nạp 6 Phim bom tấn HD, 3 Cụm rạp (TP.HCM, Hà Nội, Đà Nẵng), 6 Phòng chiếu, 576 Ghế ngồi (Standard, VIP, Couple), 66+ Suất chiếu và 4 Tài khoản mẫu.

### 5. Khởi Động Ứng Dụng (Development Mode)
```bash
# Chạy đồng thời cả Server (5000) và Client (5173)
npm run dev
```

Truy cập giao diện tại: **http://localhost:5173**  
API Server tại: **http://localhost:5000/api/v1**

---

## 🔑 Tài Khoản Trải Nghiệm Nhanh (Demo Accounts)

| Vai trò | Email | Mật khẩu | Chức năng nổi bật |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@cinebook.com` | `admin123` | Dashboard Doanh Thu, Quản lý phim, rạp, phòng, ghế, suất chiếu, user, coupon |
| 🎫 **Staff** | `staff@cinebook.com` | `staff123` | Quét QR vé, xác thực chữ ký số, soát vé Check-in khách vào rạp |
| 👤 **User** | `user@cinebook.com` | `user123` | Đặt vé, giữ ghế realtime 5 phút, thanh toán, quản lý vé điện tử |

*(Tại trang Login có sẵn 3 nút đăng nhập nhanh 1-click).*

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Chạy bộ kiểm thử E2E 19 kịch bản:
```bash
npm test
```
```
✅ [PASS] 1. Server Health Check endpoint responding with status OK
✅ [PASS] 2. User Login with JWT Access Token issued
✅ [PASS] 3. Staff Login with role STAFF
✅ [PASS] 4. Admin Login with role ADMIN
✅ [PASS] 5. RBAC Protection: USER blocked from Admin Users endpoint (403)
✅ [PASS] 6. RBAC Protection: STAFF blocked from Admin Coupons endpoint (403)
✅ [PASS] 7. TMDB Now-Playing movies correctly mapped to Movie schema
✅ [PASS] 8. Search Movies API multi-source integration (DB + TMDB)
✅ [PASS] 9. Cinemas directory listing across multiple cities
✅ [PASS] 10. Showtimes directory active
✅ [PASS] 11. Realtime Seats matrix layout with Standard, VIP, Couple seats
✅ [PASS] 12. Found available seat for booking test
✅ [PASS] 13. Atomic Seat Hold lock acquired with 5-minute TTL
✅ [PASS] 14. Booking Created & Confirmed after Payment Gateway verification
✅ [PASS] 15. Cryptographic QR Code Ticket generated with Base64 payload
✅ [PASS] 16. Double Booking Prevention: Attempt to re-book booked seat rejected
✅ [PASS] 17. Staff QR Ticket Verification passed
✅ [PASS] 18. Staff Admission Check-in recorded with staff ID and timestamp
✅ [PASS] 19. Admin Dashboard Revenue & Analytics aggregation calculation
🎉 AUDIT COMPLETE: 19/19 TESTS PASSED (100%)
```

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**.
