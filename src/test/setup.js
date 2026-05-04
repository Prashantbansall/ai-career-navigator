import "@testing-library/jest-dom";

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    this.callback([
      {
        isIntersecting: true,
        intersectionRatio: 1,
      },
    ]);
  }

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
