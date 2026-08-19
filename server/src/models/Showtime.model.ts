import mongoose, { Document, Schema } from 'mongoose';
import { ShowtimeStatus } from '../constants/index.js';

export interface IShowtime extends Document {
  movieTmdbId: number;
  movieId?: mongoose.Types.ObjectId;
  cinemaId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  format: string;
  status: ShowtimeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ShowtimeSchema = new Schema<IShowtime>(
  {
    movieTmdbId: {
      type: Number,
      required: true,
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: false,
      index: true,
    },
    cinemaId: {
      type: Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    screenId: {
      type: Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 90000,
    },
    format: {
      type: String,
      default: '2D',
    },
    status: {
      type: String,
      enum: Object.values(ShowtimeStatus),
      default: ShowtimeStatus.SCHEDULED,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ShowtimeSchema.index({ movieTmdbId: 1, startTime: 1 });
ShowtimeSchema.index({ screenId: 1, startTime: 1, endTime: 1 });

export const ShowtimeModel = mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
