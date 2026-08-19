import { ENV } from '../config/env.js';
import { BookingModel } from '../models/Booking.model.js';
import { BookingStatus, PaymentStatus } from '../constants/index.js';

export interface HeldSeat {
  seatId: string;
  showtimeId: string;
  userId: string;
  userName?: string;
  heldAt: Date;
  expiresAt: Date;
}

// In-memory key-value lock store: key = `${showtimeId}:${seatId}`
class SeatLockManager {
  private holds: Map<string, HeldSeat> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private onExpireCallbacks: Array<(held: HeldSeat) => void> = [];

  constructor() {
    // Run cleanup cycle every 10 seconds
    this.timer = setInterval(() => {
      this.cleanupExpiredHolds();
    }, 10000);
  }

  public registerOnExpire(cb: (held: HeldSeat) => void) {
    this.onExpireCallbacks.push(cb);
  }

  private getKey(showtimeId: string, seatId: string): string {
    return `${showtimeId}:${seatId}`;
  }

  private cleanupExpiredHolds() {
    const now = new Date();
    for (const [key, hold] of this.holds.entries()) {
      if (hold.expiresAt <= now) {
        this.holds.delete(key);
        this.onExpireCallbacks.forEach((cb) => cb(hold));
      }
    }
  }

  public async isSeatBookedInDB(showtimeId: string, seatId: string): Promise<boolean> {
    const existing = await BookingModel.findOne({
      showtimeId,
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      paymentStatus: PaymentStatus.COMPLETED,
      'seats.seatId': seatId,
    });
    return !!existing;
  }

  public async holdSeat(
    showtimeId: string,
    seatId: string,
    userId: string,
    userName: string = 'User'
  ): Promise<{ success: boolean; message?: string; expiresAt?: Date }> {
    const key = this.getKey(showtimeId, seatId);
    const now = new Date();

    // 1. Check if booked in DB
    const booked = await this.isSeatBookedInDB(showtimeId, seatId);
    if (booked) {
      return { success: false, message: 'Ghế này đã được đặt trước đó.' };
    }

    // 2. Check existing hold
    const currentHold = this.holds.get(key);
    if (currentHold && currentHold.expiresAt > now) {
      if (currentHold.userId !== userId) {
        return { success: false, message: 'Ghế đang được giữ bởi người dùng khác.' };
      }
      // User already holding, refresh TTL
      currentHold.expiresAt = new Date(now.getTime() + ENV.SEAT_HOLD_DURATION_MINUTES * 60 * 1000);
      return { success: true, expiresAt: currentHold.expiresAt };
    }

    // 3. Create new hold
    const expiresAt = new Date(now.getTime() + ENV.SEAT_HOLD_DURATION_MINUTES * 60 * 1000);
    const holdData: HeldSeat = {
      seatId,
      showtimeId,
      userId,
      userName,
      heldAt: now,
      expiresAt,
    };
    this.holds.set(key, holdData);

    return { success: true, expiresAt };
  }

  public releaseSeat(showtimeId: string, seatId: string, userId: string): boolean {
    const key = this.getKey(showtimeId, seatId);
    const hold = this.holds.get(key);
    if (hold && hold.userId === userId) {
      this.holds.delete(key);
      return true;
    }
    return false;
  }

  public releaseAllUserSeatsInShowtime(showtimeId: string, userId: string): string[] {
    const releasedSeatIds: string[] = [];
    for (const [key, hold] of this.holds.entries()) {
      if (hold.showtimeId === showtimeId && hold.userId === userId) {
        releasedSeatIds.push(hold.seatId);
        this.holds.delete(key);
      }
    }
    return releasedSeatIds;
  }

  public getActiveHoldsForShowtime(showtimeId: string): HeldSeat[] {
    const now = new Date();
    const result: HeldSeat[] = [];
    for (const hold of this.holds.values()) {
      if (hold.showtimeId === showtimeId && hold.expiresAt > now) {
        result.push(hold);
      }
    }
    return result;
  }

  public getUserHeldSeats(showtimeId: string, userId: string): HeldSeat[] {
    const now = new Date();
    const result: HeldSeat[] = [];
    for (const hold of this.holds.values()) {
      if (hold.showtimeId === showtimeId && hold.userId === userId && hold.expiresAt > now) {
        result.push(hold);
      }
    }
    return result;
  }
}

export const seatLockService = new SeatLockManager();
