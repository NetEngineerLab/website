# GATE6 regression

Local static server: `python3 -m http.server 8765` rooted at `website/`. Lighthouse 13.6.0. Chrome 157. Times are Asia/Shanghai on 2026-11-23, about 23:41.

## Lab scores after the change

Three runs. JSON: `lighthouse/after/`.

| | Performance | Accessibility | Best practices | SEO | Agentic browsing | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile median | 100 | 100 | 100 | 100 | 100 | 1.05 s | 1.05 s | 1.05 s | 0 ms | 0 |
| Desktop median | 100 | 100 | 100 | 100 | 100 | 0.28 s | 0.56 s | 0.28 s | 0 ms | 0 |

Mobile FCP/LCP: 1052, 1052, 1056 ms. Desktop LCP: 564, 567, 563 ms. Desktop performance stayed at 100.

Compared with the production baseline (mobile FCP/LCP 1.56 s, accessibility 96, agentic 2/3), the lab page meets Performance ≥ 98, FCP ≤ 1.3 s, LCP ≤ 1.5 s, Speed Index ≤ 3 s, TBT ≤ 50 ms, CLS 0, accessibility 100, best practices 100, SEO 100, agentic browsing 3/3.

These are lab simulations on localhost. They are not production PSI and they are not CrUX. Field Core Web Vitals remain UNKNOWN.

Desktop LCP discovery passes (`fetchpriority=high`, discoverable, not lazy). Unsized images passes. Contrast passes. `llms-txt` passes. One homepage stylesheet remains render-blocking (`home-bundle.css`); the insight still estimates about 240 ms. That request is the CSS the first paint needs.

## Browser checks

Playwright-core driving system Chrome. Viewports 320, 375, 390, 430, 1280, 1440 for `/`, `/zh/`, `/es/`.

- No horizontal overflow (`scrollWidth` within 1px of `clientWidth`).
- Hero figure hidden at ≤430px and visible at ≥1280px.
- `h1` font-family includes Geist.
- Cookie Decline removes the dialog and stores `false`.
- Mobile menu toggle sets `aria-expanded="true"`.
- Search for `subnet` navigates to `/tools/subnet-calculator/`. No page error on that tool document.
- Category coverage script: PASS for home and tool directory in en/zh/es.

## Unit tests

- `node scripts/build-home-bundle.js --check` PASS
- `npm run test:subnet` PASS
- `npm run test:optical-power-budget` PASS
- `npm run check:categories` PASS
- `npm test` stops in `scripts/tool-detail-v3-contract-test.js` on `sfp-qsfp-compatibility-calculator/en`: the tool service worker precache must include both `./` and `./index.html`. This branch does not modify that `sw.js`. The failure is outside the homepage diff.

`npm run build` was not used as a gate result. `build:i18n` rewrites generated locale and service-worker output across the site. Running it on this branch would mix unrelated generated diffs into the performance change. Link and category checks that read the homepage were run directly.

47 tool engines were not each clicked in a browser. The homepage still links to the same tool URLs. Two engine suites that this change could not affect were re-run and passed. A full browser click-through of every calculator was not completed in this pass.
