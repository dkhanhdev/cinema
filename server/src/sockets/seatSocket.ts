import { Server, Socket } from 'socket.io';
import { seatLockService, HeldSeat } from '../services/seatLock.service.js';

export const setupSeatSocket = (io: Server) => {
  // Listen to seat expiration callbacks to broadcast release to rooms
  seatLockService.registerOnExpire((held: HeldSeat) => {
    const roomName = `showtime_${held.showtimeId}`;
    io.to(roomName).emit('seat:released', {
      seatId: held.seatId,
      showtimeId: held.showtimeId,
      reason: 'EXPIRED',
    });
  });

  io.on('connection', (socket: Socket) => {
    let currentShowtimeId: string | null = null;
    let currentUserId: string | null = null;

    socket.on('join:showtime', (data: { showtimeId: string; userId?: string }) => {
      const { showtimeId, userId } = data;
      currentShowtimeId = showtimeId;
      if (userId) currentUserId = userId;

      const roomName = `showtime_${showtimeId}`;
      socket.join(roomName);

      // Send list of all active holds to the joined user
      const activeHolds = seatLockService.getActiveHoldsForShowtime(showtimeId);
      socket.emit('showtime:sync-holds', {
        showtimeId,
        holds: activeHolds,
      });
    });

    socket.on('leave:showtime', (data: { showtimeId: string }) => {
      const roomName = `showtime_${data.showtimeId}`;
      socket.leave(roomName);
      if (currentShowtimeId === data.showtimeId) {
        currentShowtimeId = null;
      }
    });

    socket.on(
      'seat:select',
      async (data: { showtimeId: string; seatId: string; userId: string; userName?: string }) => {
        const { showtimeId, seatId, userId, userName } = data;
        const result = await seatLockService.holdSeat(showtimeId, seatId, userId, userName || 'Khách');

        if (result.success) {
          const roomName = `showtime_${showtimeId}`;
          io.to(roomName).emit('seat:locked', {
            showtimeId,
            seatId,
            userId,
            userName: userName || 'Khách',
            expiresAt: result.expiresAt,
          });
          socket.emit('seat:select-success', { seatId, expiresAt: result.expiresAt });
        } else {
          socket.emit('seat:select-error', { seatId, message: result.message });
        }
      }
    );

    socket.on('seat:unselect', (data: { showtimeId: string; seatId: string; userId: string }) => {
      const { showtimeId, seatId, userId } = data;
      const released = seatLockService.releaseSeat(showtimeId, seatId, userId);
      if (released) {
        const roomName = `showtime_${showtimeId}`;
        io.to(roomName).emit('seat:released', {
          showtimeId,
          seatId,
          userId,
        });
        socket.emit('seat:unselect-success', { seatId });
      }
    });

    socket.on('disconnect', () => {
      // User disconnected
    });
  });
};
