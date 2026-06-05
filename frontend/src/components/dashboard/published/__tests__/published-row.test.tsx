import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PublishedRow } from "../published-row";
import type { PostListItem } from "@/lib/api";

const POST: PostListItem = {
  id: "pub-1",
  slug: "ai-voice-agents",
  title: "AI Voice Agents Reshape Service",
  summary: "Dealerships are deploying voice agents across the BDC.",
  tags: ["Voice AI", "CRM"],
  status: "published",
  created_at: "2026-05-04T08:00:00Z",
  scheduled_at: null,
  published_at: "2026-05-04T08:00:00Z",
  generation_attempt: 1,
  eval_pov: 2,
  eval_format: 1,
  eval_grounding: 2,
  eval_passed: true,
};

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 720,
    height: 200,
    top: 0,
    right: 720,
    bottom: 200,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PublishedRow", () => {
  it("renders title, summary, tags, and PUBLISHED marker", () => {
    render(<PublishedRow post={POST} />);
    expect(screen.getByText(POST.title)).toBeInTheDocument();
    expect(screen.getByText(POST.summary)).toBeInTheDocument();
    expect(screen.getByText("Voice AI")).toBeInTheDocument();
    expect(screen.getByText(/Published/i)).toBeInTheDocument();
  });

  it("links View post to /blog/{slug} opening in a new tab", () => {
    render(<PublishedRow post={POST} />);
    const link = screen.getByTestId("published-view-link") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/blog/ai-voice-agents");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
