import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { FeaturedSpotlight } from "../featured-spotlight";
import type { PostListItem } from "@/lib/api";

function makePost(overrides: Partial<PostListItem> = {}): PostListItem {
  return {
    id: "post-1",
    slug: "pinned-post",
    title: "Pinned Headline",
    summary: "A deliberately chosen story.",
    tags: ["CRM"],
    status: "published",
    created_at: "2026-05-04T08:00:00Z",
    scheduled_at: null,
    published_at: "2026-05-04T08:00:00Z",
    generation_attempt: 1,
    is_featured: true,
    section: "Customer Experience",
    format: "Deep Dive",
    story_type: "Vendor Launch",
    eval_pov: 2,
    eval_format: 2,
    eval_grounding: 2,
    eval_passed: true,
    ...overrides,
  };
}

describe("FeaturedSpotlight", () => {
  it("renders the empty panel when nothing is pinned", () => {
    render(<FeaturedSpotlight post={null} />);
    expect(screen.getByTestId("featured-spotlight-empty")).toHaveTextContent(
      /No post pinned/i,
    );
    expect(screen.queryByTestId("featured-spotlight")).not.toBeInTheDocument();
  });

  it("renders the pinned post with a public view link", () => {
    render(<FeaturedSpotlight post={makePost()} />);
    const spotlight = screen.getByTestId("featured-spotlight");
    expect(spotlight).toHaveTextContent(/Featured on homepage/i);
    expect(spotlight).toHaveTextContent("Pinned Headline");
    expect(screen.getByTestId("featured-spotlight-view")).toHaveAttribute(
      "href",
      "/blog/pinned-post",
    );
  });

  it("omits the unfeature button in read-only contexts", () => {
    render(<FeaturedSpotlight post={makePost()} />);
    expect(
      screen.queryByTestId("featured-spotlight-unfeature"),
    ).not.toBeInTheDocument();
  });

  it("calls onUnfeature when the button is clicked", () => {
    const onUnfeature = vi.fn();
    const post = makePost();
    render(<FeaturedSpotlight post={post} onUnfeature={onUnfeature} />);
    fireEvent.click(screen.getByTestId("featured-spotlight-unfeature"));
    expect(onUnfeature).toHaveBeenCalledWith(post);
  });
});
