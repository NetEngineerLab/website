"use strict";
const CACHE = "nel-optical-power-budget-locale-v1.9.9-04-p0-p1-correctness-consent-offline-6fcf6905294e";
const CORE = [
  "./index.html",
  "./",
  "./zh/",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=322f05710e8e",
  "./js/app.js?v=ac9dc7072caf",
  "./images/logo.svg",
  "../../assets/css/tool-design-system-v1.9.9-03.css",
  "../../assets/js/tool-shell-v1.9.9-04.js",
  "../../data/locales.js?v=b541508dc0ee",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/design-tokens.css?v=1b428f96cadc",
  "../../assets/css/site-shell.css?v=f34b1ffff9cc",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=9947a445485e",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "./zh/index.html",
  "./manifest-zh.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("nel-optical-power-budget-") && key !== CACHE).map((key) => caches.delete(key))
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
