# GATE4 accessibility and agent discoverability

## Accessibility

Production Lighthouse accessibility was 96 on mobile and desktop. Failures were contrast only. Links, buttons, labels and touch-target size already passed. The cookie dialog already has `role="dialog"`, a label, a description and a Tab cycle.

Changes are limited to the failing pairs:

| Surface | Before | After | Ratio on its background |
|---|---|---|---|
| Tool description, kicker, counts | `#667d92` | `#5a7086` | 5.13:1 on white, 4.80:1 on `#f4f8fc` |
| Small orange numerals | `#e8590c` | `#c2410c` | 5.18:1 on white |
| Nav current / hover / focus | `#0b6ff2` on `#edf5ff` | `#0a62d8` on `#edf5ff` | 5.09:1 |

Primary buttons stay `#176ff2`. After three mobile and three desktop runs on the local bundle, accessibility is 100 and `color-contrast` score is 1.

Keyboard and touch, checked in Chrome at 390px: the menu button toggles `aria-expanded` to `true`, the search field is labeled, Decline writes `nel_cookie_consent_v1=false` and removes the dialog. Tab order was not reordered.

## llms.txt

Production file returned HTTP 200 and had an H1, but Lighthouse 13.6 `llms-txt` failed because it requires at least one `[text](url)` link. The rewrite keeps the same 57 calculator URLs, 5 supplementary pages, hubs, topics and guides, and expresses them as Markdown links. A local existence check found no missing target.

Retest: `llms-txt` score 1. Agentic browsing is 100, which is 3/3 of the weighted audits (accessibility tree, CLS, llms.txt). WebMCP and ARD stay not applicable. Agentic browsing is not a Google Search ranking metric.

## Screens

After screenshots: `screens/after-mobile-390.png`, `screens/after-desktop-1280.png`, `screens/after-zh-390.png`, `screens/after-es-390.png`. Chinese copy renders with the system CJK fallback. Spanish preloads the latin-ext subset. No horizontal scrollbar at 320, 375, 390, 430, 1280 or 1440 on EN, ZH or ES.
