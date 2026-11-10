"use strict";const CACHE = "nel-telecom-rectifier-dc-power-sizing-20261108-rectifier-bw6";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=20261108-rectifier-bw6",
  "./js/engine.js?v=3.0.0",
  "./js/app.js?v=20261108-rectifier-bw6",
  "./js/pwa.js",
  "../../assets/css/tool-layout.css?v=e7de330b5d86",
  "../../assets/images/logo.svg",
  "../../assets/js/es-launch-runtime.js?v=26766a85d049",
  "./js/engine.js",
  "./js/engine.js?v=437956c2e4f9",
  "../../assets/js/es-launch-runtime.js?v=c7c562a25b80",
  "../../assets/js/es-launch-runtime.js?v=b69809c86108",
  "../../data/locales.js?v=909e05076a50",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/design-tokens.css?v=10e842cd32cf",
  "../../assets/css/site-shell.css?v=26fafcdcee42",
  "../../assets/css/tool-design-system.css?v=0163aaafdd67",
  "../../assets/css/tool-workflow.css?v=8c74b394ef2c",
  "../../assets/css/fb-v3.css?v=252951bc45c8",
  "../../assets/css/fb-v3-prod.css?v=35fd6b8f7526",
  "../../assets/js/tool-v3-navigation.js?v=b8d825e0f678",
  "../../assets/js/tool-detail-v3.js?v=6f38212f00f3",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=b563dd0297f5",
  "../../assets/js/tool-integration.js?v=05f7934f4687",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=77b297dd25ca",
  "../../assets/css/cookie-consent.css?v=8dd1728bf5eb",
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
  "../../assets/js/es-launch-runtime.js?v=3f188aa72208"
];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("nel-telecom-rectifier-dc-power-sizing-")&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(nelScopedCacheMatch(e.request,{ignoreSearch:true}).then(c=>c||fetch(e.request)))});
/* NEL_SCOPED_CACHE_START */
// A different tool may retain another version of a shared asset. Never search
// its cache, and never discard a resource's content-hash query when matching.
function nelScopedCacheMatch(request, options) {
  const navigation = typeof request !== "string" && request.mode === "navigate";
  return caches.open(CACHE).then(cache => cache.match(request, navigation ? { ...options, ignoreSearch: true } : undefined));
}
/* NEL_SCOPED_CACHE_END */
