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
  console.log('Fetching:', event.request.url); // Ver qué solicitud está siendo procesada

  // Verificar si la solicitud proviene de una extensión (chrome-extension://)
  if (event.request.url.includes('chrome-extension://')) {
    console.log('Se ignoró una URL de extensión:', event.request.url);
    return; // Ignorar esta solicitud
  }

  // Asegurarse de que no se intenten cachear solicitudes locales de desarrollo
  if (event.request.url.includes('localhost:5000')) {
    console.log('Se ignoró una solicitud a localhost:', event.request.url);
    return; // Ignorar las solicitudes locales si es necesario
  }

  // Manejo de solicitudes GET
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse; // Si está en el caché, responder con la versión cacheada
          }
          // Si no está en caché, hacer la solicitud y agregarla al caché si es válida
          return fetch(event.request).then((response) => {
            if (!response.ok) {
              return response; // Si no es válida, no la cacheamos
            }
            return caches.open(CACHE_NAME).then((cache) => {
              console.log(`Caching: ${event.request.url}`); // Log de qué se está cacheando
              cache.put(event.request, response.clone()); // Cachear la respuesta
              return response;
            });
          });
        })
    );
  }

  // Manejo de solicitudes POST (sin cache)
  if (event.request.method === 'POST') {
    event.respondWith(fetch(event.request));
  }
});
