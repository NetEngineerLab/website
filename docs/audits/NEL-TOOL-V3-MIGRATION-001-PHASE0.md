# NEL-TOOL-V3-MIGRATION-001 Phase 0 audit

Status: audit only. No tool HTML/CSS redesign, no calculation changes, no merge, no deploy.

Source of record: `origin/main` `d5d581fad777eee45c8f4239b6b034e58566b87a` (tree `bbe5786a945a75faf0a29061ca83e7d1851205c2`). Observed live responses on 2026-10-28 after that commit landed (13:30:23Z).

Active locales in `website/data/locales.json`: `en`, `zh`, `es`. Planned ids with no tool HTML on disk: `pt-BR`, `ja`, `de`, `ru`, `hi`, `bn`, `ur`. This audit does not treat planned ids as pages.

## A. Baseline verification

### Preview alias

| Item | Evidence |
|---|---|
| URLs checked | `https://cursor-opb-v3-visual-restore.netengineerlab.pages.dev/tools/optical-power-budget/` and `/zh/`, `/es/` |
| Branch | `cursor/opb-v3-visual-restore-8b48` (tip still `01537f1ff1eeaa4397fb64d0415915d97905d8f3`) |
| Commit behind the alias | `01537f1ff1eeaa4397fb64d0415915d97905d8f3` |
| How the commit was tied to the alias | Cloudflare Pages check on that SHA names Branch Preview URL `https://cursor-opb-v3-visual-restore.netengineerlab.pages.dev` and deployment `f57d5298` (completed 2026-10-28T10:53:20Z). The same bot comment is on PR #51. |
| Deployment URL byte check | EN HTML sha256 `7a8e6cf7920acc70` is identical on the branch alias, `https://f57d5298.netengineerlab.pages.dev/tools/optical-power-budget/`, `https://a0c2682c.netengineerlab.pages.dev/tools/optical-power-budget/`, and `https://netengineerlab.pages.dev/tools/optical-power-budget/`. |
| Tree vs main | `01537f1^{tree}` == `d5d581fa^{tree}` == `bbe5786a945a75faf0a29061ca83e7d1851205c2`. Squash merge changed the commit id only. |

All three preview locales return 200, `body class="nel-tool-detail-page nel-opb-v3 has-mbar v3"`, and `x-robots-tag: noindex`.

### main and production

