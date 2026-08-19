import mongoose from 'mongoose';
import { ScreenModel, IScreen } from '../models/Screen.model.js';
import { SeatModel, ISeat } from '../models/Seat.model.js';
import { SeatType } from '../constants/index.js';

export class ScreenService {
  static async getScreensByCinema(cinemaId: string): Promise<IScreen[]> {
    return ScreenModel.find({ cinemaId, isActive: true }).sort({ name: 1 });
  }

  static async getScreenById(screenId: string): Promise<any> {
    const screen = await ScreenModel.findById(screenId);
    if (!screen) {
      throw new Error('Screen not found');
    }
    const seats = await SeatModel.find({ screenId, isActive: true }).sort({ row: 1, col: 1 });
    return {
      ...screen.toObject(),
      seats,
    };
  }

  static async createScreenWithSeats(data: {
    cinemaId: string;
    name: string;
    screenType: '2D' | '3D' | 'IMAX' | '4DX';
    totalRows?: number; // default 8 (A-H)
    totalCols?: number; // default 12 (1-12)
  }): Promise<{ screen: IScreen; totalSeats: number }> {
    const totalRows = data.totalRows || 8;
    const totalCols = data.totalCols || 12;
    const totalSeats = totalRows * totalCols;

    const screen = await ScreenModel.create({
      cinemaId: new mongoose.Types.ObjectId(data.cinemaId),
      name: data.name,
      screenType: data.screenType,
      totalRows,
      totalCols,
      totalSeats,
    });

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seatsToInsert: Partial<ISeat>[] = [];

    for (let r = 0; r < totalRows; r++) {
      const rowChar = rowLetters[r];
      let type = SeatType.STANDARD;
      let priceModifier = 0;

      if (r === totalRows - 1) {
        type = SeatType.COUPLE;
        priceModifier = 50000;
      } else if (r >= 3) {
        type = SeatType.VIP;
        priceModifier = 20000;
      }

      for (let c = 1; c <= totalCols; c++) {
        seatsToInsert.push({
          screenId: screen._id as mongoose.Types.ObjectId,
          row: rowChar,
          col: c,
          seatNumber: `${rowChar}${c}`,
          type,
          priceModifier,
          isActive: true,
        });
      }
    }

    await SeatModel.insertMany(seatsToInsert);

    return {
      screen,
      totalSeats,
    };
  }

  static async deleteScreen(screenId: string): Promise<void> {
    await ScreenModel.findByIdAndUpdate(screenId, { isActive: false });
    await SeatModel.updateMany({ screenId }, { isActive: false });
  }
}
