const CACHE_NAME = 'finanzas-personales-v1';
const urlsToCache = [
  '/index.html',
  '/dashboard.html',
  '/login.html',
  '/registro.html',
  '/metas.html',
  '/perfil.html',
  '/servicios.html',
  '/estadisticas.html',
  '/configuracion.html',
  '/reset-password.html',
  '/recuperar-password.html',
  '/manifest.json',
  '/img/fav.ico',
  '/img/logo.jpeg',
  '/css/estilos.css',
  '/css/dashboard.css',
  '/css/metas.css',
  '/css/perfil.css',
  '/css/servicios.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/finanzas.js',
  '/js/metas.js',
  '/js/perfil.js',
  '/js/estadisticas.js',
  '/js/detalle.js',
  '/js/password.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.ttf'
];

// Filtrar URLs válidas, garantizando que se eviten URLs de extensiones
const validUrlsToCache = urlsToCache.filter(url => {
  return !url.includes('chrome-extension://') && url.startsWith('http');
});

// Verifica las URLs antes de agregar al caché
console.log('URLs válidas a cachear:', validUrlsToCache);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Archivos cacheados');
        return cache.addAll(validUrlsToCache); // Añadir solo URLs válidas
      })
      .catch((error) => {
        console.error('Error al agregar archivos al caché:', error);
      })
  );
});

// Filtrar y manejar solo URLs válidas durante el fetch
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);

  // Cachea las solicitudes GET para APIs
  if (event.request.method === 'GET' && event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Si hay respuesta en cache, la devuelve
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si no está en cache, lo solicita a la red y lo agrega al cache
          return fetch(event.request).then((response) => {
            if (!response.ok) {
              return response;
            }
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
    );
  }

  // Para las solicitudes GET de archivos estáticos
  if (event.request.method === 'GET' && !event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (!response.ok) {
              return response;
            }
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
    );
  }
  
  // Si es una solicitud POST o cualquier otra solicitud dinámica
  if (event.request.method === 'POST') {
    event.respondWith(fetch(event.request));
  }
});

