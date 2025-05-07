// Esta configuração é opcional - o next-pwa cria um service worker automaticamente

// Define a versão do cache para facilitar a invalidação
const CACHE_NAME = 'profnet-v1';

// Lista de recursos para pré-cachear
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png'
];

// Instala o service worker e faz o cache de recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Gerencia como as requisições são tratadas
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        
        // Caso contrário, busca na rede
        return fetch(event.request)
          .then((response) => {
            // Não armazena em cache se a resposta não for válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cria uma cópia da resposta para armazenar no cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // Se falhar, exibe a página offline para navegação
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            
            // Para outros recursos como imagens, tenta recuperar do cache
            return caches.match(event.request);
          });
      })
  );
});

// Limpa caches antigos quando uma nova versão do service worker é ativada
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
