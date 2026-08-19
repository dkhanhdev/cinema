import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { UserRole } from '../constants/index.js';

export class ReviewController {
  static async getByMovie(req: Request, res: Response): Promise<void> {
    try {
      const movieId = req.params.movieId as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ReviewService.getReviewsByMovie(movieId, page, limit);
      sendSuccess(res, result.reviews, 'Lấy danh sách đánh giá thành công', 200, {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Vui lòng đăng nhập để gửi đánh giá.', 401);
        return;
      }
      const { movieId, rating, comment } = req.body;
      const review = await ReviewService.createReview({
        userId: req.user.userId,
        movieId,
        rating,
        comment,
      });
      sendSuccess(res, review, 'Gửi đánh giá thành công!', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Vui lòng đăng nhập.', 401);
        return;
      }
      const reviewId = req.params.id as string;
      const isAdmin = req.user.role === UserRole.ADMIN;
      await ReviewService.deleteReview(reviewId, req.user.userId, isAdmin);
      sendSuccess(res, null, 'Xóa đánh giá thành công');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
