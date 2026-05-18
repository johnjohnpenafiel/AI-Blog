import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

export function formatRelative(
  iso: string | null,
  now: Date = new Date(),
): string {
  if (!iso) return "—";
  let then: Date;
  try {
    then = new Date(iso);
  } catch {
    return "—";
  }
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return "—";
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 45) return "JUST NOW";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} MIN AGO`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "HR" : "HRS"} AGO`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day} ${day === 1 ? "DAY" : "DAYS"} AGO`;
  const week = Math.round(day / 7);
  if (week < 9) return `${week} ${week === 1 ? "WK" : "WKS"} AGO`;
  return formatDate(iso);
}

export function formatWeekdayDateUpper(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      })
      .replace(",", "")
      .toUpperCase();
  } catch {
    return "—";
  }
}

export function formatTimeOfDay(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  } catch {
    return "—";
  }
}
