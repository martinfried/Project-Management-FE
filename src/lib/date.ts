/**
 * Date formatting utilities following official Czech standards (ČSN 01 6910).
 * e.g. "2025-08-01" -> "1. 8. 2025"
 */

/**
 * Formats an ISO date string (e.g. "2025-08-01") or date object into Czech format "D. M. YYYY".
 * Safely parses year-month-day without timezone shift bugs.
 */
export function formatCzechDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return "";

  // If ISO datetime, strip time component for exact date representation
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${day}. ${month}. ${year}`;
    }
  }

  // Fallback for timestamps or alternative date formats
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  return dateStr;
}

/**
 * Formats an ISO datetime string into Czech format "D. M. YYYY H:MM".
 */
export function formatCzechDateTime(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return "";

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed);
  }

  return formatCzechDate(dateStr);
}
