# Independent audit

Reviewer: an independent agent that did not implement WF-01.

Verdict: **FAIL**

Commit reviewed: `b6ada0df` on `cursor/ftth-pon-workflow-v1-deec`. Uncommitted edits to `website/guides/fiber-link-budget-guide/index.html` and `website/tools/ip-camera-network-planner/manifest-es.webmanifest` were left untouched and are outside this verdict. Product code, tests, registries, and the workflow page were not modified.

## Blocking defect

`website/assets/js/workflow/ftth-pon-v1.js` records an incomplete `inputs` object for the `odf-odn` step (about lines 354–358). `website/assets/js/workflow/nel-workflow-core.js` `rerunFrom` keeps earlier steps when `JSON.stringify` of those recorded inputs matches. The ODN snapshot omits fields the ODN engine actually uses, including `operatorCap`, `protectionFactor`, `reservePct`, `maxOdnLossDb`, cable and tray capacities, and the existing-port and existing-core counts. Optical fields such as attenuation and transmit power are also absent from that snapshot; those particular fields are still guarded because earlier steps copy them into `opticalInputs`.

Observed behavior, example project, clock fixed, previous run `probe-1`:

- Full run at `operatorCap` 64 and `maxOdnLossDb` 32: ODN `ponPorts` 1, `minMargin` 6.7 dB, scenario status `PASS`.
- Same project changed to `operatorCap` 32 and `maxOdnLossDb` 10, then `wf.rerun(..., "measured-rx")`: returns `ok: true` and reuses the previous ODN step object. Kept result remains `ponPorts` 1, `minMargin` 6.7 dB, status `PASS`.
- `wf.run` on that changed project: `ponPorts` 2, `minMargin` -15.3 dB, scenario status `FAIL`.

`website/workflows/ftth-pon/app.js` `recalculate` calls this path from “Recalculate from here” and tells the user that earlier inputs still match. For these ODN fields they do not. A passing plan is shown for inputs the engine would fail.

The measured-RX step’s recorded inputs are also only the measured level, distance, and three splitter values. It is the last step, so the current page re-executes it. The user-visible stale result is the kept ODN step.

## Evidence checked

1. Engine calls. `ftth-pon-v1.js` `engines()` loads `fiber-loss`, `pon-splitter-loss`, `optical-power-budget`, `pon-distance`, `odf-odn-resource-planner`, `onu-rx-power`, and `engineering-report-batch-export-center`. Each optical step calls that engine’s `calculate`. `buildReport` calls `createBundle` and `toMarkdown`. The example chain’s physical loss 25.3 dB, remaining 3.7 dB, and receive level -22.3 dBm come from those engines and match across fiber loss, splitter loss, and optical power budget. Local arithmetic is limited to input adaptation: fiber `availableBudget` is `txMinDbm - rxSensitivityDbm - penaltyDb` because that engine has no penalty field and requires a dB budget; a third splitter stage is added to `otherLoss` only for engines with two splitter fields; ODN receives the sum of the three splitter dB values because its scenario field is one `splitterLoss`. Those adapters do not replace the engines’ loss, ratio, reach, resource, or RX formulas. This item is not the fail reason.

2. Units and locks. Project fields are passed through in km, dB/km, dB, and dBm. Key results use dB for loss and margin, dBm for receive power, and km for reach. `proposeParameter` in `nel-workflow-core.js` rejects a derived write to a `user` lock unless `confirm === true`, and the rejected call leaves the original context at 10 km. With `confirm: true` the copy becomes 4 km and the lock becomes `derived`. Distance `designRemaining` on the example is 4.7 dB. Splitter and budget remaining are 3.7 dB. The 1.0 dB gap equals `penaltyDb`. The distance engine has no penalty input, and the workflow does not subtract penalty locally. That is an engine-basis difference, not a km/dB mix-up, and it is not the fail reason.

3. Missing measured receive power. The example leaves `measuredRxDbm` null. The measured-RX step returns status `UNKNOWN`, `outputs.cause` null, warning “No measured receive power was provided.”, and assumption “Evidence is insufficient. No root cause is assigned.” The ONU engine is not called on that path. No cause string is invented.

4. Invalid numbers. `validateParameters` rejects `NaN`, `Infinity`, `-Infinity`, and negative `distanceKm` with `distanceKm-invalid` before `run` builds steps. Splitter values 9, 15, -3.7, `NaN`, and `Infinity` are rejected with `splitter1Db-unsupported`. The workflow list is `0, 3.7, 7.2, 10.5, 13.8, 17, 20.5, 24`. Value 24 is in the PON splitter engine and not in the PON distance or ONU RX catalogs. `create` accepts `splitter1Db` 24, then the run aborts at `pon-distance` with `invalid-input` and leaves ODN and measured RX `not-run`. That abort is fail-closed. It is not the blocking defect.

5. Registry and sitemap. `src/registry/tool-registry.json` and `website/sitemap.xml` contain no `ftth-pon` entry. `git diff HEAD` does not change either file. `package.json` only adds the workflow test script.

6. Commands, secrets, and deploy. The workflow sources, page, and test contain no `child_process`, `exec`, `ssh`, API key, private key, or deploy command. The page stores the project in `localStorage` and downloads a JSON or Markdown blob. It loads the existing local engines plus the site analytics and adsense scripts. No device command execution was added.

7. Test. `node tests/ftth-pon-workflow-v1.test.js` exited 0 and printed `FTTH/PON workflow V1 tests: PASS`. The test was not edited. It does not cover an ODN-only field change followed by rerun from `measured-rx`. The browser note in `BROWSER_QA_REPORT.md` was read and was not re-run; its distance change goes through the full calculate path, which does recompute ODN.

## Required correction

Record every value passed into `NELOdfOdnEngine.calculate` on the ODN step’s `inputs`, including resource counts and `maxOdnLossDb`, so `rerunFrom` rejects the resume when those values changed. Do the same for the measured-RX engine arguments before another step is added after it.
