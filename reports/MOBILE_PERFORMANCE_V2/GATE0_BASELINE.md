# GATE0 baseline

Read-only audit before any code change. Recorded 2026-11-23 23:19–23:22 Asia/Shanghai (UTC+8).

## Git and production match

- Branch at audit start: `main`
- HEAD: `58b7185958af1798247c1ee1c8a2547bd21e12fd`
- `git status` was clean. Local `main` matched `origin/main`.
- Production `https://netengineerlab.com/` HTML SHA-256 equals `website/index.html`:
  `0f4a9c5b25f11493e61df25c2478d8112eee5c0e2fe80ba711167e74a14eb450`
- Production was not modified. Cloudflare settings were not modified.

## Homepage CSS and JS actually referenced

Blocking stylesheets on the English homepage:

- `assets/css/site.css` (9,938 bytes, no version query)
- `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap`
- `assets/css/home-fresh.css?v=20261109-homefresh6` (8,389 bytes)
- `assets/css/locale-menu.css?v=7804394246fb` (1,524 bytes)
- `assets/css/design-tokens.css?v=10e842cd32cf` (952 bytes)
- `assets/css/site-shell.css?v=475098aa29f5` (12,181 bytes)

Already non-blocking: `cookie-consent.css`, `mobile-branding.css` (`rel=preload` + `onload`).

Scripts: `seo-config.js`, `seo-engine.js`, `locales.js`, `site-config.js`, `analytics.js`, `adsense.js`, `data/tools-catalog.js` (66,675 bytes raw, about 22,062 bytes transferred), `site.js`, `optical-standards.js`, `home-search.js` are `defer`. `cookie-consent.js` is a classic script at the end of `body`.

`zh/index.html` and `es/index.html` use the same set with `../assets/` paths.

## Fonts

The homepage requests Geist 400, 500, 600 and 700. All four weights are used in `home-fresh.css` (body 400, buttons and numerals 500, headings 600, kicker 700). Google serves one variable woff2 per subset, so the four weights are not four extra files. The page also preconnects to `fonts.googleapis.com` and `fonts.gstatic.com`. The HTML response repeats a `Link: rel=preconnect` for `fonts.googleapis.com`.

## Cookie consent

`website/assets/js/cookie-consent.js` shows the banner when `localStorage["nel_cookie_consent_v1"]` is missing, then calls `gtag("consent","update")` and `NEL_LOAD_ANALYTICS()` only after accept. Line 20 is `focus({preventScroll:true})`. Line 59 reads `localStorage` on `DOMContentLoaded`. The current file does not read `offsetWidth` or `offsetHeight`.

## LCP

Desktop Lighthouse identifies `assets/images/home-hero-bench.svg` (viewBox `0 0 540 500`). It is in the initial HTML, is not `loading=lazy`, has no `fetchpriority`, and has no `width` or `height`. Mobile CSS hides `.hf-hero-art` below 960px. Mobile LCP discovery is not applicable: FCP and LCP are the same text paint. The SVG is still downloaded (about 2,001 bytes transferred).

## Cache and security headers (production)

HTML: `cache-control: public, max-age=0, must-revalidate`, `cf-cache-status: DYNAMIC`.

`/assets/*` from `website/_headers`: `public, max-age=86400, stale-while-revalidate=604800`. Confirmed on `site.css` (`cf-cache-status: HIT`).

Present: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation, payment, usb disabled), `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

`Content-Security-Policy-Report-Only` is set (default-src self; script/style/img/font/connect/frame allowances for GA4, AdSense, Cloudflare Insights, Google Fonts). No enforcing CSP. No `Content-Security-Policy` (enforced). No `Cross-Origin-Opener-Policy`. No `Require-Trusted-Types-For`.

`includeSubDomains` is already live. `preload` is not set.

## Scores

PageSpeed Insights API returned HTTP 429. Scores below are Lighthouse 13.6.0, three runs, simulated mobile throttling and the desktop preset. Same engine PSI uses. Full JSON: `lighthouse/baseline/`.

| | Performance | Accessibility | Best practices | SEO | Agentic browsing | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile median | 99 | 96 | 100 | 100 | 67 (2/3) | 1.56 s | 1.56 s | 1.56 s | 0 ms | 0.0003 |
| Desktop median | 100 | 96 | 100 | 100 | 67 (2/3) | 0.46 s | 0.71 s | 0.46 s | 0 ms | ~0 |

Mobile runs: performance 99/99/99, FCP and LCP 1553 / 1559 / 1586 ms.
Desktop runs: performance 100/100/100, LCP 711 / 708 / 729 ms.

Agentic browsing applicable audits: accessibility tree pass, CLS pass, `llms.txt` fail (“File does not appear to contain any links”). WebMCP and ARD are not applicable and weight 0. That is the 2/3 result.

Accessibility failures: `#667d92` on white at 4.27:1 (tool-card descriptions), `#e8590c` on white at 3.58:1 (category counts), and on desktop the current nav link `#0b6ff2` on `#edf5ff` at 4.18:1.

Render-blocking insight attributes about 710 ms on mobile to the Google Fonts stylesheet, plus the five same-origin stylesheets. Forced-reflow insight is empty.

CrUX field data: UNKNOWN. These runs are lab data only.

## Screenshots

- `screens/home-mobile-390.png` production homepage, 390px
- `screens/home-desktop-1440.png` production homepage, 1440px

Network requests for the mobile run are inside `lighthouse/baseline/mobile-2.json` (`network-requests` and `network-dependency-tree-insight`). The longest observed chain is the document, then the Google Fonts CSS, then the Geist latin woff2. Same-origin CSS finishes in parallel with that CSS on the unthrottled trace; the simulated score still treats the font CSS as render-blocking.
