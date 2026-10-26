# Fieldbook OPB v3c → production merge checklist

**Status:** PREP only. Do **not** replace `/tools/optical-power-budget/` until this checklist is completed and the user authorizes go-live.

Preview URL (must stay non-indexable):  
`https://netengineerlab.com/design/fieldbook/tool-optical-power-budget-v3`

Production URL (keep as sole canonical):  
`https://netengineerlab.com/tools/optical-power-budget/`


## Locked migration principle（老版不丢，新版管布局）

> **老版内容与功能不丢失，新版负责布局与视觉升级。**

Cutover must preserve **all** legacy engineering content and features; Fieldbook only upgrades layout/visual hierarchy.

### Content to keep (no loss)
- Formulas, defaults, default GPON C+ case numbers
- FAQ, standards links, applicability / review info
- Engineering Workflow
- Method / examples sections (merge duplicates; do not delete)

### Features to keep (parity with old page)
- Rx power **range**, maximum distance mode
- Project notes, Save / Share / CSV export / Print / Reset
- **Old-page-strict invalid input**: reject decimals like `1.5` **before** any trunc; disable export while invalid (already fixed on preview in #37)

### URL / SEO (production only at cutover)
- Keep production URL `/tools/optical-power-budget/`
- Keep canonical, hreflang (`en` / `zh-CN` / `es` / `x-default`), JSON-LD, sitemap entries

### Layout order when merging into production
1. Short intro  
2. Params + results  
3. Method / examples  
4. FAQ  
5. Standards / review  
6. Engineering Workflow  
7. Long About **after** the calculator; merge duplicate copy

### Go-live gate
Content parity alone is **not** enough — retest functions + mobile/keyboard before replacing live `/tools/`.

This prep PR / checklist does **not** authorize go-live replace.


## Preview protections to keep until cutover

- [x] `<meta name="robots" content="noindex,nofollow">` on design HTML
- [x] HTTP `X-Robots-Tag: noindex, nofollow` for `/design/*` (`website/_headers`)
- [x] `robots.txt` Disallow `/design/`
- [x] Canonical + `og:url` already point at the **live** tool URL (not `/design/...`)
- [x] Design pages are **not** in sitemap

## On cutover (replace live tool UI — requires explicit authorization)

1. **Indexability**
   - Production response must be `index,follow` (meta + no accidental X-Robots-Tag).
   - Title / description / OG / Twitter from current production head (or improved equivalents), not “DESIGN PREVIEW”.
   - Remove preview banner.

2. **Schema / i18n head (carry forward from live tool)**
   - Keep JSON-LD: `WebApplication`, `BreadcrumbList`, `WebPage` (if present), `FAQPage`.
   - Keep `hreflang`: `en`, `zh-CN`, `es`, `x-default`.
   - Keep sitemap entries for EN/zh/es routes only under `/tools/optical-power-budget/`.
   - Do **not** invent a second indexable URL for Fieldbook.

3. **Navigation / shell**
   - Use formal routes: `/`, `/tools/`, `/guides/`, `/topics/`, `/about/` — never `home.html` / `tools.html`.
   - Wire real language menu + search (production site shell), not preview decorative controls.
   - Confirm EN / zh / es locale pages still resolve.

4. **Calculation & validation**
   - Reuse production `js/engine.js` (or keep byte-identical copy). **Do not change formulas/defaults.**
   - Count fields (`spliceCount` / `connectorCount`): validate **before** any integer truncation; reject decimals (e.g. `1.5`), negatives, empty; disable Copy/Save/CSV while invalid.
   - Regression: GPON C+ defaults → physical 25.8, design 28.8, remain 3.2, Rx −22.8, sensM 7.2, overM 10.8.
   - Regression: distance 20 km → physical 28.8, design 31.8, remain 0.2, Marginal.

5. **Assets**
   - Content-hash or `?v=<hash>` on CSS/JS (site convention).
   - After deploy: hard-reload; confirm HTML query hashes match live body; CSSOM rule count matches HTTP CSS.

6. **QA gates (required before go-live replace)**
   - Mobile 320/375/390 + desktop 768/1280/1440; keyboard focus; no horizontal overflow.
   - Share / Save / CSV / Print / Reset; invalid `1.5` / empty / negative counts.
   - Feature parity checklist vs old page (Rx range, max distance, notes, exports).
   - Content parity checklist (FAQ, standards, workflow, method).
   - Search Console / CrUX not required for prep PRs.

## Out of scope for prep PRs

- Replacing live `/tools/optical-power-budget/` HTML/JS without user go-live approval.
- Opening `/design/` to indexing.
- DNS / Cloudflare zone changes beyond `_headers` cache hints for `/design/*`.
