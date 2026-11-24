# GATE1 root cause

## CSS critical path

The five same-origin stylesheets are used. `design-tokens.css` supplies header variables. `site.css` supplies the reset, skip link and base body rules. `site-shell.css` is the header and footer. `locale-menu.css` is the language control. `home-fresh.css` is the homepage. None of them can be dropped.

They are not all required as separate blocking requests. On the mobile simulation they compete with the cross-origin Google Fonts CSS, which is the longest render-blocking hop (about 778 ms estimated waste). Async-loading every stylesheet would remove that cost and would also leave the header and hero unstyled until the files arrive. That is rejected.

`site.css` contains directory, policy and legacy hero rules the homepage does not paint, but those rules are in the same file other pages share. Splitting `site.css` would touch every template. Not justified for this homepage pass.

## LCP

Desktop: the hero SVG is the LCP node, discoverable in HTML, missing `fetchpriority=high` and explicit `width`/`height`. A preload would duplicate a request the parser already sees. Not added.

Mobile: the hero is `display:none` under 960px. LCP is the `h1` text. Applying the desktop image conclusion to mobile would prioritize a hidden 2 KB SVG ahead of CSS. Width and height are still set because they fix the desktop unsized-image audit and do not change the mobile layout. `fetchpriority=high` is set because the desktop audit failed on that hint; the image is 2 KB, so it does not displace the text LCP on mobile in the retest.

The SVG stays. It is 2,856 bytes, already the painted desktop LCP, and a raster replacement is a visual change without a lab failure that requires it.

## Fonts

Geist 400/500/600/700 are all used on the homepage. No weight was removed. The cost is the render-blocking CSS on `fonts.googleapis.com`, then a second hop to `fonts.gstatic.com`. The variable font files are about 29 KB (latin) and 16 KB (latin-ext). Self-hosting those two subsets removes the cross-origin CSS and the duplicate preconnect. CJK pages keep PingFang SC / Microsoft YaHei as the fallback already declared in `home-fresh.css`. Tool pages still load Geist, Geist Mono and Instrument Serif from Google Fonts. Those pages were not part of the measured homepage chain, and changing them would touch hundreds of templates.

## Cookie consent

Lighthouse forced-reflow on production and on the retest lists no source. The lines cited in the brief do not read layout in the current file. Editing focus or storage to chase a stale line number would risk the consent, GA4 and AdSense path. No change.

## tools-catalog.js

Transfer size is about 22 KiB. The script is already `defer`. It is not on the FCP chain. TBT is already 0 ms. The homepage search reads `window.NEL_TOOLS` on submit, and `site.js` fills `[data-tool-count]` and `[data-category-count]`. The tool links themselves are real `<a href>` elements, so crawlers do not depend on the catalog. Splitting it would still need the full catalog before the first search and would not move FCP. Not split.

## Contrast

Computed failures, not a brand-palette replacement:

- Tool descriptions `#667d92` on `#ffffff` = 4.27:1 (need 4.5). The same color on the page background `#f4f8fc` is 4.01:1.
- Count numerals `#e8590c` on white = 3.58:1 at 13.5px.
- Current nav item `#0b6ff2` on `#edf5ff` = 4.18:1 at 15px bold.

## llms.txt

HTTP 200, `text/plain`, has an H1, and lists real tools, topics and guides. Lighthouse only counts Markdown links of the form `[label](url)`. The file used bare URLs, so the audit reported no links. That is the entire agentic-browsing miss (2/3).

## Cache

A one-year immutable header on `/assets/*` would also cover unversioned URLs (`site.css`, `home-search.js`, `logo.svg`, many tool scripts). Query hashes are not part of the Cloudflare Pages `_headers` match. Those URLs cannot take `immutable` for a year. HTML is already `max-age=0, must-revalidate`.
