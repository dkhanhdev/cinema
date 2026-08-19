import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt.js';
import { UserRole } from '../constants/index.js';

export class AuthService {
  static async register(data: { email: string; password: string; fullName: string; phone?: string }): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await UserModel.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone || '',
      role: UserRole.USER,
    });

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, accessToken, refreshToken };
  }

  static async login(data: { email: string; password: string }): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password || '');
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, accessToken, refreshToken };
  }

  static async refreshToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ refreshToken: refreshTokenString });
    if (!user || !user.isActive) {
      throw new Error('Invalid refresh token');
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await UserModel.findById(userId).select('-password -refreshToken');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateProfile(userId: string, data: { fullName?: string; phone?: string; avatar?: string }): Promise<Partial<IUser>> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
