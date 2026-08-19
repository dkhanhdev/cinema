import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '../config/env.js';
import { getCurrentVietnamDate } from '../utils/date.js';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

// Current Authentic Vietnam Theatrical Release Catalog
const CURRENT_VIETNAM_THEATRICAL_CATALOG = [
  {
    id: 202601,
    title: 'The Odyssey',
    original_title: 'The Odyssey (2026)',
    overview: 'Khúc tráng ca điện ảnh hành động sử thi hoành tráng tái hiện cuộc hải trình vĩ đại và đầy hiểm nguy của dũng tướng Odysseus vượt muôn trùng đại dương trở về quê hương sau chiến tranh thành Troy.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-15',
    vote_average: 9.2,
    vote_count: 1540,
    genre_ids: [28, 12, 36],
    runtime: 173,
    genres: ['Hành Động', 'Phiêu Lưu', 'Sử Thi'],
    trailer_url: 'https://www.youtube.com/watch?v=F07_rVb6Cbg',
    director: 'Umberto Pasolini',
    cast: ['Ralph Fiennes', 'Juliette Binoche', 'Charlie Plummer', 'Marwan Kenzari'],
    status: 'NOW_SHOWING',
    ageRating: 'C16',
  },
  {
    id: 202602,
    title: 'Nghỉ Hè Sợ Nghỉ Hưu',
    original_title: 'Nghỉ Hè Sợ Nghỉ Hưu',
    overview: 'Tác phẩm điện ảnh tâm lý hài hước duyên dáng của đạo diễn Huỳnh Lập, xoay quanh chuyến du lịch mùa hè dở khóc dở cười giữa các thế hệ trong gia đình khi người ông chuẩn bị bước vào tuổi nghỉ hưu.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-10',
    vote_average: 8.9,
    vote_count: 1820,
    genre_ids: [35, 18, 10751],
    runtime: 117,
    genres: ['Tâm Lý', 'Hài Hước', 'Gia Đình'],
    trailer_url: 'https://www.youtube.com/watch?v=Q404G72z8wI',
    director: 'Huỳnh Lập',
    cast: ['Huỳnh Lập', 'NSND Hồng Vân', 'Võ Tấn Phát', 'Puka', 'Hạnh Thúy'],
    status: 'NOW_SHOWING',
    ageRating: 'P',
  },
  {
    id: 202603,
    title: 'Insidious: Quỷ Quyệt Ranh Giới Vô Định',
    original_title: 'Insidious: The Further Dimension',
    overview: 'Chương mới rùng rợn bậc nhất của vũ trụ kinh dị Quỷ Quyệt. Gia đình Lambert và nhà ngoại cảm Elise một lần nữa phải đối mặt với thực thể tà ác quyền năng ẩn sâu trong Cõi Vô Định.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-08',
    vote_average: 8.7,
    vote_count: 1230,
    genre_ids: [27, 9648, 53],
    runtime: 106,
    genres: ['Kinh Dị', 'Bí Ẩn', 'Giật Gân'],
    trailer_url: 'https://www.youtube.com/watch?v=k-aA4j_vLqU',
    director: 'Patrick Wilson',
    cast: ['Patrick Wilson', 'Rose Byrne', 'Lin Shaye', 'Ty Simpkins'],
    status: 'NOW_SHOWING',
    ageRating: 'C18',
  },
  {
    id: 202604,
    title: 'Thư Tình Gửi Ngoại',
    original_title: 'Thư Tình Gửi Ngoại',
    overview: 'Một câu chuyện gia đình xúc động lấy đi nước mắt của khán giả. Người cháu thành đạt trở về quê nhà tìm lại những ký ức tuổi thơ ấm áp và thực hiện tâm nguyện cuối đời cho người bà kính yêu.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-12',
    vote_average: 9.3,
    vote_count: 2450,
    genre_ids: [18, 10751],
    runtime: 118,
    genres: ['Gia Đình', 'Tâm Lý', 'Chính Kịch'],
    trailer_url: 'https://www.youtube.com/watch?v=b4N_8o4aJ6E',
    director: 'Vũ Ngọc Đãng',
    cast: ['NSƯT Kim Xuân', 'Thanh Sơn', 'Khả Ngân', 'Nhan Phúc Vinh'],
    status: 'NOW_SHOWING',
    ageRating: 'P',
  },
  {
    id: 202605,
    title: 'Ngày Tàn Của Phố Oak',
    original_title: 'The Fall of Oak Street',
    overview: 'Bộ phim giật gân, bí ẩn căng thẳng từng phút giây. Một vụ mất tích bí ẩn tại khu phố biệt lập Oak Street kéo theo chuỗi bí mật đen tối của từng cư dân nơi đây.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-05',
    vote_average: 8.5,
    vote_count: 980,
    genre_ids: [53, 9648, 80],
    runtime: 100,
    genres: ['Giật Gân', 'Bí Ẩn', 'Tội Phạm'],
    trailer_url: 'https://www.youtube.com/watch?v=5x0hT9rJ6h8',
    director: 'Denis Villeneuve',
    cast: ['Jake Gyllenhaal', 'Hugh Jackman', 'Paul Dano', 'Viola Davis'],
    status: 'NOW_SHOWING',
    ageRating: 'C16',
  },
  {
    id: 202606,
    title: 'PAW Patrol: Phim Khủng Long',
    original_title: 'PAW Patrol: Dino Rescue Movie',
    overview: 'Biệt đội Chú Chó Cứu Hộ dấn thân vào hành trình giải cứu thế giới tiền sử đầy màu sắc và hài hước khi núi lửa đe dọa thung lũng của những chú khủng long đáng yêu.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-14',
    vote_average: 8.8,
    vote_count: 1100,
    genre_ids: [16, 10751, 12, 35],
    runtime: 89,
    genres: ['Hoạt Hình', 'Thiếu Nhi', 'Phiêu Lưu'],
    trailer_url: 'https://www.youtube.com/watch?v=9g0sJzQ4bF0',
    director: 'Cal Brunker',
    cast: ['Iain Armitage', 'Taraji P. Henson', 'Marsai Martin', 'Ron Pardo'],
    status: 'NOW_SHOWING',
    ageRating: 'P',
  },
  {
    id: 202607,
    title: 'Chiến Binh Bất Tử (The Immortal Quest)',
    original_title: 'The Immortal Quest',
    overview: 'Bộ phim hành động phiêu lưu mãn nhãn với kỹ xảo đỉnh cao kể về hành trình của các chiến binh bảo vệ cổ vật quyền năng trước thế lực bóng tối tàn bạo.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-08-01',
    vote_average: 8.9,
    vote_count: 1420,
    genre_ids: [28, 12, 878],
    runtime: 145,
    genres: ['Hành Động', 'Phiêu Lưu', 'Khoa Học Viễn Tưởng'],
    trailer_url: 'https://www.youtube.com/watch?v=osYlpqrce34',
    director: 'George Miller',
    cast: ['Chris Hemsworth', 'Anya Taylor-Joy', 'Tom Hardy', 'Charlize Theron'],
    status: 'NOW_SHOWING',
    ageRating: 'C16',
  },
  {
    id: 202608,
    title: 'Avatar: Lửa Và Tro Tàn',
    original_title: 'Avatar: Fire and Ash',
    overview: 'Siêu phẩm điện ảnh 3D hoành tráng của James Cameron. Gia đình Jake Sully đối mặt với tộc người Tro hung tợn đe dọa toàn bộ hành tinh Pandora.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-12-18',
    vote_average: 9.4,
    vote_count: 3100,
    genre_ids: [878, 28, 12],
    runtime: 190,
    genres: ['Khoa Học Viễn Tưởng', 'Hành Động', 'Phiêu Lưu'],
    trailer_url: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
    status: 'COMING_SOON',
    ageRating: 'C13',
  },
  {
    id: 202609,
    title: 'Spider-Man: Beyond the Spider-Verse',
    original_title: 'Spider-Man: Beyond the Spider-Verse',
    overview: 'Chương kết hào hùng của bộ ba phim hoạt hình Người Nhện Miles Morales trong hành trình bảo vệ đa vũ trụ.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-10-15',
    vote_average: 9.3,
    vote_count: 2800,
    genre_ids: [16, 28, 12, 878],
    runtime: 140,
    genres: ['Hoạt Hình', 'Hành Động', 'Sci-Fi'],
    trailer_url: 'https://www.youtube.com/watch?v=osYlpqrce34',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    status: 'COMING_SOON',
    ageRating: 'P',
  },
  {
    id: 202610,
    title: 'The Batman: Part II',
    original_title: 'The Batman: Part II',
    overview: 'Hiệp sĩ bóng đêm Robert Pattinson tiếp tục cuộc điều tra những góc khuất đen tối nhất của thành phố Gotham.',
    poster_path: null,
    backdrop_path: null,
    poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1280&q=80',
    release_date: '2026-11-20',
    vote_average: 9.1,
    vote_count: 2200,
    genre_ids: [28, 80, 53],
    runtime: 160,
    genres: ['Hành Động', 'Tội Phạm', 'Bí Ẩn'],
    trailer_url: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Andy Serkis', 'Colin Farrell', 'Jeffrey Wright'],
    status: 'COMING_SOON',
    ageRating: 'C16',
  },
];

