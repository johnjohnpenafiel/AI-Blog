"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { readLabel, shortDate } from "@/lib/public-format";

/**
 * Reading-modes band — "How do you want to read?" The four formats as
 * selectable preference cards stacked VERTICALLY on the left; picking one drives
 * a HORIZONTAL (sideways-scrolling) CAROUSEL of PORTRAIT cards on the right.
 * Both halves live inside one bordered console (`.tg-rm-console`), divided by
 * a single hairline, so it reads as one module rather than two floating parts.
 *
 * Deliberately just two facts per format card — the name and what it's for.
 * Publishing-schedule details (which day it drops) don't belong on a "how do
 * you want to read" choice; that's process info, not a reading preference —
 * it lives on /about instead.
 *
 * The carousel is native CSS scroll-snap (`.tg-rm-viewport`, `scroll-snap-type:
 * x mandatory`): trackpad / touch swiping comes for free and stays smooth, no
 * scroll-hijacking. The centered card is emphasized (full opacity, accent
 * border) while the cards to the left and right PEEK in, dimmed and slightly
 * scaled. An IntersectionObserver watching a thin vertical center band marks the
 * active card; prev/next arrows and a dot row center a card via a viewport-only
 * scroll (`centerCard`, never `scrollIntoView` — that could scroll the whole
 * page to the band). It opens on card #2 so a card peeks on both sides. Mode
 * change remounts it.
 */
interface Mode {
  id: string; // matches Post.format
  label: string;
  desc: string;
  accent: string;
  tag: string; // short technical name — used only in the empty-state copy
}

const MODES: Mode[] = [
  {
    id: "Brief",
    label: "2-Minute Intel",
    desc: "The signal, stripped down. What changed, why it matters — nothing else.",
    accent: "var(--tg-orange)",
    tag: "BRIEF",
  },
  {
    id: "Deep Dive",
    label: "Go Further",
    desc: "Multi-source synthesis on the stories worth your full attention.",
    accent: "var(--tg-sand)",
    tag: "DEEP DIVE",
  },
  {
    id: "Roundup",
    label: "The Week",
    desc: "Everything that moved the needle — wrapped in one read before the weekend.",
    accent: "var(--tg-orange-bright)",
    tag: "ROUNDUP",
  },
  {
    id: "Explainer",
    label: "Start Here",
    desc: "Understand the technology before the news. Fundamentals that don't expire.",
    accent: "var(--tg-orange)",
    tag: "EXPLAINER",
  },
];

// Card width + peek + centering are all handled in CSS (`--rm-card-w` +
// `scroll-snap-align: center` + symmetric side padding), so navigation can use
// `scrollIntoView({ inline: "center" })` and stay responsive with no JS
// geometry constants to keep in sync.

