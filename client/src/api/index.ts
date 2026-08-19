import { axiosClient } from './axiosClient';
import { Movie, Cinema, Showtime, Booking, User, DashboardSummary, Seat } from '../types';

export interface SyncTmdbResponse {
  addedCount: number;
  updatedCount: number;
  statusChangedCount: number;
  totalSynced: number;
  lastSyncTime: string;
  errors: string[];
}

export const authApi = {
  login: (data: any) => axiosClient.post<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>('/auth/login', data),
  register: (data: any) => axiosClient.post<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>('/auth/register', data),
  getMe: () => axiosClient.get<{ success: boolean; data: User }>('/auth/me'),
  updateMe: (data: any) => axiosClient.put<{ success: boolean; data: User }>('/auth/me', data),
};

export const movieApi = {
  getAll: (params?: { status?: string; search?: string; genre?: string; page?: number; limit?: number }) =>
    axiosClient.get<{ success: boolean; data: Movie[]; meta: any }>('/movies', { params }),
  getById: (id: string | number) => axiosClient.get<{ success: boolean; data: Movie & { showtimes: Showtime[] } }>(`/movies/${id}`),
  getTmdbDetail: (tmdbId: number | string) => axiosClient.get<{ success: boolean; data: any }>(`/movies/tmdb/${tmdbId}`),
  getTmdbVideos: (tmdbId: number | string) => axiosClient.get<{ success: boolean; data: { tmdbId: number; trailers: any[]; selectedTrailer: string | null } }>(`/movies/tmdb/${tmdbId}/videos`),
  getTmdbCredits: (tmdbId: number | string) => axiosClient.get<{ success: boolean; data: { tmdbId: number; director: string; cast: any[] } }>(`/movies/tmdb/${tmdbId}/credits`),
  search: (q: string, page?: number) => axiosClient.get<{ success: boolean; data: any[] }>('/movies/search', { params: { q, page } }),
  getNowPlaying: (page?: number) => axiosClient.get<{ success: boolean; data: Movie[]; count?: number; todayVN?: string }>('/movies/now-playing', { params: { page } }),
  getUpcoming: (page?: number) => axiosClient.get<{ success: boolean; data: Movie[]; count?: number; todayVN?: string }>('/movies/upcoming', { params: { page } }),
  getPopular: (page?: number) => axiosClient.get<{ success: boolean; data: Movie[] }>('/movies/popular', { params: { page } }),
  getCredits: (id: string | number) => axiosClient.get<{ success: boolean; data: any }>(`/movies/tmdb/${id}/credits`),
  getVideos: (id: string | number) => axiosClient.get<{ success: boolean; data: any }>(`/movies/tmdb/${id}/videos`),
  syncTmdb: () => axiosClient.post<{ success: boolean; data: SyncTmdbResponse; message: string }>('/movies/sync-tmdb'),
  create: (data: Partial<Movie>) => axiosClient.post<{ success: boolean; data: Movie }>('/movies', data),
  update: (id: string, data: Partial<Movie>) => axiosClient.put<{ success: boolean; data: Movie }>(`/movies/${id}`, data),
  delete: (id: string) => axiosClient.delete<{ success: boolean }>(`/movies/${id}`),
  // Backward compatibility alias
  searchTmdb: (q: string) => axiosClient.get<{ success: boolean; data: any[] }>('/movies/search', { params: { q } }),
  getTmdbTrending: () => axiosClient.get<{ success: boolean; data: any[] }>('/movies/popular'),
  getTmdbDetails: (tmdbId: number | string) => axiosClient.get<{ success: boolean; data: any }>(`/movies/tmdb/${tmdbId}`),
};

export const cinemaApi = {
  getAll: (city?: string) => axiosClient.get<{ success: boolean; data: Cinema[] }>('/cinemas', { params: { city } }),
  getById: (id: string) => axiosClient.get<{ success: boolean; data: Cinema & { screens: any[]; todayShowtimes: Showtime[] } }>(`/cinemas/${id}`),
  create: (data: Partial<Cinema>) => axiosClient.post<{ success: boolean; data: Cinema }>('/cinemas', data),
  update: (id: string, data: Partial<Cinema>) => axiosClient.put<{ success: boolean; data: Cinema }>(`/cinemas/${id}`, data),
  delete: (id: string) => axiosClient.delete<{ success: boolean }>(`/cinemas/${id}`),
  getScreens: (cinemaId: string) => axiosClient.get<{ success: boolean; data: any[] }>(`/cinemas/${cinemaId}/screens`),
  createScreen: (cinemaId: string, data: any) => axiosClient.post<{ success: boolean; data: any }>(`/cinemas/${cinemaId}/screens`, data),
};

export const showtimeApi = {
  getAll: (params?: { movieTmdbId?: number | string; movieId?: string; cinemaId?: string; date?: string }) =>
    axiosClient.get<{ success: boolean; data: Showtime[] }>('/showtimes', { params }),
  getById: (id: string) => axiosClient.get<{ success: boolean; data: Showtime }>(`/showtimes/${id}`),
  getSeats: (id: string) => axiosClient.get<{ success: boolean; data: { showtime: Showtime; seats: Seat[] } }>(`/showtimes/${id}/seats`),
  create: (data: any) => axiosClient.post<{ success: boolean; data: Showtime }>('/showtimes', data),
  delete: (id: string) => axiosClient.delete<{ success: boolean }>(`/showtimes/${id}`),
};

export const seatApi = {
  hold: (data: { showtimeId: string; seatId: string }) => axiosClient.post('/seats/hold', data),
  release: (data: { showtimeId: string; seatId: string }) => axiosClient.post('/seats/release', data),
};

export const bookingApi = {
  create: (data: { showtimeId: string; seatIds: string[]; paymentMethod: string }) =>
    axiosClient.post<{ success: boolean; data: Booking }>('/bookings', data),
  getMy: () => axiosClient.get<{ success: boolean; data: Booking[] }>('/bookings/my'),
  getById: (id: string) => axiosClient.get<{ success: boolean; data: Booking }>(`/bookings/${id}`),
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    axiosClient.get<{ success: boolean; data: Booking[]; meta: any }>('/bookings/all', { params }),
};

export const checkinApi = {
  verifyTicket: (code: string) => axiosClient.post<{ success: boolean; data: { valid: boolean; message: string; booking?: Booking; alreadyCheckedIn?: boolean } }>('/checkin/verify', { code }),
  confirmCheckIn: (bookingId: string) => axiosClient.post<{ success: boolean; data: Booking }>('/checkin/confirm', { bookingId }),
};

export const dashboardApi = {
  getSummary: () => axiosClient.get<{ success: boolean; data: DashboardSummary }>('/dashboard/summary'),
};
