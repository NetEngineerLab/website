# Fieldbook OPB → `/tools/optical-power-budget/` SEO merge checklist

**Status:** PREP only. Preview stays `noindex,nofollow`. Do **not** replace production until the user authorizes go-live and this list is checked.

| | URL |
|---|---|
| Preview (non-indexable) | `https://netengineerlab.com/design/fieldbook/tool-optical-power-budget-v3` |
| Production canonical | `https://netengineerlab.com/tools/optical-power-budget/` |

Companion: `MERGE_TO_PRODUCTION_CHECKLIST.md` (content/features/QA). This file is the **head / schema / i18n / shell** handoff.

## Keep on preview until cutover

- [x] `<meta name="robots" content="noindex,nofollow">`
- [x] HTTP `X-Robots-Tag` for `/design/*`
- [x] `robots.txt` Disallow `/design/`
- [x] Canonical + `og:url` → production tool URL (not `/design/...`)
- [x] Not listed in sitemap

## Carry from live production head on cutover

Paste / verify these from the current live EN tool page (and locale siblings), then align body FAQ text if schema answers change.

### Document meta

- [ ] `title` — production wording (no “DESIGN PREVIEW” / “Fieldbook v3c preview”)
- [ ] `meta name="description"`
- [ ] `meta name="robots"` → `index,follow` (or site default); **remove** preview noindex
- [ ] Canonical → `https://netengineerlab.com/tools/optical-power-budget/` (EN) and locale-specific canonicals for zh/es

### Open Graph / Twitter

- [ ] `og:type`, `og:site_name`, `og:title`, `og:description`
- [ ] `og:url` = production tool URL
- [ ] `og:image` (existing OPB OG asset)
- [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### JSON-LD (do not invent a second indexable URL)

- [ ] `WebApplication`
- [ ] `FAQPage` (answers must match on-page FAQ)
- [ ] `BreadcrumbList`
- [ ] `WebPage` (if present on live today)

### hreflang

- [ ] `en` → `/tools/optical-power-budget/`
- [ ] `zh-CN` → `/tools/optical-power-budget/zh/`
- [ ] `es` → `/tools/optical-power-budget/es/`
- [ ] `x-default` → EN production URL

### Sitemap

- [ ] Keep EN / zh / es under `/tools/optical-power-budget/` only
- [ ] Never add `/design/fieldbook/...`

### Site navigation shell

- [ ] Formal routes: `/`, `/tools/`, `/guides/`, `/topics/`, `/about/`
- [ ] Production search + language controls (not preview decorative placeholders)
- [ ] Remove preview banner / “Design preview (noindex)” footer line
- [ ] Confirm EN / 中文 / ES locale pages resolve after UI swap

## Cutover order (SEO-safe)

1. Merge Fieldbook UI into existing production tool routes (same URLs).
2. Swap head: production meta + schema + hreflang; drop preview robots.
3. Deploy; verify live HTML is indexable and schema validates.
4. Leave `/design/fieldbook/...` as optional archive with noindex, or retire later — never compete with `/tools/`.

## Out of scope here

- Changing formulas, defaults, or Pass/Marginal/Fail rules
- Opening `/design/` to indexing
- DNS / Cloudflare zone changes beyond existing `/design/*` headers