function ModeCard({
  mode,
  active,
  onSelect,
}: {
  mode: Mode;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const lit = active || hov;
  return (
    <button
      type="button"
      className="tg-mode-card"
      data-active={active}
      onClick={() => onSelect(mode.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: "left",
        padding: "18px 20px",
        background: active
          ? "color-mix(in srgb, var(--tg-orange) 8%, var(--tg-band))"
          : hov
            ? "color-mix(in srgb, var(--tg-orange) 4%, var(--tg-band))"
            : "var(--tg-band)",
        cursor: "pointer",
        transition: "background 0.18s",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          width: 2,
          flexShrink: 0,
          alignSelf: "stretch",
          background: lit ? mode.accent : "var(--tg-frame)",
          transition: "background 0.18s",
        }}
      />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          className="tg-mode-label"
          style={{
            display: "block",
            fontFamily: "var(--tg-font-display)",
            fontWeight: 700,
            fontStretch: "112%",
            fontSize: 16,
            letterSpacing: "0.01em",
            color: lit ? "var(--tg-ink)" : "#c8c4be",
            marginBottom: 6,
            transition: "color 0.18s",
          }}
        >
          {mode.label}
        </span>
        <span
          className="tg-mode-desc"
          style={{
            display: "block",
            fontFamily: "var(--tg-font-display)",
            fontWeight: 400,
            fontStretch: "108%",
            fontSize: 12,
            lineHeight: 1.5,
            letterSpacing: "0.005em",
            color: "var(--tg-mute)",
          }}
        >
          {mode.desc}
        </span>
      </span>
    </button>
  );
}

/** One portrait carousel card: image slot on top, meta/title/summary/tags below. */
function CarouselCard({
  post,
  accent,
  index,
  active,
}: {
  post: PublicPostListItem;
  accent: string;
  index: number;
  active: boolean;
}) {
  // Max 2 tags: the card height is FIXED (--rm-card-h) so the console never
  // resizes with content — 2 is the most that fits the worst case (3-line
  // title + 3-line summary) without clipping.
  const points = post.tags.slice(0, 2);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="tg-rm-card"
      data-idx={index}
      style={{
        opacity: active ? 1 : 0.42,
        transform: active ? "scale(1)" : "scale(0.93)",
        borderColor: active ? accent : "var(--tg-frame-hair)",
      }}
    >
      <div className="tg-img-slot tg-rm-card-img" aria-hidden="true">
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- plain <img>: this is a patched Next.js; see AGENTS.md
          <img
            src={post.image_url}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <div className="tg-rm-card-body">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              color: accent,
              textTransform: "uppercase",
            }}
          >
            {shortDate(post.published_at)}
          </span>
          <span style={{ width: 3, height: 3, background: "var(--tg-frame)" }} />
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "var(--tg-faint)",
            }}
          >
            {readLabel(post.read_time_minutes)}
          </span>
        </div>

        <h4 className="tg-rm-card-title">{post.title}</h4>
        <p className="tg-rm-card-summary">{post.summary}</p>

        {points.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: "auto",
              minWidth: 0,
            }}
          >
            {points.map((pt) => (
              <span key={pt} className="tg-rm-card-point">
                <span style={{ color: accent }}>&gt;</span>
                <span className="tg-rm-card-tag">{pt}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * The carousel is remounted (via `key={activeId}` at the call site) on every
 * mode change, so it starts fresh at the top with `active = 0` — no reset
 * effect needed.
 */
function Carousel({ posts, accent }: { posts: PublicPostListItem[]; accent: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  // Open on card #2 (index 1) when there's more than one dispatch — that way a
  // card peeks on BOTH sides and the gallery reads as full. Falls back to card 1.
  const initialActive = Math.min(1, posts.length - 1);
  const [active, setActive] = useState(initialActive);

  // Center a card by nudging ONLY the carousel's own horizontal scroll (never
  // scrollIntoView, which could scroll the whole page to reach the band).
  const centerCard = useCallback((idx: number, smooth: boolean) => {
    const vp = viewportRef.current;
    const el = vp?.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    if (!vp || !el) return;
    const target =
      vp.scrollLeft +
      el.getBoundingClientRect().left -
      vp.getBoundingClientRect().left -
      (vp.clientWidth - el.clientWidth) / 2;
    vp.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // On mount, jump to the initial card (no animation, no page movement).
  useEffect(() => {
    centerCard(initialActive, false);
  }, [centerCard, initialActive]);

  // Mark the card crossing the viewport's vertical center band as active.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const cards = Array.from(vp.querySelectorAll<HTMLElement>("[data-idx]"));
    if (cards.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number(e.target.getAttribute("data-idx")));
          }
        }
      },
      { root: vp, rootMargin: "0px -47% 0px -47%", threshold: 0 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const goTo = (idx: number) => {
    centerCard(Math.max(0, Math.min(idx, posts.length - 1)), true);
  };

  const single = posts.length <= 1;

  return (
    <div className="tg-rm-carousel">
      <div ref={viewportRef} className="tg-rm-viewport">
        {posts.map((post, i) => (
          <CarouselCard
            key={post.slug}
            post={post}
            accent={accent}
            index={i}
            active={i === active}
          />
        ))}
      </div>

      {/* Always rendered — hidden (not removed) when there's nothing to
          navigate, so the stage block keeps the exact same height with one
          card as with five. The console must never resize with post count. */}
      <div
        className="tg-rm-controls"
        style={{ visibility: single ? "hidden" : undefined }}
        aria-hidden={single}
      >
        <button
          type="button"
          className="tg-rm-nav"
          aria-label="Previous dispatch"
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
        >
          ‹
        </button>
        <div className="tg-rm-dots">
          {posts.map((post, i) => (
            <button
              key={post.slug}
              type="button"
              className="tg-rm-dot"
              aria-label={`Go to dispatch ${i + 1}`}
              data-active={i === active}
              onClick={() => goTo(i)}
              style={{ background: i === active ? accent : undefined }}
            />
          ))}
        </div>
        <button
          type="button"
          className="tg-rm-nav"
          aria-label="Next dispatch"
          disabled={active === posts.length - 1}
          onClick={() => goTo(active + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function ReadingModes({
  postsByFormat,
}: {
  postsByFormat: Record<string, PublicPostListItem[]>;
}) {
  // Defaults to Deep Dive ("Go Further") — temporary, while most published
  // posts happen to be that format, so the carousel looks full on first load
  // instead of possibly landing on a sparser format. Revisit once posts are
  // more evenly distributed across formats.
  const [activeId, setActiveId] = useState("Deep Dive");
  const activeMode = MODES.find((m) => m.id === activeId) ?? MODES[0];
  const modePosts = (postsByFormat[activeId] ?? []).slice(0, 5);

  return (
    <div
      className="tg-band"
      style={{
        borderBottom: "1px solid var(--tg-frame-hair)",
        background: "var(--tg-bg)",
      }}
    >
      <div className="tg-band-content" style={{ padding: "30px 32px 36px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--tg-mute)",
              textTransform: "uppercase",
            }}
          >
            How do you want to read?
          </span>
        </div>

        <div className="tg-rm-console">
          <div className="tg-rm-layout">
            {/* left: vertical filter list */}
            <div className="tg-rm-filters">
              {MODES.map((mode) => (
                <ModeCard
                  key={mode.id}
                  mode={mode}
                  active={activeId === mode.id}
                  onSelect={setActiveId}
                />
              ))}
            </div>

            {/* right: vertical carousel */}
            <div className="tg-rm-stage">
              {modePosts.length === 0 ? (
                /* .tg-rm-empty is sized to the carousel block's exact
                   footprint — a format with zero posts renders the console
                   at the same height as one with five. */
                <div
                  className="tg-rm-empty"
                  style={{
                    fontFamily: "var(--tg-font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    color: "var(--tg-faint)",
                    textTransform: "uppercase",
                  }}
                >
                  {`// No ${activeMode.tag} dispatches yet`}
                </div>
              ) : (
                <Carousel key={activeId} posts={modePosts} accent={activeMode.accent} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
