import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/Review.model.js';
import { BookingModel } from '../models/Booking.model.js';
import { MovieModel } from '../models/Movie.model.js';
import { BookingStatus, PaymentStatus } from '../constants/index.js';

export class ReviewService {
  static async getReviewsByMovie(
    movieId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: IReview[]; total: number; averageRating: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      ReviewModel.find({ movieId })
        .populate('userId', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReviewModel.countDocuments({ movieId }),
      ReviewModel.aggregate([
        { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    const averageRating = stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 8.0;

    return {
      reviews,
      total,
      averageRating,
    };
  }

  static async createReview(data: {
    userId: string;
    movieId: string;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    const { userId, movieId, rating, comment } = data;

    // Check if user already reviewed this movie
    const existing = await ReviewModel.findOne({ userId, movieId });
    if (existing) {
      throw new Error('Bạn đã gửi đánh giá cho bộ phim này rồi.');
    }

    // Verify if user actually booked this movie
    const hasBooking = await BookingModel.findOne({
      userId,
      paymentStatus: PaymentStatus.COMPLETED,
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
    }).populate({
      path: 'showtimeId',
      match: { movieId },
    });

    const isVerifiedBooking = !!(hasBooking && hasBooking.showtimeId);

    const review = await ReviewModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      movieId: new mongoose.Types.ObjectId(movieId),
      rating,
      comment,
      isVerifiedBooking,
    });

    // Update movie average rating in background
    const stats = await ReviewModel.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    if (stats[0]?.avgRating) {
      await MovieModel.findByIdAndUpdate(movieId, {
        voteAverage: Math.round(stats[0].avgRating * 10) / 10,
      });
    }

    return review;
  }

  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const query: any = { _id: reviewId };
    if (!isAdmin) {
      query.userId = userId;
    }
    const result = await ReviewModel.findOneAndDelete(query);
    if (!result) {
      throw new Error('Không tìm thấy đánh giá hoặc bạn không có quyền xóa.');
    }
  }
}
