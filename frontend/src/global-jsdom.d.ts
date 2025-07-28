declare global {
  // Type for jsdom cleanup function provided by global-jsdom
  var __jsdomCleanup: (() => void) | undefined;
}

declare module 'global-jsdom' {
  export default function createJSDOM(): () => void;
}

export {};
