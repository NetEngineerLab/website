"use strict";
const CACHE = "nel-network-rack-power-cooling-calculator-locale-v1.9.9-04-p0-p1-correctness-consent-offline-scoped-v2-4077d6be2c85-ff446fa1a897";
const CORE = [
  "./index.html",
  "./",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=52fc8dd5ee9e",
  "./js/engine.js?v=rackdeep01",
  "./js/app.js?v=1b103dab8773",
  "./images/logo.svg",
  "../../favicon.ico?v=1.9.8",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/images/logo.svg",
  "./js/pwa.js",
  "./js/deep-workflow.js",
  "./js/engine.js?v=1.9.8",
  "../../assets/js/es-launch-runtime.js?v=26766a85d049",
  "./js/engine.js?v=3e1846a2946b",
  "../../assets/js/es-launch-runtime.js?v=c7c562a25b80",
  "../../assets/js/es-launch-runtime.js?v=b69809c86108",
  "../../assets/js/es-launch-runtime.js?v=3f188aa72208",
  "./js/deep-workflow.js?v=20261107-rack-bw2",
  "../../assets/js/es-launch-runtime.js?v=829a7f1559b7",
  "../../assets/js/es-launch-runtime.js?v=e0fea69289b0",
  "../../data/locales.js?v=909e05076a50",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/design-tokens.css?v=10e842cd32cf",
  "../../assets/css/site-shell.css?v=f427e2f1607b",
  "../../assets/css/tool-design-system.css?v=fbfd8fc05bdc",
  "../../assets/css/tool-workflow.css?v=8c74b394ef2c",
  "../../assets/css/fb-v3.css?v=031fae951adb",
  "../../assets/css/fb-v3-prod.css?v=64bd0d9f6bcb",
  "../../assets/js/tool-v3-navigation.js?v=b8d825e0f678",
  "../../assets/js/tool-detail-v3.js?v=6f38212f00f3",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=c957f6562d31",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=52d5b338a92d",
  "../../assets/css/cookie-consent.css?v=2f2c8ab643e6",
  "../../assets/js/cookie-consent.js?v=5e6d1af21a6a",
  "../../assets/js/rules-engine/normalize.js?v=9e2cb44bca10",
  "../../assets/js/rules-engine/evidence.js?v=275bb87b037a",
  "../../assets/js/rules-engine/evaluate.js?v=fdd7e0e551ef",
  "../../assets/js/rules-engine/score.js?v=fce2240d4bb7",
  "../../assets/js/rules-engine/report.js?v=01f2524dcdac",
  "../../assets/generated/rules-engine/rules-bundle.9d06acb2a0ff.js?v=9d06acb2a0ff",
  "./zh/",
  "./zh/index.html",
  "./manifest-zh.webmanifest",
  "./es/",
  "./es/index.html",
  "./manifest-es.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("nel-network-rack-power-cooling-calculator-") && key !== CACHE).map((key) => caches.delete(key))
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
    }).catch(() => nelScopedCacheMatch(request, { ignoreSearch: true }).then(
      (cached) => cached || nelScopedCacheMatch("./offline.html")
    )));
    return;
  }
  event.respondWith(nelScopedCacheMatch(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
