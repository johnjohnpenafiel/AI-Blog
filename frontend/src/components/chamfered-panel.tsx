"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type ChamferTier = "structural" | "component";
export type ChamferSize = "sidebar" | "shell" | "card" | "button" | "tag";
export type ChamferCut = "single" | "dual" | "quad";

const CUT_PX: Record<ChamferSize, number> = {
  sidebar: 20,
  shell: 20,
  card: 16,
  button: 12,
  tag: 6,
};

const DEFAULT_CUT: Record<ChamferSize, ChamferCut> = {
  sidebar: "dual",
  shell: "dual",
  card: "single",
  button: "dual",
  tag: "quad",
};

interface ChamferedPanelProps {
  tier?: ChamferTier;
  size?: ChamferSize;
  cut?: ChamferCut;
  className?: string;
  style?: CSSProperties;
  background?: string;
  children?: ReactNode;
}

function getClipPath(cut: ChamferCut, n: number): string {
  switch (cut) {
    case "single":
      return `polygon(${n}px 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${n}px)`;
    case "dual":
      return `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`;
    case "quad":
      return `polygon(${n}px 0%, calc(100% - ${n}px) 0%, 100% ${n}px, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, ${n}px 100%, 0% calc(100% - ${n}px), 0% ${n}px)`;
  }
}

function getPolygonPoints(cut: ChamferCut, n: number, w: number, h: number): string {
  switch (cut) {
    case "single":
      return `${n},0 ${w},0 ${w},${h} 0,${h} 0,${n}`;
    case "dual":
      return `${n},0 ${w},0 ${w},${h - n} ${w - n},${h} 0,${h} 0,${n}`;
    case "quad":
      return `${n},0 ${w - n},0 ${w},${n} ${w},${h - n} ${w - n},${h} ${n},${h} 0,${h - n} 0,${n}`;
  }
}

function getChamferLines(
  cut: ChamferCut,
  n: number,
  w: number,
  h: number,
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const lines = [{ x1: 0, y1: n, x2: n, y2: 0 }]; // TL — present in all cut variants
  if (cut === "dual") {
    lines.push({ x1: w, y1: h - n, x2: w - n, y2: h }); // BR
  }
  if (cut === "quad") {
    lines.push({ x1: w - n, y1: 0, x2: w, y2: n }); // TR
    lines.push({ x1: w, y1: h - n, x2: w - n, y2: h }); // BR
    lines.push({ x1: n, y1: h, x2: 0, y2: h - n }); // BL
  }
  return lines;
}

export function ChamferedPanel({
  tier = "component",
  size = "card",
  cut,
  className,
  style,
  background,
  children,
}: ChamferedPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const n = CUT_PX[size];
  const resolvedCut = cut ?? DEFAULT_CUT[size];
  const clipPath = getClipPath(resolvedCut, n);

  // Measure synchronously on first paint, then track via ResizeObserver.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDims({ w: rect.width, h: rect.height });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const defaultBg = tier === "structural" ? "var(--structural)" : "var(--surface)";
  const fillBackground = background ?? defaultBg;
  const perimeterStroke =
    tier === "structural" ? "var(--accent-structural)" : "var(--border)";
  const chamferStroke = "var(--accent)";
  const chamferOpacity = tier === "structural" ? 0.7 : 1;
  const chamferWidth = tier === "structural" ? 2 : 1.5;

  return (
    <div ref={ref} className={cn("relative", className)} style={style}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          clipPath,
          WebkitClipPath: clipPath,
          background: fillBackground,
        }}
      />
      <div className="relative h-full w-full">{children}</div>
      {dims.w > 0 && dims.h > 0 && (
        <svg
          aria-hidden
          data-testid="chamfered-panel-border"
          data-tier={tier}
          data-size={size}
          data-cut={resolvedCut}
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={getPolygonPoints(resolvedCut, n, dims.w, dims.h)}
            fill="none"
            stroke={perimeterStroke}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {getChamferLines(resolvedCut, n, dims.w, dims.h).map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={chamferStroke}
              strokeOpacity={chamferOpacity}
              strokeWidth={chamferWidth}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}
    </div>
  );
}
