import mongoose from 'mongoose';
import { MovieModel, IMovie } from '../models/Movie.model.js';
import { ShowtimeModel } from '../models/Showtime.model.js';
import { MovieStatus } from '../constants/index.js';

export interface MovieFilterParams {
  status?: MovieStatus;
  genre?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class MovieService {
  // 1. Get Now Playing movies (From MongoDB source of truth)
  static async getNowPlaying(page: number = 1, limit: number = 20): Promise<{ movies: IMovie[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = { status: MovieStatus.NOW_SHOWING };

    const [movies, total] = await Promise.all([
      MovieModel.find(query).sort({ releaseDate: -1, voteAverage: -1 }).skip(skip).limit(limit),
      MovieModel.countDocuments(query),
    ]);

    return { movies, total };
  }

  // 2. Get Upcoming movies (From MongoDB source of truth)
  static async getUpcoming(page: number = 1, limit: number = 20): Promise<{ movies: IMovie[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = { status: MovieStatus.COMING_SOON };

    const [movies, total] = await Promise.all([
      MovieModel.find(query).sort({ releaseDate: 1 }).skip(skip).limit(limit),
      MovieModel.countDocuments(query),
    ]);

    return { movies, total };
  }

  // 3. Get Popular movies
  static async getPopular(page: number = 1, limit: number = 20): Promise<{ movies: IMovie[]; total: number }> {
    const skip = (page - 1) * limit;
    const [movies, total] = await Promise.all([
      MovieModel.find().sort({ voteAverage: -1, releaseDate: -1 }).skip(skip).limit(limit),
      MovieModel.countDocuments(),
    ]);

    return { movies, total };
  }

  // 4. Get all movies with general query filter
  static async getAllMovies(
    params: MovieFilterParams
  ): Promise<{ movies: IMovie[]; total: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.status) {
      query.status = params.status;
    }

    if (params.genre) {
      query.genres = { $in: [new RegExp(params.genre, 'i')] };
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search, 'i');
      query.$or = [
        { title: searchRegex },
        { originalTitle: searchRegex },
        { director: searchRegex },
        { cast: { $elemMatch: { $regex: searchRegex } } },
      ];
    }

    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .sort({ releaseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MovieModel.countDocuments(query),
    ]);

    return {
      movies,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 5. Get Movie Detail with active showtimes
  static async getMovieById(id: string): Promise<any> {
    let movie = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await MovieModel.findById(id);
    } else if (!isNaN(parseInt(id, 10))) {
      movie = await MovieModel.findOne({ tmdbId: parseInt(id, 10) });
    }

    if (!movie) {
      throw new Error('Bộ phim không tồn tại trong hệ thống.');
    }

    // Fetch upcoming showtimes for this movie
    const now = new Date();
    const showtimes = await ShowtimeModel.find({
      movieId: movie._id,
      startTime: { $gte: now },
    })
      .populate('cinemaId', 'name address city hotline image facilities')
      .populate('screenId', 'name screenType totalSeats')
      .sort({ startTime: 1 });

    return {
      ...movie.toObject(),
      showtimes,
    };
  }

  // 6. Admin CRUD
  static async createMovie(data: Partial<IMovie>): Promise<IMovie> {
    const movie = await MovieModel.create({
      ...data,
      lastSyncedAt: new Date(),
    });
    return movie;
  }

  static async updateMovie(id: string, data: Partial<IMovie>): Promise<IMovie> {
    const movie = await MovieModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!movie) {
      throw new Error('Bộ phim không tồn tại.');
    }
    return movie;
  }

  static async deleteMovie(id: string): Promise<void> {
    // Check if movie has existing showtimes/bookings before deleting
    const hasShowtimes = await ShowtimeModel.findOne({ movieId: id });
    if (hasShowtimes) {
      // Instead of hard deleting, archive by marking as ENDED
      await MovieModel.findByIdAndUpdate(id, { status: MovieStatus.ENDED });
      return;
    }
    await MovieModel.findByIdAndDelete(id);
  }
}
