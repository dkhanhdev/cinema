import mongoose, { Document, Schema } from 'mongoose';

export interface ICinema extends Document {
  name: string;
  slug: string;
  address: string;
  city: string;
  hotline: string;
  image: string;
  description?: string;
  facilities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CinemaSchema = new Schema<ICinema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    hotline: {
      type: String,
      default: '1900 6868',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    },
    description: {
      type: String,
      default: 'Cụm rạp tiêu chuẩn quốc tế với hệ thống âm thanh Dolby Atmos & màn chiếu laser đỉnh cao.',
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'IMAX Laser', 'VIP Lounge', 'Parking'],
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

export const CinemaModel = mongoose.model<ICinema>('Cinema', CinemaSchema);
