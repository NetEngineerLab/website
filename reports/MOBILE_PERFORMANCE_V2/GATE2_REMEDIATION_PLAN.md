# GATE2 remediation plan

This plan was written from the GATE0 and GATE1 evidence and then executed in GATE3. Items without a measured failure were not implemented.

## P0. Homepage CSS chain

- Evidence: mobile render-blocking insight, FCP median 1.56 s, Google Fonts CSS plus five stylesheets.
- Cause: cross-origin font CSS and six separate blocking requests. The rules themselves are needed.
- Files: new `website/assets/css/geist.css`, `website/assets/css/home-bundle.css`, `scripts/build-home-bundle.js`, `website/index.html`, `website/zh/index.html`, `website/es/index.html`, `website/fonts/geist-latin-v5.woff2`, `website/fonts/geist-latin-ext-v5.woff2`.
- Expected gain: remove the fonts.googleapis.com hop and collapse homepage CSS to one same-origin request.
- Risk: bundle drift if a source CSS file changes and the bundle is not regenerated. `node scripts/build-home-bundle.js --check` is on `npm test`.
- Rollback: restore the six `<link rel="stylesheet">` tags and the Google Fonts links.
- Test: three mobile and three desktop Lighthouse runs; EN/ZH/ES layout at 320–1440px.

Not done: marking every stylesheet `media=print` or `preload` without an inline or bundled copy. That flashes the header.

## P0. LCP image

- Evidence: desktop `unsized-images` and `lcp-discovery-insight` (`fetchpriority=high` false). Mobile discovery not applicable.
- Files: the three homepage `<img>` tags.
- Change: `width="540"` `height="500"` `loading="eager"` `fetchpriority="high"`. No preload.
- Risk: the hidden mobile image is hinted high. It is 2 KB. Retest kept mobile LCP on the text.
- Rollback: remove the four attributes.

## P1. Fonts

Covered by the P0 self-host. Weights 400–700 stay in the variable files. `font-display: swap` matches the previous Google CSS. Duplicate preconnects removed on the three homepages only.

## P1. Cookie reflow

No change. Evidence does not show a forced reflow. Consent, GA4 and AdSense behavior stay as they are.

## P1. Cache

- Evidence: `/assets/*` is one day. Many asset URLs have no content hash in the path.
- Change: only `/fonts/*` gets `public, max-age=31536000, immutable`, because those filenames include `v5` and the path is outside `/assets/*`.
- HTML stays `max-age=0, must-revalidate` (already true in production `_headers` via Pages and was not loosened).
- Risk: replacing a font file without renaming it would stick for a year. Rollback: delete the `/fonts/*` block.
- Not done: year-long immutable on all of `/assets/*`.

## P1. tools-catalog.js

No change. Already deferred, TBT is 0, search and counts need it, tool links are in the HTML.

## P2. Contrast

- `#667d92` to `#5a7086` in `home-fresh.css` (5.13:1 on white, 4.80:1 on `#f4f8fc`).
- Small orange numerals `#e8590c` to `#c2410c` (5.18:1 on white) on `.hf-card .num` and `.hf-count b` only.
- Nav hover, focus and current page from `#0b6ff2` to `#0a62d8` on `#edf5ff` (5.09:1). Primary buttons stay `#176ff2` / `#0b6ff2`.
- Rollback: restore the three colors.

## P2. llms.txt

Turn each existing URL into a Markdown link. Do not add or remove destinations. Check every path against a local `index.html` or file.

## P2. Security headers

Audit only, in GATE5. No CSP enforcement, no COOP, no Trusted Types, no HSTS preload, no change to the existing `includeSubDomains`.
