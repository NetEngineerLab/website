"use strict";
const CACHE = "nel-path-availability-calculator-locale-v1.9.9-04-p0-p1-correctness-consent-offline-scoped-v2-652b883a71cf-2f707c7be7c2";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=3e625a824a21",
  "./js/app.js?v=99fb796113bb",
  "./js/engine.js",
  "./js/engine.js?v=3d01306951bf",
  "./js/pwa.js",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/icons/favicon.svg?v=1.9.5-06",
  "../../assets/css/mobile-branding.css?v=345784b6b020",
  "../../assets/images/logo.svg",
  "../../assets/js/es-launch-runtime.js?v=e0fea69289b0",
  "../../assets/js/id-launch-runtime.js?v=d2b74cbf2983",
  "../../assets/js/pt-br-launch-runtime.js?v=45226abdb119",
  "../../assets/css/pilot-locale-toc.css?v=20261124toc",
  "../../data/locales.js?v=9db7058d6b10",
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
  "../../assets/js/tool-shell-v1.9.9-04.js?v=502db0b62a7e",
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
  "./manifest-pt-br.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("nel-path-availability-calculator-") && key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => nelScopedCacheMatch(event.request)));
});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
