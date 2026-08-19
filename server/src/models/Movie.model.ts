import mongoose, { Document, Schema } from 'mongoose';
import { MovieStatus } from '../constants/index.js';

export interface IMovie extends Document {
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  genres: string[];
  durationMin: number;
  releaseDate: Date;
  ageRating: string; // P, C13, C16, C18
  status: MovieStatus;
  voteAverage: number;
  director?: string;
  cast: string[];
  language?: string;
  region: string;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    tmdbId: {
      type: Number,
      index: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    synopsis: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    backdropUrl: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    durationMin: {
      type: Number,
      required: true,
      min: 1,
      default: 120,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    ageRating: {
      type: String,
      enum: ['P', 'C13', 'C16', 'C18'],
      default: 'C13',
    },
    status: {
      type: String,
      enum: Object.values(MovieStatus),
      default: MovieStatus.NOW_SHOWING,
      index: true,
    },
    voteAverage: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'Tiếng Việt - Phụ đề',
    },
    region: {
      type: String,
      default: 'VN',
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MovieSchema.index({ status: 1, releaseDate: -1 });
MovieSchema.index({ tmdbId: 1, status: 1 });

export const MovieModel = mongoose.model<IMovie>('Movie', MovieSchema);
