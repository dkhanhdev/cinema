import { create } from 'zustand';
import { Movie, Showtime, Seat } from '../types';

interface BookingState {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  holdExpiresAt: string | null;
  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedShowtime: (showtime: Showtime | null) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setHoldExpiresAt: (date: string | null) => void;
  resetBooking: () => void;
  getTotalPrice: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedShowtime: null,
  selectedSeats: [],
  holdExpiresAt: null,

  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setSelectedShowtime: (showtime) => set({ selectedShowtime: showtime, selectedSeats: [], holdExpiresAt: null }),

  addSeat: (seat) => {
    const current = get().selectedSeats;
    if (!current.some((s) => s._id === seat._id)) {
      set({ selectedSeats: [...current, seat] });
    }
  },

  removeSeat: (seatId) => {
    set({ selectedSeats: get().selectedSeats.filter((s) => s._id !== seatId) });
  },

  clearSeats: () => set({ selectedSeats: [], holdExpiresAt: null }),

  setHoldExpiresAt: (date) => set({ holdExpiresAt: date }),

  resetBooking: () =>
    set({
      selectedMovie: null,
      selectedShowtime: null,
      selectedSeats: [],
      holdExpiresAt: null,
    }),

  getTotalPrice: () => {
    const showtime = get().selectedShowtime;
    const base = showtime ? showtime.basePrice : 90000;
    return get().selectedSeats.reduce((sum, seat) => sum + (base + (seat.priceModifier || 0)), 0);
  },
}));
