# NetEngineerLab Web UI Design System & Page Standard V1.1

**Version:** V1.1  
**Date:** 2026-09-12  
**Status:** FROZEN BASELINE / Source-clean enforcement / Mandatory for all new and refactored public pages  
**Applies to:** Home, Tools Center, Tool Detail, About, Contact, Privacy, Terms, localized pages and future workflow/result pages

---

## 1. Why this document exists

NetEngineerLab already has design tokens, shared shell CSS and multiple page-specific UI fixes, but historically the rules were distributed across CSS files and individual changelogs. That allowed visually valid pages to drift in width, navigation, card geometry, mobile behavior and footer/header treatment.

This document is the single UI/UX baseline for future work. A new page is not accepted merely because it renders or its calculator works. It must also conform to this page standard.

**Mandatory rule:** before creating or materially refactoring a public page, read this document together with:

- `website/assets/css/design-tokens.css`
- `website/assets/css/site-shell.css`
- `website/assets/css/tool-design-system.css`
- `website/assets/css/tool-layout.css`
- `website/templates/header-*.html`
- `website/templates/footer-*.html`

Do not introduce a second shell, second content width, second header pattern or second footer pattern unless this document is deliberately versioned first.

---

## 2. Product UI principles

NetEngineerLab pages must feel like one engineering platform, not a collection of unrelated calculators.

The frozen principles are:

1. **Engineering clarity before decoration.** Inputs, assumptions, results, limits and warnings must be easier to understand than the visual effects around them.
2. **One horizontal alignment system.** Header content, breadcrumb, Hero, workspace, methodology and footer align to the same page grid.
3. **Task-first.** A user entering a tool page should quickly understand what the tool calculates, what to enter, what result matters and what to do next.
4. **Evidence and limits are visible.** Engineering limits, N-1 states, assumptions and failure states cannot be hidden in tiny footnotes.
5. **Desktop depth + mobile usability.** Desktop may use two-column engineering workspaces; mobile must become a deliberate single-column flow rather than a squeezed desktop page.
6. **Shared shell is mandatory.** Header, navigation, language switcher, return path and footer are platform components, not per-tool creative choices.
7. **Localization is structural.** EN/ZH/ES pages use the same hierarchy and interaction model; localization must not create different layout systems.
8. **Accessibility is part of UI acceptance.** Keyboard focus, labels, readable contrast, semantic headings and status announcements are required.

---

## 3. Canonical page grid

### 3.1 Desktop content width

The canonical public-page content width is:

```css
--nel-content-max: 1400px;
--nel-gutter: 24px;
```

All primary page regions must share this horizontal reference:

- header inner content
- breadcrumb / return navigation
- Hero
- calculator/workspace
- methodology/content sections
- related-tools section
- footer inner content

**Forbidden:** a Hero at 1340px, calculator at 1380px and methodology at 1400px on the same page.

The old `1380px` layout variable may remain internally for legacy compatibility, but new/refactored pages should resolve visually to the canonical 1400px design-system line. When legacy CSS conflicts, the shared design-system shell wins.

### 3.2 Gutters

Recommended horizontal gutters:

- Desktop >= 1440px: 24px minimum outside the 1400px content area
- Laptop 1101–1439px: 20–24px
- Tablet 769–1100px: 20px
- Mobile <= 768px: 16px
- Narrow mobile <= 420px: 14px where necessary

No page should touch the viewport edge.

### 3.3 Vertical rhythm

Use the shared spacing scale as the default:

- 8px micro spacing
- 16px component spacing
- 24px card/content spacing
- 32px section spacing
- 48–64px major section separation

Avoid arbitrary 13px/37px/73px spacing unless a measured UI reason exists.

---


## 3.4 V1.1 source ownership rule

V1.1 upgrades the design system from a final-render override model to a **source-clean model**. Tool-local CSS must not carry obsolete copies of platform shell geometry.

Mandatory rules:

