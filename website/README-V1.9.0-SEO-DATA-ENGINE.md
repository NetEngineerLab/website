# NetEngineerLab V1.9.0-01 SEO Data Engine

## Included files

- `data/seo-config.js`: site-wide SEO settings and locale definitions.
- `assets/js/seo-engine.js`: canonical, hreflang, Open Graph, Twitter Card and WebPage structured-data normalization.

Both scripts are loaded with `defer` on every indexable HTML page. Existing page titles,
descriptions and structured data remain authoritative; the engine fills missing
fields and normalizes URLs.

## Configuration

Edit `data/seo-config.js` to change the production origin, default descriptions,
social image or feature switches. Keep the production origin without a trailing slash.

## Page-level opt-out

Add `data-seo-disabled` to the page's `<html>` element to prevent the engine from running.

## Deployment

Replace the deployed website contents with the `website` directory. Cloudflare
Pages does not require a build command for this static package.

## Validation completed

- JavaScript syntax checks
- HTML script-reference audit
- ZIP integrity check
- Existing project files retained
