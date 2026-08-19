import mongoose, { Document, Schema } from 'mongoose';
import { SeatType } from '../constants/index.js';

export interface ISeat extends Document {
  screenId: mongoose.Types.ObjectId;
  row: string; // 'A', 'B', 'C'
  col: number; // 1, 2, 3...
  seatNumber: string; // 'A1', 'B5'
  type: SeatType;
  priceModifier: number; // e.g. 0 for Standard, 20000 for VIP, 50000 for Couple
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    screenId: {
      type: Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    col: {
      type: Number,
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(SeatType),
      default: SeatType.STANDARD,
    },
    priceModifier: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SeatSchema.index({ screenId: 1, row: 1, col: 1 }, { unique: true });

export const SeatModel = mongoose.model<ISeat>('Seat', SeatSchema);
