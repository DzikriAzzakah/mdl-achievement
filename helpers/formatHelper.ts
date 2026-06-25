/**
 * Convert a duration number + unit into a human-readable string.
 * e.g. (600, 'seconds') -> '10:00', (90, 'minutes') -> '1:30:00'
 */
export function formatDuration(value: number, unit: string): string {
  let totalSeconds = value;
  if (unit === 'minutes') {
    totalSeconds = value * 60;
  }
  else if (unit === 'hours') {
    totalSeconds = value * 3600;
  }
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Abbreviate a play count and append label.
 * e.g. 1500 -> '1.5K listens', 2000000 -> '2M listens'
 */
export function formatPlayCount(count: number | null): string {
  if (count == null) {
    return '';
  }
  let abbreviated: string;
  if (count >= 1_000_000) {
    abbreviated = `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  else if (count >= 1_000) {
    abbreviated = `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  else {
    abbreviated = String(count);
  }
  return `${abbreviated} listen${count > 1 ? 's' : ''}`;
}

/**
 * Convert a date string into a relative time-ago label.
 * e.g. '2025-06-01' -> '3 weeks ago'
 */
export function getTimeAgo(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) {
    return '';
  }
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }
  if (diffHrs < 24) {
    return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffWeeks < 5) {
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  }
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}
