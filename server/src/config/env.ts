import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinebook',
  JWT_SECRET: process.env.JWT_SECRET || 'cinebook_super_secret_jwt_key_2026_cinematic_experience',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'cinebook_refresh_secret_jwt_key_2026_ultra_secure',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  TMDB_API_KEY: process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.trim() : '',
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN ? process.env.TMDB_ACCESS_TOKEN.trim() : '',
  TMDB_BASE_URL: process.env.TMDB_BASE_URL ? process.env.TMDB_BASE_URL.trim() : 'https://api.themoviedb.org/3',
  SEAT_HOLD_DURATION_MINUTES: process.env.SEAT_HOLD_DURATION_MINUTES ? parseInt(process.env.SEAT_HOLD_DURATION_MINUTES, 10) : 5,
};

// Safe startup logging (Never leak credentials)
console.log('-----------------------------------------');
console.log(`[TMDB Config] TMDB_API_KEY exists: ${!!ENV.TMDB_API_KEY}`);
console.log(`[TMDB Config] TMDB_ACCESS_TOKEN exists: ${!!ENV.TMDB_ACCESS_TOKEN}`);
console.log(`[TMDB Config] TMDB_BASE_URL: ${ENV.TMDB_BASE_URL}`);
console.log('-----------------------------------------');
