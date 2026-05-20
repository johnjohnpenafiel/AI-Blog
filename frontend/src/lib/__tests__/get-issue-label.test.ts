import { describe, expect, it } from "vitest";

import {
  formatIssueLabel,
  getIssueBucket,
  getIssueLabel,
  getIssueNumber,
} from "@/lib/get-issue-label";

describe("getIssueBucket — day buckets", () => {
  it.each([
    ["2026-05-01T08:00:00Z", 1],
    ["2026-05-07T23:59:00Z", 1],
    ["2026-05-08T00:00:00Z", 2],
    ["2026-05-14T23:59:00Z", 2],
    ["2026-05-15T08:00:00Z", 3],
    ["2026-05-21T23:59:00Z", 3],
    ["2026-05-22T08:00:00Z", 4],
    ["2026-05-28T23:59:00Z", 4],
    ["2026-05-29T08:00:00Z", 5],
    ["2026-05-31T23:59:00Z", 5],
  ])("%s falls in Issue %i", (iso, expected) => {
    expect(getIssueBucket(iso).issue).toBe(expected);
  });

  it("computes year/month/monthName", () => {
    const bucket = getIssueBucket("2026-05-18T08:00:00Z");
    expect(bucket.year).toBe(2026);
    expect(bucket.month).toBe(5);
    expect(bucket.monthName).toBe("MAY");
    expect(bucket.issue).toBe(3);
  });

  it("uses UTC, not local time, for the day calculation", () => {
    // 2026-05-08T03:00:00Z is still May 7 in PST (UTC-7) — must bucket by UTC.
    const bucket = getIssueBucket("2026-05-08T03:00:00Z");
    expect(bucket.issue).toBe(2);
  });

  it("handles 5-issue months (March 2026 has a 5th week)", () => {
    expect(getIssueBucket("2026-03-30T08:00:00Z").issue).toBe(5);
  });
});

describe("getIssueNumber — position within an issue", () => {
  it("returns ascending No. by published_at within the same issue", () => {
    const posts = [
      { published_at: "2026-05-04T08:00:00Z" }, // Issue 1, No. 1
      { published_at: "2026-05-07T08:00:00Z" }, // Issue 1, No. 2
      { published_at: "2026-05-11T08:00:00Z" }, // Issue 2, No. 1
    ];
    expect(getIssueNumber("2026-05-04T08:00:00Z", posts)).toBe(1);
    expect(getIssueNumber("2026-05-07T08:00:00Z", posts)).toBe(2);
    expect(getIssueNumber("2026-05-11T08:00:00Z", posts)).toBe(1);
  });

  it("handles manual extra posts that slot between cadence posts", () => {
    // Mon May 25 = No. 1, manual Wed May 27 = No. 2, Thu May 28 = No. 3
    const posts = [
      { published_at: "2026-05-25T08:00:00Z" },
      { published_at: "2026-05-27T14:30:00Z" },
      { published_at: "2026-05-28T08:00:00Z" },
    ];
    expect(getIssueNumber("2026-05-25T08:00:00Z", posts)).toBe(1);
    expect(getIssueNumber("2026-05-27T14:30:00Z", posts)).toBe(2);
    expect(getIssueNumber("2026-05-28T08:00:00Z", posts)).toBe(3);
  });

  it("skipped Monday → Thursday post is still No. 1 (no gap)", () => {
    // Issue 3 of May: Mon May 18 skipped, only Thu May 21 exists.
    const posts = [{ published_at: "2026-05-21T08:00:00Z" }];
    expect(getIssueNumber("2026-05-21T08:00:00Z", posts)).toBe(1);
  });

  it("filters out posts from other issues / months", () => {
    const posts = [
      { published_at: "2026-04-30T08:00:00Z" }, // April, ignored
      { published_at: "2026-05-04T08:00:00Z" }, // May Issue 1
      { published_at: "2026-05-25T08:00:00Z" }, // May Issue 4, ignored when targeting Issue 1
    ];
    expect(getIssueNumber("2026-05-04T08:00:00Z", posts)).toBe(1);
  });

  it("defaults to 1 when target is not in the input list", () => {
    expect(getIssueNumber("2026-05-04T08:00:00Z", [])).toBe(1);
  });
});

describe("formatIssueLabel", () => {
  it("renders `MONTH YEAR · ISSUE NN · NO. NN`", () => {
    const bucket = getIssueBucket("2026-05-18T08:00:00Z");
    expect(formatIssueLabel(bucket, 1)).toBe("MAY 2026 · ISSUE 03 · NO. 01");
  });

  it("zero-pads single-digit issue and No.", () => {
    const bucket = getIssueBucket("2026-01-04T08:00:00Z");
    expect(formatIssueLabel(bucket, 9)).toBe("JANUARY 2026 · ISSUE 01 · NO. 09");
  });

  it("does not zero-pad double-digit values", () => {
    const bucket = getIssueBucket("2026-05-04T08:00:00Z");
    expect(formatIssueLabel(bucket, 12)).toBe("MAY 2026 · ISSUE 01 · NO. 12");
  });
});

describe("getIssueLabel — combiner", () => {
  it("returns the full label for the latest post in an issue", () => {
    const posts = [
      { published_at: "2026-05-25T08:00:00Z" },
      { published_at: "2026-05-27T14:30:00Z" },
      { published_at: "2026-05-28T08:00:00Z" },
    ];
    const label = getIssueLabel("2026-05-28T08:00:00Z", posts);
    expect(label.year).toBe(2026);
    expect(label.month).toBe(5);
    expect(label.monthName).toBe("MAY");
    expect(label.issue).toBe(4);
    expect(label.no).toBe(3);
    expect(label.formatted).toBe("MAY 2026 · ISSUE 04 · NO. 03");
  });
});