- Header, main navigation, language switcher and Footer styling belong to `site-shell.css` only. Tool CSS must not redefine `.site-header`, `.nav`, `.brand`, `.language`, `.top-nav`, `.site-footer`, `footer` or `.footer-links`.
- Primary page geometry (`breadcrumbs`, Hero inner wrapper, main shell/workspace, content/methodology sections and tool wrappers) must derive from `--nel-content-max`; numeric legacy page widths such as 1180/1200/1240/1360/1380/1720/1740/1780/1900px are not accepted as page-shell widths.
- Internal readable-width constraints are allowed when semantically justified. Use character/rem units or a named token rather than reusing old page-shell pixel values.
- Base Input/Result cards use `--nel-color-surface`, `--nel-color-border`, `--nel-radius-card` and `--nel-shadow-card` when those properties are declared locally.
- Responsive platform shell behavior belongs to shared CSS. Tool CSS may add engineering-component breakpoints, but must not implement a second mobile Header/Nav/Footer system.
- `npm run audit:ui` is a source-level gate: a page that only appears correct because the final compliance stylesheet overrides stale local CSS is no longer accepted.

## 4. Global Header standard

### 4.1 Header source of truth

Use the shared locale templates:

- `website/templates/header-en.html`
- `website/templates/header-zh.html`
- `website/templates/header-es.html`

Do not hand-code a different header inside a tool page.

### 4.2 Header content order

Desktop order is fixed:

1. NetEngineerLab brand/logo
2. Home
3. Tools Center
4. About
5. Contact
6. Language switcher
7. Context action / primary CTA (for example Start Calculating)

The current page must expose the active navigation state.

### 4.3 Header dimensions

- Desktop minimum height: about 82–84px
- Logo visual size: approximately 42–54px depending on shell generation
- Navigation target height: >= 42px
- Primary/header action target height: >= 44px
- Header content aligns to the canonical page grid

### 4.4 Mobile header

At mobile/tablet breakpoints the header must not simply wrap uncontrolled.

Required behavior:

- brand remains visible
- menu toggle is keyboard accessible
- `aria-expanded` reflects state
- main navigation is reachable without horizontal page overflow
- language switcher remains reachable
- no navigation item becomes smaller than a practical touch target

The mobile navigation may collapse into a menu or use a controlled second row; it must not overlap the Hero.

---

## 5. Tool return navigation / Breadcrumb standard

Every public **Tool Detail** page must provide an obvious return path before the Hero or at the top of the tool content.

Minimum structure:

```text
← Back to Tools / 返回工具中心 / Volver a herramientas
[optional category] > [current tool]
```

Rules:

- must be visible, not only encoded in browser history
- must be keyboard accessible
- must align to the same 1400px grid
- must be localized
- must not rely on JavaScript to exist
- current tool name may be plain text; ancestor destinations are links

A tool page without a visible return/breadcrumb path fails UI acceptance.

---

## 6. Hero standard

### 6.1 Purpose

The Hero answers four questions within one screen:

1. What is this tool?
2. What engineering problem does it solve?
3. What are its primary capabilities/constraints?
4. Where does the user start?

### 6.2 Geometry

- same 1400px horizontal grid as the workspace below
- recommended radius: 22–26px
- desktop padding: 34–56px
- mobile padding: 24–28px
- avoid excessive Hero height; calculators should remain discoverable above or near the fold

### 6.3 Typography

Tool title:

```css
font-size: clamp(36px, 4.2vw, 62px); /* desktop system upper range */
line-height: ~1.1–1.2;
```

For very long Chinese/Spanish titles, reduce through responsive `clamp()` rather than allowing overflow.

Hero description should usually stay <= 2–3 lines on desktop.

### 6.4 Capability badges

Use 2–5 badges only when they communicate real engineering capabilities such as:

- N-1 protection
- capacity planning
- path diversity
- vendor rendering
- rollback / MOP

Do not add decorative tags that repeat the title.

---

## 7. Main tool workspace

### 7.1 Desktop

For standard calculators, desktop >= 1100px uses a deliberate two-column workspace:

```text
[ Input / Configuration ]   [ Result / Analysis ]
```

Recommended ratio:

```css
grid-template-columns: minmax(0, 1.05fr) minmax(420px, .95fr);
```

or an evidence-backed variant close to it.

Rules:

- both columns start on the same top baseline
- gap is normally 20–24px
- cards stretch cleanly; no exposed background block caused by accidental unequal shell height
- result panel may be sticky when long input flows justify it
- sticky behavior must be disabled on tablet/mobile

### 7.2 Tablet

At roughly 769–1100px:

- prefer one column unless the form/result structure remains comfortably readable
- do not force narrow two-column fields
- horizontal tables need deliberate handling (responsive table, cards or controlled overflow)

### 7.3 Mobile

At <= 768px:

```text
Return navigation
Hero
Input
Primary action
Result
Warnings / recommendations
Methodology
Related tools
Footer
```

Required:

