const CACHE_VERSION =
  "hhs-static-v1";

const OFFLINE_PAGE =
  "/offline.html";

const PRECACHE_FILES = [
  OFFLINE_PAGE,
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
];

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(CACHE_VERSION)
        .then((cache) => {
          return cache.addAll(
            PRECACHE_FILES
          );
        })
        .then(() => {
          return self.skipWaiting();
        })
    );
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((cacheName) => {
                return (
                  cacheName.startsWith(
                    "hhs-"
                  ) &&
                  cacheName !==
                    CACHE_VERSION
                );
              })
              .map((cacheName) => {
                return caches.delete(
                  cacheName
                );
              })
          );
        })
        .then(() => {
          return self.clients.claim();
        })
    );
  }
);

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    if (request.method !== "GET") {
      return;
    }

    const requestUrl =
      new URL(request.url);

    if (
      requestUrl.origin !==
      self.location.origin
    ) {
      return;
    }

    if (
      requestUrl.pathname.startsWith(
        "/api/"
      )
    ) {
      return;
    }

    if (
      request.mode === "navigate"
    ) {
      event.respondWith(
        fetch(request).catch(
          async () => {
            const offlinePage =
              await caches.match(
                OFFLINE_PAGE
              );

            return (
              offlinePage ||
              Response.error()
            );
          }
        )
      );

      return;
    }

    const cacheableDestinations = [
      "style",
      "script",
      "image",
      "font",
    ];

    if (
      !cacheableDestinations.includes(
        request.destination
      )
    ) {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseCopy =
            response.clone();

          caches
            .open(CACHE_VERSION)
            .then((cache) => {
              return cache.put(
                request,
                responseCopy
              );
            });

          return response;
        })
        .catch(async () => {
          const cachedResponse =
            await caches.match(
              request
            );

          return (
            cachedResponse ||
            Response.error()
          );
        })
    );
  }
);
