# NetEngineerLab Design System V1.0 (Fieldbook tool baseline)

| Field | Value |
|---|---|
| Task | NEL-UI-UNIFICATION-V1.0 · Phase 0 |
| Baseline date | 2026-10-27 |
| Visual reference | https://netengineerlab.com/design/fieldbook/tool-optical-power-budget-v3 |
| Status | **Active baseline for tool-page upgrades and new tools** |
| Relationship | Extends `docs/DESIGN_SYSTEM.md` (platform tokens). Supersedes V1.3 **tool-detail visual language** (deep-blue hero / heavy card chrome) for calculator & diagnostic tools. Platform Header/Footer/Breadcrumb still follow shared site-shell; reconcile V1.3 audit gates before deleting them. |

## 1. Purpose

Extract a **reusable** Fieldbook look-and-feel from Optical Power Budget V3.  
**Do not** copy OPB-specific formulas, GPON presets, or OPB FAQ text into unrelated tools.

## 2. Design tokens (promote to shared CSS)

Source today: `website/design/fieldbook/fb-v3.css` (`:root` / `body.v3`).  
Target shared file (Phase 2+): e.g. `website/assets/css/fieldbook-tokens.css` — **one** token sheet, many tools.

| Token | Value | Use |
|---|---|---|
| `--v3-paper` | `#F6F4EF` | Page background (warm paper) |
| `--v3-ink` | `#0F172A` | Primary text |
| `--v3-ink-2` | `#334155` | Secondary text |
| `--v3-muted` | `#64748B` | Hints / meta |
| `--v3-border` | `rgba(15,23,42,.10)` | Soft separators |
| `--v3-border-soft` | `#D8DEE8` | Card / control borders |
| `--v3-accent` | `#E8590C` | Primary CTA / active chips |
| `--v3-accent-ink` | `#B8440A` | Accent text on soft fill |
| `--v3-accent-soft` | `#FFF1E6` | Selected preset fill |
| `--v3-blue` | `#3B82F6` | Focus ring / formula rail |
| `--v3-cyan` | `#0891B2` | Accent gradient mid |
| `--v3-panel-bg` | `#EEF2FF` | Light indigo readout wash |
| `--v3-panel-bg-2` | `#F8FAFC` | Neutral assist |
| `--v3-assist` | `#F1F5F9` | Field-group background |
| `--v3-readout` | `#0F172A` | Result numbers |
| `--v3-readout-mute` | `#64748B` | Result labels |

### Surfaces & shape

- Page: warm paper + very light blue/orange radial washes (opacity ≤ 5%).
- Cards / panels: **white**, 16px radius, 1px `--v3-border-soft`, shadow `0 1px 0 rgba(15,23,42,.03)` only.
- Optional 2px top gradient bar on primary workbench panels (blue → cyan → accent, ~70% opacity).
- Field groups: `--v3-assist` fill, 12px radius — **not** nested cards.
- Preset chips: pill (`border-radius: 999px`); selected = accent border + soft fill.
- Primary button: orange gradient, white text; ghost = white + soft border.
- Inputs: white; focus = blue border + `0 0 0 3px rgba(59,130,246,.16)`.

### Hierarchy (prefer spacing over nested chrome)

1. **L1** — Status + tightest margin / primary KPI.  
2. **L2** — Key results (Rx, physical / design loss, etc.).  
3. **L3** — Assist tables, breakdowns, secondary checks.

Avoid card-in-card and heavy shadows.

## 3. Typography & spacing

- Align with platform 8px scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
- Body ~14.5–16px; mono for numeric fields and formulas.
- H1 tool title clear and short; one-line purpose under H1.
- Fold headers: **one language**, no stacked bilingual titles (e.g. not `ABOUT` + `About & applicability`).
- Fold block vertical gap on mobile: **12px** between peer `<details>` / sections (not 56px prose leftovers).

## 4. Layout shell

- Desktop (≥961px): optional sticky **On this page** TOC (left), main column (center). TOC scroll-spy highlights current section.
- ≤960px: **single column**; hide side TOC (no dual-column squeeze).
- Workbench: parameters | results, **top-aligned** (not stretch-equal height with empty left void).
- Mobile: **parameters + results always expanded**; About / methods / examples / full workflow **collapsed by default** via native `<details>` (content still in HTML for SEO/GEO).
- Viewports to verify: **320 / 375 / 768 / 1440** (also 390). No horizontal page overflow.

## 5. Shared components to extract (Phase 2 pilots)

| Component | Responsibility |
|---|---|
| `fb-shell` | Paper bg, header/footer hook, preview banner (design only) |
| `fb-toc` | On this page + scroll spy |
| `fb-workbench` | Input + result grid, top-align |
| `fb-presets` | Scenario chips |
| `fb-field-group` | Labeled assist group |
| `fb-result-stack` | L1/L2/L3 result hierarchy + status |
| `fb-fold` | `<details>` sections (methods, FAQ, standards, review) |
| `fb-workflow` | Step n/m, progress, Prev/Next, related tools |
| `fb-actions` | Calculate / Reset / Save / Share / CSV / Print |
| `fb-records` | Recent calculations (localStorage) |

**Rule:** tools consume shared CSS/JS; tool-local CSS only for domain-specific widgets.

## 6. Interaction & a11y

- Keyboard: all controls operable; visible focus.
- Illegal inputs: validate **before** truncating integers; show Invalid; **disable** export/share when invalid.
- Touch targets ≥ 44px where practical.
- `aria-invalid` / `role="alert"` for errors (target; OPB preview may still be catching up).
- Dark mode: only if site-shell already supports it — do not invent a parallel theme in Phase 0–1.

## 7. Out of scope for this document

- Changing calculation engines or domain formulas.
- Copying OPB GPON/ODN content into other tools.
- Auto-deploying production tools.
- Rewriting all tools at once (see Phase 2–3 batching).

## 8. Source of truth

1. Live reference UI: Fieldbook OPB v3 preview URL above.  
2. Tokens implementation: `website/design/fieldbook/fb-v3.css` until promoted.  
3. Migration process: `MIGRATION-CHECKLIST-V1.0.md`.  
4. SEO/GEO gates: `SEO-GEO-GATE-V1.0.md`.  
5. Page IA: `TOOL-PAGE-STANDARD-V1.0.md`.
