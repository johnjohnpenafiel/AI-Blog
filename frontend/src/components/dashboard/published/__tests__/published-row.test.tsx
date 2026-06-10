import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
  is_featured: false,
  section: "Customer Experience",
  format: "Deep Dive",
  story_type: "Vendor Launch",
  eval_pov: 2,
  eval_format: 1,
  eval_grounding: 2,
  eval_passed: true,
};

function renderRow(
  overrides: Partial<PostListItem> = {},
  handlers: {
    onFeature?: (p: PostListItem) => void;
    onUnfeature?: (p: PostListItem) => void;
    busy?: boolean;
  } = {},
) {
  const post = { ...POST, ...overrides };
  return {
    post,
    ...render(
      <PublishedRow
        post={post}
        onFeature={handlers.onFeature ?? (() => {})}
        onUnfeature={handlers.onUnfeature ?? (() => {})}
        busy={handlers.busy ?? false}
      />,
    ),
  };
}

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
  it("renders title, summary, and minimal index (no tags or status)", () => {
    renderRow();
    expect(screen.getByText(POST.title)).toBeInTheDocument();
    expect(screen.getByText(POST.summary)).toBeInTheDocument();
    // Minimal index (section · format); tags are intentionally not shown.
    expect(screen.getByText("Customer Experience")).toBeInTheDocument();
    expect(screen.getByText("Deep Dive")).toBeInTheDocument();
    expect(screen.queryByText("Voice AI")).not.toBeInTheDocument();
    // Status badge removed — implied by the Published tab.
    expect(screen.queryByText(/Published/i)).not.toBeInTheDocument();
  });

  it("links View post to /blog/{slug} opening in a new tab", () => {
    renderRow();
    const link = screen.getByTestId("published-view-link") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/blog/ai-voice-agents");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows '★ Feature' and calls onFeature when not featured", () => {
    const onFeature = vi.fn();
    const { post } = renderRow({ is_featured: false }, { onFeature });
    const toggle = screen.getByTestId("published-feature-toggle");
    expect(toggle).toHaveTextContent(/^★ Feature$/i);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(onFeature).toHaveBeenCalledWith(post);
  });

  it("shows '★ Featured' and calls onUnfeature when featured", () => {
    const onUnfeature = vi.fn();
    const { post } = renderRow({ is_featured: true }, { onUnfeature });
    const toggle = screen.getByTestId("published-feature-toggle");
    expect(toggle).toHaveTextContent(/Featured/i);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle);
    expect(onUnfeature).toHaveBeenCalledWith(post);
  });

  it("disables the toggle while busy", () => {
    renderRow({ is_featured: false }, { busy: true });
    expect(screen.getByTestId("published-feature-toggle")).toBeDisabled();
  });
});
