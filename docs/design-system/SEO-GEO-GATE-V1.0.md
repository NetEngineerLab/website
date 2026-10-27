# SEO / GEO Gate V1.0

| Field | Value |
|---|---|
| Task | NEL-UI-UNIFICATION-V1.0 · Phase 0 |
| Status | Release-blocking for production tool upgrades |

## 1. URL & indexing

| Rule | Requirement |
|---|---|
| Production URL | Keep existing `/tools/{slug}/` (and locale paths). No cosmetic path renames. |
| Canonical | Absolute `https://netengineerlab.com/...` matching the language page. |
| Indexing | Production: `index,follow` (or site default that allows index). |
| Design previews | `/design/**` remain `noindex,nofollow` + `robots.txt` Disallow; canonical may point at production tool. |
| Sitemap | Only production URLs; never preview paths. |
| Competition | One indexable URL family per tool+locale; do not leave parallel indexed experiments. |

## 2. Metadata

- `<title>`, meta `description`, `H1` each distinct and accurate.  
- `og:*` / Twitter cards: `og:url` = **production** canonical; titles/descriptions match locale.  
- `hreflang`: `en` / `zh-CN` / `es` / `x-default` only for locales that **exist**; must match live routes.  
- Language switcher must not 404 or point at wrong tool.

## 3. Structured data

- Use **real** JSON-LD matching page type (`WebApplication`, `FAQPage`, `BreadcrumbList`, `WebPage`, etc.).  
- FAQ JSON-LD **must match visible FAQ** text.  
- Do not invent ratings, authors, or studies.  
- On migration: **carry forward** existing valid schema from the old production head; strip preview-only banners/titles.

## 4. GEO (AI-citation readiness) — content quality, not spam

Required where the tool is engineering-calc oriented:

- Formulas readable in HTML (not image-only).  
- At least one worked example: inputs → steps → outputs.  
- Applicability / limits stated.  
- Citations to real standards or official docs with working links.  
- Review date / update log (user-facing).  
- Sensible internal links to related tools / guides / topics.

**Forbidden:** duplicate paragraph spam, keyword stuffing, copying OPB-specific GEO blocks into unrelated tools, fake “peer review” claims.

## 5. Migration SEO checklist (must pass before overwrite)

- [ ] Production path unchanged  
- [ ] Preview `noindex` did **not** leak into production head  
- [ ] Canonical + OG URL = production  
- [ ] hreflang set restored/verified  
- [ ] JSON-LD graph restored and consistent with body  
- [ ] High-value old copy retained or consciously rewritten (not deleted silently)  
- [ ] Internal links from hubs/topics still resolve  
- [ ] Locale parity for metadata (en/zh/es as applicable)

## 6. Evidence

Record for each upgraded tool: URL, `robots`, canonical, hreflang sample, schema types present, sitemap membership, and “preview isolation” proof.
