import React from 'react';

/**
 * Unified TMDB Image Helper for CineBook
 * Ensures proper URL construction, size scaling, and resilient fallback handling.
 */
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const DEFAULT_POSTER_FALLBACK =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
export const DEFAULT_BACKDROP_FALLBACK =
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1280&q=80';

export type TmdbImageSize = 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

export function getTmdbImageUrl(
  path?: string | null,
  size: TmdbImageSize = 'w500',
  isBackdrop: boolean = false
): string {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return isBackdrop ? DEFAULT_BACKDROP_FALLBACK : DEFAULT_POSTER_FALLBACK;
  }

  const cleanPath = path.trim();

  // If already a full URL, return directly
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Prepend slash if missing
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${TMDB_IMAGE_BASE}/${size}${normalizedPath}`;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  isBackdrop: boolean = false
): void {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite fallback loops
  target.src = isBackdrop ? DEFAULT_BACKDROP_FALLBACK : DEFAULT_POSTER_FALLBACK;
}
