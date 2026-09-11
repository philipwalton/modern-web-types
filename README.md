# modern-web-types

TypeScript types for all web platform APIs that have shipped in at least one stable browser, but aren't yet included in TypeScript's built-in type definitions.

These types are generated using the exact same pipeline as TypeScript's official types, so the quality and correctness is identical. The only difference is the number of APIs that are included.

## Why this exists

TypeScript's built-in types (e.g. `lib.dom.d.ts`, `lib.webworker.d.ts`, etc.) are generated from [microsoft/TypeScript-DOM-lib-generator][gen], which by policy only includes features that have shipped in **two or more** browser engines. This means that an API can be available in Chrome, Safari, or Firefox—and widely used on websites—and yet have no official types.

Anyone who wants to use those APIs has to write the types by hand or go hunting for a package that already has them. This project fills that gap.

## Install & use

The generated libs in this package are stand-in replacements for TypeScript's built-in libs. To use them, first install the package and then update your `tsconfig` to reference `modern-web-types`.

```sh
npm install --save-dev modern-web-types
```

```jsonc
{
  "compilerOptions": {
    // 1) Reference `modern-web-types` here.
    "types": ["modern-web-types/dom"],
    // 2) Don't list "DOM" since it's included above
    "lib": ["ESNext"],
  }
}
```

The `types` option can take any of the following libs from `modern-web-types`:

| Entry point | Replaces |
| --- | --- |
| `modern-web-types` | `"DOM"` |
| `modern-web-types/dom` | `"DOM"` (alias for `modern-web-types`) |
| `modern-web-types/webworker` | `"WebWorker"` (dedicated + shared + service worker) |
| `modern-web-types/serviceworker` | `@types/serviceworker` |
| `modern-web-types/sharedworker` | `@types/sharedworker` |
| `modern-web-types/audioworklet` | `@types/audioworklet` |

Alternatively, if you only need DOM types, you can use TypeScript's lib-override alias. This lets you leave `lib` and `types` alone.

```sh
npm install --save-dev @typescript/lib-dom@npm:modern-web-types
```

Important: with this option, you must set `libReplacement` to `true` (TypeScript 6+):

```jsonc
{
  "compilerOptions": {
    "libReplacement": true
  }
}
```

## How it works

This project runs the same generator that produces TypeScript's own types, [microsoft/TypeScript-DOM-lib-generator][gen], and diffs its output against itself.

Updates run on a schedule. Every Monday a [workflow](.github/workflows/update.yml) re-pins the generator and the entry types registry to their latest commits, regenerates all five libs, runs the tests, and opens a pull request with whatever changed. An API that ships in a browser lands here on the next Monday run after the generator's data picks it up, so you don't have to track the web platform yourself.

Each regeneration runs these steps:

1. **Pin and patch.** The generator is pinned to a known SHA ([`upstream.json`](upstream.json)) and patched ([`patches/min-engines.patch`](patches/min-engines.patch)) so its engine threshold reads from an environment variable.
2. **Build twice.** Both builds run from the same data snapshot: once at the stock threshold of two engines (`baseline`), once at one engine (`full`). `full` is a strict superset of `baseline`.
3. **Diff structurally.** The two outputs are compared with the TypeScript compiler API ([`scripts/diff.ts`](scripts/diff.ts)). Both come from the same emitter run, so declaration text is byte-identical wherever they agree, and the difference is exactly what the two-engine rule removed.
4. **Emit.** [`scripts/emit-lib.ts`](scripts/emit-lib.ts) turns the one-engine build into the shipped lib for each environment, pulling in cross-scope type-only dependencies so every lib stands on its own.

Every step runs once per environment. All five get a complete lib. `dom` and `webworker`, the two TypeScript ships a built-in lib for, also get a baseline build, which is what makes the gap measurable. [`report.md`](report.md) lists that gap, and the smoke tests check that every symbol in it resolves.

## Development

```sh
npm run update   # fetch-upstream -> fetch-registry -> build -> diff -> emit-lib -> emit-test -> emit-readme -> report
npm test         # typecheck every generated lib, guard the delta size
```

Two TypeScript versions are installed. [`scripts/diff.ts`](scripts/diff.ts) and [`scripts/emit-lib.ts`](scripts/emit-lib.ts) parse `.d.ts` text with the compiler API, which TypeScript 7 moved to `typescript/unstable/*`, so `typescript` stays on 6 for them. `typescript-7` is an alias for the latest release, and `npm test` typechecks the generated output under both, since that is what consumers compile with. Both packages install a bin named `tsc`, so [`scripts/util.ts`](scripts/util.ts) resolves each compiler by full path.

The pinned generator is cloned into `upstream/` and patched on fetch; intermediate artifacts go in `build/`. Both are gitignored. Published files live in [`pkg/`](pkg/), and the environments are configured in [`scripts/util.ts`](scripts/util.ts). [`registry.json`](registry.json) is a second pinned source, holding both the pin and its parsed table so a change to it shows up as a reviewable diff.

Smoke tests are generated from the current delta rather than hand-written, so an API that graduates to two engines drops out of the delta and out of the tests.

Releases are driven by `version` in [`pkg/package.json`](pkg/package.json): a merge to `main` that changes it triggers the [publish workflow](.github/workflows/publish.yml), which publishes `pkg/` to npm and tags the commit. Merges that leave the version alone publish nothing.

## Related

- [`lib.dom.d.ts` / `@types/web`][gen]: the official types, from the generator this project reuses. This project is strictly additive and never redefines what they already cover.
- `@types/dom-*`: hand-written single-feature gap fillers. This package covers the same ground with generated output, shipped as complete libs instead of per-feature patches.

## License

Apache-2.0. Generated output derives from [TypeScript-DOM-lib-generator][gen] (Apache-2.0) and Web IDL from [webref](https://github.com/w3c/webref) (per-spec licenses).

[gen]: https://github.com/microsoft/TypeScript-DOM-lib-generator
