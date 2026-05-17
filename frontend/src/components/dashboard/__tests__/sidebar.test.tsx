import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Sidebar } from "@/components/dashboard/sidebar";

const usePathnameMock = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

beforeEach(() => {
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

  // Pipeline status fetch — never resolve so the dot stays in its initial state.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Sidebar", () => {
  it("renders all five nav links", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    render(<Sidebar />);

    for (const label of ["Overview", "Queue", "Scheduled", "Published", "Settings"]) {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
  });

  it("marks the Overview link active when pathname is /dashboard", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const overview = screen.getByRole("link", { name: /overview/i });
    expect(overview.getAttribute("aria-current")).toBe("page");

    const queue = screen.getByRole("link", { name: /queue/i });
    expect(queue.getAttribute("aria-current")).toBeNull();
  });

  it("marks the Queue link active when pathname is /dashboard/queue", () => {
    usePathnameMock.mockReturnValue("/dashboard/queue");
    render(<Sidebar />);

    const queue = screen.getByRole("link", { name: /queue/i });
    expect(queue.getAttribute("aria-current")).toBe("page");

    const overview = screen.getByRole("link", { name: /overview/i });
    expect(overview.getAttribute("aria-current")).toBeNull();
  });

  it("does not mark Overview active when on a deeper /dashboard/* route", () => {
    usePathnameMock.mockReturnValue("/dashboard/scheduled");
    render(<Sidebar />);

    const overview = screen.getByRole("link", { name: /overview/i });
    expect(overview.getAttribute("aria-current")).toBeNull();
  });

  it("renders the Logout button", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    render(<Sidebar />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });
});
