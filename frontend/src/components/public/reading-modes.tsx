"use client";

import { useState } from "react";

import type { PublicPostListItem } from "@/lib/public-api";

import { PostCard } from "./post-card";

/**
 * Reading-modes band — "How do you want to read?" The four formats as
 * selectable preference cards; picking one surfaces the latest dispatches of
 * that format below. Each mode filters the live posts by `format`; empty
 * formats (e.g. Explainer, not yet produced) show a clean empty state.
 *
 * Mode copy maps to our real cadence: Brief = Monday, Deep Dive = Thursday,
 * Roundup = Friday. Explainer is evergreen (deferred).
 */
interface Mode {
  id: string; // matches Post.format
  label: string;
  sub: string;
  desc: string;
  accent: string;
  tag: string;
}

const MODES: Mode[] = [
  {
    id: "Brief",
    label: "2-Minute Intel",
    sub: "Monday drops",
    desc: "The signal, stripped down. What changed, why it matters — nothing else.",
    accent: "var(--tg-orange)",
    tag: "BRIEF",
  },
  {
    id: "Deep Dive",
    label: "Go Further",
    sub: "Thursday deep dives",
    desc: "Multi-source synthesis on the stories worth your full attention.",
    accent: "var(--tg-sand)",
    tag: "DEEP DIVE",
  },
  {
    id: "Roundup",
    label: "The Week",
    sub: "Friday roundup",
    desc: "Everything that moved the needle — wrapped in one read before the weekend.",
    accent: "var(--tg-orange-bright)",
    tag: "ROUNDUP",
  },
  {
    id: "Explainer",
    label: "Start Here",
    sub: "Evergreen guides",
    desc: "Understand the technology before the news. Fundamentals that don't expire.",
    accent: "var(--tg-orange)",
    tag: "EXPLAINER",
  },
];

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
      onClick={() => onSelect(mode.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: "left",
        padding: "16px 18px",
        border: `1px solid ${
          active
            ? mode.accent
            : hov
              ? "rgba(232,80,20,0.32)"
              : "transparent"
        }`,
        background: active
          ? "rgba(232,80,20,0.08)"
          : hov
            ? "rgba(232,80,20,0.04)"
            : "rgba(255,255,255,0.012)",
        cursor: "pointer",
        transition: "all 0.18s",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        height: "100%",
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
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "112%",
              fontSize: 16,
              letterSpacing: "0.01em",
              color: lit ? "var(--tg-ink)" : "#c8c4be",
              transition: "color 0.18s",
            }}
          >
            {mode.label}
          </span>
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 8,
              letterSpacing: "0.14em",
              color: mode.accent,
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {active ? "● " : ""}
            {mode.tag}
          </span>
        </span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--tg-font-mono)",
            fontSize: 9,
            color: "var(--tg-faint)",
            letterSpacing: "0.08em",
            marginBottom: 7,
            textTransform: "uppercase",
          }}
        >
          {mode.sub}
        </span>
        <span
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

export function ReadingModes({
  postsByFormat,
}: {
  postsByFormat: Record<string, PublicPostListItem[]>;
}) {
  const [activeId, setActiveId] = useState("Brief");
  const activeMode = MODES.find((m) => m.id === activeId) ?? MODES[0];
  const modePosts = (postsByFormat[activeId] ?? []).slice(0, 4);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        borderBottom: "1px solid var(--tg-frame-hair)",
        background: "var(--tg-band)",
      }}
    >
      <div style={{ paddingLeft: 24, paddingTop: 32 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--tg-faint)",
          }}
        >
          (*)
        </span>
      </div>
      <div style={{ padding: "30px 32px 36px 0" }}>
        <div style={{ marginBottom: 18 }}>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            border: "1px solid var(--tg-frame)",
          }}
        >
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              active={activeId === mode.id}
              onSelect={setActiveId}
            />
          ))}
        </div>

        {/* latest posts for selected mode */}
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <span
              className="tg-pulse"
              style={{ width: 6, height: 6, background: activeMode.accent }}
            />
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--tg-ink)",
                textTransform: "uppercase",
              }}
            >
              Latest in {activeMode.label}
            </span>
            <span
              style={{
                flex: 1,
                height: 1,
                background: "var(--tg-frame-hair)",
                minWidth: 20,
              }}
            />
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9,
                letterSpacing: "0.14em",
                color: "var(--tg-faint)",
                textTransform: "uppercase",
              }}
            >
              {String(modePosts.length).padStart(2, "0")} {activeMode.tag} ·{" "}
              {activeMode.sub}
            </span>
          </div>

          {modePosts.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "var(--tg-faint)",
                textTransform: "uppercase",
                padding: "20px 0",
              }}
            >
              {`// No ${activeMode.tag} dispatches yet`}
            </div>
          ) : (
            <div className="tg-post-grid">
              {modePosts.map((post) => (
                <PostCard key={post.slug} post={post} accent={activeMode.accent} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
