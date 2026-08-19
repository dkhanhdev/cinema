import { BookingModel } from '../models/Booking.model.js';
import { MovieModel } from '../models/Movie.model.js';
import { UserModel } from '../models/User.model.js';
import { CinemaModel } from '../models/Cinema.model.js';
import { ShowtimeModel } from '../models/Showtime.model.js';
import { BookingStatus, PaymentStatus } from '../constants/index.js';

export class DashboardService {
  static async getSummary(): Promise<any> {
    const [totalRevenueResult, totalTicketsResult, totalMovies, totalCinemas, totalUsers, recentBookings] = await Promise.all([
      BookingModel.aggregate([
        { $match: { paymentStatus: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),
      BookingModel.aggregate([
        { $match: { paymentStatus: PaymentStatus.COMPLETED } },
        { $project: { seatCount: { $size: '$seats' } } },
        { $group: { _id: null, total: { $sum: '$seatCount' } } },
      ]),
      MovieModel.countDocuments(),
      CinemaModel.countDocuments({ isActive: true }),
      UserModel.countDocuments(),
      BookingModel.find({ paymentStatus: PaymentStatus.COMPLETED })
        .populate('userId', 'fullName email')
        .populate({
          path: 'showtimeId',
          populate: [{ path: 'movieId', select: 'title' }, { path: 'cinemaId', select: 'name' }],
        })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalTicketsSold = totalTicketsResult[0]?.total || 0;

    // Last 7 days revenue chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueByDay = await BookingModel.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.COMPLETED,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$finalPrice' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top movies by tickets
    const topMovies = await BookingModel.aggregate([
      { $match: { paymentStatus: PaymentStatus.COMPLETED } },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimeId',
          foreignField: '_id',
          as: 'showtime',
        },
      },
      { $unwind: '$showtime' },
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie._id',
          title: { $first: '$movie.title' },
          posterUrl: { $first: '$movie.posterUrl' },
          revenue: { $sum: '$finalPrice' },
          tickets: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return {
      totalRevenue,
      totalTicketsSold,
      totalMovies,
      totalCinemas,
      totalUsers,
      revenueByDay,
      topMovies,
      recentBookings,
    };
  }
}
