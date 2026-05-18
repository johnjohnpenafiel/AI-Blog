import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { QueueCard } from "../queue-card";
import type { PostListItem } from "@/lib/api";

const POST: PostListItem = {
  id: "abc-123",
  slug: "ai-voice-agents",
  title: "AI Voice Agents Reshape Service",
  summary: "Dealerships are deploying voice agents across the BDC.",
  tags: ["Voice AI", "CRM"],
  status: "pending_review",
  created_at: "2026-05-15T08:00:00Z",
  scheduled_at: null,
  published_at: null,
  generation_attempt: 1,
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

describe("QueueCard", () => {
  it("renders title, summary, and tags", () => {
    render(<QueueCard post={POST} onOpen={() => {}} />);
    expect(screen.getByText(POST.title)).toBeInTheDocument();
    expect(screen.getByText(POST.summary)).toBeInTheDocument();
    expect(screen.getByText("Voice AI")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
  });

  it("invokes onOpen with the post id when clicked", () => {
    const onOpen = vi.fn();
    render(<QueueCard post={POST} onOpen={onOpen} />);
    fireEvent.click(screen.getByTestId("queue-card"));
    expect(onOpen).toHaveBeenCalledWith("abc-123");
  });

  it("shows attempt badge when generation_attempt > 1", () => {
    render(
      <QueueCard post={{ ...POST, generation_attempt: 3 }} onOpen={() => {}} />,
    );
    expect(screen.getByText("Attempt 3")).toBeInTheDocument();
  });
});
