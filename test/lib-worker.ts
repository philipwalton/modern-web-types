// Validates the "replace" flavor for Worker scope: pkg/lib.webworker.d.ts is
// referenced as the entire WebWorker lib (tsconfig sets `lib: ["ESNext"]` with
// no "WebWorker"). It must supply both baseline worker globals and single-engine
// worker APIs and typecheck standalone.
/// <reference path="../pkg/lib.webworker.d.ts" />

// Baseline worker globals, which would normally come from lib.webworker.
const scope: WorkerGlobalScope = self;
async function cache(): Promise<Cache> {
  return caches.open("v1");
}

// Single-engine APIs exposed only on a worker global.
function backgroundFetch(event: BackgroundFetchEvent): string {
  return event.registration.id;
}
function install(event: InstallEvent): Promise<void> {
  const rule: RouterRule = {
    condition: { urlPattern: "/api/*" },
    source: "network",
  };
  return event.addRoutes(rule);
}

export { scope, cache, backgroundFetch, install };
