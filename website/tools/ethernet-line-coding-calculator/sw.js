"use strict";
const CACHE="nel-ethernet-line-coding-calculator-v1";
const CORE=[
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css?v=3e625a824a21",
  "./js/app.js?v=13190eae6437",
  "./js/engine.js",
  "./js/engine.js?v=7de6d4c0c38e",
  "./js/pwa.js",
  "./zh/",
  "./zh/index.html",
  "./es/",
  "./es/index.html",
  "../../assets/css/fb-v3.css?v=031fae951adb",
  "../../assets/css/fb-v3-prod.css?v=64bd0d9f6bcb",
  "../../assets/js/tool-v3-navigation.js?v=b8d825e0f678",
  "../../assets/js/tool-detail-v3.js?v=6f38212f00f3",
  "../../assets/js/tool-shell-v1.9.9-04.js?v=52d5b338a92d",
  "../../assets/css/design-tokens.css?v=10e842cd32cf",
  "../../assets/css/site-shell.css?v=475098aa29f5",
  "../../assets/css/tool-layout.css?v=c4aecb2c24ab",
  "../../assets/css/tool-workflow.css?v=8c74b394ef2c",
  "../../assets/css/locale-menu.css?v=7804394246fb",
  "../../assets/css/tool-design-system.css?v=fbfd8fc05bdc",
  "../../assets/js/analytics.js?v=1156b7864023",
  "../../assets/js/adsense.js?v=f075c80ccc75",
  "../../assets/js/site.js?v=c957f6562d31",
  "../../assets/css/cookie-consent.css?v=2f2c8ab643e6",
  "../../assets/js/cookie-consent.js?v=5e6d1af21a6a",
  "../../data/locales.js?v=909e05076a50",
  "../../data/site-config.js?v=b5072ad7fa47",
  "../../assets/js/rules-engine/normalize.js?v=9e2cb44bca10",
  "../../assets/js/rules-engine/evidence.js?v=275bb87b037a",
  "../../assets/js/rules-engine/evaluate.js?v=fdd7e0e551ef",
  "../../assets/js/rules-engine/score.js?v=fce2240d4bb7",
  "../../assets/js/rules-engine/report.js?v=01f2524dcdac",
  "../../assets/generated/rules-engine/rules-bundle.9d06acb2a0ff.js?v=9d06acb2a0ff"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("nel-ethernet-line-coding-calculator-") && key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
