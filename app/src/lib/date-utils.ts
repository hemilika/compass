import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Formats a date string to a relative time ago, using the user's timezone
 */
export function formatTimeAgo(dateString: string): string {
  try {
    // Parse the date string and convert to user's local timezone
    const date = dayjs(dateString).add(1, "hours");
    return date.fromNow();
  } catch {
    return "Unknown time";
  }
}
