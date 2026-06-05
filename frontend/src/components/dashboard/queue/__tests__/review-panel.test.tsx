import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import * as api from "@/lib/api";
import { ReviewPanel } from "../review-panel";
import type { PostDetail } from "@/lib/api";

const DETAIL: PostDetail = {
  id: "abc-123",
  slug: "ai-voice-agents",
  title: "AI Voice Agents Reshape Service",
  summary: "Voice agents are in the BDC.",
  meta_description: "Meta description.",
  content: "# Body\n\nThis is the **rendered** markdown body.",
  tags: ["Voice AI", "CRM"],
  status: "pending_review",
  publishing_mode: "approve_only",
  scheduled_at: null,
  published_at: null,
  created_at: "2026-05-15T08:00:00Z",
  updated_at: "2026-05-15T08:00:00Z",
  generation_attempt: 1,
  eval_pov: 2,
  eval_format: 2,
  eval_grounding: 1,
  eval_passed: true,
  eval_notes: "minor grounding gap",
  eval_at: "2026-05-15T08:00:00Z",
  sources: [
    {
      id: "src-1",
      title: "Source One",
      url: "https://example.com/1",
      publisher: "example.com",
      published_date: "2026-05-10",
    },
  ],
};

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 920,
    height: 700,
    top: 0,
    right: 920,
    bottom: 700,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReviewPanel", () => {
  it("renders markdown body and sources from initial detail", async () => {
    render(
      <ReviewPanel
        postId={DETAIL.id}
        initial={DETAIL}
        onClose={() => {}}
        onMutated={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("AI Voice Agents Reshape Service")).toBeInTheDocument();
    });
    expect(screen.getByText("rendered")).toBeInTheDocument();
    expect(screen.getByText("Source One")).toBeInTheDocument();
    expect(screen.getByText("Sources [1]")).toBeInTheDocument();
  });

  it("renders the generation-eval verdict and notes", async () => {
    render(
      <ReviewPanel
        postId={DETAIL.id}
        initial={DETAIL}
        onClose={() => {}}
        onMutated={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("review-eval")).toBeInTheDocument();
    });
    expect(screen.getByTestId("eval-badge").textContent).toBe("Pass 2·2·1");
    expect(screen.getByText("minor grounding gap")).toBeInTheDocument();
  });

  it("opens accept modal when Accept is clicked", async () => {
    render(
      <ReviewPanel
        postId={DETAIL.id}
        initial={DETAIL}
        onClose={() => {}}
        onMutated={() => {}}
      />,
    );

    fireEvent.click(screen.getByTestId("review-accept"));
    await waitFor(() => {
      expect(screen.getByTestId("accept-modal")).toBeInTheDocument();
    });
  });

  it("calls rejectPost and closes on confirm reject", async () => {
    const rejectSpy = vi
      .spyOn(api, "rejectPost")
      .mockResolvedValue({ ...DETAIL, status: "rejected" });
    const onClose = vi.fn();
    const onMutated = vi.fn();

    render(
      <ReviewPanel
        postId={DETAIL.id}
        initial={DETAIL}
        onClose={onClose}
        onMutated={onMutated}
      />,
    );

    fireEvent.click(screen.getByTestId("review-reject"));
    fireEvent.click(screen.getByTestId("review-reject-confirm"));

    await waitFor(() => {
      expect(rejectSpy).toHaveBeenCalledWith("abc-123");
      expect(onMutated).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("invokes onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ReviewPanel
        postId={DETAIL.id}
        initial={DETAIL}
        onClose={onClose}
        onMutated={() => {}}
      />,
    );
    fireEvent.click(screen.getByTestId("review-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
