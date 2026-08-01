# NetEngineerLab V1.9.0-04

## Scope

- Correct the English and Chinese homepage tool count from 13 to 14.
- Keep `llms.txt`, the homepage cards, and the actual tool directory consistent.
- Load three non-critical homepage stylesheets without blocking first paint.
- Preserve stylesheet loading for browsers with JavaScript disabled.
- Leave calculators, structured data, Sitemap, Robots, and page design unchanged.

## Verification baseline

- 14 tool directories, excluding the `/tools/zh/` language directory.
- 28 tool pages: 14 English and 14 Chinese.
- 40 URLs remain in `sitemap.xml`.
- 14 entries remain in `llms.txt`.
- No local JavaScript synchronous layout-read API was found; no speculative reflow rewrite was made.
