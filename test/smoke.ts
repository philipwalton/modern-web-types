// Exercises representative APIs from the delta to prove the globals and their
// signatures actually resolve and merge. None of these compile against a stock
// lib.dom; they compile only because the generated types are referenced.
/// <reference path="../build/baseline.d.ts" />
/// <reference path="../pkg/index.d.ts" />

// View Transitions: instance method + return type merged onto Element.
async function viewTransitions(el: Element) {
  const vt: ViewTransition = el.startViewTransition(() => {});
  await vt.finished;
}

// EyeDropper: a whole new interface plus its `declare var` constructor.
async function eyedropper() {
  const dropper = new EyeDropper();
  const result = await dropper.open();
  return result.sRGBHex?.toUpperCase();
}

// Navigator augmentation: WebUSB / Web Bluetooth device access.
function deviceAccess(nav: Navigator) {
  const usb: USB = nav.usb;
  const bluetooth: Bluetooth = nav.bluetooth;
  return { usb, bluetooth };
}

// Global function declared as a Window member (File System Access).
async function fileAccess() {
  const [handle] = await showOpenFilePicker();
  return handle.name;
}

export { viewTransitions, eyedropper, deviceAccess, fileAccess };
