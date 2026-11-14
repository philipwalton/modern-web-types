// These shipped Chromium APIs disappeared together from WebRef IDL 3.86.0.
export {};
const memory: number = navigator.deviceMemory;
declare const entries: PerformanceObserverEntryList;
const tasks: PerformanceLongTaskTiming[] = entries.getEntriesByType("longtask");
const attribution: readonly TaskAttributionTiming[] = tasks[0].attribution;
