// Validates the "replace" flavor: pkg/lib.dom.d.ts is referenced as the entire
// DOM lib (the tsconfig sets `lib: ["ESNext"]` with no "DOM"), exactly as a
// consumer would use it. It must supply both baseline DOM and single-engine
// APIs and typecheck standalone — proving it doesn't depend on TypeScript's own
// bundled lib.dom.
/// <reference path="../pkg/lib.dom.d.ts" />

// Baseline DOM, which would normally come from lib.dom.
const el = document.querySelector("div")!;
const markup: string = el.innerHTML;
el.addEventListener("click", () => {});

// Single-engine APIs that stock lib.dom lacks.
async function eyedropper(): Promise<string | undefined> {
  return (await new EyeDropper().open()).sRGBHex;
}
function viewTransition(node: Element): Element {
  return node.startViewTransition(() => {}).transitionRoot;
}
async function webgpu(): Promise<GPUAdapter | null> {
  return navigator.gpu.requestAdapter();
}
function bluetooth(nav: Navigator): Bluetooth {
  return nav.bluetooth;
}

export { markup, eyedropper, viewTransition, webgpu, bluetooth };
