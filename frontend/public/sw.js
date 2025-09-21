const CACHE_NAME = 'croptoken-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('CropToken SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('CropToken SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('CropToken SW: Installation complete');
        self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches  
self.addEventListener('activate', (event) => {
  console.log('CropToken SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('CropToken SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('CropToken SW: Activation complete');
      self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extension and external requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Don't cache API calls or dynamic content
          if (event.request.url.includes('/api/') || 
              event.request.url.includes('hashio.io')) {
            return fetchResponse;
          }
          
          // Cache successful responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          
          return fetchResponse;
        });
      })
      .catch((error) => {
        console.log('CropToken SW: Fetch failed:', error);
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('CropToken SW: Background sync triggered');
  if (event.tag === 'crop-tokenization') {
    event.waitUntil(syncCropTokenization());
  }
});

async function syncCropTokenization() {
  try {
    // Handle offline crop tokenization requests
    const pendingRequests = await getFromIndexedDB('pending-tokenizations');
    for (const request of pendingRequests) {
      try {
        await fetch('/api/tokenize-crop', {
          method: 'POST',
          body: JSON.stringify(request),
          headers: {'Content-Type': 'application/json'}
        });
        await removeFromIndexedDB('pending-tokenizations', request.id);
      } catch (error) {
        console.log('Failed to sync tokenization:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notifications for important events
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'croptoken-notification',
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CropToken', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || event.action === '') {
    const url = event.notification.data || '/';
    event.waitUntil(
      clients.matchAll({type: 'window'}).then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// IndexedDB helpers for offline storage
async function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('croptoken-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.getAll();
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
  });
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('croptoken-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}
