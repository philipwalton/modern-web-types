# modern-web-types

TypeScript types for web platform APIs that have shipped in at least one stable browser but aren't yet in `lib.dom.d.ts`.

## Why this exists

TypeScript's DOM types (`lib.dom.d.ts`, also published as [`@types/web`](https://www.npmjs.com/package/@types/web)) come from [microsoft/TypeScript-DOM-lib-generator][gen], which by policy includes a feature only once it ships in **two or more** browser engines. So an API can be in stable Chrome, Safari, or Firefox and widely used, yet have no official types.

## How it works

This runs the same generator that produces TypeScript's own `lib.dom.d.ts`, [microsoft/TypeScript-DOM-lib-generator][gen], and diffs its output against itself:

1. **Pin and patch.** The generator is pinned to a known SHA ([`upstream.json`](upstream.json)) and patched ([`patches/min-engines.patch`](patches/min-engines.patch)) so its engine threshold reads from an environment variable.
2. **Build twice.** Both builds run from the same data snapshot: once at the stock threshold of two engines (`baseline`), once at one engine (`full`). `full` is a strict superset of `baseline`.
3. **Diff structurally.** The two outputs are compared with the TypeScript compiler API ([`scripts/diff.ts`](scripts/diff.ts)). Both come from the same emitter run, so declaration text is byte-identical wherever they agree, and the difference is exactly what the two-engine rule removed.
4. **Emit.** The delta becomes one global-augmentation file per spec, grouped using [`@webref/idl`](https://www.npmjs.com/package/@webref/idl) ([`scripts/emit.ts`](scripts/emit.ts)). Separately, the complete one-engine lib is emitted as a drop-in `lib.dom` replacement ([`scripts/emit-lib.ts`](scripts/emit-lib.ts)).

Every step runs once per scope: `window`, which augments `lib.dom`, and `worker`, which augments `lib.webworker`. The delta is expressed in forms that merge into an existing lib: whole new interfaces with their `declare var` constructors, added members on existing interfaces via declaration merging, new type aliases, and new globals.

[`report.md`](report.md) lists the current gap.

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

Worker augments live at `modern-web-types/augment/worker` and `modern-web-types/augment/<spec>.worker`. Spec shortnames are in [`report.md`](report.md).

## Caveats

- APIs in only one engine are more likely to change.
- Replace mode takes the DOM types wholesale from the pinned generator, so it trails TypeScript's own `lib.dom` until the next regeneration.
- Augment mode wants a recent TypeScript. A few specs reference typedefs that exist only in a recent `lib.dom`; replace mode has no such dependency.
- A few declarations can't be expressed as augmentations and are omitted. See "Skipped" in [`report.md`](report.md). Replace mode has no such gaps.

## Development

```sh
npm run update   # fetch-upstream -> fetch-registry -> build -> diff -> emit -> emit-lib -> emit-test -> report
npm test         # typecheck every generated lib and flavor, guard the delta size
```

The pinned generator is cloned into `upstream/` and patched on fetch; intermediate artifacts go in `build/`. Both are gitignored. Published files live in [`pkg/`](pkg/), and the environments are configured in [`scripts/util.ts`](scripts/util.ts). [`registry.json`](registry.json) is a second pinned source, holding both the pin and its parsed table so a change to it shows up as a reviewable diff.

Smoke tests are generated from the current delta rather than hand-written, so an API that graduates to two engines drops out of the delta and out of the tests.

A weekly [workflow](.github/workflows/update.yml) bumps both pinned sources to their latest `main`, regenerates, runs the tests, and opens a PR when anything changed.

Releases are driven by `version` in [`pkg/package.json`](pkg/package.json): a merge to `main` that changes it triggers the [publish workflow](.github/workflows/publish.yml), which publishes `pkg/` to npm and tags the commit. Merges that leave the version alone publish nothing.

## Related

- [`lib.dom.d.ts` / `@types/web`][gen]: the official types, from the generator this project reuses. This project is strictly additive and never redefines what they already cover.
- `@types/dom-*`: hand-written single-feature gap fillers. This generates the same category of types automatically, across every spec at once.

## License

Apache-2.0. Generated output derives from [TypeScript-DOM-lib-generator][gen] (Apache-2.0) and Web IDL from [webref](https://github.com/w3c/webref) (per-spec licenses).

[gen]: https://github.com/microsoft/TypeScript-DOM-lib-generator
