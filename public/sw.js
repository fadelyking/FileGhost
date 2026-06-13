// Minimal service worker for PWA installability.
// FileGhost requires network connectivity for upload, clean, and download flows,
// so offline caching is intentionally not implemented.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
