# Migration Checklist V1.0

| Field | Value |
|---|---|
| Task | NEL-UI-UNIFICATION-V1.0 · Phase 0 |
| Use | Every tool upgrade batch (max 3 tools) |

## A. Before coding

- [ ] Confirm tool id, production URL(s), locales  
- [ ] Capture old-page capability inventory (modes, exports, history, URL state, links)  
- [ ] Capture SEO head (title/description/canonical/hreflang/JSON-LD)  
- [ ] Note engine entrypoints / golden tests (`docs/engine-test.js` if present)  
- [ ] Assign class: simple calc / complex eng / diagnostic / planner / suite  
- [ ] Confirm **no** OPB-specific content will be copied  

## B. Implementation

- [ ] Reuse Fieldbook shared tokens/components — no new one-off CSS system  
- [ ] Apply `TOOL-PAGE-STANDARD-V1.0.md` IA for the class  
- [ ] Preserve engine math & defaults; UI-only changes unless bugfix approved  
- [ ] Integer/raw validation before coerce; disable export when invalid  
- [ ] Mobile fold strategy; desktop TOC optional with scroll spy  
- [ ] Restore workflow / toolkit hubs if old page had them  
- [ ] Asset cache-bust (`?v=` hash) for CSS/JS  

## C. Tests (release gate)

- [ ] Engine / golden assertions PASS  
- [ ] Viewports 320 / 375 / 768 / 1440: no overflow, primary actions usable  
- [ ] Keyboard path smoke  
- [ ] Locale smoke (supported languages): same numeric results  
- [ ] SEO-GEO-GATE checklist PASS  
- [ ] Console free of unexpected errors on happy path  
- [ ] P0 = 0, P1 = 0  

## D. Ship control

- [ ] PR scoped to listed tools (+ shared components if needed)  
- [ ] Rollback plan documented (restore previous HTML/JS or revert commit)  
- [ ] **Do not merge/deploy production overwrite without explicit user “上线” / batch approval**  
- [ ] After deploy: spot-check production URL indexing headers ≠ preview noindex  

## E. Batching

- Max **3** tools per batch after pilots.  
- Priority: P0 traffic-critical → P1 domain (PON/fiber/IP) → P2 long-tail.  
- Next batch only after previous batch audit PASS.
