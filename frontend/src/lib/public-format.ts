/**
 * Small presentation helpers shared across the public surface — date
 * formatting for the index rows, post metadata, and source citations.
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

/** "MAY 28, 2026" — full date (source citations). */
export function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`;
}


/** "2026.7.17" — the index's dotted date (month unpadded, day padded). */
export function dotDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}
