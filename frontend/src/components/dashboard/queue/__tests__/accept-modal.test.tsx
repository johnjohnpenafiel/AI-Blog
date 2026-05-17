import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AcceptModal } from "../accept-modal";

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 480,
    height: 300,
    top: 0,
    right: 480,
    bottom: 300,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AcceptModal", () => {
  it("does not render when open=false", () => {
    render(
      <AcceptModal open={false} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByTestId("accept-modal")).toBeNull();
  });

  it("fires onConfirm with undefined when Publish now is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <AcceptModal open onConfirm={onConfirm} onCancel={() => {}} />,
    );
    fireEvent.click(screen.getByTestId("accept-publish-now"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("switches to schedule mode and fires onConfirm with ISO string", () => {
    const onConfirm = vi.fn();
    render(
      <AcceptModal open onConfirm={onConfirm} onCancel={() => {}} />,
    );

    fireEvent.click(screen.getByTestId("accept-schedule-open"));

    const input = screen.getByTestId(
      "accept-schedule-input",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2030-01-01T08:30" } });

    fireEvent.click(screen.getByTestId("accept-schedule-confirm"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const arg = onConfirm.mock.calls[0][0];
    expect(typeof arg).toBe("string");
    // Should be a valid ISO UTC string
    expect(() => new Date(arg).toISOString()).not.toThrow();
    expect(arg.endsWith("Z")).toBe(true);
  });

  it("disables Confirm when no schedule value is entered", () => {
    render(
      <AcceptModal open onConfirm={() => {}} onCancel={() => {}} />,
    );
    fireEvent.click(screen.getByTestId("accept-schedule-open"));
    const confirm = screen.getByTestId(
      "accept-schedule-confirm",
    ) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });
});
