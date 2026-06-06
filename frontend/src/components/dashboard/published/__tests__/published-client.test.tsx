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
});
