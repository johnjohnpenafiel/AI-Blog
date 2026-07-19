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

// jsdom lacks IntersectionObserver — stub it so components that watch
// scroll visibility (e.g. PostView's hero → mini-title swap) don't crash.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

// jsdom doesn't implement matchMedia. Stub it so components that subscribe
// to viewport breakpoints (e.g. Sidebar's mobile drawer) don't crash.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as unknown as MediaQueryList;
}