- single-column reading flow
- no horizontal page scrolling at 320px
- after a calculation, optionally scroll/focus the result region when that materially helps the user
- result is not hidden behind tabs unless the tool truly needs tabs

---

## 8. Card system

### 8.1 Base card

Default engineering card:

```css
background: #fff;
border: 1px solid var(--nel-color-border);
border-radius: 18px; /* 18–22px acceptable within system */
box-shadow: 0 18px 48px rgba(8,47,89,.08-.10);
```

Use a consistent radius inside one page.

### 8.2 Card hierarchy

Use visual hierarchy, not random colors:

- Level 1: Input / Result main cards
- Level 2: grouped field sections / protection checks / warnings
- Level 3: metric tiles / compact status blocks

Nested cards should have lighter shadows or no shadow to avoid a “cards inside cards inside cards” effect.

### 8.3 Card headings

Every major card needs a clear heading. For a standard calculator:

- Input & assumptions
- Result / engineering assessment
- Methodology / engineering boundaries

The exact copy is localized, but hierarchy stays consistent.

---

## 9. Form and input standard

### 9.1 Labels

- every input has a visible label
- use `for` + matching `id`
- unit belongs in label or a dedicated unit affordance
- placeholders do not replace labels

### 9.2 Field dimensions

- interactive height >= 44px desktop/mobile
- comfortable input padding
- border and focus state must be visible
- numeric inputs must communicate engineering units

### 9.3 Field layout

Desktop may use 2-column field grids. A field with long labels, descriptions or selectors may span both columns.

Mobile fields are one column unless two tiny, strongly coupled values remain readable.

### 9.4 Help text

Help text should explain the engineering meaning, not restate the field name.

Bad:

> UPS capacity: Enter UPS capacity.

Better:

> Available UPS output that can continuously support the critical load during generator start and transfer.

---

## 10. Buttons and actions

### 10.1 Primary action

Each tool should have one visually dominant calculation/planning action.

- minimum height: 44–46px
- blue primary treatment
- clear verb: Calculate, Build Plan, Analyze, Validate

### 10.2 Secondary actions

Examples:

- Copy result
- Print / PDF
- Reset
- Load sample

Use outlined or low-emphasis styling. Do not give five buttons equal visual priority.

### 10.3 Focus/keyboard

All actions need visible `:focus-visible` treatment.

---

## 11. Result standard

Results should be readable in this order:

1. **Overall state** — pass/warn/fail or primary engineering conclusion
2. **Primary metrics** — capacity, utilization, runtime, loss, risk, etc.
3. **Constraint checks** — N-1, threshold, headroom, protection, compatibility
4. **Recommendations / next actions**
5. **Detailed calculation or evidence**

Do not force users to read a table before knowing whether the design passes.

Status colors are semantic, not decorative. Text labels must accompany color.

---

## 12. Tables, charts and engineering data

### Tables

- header contrast must be clear
- numeric values align consistently
- units are not ambiguous
- mobile must not destroy readability; use controlled overflow or responsive transformation
- failure states should remain visible without relying only on red

### Charts

- charts supplement, not replace, explicit numeric results
- axis labels and units required
- avoid unnecessary 3D or decorative effects
- responsive container required

---

## 13. Methodology & engineering boundaries

Every deep engineering tool should have a section after the calculator explaining:

- core formula/model
- assumptions
- what the tool does not model
- standards/references where applicable
- engineering boundary conditions
- interpretation of results

This section must align to the same canonical page grid as the calculator. It must not suddenly become wider or narrower.

Recommended desktop pattern: one or two cards per row depending on text density.

---

## 14. Related tools / workflow continuation

Where relevant, end the content with 2–4 genuinely related tools or a next workflow action.

Avoid generic “all tools” dumps.

Links must preserve locale when the destination locale exists; otherwise use the platform’s declared locale fallback behavior.

---

## 15. Footer standard

### 15.1 Source of truth

Use:

- `website/templates/footer-en.html`
- `website/templates/footer-zh.html`
- `website/templates/footer-es.html`

### 15.2 Required footer content

- NetEngineerLab brand/name
- one-line platform description
- About
- Contact
- Privacy
- Terms
- copyright

### 15.3 Geometry

Footer inner content aligns to the same 1400px grid as Header/Hero/workspace.

Footer is not an afterthought: it must be localized, readable on mobile and must not create horizontal overflow.

---

## 16. Responsive breakpoints

