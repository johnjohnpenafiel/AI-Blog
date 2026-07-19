import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PostView } from "@/components/public/post-view";
import type { PublicPostDetail } from "@/lib/public-api";

const POST: PublicPostDetail = {
  id: "post-1",
  slug: "voice-ai-dealership",
  title: "Voice AI transforms dealership operations",
  summary: "A summary.",
  meta_description: "Meta.",
  content:
    "# Voice AI transforms dealership operations\n\nThe opening paragraph is the lede.\n\n## The phones stopped ringing\n\nBody paragraph here.",
  tags: ["Voice", "Service"],
  section: "Fixed Ops / Service",
  format: "Deep Dive",
  image_url: null,
  published_at: "2026-05-28T08:00:00Z",
  read_time_minutes: 2,
  sources: [],
};

describe("PostView", () => {
  it("renders the hero title and metadata sidebar values", () => {
    render(<PostView post={POST} />);
    expect(
      screen.getByRole("heading", { level: 1, name: POST.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("2026.5.28")).toBeInTheDocument();
    expect(screen.getByText("The Garage Desk")).toBeInTheDocument();
    expect(screen.getByText("2 min read")).toBeInTheDocument();
    expect(screen.getByText("Voice")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
  });

  it("styles the first paragraph as the lede with the cover figure after it", () => {
    render(<PostView post={POST} />);
    const lede = screen.getByText("The opening paragraph is the lede.");
    expect(lede).toHaveClass("tg-lede");
    // The markdown's leading `# H1` restates the title — the hero owns it, so
    // the article must not render a second h1.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    // No image_url → the marked placeholder figure renders.
    expect(screen.getByText("Lead image placeholder")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "The phones stopped ringing" }),
    ).toBeInTheDocument();
  });

  it("opens and closes the full-page reader from the expand button", () => {
    render(<PostView post={POST} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open full-page reader" }));
    expect(screen.getByRole("dialog", { name: "Article reader" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close reader" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the reader on Escape", () => {
    render(<PostView post={POST} />);
    fireEvent.click(screen.getByRole("button", { name: "Open full-page reader" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
