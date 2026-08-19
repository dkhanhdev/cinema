import { z } from 'zod';
import { MovieStatus, PaymentMethod, UserRole } from '../constants/index.js';

// 1. Auth & User Validators
export const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().optional(),
});

// 2. Movie Validators
export const createMovieSchema = z.object({
  tmdbId: z.number().optional(),
  title: z.string().min(1, 'Tên phim không được để trống'),
  originalTitle: z.string().optional(),
  synopsis: z.string().min(1, 'Tóm tắt nội dung không được để trống'),
  posterUrl: z.string().min(1, 'Poster URL không được để trống'),
  backdropUrl: z.string().min(1, 'Backdrop URL không được để trống'),
  trailerUrl: z.string().optional(),
  genres: z.array(z.string()).default([]),
  durationMin: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
  releaseDate: z.string().or(z.date()),
  ageRating: z.enum(['P', 'C13', 'C16', 'C18']).default('C13'),
  status: z.nativeEnum(MovieStatus).default(MovieStatus.NOW_SHOWING),
  voteAverage: z.number().min(0).max(10).default(8.0),
  director: z.string().optional(),
  cast: z.array(z.string()).default([]),
  language: z.string().optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

// 3. Cinema Validators
export const createCinemaSchema = z.object({
  name: z.string().min(2, 'Tên rạp phải từ 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải từ 5 ký tự'),
  city: z.string().min(2, 'Thành phố không được để trống'),
  hotline: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  facilities: z.array(z.string()).default([]),
});

export const updateCinemaSchema = createCinemaSchema.partial();

// 4. Screen / Room Validators
export const createScreenSchema = z.object({
  name: z.string().min(1, 'Tên phòng chiếu không được để trống'),
  screenType: z.enum(['2D', '3D', 'IMAX', '4DX']).default('2D'),
  totalRows: z.number().min(4).max(20).default(8),
  totalCols: z.number().min(6).max(30).default(12),
});

// 5. Showtime Validators
export const createShowtimeSchema = z.object({
  movieId: z.string().min(1, 'Movie ID không được để trống'),
  cinemaId: z.string().min(1, 'Cinema ID không được để trống'),
  screenId: z.string().min(1, 'Screen ID không được để trống'),
  startTime: z.string().or(z.date()),
  basePrice: z.number().min(10000, 'Giá vé tối thiểu 10,000đ').default(90000),
});

// 6. Seat Hold & Release Validators
export const holdSeatSchema = z.object({
  showtimeId: z.string().min(1),
  seatId: z.string().min(1),
});

export const releaseSeatSchema = z.object({
  showtimeId: z.string().min(1),
  seatId: z.string().min(1),
});

// 7. Booking Validators
export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, 'Vui lòng chọn suất chiếu'),
  seatIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 ghế'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.VNPAY),
});

// 8. Review Validators
export const createReviewSchema = z.object({
  movieId: z.string().min(1, 'Movie ID không được để trống'),
  rating: z.number().min(1).max(10, 'Điểm đánh giá từ 1 đến 10'),
  comment: z.string().min(5, 'Bình luận tối thiểu 5 ký tự').max(1000),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(10).optional(),
  comment: z.string().min(5).max(1000).optional(),
});

// 9. Staff Checkin Validators
export const verifyCheckinSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập hoặc quét mã vé'),
});

export const confirmCheckinSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID không được để trống'),
});
