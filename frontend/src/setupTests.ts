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
