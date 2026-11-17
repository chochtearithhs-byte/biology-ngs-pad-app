const CACHE_NAME = 'ngs-bio-app-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;600;700&display=swap',
  'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js'
];

// ដំឡើង Service Worker និង Cache ឯកសារគោលរបស់ App
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

// គ្រប់គ្រងការទាញយកទិន្នន័យ (Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // មិនត្រូវ Cache សំណើទៅកាន់ Google Apps Script API ឬ POST requests ឡើយ
  if (event.request.method !== 'GET' || url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // រក្សាទុកច្បាប់ចម្លងថ្មីចូល Cache សម្រាប់ឯកសារក្នុង App
        if (networkResponse && networkResponse.status === 200 && url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // បើដាច់អ៊ីនធឺណិត ទាញយកពី Cache មកបង្ហាញ
        return caches.match(event.request);
      })
  );
});
