// Exercises Worker-scope APIs that exist only off a worker global and so are
// unreachable from the Window build. None compile against the stock WebWorker
// lib; they compile only because the generated worker types are referenced.
/// <reference path="../build/webworker.baseline.d.ts" />
/// <reference path="../pkg/worker.d.ts" />

// ServiceWorker static routing: InstallEvent.addRoutes with RouterRule.
function install(event: InstallEvent): Promise<void> {
  const rule: RouterRule = {
    condition: { urlPattern: "/api/*" },
    source: "network",
  };
  return event.addRoutes(rule);
}

// Background Fetch and Periodic Sync events, dispatched on the SW global.
function backgroundFetch(event: BackgroundFetchEvent): string {
  return event.registration.id;
}
function periodicSync(event: PeriodicSyncEvent): string {
  return event.tag;
}

export { install, backgroundFetch, periodicSync };
