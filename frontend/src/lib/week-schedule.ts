/**
 * Live cadence tracker for the hero masthead. The pipeline drops on a fixed
 * Mon / Thu / Fri rhythm (Brief / Deep Dive / Roundup); this derives, from the
 * week's own published posts, which slots have landed, which are still upcoming,
 * and which passed without a drop — so the hero shows a real weekly progress
 * bar instead of a static schedule.
 *
 * "This week" is Monday 00:00 through the following Sunday, computed in the
 * server's timezone (UTC in prod) — good enough for a visual weekly readout.
 */
import type { PublicPostListItem } from "@/lib/public-api";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** The three cadence slots, in publish order. Mirrors WEEKDAY_FORMATS in the backend scheduler. */
const SLOTS = [
  { day: "MON", weekday: 1, format: "Brief" },
  { day: "THU", weekday: 4, format: "Deep Dive" },
  { day: "FRI", weekday: 5, format: "Roundup" },
] as const;

export type SlotStatus = "live" | "upcoming" | "missed";

export interface WeekSlot {
  day: string; // "MON"
  format: string; // "Brief"
  status: SlotStatus;
  slug: string | null; // set when status === "live"
}

export interface WeekSchedule {
  slots: WeekSlot[];
  range: string; // "JUN 30 – JUL 04"
  /** True once every slot is in the past (live/missed) — the week is done, so the UI points at the next drop. */
  complete: boolean;
}

function label(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

export function computeWeekSchedule(
  posts: PublicPostListItem[],
  now: Date = new Date(),
): WeekSchedule {
  // Monday-based weekday: Mon=1 … Sun=7.
  const todayWd = ((now.getDay() + 6) % 7) + 1;

  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (todayWd - 1));

  const slots: WeekSlot[] = SLOTS.map((s) => {
    const post = posts.find(
      (p) => p.format === s.format && new Date(p.published_at) >= monday,
    );
    let status: SlotStatus;
    if (post) status = "live";
    else if (todayWd > s.weekday) status = "missed";
    else status = "upcoming";
    return { day: s.day, format: s.format, status, slug: post?.slug ?? null };
  });

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return {
    slots,
    range: `${label(monday)} – ${label(friday)}`,
    complete: slots.every((s) => s.status !== "upcoming"),
  };
}
