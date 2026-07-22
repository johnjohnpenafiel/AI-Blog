import type { PublicPostListItem } from "@/lib/public-api";

/**
 * "/ Statistics" marquee band (stripe.dev's statistics ticker in the stage's
 * language): a mono rule-label head, then an infinite leftward crawl of
 * `LABEL: [value]` pairs — dashed sand value chips between dashed separators.
 * Sits between the homepage spotlight and the News index.
 *
 * The stats are radical transparency about the machine: what the pipeline
 * has published, cited, and generated. Derived server-side from the same
 * post list the page already fetches — no extra requests.
 */

interface Stat {
  label: string;
  value: string;
}

function buildStats(posts: PublicPostListItem[], total: number): Stat[] {
  const covers = posts.filter((p) => p.image_url).length;
  const minutes = posts.reduce((sum, p) => sum + p.read_time_minutes, 0);
  // Sources-cited / publishers-read counts are deliberately absent: they
  // aren't in the public list payload yet — needs the run-metadata / stats
  // endpoint (Trello: "Track articles-screened count in the pipeline").
  return [
    { label: "Dispatches published", value: String(total) },
    { label: "Covers generated", value: String(covers) },
    { label: "Minutes of reading", value: String(minutes) },
    { label: "Human edits", value: "0" },
  ];
}

function StatRun({ stats, hidden }: { stats: Stat[]; hidden?: boolean }) {
  return (
    <div className="tg-stats-group" aria-hidden={hidden || undefined}>
      {stats.map((s) => (
        <span key={s.label} className="tg-stat">
          <span className="tg-stat-label">{s.label}:</span>
          <span className="tg-stat-chip">{s.value}</span>
          <span className="tg-stat-sep" />
        </span>
      ))}
    </div>
  );
}

export function StatsTicker({
  posts,
  total,
}: {
  posts: PublicPostListItem[];
  total: number;
}) {
  if (total === 0) return null;
  const stats = buildStats(posts, total);
  return (
    <section className="tg-stats" aria-label="Statistics">
      <div className="tg-stats-head">/ Statistics</div>
      <div className="tg-stats-marquee">
        <div className="tg-stats-track">
          <StatRun stats={stats} />
          {/* Seamless loop: the track holds two identical runs and translates
              by -50%, so the second run's start lands exactly on the first's. */}
          <StatRun stats={stats} hidden />
        </div>
      </div>
    </section>
  );
}
