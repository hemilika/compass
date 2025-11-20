import { formatDistanceToNow } from "date-fns";

/**
 * Formats a date string to a relative time ago, using the user's timezone
 */
export function formatTimeAgo(dateString: string): string {
  try {
    // Parse the date string and convert to user's local timezone
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Unknown time";
  }
}

