import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { ENV } from './config/env.js';
import { UserModel } from './models/User.model.js';
import { MovieModel } from './models/Movie.model.js';
import { CinemaModel } from './models/Cinema.model.js';
import { ScreenModel } from './models/Screen.model.js';
import { SeatModel } from './models/Seat.model.js';
import { ShowtimeModel } from './models/Showtime.model.js';
import { BookingModel } from './models/Booking.model.js';
import { PaymentModel } from './models/Payment.model.js';
import { UserRole, MovieStatus, SeatType, ShowtimeStatus, BookingStatus, PaymentStatus, PaymentMethod } from './constants/index.js';

const seed = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('🧹 Cleaning existing database...');

    await Promise.all([
      UserModel.deleteMany({}),
      MovieModel.deleteMany({}),
      CinemaModel.deleteMany({}),
      ScreenModel.deleteMany({}),
      SeatModel.deleteMany({}),
      ShowtimeModel.deleteMany({}),
      BookingModel.deleteMany({}),
      PaymentModel.deleteMany({}),
    ]);

    console.log('👤 Creating default users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const staffPass = await bcrypt.hash('staff123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    const [admin, staff, demoUser, user2] = await UserModel.create([
      {
        email: 'admin@cinebook.com',
        password: adminPass,
        fullName: 'Nguyễn Văn Quản Trị (Admin)',
        phone: '0901234567',
        role: UserRole.ADMIN,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        email: 'staff@cinebook.com',
        password: staffPass,
        fullName: 'Trần Thị Thu Ngân (Staff Check-in)',
        phone: '0912345678',
        role: UserRole.STAFF,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      },
      {
        email: 'user@cinebook.com',
        password: userPass,
        fullName: 'Lê Minh Khách Hàng',
        phone: '0987654321',
        role: UserRole.USER,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      {
        email: 'huong@gmail.com',
        password: userPass,
        fullName: 'Phạm Thu Hương',
        phone: '0977112233',
        role: UserRole.USER,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ]);

    console.log('🎬 Creating Theatrical Reference Movies in CineBook Database...');
    const now = new Date();
    const movies = await MovieModel.create([
      {
        tmdbId: 202601,
        title: 'The Odyssey',
        originalTitle: 'The Odyssey (2026)',
        synopsis: 'Khúc tráng ca điện ảnh hành động sử thi hoành tráng tái hiện cuộc hải trình vĩ đại và đầy hiểm nguy của dũng tướng Odysseus vượt muôn trùng đại dương trở về quê hương sau chiến tranh thành Troy.',
        posterUrl: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=F07_rVb6Cbg',
        genres: ['Hành Động', 'Phiêu Lưu', 'Sử Thi'],
        durationMin: 173,
        releaseDate: new Date('2026-08-15'),
        ageRating: 'C16',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 9.2,
        director: 'Umberto Pasolini',
        cast: ['Ralph Fiennes', 'Juliette Binoche', 'Charlie Plummer', 'Marwan Kenzari'],
        language: 'Tiếng Anh - Phụ đề Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202602,
        title: 'Nghỉ Hè Sợ Nghỉ Hưu',
        originalTitle: 'Nghỉ Hè Sợ Nghỉ Hưu',
        synopsis: 'Tác phẩm điện ảnh tâm lý hài hước duyên dáng của đạo diễn Huỳnh Lập, xoay quanh chuyến du lịch mùa hè dở khóc dở cười giữa các thế hệ trong gia đình khi người ông chuẩn bị bước vào tuổi nghỉ hưu.',
        posterUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Q404G72z8wI',
        genres: ['Tâm Lý', 'Hài Hước', 'Gia Đình'],
        durationMin: 117,
        releaseDate: new Date('2026-08-10'),
        ageRating: 'P',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 8.9,
        director: 'Huỳnh Lập',
        cast: ['Huỳnh Lập', 'NSND Hồng Vân', 'Võ Tấn Phát', 'Puka', 'Hạnh Thúy'],
        language: 'Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202603,
        title: 'Insidious: Quỷ Quyệt Ranh Giới Vô Định',
        originalTitle: 'Insidious: The Further Dimension',
        synopsis: 'Chương mới rùng rợn bậc nhất của vũ trụ kinh dị Quỷ Quyệt. Gia đình Lambert và nhà ngoại cảm Elise một lần nữa phải đối mặt với thực thể tà ác quyền năng ẩn sâu trong Cõi Vô Định.',
        posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=k-aA4j_vLqU',
        genres: ['Kinh Dị', 'Bí Ẩn', 'Giật Gân'],
        durationMin: 106,
        releaseDate: new Date('2026-08-08'),
        ageRating: 'C18',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 8.7,
        director: 'Patrick Wilson',
        cast: ['Patrick Wilson', 'Rose Byrne', 'Lin Shaye', 'Ty Simpkins'],
        language: 'Tiếng Anh - Phụ đề Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202604,
        title: 'Thư Tình Gửi Ngoại',
        originalTitle: 'Thư Tình Gửi Ngoại',
        synopsis: 'Một câu chuyện gia đình xúc động lấy đi nước mắt của khán giả. Người cháu thành đạt trở về quê nhà tìm lại những ký ức tuổi thơ ấm áp và thực hiện tâm nguyện cuối đời cho người bà kính yêu.',
        posterUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=b4N_8o4aJ6E',
        genres: ['Gia Đình', 'Tâm Lý', 'Chính Kịch'],
        durationMin: 118,
        releaseDate: new Date('2026-08-12'),
        ageRating: 'P',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 9.3,
        director: 'Vũ Ngọc Đãng',
        cast: ['NSƯT Kim Xuân', 'Thanh Sơn', 'Khả Ngân', 'Nhan Phúc Vinh'],
        language: 'Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202605,
        title: 'Ngày Tàn Của Phố Oak',
        originalTitle: 'The Fall of Oak Street',
        synopsis: 'Bộ phim giật gân, bí ẩn căng thẳng từng phút giây. Một vụ mất tích bí ẩn tại khu phố biệt lập Oak Street kéo theo chuỗi bí mật đen tối của từng cư dân nơi đây.',
        posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=5x0hT9rJ6h8',
        genres: ['Giật Gân', 'Bí Ẩn', 'Tội Phạm'],
        durationMin: 100,
        releaseDate: new Date('2026-08-05'),
        ageRating: 'C16',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 8.5,
        director: 'Denis Villeneuve',
        cast: ['Jake Gyllenhaal', 'Hugh Jackman', 'Paul Dano', 'Viola Davis'],
        language: 'Tiếng Anh - Phụ đề Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202606,
        title: 'PAW Patrol: Phim Khủng Long',
        originalTitle: 'PAW Patrol: Dino Rescue Movie',
        synopsis: 'Biệt đội Chú Chó Cứu Hộ dấn thân vào hành trình giải cứu thế giới tiền sử đầy màu sắc và hài hước khi núi lửa đe dọa thung lũng của những chú khủng long đáng yêu.',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=9g0sJzQ4bF0',
        genres: ['Hoạt Hình', 'Thiếu Nhi', 'Phiêu Lưu'],
        durationMin: 89,
        releaseDate: new Date('2026-08-14'),
        ageRating: 'P',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 8.8,
        director: 'Cal Brunker',
        cast: ['Iain Armitage', 'Taraji P. Henson', 'Marsai Martin', 'Ron Pardo'],
        language: 'Lồng tiếng Tiếng Việt & Phụ đề',
        region: 'VN',
        lastSyncedAt: now,
      },
      {
        tmdbId: 202607,
        title: 'Chiến Binh Bất Tử (The Immortal Quest)',
        originalTitle: 'The Immortal Quest',
        synopsis: 'Bộ phim hành động phiêu lưu mãn nhãn với kỹ xảo đỉnh cao kể về hành trình của các chiến binh bảo vệ cổ vật quyền năng trước thế lực bóng tối tàn bạo.',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=osYlpqrce34',
        genres: ['Hành Động', 'Phiêu Lưu', 'Khoa Học Viễn Tưởng'],
        durationMin: 145,
        releaseDate: new Date('2026-08-01'),
        ageRating: 'C16',
        status: MovieStatus.NOW_SHOWING,
        voteAverage: 8.9,
        director: 'George Miller',
        cast: ['Chris Hemsworth', 'Anya Taylor-Joy', 'Tom Hardy', 'Charlize Theron'],
        language: 'Tiếng Anh - Phụ đề Tiếng Việt',
        region: 'VN',
        lastSyncedAt: now,
      },
    ]);

    console.log('🏛️ Creating Cinemas...');
    const [c1, c2, c3] = await CinemaModel.create([
      {
        name: 'CineBook Landmark 81 (IMAX Laser)',
        slug: 'cinebook-landmark-81',
        address: 'Tầng B1, TTTM Vincom Center Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh',
        city: 'TP. Hồ Chí Minh',
        hotline: '1900 6017',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
        facilities: ['IMAX Laser', 'Dolby Atmos', 'VIP Lounge', 'Ghế Đôi Sweetbox', 'Bắp Nước Gourmet'],
      },
      {
        name: 'CineBook Metropolis Liễu Giai',
        slug: 'cinebook-metropolis',
        address: 'Tầng 3, Vincom Center Metropolis, 29 Liễu Giai, Q. Ba Đình',
        city: 'Hà Nội',
        hotline: '1900 6018',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        facilities: ['Dolby Atmos', '4DX Motion', 'CineComfort Recliner', 'Khu Chơi Trẻ Em'],
      },
      {
        name: 'CineBook Vincom Ngô Quyền',
        slug: 'cinebook-vincom-ngo-quyen',
        address: 'Tầng 4, TTTM Vincom Plaza Ngô Quyền, 910A Ngô Quyền, Q. Sơn Trà',
        city: 'Đà Nẵng',
        hotline: '1900 6019',
        image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
        facilities: ['Laser 4K', 'Dolby 7.1', 'Ghế Đôi Sweetbox', 'Bãi Đỗ Xe Tiện Lợi'],
      },
    ]);

    console.log('🎦 Creating Screens for each Cinema...');
    const screens = [];
    for (const cinema of [c1, c2, c3]) {
      const s1 = await ScreenModel.create({
        cinemaId: cinema._id,
        name: 'Phòng Chiếu 1 (IMAX Laser / 4K)',
        screenType: cinema.facilities.includes('IMAX Laser') ? 'IMAX' : '3D',
        totalSeats: 96,
      });
      const s2 = await ScreenModel.create({
        cinemaId: cinema._id,
        name: 'Phòng Chiếu 2 (Dolby Atmos)',
        screenType: '2D',
        totalSeats: 96,
      });
      screens.push(s1, s2);
    }

    console.log('💺 Generating Realtime Seat Matrix (Standard, VIP, Couple)...');
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = 12;

    for (const screen of screens) {
      const seatsToInsert = [];
      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        for (let col = 1; col <= cols; col++) {
          let seatType = SeatType.STANDARD;
          let priceModifier = 0;

          if (['D', 'E', 'F'].includes(row)) {
            seatType = SeatType.VIP;
            priceModifier = 20000;
          } else if (row === 'H') {
            seatType = SeatType.COUPLE;
            priceModifier = 50000;
          }

          seatsToInsert.push({
            screenId: screen._id,
            row,
            col,
            seatNumber: `${row}${col}`,
            type: seatType,
            priceModifier,
            isActive: true,
          });
        }
      }
      await SeatModel.insertMany(seatsToInsert);
    }

    console.log('📅 Scheduling Active Showtimes using movieTmdbId for Today and upcoming days...');
    const showtimes = [];
    const timeslots = ['09:30', '12:45', '15:30', '18:15', '20:45', '23:00'];
    const nowShowingMovies = movies.filter((m) => m.status === MovieStatus.NOW_SHOWING);

    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      for (const screen of screens) {
        for (let tIdx = 0; tIdx < timeslots.length; tIdx++) {
          const [hour, minute] = timeslots[tIdx].split(':').map(Number);
          const startTime = new Date(targetDate);
          startTime.setHours(hour, minute, 0, 0);

          const movie = nowShowingMovies[(tIdx + dayOffset) % nowShowingMovies.length];
          const endTime = new Date(startTime.getTime() + (movie.durationMin + 20) * 60 * 1000);

          const basePrice = screen.screenType === 'IMAX' ? 140000 : 90000;

          const st = await ShowtimeModel.create({
            movieTmdbId: movie.tmdbId,
            movieId: movie._id,
            cinemaId: screen.cinemaId,
            screenId: screen._id,
            startTime,
            endTime,
            basePrice,
            format: screen.screenType === 'IMAX' ? 'IMAX Laser' : '2D',
            status: ShowtimeStatus.SCHEDULED,
          });
          showtimes.push(st);
        }
      }
    }

    console.log('🎟️ Creating initial Demo Booking & Cryptographic QR Ticket...');
    const demoShowtime = showtimes[0];
    const demoSeats = await SeatModel.find({ screenId: demoShowtime.screenId, row: 'E', col: { $in: [5, 6] } });

    const totalAmount = demoSeats.reduce((sum, s) => sum + demoShowtime.basePrice + s.priceModifier, 0);
    const bookingCode = 'CB789456';
    const qrSignature = crypto
      .createHmac('sha256', ENV.JWT_SECRET)
      .update(`${bookingCode}-${demoUser._id}-${demoShowtime._id}`)
      .digest('hex');

    const qrPayload = JSON.stringify({
      bookingCode,
      user: demoUser.fullName,
      movieTmdbId: demoShowtime.movieTmdbId,
      movie: demoShowtime.movieId,
      seats: demoSeats.map((s) => s.seatNumber),
      sig: qrSignature,
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload);

    const demoBooking = await BookingModel.create({
      bookingCode,
      userId: demoUser._id,
      showtimeId: demoShowtime._id,
      movieTmdbId: demoShowtime.movieTmdbId,
      seats: demoSeats.map((s) => ({
        seatId: s._id,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        type: s.type,
        price: demoShowtime.basePrice + s.priceModifier,
      })),
      totalPrice: totalAmount,
      finalPrice: totalAmount,
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      paymentMethod: PaymentMethod.MOCK,
      paymentStatus: PaymentStatus.SUCCESS,
      bookingStatus: BookingStatus.CONFIRMED,
      qrCodeUrl,
      qrToken: qrSignature,
    });

    await PaymentModel.create({
      bookingId: demoBooking._id,
      userId: demoUser._id,
      amount: totalAmount,
      method: PaymentMethod.MOCK,
      status: PaymentStatus.SUCCESS,
      transactionId: 'TXN-MOCK-' + Date.now(),
      paidAt: new Date(),
    });

    console.log('=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    console.log(`🎬 Theatrical Movies Reference: ${movies.length}`);
    console.log(`🏛️ Cinemas: ${[c1, c2, c3].length}`);
    console.log(`🎦 Screens: ${screens.length}`);
    console.log(`📅 Showtimes (with movieTmdbId): ${showtimes.length}`);
    console.log(`🎫 Initial Confirmed Booking: #${bookingCode}`);
    console.log('=========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
