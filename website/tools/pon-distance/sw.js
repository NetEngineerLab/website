"use strict";
const CACHE = "nel-pon-distance-locale-v1.9.9-04-p0-p1-correctness-consent-offline-scoped-v2-ff5180a4daf2-02dacd8b43bb";
const CORE = [
  "./index.html",
  "./",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=3dfd643d7497",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/css/fieldbook.css?v=a3bb21511014",
  "./js/app.js?v=3c89c7386fc4",
  "./js/engine.js",
  "./images/logo.svg",
  "../../assets/css/mobile-branding.css?v=345784b6b020",
  "../../data/seo-config.js",
  "../../assets/js/seo-engine.js?v=15ac96553c44",
  "../../assets/icons/favicon.svg?v=1.9.5-06",
  "../../assets/icons/favicon-32x32.png?v=1.9.5-06",
  "../../favicon.ico?v=1.9.5-06",
  "../../assets/icons/apple-touch-icon.png?v=1.9.5-06",
  "../../assets/images/logo.svg",
  "./js/pwa.js",
  "../../data/optical-standards.js",
  "./js/scenarios.js",
  "../../assets/js/es-launch-runtime.js?v=26766a85d049",
  "./js/engine.js?v=b5210f0fd4a9",
  "../../assets/js/es-launch-runtime.js?v=c7c562a25b80",
  "../../assets/js/es-launch-runtime.js?v=b69809c86108",
  "../../assets/js/es-launch-runtime.js?v=3f188aa72208",
  "../../assets/js/es-launch-runtime.js?v=829a7f1559b7",
  "../../assets/js/es-launch-runtime.js?v=e0fea69289b0",
  "../../assets/js/id-launch-runtime.js?v=b48f2804bf23",
  "../../assets/js/pt-br-launch-runtime.js?v=c5ef6ab315f2",
  "../../assets/js/id-launch-runtime.js?v=5c5c0a77817b",
  "../../assets/js/pt-br-launch-runtime.js?v=1ad25de31c7f",
  "../../assets/js/id-launch-runtime.js?v=2141d735b95b",
  "../../assets/js/pt-br-launch-runtime.js?v=00893649b07d",
  "../../data/locales.js?v=cc78cf7363f3",
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
  "../../assets/js/site.js?v=3feb9dda55e8",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=52d5b338a92d",
  "../../assets/css/cookie-consent.css?v=2f2c8ab643e6",
  "../../assets/js/cookie-consent.js?v=a60243da0fb7",
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
  "./manifest-es.webmanifest",
  "./id/",
  "./id/index.html",
  "./manifest-id.webmanifest",
  "./pt-br/",
  "./pt-br/index.html",
  "./manifest-pt-br.webmanifest",
  "../../assets/js/id-launch-runtime.js?v=3461d0601eeb",
  "../../assets/js/pt-br-launch-runtime.js?v=1223d823e2c6"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("nel-pon-distance-") && key !== CACHE).map((key) => caches.delete(key))
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