| Item | Evidence |
|---|---|
| main HEAD | `d5d581fad777eee45c8f4239b6b034e58566b87a` — `fix(opb): restore Fieldbook V3 tool body on the production calculator (#51)`, merged 2026-10-28T13:30:23Z |
| PR #51 | Squash-merged. Head `01537f1ff1eeaa4397fb64d0415915d97905d8f3` on `cursor/opb-v3-visual-restore-8b48`. |
| Quality Gate | [run 40675605811](https://github.com/NetEngineerLab/website/actions/runs/40675605811) Production Quality Gate **success** for head `01537f1` (2026-10-28T10:53:00Z–11:13:37Z). That tree is the tree now on main. |
| Cloudflare Pages on main | Check success 2026-10-28T13:30:44Z, deployment `a0c2682c`, summary "Deploy successful", commit `d5d581f`. |
| OPB V3 on main | Yes. EN/ZH/ES `website/tools/optical-power-budget/{,zh/,es/}index.html` use `nel-opb-v3`, `.below`, `.fb-fold`, `.method-defs`. |
| OPB V3 on production | Yes for the calculator body. `https://netengineerlab.com/tools/optical-power-budget/` and `/zh/`, `/es/` serve the same body class and the same CSS query hashes as main. |

GitHub `monitor-production` and `verify-production-build` on `d5d581fa` were still `in_progress` at audit time. The live custom-domain fingerprint below does not wait on those jobs.

### CSS hash comparison

`?v=` is the first 12 hex chars of SHA-256 of the file bytes (`stableFileHash` / `assetVersion` in `scripts/build-multilingual.js`). Checked by hashing the blobs.

| Asset | Live preview and prod `?v=` | `d5d581fa` / `01537f1` | Previous main `ec4a1f55` |
|---|---|---|---|
| `website/assets/css/site-shell.css` | `989edb3b4d77` | `989edb3b4d77` | `d998a53add89` |
| `website/assets/css/tool-layout.css` | `dfdd771763d6` | `dfdd771763d6` | `7dea79f8c287` |
| `website/tools/optical-power-budget/css/style.css` | `39f97e62e2fc` | `39f97e62e2fc` | `39f97e62e2fc` |
| `website/tools/optical-power-budget/js/engine.js` | `5e03675c092d` | `5e03675c092d` | `5e03675c092d` |
| `website/assets/js/seo-engine.js` | `15ac96553c44` | `15ac96553c44` | `15ac96553c44` |

Preview == main source == production for these OPB fingerprints. Preview != the pre-#51 main (`ec4a1f55`) for `site-shell.css` and `tool-layout.css`.

### HTML deltas (not full source)

Committed OPB HTML vs `*.pages.dev` (alias, deployment ids, and `netengineerlab.pages.dev`), all three locales: one meta difference. Committed `robots` content is `index,follow,max-image-preview:large,max-snippet:-1`. The pages.dev response meta is `noindex`. EN byte delta is 44, which matches that string change. Response header `x-robots-tag: noindex` matches `website/_headers` rules for `https://:project.pages.dev/*` and `https://:version.:project.pages.dev/*`.

Committed OPB HTML vs `https://netengineerlab.com` , all three locales: the document matches git except a Cloudflare Insights beacon script inserted before `</body>`. No `x-robots-tag` on the custom domain. Robots meta matches git (`index,follow,...`).

So: preview alias commit is `01537f1` (same tree as main); production custom domain is that tree plus the edge beacon; pages.dev hosts additionally rewrite the robots meta. This audit does not change robots, canonical, or hreflang policy.

## B. Migration matrix

Scope: every directory in `website/tools/` except locale folders `es/` and `zh/`. Registry cross-check: `website/data/tools-catalog.json` (46 active tools), `website/data/sitemap-routes.json` (tool hubs only; individual tools are page families built by `scripts/page-registry.js` from the catalog), `website/data/locales.json`, and the HTML files themselves.

Shared CSS/JS on every catalog detail page, omitted from the rows: `design-tokens.css`, `site-shell.css`, `tool-design-system.css`, `tool-layout.css`, `tool-workflow.css`, `locale-menu.css`, `seo-engine.js`, `site.js`, `tool-integration.js`, `tool-shell-v1.9.9-04.js`, plus local `pwa.js` where present. Rows list the tool-local script/style names that differ.

Layout families: `opb-v3` (body `nel-opb-v3` and `.fb-fold`), `legacy` (`nel-tool-detail-page` / tool-detail v1.3.1 two-column), `hub`, `other`, `missing`. No page is `partial fieldbook`.

SEO column: `ready` means title, canonical, and hreflang for exactly the locales that exist (`en`, `zh-CN`, `es`, `x-default` when `es/index.html` exists). Robots bucket is the EN meta, not a recommendation to edit it:

- `R0` = `index,follow,max-image-preview:large`
- `R1` = R0 plus `max-snippet:-1`
- `R2` = R1 plus `max-video-preview:-1`

V3 fit: `yes` only Optical Power Budget. `partial` means a single `js/engine.js` behind the legacy shell, so folds can wrap existing sections. `no` means hub, missing page, or no engine.

Block tags come from the English page's section ids and `h2` text (`about`, `methods`, `faq`, `refs`, `history`, `review`, `related`, `scenarios`, `workflow`). A tag means that marker is present. It does not mean the prose was compared word for word.

### A. Fiber / ODN / PON

| Tool | Route slug | Locales | Layout | Local JS | Engine + input ids | SEO | EN blocks | V3 | Risk / test note | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| Chromatic Dispersion Calculator | `chromatic-dispersion-calculator` | en/zh/es | legacy | app.js, engine.js | `NELChromaticDispersionEngine`; in: projectName, mode, wavelength, lambda0, s0, manualD, lengthKm, compensation +2 | ready R2 | methods, faq, refs, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Fiber Latency Calculator | `fiber-latency-calculator` | en/zh/es | legacy | app.js, engine.js | `NELFiberLatencyEngine`; in: projectName, distance, distanceUnit, routeFactor, groupIndexPreset, groupIndex, equipmentCount, equipmentDelay +3 | ready R2 | methods, faq, refs, history, workflow | partial | section-id mismatch across locales | engine-test.js |
| Fiber Loss Calculator | `fiber-loss` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `NELFiberLossEngine`; in: preset, projectName, distance, wavelength, attenuation, spliceCount, spliceLoss, connectorCount +8 | ready R2* | methods, faq, refs, history, related, scenarios, workflow | partial | section-id mismatch across locales; robots string differs by locale | engine-test.js, pon-scenarios CLUSTER, tool-scenarios |
| ODF / ODN Fiber Resource & Split Planning Planner | `odf-odn-resource-planner` | en/zh/es | legacy | app.js, engine.js | `NELOdfOdnEngine`; in: targetOnu, stages, r1, r2, r3, operatorCap, protectionFactor, reservePct +8 | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| OLT Dual-Uplink Capacity, Transport Channel & MSE Port Planner | `olt-dual-uplink-transport-mse-planner` | en/zh/es | legacy | app.js, engine.js | `NELUplinkTransportMseEngine`; in: oltCount, traffic, uplinkRate, mode, channelRate, channelLimit, mseRate, mseLimit +6 | ready R0 | faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| ONU RX Power Diagnosis | `onu-rx-power` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `NELOnuRxPowerEngine`; in: preset, projectName, measuredRx, rxSensitivity, rxOverload, warningMargin, noSignalThreshold, txPower +10 | ready R1 | about, methods, faq, refs, history, related, scenarios, workflow | partial | 18 inputs | engine-test.js, pon-scenarios CLUSTER |
| Optical Power Budget Calculator | `optical-power-budget` | en/zh/es | opb-v3 | app-v3.js, app.js, engine.js | `NELOpticalPowerBudgetEngine`; in: projectName, txPower, txMaxPower, rxSensitivity, rxOverload, opticalPenalty, engineeringMargin, distance +10 | ready R1 | about, methods, faq, refs, history, review, related, workflow | yes | baseline already on main/prod; do not remigrate | engine-test.js, gate4b-engine.test.js, pon-scenarios CLUSTER |
| OTDR Event Analyzer | `otdr-event` | en/zh/es | legacy | app.js, engine.js | `engine.js`; in: projectName, primaryWavelength, secondaryWavelength, linkLength, pulseWidth, ior, primaryAttenuation, secondaryAttenuation +12 | ready R1 | methods, faq, refs, history, workflow | partial | 20 inputs | engine-test.js |
| PMD Budget Calculator | `pmd-budget-calculator` | en/zh/es | legacy | app.js, engine.js | `NELPmdBudgetEngine`; in: projectName, pmdCoef, lengthKm, componentCount, componentPmd, symbolRate, tolerancePct, maxRatio | ready R2 | methods, faq, refs, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| PON Maximum Distance Calculator | `pon-distance` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `NELPonDistanceEngine`; in: preset, projectName, txPower, rxSensitivity, rxOverload, systemReach, plannedDistance, margin +9 | ready R1 | about, methods, faq, refs, history, related, scenarios, workflow | partial | layout swap only; keep engine bytes | engine-test.js, pon-scenarios CLUSTER |
| PON Splitter Loss Calculator | `pon-splitter-loss` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `NELPonSplitterLossEngine`; in: preset, projectName, systemProfile, splitter1, splitter2, splitter3, distance, wavelength +21 | ready R1 | methods, faq, refs, history, related, scenarios, workflow | partial | section-id mismatch across locales; 29 inputs | engine-test.js, pon-scenarios CLUSTER |
| SFP & QSFP Compatibility Checker | `sfp-qsfp-compatibility-calculator` | en/zh/es | legacy | app.js, engine.js | `NELSfpQsfpEngine`; in: preset, aForm, aRate, aLanes, aMedia, aWave, aConnector, aTx +26 | ready R1 | methods, refs, related, workflow | partial | 34 inputs | engine-test.js |

### B. IP / network capacity

| Tool | Route slug | Locales | Layout | Local JS | Engine + input ids | SEO | EN blocks | V3 | Risk / test note | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| All-Reduce Traffic Estimator | `all-reduce-traffic-estimator` | en/zh/es | legacy | app.js, engine.js | `NELAllReduceEngine`; in: projectName, ranks, paramsBillion, bytesPerParam, linkGbps, efficiencyPct, latencyUs | ready R2 | methods, faq, refs, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Application Bandwidth Analyzer | `application-bandwidth-analyzer` | en/zh | legacy | app.js, engine.js | `ApplicationBandwidthEngine`; in: capacity, unit, threshold, file | ready R0 | methods, related | partial | not in tools-catalog; locales en/zh | engine-test.js |
| Bandwidth & Transfer Time Calculator | `bandwidth-calculator` | en/zh/es | legacy | app.js, engine.js | `engine.js`; in: preset, projectName, transferFileSize, transferFileUnit, transferLinkRate, transferRateUnit, transferConcurrent, transferEfficiency +26 | ready R1 | methods, faq, history, workflow | partial | 34 inputs | engine-test.js |
| Data Center Network Convergence & Fabric Capacity Planner | `data-center-network-convergence-fabric-capacity-planner` | en/zh/es | legacy | app.js, deep-workflow.js, defaults.js, engine.js | `engine.js`; in: topology, edgeCount, portsPerEdge, portGbps, utilizationPct, concurrencyPct, allowancePct, eastWestPct +12 | ready R0 | methods, faq, refs, workflow | partial | 20 inputs | engine-test.js |
| DNS TTL & Propagation Time Calculator | `dns-ttl-propagation-calculator` | en/zh/es | legacy | app.js, engine.js | `NELToolEngine`; in: oldTtl, newTtl, elapsed, authDelay, lowerBefore, negativeTtl | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Ethernet Serialization Delay Calculator | `ethernet-serialization-delay-calculator` | en/zh/es | legacy | app.js, engine.js | `NELEthernetSerializationEngine`; in: projectName, frameBytes, ratePreset, rateGbps, hops | ready R2 | methods, faq, refs, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| IPv6 & NAT Planning Calculator | `ipv6-nat-planner` | en/zh/es | legacy | app.js, engine.js | `NELIPv6NATEngine`; in: projectName, v6Preset, v6address, v6parentPrefix, v6childPrefix, v6startIndex, v6previewCount, n44Preset +29 | ready R1 | methods, faq, refs, history, workflow | partial | 37 inputs | engine-test.js |
| MTU & MSS Calculator | `mtu-calculator` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `engine.js`; in: preset, projectName, underlayMtu, desiredInnerMtu, outerVlanTags, vlanMode, innerIp, ipExtraBytes +1 | ready R1 | methods, faq, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Network Capacity Forecast Planner | `network-capacity-forecast-planner` | en/zh/es | legacy | app.js, engine.js | `NELToolEngine`; in: capacityGbps, utilizationPct, annualGrowthPct, peakFactorPct, targetUtilizationPct, horizonYears, historyObservations | ready R0 | methods, faq, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| OOB Network Design Workshop | `oob-network-design-planner` | en/zh | legacy | app.js, engine.js | `OOBPlannerEngine`; in: sites, routers, switches, firewalls, otherConsoleDevices, criticalSites, separateIspAvailable, cellularAvailable +5 | ready R0 | methods, review | partial | not in tools-catalog; locales en/zh | engine-test.js |
| OSPF Cost Calculator | `ospf-cost-calculator` | en/zh/es | legacy | app.js, engine.js | `OspfCostEngine`; in: reference, mode, interfaces, paths | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| STP Path Cost Calculator | `stp-path-cost-calculator` | en/zh/es | legacy | app.js, engine.js | `NELStpPathCostEngine`; in: projectName, method, pathA, pathB | ready R2 | methods, faq, refs, history, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| IP Subnet Calculator | `subnet-calculator` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `engine.js`; in: ipv4Address, ipv4PrefixMode, ipv4Prefix, ipv4Mask, ipv6Address, ipv6Prefix, ipv6BasePrefix, vlsmBaseAddress +1 | ready R1 | about, methods, faq, refs, history, scenarios, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Switch Uplink Bandwidth & Oversubscription Calculator | `switch-uplink-oversubscription-calculator` | en/zh/es | legacy | app.js, engine.js | `NELToolEngine`; in: ports, portMbps, util, concurrency, overhead, uplinkMbps, uplinks, target | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| VLAN & IP Subnet Capacity Planner | `vlan-ip-capacity-planner` | en/zh/es | legacy | app.js, engine.js | `NELToolEngine`; in: users, perUser, infra, growth, maxHosts, vlanStart | ready R0* | methods, faq, refs, workflow | partial | robots string differs by locale | engine-test.js |

### C. Power / PoE / energy

| Tool | Route slug | Locales | Layout | Local JS | Engine + input ids | SEO | EN blocks | V3 | Risk / test note | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| -48V Telecom Battery Runtime Calculator | `48v-battery-runtime` | en/zh/es | legacy | app.js, engine.js | `NELBatteryEngine`; in: projectName, batteryPreset, model, nominalCellV, floatCellV, startCellV, cutoffCellV, seriesCells +14 | ready R1 | methods, faq, history, workflow | partial | 22 inputs | engine-test.js |
| Data Center Airflow & Hot-Aisle Containment Planner | `data-center-airflow-containment-planner` | en/zh/es | legacy | app.js, engine.js | `NELAirflowContainmentEngine`; in: rackCount, avgRackKW, totalItKW, headroom, supplyTemp, returnTemp, bypass, recirc +5 | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Data Center Cooling Load & Precision AC Capacity Calculator | `data-center-cooling-load-calculator` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELCoolingSizingEngine`; in: itKW, upsLoss, pduLoss, lighting, people, personW, envelope, other +5 | ready R0 | faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| DC Plant Efficiency & Rectifier Load-Sharing Analyzer | `dc-plant-efficiency-load-sharing` | en/zh/es | legacy | app.js, engine.js | `NELDCPlantAnalyzer`; in: dcVoltage, moduleRatedA, currents, acKW, redundancy, warnPct, criticalPct, targetLoad | ready R0 | faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Generator Fuel Consumption & Runtime Calculator | `generator-fuel-runtime-calculator` | en/zh/es | legacy | app.js, engine.js | `NELGeneratorFuelEngine`; in: ratedKW, ratedKVA, powerFactor, fuel0, fuel25, fuel50, fuel75, fuel100 +31 | ready R0 | methods, refs, workflow | partial | 39 inputs | engine-test.js |
| Generator + UPS Transfer & Ride-Through Planner | `generator-ups-transfer-ride-through-planner` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELGeneratorUpsRideThroughEngine`; in: criticalLoad, upsKW, upsMinutes, soc, genKW, genCount, genRedundancy, genUsable +10 | ready R0 | methods, faq, refs, workflow | partial | 18 inputs | engine-test.js |
| Network Rack Power & Cooling Calculator | `network-rack-power-cooling-calculator` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELRackEngine`; in: preset, loadW, qty, util, growth, redundancy, pf, voltage +6 | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| PoE Power Budget Calculator | `poe-power-budget-calculator` | en/zh/es | legacy | app.js, engine.js, scenarios.js | `PoeBudgetEngine`; in: preset, switchBudget, switchPorts, deviceCount, deviceWatts, standard, cableLoss, headroom | ready R1 | methods, refs, review, related, scenarios, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Ethernet Cable PoE Voltage Drop Calculator | `poe-voltage-drop-calculator` | en/zh/es | legacy | app.js, engine.js | `NELPoeDropEngine`; in: preset, lengthM, sourceV, loadW, awg, pairs, tempC, contactOhm +2 | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| PUE & Data Center Energy Efficiency Analyzer | `pue-data-center-energy-efficiency` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELPUEEngine`; in: mode, periodDays, total, it, tariff, targetPUE, cooling, ups +7 | ready R0* | methods, refs, workflow | partial | robots string differs by locale | engine-test.js |
| Telecom AC/DC Power Capacity & Breaker Sizing Calculator | `telecom-ac-dc-breaker-sizing` | en/zh/es | legacy | app.js, engine.js | `NELACDCBreakerEngine`; in: loadKW, acV, phase, pf, eff, head, der, dcV +13 | ready R0 | about, faq, refs, scenarios, workflow | partial | 21 inputs | engine-test.js |
| Telecom Rectifier & DC Power System Sizing Calculator | `telecom-rectifier-dc-power-sizing` | en/zh/es | legacy | app.js, engine.js | `NELRectifierSizingEngine`; in: dcVoltage, loadA, chargeA, moduleA, installed, redundancy, headroom, eff +3 | ready R0 | methods, faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Telecom Solar Power & Battery Sizing Calculator | `telecom-solar-battery-sizing-calculator` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELSolarEngine`; in: telecomKW, telecomHours, transportKW, transportHours, coolingKW, coolingHours, auxKW, auxHours +23 | ready R0 | methods, refs, scenarios, workflow | partial | 31 inputs | engine-test.js |
| UPS Capacity & Battery Backup Runtime Calculator | `ups-capacity-battery-runtime-calculator` | en/zh/es | legacy | app.js, deep-workflow.js, engine.js | `NELUpsSizingEngine`; in: loadKW, loadPF, headroom, eff, outPF, moduleKVA, red, installed +11 | ready R0* | methods, faq, refs, workflow | partial | robots string differs by locale; 19 inputs | engine-test.js |

### D. Wireless / link budget / other engineering

| Tool | Route slug | Locales | Layout | Local JS | Engine + input ids | SEO | EN blocks | V3 | Risk / test note | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| Transmission Ring Optimization & Protection Risk Analyzer | `transmission-ring-optimization-risk-analyzer` | en/zh/es | legacy | app.js, engine.js | `NELTransmissionRingEngine`; in: nodeCount, capacity, limit, upgrade, demands | ready R0 | faq, refs, workflow | partial | layout swap only; keep engine bytes | engine-test.js |
| Wi-Fi Coverage & Capacity Planner | `wifi-coverage-capacity-planner` | en/zh/es | legacy | app.js, engine.js | `NELWiFiPlannerEngine`; in: projectName, profilePreset, standard, band, channelWidth, spatialStreams, radiosPerAp, freqMHz +34 | ready R1 | methods, faq, refs, history, workflow | partial | 42 inputs | engine-test.js |
| Wireless Link Budget Calculator | `wireless-link-budget-calculator` | en/zh/es | legacy | app.js, engine.js | `NELWirelessLinkEngine`; in: preset, distanceKm, frequencyGHz, txPower, txCableLoss, txGain, rxGain, rxCableLoss +4 | ready R0* | methods, faq, refs, review, related, workflow | partial | robots string differs by locale | engine-test.js |

### E. Diagnostic / converter / config / non-calc

| Tool | Route slug | Locales | Layout | Local JS | Engine + input ids | SEO | EN blocks | V3 | Risk / test note | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| Multi-Vendor ACL Generator & Validator | `acl-generator-validator` | en/zh/es | legacy | acl-rule-operators.js, app.js, arista-eos.js, cisco-ios.js, engine.js, h3c-comware.js, huawei-vrp.js, ir-adapter.js, juniper-junos.js, vendor-registry.js, vrp-comware-factory.js | `NetEngineerLabAclEngine`; in: sourceVendor, targetVendor, configuration, aclName | ready R0 | about, methods, faq, refs, review, workflow | partial | multi-vendor parse/generate stack | engine-test.js |
| Data Center Architecture Decision Workshop | `data-center-architecture-decision-workshop` | en/zh | legacy | app.js, engine.js | `engine.js`; in: racks, servers, vlanCount, vrfCount, eastWestTraffic, northSouthTraffic, multiTenancy, l2Stretch +7 | ready R0 | methods, faq, refs, review, related | partial | not in tools-catalog; locales en/zh; document/generator more than a single readout | engine-test.js |
| Engineering Report & Batch Export Center | `engineering-report-batch-export-center` | en/zh/es | legacy | app.js, engine.js | `NELReportCenter`; in: reportTitle, project, owner, files, sourceText | ready R0 | faq, review, workflow | partial | document/generator more than a single readout | engine-test.js |
| IP Camera Bandwidth and PoE Planner | `ip-camera-network-planner` | en/zh | other | — | no engine.js; in: resolution, encoding, fps, count, poe, days | ready R0 | related | no | not in tools-catalog; locales en/zh; no js/engine.js | none |
| Network Asset Lifecycle Tracker | `network-asset-lifecycle-tracker` | en/zh | legacy | app.js, engine.js | `engine.js`; in: asOfDate, file, risk-filter, sort | ready R0 | methods, faq, related | partial | not in tools-catalog; locales en/zh; document/generator more than a single readout | engine-test.js |
| Network Change Planner & MOP Generator | `network-change-planner-mop-generator` | en/zh/es | legacy | app.js, engine.js | `NELNetworkChangePlanner`; in: scenarioSelect, runningConfig, deviceId, aggregateId, lagMode, member1, port1, member2 +4 | ready R0 | methods, faq, refs, review, scenarios, workflow | partial | document/generator more than a single readout | engine-test.js |
| Network Risk & Hidden-Hazard Assessment Generator | `network-risk-hidden-hazard-assessment-generator` | en/zh/es | legacy | app.js, engine.js | `NELHazardEngine`; in: — | ready R0 | methods, faq, refs, workflow | partial | document/generator more than a single readout | engine-test.js |

### Not tool-detail pages

| Path | Why it is outside the matrix |
|---|---|
| `website/tools/pon-fiber-calculators/` | Sitemap hub `tools/pon-fiber-calculators/`. en/zh/es HTML, `calculator-hub.css`, no `js/engine.js`. |
| `website/tools/switching-bandwidth-calculators/` | Sitemap hub. Same shape. |
| `website/tools/datacenter-power-calculators/` | Sitemap hub. Same shape. |
| `website/tools/route-summarization-calculator/` | `js/engine.js` and `docs/engine-test.js` only. No `index.html`, not in the catalog. |
| `website/tools/es/`, `website/tools/zh/` | Locale directory indexes, not tools. |

`ip-camera-network-planner` is listed in group E because it has en/zh HTML, but V3 fit is `no`: there is no `js/engine.js`.

Section-id mismatches (same heading may still exist): `fiber-loss` ES lacks ids `references-title` and `faq-title` that EN/ZH have, while the ES headings for references and FAQ are present. `fiber-latency-calculator` ES adds `latency-workflow-title`. `pon-splitter-loss` ES lacks `faqCplusDefault`. `optical-power-budget` ZH has extra `faqWhyCplus`.

Robots strings are not uniform. Across 157 existing locale HTML files the meta is R0 on 93, R1 on 44, and R2 on 20. Five tools differ by locale (`fiber-loss`, `pue-data-center-energy-efficiency`, `ups-capacity-battery-runtime-calculator`, `vlan-ip-capacity-planner`, `wireless-link-budget-calculator`). Phase 1 must leave those strings alone.

Every catalog tool has `docs/engine-test.js`. `package.json` does not define `test:fiber-loss`. Fiber Loss is covered by `scripts/pon-scenarios-test.js` (`CLUSTER` includes `fiber-loss`) and `scripts/tool-scenarios-test.js`.

## C. Shared V3 skeleton inventory

| Piece | Where it lives | Reuse |
|---|---|---|
| `.below` `.toc` `.prose` `.fb-fold*` `.method-defs` `.blk` `.faq` `.ref-card` | Rules are in `website/tools/optical-power-budget/css/fb-v3.css` (design cache copy: `website/design/fieldbook/fb-v3.css`). `tool-layout.css` only places `body.nel-opb-v3 > main > .below` in the grid. | Not a shared component yet. Extract or duplicate deliberately in Phase 1. Do not point other tools at the OPB file. |
| OPB production overrides | `website/tools/optical-power-budget/css/fb-v3-prod.css` (`body.nel-opb-v3` only: preview banner, header glass variables). | OPB-only. |
| Legacy tool chrome | `website/tools/optical-power-budget/css/style.css` and `css/fb.css` still linked from the V3 page. | OPB page still depends on them. Other tools keep their own `css/style.css`. |
| site-shell header | `website/assets/css/site-shell.css`. #51 switched `background` to `background-color` plus `--nel-header-background-image`, `--nel-header-backdrop`, `--nel-header-shadow`, all defaulting to `none`. | Shared and safe. Other pages stay on the old surface until they set the variables. |
| tool-layout | `website/assets/css/tool-layout.css`. Versus `ec4a1f55`, 42 added selectors contain `opb` and two added media queries do not. | Shared file, OPB-scoped rules. New tools must not rely on `nel-opb-v3` selectors. |
| tool-design-system | `website/assets/css/tool-design-system.css` also contains `nel-opb` rules. | Same constraint. |
| Scroll spy | Inside `website/tools/optical-power-budget/js/app-v3.js` (toc handling). Design cache `website/design/fieldbook/fb-v3-opb.js` repeats it. `site.js` and `tool-shell-v1.9.9-04.js` have no toc spy. | OPB-only until a small shared module exists. |
| Legacy shell behavior | `website/assets/js/tool-shell-v1.9.9-04.js` (history, CSV, stale-result clear). OPB HTML still loads it and `app-v3.js`. | Shared. Phase 1 must not double-bind history or export. |
| i18n build | `scripts/build-multilingual.js` restamps `?v=` and can rewrite tool pages. `website/data/locales.json` active set is en/zh/es. | Reuse the build. Do not add locales. A Phase 1 PR has to leave the worktree clean after a build, which is what broke OPB before #51. |
| Design cache | `website/design/fieldbook/` (`fb-v3.css`, `tool-optical-power-budget-v3.html`, `tests/count-input-guard-test.js`, merge checklists). `README.md` still says the proposal was not shipped. | Cache and reading material. Production OPB has moved past that README sentence. |
| OPB behavior | `js/app-v3.js`, `js/engine.js` (`NELOpticalPowerBudgetEngine.validate/calculate`, keys `penalty,d,a,sc,sl,cc,cl,s1,s2,s3,other,margin,tx,txMax,sens,over`). | Engine and readout stay OPB-only. |

Tests that already exist for this skeleton: `website/tools/optical-power-budget/docs/engine-test.js`, `website/tools/optical-power-budget/tests/gate4b-engine.test.js`, `website/design/fieldbook/tests/count-input-guard-test.js`, `npm run test:optical-power-budget`, and the Production Quality Gate. There is no shared "V3 layout" test that other tools can join yet.

## D. Pilot recommendation

Pilot: **Fiber Loss Calculator** (`/tools/fiber-loss/`). One tool, one PR, after this audit. Do not start that migration in this run.

Why this one:

- Structural cousin of OPB. Legacy body is `nel-tool-detail-page` / `data-nel-template="tool-detail-v1.3.1"`. EN section ids already cover scenarios, history, methodology, references, and FAQ, which map onto `.fb-fold` blocks. OPB is the only `opb-v3` page, so Fiber Loss is a real template move.
- Same domain. Engine global `NELFiberLossEngine`, exports `validate` and `calculate`. Input keys include `distance`, `attenuation`, `spliceCount`, `spliceLoss`, `connectorCount`, `connectorLoss`, `splitter1`, `splitter2`, `otherLoss`, `engineeringMargin`, `availableBudget`, `txPower`, `rxThreshold`. Result ids written by `js/app.js` include `fiberLoss`, `spliceTotal`, `connectorTotal`, `splitterOtherTotal`, `physicalLoss`, `designLoss`, `budgetRemaining`, `estimatedRxPower`, `rxMargin`, `diagnosisText`. Status values are `healthy` / `warning` / `failed`, with the same 3 dB warning band shape as OPB. Formulas stay untouched.
- Languages on disk: `index.html`, `zh/index.html`, `es/index.html`. No other locale folder.
- Test hooks: `website/tools/fiber-loss/docs/engine-test.js`, `scripts/pon-scenarios-test.js` cluster (`pon-splitter-loss`, `pon-distance`, `onu-rx-power`, `optical-power-budget`, `fiber-loss`), `scripts/tool-scenarios-test.js`. Add a `test:fiber-loss` script only if the repo pattern needs it; do not change the engine to make a test pass.
- Risk is bounded: 16 inputs, not a vendor compiler. ES is missing two ids (`references-title`, `faq-title`) even though the headings exist. `app.js` still has its own `data-i18n` pass and a legacy language toggle, so the V3 header must not add a second switcher. `tool-shell` is already loaded. Robots on ES is R1 while EN/ZH are R2; leave it.

### Phase 1 acceptance checklist

1. Only Fiber Loss page files, plus a shared skeleton extraction if one file is introduced for classes that today live under OPB. No homepage, catalog, topics, about, or privacy edits. No edits to `engine.js` bytes, defaults, or formulas.
2. EN, ZH, and ES show the same fold structure: workbench, then `.below` with `.toc` and `.prose` / `.fb-fold` for about, methodology, FAQ, references, history, and related. ES keeps existing headings; add the missing ids if the spy needs them. Do not invent paragraphs.
3. Input ids and result ids listed above still resolve. `NELFiberLossEngine.validate` / `calculate` stay the only calculator. `docs/engine-test.js` and `npm run test:pon-scenarios` pass.
4. Title, canonical, and hreflang (`en`, `zh-CN`, `es`, `x-default`) stay. Robots meta stays as committed per locale. No canonical/robots policy edit.
5. One language switcher, one history list, one export path. Scroll spy highlights the active fold on desktop and does not cover the workbench. Mobile is a single column.
6. `npm run build:i18n` leaves a clean worktree, including `?v=` stamps. That script also runs `build:config`, `build-multilingual.js`, `build:tool-navigation`, and `check:locale-ids`.
7. Browser check, desktop and mobile, for EN, ZH, and ES: preset calculate, one invalid input, history restore. Screenshot or recorded pass attached to that PR.
8. OPB production hashes and pages stay unchanged except a shared-file extraction that is proven not to move OPB screenshots.

## E. Batch plan sketch

After the Fiber Loss pilot. Branch names: `feature/tool-detail-v3-batch-0N-<slug>`. 3–5 tools. Each batch repeats the Phase 1 checklist per tool and does not change engines. Order follows the PON scenario cluster, then other optical calculators, then budget-shaped power tools, then IP, then wide forms and generators.

| Batch | Tools | Note |
|---|---|---|
| 01 | `pon-splitter-loss`, `onu-rx-power`, `pon-distance`, `otdr-event` | Rest of `pon-scenarios` CLUSTER. Same optical fold shape. |
| 02 | `fiber-latency-calculator`, `chromatic-dispersion-calculator`, `pmd-budget-calculator`, `sfp-qsfp-compatibility-calculator` | Other optical calculators. SFP has 34 inputs; split it out if the fold map does not fit. |
| 03 | `poe-power-budget-calculator`, `poe-voltage-drop-calculator`, `48v-battery-runtime`, `ups-capacity-battery-runtime-calculator` | Budget-shaped power tools. |
| 04 | `telecom-rectifier-dc-power-sizing`, `telecom-ac-dc-breaker-sizing`, `telecom-solar-battery-sizing-calculator`, `generator-fuel-runtime-calculator`, `dc-plant-efficiency-load-sharing` | Telecom power. Solar and generator-fuel have 30+ inputs. |
| 05 | `pue-data-center-energy-efficiency`, `data-center-cooling-load-calculator`, `data-center-airflow-containment-planner`, `network-rack-power-cooling-calculator`, `generator-ups-transfer-ride-through-planner` | Facilities. |
| 06 | `subnet-calculator`, `mtu-calculator`, `bandwidth-calculator`, `vlan-ip-capacity-planner`, `ipv6-nat-planner` | IP tools. IPv6 planner has 37 inputs. |
| 07 | `switch-uplink-oversubscription-calculator`, `ospf-cost-calculator`, `stp-path-cost-calculator`, `ethernet-serialization-delay-calculator`, `dns-ttl-propagation-calculator` | Switching and routing calculators. |
| 08 | `all-reduce-traffic-estimator`, `network-capacity-forecast-planner`, `data-center-network-convergence-fabric-capacity-planner`, `application-bandwidth-analyzer` | Capacity. Last item is en/zh only and not in the catalog. |
| 09 | `wifi-coverage-capacity-planner`, `wireless-link-budget-calculator`, `transmission-ring-optimization-risk-analyzer`, `odf-odn-resource-planner`, `olt-dual-uplink-transport-mse-planner` | Wider planners. Wi-Fi has 42 inputs. |
| 10 | `acl-generator-validator`, `network-change-planner-mop-generator`, `network-risk-hidden-hazard-assessment-generator` | Generators. ACL is a multi-file vendor stack; expect a thinner visual pass, not a new compiler. |
| 11 | `engineering-report-batch-export-center`, `data-center-architecture-decision-workshop`, `network-asset-lifecycle-tracker`, `oob-network-design-planner` | Non-calc or catalog-orphans with en/zh only (workshop, asset tracker, OOB). |

Hold, not in a batch until a page or engine exists: `ip-camera-network-planner` (en/zh HTML, no engine, not in catalog), `route-summarization-calculator` (engine only), and the three hubs `pon-fiber-calculators`, `switching-bandwidth-calculators`, `datacenter-power-calculators`.

## Evidence limits

- Cloudflare MCP was not authenticated. Deployment ids came from the GitHub Cloudflare Pages check on the commit, then from fetching those `*.pages.dev` URLs.
- GitHub deployment records stop at 2026-10-17 and were not used as the production pointer.
- `monitor-production` / `verify-production-build` had not finished when this file was written.
- English block tags use ids and `h2` text. Fiber Loss ES still has the references and FAQ headings, and it lacks the EN/ZH ids `references-title` and `faq-title`.

