"use strict";
// t316: tool-isolated exact-version fallback; online documents/styles/scripts always refresh.
const CACHE = "nel-chromatic-dispersion-calculator-locale-v1.9.9-04-p0-p1-correctness-consent-offline-scoped-v2-70a9126ff026-d45cdc5ae5ce";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "/assets/css/tool-workflow.css?v=8c74b394ef2c",
  "/assets/css/cookie-consent.css?v=8dd1728bf5eb",
  "/assets/css/locale-menu.css?v=7804394246fb",
  "/assets/css/design-tokens.css?v=10e842cd32cf",
  "/assets/css/tool-design-system.css?v=20261105-method1r",
  "/assets/css/site-shell.css?v=26fafcdcee42",
  "/data/locales.js?v=909e05076a50",
  "/data/site-config.js?v=b5072ad7fa47",
  "/assets/js/analytics.js?v=1156b7864023",
  "/assets/js/adsense.js?v=f075c80ccc75",
  "/assets/js/site.js?v=b563dd0297f5",
  "/assets/css/tool-layout.css?v=c4aecb2c24ab-bc1",
  "/tools/chromatic-dispersion-calculator/manifest.webmanifest",
  "/tools/chromatic-dispersion-calculator/css/style.css?v=20261108-cd-bw5",
  "/tools/chromatic-dispersion-calculator/js/engine.js?v=72ef42125dcb",
  "/tools/chromatic-dispersion-calculator/js/pwa.js?v=20261108-cd-bw5",
  "/assets/js/tool-integration.js?v=05f7934f4687",
  "/tools/chromatic-dispersion-calculator/js/app.js?v=20261108-cd-bw5",
  "/assets/js/cookie-consent.js?v=5e6d1af21a6a",
  "/assets/js/tool-shell-v1.9.9-04.js?v=77b297dd25ca",
  "/tools/chromatic-dispersion-calculator/manifest-zh.webmanifest",
  "/assets/js/es-launch-runtime.js?v=3f188aa72208",
  "/tools/chromatic-dispersion-calculator/manifest-es.webmanifest",
  "./manifest.webmanifest",
  "../../data/locales.js?v=909e05076a50",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/design-tokens.css?v=10e842cd32cf",
  "../../assets/css/site-shell.css?v=475098aa29f5",
  "../../assets/css/tool-design-system.css?v=fbfd8fc05bdc",
  "../../assets/css/tool-workflow.css?v=8c74b394ef2c",
  "../../assets/css/fb-v3.css?v=718e11ad9233",
  "../../assets/css/fb-v3-prod.css?v=0e51668c3f12",
  "../../assets/js/tool-v3-navigation.js?v=b8d825e0f678",
  "../../assets/js/tool-detail-v3.js?v=6f38212f00f3",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=f55d6161a761",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=b786c10e6903",
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
  "./manifest-es.webmanifest",
  "./css/style.css?v=ccdbb4e66614",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/images/logo.svg",
  "./js/engine.js?v=72ef42125dcb",
  "./js/pwa.js?v=20261108-cd-bw5",
  "./js/app.js?v=22498116e23a",
  "../../assets/js/es-launch-runtime.js?v=829a7f1559b7"
];
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE).then(() => self.skipWaiting())));
});
self.addEventListener("activate", event => {
 // Do not clear origin caches or user projects. Old caches are never read by this worker.
 event.waitUntil(self.clients.claim());
});
async function nelExactMatch(request) {
 const cache = await caches.open(CACHE);
 return cache.match(request);
}
async function nelNetworkFirst(request) {
 try {
  const response = await fetch(request, {cache:"no-store"});
  if (response.ok) {
   const cache = await caches.open(CACHE);
   await cache.put(request, response.clone()).catch(() => {});
  }
  return response;
 } catch (error) {
  let cached = await nelExactMatch(request);
  if (!cached && request.mode === "navigate") {
   const url = new URL(request.url); url.search = "";
   cached = await nelExactMatch(url.href) || await nelExactMatch("./offline.html");
  }
  if (cached) return cached;
  throw error;
 }
}
self.addEventListener("fetch", event => {
 const request=event.request, url=new URL(request.url);
 if(request.method!=="GET" || url.origin!==self.location.origin) return;
 if(request.mode==="navigate" || request.destination==="style" || request.destination==="script" || /\.(?:html|css|js)$/.test(url.pathname)) {
  event.respondWith(nelNetworkFirst(request));
 } else {
  event.respondWith(nelExactMatch(request).then(cached=>cached || nelNetworkFirst(request)));
 }
});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
