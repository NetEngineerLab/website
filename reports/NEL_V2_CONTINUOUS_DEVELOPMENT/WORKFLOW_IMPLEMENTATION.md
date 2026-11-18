# WF-01 implementation

WF-01 does not replace the 47 tool pages. It calls their existing `calculate` functions:

- `NELFiberLossEngine`
- `NELPonSplitterLossEngine`
- `NELOpticalPowerBudgetEngine`
- `NELPonDistanceEngine`
- `NELOdfOdnEngine`
- `NELOnuRxPowerEngine`
- `NELReportCenter.createBundle` and `toMarkdown`

Shared file: `website/assets/js/workflow/nel-workflow-core.js`.

Workflow file: `website/assets/js/workflow/ftth-pon-v1.js`.

Page: `website/workflows/ftth-pon/`.

The page is not in the tool registry and not in `sitemap.xml`. English only. Chinese and Spanish workflow pages were not added.

Behavior:

- One project holds distance, loss, splitter catalog values, power window, ODN counts and an optional measured receive level.
- User-locked fields reject a derived overwrite unless `confirm` is true.
- Splitter values must already be accepted by the PON engines. Other values fail before a guess is made.
- A third splitter stage stops the distance step unless the user checks the explicit carry-forward option.
- If upstream and downstream windows are not marked the same, ODN optics stay `INCONCLUSIVE`.
- An empty measurement stays `UNKNOWN` and does not assign a cause.
- Recalculate-from-step keeps earlier results only when their inputs still match.
- Save, restore, export and import use browser storage schema `nel-project-store/1`.
- The report is one Engineering Report Center bundle for the run.

Displayed key results are rounded to four decimal places. Raw engine outputs remain on the tool run for tests.
