import type { PublicPostSource } from "@/lib/public-api";
import { dotDate } from "@/lib/public-format";

/**
 * "/ Sources" band — the editorial contract: every dispatch lists its sources
 * (title, publisher, date, link). Recomposed in the page's row language: the
 * same link-row family as "/ Related articles" (bullet + dotted date · light
 * title · mono publisher · ↗), flooding hot-magenta on hover. The whole row
 * is the outbound link.
 */
export function SourcesList({ sources }: { sources: PublicPostSource[] }) {
  return (
    <div className="tg-band-sec">
      <div className="tg-seclabel">/ Sources</div>

      {sources.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 13,
            letterSpacing: "0.14em",
            color: "var(--tg-faint)",
            textTransform: "uppercase",
          }}
        >
          {"// No sources listed"}
        </div>
      ) : (
        sources.map((src, i) => (
          <a
            key={`${src.url}-${i}`}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="tg-src-row"
          >
            <span className="tg-rel-date">
              <span className="tg-rel-bullet" />
              {src.published_date
                ? dotDate(src.published_date)
                : String(i + 1).padStart(2, "0")}
            </span>
            <span className="tg-rel-title">{src.title}</span>
            <span className="tg-src-pub">{src.publisher}</span>
            <span className="tg-rel-arrow">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3 9H15M15 9L10 4M15 9L10 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        ))
      )}
    </div>
  );
}