Use these as the default page-design contract unless a component has a documented reason to differ:

```text
>= 1440px    Large desktop
1101–1439px  Desktop / laptop
769–1100px   Tablet / small laptop
421–768px    Mobile
320–420px    Narrow mobile
```

### Mandatory viewport acceptance

Every new/refactored page should be checked at minimum at:

- 1440 × 900
- 1280 × 800
- 1024 × 768
- 768 × 1024
- 390 × 844
- 360 × 800
- 320 × 568

No horizontal body overflow is allowed.

---

## 17. Typography

Primary family is the shared system stack from `design-tokens.css`.

Rules:

- one H1 per public page
- heading hierarchy must not skip levels merely for styling
- body text generally 15–18px depending on context
- line height around 1.6–1.8 for explanatory engineering content
- avoid extremely light gray body text
- code/formulas may use monospace but need sufficient contrast and wrapping

---

## 18. Color and status semantics

Shared palette comes from `design-tokens.css`.

Primary roles:

- blue: product/action/navigation emphasis
- dark blue: engineering headings / strong content
- muted blue-gray: secondary explanatory text
- white: primary surface
- pale blue/gray: page background / secondary surfaces
- green: success/pass
- amber: warning/headroom concern
- red: fail/critical constraint

Never use status color alone; include an icon/label/text state.

---

## 19. Accessibility requirements

A page fails UI acceptance if core operation is inaccessible by keyboard.

Minimum requirements:

- skip link where shared shell supports it
- semantic `header`, `nav`, `main`, `section`, `footer`
- visible focus
- labels for controls
- `aria-live` for dynamic result/status where appropriate
- buttons use `<button>` rather than clickable `<div>`
- meaningful image alt text; decorative images use empty alt
- sufficient contrast
- menu toggle exposes expanded state
- headings in logical order

---

## 20. Localization UI contract

EN, ZH and ES must share:

- same page hierarchy
- same component order
- same core interaction
- same engineering fields and IDs unless architecture explicitly changes
- same Header/Footer design system

Localization may change text length, so layouts must tolerate longer Spanish strings and dense Chinese titles without overflow.

Language selector labels must be understandable in the current locale.

Do not create an `/es/` page that still contains visible translatable English UI except accepted technical acronyms/standards.

---

## 21. SEO/GEO page structure requirements that affect UI

The visible UI and metadata must describe the same task.

Required for indexable tool pages:

- unique H1
- localized title and meta description
- canonical
- valid hreflang for actually available locales only
- breadcrumb structured data when applicable
- FAQ structured data only when FAQ is visibly present and content matches
- tool methodology/answer content must be genuinely useful, not SEO filler

Do not let SEO copy push the calculator far below the fold.

---

## 22. Loading, empty, error and failure states

Every interactive engineering page should deliberately design these states when applicable:

- initial / empty
- valid result
- warning
- hard engineering fail
- invalid input
- missing data
- runtime error

Error text must explain how to recover. Do not show raw exceptions to users.

---

## 23. Performance / CLS requirements

UI design must not create avoidable layout shift.

Required:

- reserve space for result regions that appear after calculation where practical
- images declare dimensions/aspect ratio
- avoid injecting large banners above active content after load
- header height should remain stable
- fonts/fallbacks should not materially move the layout

The existing production performance gates remain authoritative.

---

## 24. Standard Tool Detail page anatomy

All new standard calculator/planner pages should begin from this anatomy:

```text
Shared Header
└─ Global navigation + language + CTA

Return/Breadcrumb navigation

Hero
├─ Eyebrow/category
├─ H1
├─ 1–2 sentence engineering description
└─ 2–5 capability badges (optional)

Main Engineering Workspace
├─ Input / Configuration card
│  ├─ grouped assumptions
│  ├─ fields
│  └─ primary action
└─ Result / Analysis card
   ├─ overall state
   ├─ primary metrics
   ├─ checks / utilization / evidence
   └─ recommendations / copy / print

Methodology & Engineering Boundaries
├─ Formula/model
├─ assumptions and limits
└─ standards/references

Related Tools / Next workflow

Shared Footer
```

If a tool needs a different anatomy, its development spec must explain why.

---

## 25. UI anti-patterns — prohibited

Do not ship:

