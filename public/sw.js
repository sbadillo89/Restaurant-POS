/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'restaurant-pos-v1';

// On install, the service worker will take over the page immediately.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// On activate, take control of all open clients.
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// On fetch, use a "network falling back to cache" strategy.
// This is ideal for ensuring users get the latest version of the app when they are online,
// while still providing offline access to previously cached assets.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the network request is successful, cache the response for offline use.
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If the network request fails (e.g., user is offline),
        // try to serve the response from the cache.
        return caches.match(event.request);
      })
  );
});

// When the client sends a 'SKIP_WAITING' message, the new service worker
// will activate immediately, forcing the update.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
