"use client";

import { useState } from "react";

import type { PublicPostListItem } from "@/lib/public-api";

import { DispatchRow } from "./dispatch-row";

/**
 * Dispatch index console — the section filter + the dispatch row list.
 *
 * Filter chips are DATA-DRIVEN: "All" plus exactly the sections present in the
 * loaded posts (first-seen order), each with a live count — so there are never
 * empty/dead buckets. Section is the v2 primary browse axis.
 */
const ALL = "All";

export function DispatchIndex({
  posts,
  hotSlug,
}: {
  posts: PublicPostListItem[];
  hotSlug?: string;
}) {
  const [active, setActive] = useState(ALL);

  // distinct sections in first-seen order
  const sections: string[] = [];
  for (const p of posts) {
    if (p.section && !sections.includes(p.section)) sections.push(p.section);
  }
  const chips = [ALL, ...sections];
  const countFor = (s: string) =>
    s === ALL ? posts.length : posts.filter((p) => p.section === s).length;

  const filtered =
    active === ALL ? posts : posts.filter((p) => p.section === active);

  return (
    <>
      {/* heading + filter chips */}
      <div
        style={{
          background: "var(--tg-band)",
          borderTop: "1px solid var(--tg-frame-hair)",
          borderBottom: "1px solid var(--tg-frame-hair)",
          display: "grid",
          gridTemplateColumns: "var(--tg-gutter) 1fr",
        }}
      >
        <div style={{ paddingLeft: 24, paddingTop: 28 }}>
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "var(--tg-faint)",
            }}
          >
            (index)
          </span>
        </div>
        <div style={{ padding: "26px 32px 22px 0" }}>
          <h3
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "115%",
              fontSize: "clamp(26px, 3vw, 38px)",
              letterSpacing: "-0.01em",
              color: "var(--tg-ink)",
              lineHeight: 1,
              margin: "0 0 18px",
            }}
          >
            {active === ALL ? "All Dispatches" : active}
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.map((sec) => (
              <button
                key={sec}
                type="button"
                className="tg-chip"
                data-active={active === sec}
                onClick={() => setActive(sec)}
              >
                <span>{sec}</span>
                <span className="tg-chip-count">
                  {String(countFor(sec)).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* dispatch rows */}
      <div style={{ background: "var(--tg-bg)" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "var(--tg-gutter) 1fr",
            }}
          >
            <div />
            <div
              style={{
                padding: "44px 32px",
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--tg-faint)",
                textTransform: "uppercase",
              }}
            >
              {"// No dispatches in this section yet"}
            </div>
          </div>
        ) : (
          filtered.map((p, i) => (
            <DispatchRow
              key={p.slug}
              post={p}
              index={i}
              hot={p.slug === hotSlug}
              last={i === filtered.length - 1}
            />
          ))
        )}
      </div>
    </>
  );
}
