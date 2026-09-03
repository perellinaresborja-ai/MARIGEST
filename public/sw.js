self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// A simple fetch handler is enough to satisfy the PWA requirements
// for installability without doing any aggressive caching.
self.addEventListener('fetch', (event) => {
  // We don't intercept any requests, letting the browser handle them naturally
});
