// Internal-consistency check for the Worker scope. The floor is
// build/worker-baseline.d.ts — the stock two-engine WebWorker lib from the
// same generator run the worker delta was computed from. With skipLibCheck
// off, tsc fully checks every worker spec file here; a dangling reference or
// merge conflict fails to compile.
//
// Requires a prior `npm run build` to produce build/worker-baseline.d.ts.
/// <reference path="../build/worker-baseline.d.ts" />
/// <reference path="../pkg/worker.d.ts" />

export {};
