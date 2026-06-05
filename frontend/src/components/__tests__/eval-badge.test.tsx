import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { EvalBadge } from "../eval-badge";

type Fields = {
  eval_pov: number | null;
  eval_format: number | null;
  eval_grounding: number | null;
  eval_passed: boolean | null;
};

const post = (f: Partial<Fields> = {}): Fields => ({
  eval_pov: 2,
  eval_format: 2,
  eval_grounding: 2,
  eval_passed: true,
  ...f,
});

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 120,
    height: 24,
    top: 0,
    right: 120,
    bottom: 24,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EvalBadge", () => {
  it("shows pass + triad for a perfect score", () => {
    render(<EvalBadge post={post()} />);
    expect(screen.getByTestId("eval-badge").textContent).toBe("Pass 2·2·2");
    expect(screen.getByTestId("eval-badge").className).toContain("text-success");
  });

  it("shows a warning tone when passed but imperfect", () => {
    render(<EvalBadge post={post({ eval_format: 1 })} />);
    expect(screen.getByTestId("eval-badge").textContent).toBe("Pass 2·1·2");
    expect(screen.getByTestId("eval-badge").className).toContain("text-warning");
  });

  it("shows fail + destructive tone when not passed", () => {
    render(
      <EvalBadge post={post({ eval_grounding: 0, eval_passed: false })} />,
    );
    expect(screen.getByTestId("eval-badge").textContent).toBe("Fail 2·2·0");
    expect(screen.getByTestId("eval-badge").className).toContain(
      "text-destructive",
    );
  });

  it("shows a muted not-scored chip when fields are null", () => {
    render(
      <EvalBadge
        post={{
          eval_pov: null,
          eval_format: null,
          eval_grounding: null,
          eval_passed: null,
        }}
      />,
    );
    expect(screen.getByTestId("eval-badge").textContent).toBe("Eval —");
    expect(screen.getByTestId("eval-badge").className).toContain("text-dim");
  });
});
