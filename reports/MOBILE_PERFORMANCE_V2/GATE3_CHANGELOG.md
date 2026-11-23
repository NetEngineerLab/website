# GATE3 changelog

Branch `cursor/mobile-performance-v2-4364`. `main` was not rewritten. Nothing was merged or deployed.

## CSS and fonts

- Added self-hosted Geist variable subsets `website/assets/fonts/geist-latin-v5.woff2` and `geist-latin-ext-v5.woff2` (SIL Open Font License, the Google Fonts files).
- Added `website/assets/css/geist.css` with `font-weight: 400 700` and `font-display: swap`.
- Added `website/assets/css/home-bundle.css`, the concatenation of design tokens, `site.css`, `site-shell.css`, `locale-menu.css`, `home-fresh.css` and `geist.css`.
- Added `scripts/build-home-bundle.js`. `npm test` runs it with `--check`.
- English, Chinese and Spanish homepages now load one stylesheet, `home-bundle.css?v=20261123-mpv2`, and preload the subset that covers that page (latin, or latin-ext on Spanish). Google Fonts preconnect and stylesheet links were removed from those three pages only.
- Cookie and mobile-branding styles stay on the existing non-blocking preload.

## LCP image

The three homepage hero images now have `width="540"` `height="500"` `loading="eager"` `fetchpriority="high"`. No preload link.

## Contrast

`home-fresh.css` muted text `#5a7086`. Small orange numerals `#c2410c`. `site-shell.css` current, hover and focus nav text `#0a62d8` on the existing `#edf5ff` pill. Button blue is unchanged.

## Cache

`website/_headers` adds `/assets/fonts/*` → `Cache-Control: public, max-age=31536000, immutable`. The one-day `/assets/*` rule is unchanged. HTML caching is unchanged.

## llms.txt

Existing URLs are Markdown links. 117 links. Zero bare `https://` URLs. Every target resolves to a file under `website/`.

## Explicitly not changed

- `cookie-consent.js`, analytics and AdSense gating
- `data/tools-catalog.js` and `home-search.js`
- Tool-page Google Fonts (Geist Mono, Instrument Serif)
- Enforcing CSP, COOP, Trusted Types, HSTS `preload`, and `includeSubDomains`
- Cloudflare production configuration
