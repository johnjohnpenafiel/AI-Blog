"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * "Welcome to" — the homepage-only masthead eyebrow (desktop stage).
 *
 * On load the masthead reads "// Welcome to ▮ / THE GARAGE AI" — the
 * greeting in the console voice (mono eyebrow + blinking cursor). The first
 * scroll is CONSUMED by the eyebrow: while the page is at the top, wheel
 * input drives the masthead pair upward as one unit — greeting and wordmark
 * keep their distance, the greeting disappears behind the top frame line,
 * and the lower content does not move. Only once the wordmark is docked at
 * the top does native scrolling begin — from there the page behaves exactly
 * like every other page's resting masthead. Wheeling up at the top re-opens
 * the greeting the same way.
 *
 * Inputs the wheel hook can't see (scrollbar drag, keyboard, touch) fall
 * back to a scroll-position driver so the band never sticks open mid-page.
 * ≤768px this whole block is hidden with the desktop masthead.
 */

/** Wheel distance (px) that fully collapses the eyebrow. */
const RANGE = 140;

export function MastheadWelcome() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const scroller = document.querySelector(".tg-stage-scroll");
    let consumed = 0; // wheel px eaten by the collapse, 0..RANGE
    let raf = 0;

    const scrollTop = () => Math.max(scroller?.scrollTop ?? 0, window.scrollY);

    const apply = () => {
      raf = 0;
      // Primary driver is the consumed wheel input; the scroll position is
      // the fallback for inputs the wheel hook can't see.
      const p = Math.max(
        Math.min(1, consumed / RANGE),
        Math.min(1, scrollTop() / 80),
      );
      const h = inner.offsetHeight;
      // The band collapses while the line translates up by the SAME amount
      // the wordmark rises — the two travel together at a constant gap, and
      // the greeting exits through the top, clipped at the frame line (the
      // desktop masthead is overflow-hidden). Its bottom padding is sized so
      // it has fully cleared the frame by the time the wordmark docks.
      wrap.style.height = `${h * (1 - p)}px`;
      inner.style.transform = `translateY(${-p * h}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    // Consume wheel input while the band is open and the page is at the
    // top — the lower content only starts scrolling once the wordmark has
    // docked. Wheeling up at the top re-opens the band the same way.
    const onWheel = (e: WheelEvent) => {
      if (!inner.offsetParent) return; // masthead hidden (mobile bar world)
      if (scrollTop() > 0) return; // mid-page: native scroll owns it
      // Normalize line/page delta modes (Firefox) to pixels.
      const dy =
        e.deltaMode === 1
          ? e.deltaY * 16
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
      if (dy > 0 && consumed < RANGE) {
        const leftover = consumed + dy - RANGE;
        consumed = Math.min(RANGE, consumed + dy);
        e.preventDefault();
        // Hand any overshoot to the scroller so a big fling stays fluid.
        if (leftover > 0 && scroller) scroller.scrollTop += leftover;
        schedule();
      } else if (dy < 0 && consumed > 0) {
        consumed = Math.max(0, consumed + dy);
        e.preventDefault();
        schedule();
      }
    };

    apply();
    window.addEventListener("wheel", onWheel, { passive: false });
    scroller?.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("wheel", onWheel);
      scroller?.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <div ref={wrapRef} className="tg-welcome">
      <div ref={innerRef} className="tg-welcome-inner">
        Welcome to
        <span className="tg-welcome-cursor" aria-hidden="true" />
      </div>
    </div>
  );
}
