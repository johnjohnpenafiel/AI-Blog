import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { NewsIndex } from "../news-index";
import type { PublicPostListItem } from "@/lib/public-api";

function post(
  slug: string,
  section: string | null,
  format: string,
  title = `Title ${slug}`,
): PublicPostListItem {
  return {
    id: slug,
    slug,
    title,
    summary: `Summary ${slug}`,
    tags: ["Voice AI"],
    section,
    format,
    image_url: null,
    published_at: "2026-05-04T08:00:00Z",
    read_time_minutes: 3,
  };
}

const POSTS = [
  post("a", "Customer Experience", "Brief", "Alpha"),
  post("b", "Pricing & Analytics", "Deep Dive", "Bravo"),
  post("c", "Customer Experience", "Deep Dive", "Charlie"),
  post("d", null, "Roundup", "Delta"),
];

describe("NewsIndex", () => {
  it("shows the live dispatch count in the title", () => {
    render(<NewsIndex posts={POSTS} />);
    expect(screen.getByText("(04)")).toBeInTheDocument();
  });

  it("derives filter items from formats/sections present in the posts", () => {
    render(<NewsIndex posts={POSTS} />);
    // formats render under their reading-mode labels, with live counts
    expect(
      screen.getByRole("button", { name: /2-Minute Intel \(1\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Go Further \(2\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /The Week \(1\)/ }),
    ).toBeInTheDocument();
    // no bucket for a format with no posts (Explainer → "Start Here")
    expect(
      screen.queryByRole("button", { name: /Start Here/ }),
    ).not.toBeInTheDocument();
    // sections present, with counts; no bucket for an absent section
    expect(
      screen.getByRole("button", { name: /Customer Experience \(2\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pricing & Analytics \(1\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Inventory/ }),
    ).not.toBeInTheDocument();
  });

  it("shows all rows by default and intersects filters across groups", () => {
    render(<NewsIndex posts={POSTS} />);
    // default: all four
    for (const t of ["Alpha", "Bravo", "Charlie", "Delta"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }

    // format filter: Deep Dive only
    fireEvent.click(screen.getByRole("button", { name: /Go Further/ }));
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Delta")).not.toBeInTheDocument();

    // AND a section: Deep Dive ∩ Customer Experience
    fireEvent.click(
      screen.getByRole("button", { name: /Customer Experience/ }),
    );
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
  });

  it("multi-selects within a group and clears all filters", () => {
    render(<NewsIndex posts={POSTS} />);
    fireEvent.click(screen.getByRole("button", { name: /2-Minute Intel/ }));
    fireEvent.click(screen.getByRole("button", { name: /The Week/ }));
    // union within the Format group
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Clear all/ }));
    for (const t of ["Alpha", "Bravo", "Charlie", "Delta"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it("renders the empty state before the first post is published", () => {
    render(<NewsIndex posts={[]} />);
    expect(screen.getByText("(00)")).toBeInTheDocument();
    expect(
      screen.getByText(/No dispatches published yet/),
    ).toBeInTheDocument();
  });
});
