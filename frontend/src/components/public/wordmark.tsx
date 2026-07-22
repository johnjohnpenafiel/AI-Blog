"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Fit-to-width wordmark — the masthead "stage piece". Archivo 700 run EXTENDED
 * (125%), scaled so "THE GARAGE AI" spans the full masthead width. Ported from
 * the handoff's FitWordmark: measure the text's natural width at a probe size,
 * then set the real font-size so it exactly fills the container.
 */
export function Wordmark({
  text = "THE GARAGE AI",
  color = "var(--tg-orange)",
  fitText,
  scale = 1,
  letterFx = true,
}: {
  text?: string;
  color?: string;
  /** Size against THIS string instead of `text` — lets a shorter companion
      line (the homepage "WELCOME TO") render at the exact font size the
      main wordmark gets, rather than fitting its own width. */
  fitText?: string;
  /** Multiplier on the fitted font size (the welcome line runs slightly
      smaller than the title). */
  scale?: number;
  /** false = plain glyphs: no per-letter load sweep, no hover glow. */
  letterFx?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const txtRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(140);

  useLayoutEffect(() => {
    function fit() {
      const wrap = wrapRef.current;
      const txt = txtRef.current;
      if (!wrap || !txt) return;
      const avail = wrap.clientWidth;
      let natural: number;
      if (probeRef.current) {
        // The hidden probe renders fitText at a fixed 100px, so its width
        // is the measurement directly.
        natural = probeRef.current.scrollWidth;
      } else {
        const prev = txt.style.fontSize;
        txt.style.fontSize = "100px";
        natural = txt.scrollWidth;
        txt.style.fontSize = prev;
      }
      if (natural > 0) setSize((100 * avail) / natural);
    }
    fit();
    window.addEventListener("resize", fit);
    // Re-fit once webfonts load (Archivo metrics differ from the fallback).
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => {});
    }
    const t = setTimeout(fit, 350);
    return () => {
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, [text, fitText]);

  return (
    <div ref={wrapRef} style={{ width: "100%", lineHeight: 0.82, userSelect: "none" }}>
      {fitText && fitText !== text && (
        <span
          ref={probeRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: "var(--tg-font-display)",
            fontWeight: 700,
            fontStretch: "125%",
            letterSpacing: "-0.005em",
            fontSize: 100,
          }}
        >
          {fitText}
        </span>
      )}
      <span
        ref={txtRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          fontFamily: "var(--tg-font-display)",
          fontWeight: 700,
          fontStretch: "125%",
          letterSpacing: "-0.005em",
          fontSize: size * scale,
          lineHeight: 0.82,
          color,
          // Trim the box to cap-height/baseline so the masthead's equal
          // padding is OPTICALLY equal: Archivo's em box leaves 0.058em above
          // the caps but 0.076em below the baseline (hhea 878/-210, cap 686),
          // so untrimmed all-caps text sits visibly high. Falls back to the
          // near-equal line-height box where text-box is unsupported.
          ...({ textBox: "trim-both cap alphabetic" } as React.CSSProperties),
        }}
      >
        {/* Per-letter spans so each glyph can light up on hover (.tg-wm-letter). */}
        {letterFx
          ? Array.from(text).map((ch, i) =>
              ch === " " ? (
                <span key={i}>{" "}</span>
              ) : (
                <span
                  key={i}
                  className="tg-wm-letter"
                  // Load-time sweep: each letter's ignition is staggered by its
                  // position so the glow passes left → right (delay in the char
                  // index, so spaces keep the travel speed even).
                  style={{ animationDelay: `${400 + i * 55}ms` }}
                >
                  {ch}
                </span>
              ),
            )
          : text}
      </span>
    </div>
  );
}
