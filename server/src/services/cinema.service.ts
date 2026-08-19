import { CinemaModel, ICinema } from '../models/Cinema.model.js';
import { ScreenModel } from '../models/Screen.model.js';
import { ShowtimeModel } from '../models/Showtime.model.js';

export class CinemaService {
  static async getAllCinemas(city?: string): Promise<ICinema[]> {
    const filter: any = { isActive: true };
    if (city) {
      filter.city = new RegExp(city, 'i');
    }
    return CinemaModel.find(filter).sort({ city: 1, name: 1 });
  }

  static async getCinemaById(id: string): Promise<any> {
    const cinema = await CinemaModel.findById(id);
    if (!cinema) {
      throw new Error('Cinema not found');
    }

    const screens = await ScreenModel.find({ cinemaId: id, isActive: true });
    
    // Get today's showtimes for this cinema
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const showtimes = await ShowtimeModel.find({
      cinemaId: id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('movieId', 'title posterUrl durationMin ageRating')
      .populate('screenId', 'name screenType')
      .sort({ startTime: 1 });

    return {
      ...cinema.toObject(),
      screens,
      todayShowtimes: showtimes,
    };
  }

  static async createCinema(data: Partial<ICinema>): Promise<ICinema> {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    return CinemaModel.create(data);
  }

  static async updateCinema(id: string, data: Partial<ICinema>): Promise<ICinema> {
    const cinema = await CinemaModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!cinema) {
      throw new Error('Cinema not found');
    }
    return cinema;
  }

  static async deleteCinema(id: string): Promise<void> {
    await CinemaModel.findByIdAndUpdate(id, { isActive: false });
  }
}
