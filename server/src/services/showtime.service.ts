import mongoose from 'mongoose';
import { ShowtimeModel, IShowtime } from '../models/Showtime.model.js';
import { SeatModel } from '../models/Seat.model.js';
import { BookingModel } from '../models/Booking.model.js';
import { MovieModel } from '../models/Movie.model.js';
import { seatLockService } from './seatLock.service.js';
import { BookingStatus, PaymentStatus, SeatStatus, ShowtimeStatus } from '../constants/index.js';
import { getVietnamDayRange, getCurrentVietnamDate } from '../utils/date.js';

export class ShowtimeService {
  static async getShowtimes(filters: {
    movieTmdbId?: number | string;
    movieId?: string;
    cinemaId?: string;
    date?: string; // YYYY-MM-DD
  }): Promise<IShowtime[]> {
    const query: any = { status: { $ne: ShowtimeStatus.CANCELLED } };

    if (filters.movieTmdbId) {
      const tmdbIdNum = Number(filters.movieTmdbId);
      if (!isNaN(tmdbIdNum)) {
        query.movieTmdbId = tmdbIdNum;
      }
    } else if (filters.movieId) {
      if (mongoose.Types.ObjectId.isValid(filters.movieId)) {
        query.movieId = new mongoose.Types.ObjectId(filters.movieId);
      } else if (!isNaN(Number(filters.movieId))) {
        query.movieTmdbId = Number(filters.movieId);
      }
    }

    if (filters.cinemaId && mongoose.Types.ObjectId.isValid(filters.cinemaId)) {
      query.cinemaId = new mongoose.Types.ObjectId(filters.cinemaId);
    }

    if (filters.date) {
      const { startOfDayUTC, endOfDayUTC, dateVN } = getVietnamDayRange(filters.date);
      query.startTime = { $gte: startOfDayUTC, $lte: endOfDayUTC };
      console.log(`[Showtime] Movie TMDB ID: ${filters.movieTmdbId || filters.movieId || 'ALL'} | Date VN: ${dateVN}`);
    } else {
      const now = new Date();
      query.startTime = { $gte: new Date(now.getTime() - 15 * 60 * 1000) };
    }

    const results = await ShowtimeModel.find(query)
      .populate('movieId', 'title posterUrl durationMin ageRating genres tmdbId')
      .populate('cinemaId', 'name city address hotline image facilities')
      .populate('screenId', 'name screenType totalSeats')
      .sort({ startTime: 1 });

    console.log(`[Showtime] Result Count: ${results.length}`);
    return results;
  }

  static async getShowtimeById(id: string): Promise<any> {
    const showtime = await ShowtimeModel.findById(id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!showtime) {
      throw new Error('Showtime not found');
    }
    return showtime;
  }

  static async getShowtimeSeatsWithStatus(showtimeId: string, currentUserId?: string): Promise<any> {
    const showtime = await ShowtimeModel.findById(showtimeId)
      .populate('movieId', 'title posterUrl durationMin ageRating tmdbId')
      .populate('cinemaId', 'name city')
      .populate('screenId', 'name screenType totalRows totalCols totalSeats');

    if (!showtime) {
      throw new Error('Showtime not found');
    }

    // 1. Get all seats of this screen
    const allSeats = await SeatModel.find({
      screenId: (showtime.screenId as any)._id,
      isActive: true,
    }).sort({ row: 1, col: 1 });

    // 2. Get all booked seats from confirmed bookings
    const confirmedBookings = await BookingModel.find({
      showtimeId,
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      paymentStatus: PaymentStatus.COMPLETED,
    });

    const bookedSeatIds = new Set<string>();
    confirmedBookings.forEach((b) => {
      b.seats.forEach((s) => bookedSeatIds.add(s.seatId.toString()));
    });

    // 3. Get active holds in memory
    const activeHolds = seatLockService.getActiveHoldsForShowtime(showtimeId);
    const holdMap = new Map<string, any>();
    activeHolds.forEach((h) => holdMap.set(h.seatId, h));

    // 4. Map seat matrix
    const seatsWithStatus = allSeats.map((seat) => {
      const sId = seat._id.toString();
      let status = SeatStatus.AVAILABLE;
      let isHeldByMe = false;
      let holdExpiresAt: Date | undefined;

      if (bookedSeatIds.has(sId)) {
        status = SeatStatus.BOOKED;
      } else if (holdMap.has(sId)) {
        const hold = holdMap.get(sId);
        status = SeatStatus.HELD;
        isHeldByMe = currentUserId ? hold.userId === currentUserId : false;
        holdExpiresAt = hold.expiresAt;
      }

      const calculatedPrice = showtime.basePrice + seat.priceModifier;

      return {
        _id: seat._id,
        screenId: seat.screenId,
        row: seat.row,
        col: seat.col,
        seatNumber: seat.seatNumber,
        type: seat.type,
        basePrice: showtime.basePrice,
        priceModifier: seat.priceModifier,
        finalPrice: calculatedPrice,
        status,
        isHeldByMe,
        holdExpiresAt,
      };
    });

    return {
      showtime,
      seats: seatsWithStatus,
    };
  }

  static async createShowtime(data: {
    movieTmdbId: number;
    movieId?: string;
    cinemaId: string;
    screenId: string;
    startTime: string | Date;
    basePrice?: number;
    format?: string;
  }): Promise<IShowtime> {
    const start = new Date(data.startTime);
    const durationMs = 135 * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    // Conflict detection on same screen
    const conflict = await ShowtimeModel.findOne({
      screenId: data.screenId,
      status: { $ne: ShowtimeStatus.CANCELLED },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (conflict) {
      throw new Error('Khung giờ chiếu này bị trùng với một suất chiếu khác tại cùng phòng chiếu.');
    }

    return ShowtimeModel.create({
      movieTmdbId: data.movieTmdbId,
      movieId: data.movieId ? new mongoose.Types.ObjectId(data.movieId) : undefined,
      cinemaId: new mongoose.Types.ObjectId(data.cinemaId),
      screenId: new mongoose.Types.ObjectId(data.screenId),
      startTime: start,
      endTime: end,
      basePrice: data.basePrice || 90000,
      format: data.format || '2D',
      status: ShowtimeStatus.SCHEDULED,
    });
  }

  static async deleteShowtime(id: string): Promise<void> {
    await ShowtimeModel.findByIdAndUpdate(id, { status: ShowtimeStatus.CANCELLED });
  }
}
