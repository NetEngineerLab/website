# Independent audit

Reviewer: the same independent agent that did not implement WF-01.

Verdict: **PASS**

Commit reviewed: `9223813aa7da02d16458091edc218b133494a4d0` on `cursor/ftth-pon-workflow-v1-deec`. Product code and tests were not modified by this review.

## Rename resume

`website/assets/js/workflow/ftth-pon-v1.js` records `projectName: context.name || "Project"` on the ODN step and passes that same value as the scenario name. Renaming the example to `Renamed span` and resuming from `measured-rx` returns `ok: false`, error `upstream-inputs-changed`, step `odf-odn`. A full run names the scenario `Renamed span`, the recorded input is `Renamed span`, and the report does not contain `FTTH example`.

`node tests/ftth-pon-workflow-v1.test.js` exited 0 and printed `FTTH/PON workflow V1 tests: PASS`. It covers that rename resume and the full run named `Renamed span`.

## Engine arguments against recorded inputs

Each `calculate` call was compared with that step’s `toolRun.inputs` on the example, a measured receive level, a folded third splitter stage with other loss 1 dB, one-direction optics, and a renamed project.

- Fiber loss: distance, attenuation, splice count and loss, connector count and loss, splitter 1, splitter 2, margin, transmit power, and receive threshold match recorded fields. `otherLoss` equals recorded `otherLossDb + splitter3Db`. `availableBudget` equals recorded `txMinDbm - rxSensitivityDbm - penaltyDb`.
- PON splitter: distance, attenuation, splices, connectors, all three splitter values, other loss, penalty, margin, both transmit levels, both receive levels, and system reach match recorded fields.
- Optical power budget: penalty, distance, attenuation, splices, connectors, all three splitter values, other loss, margin, and the transmit and receive window match recorded fields.
- PON distance: planned distance, system reach, attenuation, splices, connectors, splitter 1, splitter 2, margin, transmit minimum, and both receive levels match recorded fields. The `other` argument equals recorded `distanceOtherLossDb`, including the folded third stage.
- ODN: target ONU, stages, ratios, operator cap, protection, reserve, cable and tray sizes, existing resources, distance, attenuation, splitter-loss sum, splices, connectors, other loss, max ODN loss, system reach, penalty, transmit and receive window, and `sameBothDirections` match recorded fields. The scenario name equals recorded `projectName`. Upstream attenuation and power are copied only when that flag is true, and they use the same recorded fields. The scenario id passed to the engine is the constant `A`.
- ONU receive power, when a measurement is present: measured level, sensitivity, overload, no-signal level, warning margin, distance, attenuation, splices, connectors, splitter 1, splitter 2, and transmit minimum match recorded fields. `other` equals recorded `otherLossDb + splitter3Db`. The mode passed to the engine is the constant `model`. With no measurement the step stays `UNKNOWN`, `cause` is null, and `calculate` is not called.

No changeable engine argument or displayed scenario value is absent from the recorded inputs. The two constants cannot drift between runs.
