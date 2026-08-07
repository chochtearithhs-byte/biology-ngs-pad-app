const CACHE_NAME = 'bio-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Khmer+M1:wght@400;700&display=swap'
];

// ដំឡើង Service Worker និង Cache រាល់សំភារៈចាំបាច់
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// លុប Cache ចាស់ៗចោលនៅពេលមានការ Update កូដថ្មី
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ទាញយកប្រភពទិន្នន័យ (Fetch data) តាម Network មុន បើគ្មាន Network ទើបទាញពី Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});