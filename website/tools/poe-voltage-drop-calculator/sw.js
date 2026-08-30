"use strict";
const CACHE = "nel-poe-voltage-drop-calculator-locale-v1.9.9-04-p0-p1-correctness-consent-offline-b37a6bdecfc8";
const CORE = [
  "./index.html",
  "./",
  "./zh/",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=0d7d435b1f3d",
  "./js/engine.js",
  "./js/app.js?v=5b619d25a500",
  "./images/logo.svg",
  "../../assets/generated/rules-engine/rules-bundle.de12fe296b92.js?v=de12fe296b92",
  "../../assets/generated/rules-engine/rules-bundle.1fc20a3cb9bf.js?v=1fc20a3cb9bf",
  "../../data/locales.js?v=b541508dc0ee",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/design-tokens.css?v=1b428f96cadc",
  "../../assets/css/site-shell.css?v=f34b1ffff9cc",
  "../../assets/css/tool-design-system-v1.9.9-03.css?v=74eed43d191e",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=af1b8909e5b4",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=d2715dc996b6",
  "../../assets/js/rules-engine/normalize.js?v=4fedb444e0a3",
  "../../assets/js/rules-engine/evidence.js?v=5e7f891ba94a",
  "../../assets/js/rules-engine/evaluate.js?v=1c69ae2ee340",
  "../../assets/js/rules-engine/score.js?v=48a03ce92301",
  "../../assets/js/rules-engine/report.js?v=87d664ed035b",
  "../../assets/generated/rules-engine/rules-bundle.9d06acb2a0ff.js?v=9d06acb2a0ff",
  "./zh/index.html",
  "./manifest-zh.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("nel-poe-voltage-drop-calculator-") && key !== CACHE).map((key) => caches.delete(key))
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
