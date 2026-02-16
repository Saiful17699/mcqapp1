/* ========================================
   Service Worker — Offline Cache
   ======================================== */

const CACHE_NAME = "mcq-app-cache-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/admin.html",
  "/exam.html",

  "/css/style.css",

  "/js/db.js",
  "/js/importer.js",
  "/js/engine.js",
  "/js/session.js",
  "/js/timer.js",

];

/* ----------------------------
   Install Event
----------------------------- */

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );

  self.skipWaiting();

});

/* ----------------------------
   Activate Event
----------------------------- */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

    })

  );

  self.clients.claim();

});

/* ----------------------------
   Fetch Event
----------------------------- */

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })

  );

});
