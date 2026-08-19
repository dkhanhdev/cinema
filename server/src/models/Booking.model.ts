import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus, PaymentStatus } from '../constants/index.js';

export interface IBookedSeat {
  seatId: mongoose.Types.ObjectId;
  seatNumber: string;
  row: string;
  col: number;
  type: string;
  price: number;
}

export interface IBooking extends Document {
  bookingCode: string;
  userId: mongoose.Types.ObjectId;
  showtimeId: mongoose.Types.ObjectId;
  movieTmdbId?: number;
  seats: IBookedSeat[];
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCodeUrl?: string;
  qrToken?: string;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  holdExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookedSeatSchema = new Schema<IBookedSeat>(
  {
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true },
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showtimeId: {
      type: Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true,
    },
    movieTmdbId: {
      type: Number,
      required: false,
      index: true,
    },
    seats: {
      type: [BookedSeatSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
      index: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    qrToken: {
      type: String,
      default: '',
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
