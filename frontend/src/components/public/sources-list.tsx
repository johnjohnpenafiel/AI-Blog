import type { PublicPostSource } from "@/lib/public-api";
import { longDate } from "@/lib/public-format";

/**
 * Sources band — the editorial contract: every dispatch lists its sources
 * (title, publisher, date, link). The handoff article didn't include this
 * section, so it's recreated here in the design language (gutter row, mono
 * "SOURCES [n]" header, orange-underline source links). Rendered as a full
 * band — the page drops it straight into the scroll region.
 */
export function SourcesList({ sources }: { sources: PublicPostSource[] }) {
  return (
    <div
      className="tg-band"
      style={{
        borderTop: "1px solid var(--tg-frame-hair)",
        background: "var(--tg-band)",
      }}
    >
      <div
        className="tg-band-content"
        style={{ padding: "34px var(--tg-content-pad) 40px 0" }}
      >
        <div
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "var(--tg-ink)",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Sources [{String(sources.length).padStart(2, "0")}]
        </div>

        {sources.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--tg-faint)",
              textTransform: "uppercase",
            }}
          >
            {"// No sources listed"}
          </div>
        ) : (
          <ol
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 720,
            }}
          >
            {sources.map((src, i) => (
              <li
                key={`${src.url}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 10,
                  borderBottom: "1px solid var(--tg-frame-hair)",
                  paddingBottom: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--tg-font-mono)",
                    fontSize: 10,
                    color: "var(--tg-faint)",
                    letterSpacing: "0.1em",
                    paddingTop: 2,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tg-body-link"
                    style={{
                      fontFamily: "var(--tg-font-display)",
                      fontStretch: "108%",
                      fontSize: 15,
                      lineHeight: 1.4,
                    }}
                  >
                    {src.title}
                  </a>
                  <span
                    style={{
                      fontFamily: "var(--tg-font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      color: "var(--tg-faint)",
                      textTransform: "uppercase",
                    }}
                  >
                    {src.publisher}
                    {src.published_date ? ` · ${longDate(src.published_date)}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
