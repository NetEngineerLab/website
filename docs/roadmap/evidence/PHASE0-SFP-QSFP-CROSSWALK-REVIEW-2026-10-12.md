# SFP & QSFP Compatibility Checker — crosswalk review checkpoint

**Date:** 2026-10-12  
**Primary reviewer:** `/root`  
**Independent reviewer:** `/root/crosswalk_audit`  
**Disposition:** The prior `NO_ROADMAP_MATCH` is not verifiable. Reclassify to `HYPOTHESIS / UNREVIEWED` for TOOL-067/068/069; no confirmed mapping or duplicate decision.

## Existing tool scope

The active checker compares two transceivers' form factor, rate, lane count, media, wavelength, connector, and fiber type. It also evaluates link distance, attenuation, connector/splice counts and loss, engineering margin, Tx/Rx ranges, estimated receive power, sensitivity/design margin, overload headroom, and final status (`website/tools/sfp-qsfp-compatibility-calculator/index.html:72,74,78,81,83-85`; `js/engine.js:7-14,57-120,135-150,164-201,245-301`).

Validation passed: `node website/tools/sfp-qsfp-compatibility-calculator/docs/engine-test.js` → `PASS: SFP/QSFP compatibility and optical-budget engine tests.`

## Candidate comparison

The closest roadmap titles are TOOL-067 **Fiber Link Loss Calculator**, TOOL-068 **Connector / Splice Loss Budget Calculator**, and TOOL-069 **Optical Margin Calculator**. The current checker has clear partial functionality overlap with physical loss and optical margin, while its main workflow also checks end-to-end module compatibility. The candidate rows' problem definitions, inputs, outputs, core logic, target users, canonical IDs, and evidence gates remain `PENDING` (`docs/roadmap/PHASE0_AUDIT_MATRIX.csv:68-70`).

The independent reviewer found the prior no-match claim cannot be signed, but did not find enough candidate-side evidence to confirm a mapping. TOOL-073/074, TOOL-016, and TOOL-079 are weaker surface associations and are not added to the current hypothesis list. Do not use existing-tool behavior to fill candidate definitions.

## Applied ledger update

The crosswalk now lists `TOOL-067;TOOL-068;TOOL-069` with `mapping_status=HYPOTHESIS`, `overlap_decision=UNREVIEWED`, and `gate_status=NOT_STARTED`. The matrix was not changed. Resolve this row after obtaining authoritative TOOL-067/068/069 scope and independently comparing the six-part problem fingerprints.