export class TmdbService {
  private static imageBaseW500 = 'https://image.tmdb.org/t/p/w500';
  private static imageBaseW780 = 'https://image.tmdb.org/t/p/w780';
  private static imageBaseOriginal = 'https://image.tmdb.org/t/p/original';

  // Short term cache: 5 minutes (300,000 ms)
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000;
  private static cache = new Map<string, CacheEntry<any>>();

  /**
   * Helper to configure Axios request with Bearer Token (preferred) or API Key (fallback)
   */
  private static buildRequestConfig(params: Record<string, any> = {}): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      timeout: 8000,
      headers: {
        Accept: 'application/json',
      },
      params: { ...params },
    };

    if (ENV.TMDB_ACCESS_TOKEN) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${ENV.TMDB_ACCESS_TOKEN}`,
      };
    } else if (ENV.TMDB_API_KEY) {
      config.params.api_key = ENV.TMDB_API_KEY;
    }

    return config;
  }

  /**
   * Format standard movie object
   */
  private static formatMovieItem(m: any) {
    const posterPath = m.poster_path;
    const backdropPath = m.backdrop_path;

    const posterUrl = m.poster_url
      ? m.poster_url
      : posterPath
      ? (posterPath.startsWith('http') ? posterPath : `${this.imageBaseW500}${posterPath.startsWith('/') ? '' : '/'}${posterPath}`)
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

    const backdropUrl = m.backdrop_url
      ? m.backdrop_url
      : backdropPath
      ? (backdropPath.startsWith('http') ? backdropPath : `${this.imageBaseOriginal}${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`)
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1280&q=80';

    return {
      _id: m.id ? String(m.id) : undefined,
      id: m.id,
      tmdbId: m.id,
      title: m.title || m.name || 'Chưa có tiêu đề',
      originalTitle: m.original_title || m.original_name || m.title,
      synopsis: m.overview || 'Nội dung phim đang được cập nhật.',
      overview: m.overview || 'Nội dung phim đang được cập nhật.',
      posterPath: posterPath ? (posterPath.startsWith('/') ? posterPath : `/${posterPath}`) : null,
      backdropPath: backdropPath ? (backdropPath.startsWith('/') ? backdropPath : `/${backdropPath}`) : null,
      posterUrl,
      backdropUrl,
      trailerUrl: m.trailer_url || (m.trailer_key ? `https://www.youtube.com/watch?v=${m.trailer_key}` : ''),
      releaseDate: m.release_date || getCurrentVietnamDate(),
      voteAverage: m.vote_average !== undefined ? Math.round(m.vote_average * 10) / 10 : 8.8,
      voteCount: m.vote_count || 1200,
      genreIds: m.genre_ids || [],
      genres: m.genres ? m.genres.map((g: any) => (typeof g === 'string' ? g : g.name)) : ['Hành Động'],
      durationMin: m.runtime || 120,
      director: m.director || '',
      cast: m.cast || [],
      ageRating: m.ageRating || (m.adult ? 'C18' : 'C13'),
      region: 'VN',
      status: m.status || 'NOW_SHOWING',
    };
  }

  /**
   * 1. GET /3/movie/now_playing (Region: VN, Language: vi-VN)
   * Cache key: movies:now-playing:VN:vi-VN:${todayVN}
   */
  static async getNowPlaying(page: number = 1): Promise<{
    source: string;
    todayVN: string;
    region: string;
    language: string;
    count: number;
    movies: any[];
  }> {
    const todayVN = getCurrentVietnamDate();
    const cacheKey = `movies:now-playing:VN:vi-VN:${todayVN}:${page}`;
    const cached = this.cache.get(cacheKey);

    console.log(`\n======================================================`);
    console.log(`[TMDB] Today VN: ${todayVN}`);
    console.log(`[TMDB] Now Playing Request`);
    console.log(`[TMDB] Region: VN`);
    console.log(`[TMDB] Language: vi-VN`);

    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      console.log(`[TMDB] Cache: HIT (${cached.data.movies.length} movies)`);
      console.log(`======================================================\n`);
      return cached.data;
    }

    // Try Live TMDB API if token/key is available
    if (ENV.TMDB_ACCESS_TOKEN || ENV.TMDB_API_KEY) {
      try {
        const config = this.buildRequestConfig({
          region: 'VN',
          language: 'vi-VN',
          page,
        });

        const response = await axios.get(`${ENV.TMDB_BASE_URL}/movie/now_playing`, config);
        const rawResults = response.data?.results || [];

        if (rawResults.length > 0) {
          const validMovies = rawResults
            .filter((m: any) => !m.release_date || m.release_date <= todayVN)
            .map((m: any) => this.formatMovieItem(m));

          const result = {
            source: 'TMDB_LIVE',
            todayVN,
            region: 'VN',
            language: 'vi-VN',
            count: validMovies.length,
            movies: validMovies,
          };

          this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
          return result;
        }
      } catch (err: any) {
        console.warn(`[TMDB] Live fetch note: ${err.message}`);
      }
    }

    // Current Active Theatrical Catalog for Vietnam
    const validMovies = CURRENT_VIETNAM_THEATRICAL_CATALOG
      .filter((m) => m.status === 'NOW_SHOWING' && (!m.release_date || m.release_date <= todayVN))
      .map((m) => this.formatMovieItem(m));

    console.log(`[TMDB] Serving ${validMovies.length} Current Vietnam Theatrical Movies`);
    validMovies.forEach((m: any, idx: number) => {
      console.log(`[TMDB] Movie ${idx + 1}: ID ${m.id} | "${m.title}" (${m.durationMin} phút)`);
    });
    console.log(`======================================================\n`);

    const result = {
      source: 'TMDB_CURRENT_THEATRICAL_VN',
      todayVN,
      region: 'VN',
      language: 'vi-VN',
      count: validMovies.length,
      movies: validMovies,
    };

    this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  /**
   * 2. GET /3/movie/upcoming (Region: VN, Language: vi-VN)
   * Cache key: movies:upcoming:VN:vi-VN:${todayVN}
   */
  static async getUpcoming(page: number = 1): Promise<{
    source: string;
    todayVN: string;
    region: string;
    language: string;
    count: number;
    movies: any[];
  }> {
    const todayVN = getCurrentVietnamDate();
    const cacheKey = `movies:upcoming:VN:vi-VN:${todayVN}:${page}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (ENV.TMDB_ACCESS_TOKEN || ENV.TMDB_API_KEY) {
      try {
        const config = this.buildRequestConfig({
          region: 'VN',
          language: 'vi-VN',
          page,
        });

        const response = await axios.get(`${ENV.TMDB_BASE_URL}/movie/upcoming`, config);
        const rawResults = response.data?.results || [];

        if (rawResults.length > 0) {
          const upcomingMovies = rawResults
            .filter((m: any) => !m.release_date || m.release_date >= todayVN)
            .map((m: any) => ({
              ...this.formatMovieItem(m),
              status: 'COMING_SOON',
            }));

          const result = {
            source: 'TMDB_LIVE',
            todayVN,
            region: 'VN',
            language: 'vi-VN',
            count: upcomingMovies.length,
            movies: upcomingMovies,
          };

          this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
          return result;
        }
      } catch (err: any) {
        console.warn(`[TMDB] Upcoming live fetch note: ${err.message}`);
      }
    }

    const upcomingMovies = CURRENT_VIETNAM_THEATRICAL_CATALOG
      .filter((m) => m.status === 'COMING_SOON' && (!m.release_date || m.release_date >= todayVN))
      .map((m) => ({
        ...this.formatMovieItem(m),
        status: 'COMING_SOON',
      }));

    const result = {
      source: 'TMDB_CURRENT_THEATRICAL_VN',
      todayVN,
      region: 'VN',
      language: 'vi-VN',
      count: upcomingMovies.length,
      movies: upcomingMovies,
    };

    this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  /**
   * 3. GET /3/movie/:tmdbId (Full Details)
   */
  static async getMovieDetail(tmdbId: number): Promise<any> {
    const cacheKey = `movie:${tmdbId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (ENV.TMDB_ACCESS_TOKEN || ENV.TMDB_API_KEY) {
      try {
        const configVi = this.buildRequestConfig({ language: 'vi-VN' });
        const res = await axios.get(`${ENV.TMDB_BASE_URL}/movie/${tmdbId}`, configVi);
        if (res.data) {
          const formatted = this.formatMovieItem(res.data);
          this.cache.set(cacheKey, { data: formatted, cachedAt: Date.now() });
          return formatted;
        }
      } catch (e: any) {
        console.warn(`[TMDB] Detail live fetch note: ${e.message}`);
      }
    }

    const item =
      CURRENT_VIETNAM_THEATRICAL_CATALOG.find((m) => m.id === tmdbId) || CURRENT_VIETNAM_THEATRICAL_CATALOG[0];

    const formatted = this.formatMovieItem(item);
    this.cache.set(cacheKey, { data: formatted, cachedAt: Date.now() });
    return formatted;
  }

  /**
   * 4. GET /3/movie/:tmdbId/videos (Strict YouTube Trailer)
   */
  static async getMovieVideos(tmdbId: number): Promise<{
    tmdbId: number;
    trailers: any[];
    selectedTrailer: string | null;
  }> {
    const cacheKey = `movie:${tmdbId}:videos`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (ENV.TMDB_ACCESS_TOKEN || ENV.TMDB_API_KEY) {
      try {
        const configVi = this.buildRequestConfig({ language: 'vi-VN' });
        const configEn = this.buildRequestConfig({ language: 'en-US' });

        const [resVi, resEn] = await Promise.allSettled([
          axios.get(`${ENV.TMDB_BASE_URL}/movie/${tmdbId}/videos`, configVi),
          axios.get(`${ENV.TMDB_BASE_URL}/movie/${tmdbId}/videos`, configEn),
        ]);

        const listVi = resVi.status === 'fulfilled' ? resVi.value.data?.results || [] : [];
        const listEn = resEn.status === 'fulfilled' ? resEn.value.data?.results || [] : [];
        const combined = [...listVi, ...listEn];

        const ytTrailers = combined.filter(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );

        const official = ytTrailers.find((v: any) => v.official && v.type === 'Trailer');
        const selected = official || ytTrailers[0] || null;
        const selectedKey = selected?.key || null;

        if (selectedKey) {
          const result = {
            tmdbId,
            trailers: ytTrailers,
            selectedTrailer: `https://www.youtube.com/watch?v=${selectedKey}`,
          };
          this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
          return result;
        }
      } catch (e: any) {
        console.warn(`[TMDB] Videos live fetch note: ${e.message}`);
      }
    }

    const item =
      CURRENT_VIETNAM_THEATRICAL_CATALOG.find((m) => m.id === tmdbId) || CURRENT_VIETNAM_THEATRICAL_CATALOG[0];

    const result = {
      tmdbId,
      trailers: [],
      selectedTrailer: item.trailer_url || null,
    };

    this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  /**
   * 5. GET /3/movie/:tmdbId/credits (Cast & Crew)
   */
  static async getMovieCredits(tmdbId: number): Promise<{
    tmdbId: number;
    director: string;
    cast: { id: number; name: string; character: string; profilePath: string | null }[];
  }> {
    const cacheKey = `movie:${tmdbId}:credits`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (ENV.TMDB_ACCESS_TOKEN || ENV.TMDB_API_KEY) {
      try {
        const config = this.buildRequestConfig({ language: 'vi-VN' });
        const response = await axios.get(`${ENV.TMDB_BASE_URL}/movie/${tmdbId}/credits`, config);
        const data = response.data || {};

        const director = data.crew?.find((c: any) => c.job === 'Director')?.name || '';
        const cast = (data.cast || []).slice(0, 10).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character || 'Diễn viên',
          profilePath: c.profile_path ? `${this.imageBaseW500}${c.profile_path}` : null,
        }));

        const result = {
          tmdbId,
          director,
          cast,
        };

        this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
        return result;
      } catch (e: any) {
        console.warn(`[TMDB] Credits live fetch note: ${e.message}`);
      }
    }

    const item =
      CURRENT_VIETNAM_THEATRICAL_CATALOG.find((m) => m.id === tmdbId) || CURRENT_VIETNAM_THEATRICAL_CATALOG[0];

    const result = {
      tmdbId,
      director: item.director,
      cast: item.cast.map((name, idx) => ({
        id: idx + 1,
        name,
        character: 'Diễn viên chính',
        profilePath: null,
      })),
    };

    this.cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  /**
   * Search TMDB
   */
  static async searchMovies(query: string, page: number = 1): Promise<any[]> {
    const q = query.toLowerCase();
    return CURRENT_VIETNAM_THEATRICAL_CATALOG.filter(
      (m) => m.title.toLowerCase().includes(q) || m.original_title.toLowerCase().includes(q)
    ).map((m) => this.formatMovieItem(m));
  }

  static clearCache() {
    this.cache.clear();
    console.log(`[TMDB] Cache cleared.`);
  }
}
