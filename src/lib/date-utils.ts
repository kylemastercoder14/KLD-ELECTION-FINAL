/**
 * Date utility functions for handling timezone conversions
 *
 * When dates come from the database (stored in UTC), we need to convert them
 * to the user's local timezone for display. When submitting dates, we need to
 * convert local time to UTC for storage.
 */

/**
 * Extracts the local time (HH:mm) from a Date object
 * This ensures we get the time in the user's local timezone, not UTC
 */
export function getLocalTime(date: Date | string | null | undefined): string {
  if (!date) return "";

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Get local hours and minutes, pad with zeros
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Combines a date and time string into a Date object in local timezone
 * This ensures the datetime is created in the user's local timezone
 * and will be correctly converted to UTC when stored in the database
 */
export function combineDateAndTime(date: Date | undefined, time: string | undefined): Date {
  if (!date) {
    throw new Error("Date is required");
  }

  // Create a new Date object from the date (this preserves the date part)
  const combined = new Date(date);

  // If time is provided, set the hours and minutes in local time
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    // Default to midnight if no time provided
    combined.setHours(0, 0, 0, 0);
  }

  // Return the date - JavaScript will automatically convert to UTC when serialized
  return combined;
}

/**
 * Converts a UTC date from the database to a local Date object
 * This ensures the date displays correctly in the user's timezone
 */
export function dbDateToLocal(utcDate: Date | string | null | undefined): Date | undefined {
  if (!utcDate) return undefined;

  // If it's already a Date object from Prisma, return it as-is
  // Prisma returns Date objects that are already in the correct timezone
  if (utcDate instanceof Date) {
    return utcDate;
  }

  // If it's a string, ensure it's treated as UTC
  // If the string doesn't end with 'Z', we need to ensure it's treated as UTC
  let dateString = utcDate;
  if (typeof utcDate === 'string' && !utcDate.endsWith('Z') && !utcDate.includes('+') && !utcDate.includes('-', 10)) {
    // If it's an ISO string without timezone, assume it's UTC
    dateString = utcDate.endsWith('Z') ? utcDate : utcDate + 'Z';
  }

  // Create Date object - JavaScript will automatically convert UTC to local time
  const date = new Date(dateString);

  // Return the date - when displayed or used, it will show in local time
  return date;
}
