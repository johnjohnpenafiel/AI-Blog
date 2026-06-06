import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { PostsIndex } from "../posts-index";
import type { PublicPostListItem } from "@/lib/public-api";

function post(
  slug: string,
  section: string | null,
  title = `Title ${slug}`,
): PublicPostListItem {
  return {
    id: slug,
    slug,
    title,
    summary: `Summary ${slug}`,
    tags: ["Voice AI"],
    section,
    format: "Brief",
    published_at: "2026-05-04T08:00:00Z",
    read_time_minutes: 3,
  };
}

const POSTS = [
  post("a", "Customer Experience"),
  post("b", "Pricing & Analytics"),
  post("c", "Customer Experience"),
];

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

describe("PostsIndex section filter", () => {
  it("derives one pill per section present (plus ALL), no empty buckets", () => {
    render(<PostsIndex posts={POSTS} />);
    expect(screen.getByTestId("filter-ALL")).toBeInTheDocument();
    expect(screen.getByTestId("filter-Customer Experience")).toBeInTheDocument();
    expect(screen.getByTestId("filter-Pricing & Analytics")).toBeInTheDocument();
    // A section with no posts gets no pill.
    expect(screen.queryByTestId("filter-Fixed Ops / Service")).toBeNull();
  });

  it("filters posts to the selected section", () => {
    render(<PostsIndex posts={POSTS} />);
    fireEvent.click(screen.getByTestId("filter-Customer Experience"));
    expect(screen.getByText("Title a")).toBeInTheDocument();
    expect(screen.getByText("Title c")).toBeInTheDocument();
    expect(screen.queryByText("Title b")).toBeNull();
  });

  it("ALL shows every post", () => {
    render(<PostsIndex posts={POSTS} />);
    fireEvent.click(screen.getByTestId("filter-Pricing & Analytics"));
    fireEvent.click(screen.getByTestId("filter-ALL"));
    expect(screen.getByText("Title a")).toBeInTheDocument();
    expect(screen.getByText("Title b")).toBeInTheDocument();
    expect(screen.getByText("Title c")).toBeInTheDocument();
  });
});
