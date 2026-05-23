"use client";

import { useEffect, useState } from "react";

interface DecodingTextProps {
  children: string;
  className?: string;
}

/**
 * Timing matches the hero's "scanning" narrative:
 *  - 0 → 3s   each character rapidly flips between 0/1, like a binary stream.
 *  - 3 → 4.5s characters "lock" to their real value in a left-to-right wave
 *             (matrix decode / split-flap train sign feel).
 *  - 4.5s+    settled.
 *
 * Mobile (<lg) and reduced-motion users see only the real text via CSS —
 * the animated span is hidden, the static span is visible. The animation
 * loop is also short-circuited so no timers run when not needed.
 */
const SCAN_DELAY_MS = 3000;
const SETTLE_WINDOW_MS = 1500;
const CYCLE_INTERVAL_MS = 55;

/**
 * Deterministic char-code-parity mapping → identical output across SSR and
 * client hydration. Non-alphanumerics (whitespace, punctuation, `/`, `·`)
 * pass through so the binary version keeps the same word boundaries and
 * line wrapping as the real text.
 */
function toInitialBinary(text: string): string[] {
  return text.split("").map((ch) => {
    if (/[a-zA-Z0-9]/.test(ch)) {
      return ch.charCodeAt(0) % 2 === 0 ? "0" : "1";
    }
    return ch;
  });
}

function randomBinaryChar(): string {
  return Math.random() < 0.5 ? "0" : "1";
}

export function DecodingText({ children, className }: DecodingTextProps) {
  const target = children;
  const [displayed, setDisplayed] = useState<string[]>(() =>
    toInitialBinary(target),
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.innerWidth < 1024;

    // Mobile / reduced-motion don't see the animated span (CSS hides it),
    // so skip starting timers entirely.
    if (prefersReducedMotion || isMobile) return;

    const targetChars = target.split("");
    const n = targetChars.length;
    const locked = new Set<number>();

    // Each char's lock time fans across SETTLE_WINDOW_MS after the scan
    // delay — char 0 locks first, last char locks last.
    const lockTimes = targetChars.map((_, i) =>
      n > 1 ? SCAN_DELAY_MS + (i / (n - 1)) * SETTLE_WINDOW_MS : SCAN_DELAY_MS,
    );

    // Cycling tick — replace every non-locked alphanumeric with a random 0/1.
    const cycleId = window.setInterval(() => {
      setDisplayed((prev) =>
        prev.map((ch, i) => {
          if (locked.has(i)) return targetChars[i];
          if (!/[a-zA-Z0-9]/.test(targetChars[i])) return targetChars[i];
          return randomBinaryChar();
        }),
      );
    }, CYCLE_INTERVAL_MS);

    // Schedule each char's lock-in.
    const lockIds = targetChars.map((ch, i) =>
      window.setTimeout(() => {
        locked.add(i);
        setDisplayed((prev) => {
          const next = prev.slice();
          next[i] = ch;
          return next;
        });
      }, lockTimes[i]),
    );

    // Safety: stop cycling once everything is locked and snap to final.
    const finalId = window.setTimeout(
      () => {
        window.clearInterval(cycleId);
        setDisplayed(targetChars);
      },
      SCAN_DELAY_MS + SETTLE_WINDOW_MS + 120,
    );

    return () => {
      window.clearInterval(cycleId);
      lockIds.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(finalId);
    };
  }, [target]);

  return (
    <span className={className}>
      {/* Animated character cascade — visible only on lg+ with motion. */}
      <span aria-hidden className="hidden lg:motion-safe:inline">
        {displayed.join("")}
      </span>
      {/* Static fallback — visible on mobile, reduced-motion, and always
          available to screen readers. */}
      <span className="lg:motion-safe:sr-only">{target}</span>
    </span>
  );
}
