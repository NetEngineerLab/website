# NetEngineerLab Design System

## Direction

Professional engineering SaaS: calm surfaces, clear technical hierarchy, restrained blue, compact data presentation, and direct navigation. Use white and pale neutral backgrounds, deep blue-gray text, one primary blue, thin borders, and whitespace. Avoid broad gradients, neon, ornamental animation, nested cards, and shadows on every section.

## Layout

| Token | Value | Use |
|---|---:|---|
| `--nel-content-max` | `1400px` | Shared header, footer, and broad page frame |
| `--nel-reading-max` | `760px` | Article text measure |
| `--nel-page-gutter` | `24px` | Desktop/tablet page inset |
| `--nel-page-gutter-mobile` | `14px` | Mobile page inset |
| `--nel-sidebar-width` | `240px` | Optional article contents rail |
| `--nel-grid-gap` | `24px` | Standard card/input grid gap |

Article pages may use a two-column composition of a 760px reading column and a 240px contents rail, with the full article frame capped at 1120px. Shared header and footer inner containers must use the same content-width token and gutters.

## Spacing and type

Use an 8px base spacing scale: 4, 8, 12, 16, 24, 32, 48, and 64px. Body copy is 16px with line-height 1.6–1.7. Secondary labels are 12–14px. H1 is 40–48px on desktop and 30–34px on mobile; H2 is 28–32px desktop and 22–26px mobile; H3 is 20–24px. Article line length stays near 65–80 characters. Use one font stack from `--nel-font-family`.

## Color, border, and shape

Use the `--nel-color-*` family in `design-tokens.css` as the source of truth: primary `#0B6FF2`, ink `#082F59`, muted `#5D7691`, page `#F5F9FE`, surface `#FFFFFF`, border `#D7E3EF`, footer `#09244D`. Components use 1px borders. Controls use 8–10px radii, standard cards 12–14px, major feature panels 16px, and badges 999px. Prefer no shadow; use one subtle elevation only for sticky navigation or a modal.

## Responsive rules

Use a single shared mobile-navigation breakpoint at 800px. Use 1024px for multi-column content compression, 800px for single-column tool/article layouts, and 680px for tight card and control spacing. Verify at 320, 375, 390, 768, and 1440px. No horizontal page overflow is allowed; dense tables may scroll within their own wrapper.

## Component contracts

- **Header/navigation:** shared `site-shell` templates/CSS; logo, Home, Tools, Guides, Topics, language control, and mobile menu. Links must return to real route/section destinations; active location uses `aria-current`.
- **Footer:** full-width background with inner content matching the header inner width and gutters.
- **Breadcrumb:** Home → current directory/section → current page. Every ancestor is a link.
- **Tool/topic/guide cards:** one surface, one border, consistent padding, title/description/status, one action. No card-in-card nesting.
- **Button:** primary blue action, 44px minimum height (48px on mobile), visible keyboard focus, full-width primary action on mobile forms.
- **Input/select/tabs:** consistent 44px minimum control height, visible label and unit/help text, keyboard-operable selected state.
- **Result:** one primary result summary followed by secondary metrics, interpretation, warnings, and method. Preserve all existing calculations and behavior.
- **Formula/callout:** neutral surface and border, readable monospace for expressions; warning/error colors communicate state without relying on color alone.
- **Empty/loading/error:** shared spacing and border treatment, concise explanation, `role="status"` or `role="alert"`, and a recovery action where available. Loading must announce progress without moving the page unexpectedly.

## Scope boundary

This system governs presentation and navigation only. Do not change calculation engines, formulas, business data, APIs, canonical URLs, structured data, or existing calculator behavior as part of visual migration.
