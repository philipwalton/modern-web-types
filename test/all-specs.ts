// Internal-consistency check. The floor is build/baseline.d.ts — the stock
// two-engine output of the same generator run the delta was computed from.
// baseline + package should reconstruct the generator's one-engine output, so
// with skipLibCheck off tsc fully checks the package here: any dangling type
// reference or merge conflict introduced by the diff/emit step fails to compile.
//
// Requires a prior `npm run build` to produce build/baseline.d.ts.
/// <reference path="../build/baseline.d.ts" />
/// <reference path="../pkg/index.d.ts" />

export {};
