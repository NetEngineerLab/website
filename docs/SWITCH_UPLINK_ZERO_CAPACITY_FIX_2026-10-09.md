# Switch uplink zero-capacity defect verification

Date: 2026-10-09 (Asia/Shanghai)
Existing tool: `switch-uplink-oversubscription-calculator`
Scope: local defect repair; no new tool admission, commit or deployment.

## Behavior

When every uplink fails, the failure scenario has zero available capacity,
`capacityState=unavailable`, `status=fail`, and `noAvailableUplinks` warning.
Utilization and oversubscription are explicitly uncomputable (`null` in JSON,
`N/A` in CSV). CSV includes active uplinks and capacity state to explain these
values. English/Chinese UI shows “No available uplinks” / “无可用上联”.
Normal legacy calculations remain compatible. Ratio strings render without
numeric coercion. Tool HTML engine references and service-worker cache have
been refreshed.

## Verification

- Engine regression: PASS (single uplink failure, all failures, failures above
  installed count, normal surviving uplink, legacy outputs and JSON/CSV).
- Browser regression: PASS, 4/4, English/Chinese on Chrome desktop and Edge
  iPhone; loss, recovery, ratio display and runtime errors checked.
- Service-worker precache and tool-registry contract: PASS.
- Independent audit by an agent not involved in implementation: PASS for
  this defect; independently reran engine tests and inspected reports/cache.
- JavaScript syntax and diff whitespace checks: PASS.

## Release status

Full-site release is NOT PASS. Attempted UI V1.3 audit failed with 22 errors;
Audit9 failed with existing-page structure/accessibility/local-resource issues;
page-registry contract failed on eligible Spanish URLs versus sitemap.
The full release gate was not completed. No claim is made that a full HEAD
baseline was independently rerun. Unrelated build/audit generated changes were
reversed, and the user's pre-existing document changes were preserved.

## Reproduction

Run:

```text
node website/tools/switch-uplink-oversubscription-calculator/docs/engine-test.js
node scripts/run-browser-tests.js switch-uplink-failure.spec.js --project=chrome-desktop --project=edge-iphone
```

On the English or Chinese tool page, set uplinks to 1 and failed uplinks to 1.
The failure scenario must show no available uplinks; restoring uplinks to 2
must return a finite utilization and calculable ratio for the surviving link.
