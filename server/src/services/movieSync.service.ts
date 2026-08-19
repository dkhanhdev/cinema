import { MovieModel } from '../models/Movie.model.js';
import { MovieStatus } from '../constants/index.js';
import { TmdbService } from './tmdb.service.js';

export interface SyncStats {
  addedCount: number;
  updatedCount: number;
  statusChangedCount: number;
  totalSynced: number;
  lastSyncTime: string;
  errors: string[];
}

export class MovieSyncService {
  private static isSyncing = false;
  private static lastSyncStats: SyncStats | null = null;

  static async syncMoviesFromTmdb(): Promise<SyncStats> {
    if (this.isSyncing) {
      return this.lastSyncStats || {
        addedCount: 0,
        updatedCount: 0,
        statusChangedCount: 0,
        totalSynced: 0,
        lastSyncTime: new Date().toISOString(),
        errors: ['Sync already in progress'],
      };
    }

    this.isSyncing = true;
    const startTime = new Date();
    const stats: SyncStats = {
      addedCount: 0,
      updatedCount: 0,
      statusChangedCount: 0,
      totalSynced: 0,
      lastSyncTime: startTime.toISOString(),
      errors: [],
    };

    try {
      const [nowPlayingRaw, upcomingRaw] = await Promise.all([
        TmdbService.getNowPlaying(1).catch(() => ({ movies: [] })),
        TmdbService.getUpcoming(1).catch(() => ({ movies: [] })),
      ]);

      const allTmdbMoviesMap = new Map<number, { raw: any; targetStatus: MovieStatus }>();

      (nowPlayingRaw.movies || []).forEach((m: any) => {
        if (m.tmdbId) {
          allTmdbMoviesMap.set(m.tmdbId, { raw: m, targetStatus: MovieStatus.NOW_SHOWING });
        }
      });

      (upcomingRaw.movies || []).forEach((m: any) => {
        if (m.tmdbId && !allTmdbMoviesMap.has(m.tmdbId)) {
          allTmdbMoviesMap.set(m.tmdbId, { raw: m, targetStatus: MovieStatus.COMING_SOON });
        }
      });

      for (const [tmdbId, { raw, targetStatus }] of allTmdbMoviesMap.entries()) {
        try {
          const detail = await TmdbService.getMovieDetail(tmdbId).catch(() => raw);
          const now = new Date();

          let existing = await MovieModel.findOne({ tmdbId });
          if (existing) {
            existing.title = detail.title || existing.title;
            existing.status = targetStatus;
            existing.lastSyncedAt = now;
            await existing.save();
            stats.updatedCount++;
          } else {
            await MovieModel.create({
              tmdbId,
              title: detail.title,
              originalTitle: detail.originalTitle,
              synopsis: detail.synopsis,
              posterUrl: detail.posterUrl,
              backdropUrl: detail.backdropUrl,
              genres: detail.genres || ['Chiếu Rạp'],
              durationMin: detail.durationMin || 120,
              releaseDate: new Date(detail.releaseDate || now),
              status: targetStatus,
              voteAverage: detail.voteAverage || 8.0,
              director: detail.director || '',
              cast: detail.cast || [],
              region: 'VN',
              lastSyncedAt: now,
            });
            stats.addedCount++;
          }
          stats.totalSynced++;
        } catch (err: any) {
          stats.errors.push(`tmdbId ${tmdbId}: ${err.message}`);
        }
      }

      this.lastSyncStats = stats;
      return stats;
    } catch (err: any) {
      stats.errors.push(err.message);
      this.lastSyncStats = stats;
      return stats;
    } finally {
      this.isSyncing = false;
    }
  }

  static async checkAndSyncOnStartup(): Promise<void> {
    // Startup check
  }
}
