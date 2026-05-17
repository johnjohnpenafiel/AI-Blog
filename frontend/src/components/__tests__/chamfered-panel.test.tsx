import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ChamferedPanel } from "@/components/chamfered-panel";

beforeEach(() => {
  // jsdom returns 0×0 for layout boxes. Mock a real size so the border SVG renders.
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 220,
    height: 600,
    top: 0,
    right: 220,
    bottom: 600,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ChamferedPanel", () => {
  it("renders structural sidebar with dual cut by default", () => {
    render(
      <ChamferedPanel tier="structural" size="sidebar">
        <p>content</p>
      </ChamferedPanel>,
    );

    const svg = screen.getByTestId("chamfered-panel-border");
    expect(svg.getAttribute("data-tier")).toBe("structural");
    expect(svg.getAttribute("data-size")).toBe("sidebar");
    expect(svg.getAttribute("data-cut")).toBe("dual");
  });

  it("defaults card size to single top-left cut", () => {
    render(
      <ChamferedPanel size="card">
        <p>card content</p>
      </ChamferedPanel>,
    );

    const svg = screen.getByTestId("chamfered-panel-border");
    expect(svg.getAttribute("data-size")).toBe("card");
    expect(svg.getAttribute("data-cut")).toBe("single");
  });

  it("defaults tag size to quad cut", () => {
    render(
      <ChamferedPanel size="tag">
        <span>tag</span>
      </ChamferedPanel>,
    );

    expect(screen.getByTestId("chamfered-panel-border").getAttribute("data-cut")).toBe("quad");
  });

  it("honors an explicit cut override", () => {
    render(
      <ChamferedPanel size="card" cut="dual">
        <p>content</p>
      </ChamferedPanel>,
    );

    expect(screen.getByTestId("chamfered-panel-border").getAttribute("data-cut")).toBe("dual");
  });

  it("renders one chamfer diagonal for single cut", () => {
    const { container } = render(
      <ChamferedPanel tier="component" size="card">
        <p>content</p>
      </ChamferedPanel>,
    );
    expect(container.querySelectorAll("svg line[data-role='chamfer']").length).toBe(1);
  });

  it("renders two chamfer diagonals for dual cut", () => {
    const { container } = render(
      <ChamferedPanel tier="component" size="button" cut="dual">
        <p>btn</p>
      </ChamferedPanel>,
    );
    expect(container.querySelectorAll("svg line[data-role='chamfer']").length).toBe(2);
  });

  it("renders four chamfer diagonals for quad cut", () => {
    const { container } = render(
      <ChamferedPanel size="tag">
        <span>tag</span>
      </ChamferedPanel>,
    );
    expect(container.querySelectorAll("svg line[data-role='chamfer']").length).toBe(4);
  });

  it("renders children content above the clipped background", () => {
    render(
      <ChamferedPanel size="card">
        <p>visible body</p>
      </ChamferedPanel>,
    );

    expect(screen.getByText("visible body")).toBeInTheDocument();
  });
});
