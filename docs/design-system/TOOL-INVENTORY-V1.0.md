# Tool Inventory V1.0

| Field | Value |
|---|---|
| Task | NEL-UI-UNIFICATION-V1.0 · Phase 1 |
| Generated | 2026-10-27 (Asia/Shanghai) |
| Source | `website/tools/*/index.html` on `main` |
| Baseline UI | https://netengineerlab.com/design/fieldbook/tool-optical-power-budget-v3 |

## Summary

- **Total tools:** 54
- **Fully on Fieldbook V3 production:** 0 (OPB production still legacy until PR #48 merges)
- **Need upgrade to V3 standard:** 54 (including OPB production cutover)
- Types: `{'calc': 32, 'diagnostic/analysis': 4, 'planner/workflow': 14, 'suite/hub': 4}`
- Priority: `{'P2': 25, 'P1': 21, 'P0': 8}`
- Complexity: `{'high': 27, 'medium': 23, 'low': 4}`
- i18n: `{'en+zh+es': 49, 'en+zh': 5}`

Complexity/priority are **heuristics** (HTML size, input count, JS count, slug keywords) for batching — refine when pilots run.

## Pilot proposal (Phase 2)

| Role | Tool | URL | Why |
|---|---|---|---|
| Simple calc | `ospf-cost-calculator` | https://netengineerlab.com/tools/ospf-cost-calculator/ | Small form (≈2 inputs), en+zh+es, medium shared-shell cost, proves token/component extraction without heavy engine risk |
| Complex engineering calc | `fiber-loss` | https://netengineerlab.com/tools/fiber-loss/ | High complexity fiber domain adjacent to OPB, en+zh+es, exercises presets/results/folds without copying OPB formulas |
| Diagnostic / analysis | `otdr-event` | https://netengineerlab.com/tools/otdr-event/ | Diagnostic flow, P1 optical, en+zh+es — validates non-calculator IA |

Alternates if blocked: simple=`dns-ttl-propagation-calculator` or `ethernet-serialization-delay-calculator`; complex=`poe-power-budget-calculator` or `wireless-link-budget-calculator`; diagnostic=`network-risk-hidden-hazard-assessment-generator`.

## Batch estimate

- Pilots: **1 batch of 3** (Phase 2).
- Remaining after pilots + OPB cutover: ~50 tools.
- Phase 3 at ≤3 tools/batch → **≈17 batches** (plus shared-component hardening).
- Suggested order after pilots: remaining **P0**, then **P1** PON/fiber/IP, then **P2**.

## Full table

| id | URL | version | type | i18n | complexity | priority |
|---|---|---|---|---|---|---|
| `48v-battery-runtime` | `/tools/48v-battery-runtime/` | legacy-tool | calc | en+zh+es | high | P2 |
| `acl-generator-validator` | `/tools/acl-generator-validator/` | legacy-tool | calc | en+zh+es | high | P1 |
| `all-reduce-traffic-estimator` | `/tools/all-reduce-traffic-estimator/` | legacy-tool | calc | en+zh+es | medium | P2 |
| `application-bandwidth-analyzer` | `/tools/application-bandwidth-analyzer/` | legacy-tool | diagnostic/analysis | en+zh | medium | P2 |
| `bandwidth-calculator` | `/tools/bandwidth-calculator/` | legacy-tool | calc | en+zh+es | high | P0 |
| `chromatic-dispersion-calculator` | `/tools/chromatic-dispersion-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `data-center-airflow-containment-planner` | `/tools/data-center-airflow-containment-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P2 |
| `data-center-architecture-decision-workshop` | `/tools/data-center-architecture-decision-workshop/` | legacy-tool | planner/workflow | en+zh | medium | P2 |
| `data-center-cooling-load-calculator` | `/tools/data-center-cooling-load-calculator/` | legacy-tool | calc | en+zh+es | high | P2 |
| `data-center-network-convergence-fabric-capacity-planner` | `/tools/data-center-network-convergence-fabric-capacity-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P2 |
| `datacenter-power-calculators` | `/tools/datacenter-power-calculators/` | legacy-tool | suite/hub | en+zh+es | low | P2 |
| `dc-plant-efficiency-load-sharing` | `/tools/dc-plant-efficiency-load-sharing/` | legacy-tool | calc | en+zh+es | high | P2 |
| `dns-ttl-propagation-calculator` | `/tools/dns-ttl-propagation-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `engineering-report-batch-export-center` | `/tools/engineering-report-batch-export-center/` | legacy-tool | suite/hub | en+zh+es | medium | P2 |
| `ethernet-serialization-delay-calculator` | `/tools/ethernet-serialization-delay-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `fiber-latency-calculator` | `/tools/fiber-latency-calculator/` | legacy-tool | calc | en+zh+es | medium | P0 |
| `fiber-loss` | `/tools/fiber-loss/` | legacy-tool | calc | en+zh+es | high | P0 |
| `generator-fuel-runtime-calculator` | `/tools/generator-fuel-runtime-calculator/` | legacy-tool | calc | en+zh+es | high | P2 |
| `generator-ups-transfer-ride-through-planner` | `/tools/generator-ups-transfer-ride-through-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P2 |
| `ip-camera-network-planner` | `/tools/ip-camera-network-planner/` | legacy-tool | planner/workflow | en+zh | low | P1 |
| `ipv6-nat-planner` | `/tools/ipv6-nat-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P1 |
| `mtu-calculator` | `/tools/mtu-calculator/` | legacy-tool | calc | en+zh+es | high | P0 |
| `network-asset-lifecycle-tracker` | `/tools/network-asset-lifecycle-tracker/` | legacy-tool | planner/workflow | en+zh | medium | P2 |
| `network-capacity-forecast-planner` | `/tools/network-capacity-forecast-planner/` | legacy-tool | planner/workflow | en+zh+es | medium | P2 |
| `network-change-planner-mop-generator` | `/tools/network-change-planner-mop-generator/` | legacy-tool | planner/workflow | en+zh+es | medium | P2 |
| `network-rack-power-cooling-calculator` | `/tools/network-rack-power-cooling-calculator/` | legacy-tool | calc | en+zh+es | medium | P2 |
| `network-risk-hidden-hazard-assessment-generator` | `/tools/network-risk-hidden-hazard-assessment-generator/` | legacy-tool | diagnostic/analysis | en+zh+es | medium | P2 |
| `odf-odn-resource-planner` | `/tools/odf-odn-resource-planner/` | legacy-tool | planner/workflow | en+zh+es | medium | P1 |
| `olt-dual-uplink-transport-mse-planner` | `/tools/olt-dual-uplink-transport-mse-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P1 |
| `onu-rx-power` | `/tools/onu-rx-power/` | legacy-tool | calc | en+zh+es | high | P1 |
| `oob-network-design-planner` | `/tools/oob-network-design-planner/` | legacy-tool | planner/workflow | en+zh | medium | P2 |
| `optical-power-budget` | `/tools/optical-power-budget/` | legacy-awaiting-PR48 | calc | en+zh+es | high | P0 |
| `ospf-cost-calculator` | `/tools/ospf-cost-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `otdr-event` | `/tools/otdr-event/` | legacy-tool | diagnostic/analysis | en+zh+es | high | P1 |
| `pmd-budget-calculator` | `/tools/pmd-budget-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `poe-power-budget-calculator` | `/tools/poe-power-budget-calculator/` | legacy-tool | calc | en+zh+es | medium | P0 |
| `poe-voltage-drop-calculator` | `/tools/poe-voltage-drop-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `pon-distance` | `/tools/pon-distance/` | legacy-tool | calc | en+zh+es | high | P1 |
| `pon-fiber-calculators` | `/tools/pon-fiber-calculators/` | legacy-tool | suite/hub | en+zh+es | low | P1 |
| `pon-splitter-loss` | `/tools/pon-splitter-loss/` | legacy-tool | calc | en+zh+es | high | P0 |
| `pue-data-center-energy-efficiency` | `/tools/pue-data-center-energy-efficiency/` | legacy-tool | calc | en+zh+es | high | P2 |
| `sfp-qsfp-compatibility-calculator` | `/tools/sfp-qsfp-compatibility-calculator/` | legacy-tool | calc | en+zh+es | high | P1 |
| `stp-path-cost-calculator` | `/tools/stp-path-cost-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `subnet-calculator` | `/tools/subnet-calculator/` | legacy-tool | calc | en+zh+es | high | P0 |
| `switch-uplink-oversubscription-calculator` | `/tools/switch-uplink-oversubscription-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |
| `switching-bandwidth-calculators` | `/tools/switching-bandwidth-calculators/` | legacy-tool | suite/hub | en+zh+es | low | P2 |
| `telecom-ac-dc-breaker-sizing` | `/tools/telecom-ac-dc-breaker-sizing/` | legacy-tool | calc | en+zh+es | high | P2 |
| `telecom-rectifier-dc-power-sizing` | `/tools/telecom-rectifier-dc-power-sizing/` | legacy-tool | calc | en+zh+es | high | P2 |
| `telecom-solar-battery-sizing-calculator` | `/tools/telecom-solar-battery-sizing-calculator/` | legacy-tool | calc | en+zh+es | high | P2 |
| `transmission-ring-optimization-risk-analyzer` | `/tools/transmission-ring-optimization-risk-analyzer/` | legacy-tool | diagnostic/analysis | en+zh+es | high | P2 |
| `ups-capacity-battery-runtime-calculator` | `/tools/ups-capacity-battery-runtime-calculator/` | legacy-tool | calc | en+zh+es | high | P2 |
| `vlan-ip-capacity-planner` | `/tools/vlan-ip-capacity-planner/` | legacy-tool | planner/workflow | en+zh+es | medium | P1 |
| `wifi-coverage-capacity-planner` | `/tools/wifi-coverage-capacity-planner/` | legacy-tool | planner/workflow | en+zh+es | high | P1 |
| `wireless-link-budget-calculator` | `/tools/wireless-link-budget-calculator/` | legacy-tool | calc | en+zh+es | medium | P1 |

## Notes

- Excludes locale aggregate folders mistakenly under tools (`es`/`zh` hubs are not tools).
- Five tools are en+zh only (no es): see i18n column.
- Do not mark pages “done” until production URL passes SEO-GEO-GATE and migration checklist.
