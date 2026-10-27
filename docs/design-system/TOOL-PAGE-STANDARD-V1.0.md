# Tool Page Standard V1.0

| Field | Value |
|---|---|
| Task | NEL-UI-UNIFICATION-V1.0 · Phase 0 |
| Baseline | Fieldbook Optical Power Budget V3 (structure & UX only) |
| Status | Active for upgrades + new tools |

## 1. Principle

**Old content & capabilities must not be lost; Fieldbook supplies layout and visual upgrade.**  
Module count/order may adapt by tool class. Do **not** force calculator chrome onto guides, topics, or hubs.

## 2. Default IA for calculation tools

Recommended order (adjust only with justification):

1. Breadcrumb (Home → Tools → Tool)  
2. H1 + one-sentence purpose  
3. Core workbench (presets + parameters + primary actions)  
4. Results & engineering diagnosis (L1/L2/L3)  
5. Methods & formulas (`<details>` on mobile; open on desktop OK)  
6. Worked example / component check  
7. Applicability & limits (About — **after** workbench; short lead under H1 only)  
8. FAQ (default collapsed on mobile)  
9. Official references / standards  
10. Content review & update log (user-facing; no internal “preview/audit” narrative)  
11. Related tools, guides, topics + toolkit hubs when applicable  
12. Engineering workflow (step n/m, progress, Prev/Next, secondary workflow attribution)

Optional: Project name, Recent calculations, Max-distance / alternate modes — **keep if old page had them**.

## 3. By tool class

| Class | Keep | Do not force |
|---|---|---|
| Simple calc | Short form, clear result, method + FAQ | Heavy multi-scenario chrome |
| Complex engineering calc | Presets, multi-group inputs, diagnosis, examples, standards | Deleting modes to “simplify UI” |
| Diagnostic / analysis | Diagnostic flow, warnings, interpretation | Fake calculator presets |
| Planner / workflow | Steps, exports, MOP-style structure | OPB loss tables |
| Suite / hub | Card index + links | Full workbench template |

## 4. Mobile content strategy

- **Always visible:** scenarios/presets (if any), required params, calculate/reset, results, validation errors.  
- **Collapsed by default (≤768):** About/applicability body, methods, examples, standards, full workflow details, FAQ items.  
- Prefer native `<details>`/`<summary>` so SEO/GEO text stays in initial HTML (no click-to-fetch).  
- One “How calculated” entry near results (jump/open methods) — avoid duplicate entries beside every button.

## 5. Engineering workflow

If the old page had a workflow:

- Restore **progress**, **step id (e.g. 3/5)**, **Prev/Next**, **Also used in / secondary workflow**, related tools.  
- Visuals may be Fieldbook-styled; **copy and membership must match production intent**.

## 6. Zero capability regression

Before replacing a production tool, diff old vs new for:

- Algorithms, defaults, presets, modes  
- i18n routes actually supported  
- History / local save / CSV / copy / print / share  
- Shareable URL state  
- Standards citations & high-value SEO copy  
- Internal links (toolkit hubs, topics, guides)  
- Keyboard + mobile operability  

Missing old capabilities = **P0/P1** until restored or explicitly waived in writing.

## 7. Forbidden

- Pasting OPB GPON B+/C+ formulas, ODN tables, or OPB FAQ into unrelated tools.  
- Keyword stuffing or fabricated sources for GEO.  
- Renaming production URLs for cosmetics.  
- Shipping with placeholder Save/CSV/Share or dead tabs.
