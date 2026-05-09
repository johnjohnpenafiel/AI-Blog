import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

describe("token verification page", () => {
  it("renders all 8 design token swatches", () => {
    render(<Page />);

    const expectedTokens = [
      "--bg",
      "--surface",
      "--border",
      "--text-primary",
      "--text-secondary",
      "--accent",
      "--accent-glow",
      "--accent-dim",
    ];

    for (const token of expectedTokens) {
      const swatch = document.querySelector(`[data-token="${token}"]`);
      expect(swatch, `swatch for ${token} should be present`).not.toBeNull();
    }

    expect(screen.getByText(/THIS_TEXT_DOES_NOT_EXIST_REDPATH/)).toBeInTheDocument();
  });
});
