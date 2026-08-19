import mongoose from 'mongoose';
import { BookingModel } from '../models/Booking.model.js';
import { BookingStatus } from '../constants/index.js';

export class CheckinService {
  static async verifyTicket(codeOrToken: string): Promise<any> {
    let bookingCode = codeOrToken.trim();

    // Try parsing if JSON string from QR
    try {
      if (codeOrToken.startsWith('{')) {
        const parsed = JSON.parse(codeOrToken);
        if (parsed.code) {
          bookingCode = parsed.code;
        }
      }
    } catch (e) {
      // Keep as string
    }

    const booking = await BookingModel.findOne({
      $or: [
        { bookingCode: bookingCode.toUpperCase() },
        { qrToken: codeOrToken },
      ],
    })
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl durationMin ageRating' },
          { path: 'cinemaId', select: 'name city address' },
          { path: 'screenId', select: 'name screenType' },
        ],
      });

    if (!booking) {
      return {
        valid: false,
        message: 'Mã vé không tồn tại trên hệ thống.',
      };
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      return {
        valid: false,
        message: 'Vé này đã bị hủy.',
        booking,
      };
    }

    if (booking.bookingStatus === BookingStatus.CHECKED_IN) {
      return {
        valid: false,
        alreadyCheckedIn: true,
        message: `Vé đã được Check-in lúc ${booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString('vi-VN') : ''}.`,
        booking,
      };
    }

    return {
      valid: true,
      message: 'Vé hợp lệ! Sẵn sàng Check-in.',
      booking,
    };
  }

  static async confirmCheckIn(bookingId: string, staffUserId: string): Promise<any> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Vé không tồn tại.');
    }

    if (booking.bookingStatus === BookingStatus.CHECKED_IN) {
      throw new Error('Vé đã được check-in trước đó.');
    }

    booking.bookingStatus = BookingStatus.CHECKED_IN;
    booking.checkedInAt = new Date();
    booking.checkedInBy = new mongoose.Types.ObjectId(staffUserId);
    await booking.save();

    return booking;
  }
}
