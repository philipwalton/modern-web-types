<!-- Generated from README.md. Edit that file instead. -->

# modern-web-types

TypeScript types for all web platform APIs that have shipped in at least one stable browser, but aren't yet included in TypeScript's built-in type definitions.

These types are generated using the exact same pipeline as TypeScript's official types, so the quality and correctness are identical. The only difference is the number of APIs that are included.

## Why this exists

TypeScript's built-in types (e.g. `lib.dom.d.ts`, `lib.webworker.d.ts`, etc.) are generated from [microsoft/TypeScript-DOM-lib-generator][gen], which by policy only includes features that have shipped in **two or more** browser engines. This means that an API can be available in Chrome, Safari, or Firefox—and widely used on websites—and yet have no official types.

Anyone who wants to use those APIs has to write the types by hand or go hunting for a package that already has them. This project fills that gap.

## Install & use

The generated libs in this package are stand-in replacements for TypeScript's built-in libs.

The recommended way to use `modern-web-types` on most web projects is to install it under the `@typescript/lib-dom` alias, which is the name TypeScript looks for when it resolves its DOM library:

```sh
npm install --save-dev @typescript/lib-dom@npm:modern-web-types
```

If you're using TypeScript 6 or newer, you'll also need to turn on [`libReplacement`](https://www.typescriptlang.org/tsconfig/#libReplacement) in your `tsconfig.json`.

```diff
{
  "compilerOptions": {
+   "libReplacement": true
  }
}
```

For older TypeScript versions (4.5–5.x), library replacement was the default behavior, so no `libReplacement` value is needed.

### Workers and other libs

The recommended lib replacement option covers the DOM library only. For any other environment, remove the corresponding lib from `lib` and reference this package's entry point from `types` instead:

```jsonc
{
  "compilerOptions": {
    // 1) Reference the entry point here.
    "types": ["modern-web-types/webworker"],
    // 2) Don't list "WebWorker" since it's included above
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

Note that this installation option works for DOM as well, if you'd rather not use the alias or you already set `types`.

> [!IMPORTANT]
> If your project doesn't already set `types`, be aware that adding it changes more than the lib you're replacing. Once `types` is present, TypeScript stops automatically including every `@types/*` package it finds in `node_modules` and uses only the ones you list.

## How it works

This project runs the same generator that produces TypeScript's own types, [microsoft/TypeScript-DOM-lib-generator][gen], and diffs its output against itself.

Updates run on a schedule. Every Monday a [workflow](https://github.com/philipwalton/modern-web-types/blob/main/.github/workflows/update.yml) re-pins the generator and the entry types registry to their latest commits, regenerates all five libs, runs the tests, and opens a pull request with whatever changed. An API that ships in a browser lands here on the next Monday run after the generator's data picks it up, so you don't have to track the web platform yourself.

Each regeneration runs these steps:

1. **Pin and patch.** The generator is pinned to a known SHA ([`upstream.json`](https://github.com/philipwalton/modern-web-types/blob/main/upstream.json)) and patched ([`patches/min-engines.patch`](https://github.com/philipwalton/modern-web-types/blob/main/patches/min-engines.patch)) so its engine threshold reads from an environment variable.
2. **Build twice.** Both builds run from the same data snapshot: once at the stock threshold of two engines (`baseline`), once at one engine (`full`). `full` is a strict superset of `baseline`.
3. **Diff structurally.** The two outputs are compared with the TypeScript compiler API ([`scripts/diff.ts`](https://github.com/philipwalton/modern-web-types/blob/main/scripts/diff.ts)). Both come from the same emitter run, so declaration text is byte-identical wherever they agree, and the difference is exactly what the two-engine rule removed.
4. **Emit.** [`scripts/emit-lib.ts`](https://github.com/philipwalton/modern-web-types/blob/main/scripts/emit-lib.ts) turns the one-engine build into the shipped lib for each environment, pulling in cross-scope type-only dependencies so every lib stands on its own.

Every step runs once per environment. All five get a complete lib. `dom` and `webworker`, the two TypeScript ships a built-in lib for, also get a baseline build, which is what makes the gap measurable. [`report.md`](https://github.com/philipwalton/modern-web-types/blob/main/report.md) lists that gap, and the smoke tests check that every symbol in it resolves.

## Related

- [`lib.dom.d.ts` / `@types/web`][gen]: the official types, from the generator this project reuses. This project is strictly additive and never redefines what they already cover.
- `@types/dom-*`: hand-written single-feature gap fillers. This package covers the same ground with generated output, shipped as complete libs instead of per-feature patches.

## License

Apache-2.0. Generated output derives from [TypeScript-DOM-lib-generator][gen] (Apache-2.0) and Web IDL from [webref](https://github.com/w3c/webref) (per-spec licenses).

[gen]: https://github.com/microsoft/TypeScript-DOM-lib-generator
