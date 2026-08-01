# NetEngineerLab V1.9.0-03 Sitemap, Robots & GEO Optimization

## Changes

- Rebuilt `sitemap.xml` from the site's index pages.
- Kept all 40 production URLs and verified all 20 English/Chinese route pairs.
- Added `en`, `zh-CN`, and `x-default` alternate links to every sitemap URL.
- Removed `changefreq` and `priority`; search engines do not require them.
- Did not add artificial `lastmod` dates. Add `lastmod` only when it reflects a real content change.
- Updated `robots.txt` to avoid crawling 404, offline, and integration-support pages.
- Added `scripts/generate-sitemap.js` for repeatable sitemap generation after future page additions.
- Added explicit public-content access for OAI-SearchBot, ChatGPT-User, GPTBot, and Google-Extended.
- Added `llms.txt` as a concise bilingual, machine-readable directory of the site and all 14 tools.
- Kept non-production pages and integration-support paths out of crawler access.

## Validation

Run from the `website` directory:

```bat
node scripts\generate-sitemap.js
```

The command fails if an English or Chinese route is missing its matching translation.

## Post-deployment checks

1. Open `/sitemap.xml` and `/robots.txt` and confirm HTTP 200.
2. Open `/llms.txt` and confirm HTTP 200 with `text/plain` content.
3. Submit `https://netengineerlab.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
4. Inspect the homepage and selected tool URLs in Search Console.
5. The permanent 301 redirect from `www.netengineerlab.com` to `netengineerlab.com` must remain active.

## GEO policy

This release favors maximum public discoverability and citation. Search, user-requested fetch, and model crawlers may access public pages. If training access should be disabled later, change the `GPTBot` group to `Disallow: /`; OAI-SearchBot can remain allowed for ChatGPT search visibility.
