const CACHE_NAME = 'pomodoro-v1.9.9';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './version.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch Strategy: Cache First, fallback to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

// Communication with frontend
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
