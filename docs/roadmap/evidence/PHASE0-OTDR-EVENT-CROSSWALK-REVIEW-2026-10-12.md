# OTDR Event Analyzer — crosswalk review checkpoint

**Date:** 2026-10-12  
**Primary reviewer:** `/root`  
**Independent reviewer:** `/root/crosswalk_audit`  
**Disposition:** Reclassify the prior `NO_ROADMAP_MATCH` as `HYPOTHESIS / UNREVIEWED` with candidate links TOOL-067, TOOL-068, TOOL-069. This is not a confirmed match and does not close the crosswalk row.

## Existing tool scope

The active OTDR Event Analyzer analyzes measured event data. Its inputs include event distances, primary and secondary wavelength losses, reflectance, cumulative loss, link length, attenuation, index of refraction, and event thresholds. Its logic classifies splice, bend, connector, mechanical, end, ghost, and unknown events using reflectance, wavelength-loss differences, proximity to link end, strong-reflector spacing, and dead-zone conditions. It reports severity and estimated link loss (`website/tools/otdr-event/index.html:68,75-93,99-140`; `website/tools/otdr-event/js/engine.js:14-34,36-85,87-117,120-205`).

Validation passed: `node website/tools/otdr-event/docs/engine-test.js` returned representative splice/bend/connector/end classifications and summary loss values with exit code 0.

## Candidate comparison

The nearest roadmap titles are TOOL-067 **Fiber Link Loss Calculator**, TOOL-068 **Connector / Splice Loss Budget Calculator**, and TOOL-069 **Optical Margin Calculator**. The existing analyzer's event-loss and estimated-link-loss outputs overlap in part with those candidate themes, but its central workflow is measured OTDR event diagnosis and classification. The candidate matrix rows for TOOL-067/068/069 still have problem statement, inputs, outputs, core logic, target user, canonical problem ID, and evidence gates set to `PENDING` (`docs/roadmap/PHASE0_AUDIT_MATRIX.csv:68-70`).

The evidence therefore cannot establish a direct match or confirm no match. Do not infer candidate scopes from the OTDR implementation. The plausible links are stored as hypotheses only.

## Independent review

`/root/crosswalk_audit` independently compared the OTDR input/output/logic with TOOL-067/068/069 and concluded that the prior `NO_ROADMAP_MATCH` cannot be signed as verified. Because candidate scopes are missing and outputs partially overlap, the reviewer recommends retaining the row as unresolved and obtaining traceable candidate definitions, especially confirming whether TOOL-068 consumes OTDR event data and whether TOOL-067/069 include event analysis.

## Applied ledger update and next evidence

The crosswalk row now lists `TOOL-067;TOOL-068;TOOL-069` as hypotheses, with `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, and `gate_status=NOT_STARTED`. No roadmap matrix row or development candidate was changed. The row can be resolved only after authoritative TOOL-067/068/069 scope definitions are compared with this existing analyzer and independently reviewed.
