import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import * as api from "@/lib/api";
import { PublishedClient } from "../published-client";
import type { PostListItem } from "@/lib/api";

function makePost(n: number): PostListItem {
  return {
    id: `pub-${n}`,
    slug: `post-${n}`,
    title: `Published Post ${n}`,
    summary: `Summary ${n}`,
    tags: ["CRM"],
    status: "published",
    created_at: "2026-05-04T08:00:00Z",
    scheduled_at: null,
    published_at: "2026-05-04T08:00:00Z",
    generation_attempt: 1,
    is_featured: false,
    section: "Customer Experience",
    format: "Deep Dive",
    story_type: "Vendor Launch",
    image_url: null,
    eval_pov: 2,
    eval_format: 2,
    eval_grounding: 2,
    eval_passed: true,
  };
}

beforeEach(() => {
  // Default: nothing pinned. Individual tests override as needed.
  vi.spyOn(api, "getFeaturedPost").mockResolvedValue(null);
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

describe("PublishedClient", () => {
  it("shows empty state when no items", async () => {
    vi.spyOn(api, "listPosts").mockResolvedValue({ items: [], total: 0 });
    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByTestId("published-empty-state")).toBeInTheDocument();
    });
  });

  it("paginates 10 per page and fetches the next page on click", async () => {
    const firstPage = Array.from({ length: 10 }, (_, i) => makePost(i));
    const secondPage = [makePost(10), makePost(11)];

    const spy = vi
      .spyOn(api, "listPosts")
      .mockResolvedValueOnce({ items: firstPage, total: 12 })
      .mockResolvedValueOnce({ items: secondPage, total: 12 });

    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getAllByTestId("published-row")).toHaveLength(10);
    });

    // Two pages → a pagination control with a "Page 2" button.
    const pageTwo = screen.getByRole("button", { name: "Page 2" });
    fireEvent.click(pageTwo);

    await waitFor(() => {
      expect(screen.getAllByTestId("published-row")).toHaveLength(2);
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][1]).toEqual({ limit: 10, offset: 0 });
    expect(spy.mock.calls[1][1]).toEqual({ limit: 10, offset: 10 });
  });

  it("renders error state on fetch failure", async () => {
    vi.spyOn(api, "listPosts").mockRejectedValue(new Error("network down"));
    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network down/i);
    });
  });

  it("shows the empty spotlight when no post is pinned", async () => {
    vi.spyOn(api, "listPosts").mockResolvedValue({
      items: [makePost(1)],
      total: 1,
    });
    render(<PublishedClient />);
    await waitFor(() => {
      expect(
        screen.getByTestId("featured-spotlight-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows the featured spotlight with the pinned post's title", async () => {
    vi.spyOn(api, "listPosts").mockResolvedValue({
      items: [makePost(1)],
      total: 1,
    });
    vi.spyOn(api, "getFeaturedPost").mockResolvedValue({
      ...makePost(9),
      title: "Pinned Headline",
      is_featured: true,
    });
    render(<PublishedClient />);
    await waitFor(() => {
      const spotlight = screen.getByTestId("featured-spotlight");
      expect(spotlight).toHaveTextContent(/Featured on homepage/i);
      expect(spotlight).toHaveTextContent(/Pinned Headline/);
    });
  });

  it("features a post: calls the API, updates the row and the spotlight", async () => {
    const post = makePost(1);
    vi.spyOn(api, "listPosts").mockResolvedValue({ items: [post], total: 1 });
    const featureSpy = vi
      .spyOn(api, "featurePost")
      .mockResolvedValue({} as never);

    render(<PublishedClient />);
    await waitFor(() => {
      expect(
        screen.getByTestId("featured-spotlight-empty"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("published-feature-toggle"));

    await waitFor(() => {
      expect(featureSpy).toHaveBeenCalledWith(post.id);
      // spotlight flips from empty to the pinned post
      expect(screen.getByTestId("featured-spotlight")).toHaveTextContent(
        new RegExp(post.title),
      );
      // row toggle now reads "Featured"
      expect(screen.getByTestId("published-feature-toggle")).toHaveTextContent(
        /Featured/i,
      );
    });
  });

  it("unfeatures from the spotlight: calls the API and clears it", async () => {
    const post = { ...makePost(1), is_featured: true };
    vi.spyOn(api, "listPosts").mockResolvedValue({ items: [post], total: 1 });
    vi.spyOn(api, "getFeaturedPost").mockResolvedValue(post);
    const unfeatureSpy = vi
      .spyOn(api, "unfeaturePost")
      .mockResolvedValue({} as never);

    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByTestId("featured-spotlight")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("featured-spotlight-unfeature"));

    await waitFor(() => {
      expect(unfeatureSpy).toHaveBeenCalledWith(post.id);
      expect(
        screen.getByTestId("featured-spotlight-empty"),
      ).toBeInTheDocument();
    });
  });
});
