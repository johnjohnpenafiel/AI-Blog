import "@testing-library/jest-dom/vitest";

// jsdom lacks ResizeObserver — provide a minimal stub so components that
// instantiate it (e.g. ChamferedPanel) don't crash. Tests measure dimensions
// via mocked getBoundingClientRect instead.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
