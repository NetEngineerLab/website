# Independent audit

Reviewer: the same independent agent that did not implement WF-01.

Verdict: **FAIL**

Commit reviewed: `61815d274bbb1214ec7cdf558d07ec8b0e1d5616` on `cursor/ftth-pon-workflow-v1-deec`. Product code, tests, registries, and the workflow page were not modified by this review.

## Previous defect

The operator-cap and max-ODN-loss hole is closed. `website/assets/js/workflow/ftth-pon-v1.js` now records the ODN resource fields and the optical window on the ODN step, including `operatorCap` and `maxOdnLossDb`.

`node tests/ftth-pon-workflow-v1.test.js` exited 0 and printed `FTTH/PON workflow V1 tests: PASS`. The new assertions reject `wf.rerun` from `measured-rx` after `operatorCap` 32 and `maxOdnLossDb` 10 with `upstream-inputs-changed` on `odf-odn`. A full `wf.run` of that project returns 2 PON ports and scenario status `FAIL`. The same probe, plus reserve, protection, existing feeder cores, cable size, tray capacity, attenuation, penalty, and `sameBothDirections`, also refused the resume. A null measured receive level still returns `UNKNOWN` with `cause: null`, and the ONU engine is not called.

## Blocking defect

The ODN input snapshot still omits `context.name`, which is passed into `NELOdfOdnEngine.calculate` as the scenario name (`scenarios[0].name`, about line 394).

Observed behavior, example project, clock fixed:

- Run the example, then rerun from `measured-rx` with the project name changed to `Renamed span`.
- `rerun` returns `ok: true` and keeps the previous ODN step.
- The kept scenario name is `FTTH example`, status `PASS`, 1 PON port.
- A full run of the renamed project names the scenario `Renamed span`.
- `buildReport` sets the bundle project to `Renamed span` and the Markdown still contains `"name":"FTTH example"` inside the serialized ODN scenario.

The constant scenario id `"A"` is also omitted. It cannot drift. The stale field that is shown is the name.

## Other checks

Measured-RX inputs now include the varying ONU arguments: measured level, distance, attenuation, splices, connectors, three splitter values, other loss, transmit minimum, sensitivity, overload, no-signal level, and warning margin. The engine’s `mode` is the constant `"model"` and is not in the snapshot. `other` is `otherLossDb + splitter3Db`, and both parts are recorded. Changing `noSignalDbm` and rerunning from `measured-rx` recalculates that step.

No loss, ratio, reach, or resource formula was copied from the engines in this commit. The only arithmetic still in the workflow is the previous input adaptation: fiber `availableBudget` is `txMinDbm - rxSensitivityDbm - penaltyDb` because that engine requires a dB budget and has no penalty field; a third splitter stage is added to `otherLoss` for two-stage engines; ODN receives the sum of the three splitter dB values. Calculated loss, remaining budget, and receive power still come from the engine `calculate` functions. The report still comes from `createBundle` and `toMarkdown`.

`src/registry/tool-registry.json` and `website/sitemap.xml` still have no `ftth-pon` entry. Splitter value 24 is no longer in the workflow catalog, and `create` rejects it.

## Required correction

Put the project name in the ODN step’s recorded inputs so a resume cannot keep the previous scenario name after the project is renamed.
