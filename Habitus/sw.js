const CACHE_NAME = 'v3_cache'; // Version erhöht auf v3
const urlsToCache = [
  '/',
  '/index.html',
];

// Installation: Cache befüllen
self.addEventListener('install', (event) => {
  // skipWaiting zwingt den neuen SW, sofort die Kontrolle zu übernehmen
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Aktivierung: Altem Cache den Garaus machen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Sofortige Kontrolle über alle Tabs übernehmen
  return self.clients.claim();
});

// Fetch-Strategie: Network First (Besser für die Entwicklung!)
// Erst im Netz nachschauen, wenn offline, dann Cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});