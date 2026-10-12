# 已有工具覆盖项审计归档

归档日期：2026-10-12。以下 21 项已移出新工具开发候选清单；原始 Phase 0 审计矩阵保留全部 200 条记录及审核证据。这里的 FAIL 表示新工具准入因重复被拒绝，不表示现有工具测试失败。

### Phase 0 已有工具覆盖（开发排除清单）

以下路线图条目已在 Phase 0 明确判定为 `REJECT_DUPLICATE`，由对应现有工具作为唯一实现来源：

`TOOL-001` → `mtu-calculator`; `TOOL-002` → `poe-power-budget-calculator`; `TOOL-003` → `switch-uplink-oversubscription-calculator`; `TOOL-013` → `mtu-calculator`; `TOOL-017` → `subnet-calculator`; `TOOL-021` → `ospf-cost-calculator`; `TOOL-045` → `dns-ttl-propagation-calculator`; `TOOL-054` → `optical-power-budget`; `TOOL-056` → `pon-splitter-loss`; `TOOL-063` → `onu-rx-power`; `TOOL-064` → `pon-distance`; `TOOL-100`, `TOOL-104` → `data-center-network-convergence-fabric-capacity-planner`; `TOOL-177` → `pue-data-center-energy-efficiency`; `TOOL-179`, `TOOL-180` → `ups-capacity-battery-runtime-calculator`; `TOOL-181` → `48v-battery-runtime`; `TOOL-182` → `telecom-rectifier-dc-power-sizing`; `TOOL-184` → `generator-fuel-runtime-calculator`; `TOOL-185` → `data-center-cooling-load-calculator`; `TOOL-186` → `network-rack-power-cooling-calculator`.

这些条目必须保持 `REJECT_DUPLICATE / FAIL`，不得重新排入 `NEXT`、`READY` 或开发任务。若需增强能力，应在现有工具上提交升级任务，并保留原 `existing_tool_id` 与审计证据。未列入本清单的 `HYPOTHESIS / UNREVIEWED` 条目仍不得视为已确认重复。

