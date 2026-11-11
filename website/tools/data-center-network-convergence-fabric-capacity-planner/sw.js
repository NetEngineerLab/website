"use strict";
const CACHE = "nel-data-center-network-convergence-fabric-capacity-planner-locale-v1.9.9-04-p0-p1-correctness-consent-offline-scoped-v2-70a9126ff026-529e0e0b11b7";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=2bd61c88224a",
  "./js/engine.js",
  "./js/app.js?v=0adceebb3574",
  "./js/pwa.js",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/images/logo.svg",
  "./js/defaults.js",
  "./js/deep-workflow.js?v=20261108-fabric-bw1",
  "../../assets/js/es-launch-runtime.js?v=26766a85d049",
  "./js/engine.js?v=ed8d5c064edc",
  "../../assets/js/es-launch-runtime.js?v=c7c562a25b80",
  "../../assets/js/es-launch-runtime.js?v=b69809c86108",
  "../../assets/js/es-launch-runtime.js?v=3f188aa72208",
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
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "./js/locale-es.js",
  "./js/bw-page-adapter.js",
  "../../assets/js/es-launch-runtime.js?v=829a7f1559b7"
];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("nel-data-center-network-convergence-fabric-capacity-planner-")&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(nelScopedCacheMatch(e.request,{ignoreSearch:true}).then(c=>c||fetch(e.request).catch(()=>nelScopedCacheMatch("./offline.html"))))});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
