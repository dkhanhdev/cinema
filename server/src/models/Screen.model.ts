import mongoose, { Document, Schema } from 'mongoose';

export interface IScreen extends Document {
  cinemaId: mongoose.Types.ObjectId;
  name: string;
  screenType: '2D' | '3D' | 'IMAX' | '4DX';
  totalSeats: number;
  totalRows: number;
  totalCols: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScreenSchema = new Schema<IScreen>(
  {
    cinemaId: {
      type: Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    screenType: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 0,
    },
    totalRows: {
      type: Number,
      required: true,
      default: 8,
    },
    totalCols: {
      type: Number,
      required: true,
      default: 12,
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

export const ScreenModel = mongoose.model<IScreen>('Screen', ScreenSchema);
