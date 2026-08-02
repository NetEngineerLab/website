"use strict";
const CACHE = "nel-dns-ttl-propagation-calculator-v1.9.9-03";
const CORE = [
  "./", "./zh/", "./offline.html", "./manifest.webmanifest",
  "./manifest-zh.webmanifest", "./css/style.css", "./js/app.js",
  "./images/logo.svg", "../../assets/css/tool-design-system-v1.9.9-03.css",
  "../../assets/js/tool-shell-v1.9.9-03.js"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("nel-dns-ttl-propagation-calculator-") && key !== CACHE).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request, { ignoreSearch: true }).then(
      (cached) => cached || caches.match("./offline.html")
    )));
    return;
  }
  event.respondWith(caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
