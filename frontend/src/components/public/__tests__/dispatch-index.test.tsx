import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DispatchIndex } from "../dispatch-index";
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
  post("a", "Customer Experience", "Alpha"),
  post("b", "Pricing & Analytics", "Bravo"),
  post("c", "Customer Experience", "Charlie"),
];

describe("DispatchIndex", () => {
  it("derives filter chips from sections present in the posts (plus All)", () => {
    render(<DispatchIndex posts={POSTS} />);
    expect(screen.getByRole("button", { name: /All/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Customer Experience/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pricing & Analytics/ }),
    ).toBeInTheDocument();
    // no bucket for a section that has no posts
    expect(
      screen.queryByRole("button", { name: /Inventory/ }),
    ).not.toBeInTheDocument();
  });

  it("shows all rows by default and filters to the selected section", () => {
    render(<DispatchIndex posts={POSTS} />);
    // default: all three
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Pricing & Analytics/ }));

    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });
});