- multiple unrelated content widths on one page
- Hero narrower/wider than the calculator without deliberate documented design
- a tool page with no return path
- custom per-tool global header/footer
- desktop two-column squeezed unchanged onto mobile
- horizontal body scrolling at 320px
- hidden units
- placeholder-only labels
- five equal “primary” buttons
- color-only success/failure communication
- giant SEO prose blocks before the tool
- decorative cards with no information hierarchy
- result panels that begin lower than input cards due to accidental margins
- JS-only navigation required to leave a tool page
- duplicated CSS rules that fight the shared shell

---

## 26. Development implementation order

For every new tool/page:

1. Read this UI standard.
2. Reuse shared Header/Footer templates.
3. Use design tokens and shared shell CSS first.
4. Establish the 1400px alignment grid.
5. Add return/breadcrumb navigation for tools.
6. Build Hero using shared hierarchy.
7. Build desktop workspace and deliberate mobile flow.
8. Add result states.
9. Add methodology/boundaries.
10. Add locale-safe navigation/metadata.
11. Run functional calculator tests.
12. Run UI/mobile/browser acceptance.
13. Only then add page-specific CSS for differences the shared system cannot express.

**Rule:** page-specific CSS extends the design system; it must not replace it.

---

## 27. Pull Request / release UI acceptance checklist

A new/refactored public page is not ready until all applicable items pass.

### Shell
- [ ] shared Header template/design used
- [ ] shared Footer template/design used
- [ ] global nav complete and active state correct
- [ ] language selector works for declared locales
- [ ] Tool Detail has visible return/breadcrumb navigation

### Alignment
- [ ] Header, breadcrumb, Hero, workspace, methodology and footer share the page grid
- [ ] no unexplained 1180/1280/1380/1400 width mixing
- [ ] input and result cards begin on the same baseline

### Desktop
- [ ] workspace uses intended one/two-column layout
- [ ] long labels do not collide
- [ ] tables/charts fit the content region
- [ ] result state is visually obvious

### Mobile
- [ ] checked at 390, 360 and 320px widths
- [ ] no horizontal body overflow
- [ ] navigation usable by touch and keyboard
- [ ] fields and actions >= practical touch size
- [ ] calculation result appears in a logical place after action

### Cards/forms
- [ ] card radius/shadow/border follow design system
- [ ] every field has visible label and unit
- [ ] focus states visible
- [ ] primary vs secondary actions are visually distinct

### Content
- [ ] H1 and Hero copy explain the actual engineering task
- [ ] methodology and boundaries included where appropriate
- [ ] warnings/limits are not buried
- [ ] related tools are relevant, not filler

### Accessibility
- [ ] semantic main landmarks
- [ ] keyboard operation works
- [ ] dynamic status uses appropriate announcement semantics
- [ ] contrast acceptable

### SEO/localization
- [ ] canonical correct
- [ ] hreflang only for real available locale pages
- [ ] localized metadata matches visible content
- [ ] no unintended language leakage
- [ ] visible FAQ matches FAQ schema if schema is emitted

### Regression
- [ ] calculation engine unchanged or separately tested
- [ ] page-specific CSS does not break shared shell
- [ ] `npm run audit:ui` passes
- [ ] browser/mobile acceptance completed

---

## 28. Reference implementation priority

When visual behavior is ambiguous, use the most recently accepted deep-tool pages and shared design-system assets as reference, not an old legacy calculator.

Current preferred references include:

- OLT Dual-Uplink Transport MSE Planner V1.2
- Data Center Network Convergence & Fabric Capacity Planner alignment-corrected layout
- Generator + UPS Transfer & Ride-Through Planner alignment/navigation-corrected layout
- Network Change Planner & MOP Generator for complex workflow hierarchy

A reference page is not permission to copy its tool-specific colors/content; copy the shared structure and interaction principles.

---

## 29. Governance and versioning

This document is a frozen baseline.

Changes that affect global page appearance or information architecture require:

1. version bump of this document
2. reason/change log
3. update to shared templates/tokens/CSS as needed
4. representative desktop and mobile regression
5. no weakening of existing functional/SEO/accessibility gates

Do not silently change global max width, Header anatomy, Footer anatomy or Tool Detail navigation contract in an individual tool release.

The automated structural gate is `npm run audit:ui`; `prepare:launch` includes this gate and must not bypass it.

---

## 30. Final standard

The target is simple:

> A user should be able to move between any NetEngineerLab tool and immediately recognize the same platform, the same navigation model, the same engineering hierarchy and the same mobile interaction quality.

**One platform. One shell. One grid. One component language. Tool-specific engineering depth inside a consistent UI.**
