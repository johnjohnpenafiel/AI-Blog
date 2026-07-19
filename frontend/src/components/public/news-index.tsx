"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import type { PublicPostListItem } from "@/lib/public-api";
import { dotDate } from "@/lib/public-format";

/**
 * The v5 News index — the entire homepage (Stripe-blog layout, from the
 * "The Garage AI v5" canvas).
 *
 * A giant "News" title with a superscript live count, then a two-column body:
 * a sticky filter tree on the left (Format / Section folder groups, each item
 * a checkbox with a live count — multi-select within a group, intersect
 * across groups) and the editorial row list on the right (date bullet ·
 * one-line title · plus glyph; whole row links to the dispatch and flips to
 * the hot-magenta hover).
 *
 * Both filter groups are DATA-DRIVEN: only formats/sections present in the
 * loaded posts render, so there are never dead buckets.
 */

/** Reading-mode filters (map to Post.format) — labels per the canvas. */
const FORMATS = [
  { id: "Brief", label: "2-Minute Intel" },
  { id: "Deep Dive", label: "Go Further" },
  { id: "Roundup", label: "The Week" },
  { id: "Explainer", label: "Start Here" },
];

function FolderIcon({ color = "var(--tg-orange)" }: { color?: string }) {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M1 3.4C1 2.63 1.63 2 2.4 2h3.5l1.6 1.8h7.1c.77 0 1.4.63 1.4 1.4v6.4c0 .77-.63 1.4-1.4 1.4H2.4C1.63 13 1 12.37 1 11.6V3.4Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="tg-fgroup">
      <button type="button" className="tg-fgroup-head" onClick={onToggle}>
        <span className="tg-fgroup-chev">{open ? "▾" : "▸"}</span>
        <FolderIcon />
        <span className="tg-fgroup-title">{title}</span>
      </button>
      {open && <div className="tg-fgroup-list">{children}</div>}
    </div>
  );
}

function FilterItem({
  label,
  count,
  checked,
  onClick,
}: {
  label: string;
  count: number;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="tg-fitem"
      data-checked={checked}
      onClick={onClick}
    >
      <span className="tg-fbox" />
      <span className="tg-fitem-label">
        {label} <span className="tg-fitem-count">({count})</span>
      </span>
    </button>
  );
}

function NewsRow({ post }: { post: PublicPostListItem }) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [trunc, setTrunc] = useState(false);

  // The ↗ read affordance only renders when the one-line title is NOT
  // ellipsized (a truncated title already fills the row to its edge).
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const check = () => setTrunc(el.scrollWidth > el.clientWidth + 1);
    check();
    window.addEventListener("resize", check);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(check).catch(() => {});
    }
    return () => window.removeEventListener("resize", check);
  }, [post.title]);

  return (
    <Link href={`/blog/${post.slug}`} className="tg-row">
      <div className="tg-row-main">
        <span className="tg-row-date">
          <span className="tg-row-bullet" />
          {dotDate(post.published_at)}
        </span>
        <span className="tg-row-name">
          <span className="tg-row-title" ref={titleRef}>
            {post.title}
          </span>
          {!trunc && (
            <span className="tg-row-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                <path
                  d="M5 13L13 5M13 5H6M13 5V12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </span>
        <span className="tg-row-plus">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <path d="M14 5v18M5 14h18" stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function NewsIndex({ posts }: { posts: PublicPostListItem[] }) {
  const [groups, setGroups] = useState({ format: true, section: true });
  const [fmt, setFmt] = useState<Set<string>>(() => new Set());
  const [sec, setSec] = useState<Set<string>>(() => new Set());
  const anyActive = fmt.size > 0 || sec.size > 0;

  const availFormats = FORMATS.filter((f) =>
    posts.some((p) => p.format === f.id),
  );
  const sections: string[] = [];
  for (const p of posts) {
    if (p.section && !sections.includes(p.section)) sections.push(p.section);
  }

  const countFmt = (id: string) => posts.filter((p) => p.format === id).length;
  const countSec = (s: string) => posts.filter((p) => p.section === s).length;

  const filtered = posts.filter(
    (p) =>
      (fmt.size === 0 || (p.format !== null && fmt.has(p.format))) &&
      (sec.size === 0 || (p.section !== null && sec.has(p.section))),
  );

  const toggleIn =
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>) =>
    (val: string) =>
      setter((prev) => {
        const n = new Set(prev);
        if (n.has(val)) {
          n.delete(val);
        } else {
          n.add(val);
        }
        return n;
      });
  const toggleFmt = toggleIn(setFmt);
  const toggleSec = toggleIn(setSec);

  return (
    <div className="tg-idx-scale" style={{ background: "var(--tg-bg)" }}>
      <div className="tg-idx-pad" style={{ padding: "52px 24px 64px" }}>
        <h1 className="tg-news-title">
          News
          <sup className="tg-news-count">
            ({String(posts.length).padStart(2, "0")})
          </sup>
        </h1>

        <div className="tg-idx">
          <div className="tg-idx-body">
            <aside className="tg-filters">
              <div className="tg-filters-head">
                <span className="tg-idx-label">/ Filters</span>
              </div>
              <FilterGroup
                title="Format"
                open={groups.format}
                onToggle={() => setGroups((g) => ({ ...g, format: !g.format }))}
              >
                {availFormats.map((f) => (
                  <FilterItem
                    key={f.id}
                    label={f.label}
                    count={countFmt(f.id)}
                    checked={fmt.has(f.id)}
                    onClick={() => toggleFmt(f.id)}
                  />
                ))}
              </FilterGroup>
              <FilterGroup
                title="Section"
                open={groups.section}
                onToggle={() =>
                  setGroups((g) => ({ ...g, section: !g.section }))
                }
              >
                {sections.map((s) => (
                  <FilterItem
                    key={s}
                    label={s}
                    count={countSec(s)}
                    checked={sec.has(s)}
                    onClick={() => toggleSec(s)}
                  />
                ))}
              </FilterGroup>
              {anyActive && (
                <button
                  type="button"
                  className="tg-clear"
                  onClick={() => {
                    setFmt(new Set());
                    setSec(new Set());
                  }}
                >
                  ✕ Clear all
                </button>
              )}
            </aside>

            <div className="tg-rows">
              <div className="tg-rows-head">
                <span className="tg-idx-label">/ Date</span>
                <span className="tg-idx-label">/ Name</span>
              </div>
              {posts.length === 0 ? (
                <div className="tg-rows-empty">
                  {
                    "// No dispatches published yet — the next drop is Monday at 08:00"
                  }
                </div>
              ) : filtered.length === 0 ? (
                <div className="tg-rows-empty">
                  {"// No dispatches match these filters"}
                </div>
              ) : (
                filtered.map((p) => <NewsRow key={p.slug} post={p} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
