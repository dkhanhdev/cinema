import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authApi } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('cinebook_access_token'),
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,

  initAuth: async () => {
    const token = localStorage.getItem('cinebook_access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const res: any = await authApi.getMe();
      const user: User = res.data;
      set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === UserRole.ADMIN,
        isStaff: user.role === UserRole.STAFF || user.role === UserRole.ADMIN,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('cinebook_access_token');
      localStorage.removeItem('cinebook_refresh_token');
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isStaff: false, isLoading: false });
    }
  },

  fetchMe: async () => {
    return get().initAuth();
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res: any = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = res.data;

      localStorage.setItem('cinebook_access_token', accessToken);
      localStorage.setItem('cinebook_refresh_token', refreshToken);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isAdmin: user.role === UserRole.ADMIN,
        isStaff: user.role === UserRole.STAFF || user.role === UserRole.ADMIN,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res: any = await authApi.register(data);
      const { user, accessToken, refreshToken } = res.data;

      localStorage.setItem('cinebook_access_token', accessToken);
      localStorage.setItem('cinebook_refresh_token', refreshToken);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isAdmin: user.role === UserRole.ADMIN,
        isStaff: user.role === UserRole.STAFF || user.role === UserRole.ADMIN,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('cinebook_access_token');
    localStorage.removeItem('cinebook_refresh_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isStaff: false,
      isLoading: false,
    });
  },

  updateUser: (updatedFields) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updatedFields } });
    }
  },
}));
