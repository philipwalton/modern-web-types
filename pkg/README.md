<!-- Generated from README.md. Edit that file instead. -->

# modern-web-types

TypeScript types for web platform APIs that have shipped in at least one stable browser but aren't yet in `lib.dom.d.ts`.

## Why this exists

TypeScript's DOM types (`lib.dom.d.ts`, also published as [`@types/web`](https://www.npmjs.com/package/@types/web)) come from [microsoft/TypeScript-DOM-lib-generator][gen], which by policy includes a feature only once it ships in **two or more** browser engines. So an API can be in stable Chrome, Safari, or Firefox and widely used, yet have no official types.

## How it works

This runs the same generator that produces TypeScript's own `lib.dom.d.ts`, [microsoft/TypeScript-DOM-lib-generator][gen], and diffs its output against itself:

1. **Pin and patch.** The generator is pinned to a known SHA ([`upstream.json`](https://github.com/philipwalton/modern-web-types/blob/main/upstream.json)) and patched ([`patches/min-engines.patch`](https://github.com/philipwalton/modern-web-types/blob/main/patches/min-engines.patch)) so its engine threshold reads from an environment variable.
2. **Build twice.** Both builds run from the same data snapshot: once at the stock threshold of two engines (`baseline`), once at one engine (`full`). `full` is a strict superset of `baseline`.
3. **Diff structurally.** The two outputs are compared with the TypeScript compiler API ([`scripts/diff.ts`](https://github.com/philipwalton/modern-web-types/blob/main/scripts/diff.ts)). Both come from the same emitter run, so declaration text is byte-identical wherever they agree, and the difference is exactly what the two-engine rule removed.
4. **Emit.** The delta becomes one global-augmentation file per spec, grouped using [`@webref/idl`](https://www.npmjs.com/package/@webref/idl) ([`scripts/emit.ts`](https://github.com/philipwalton/modern-web-types/blob/main/scripts/emit.ts)). Separately, the complete one-engine lib is emitted as a drop-in `lib.dom` replacement ([`scripts/emit-lib.ts`](https://github.com/philipwalton/modern-web-types/blob/main/scripts/emit-lib.ts)).

Every step runs once per scope: `window`, which augments `lib.dom`, and `worker`, which augments `lib.webworker`. The delta is expressed in forms that merge into an existing lib: whole new interfaces with their `declare var` constructors, added members on existing interfaces via declaration merging, new type aliases, and new globals.

[`report.md`](https://github.com/philipwalton/modern-web-types/blob/main/report.md) lists the current gap.

## Install & use

**Replace mode** (recommended) uses the generated lib in place of TypeScript's `lib.dom`. It is self-contained, so it can't conflict with whatever `lib.dom` your TypeScript ships.

Install it under TypeScript's lib-override alias, with no `tsconfig` change:

```sh
npm install --save-dev @typescript/lib-dom@npm:modern-web-types
```

Or reference it explicitly, which is what worker scopes need, since one package can satisfy only one `@typescript/lib-*` alias:

```jsonc
{ "compilerOptions": { "lib": ["ESNext"], "types": ["modern-web-types"] } }
```

| Entry point | Replaces |
| --- | --- |
| `modern-web-types` | `"DOM"` |
| `modern-web-types/webworker` | `"WebWorker"` (dedicated + shared + service worker) |
| `modern-web-types/serviceworker` | `@types/serviceworker` |
| `modern-web-types/sharedworker` | `@types/sharedworker` |
| `modern-web-types/audioworklet` | `@types/audioworklet` |

`webworker` is what most worker projects want; the standalone libs expose only their one global scope. DOM and worker globals can't mix, so compile worker code separately.

### Augment mode

Layer the additions onto your existing `lib.dom` instead of replacing it:

```ts
// every spec at once
/// <reference types="modern-web-types/augment" />

// or a single spec
/// <reference types="modern-web-types/augment/eyedropper-api" />

const dropper = new EyeDropper();
const { sRGBHex } = await dropper.open();
```

Worker augments live at `modern-web-types/augment/worker` and `modern-web-types/augment/<spec>.worker`. Spec shortnames are in [`report.md`](https://github.com/philipwalton/modern-web-types/blob/main/report.md).

## Caveats

- APIs in only one engine are more likely to change.
- Replace mode takes the DOM types wholesale from the pinned generator, so it trails TypeScript's own `lib.dom` until the next regeneration.
- Augment mode wants a recent TypeScript. A few specs reference typedefs that exist only in a recent `lib.dom`; replace mode has no such dependency.
- A few declarations can't be expressed as augmentations and are omitted. See "Skipped" in [`report.md`](https://github.com/philipwalton/modern-web-types/blob/main/report.md). Replace mode has no such gaps.

## Related

- [`lib.dom.d.ts` / `@types/web`][gen]: the official types, from the generator this project reuses. This project is strictly additive and never redefines what they already cover.
- `@types/dom-*`: hand-written single-feature gap fillers. This generates the same category of types automatically, across every spec at once.

## License

Apache-2.0. Generated output derives from [TypeScript-DOM-lib-generator][gen] (Apache-2.0) and Web IDL from [webref](https://github.com/w3c/webref) (per-spec licenses).

[gen]: https://github.com/microsoft/TypeScript-DOM-lib-generator
