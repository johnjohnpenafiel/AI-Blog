/**
 * Scrolling headline ticker (the masthead's lower band). Pure-CSS infinite
 * scroll: the item list is rendered twice and the track animates to -50%, so
 * the loop is seamless without any JS interval — this stays a server component.
 *
 * Items are fed real, recent dispatch headlines interleaved with brand
 * taglines (accent), built in `buildTickerItems` — we never ship fabricated
 * claims in the ticker.
 */
export interface TickerItem {
  text: string;
  accent: boolean;
}

const BRAND_TAGLINES = [
  "AI AS THE DEALERSHIP OPERATING SYSTEM",
  "TWO DISPATCHES A WEEK · ZERO HYPE",
  "THE SIGNAL ON DEALERSHIP AI",
];

/** Interleave recent post titles (plain) with brand taglines (accent). */
export function buildTickerItems(titles: string[]): TickerItem[] {
  if (titles.length === 0) {
    return BRAND_TAGLINES.map((text) => ({ text, accent: true }));
  }
  const items: TickerItem[] = [];
  let tagIdx = 0;
  titles.forEach((title, i) => {
    items.push({ text: title, accent: false });
    if (i % 3 === 2 && tagIdx < BRAND_TAGLINES.length) {
      items.push({ text: BRAND_TAGLINES[tagIdx++], accent: true });
    }
  });
  if (!items.some((x) => x.accent)) {
    items.push({ text: BRAND_TAGLINES[0], accent: true });
  }
  return items;
}

export function Ticker({ items }: { items: TickerItem[] }) {
  // Duplicate the list so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="tg-ticker">
      <div className="tg-ticker-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="tg-ticker-item"
            data-accent={item.accent ? "true" : "false"}
          >
            {item.accent ? "◆ " : "— "}
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
