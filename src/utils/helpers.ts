import { differenceInDays, formatDistance, parseISO, isValid } from "date-fns";

/** Accepts a Date or ISO string and returns a valid Date (throws on invalid). */
function toDate(input: Date | string): Date {
  if (input instanceof Date) {
    const d = new Date(input.getTime());
    if (!isValid(d)) throw new Error("Invalid Date object");
    return d;
  }
  const d = parseISO(String(input));
  if (!isValid(d)) throw new Error(`Invalid date string: ${input}`);
  return d;
}

/**
 * Difference in whole days between two dates.
 * Works with Date objects and ISO strings.
 */
export function subtractDates(
  date1: Date | string,
  date2: Date | string
): number {
  return differenceInDays(toDate(date1), toDate(date2));
}

/**
 * Human-friendly distance from now (e.g., "3 minutes ago", "In 2 days").
 * Matches your original tweaks (remove "about ", capitalize "In").
 */
export function formatDistanceFromNow(date: Date | string): string {
  const d = toDate(date);
  let out = formatDistance(d, new Date(), { addSuffix: true });
  out = out.replace(/^about\s+/i, ""); // remove leading "about "
  // Ensure capitalized "In" for future dates
  out = out.replace(/^in\b/i, "In");
  return out;
}

/**
 * Returns an ISO timestamp for today with time zeroed or set to end of day (UTC),
 * stable across renders (ms set deterministically).
 *
 * @param options.end If true, sets to 23:59:59.999 UTC; otherwise 00:00:00.000 UTC.
 */
export function getToday(options: { end?: boolean } = {}): string {
  const today = new Date();
  if (options.end) {
    // last millisecond of the UTC day
    today.setUTCHours(23, 59, 59, 999);
  } else {
    // start of the UTC day
    today.setUTCHours(0, 0, 0, 0);
  }
  return today.toISOString();
}

/**
 * Currency formatter with sensible defaults.
 * Pass a locale and currency code if you need something else.
 */
export function formatCurrency(
  value: number,
  opts: { locale?: string; currency?: string } = {}
): string {
  const { locale = "en", currency = "USD" } = opts;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value
  );
}
