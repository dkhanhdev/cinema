import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus } from '../constants/index.js';

export interface ITicket extends Document {
  ticketCode: string;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  showtimeId: mongoose.Types.ObjectId;
  seatId: mongoose.Types.ObjectId;
  seatNumber: string;
  price: number;
  qrCodeUrl: string;
  qrToken: string;
  status: BookingStatus;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
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
    seatId: {
      type: Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
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
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
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
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ showtimeId: 1, seatId: 1 });

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);
