/**
 * Timezone utilities specifically locked to Africa/Gaborone (CAT, UTC+2)
 */

export const GABORONE_TZ = 'Africa/Gaborone';

/**
 * Format an ISO UTC date string into Africa/Gaborone kickoff time (e.g. "20:00 CAT")
 */
export function formatGaboroneTime(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: GABORONE_TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    return `${timeStr} CAT`;
  } catch {
    return '20:00 CAT';
  }
}

/**
 * Format date for headers in Africa/Gaborone (e.g. "Wed, 22 Oct")
 */
export function formatGaboroneDate(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: GABORONE_TZ,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return 'Today';
  }
}

/**
 * Get the day category relative to Africa/Gaborone time ('TODAY' | 'TOMORROW' | 'OTHER')
 */
export function getGaboroneDayCategory(utcDateStr: string): 'TODAY' | 'TOMORROW' | 'OTHER' {
  try {
    const matchDate = new Date(utcDateStr);
    const now = new Date();

    const gaboroneDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: GABORONE_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(matchDate);

    const gaboroneTodayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: GABORONE_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const gaboroneTomorrowStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: GABORONE_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(tomorrow);

    if (gaboroneDateStr === gaboroneTodayStr) return 'TODAY';
    if (gaboroneDateStr === gaboroneTomorrowStr) return 'TOMORROW';
    return 'OTHER';
  } catch {
    return 'TODAY';
  }
}

/**
 * Get current time in Gaborone for header clock
 */
export function getCurrentGaboroneTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: GABORONE_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

/**
 * Get today's date in Africa/Gaborone (CAT) timezone: YYYY-MM-DD
 */
export function getTodayInGaborone(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: GABORONE_TZ });
}

/**
 * Format timestamp in CAT timezone for "Last fetch:0537 CAT"
 */
export function formatCATFetchTime(date: Date = new Date()): string {
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: GABORONE_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${timeStr.replace(':', '')} CAT`;
}

