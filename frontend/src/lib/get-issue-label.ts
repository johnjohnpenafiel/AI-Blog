/**
 * Issue/No. label computation for the public blog.
 *
 * A post's masthead label is derived purely from its `published_at`:
 *   - month  → calendar month of publication
 *   - issue  → ceil(day_of_month / 7)   →  1..5
 *   - no.    → position within the issue, ordered by published_at ascending
 *
 * UTC is used throughout so the label is deterministic regardless of viewer
 * timezone (backend stores `published_at` as UTC).
 */

export interface IssueBucket {
  year: number;
  month: number; // 1-12
  monthName: string; // "MAY"
  issue: number; // 1-5
}

export interface IssueLabel extends IssueBucket {
  no: number;
  formatted: string; // "MAY 2026 · ISSUE 03 · NO. 01"
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

function utcParts(input: string | Date): { year: number; month: number; day: number } {
  const d = toDate(input);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function getIssueBucket(publishedAt: string | Date): IssueBucket {
  const { year, month, day } = utcParts(publishedAt);
  const issue = Math.ceil(day / 7);
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })
    .toUpperCase();
  return { year, month, monthName, issue };
}

function sameBucket(a: IssueBucket, b: IssueBucket): boolean {
  return a.year === b.year && a.month === b.month && a.issue === b.issue;
}

export function getIssueNumber(
  publishedAt: string | Date,
  allPosts: ReadonlyArray<{ published_at: string }>,
): number {
  const target = getIssueBucket(publishedAt);
  const targetTime = toDate(publishedAt).getTime();
  const peers = allPosts
    .filter((p) => sameBucket(getIssueBucket(p.published_at), target))
    .map((p) => toDate(p.published_at).getTime())
    .sort((a, b) => a - b);
  const idx = peers.indexOf(targetTime);
  return idx >= 0 ? idx + 1 : 1;
}

export function formatIssueLabel(bucket: IssueBucket, no: number): string {
  const issueStr = String(bucket.issue).padStart(2, "0");
  const noStr = String(no).padStart(2, "0");
  return `${bucket.monthName} ${bucket.year} · ISSUE ${issueStr} · NO. ${noStr}`;
}

export function getIssueLabel(
  publishedAt: string | Date,
  allPosts: ReadonlyArray<{ published_at: string }>,
): IssueLabel {
  const bucket = getIssueBucket(publishedAt);
  const no = getIssueNumber(publishedAt, allPosts);
  return { ...bucket, no, formatted: formatIssueLabel(bucket, no) };
}
