// Utilities for weekly reset calculations
// Week resets every Monday at 00:00 UTC

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Returns whole days left until next Monday (00:00 UTC)
export function getDaysUntilNextMondayUTC(now: Date = new Date()): number {
  const day = now.getUTCDay(); // 0=Sun,1=Mon,...6=Sat
  // Days until Monday: if Mon (1) -> 7, if Tue (2) -> 6, ..., if Sun (0) -> 1
  const daysUntilMonday = day === 0 ? 1 : (8 - day);
  return daysUntilMonday;
}

export function getCurrentWeekRangeUTC(now: Date = new Date()): { start: Date; end: Date } {
  // Monday 00:00 UTC to next Monday 00:00 UTC
  const day = now.getUTCDay();
  const daysSinceMonday = (day + 6) % 7; // Mon->0, Tue->1, ..., Sun->6
  const mondayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday,
    0, 0, 0, 0
  ));
  const nextMonday = new Date(mondayStart.getTime() + 7 * MS_PER_DAY);
  return { start: mondayStart, end: nextMonday };
}
