/**
 * Vietnam Timezone (Asia/Ho_Chi_Minh) Helper Utilities
 * Ensures all dates, showtimes, and filters adhere strictly to Vietnam Standard Time.
 */

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns the current date in Vietnam formatted as YYYY-MM-DD (e.g. "2026-08-19")
 */
export function getCurrentVietnamDate(customDate?: Date): string {
  const date = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // YYYY-MM-DD
}

/**
 * Calculates the UTC Date range for a given Vietnam date (00:00:00.000 to 23:59:59.999 VN time)
 * Vietnam is UTC+7 (without Daylight Saving Time), so 00:00 VN is 17:00 UTC of previous day.
 */
export function getVietnamDayRange(dateStr?: string): {
  startOfDayUTC: Date;
  endOfDayUTC: Date;
  dateVN: string;
} {
  const dateVN = dateStr || getCurrentVietnamDate();
  const [year, month, day] = dateVN.split('-').map(Number);

  // In Asia/Ho_Chi_Minh (UTC+7):
  // Start of day: dateVN 00:00:00 GMT+0700 -> Date.UTC(year, month - 1, day, 0 - 7, 0, 0, 0)
  const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, -7, 0, 0, 0));
  // End of day: dateVN 23:59:59.999 GMT+0700 -> Date.UTC(year, month - 1, day, 23 - 7, 59, 59, 999)
  const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 16, 59, 59, 999));

  return {
    startOfDayUTC,
    endOfDayUTC,
    dateVN,
  };
}
