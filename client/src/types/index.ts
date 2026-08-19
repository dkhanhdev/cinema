export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum MovieStatus {
  NOW_SHOWING = 'NOW_SHOWING',
  COMING_SOON = 'COMING_SOON',
  ENDED = 'ENDED',
}

export enum SeatType {
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  COUPLE = 'COUPLE',
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
  DISABLED = 'DISABLED',
}

export enum ShowtimeStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Movie {
  _id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  genres: string[];
  durationMin: number;
  releaseDate: string;
  ageRating: string;
  status: MovieStatus;
  voteAverage: number;
  director?: string;
  cast: string[];
  language?: string;
}

export interface Cinema {
  _id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  hotline: string;
  image: string;
  description?: string;
  facilities: string[];
  isActive: boolean;
}

export interface Screen {
  _id: string;
  cinemaId: string | Cinema;
  name: string;
  screenType: '2D' | '3D' | 'IMAX' | '4DX';
  totalSeats: number;
  totalRows: number;
  totalCols: number;
  isActive: boolean;
}

export interface Seat {
  _id: string;
  screenId: string;
  row: string;
  col: number;
  seatNumber: string;
  type: SeatType;
  basePrice?: number;
  priceModifier: number;
  finalPrice?: number;
  status?: SeatStatus;
  isHeldByMe?: boolean;
  holdExpiresAt?: string;
  isActive?: boolean;
}

export interface Showtime {
  _id: string;
  movieId: Movie;
  cinemaId: Cinema;
  screenId: Screen;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: ShowtimeStatus;
}

export interface BookedSeat {
  seatId: string;
  seatNumber: string;
  row: string;
  col: number;
  type: string;
  price: number;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  userId: User;
  showtimeId: Showtime;
  seats: BookedSeat[];
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCodeUrl?: string;
  qrToken?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalTicketsSold: number;
  totalMovies: number;
  totalCinemas: number;
  totalUsers: number;
  revenueByDay: Array<{ _id: string; revenue: number; bookingsCount: number }>;
  topMovies: Array<{ _id: string; title: string; posterUrl: string; revenue: number; tickets: number }>;
  recentBookings: Booking[];
}
