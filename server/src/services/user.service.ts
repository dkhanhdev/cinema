import { UserModel, IUser } from '../models/User.model.js';
import { UserRole } from '../constants/index.js';

export class UserService {
  static async getAllUsers(filters: {
    role?: UserRole;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: Partial<IUser>[]; total: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.search) {
      const reg = new RegExp(filters.search, 'i');
      query.$or = [{ fullName: reg }, { email: reg }, { phone: reg }];
    }

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserById(id: string): Promise<Partial<IUser>> {
    const user = await UserModel.findById(id).select('-password -refreshToken');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateUserRole(
    id: string,
    data: { role?: UserRole; isActive?: boolean }
  ): Promise<Partial<IUser>> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async deleteUser(id: string): Promise<void> {
    const res = await UserModel.findByIdAndDelete(id);
    if (!res) {
      throw new Error('User not found');
    }
  }
}
