import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Seat, SeatStatus } from '../types';
import { useAuthStore } from '../stores/useAuthStore';
import { useBookingStore } from '../stores/useBookingStore';
import { useToastStore } from '../stores/useToastStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useRealtimeSeats = (showtimeId: string, initialSeats: Seat[]) => {
  const socketRef = useRef<Socket | null>(null);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const { user } = useAuthStore();
  const { addSeat, removeSeat, selectedSeats } = useBookingStore();
  const toast = useToastStore();

  const currentUserId = user?._id || 'guest_temp';
  const currentUserName = user?.fullName || 'Khách';

  useEffect(() => {
    setSeats(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    if (!showtimeId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join:showtime', {
      showtimeId,
      userId: currentUserId,
    });

    socket.on('showtime:sync-holds', (data: { showtimeId: string; holds: any[] }) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          const hold = data.holds.find((h) => h.seatId === seat._id);
          if (hold) {
            return {
              ...seat,
              status: SeatStatus.HELD,
              isHeldByMe: hold.userId === currentUserId,
              holdExpiresAt: hold.expiresAt,
            };
          }
          return seat;
        })
      );
    });

    socket.on('seat:locked', (data: { showtimeId: string; seatId: string; userId: string; userName: string; expiresAt: string }) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (seat._id === data.seatId) {
            const isMe = data.userId === currentUserId;
            return {
              ...seat,
              status: SeatStatus.HELD,
              isHeldByMe: isMe,
              holdExpiresAt: data.expiresAt,
            };
          }
          return seat;
        })
      );

      if (data.userId !== currentUserId) {
        // If someone else locked a seat currently in our local selection
        removeSeat(data.seatId);
      }
    });

    socket.on('seat:released', (data: { showtimeId: string; seatId: string; reason?: string }) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (seat._id === data.seatId) {
            return {
              ...seat,
              status: SeatStatus.AVAILABLE,
              isHeldByMe: false,
              holdExpiresAt: undefined,
            };
          }
          return seat;
        })
      );

      if (data.reason === 'EXPIRED') {
        removeSeat(data.seatId);
      }
    });

    socket.on('seat:select-error', (data: { seatId: string; message: string }) => {
      toast.error(data.message || 'Không thể chọn ghế này');
      removeSeat(data.seatId);
    });

    return () => {
      socket.emit('leave:showtime', { showtimeId });
      socket.disconnect();
    };
  }, [showtimeId, currentUserId]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status === SeatStatus.BOOKED) {
      toast.info('Ghế này đã được bán.');
      return;
    }

    if (seat.status === SeatStatus.HELD && !seat.isHeldByMe) {
      toast.warning('Ghế này đang được người khác giữ.');
      return;
    }

    const isSelected = selectedSeats.some((s) => s._id === seat._id);

    if (isSelected) {
      // Unselect
      removeSeat(seat._id);
      socketRef.current?.emit('seat:unselect', {
        showtimeId,
        seatId: seat._id,
        userId: currentUserId,
      });
    } else {
      // Limit max 8 seats
      if (selectedSeats.length >= 8) {
        toast.warning('Bạn chỉ có thể chọn tối đa 8 ghế trong 1 lần đặt.');
        return;
      }
      // Select
      addSeat(seat);
      socketRef.current?.emit('seat:select', {
        showtimeId,
        seatId: seat._id,
        userId: currentUserId,
        userName: currentUserName,
      });
    }
  };

  return {
    seats,
    toggleSeat,
  };
};
