"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SourcesList } from "@/components/public/sources-list";
import type { PublicPostDetail } from "@/lib/public-api";
import { dotDate } from "@/lib/public-format";

/**
 * The dispatch page body — hero title, sticky metadata sidebar, and the
 * article column — ported 1:1 from the "The Garage AI Post v2" canvas.
 *
 * The sidebar carries a mini-title that slides in (grid-rows animation) once
 * the hero title scrolls out of view; the article's `/ Article` rule holds an
 * expand button that opens the full-page reader overlay (Escape / backdrop
 * closes it). Share is the canvas's two-button row (Twitter/X · LinkedIn).
 */

/** Static byline — the publication's voice (no per-post authors stored). */
const BYLINE = "The Garage Desk";

/**
 * Generated posts open with an `# H1` restating the title — the hero already
 * carries it, and the canvas article starts at the lede, so drop it.
 */
function stripLeadingH1(md: string): string {
  const t = md.trimStart();
  if (!t.startsWith("# ")) return t;
  const nl = t.indexOf("\n");
  return nl === -1 ? "" : t.slice(nl + 1);
}

/**
 * Split the markdown into [lede, rest] so the cover figure can sit between
 * the opening paragraph and the body, as composed on the canvas. Only a
 * plain-text first block is treated as the lede — content that opens with a
 * heading, list, quote, table, image, or code fence gets no lede split.
 */
function splitLede(md: string): [string | null, string] {
  const trimmed = stripLeadingH1(md).trimStart();
  const opensPlain = !/^(#{1,6}\s|>|[-*+]\s|```|\||!\[|\d+[.)]\s)/.test(trimmed);
  if (!opensPlain) return [null, trimmed];
  const idx = trimmed.search(/\n\s*\n/);
  if (idx === -1) return [trimmed, ""];
  return [trimmed.slice(0, idx), trimmed.slice(idx)];
}

/** FIG.0 — the AI-generated cover, or the marked placeholder slot. */
function CoverFig({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  return (
    <div className={imageUrl ? "tg-fig" : "tg-fig tg-fig-empty"}>
      <div className={imageUrl ? "tg-fig-frame" : "tg-fig-frame tg-img-slot"}>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- plain <img>: this is a patched Next.js; see AGENTS.md
          <img src={imageUrl} alt={title} />
        )}
      </div>
      <div className="tg-figcap">
        {imageUrl ? "FIG.0 — Cover" : "FIG.0 — Lead image placeholder"}
      </div>
    </div>
  );
}

function ArticleBody({ post }: { post: PublicPostDetail }) {
  const [lede, rest] = splitLede(post.content);
  return (
    <>
      {lede && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => {
              void node;
              return <p className="tg-lede" {...props} />;
            },
          }}
        >
          {lede}
        </ReactMarkdown>
      )}
      <CoverFig imageUrl={post.image_url} title={post.title} />
      {rest && <ReactMarkdown remarkPlugins={[remarkGfm]}>{rest}</ReactMarkdown>}
    </>
  );
}

function MetaSidebar({ post, showTitle }: { post: PublicPostDetail; showTitle: boolean }) {
  const share = (kind: "x" | "in") => {
    const url = window.location.href;
    const href =
      kind === "x"
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className="tg-meta">
      <div className="tg-meta-minititle" data-show={showTitle} aria-hidden={!showTitle}>
        <div>
          <h2>{post.title}</h2>
        </div>
      </div>
      <div className="tg-colrule">
        <span className="tg-collabel">/ Metadata</span>
      </div>
      <div className="tg-meta-row">
        <span className="tg-meta-key">Date:</span>
        <span className="tg-meta-val" style={{ color: "var(--tg-orange)" }}>
          {dotDate(post.published_at)}
        </span>
      </div>
      <div className="tg-meta-row">
        <span className="tg-meta-key">Author:</span>
        <span className="tg-meta-chip">{BYLINE}</span>
      </div>
      <div className="tg-meta-row">
        <span className="tg-meta-key">Reading time:</span>
        <span className="tg-meta-val" style={{ color: "var(--tg-ink-soft)" }}>
          {post.read_time_minutes} min read
        </span>
      </div>
      {post.tags.length > 0 && (
        <div className="tg-meta-row">
          <span className="tg-meta-key">Categories:</span>
          <span className="tg-meta-chips">
            {post.tags.map((t) => (
              <span key={t} className="tg-meta-chip">
                {t}
              </span>
            ))}
          </span>
        </div>
      )}
      <div className="tg-meta-block">
        <span className="tg-meta-key">Share:</span>
        <div className="tg-btnrow">
          <button type="button" className="tg-btn" onClick={() => share("x")}>
            Twitter/X
          </button>
          <button type="button" className="tg-btn" onClick={() => share("in")}>
            LinkedIn
          </button>
        </div>
      </div>
    </aside>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M1 5V1h4M14 5V1h-4M1 10v4h4M14 10v4h-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M5 1v4H1M10 1v4h4M5 14v-4H1M10 14v-4h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ReaderOverlay({ post, onClose }: { post: PublicPostDetail; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="tg-reader"
      role="dialog"
      aria-modal="true"
      aria-label="Article reader"
      onClick={onClose}
    >
      <div className="tg-reader-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="tg-expand-btn tg-reader-close"
          onClick={onClose}
          aria-label="Close reader"
        >
          <CollapseIcon />
        </button>
        <div className="tg-reader-scroll">
          <div className="tg-reader-inner tg-article">
            <ArticleBody post={post} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostView({ post }: { post: PublicPostDetail }) {
  const heroRef = useRef<HTMLHeadingElement>(null);
  const [titleGone, setTitleGone] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = reading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [reading]);

  // The sidebar mini-title appears once the hero title leaves the scrollport.
  // Desktop scrolls inside .tg-stage-scroll, mobile scrolls the document —
  // pick the observer root to match (same probe as the canvas).
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const root = document.querySelector(".tg-stage-scroll");
    const io = new IntersectionObserver(
      ([entry]) => setTitleGone(!entry.isIntersecting),
      {
        root:
          root && getComputedStyle(root).overflowY === "auto" ? root : null,
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="tg-hero">
        <h1 className="tg-hero-title" ref={heroRef}>
          {post.title}
        </h1>
      </div>
      <div className="tg-post">
        <MetaSidebar post={post} showTitle={titleGone} />
        <div className="tg-artcol">
          <div className="tg-colrule">
            <span className="tg-collabel">/ Article</span>
            <button
              type="button"
              className="tg-expand-btn"
              onClick={() => setReading(true)}
              aria-label="Open full-page reader"
            >
              <ExpandIcon />
            </button>
          </div>
          <div style={{ height: 22 }} />
          <div className="tg-article">
            <ArticleBody post={post} />
          </div>
          <SourcesList sources={post.sources} />
        </div>
      </div>
      {reading && <ReaderOverlay post={post} onClose={() => setReading(false)} />}
    </>
  );
}
