import mongoose from 'mongoose';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { BookingModel, IBooking } from '../models/Booking.model.js';
import { ShowtimeModel } from '../models/Showtime.model.js';
import { SeatModel } from '../models/Seat.model.js';
import { seatLockService } from './seatLock.service.js';
import { PaymentService } from './payment.service.js';
import { BookingStatus, PaymentMethod, PaymentStatus } from '../constants/index.js';

export class BookingService {
  private static generateBookingCode(): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CB${random}`;
  }

  /**
   * Complete Flow: Seat Validation -> Hold Check -> Pending Booking -> Payment Gateway -> Confirm -> QR Ticket
   */
  static async createBooking(data: {
    userId: string;
    showtimeId: string;
    seatIds: string[];
    paymentMethod: PaymentMethod;
  }): Promise<IBooking> {
    const { userId, showtimeId, seatIds, paymentMethod } = data;

    if (!seatIds || seatIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một ghế.');
    }

    const showtime = await ShowtimeModel.findById(showtimeId)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!showtime) {
      throw new Error('Suất chiếu không tồn tại.');
    }

    // 1. Validate seats exist
    const seats = await SeatModel.find({ _id: { $in: seatIds } });
    if (seats.length !== seatIds.length) {
      throw new Error('Một số ghế đã chọn không hợp lệ.');
    }

    // 2. Double Booking Prevention: Check DB records
    for (const seatId of seatIds) {
      const isBooked = await seatLockService.isSeatBookedInDB(showtimeId, seatId);
      if (isBooked) {
        const sName = seats.find((s) => s._id.toString() === seatId)?.seatNumber || '';
        throw new Error(`Ghế ${sName} đã được người khác đặt trước đó.`);
      }
    }

    // 3. Calculate total amount
    let totalPrice = 0;
    const bookedSeats = seats.map((seat) => {
      const price = showtime.basePrice + seat.priceModifier;
      totalPrice += price;
      return {
        seatId: seat._id as mongoose.Types.ObjectId,
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        type: seat.type,
        price,
      };
    });

    const bookingCode = this.generateBookingCode();

    // 4. Create Initial Pending Booking
    const booking = new BookingModel({
      bookingCode,
      userId: new mongoose.Types.ObjectId(userId),
      showtimeId: new mongoose.Types.ObjectId(showtimeId),
      seats: bookedSeats,
      totalPrice,
      discountAmount: 0,
      finalPrice: totalPrice,
      paymentStatus: PaymentStatus.PENDING,
      bookingStatus: BookingStatus.PENDING,
    });
    await booking.save();

    // 5. Execute Payment Gateway (Mock / VNPay / MoMo)
    const paymentResult = await PaymentService.executePayment(booking, paymentMethod || PaymentMethod.VNPAY);

    // 6. Only Confirm Booking After Backend Verifies Payment Success
    if (!paymentResult.isSuccess) {
      booking.paymentStatus = PaymentStatus.FAILED;
      booking.bookingStatus = BookingStatus.CANCELLED;
      await booking.save();
      throw new Error('Giao dịch thanh toán không thành công. Vui lòng thử lại.');
    }

    // 7. Generate Cryptographic QR Ticket (HMAC-SHA256)
    const qrPayload = JSON.stringify({
      code: bookingCode,
      showtimeId,
      seats: bookedSeats.map((s) => s.seatNumber).join(','),
      issuedAt: Date.now(),
      hash: crypto
        .createHmac('sha256', 'cinebook_secret_key_2026')
        .update(`${bookingCode}-${showtimeId}`)
        .digest('hex')
        .substring(0, 16),
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // 8. Confirm Booking
    booking.paymentStatus = PaymentStatus.SUCCESS;
    booking.bookingStatus = BookingStatus.CONFIRMED;
    booking.qrCodeUrl = qrCodeUrl;
    booking.qrToken = qrPayload;
    await booking.save();

    // 9. Release user in-memory holds
    seatLockService.releaseAllUserSeatsInShowtime(showtimeId, userId);

    return booking;
  }

  static async getMyBookings(userId: string): Promise<IBooking[]> {
    return BookingModel.find({ userId, bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl backdropUrl durationMin ageRating genres' },
          { path: 'cinemaId', select: 'name city address' },
          { path: 'screenId', select: 'name screenType' },
        ],
      })
      .sort({ createdAt: -1 });
  }

  static async getBookingById(bookingId: string, userId?: string): Promise<any> {
    const query: any = { _id: bookingId };
    if (userId) {
      query.userId = userId;
    }

    const booking = await BookingModel.findOne(query)
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId' },
          { path: 'cinemaId' },
          { path: 'screenId' },
        ],
      });

    if (!booking) {
      throw new Error('Không tìm thấy thông tin vé.');
    }
    return booking;
  }

  static async getAllBookings(filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: IBooking[]; total: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) {
      query.bookingStatus = filters.status;
    }
    if (filters.search) {
      query.bookingCode = new RegExp(filters.search, 'i');
    }

    const [bookings, total] = await Promise.all([
      BookingModel.find(query)
        .populate('userId', 'fullName email phone')
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movieId', select: 'title posterUrl' },
            { path: 'cinemaId', select: 'name city' },
            { path: 'screenId', select: 'name' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookingModel.countDocuments(query),
    ]);

    return {
      bookings,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
