/**
 * Small presentation helpers shared across the public surface — date / read-time
 * formatting and the brand accent mapping (orange / sand / hot-orange).
 */

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** "MAY 28" — month + day, uppercase, no year (card / row dates). */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** "MAY 28, 2026" — full date (metadata block). */
export function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`;
}

/** "2 MIN" — read-time label. */
export function readLabel(minutes: number): string {
  return `${minutes} MIN`;
}

/**
 * Accent color for a format — orange is the default, sand marks the premium
 * Deep Dive, hot-orange the Roundup. Returns a CSS var reference.
 */
export function formatAccent(format: string | null | undefined): string {
  switch (format) {
    case "Deep Dive":
      return "var(--tg-sand)";
    case "Roundup":
      return "var(--tg-orange-bright)";
    default:
      return "var(--tg-orange)";
  }
}
