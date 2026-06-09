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

  it("renders rows and load-more when total > items", async () => {
    const firstPage = Array.from({ length: 20 }, (_, i) => makePost(i));
    const secondPage = [makePost(20), makePost(21)];

    const spy = vi
      .spyOn(api, "listPosts")
      .mockResolvedValueOnce({ items: firstPage, total: 22 })
      .mockResolvedValueOnce({ items: secondPage, total: 22 });

    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getAllByTestId("published-row")).toHaveLength(20);
    });

    const loadMore = screen.getByTestId("published-load-more");
    expect(loadMore).toBeInTheDocument();
    fireEvent.click(loadMore);

    await waitFor(() => {
      expect(screen.getAllByTestId("published-row")).toHaveLength(22);
      expect(screen.queryByTestId("published-load-more")).not.toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][1]).toEqual({ limit: 20, offset: 0 });
    expect(spy.mock.calls[1][1]).toEqual({ limit: 20, offset: 20 });
  });

  it("renders error state on fetch failure", async () => {
    vi.spyOn(api, "listPosts").mockRejectedValue(new Error("network down"));
    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network down/i);
    });
  });

  it("shows the empty readout when no post is pinned", async () => {
    vi.spyOn(api, "listPosts").mockResolvedValue({
      items: [makePost(1)],
      total: 1,
    });
    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByTestId("featured-readout-empty")).toBeInTheDocument();
    });
  });

  it("shows the featured readout with the pinned post's title", async () => {
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
      const readout = screen.getByTestId("featured-readout");
      expect(readout).toHaveTextContent(/Featured on homepage/i);
      expect(readout).toHaveTextContent(/Pinned Headline/);
    });
  });

  it("features a post: calls the API, updates the row and the readout", async () => {
    const post = makePost(1);
    vi.spyOn(api, "listPosts").mockResolvedValue({ items: [post], total: 1 });
    const featureSpy = vi
      .spyOn(api, "featurePost")
      .mockResolvedValue({} as never);

    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByTestId("featured-readout-empty")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("published-feature-toggle"));

    await waitFor(() => {
      expect(featureSpy).toHaveBeenCalledWith(post.id);
      // readout flips from empty to the pinned post
      expect(screen.getByTestId("featured-readout")).toHaveTextContent(
        new RegExp(post.title),
      );
      // row toggle now reads "Featured"
      expect(screen.getByTestId("published-feature-toggle")).toHaveTextContent(
        /Featured/i,
      );
    });
  });

  it("unfeatures from the readout: calls the API and clears the readout", async () => {
    const post = { ...makePost(1), is_featured: true };
    vi.spyOn(api, "listPosts").mockResolvedValue({ items: [post], total: 1 });
    vi.spyOn(api, "getFeaturedPost").mockResolvedValue(post);
    const unfeatureSpy = vi
      .spyOn(api, "unfeaturePost")
      .mockResolvedValue({} as never);

    render(<PublishedClient />);
    await waitFor(() => {
      expect(screen.getByTestId("featured-readout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("featured-readout-unfeature"));

    await waitFor(() => {
      expect(unfeatureSpy).toHaveBeenCalledWith(post.id);
      expect(screen.getByTestId("featured-readout-empty")).toBeInTheDocument();
    });
  });
});
