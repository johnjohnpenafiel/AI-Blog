import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import * as api from "@/lib/api";
import { ScheduledCard } from "../scheduled-card";
import type { PostDetail, PostListItem } from "@/lib/api";

const FUTURE_ISO = "2099-06-15T08:00:00.000Z";

const POST: PostListItem = {
  id: "sched-1",
  slug: "voice-agents-go-mainstream",
  title: "Voice Agents Go Mainstream",
  summary: "Adoption curves are bending.",
  tags: ["Voice AI", "Sales Dev"],
  status: "accepted",
  created_at: "2026-05-10T08:00:00Z",
  scheduled_at: FUTURE_ISO,
  published_at: null,
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

const DETAIL_OK: PostDetail = {
  ...POST,
  meta_description: "x",
  content: "x",
  publishing_mode: "approve_only",
  updated_at: "2026-05-10T08:00:00Z",
  sources: [],
  eval_notes: "clean",
  eval_at: "2026-05-10T08:00:00Z",
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

describe("ScheduledCard", () => {
  it("renders title, summary, tags and scheduled timestamp", () => {
    render(<ScheduledCard post={POST} onMutated={() => {}} />);
    expect(screen.getByText(POST.title)).toBeInTheDocument();
    expect(screen.getByText(POST.summary)).toBeInTheDocument();
    expect(screen.getByText("Voice AI")).toBeInTheDocument();
    expect(screen.getByText(/^Scheduled /)).toBeInTheDocument();
  });

  it("opens edit-schedule form when Edit schedule is clicked", () => {
    render(<ScheduledCard post={POST} onMutated={() => {}} />);
    fireEvent.click(screen.getByTestId("scheduled-edit-toggle"));
    expect(screen.getByTestId("edit-schedule-form")).toBeInTheDocument();
  });

  it("calls reschedulePost when edit form is saved", async () => {
    const spy = vi
      .spyOn(api, "reschedulePost")
      .mockResolvedValue(DETAIL_OK);
    const onMutated = vi.fn();

    render(<ScheduledCard post={POST} onMutated={onMutated} />);
    fireEvent.click(screen.getByTestId("scheduled-edit-toggle"));
    const input = screen.getByTestId("edit-schedule-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2099-07-01T09:00" } });
    fireEvent.click(screen.getByTestId("edit-schedule-save"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBe("sched-1");
      expect(onMutated).toHaveBeenCalledTimes(1);
    });
  });

  it("requires two clicks to publish (confirm step) and calls publishPost", async () => {
    const spy = vi
      .spyOn(api, "publishPost")
      .mockResolvedValue({ ...DETAIL_OK, status: "published" });
    const onMutated = vi.fn();

    render(<ScheduledCard post={POST} onMutated={onMutated} />);
    fireEvent.click(screen.getByTestId("scheduled-publish"));
    fireEvent.click(screen.getByTestId("scheduled-publish-confirm"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("sched-1");
      expect(onMutated).toHaveBeenCalledTimes(1);
    });
  });

  it("requires two clicks to send back to queue and calls unschedulePost", async () => {
    const spy = vi
      .spyOn(api, "unschedulePost")
      .mockResolvedValue({ ...DETAIL_OK, status: "pending_review" });
    const onMutated = vi.fn();

    render(<ScheduledCard post={POST} onMutated={onMutated} />);
    fireEvent.click(screen.getByTestId("scheduled-unschedule"));
    fireEvent.click(screen.getByTestId("scheduled-unschedule-confirm"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("sched-1");
      expect(onMutated).toHaveBeenCalledTimes(1);
    });
  });

  it("renders an error message when an action fails", async () => {
    vi.spyOn(api, "publishPost").mockRejectedValue(new Error("boom"));
    render(<ScheduledCard post={POST} onMutated={() => {}} />);
    fireEvent.click(screen.getByTestId("scheduled-publish"));
    fireEvent.click(screen.getByTestId("scheduled-publish-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("scheduled-card-error")).toHaveTextContent(
        /boom/i,
      );
    });
  });
});
