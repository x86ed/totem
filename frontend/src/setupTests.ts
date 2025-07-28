// frontend/src/setupTests.ts

// Silence canvas errors in jsdom for tests
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    // mock 2d context methods as needed
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    arcTo: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    isPointInPath: () => false,
    isPointInStroke: () => false,
    // add more as needed
  }),
});

Object.defineProperty(window.HTMLCanvasElement.prototype, 'toDataURL', {
  value: () => 'data:image/png;base64,mock',
});

// Provide a global window object if missing (for SSR test environments)
if (typeof globalThis.window === 'undefined') {
  // @ts-expect-error: window is not defined in some SSR test environments
  globalThis.window = globalThis;
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: (time: number) => void): number => Number(setTimeout(() => callback(performance.now()), 0));
}
