export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum MovieStatus {
  NOW_SHOWING = 'NOW_SHOWING',
  COMING_SOON = 'COMING_SOON',
  ENDED = 'ENDED',
}

export enum SeatType {
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  COUPLE = 'COUPLE',
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
  DISABLED = 'DISABLED',
}

export enum ShowtimeStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  COMPLETED = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  MOCK = 'MOCK',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}
