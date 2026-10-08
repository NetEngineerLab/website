# NetEngineerLab — ROADMAP

> 用途：决定“下一个开发什么”。
> 与根目录 `AI_PROJECT_CONTEXT.md` 配合使用。
> 默认规则：AI 在“节约模式”下先读 Context，再读本文件，只处理 `NEXT` 或用户明确指定的任务。

## 0. Roadmap 规则

状态定义：

- `NEXT`：下一个默认开发任务，只允许一个
- `READY`：已完成产品定义，可排队开发
- `PLANNED`：方向确认，尚需完善规格
- `DONE`：已经完成
- `HOLD`：暂缓

优先级：

- `P0`：立即做
- `P1`：高价值，近期做
- `P2`：中期扩展
- `P3`：储备

排序评分维度：

1. 用户真实工程价值
2. 搜索需求
3. 专业壁垒
4. 与现有工具协同
5. 商业化潜力
6. 开发成本

**原则：用户价值 > 工具数量；深度工具 > 普通计算器。**

---

## 0.1 长期工具规模与准入基线

长期战略目标约 **200 个高质量工程工具**，容量上限 **250**；250 不是配额。候选发现池保持开放，建议工作区间为 **250–450**；达到 450 前必须完成语义去重、跨站边界审查、低价值候选淘汰和 MERGE / RETIRE 审查。工具数量不能作为立项理由。

分类必须遵循冻结的《NetEngineerLab Global Technology Radar & Tool Boundary V1.1》：6 个 Domain Groups、17 个 Core Primary Domains、3 个 Reserved Primary Domains；每个工具只能有一个 Primary Domain。未经重新审计和总工批准，不得新增 Active Primary Domain、激活 R18/R19/R20 或提高 250 容量上限。SDN 是 Architecture Tag，不是一级域；普通 RF、覆盖、MIMO 和频谱效率问题归 Wireless / RAN。

新候选先走 **分类 → 去重 → Tool Admission Gate → 排序 → Roadmap**，不得从候选清单直接进入开发。准入必须全部满足：不重复、工程问题明确、输入输出明确、核心逻辑可定义、Source / Method / Validation 可验证、符合站点边界；并至少满足两项价值门槛：明确/高频用户需求、高工程价值、SEO 价值、Tutorial / Case / Diagram 联动价值、用户复访价值、商业化潜力。去重比较问题陈述、输入、输出、核心逻辑、目标用户和主域。任何 Mandatory Gate 失败均不得进入正式 Roadmap。

**当前执行规则（Phase 0 后）**：只对 `HYPOTHESIS / UNREVIEWED / PENDING` 的未决候选继续审计。旧的 `NEXT` 规则仅适用于已完成对账、通过全部 Mandatory Gate 和至少两项 Value Gate 的候选；未满足这些条件不得排入 `NEXT` 或 `READY`。已存在工具的需求统一登记为升级任务，不得重新生成独立路线图工具。升级任务必须保留 `existing_tool_id`、`canonical_problem_id`、现有 Source / Method / Validation 证据，明确升级范围和回归验证，并在现有工具任务下跟踪。

配套《NetEngineerLab 200 Tools Master Roadmap V1.0》当前状态为 **DRAFT FOR AUDIT / NOT FROZEN**，其条目均为待 Phase 0 核验的候选，不构成已批准开发队列。先把现有工具映射到 `canonical_problem_id`、Tool ID、Primary Domain、重复/合并决策及当前 Gate；Phase 0 完成后，未实现且通过准入的条目才能排队。Reserved / Emerging 条目需逐项复核，不因列入路线图而自动开发。

### Phase 0 已有工具覆盖（开发排除清单）

以下路线图条目已在 Phase 0 明确判定为 `REJECT_DUPLICATE`，由对应现有工具作为唯一实现来源：

`TOOL-001`, `TOOL-013` → `mtu-calculator`; `TOOL-017` → `subnet-calculator`; `TOOL-021` → `ospf-cost-calculator`; `TOOL-045` → `dns-ttl-propagation-calculator`; `TOOL-054` → `optical-power-budget`; `TOOL-056` → `pon-splitter-loss`; `TOOL-063` → `onu-rx-power`; `TOOL-064` → `pon-distance`; `TOOL-100`, `TOOL-104` → `data-center-network-convergence-fabric-capacity-planner`; `TOOL-177` → `pue-data-center-energy-efficiency`; `TOOL-179`, `TOOL-180` → `ups-capacity-battery-runtime-calculator`; `TOOL-181` → `48v-battery-runtime`; `TOOL-182` → `telecom-rectifier-dc-power-sizing`; `TOOL-184` → `generator-fuel-runtime-calculator`; `TOOL-185` → `data-center-cooling-load-calculator`; `TOOL-186` → `network-rack-power-cooling-calculator`.

这些条目必须保持 `REJECT_DUPLICATE / FAIL`，不得重新排入 `NEXT`、`READY` 或开发任务。若需增强能力，应在现有工具上提交升级任务，并保留原 `existing_tool_id` 与审计证据。未列入本清单的 `HYPOTHESIS / UNREVIEWED` 条目仍不得视为已确认重复。

此前记录的约 **37 个工具**及“100 个核心 + 100 个长尾”的规划口径仅作历史记录；新附件按约 40 个现有工具要求 Phase 0 对账，正式基线以实际注册表映射结果为准。旧的数量节点和类别配额不作为当前开发门槛。

优先继续提升已有工具深度、工程可信度和工作流完成度；候选 roadmap 只有在通过上述门禁后才能影响 `NEXT` / `READY` 状态。

---

## 0.2 200 Tools 专项审计结论（2026-10-07）

本轮依据附件中的 200 Tools Roadmap V1.0、Technology Radar V1.1，以及仓库当前 `src/registry/tool-registry.json` 执行只读审计。结论为 **HOLD / NOT PASS**：路线图仍可作为候选池，但不得把任何未完成对账的条目设置为 `NEXT`、`READY` 或开发任务。当前矩阵计数为 200 条：19 条 `REJECT_DUPLICATE / FAIL`、181 条 `UNREVIEWED / NOT_STARTED`，没有准入 `PASS`。

| 审计项 | 证据 | 结论 |
| --- | --- | --- |
| 现有工具基线 | 注册表有 40 个 `active` 工具；Phase 0 已覆盖全部 40 个工具，并确认 19 个路线图重复项 | 40→200 对账已部分关闭；其余候选仍需审计 |
| 重复/低价值拆分 | 至少约 20 个高风险重叠族，含 PON Splitter、PON Distance、ONU RX、DNS TTL、OSPF Cost、PUE、Generator Runtime、Cooling Load、Transmission Ring、OLT Dual-Uplink、DC Fabric 等 | 必须逐项 KEEP / MERGE / REJECT_DUPLICATE |
| Phase 排序 | Phase A/B/C/D = 51/53/41/55；P1/P2/P3/P4 同步对应 | 缺少依赖、用户价值和 Gate 证据，不能视为已排序 |
| Reserved / Future | 三个 Reserved 域（Telecom Core、Space/NTN、6G）共 11 项；加上 Radar 中的 Quantum 活跃域 3 项，未来技术类合计 14/200（7%），全部 D/P4 | 总占比可控，但不得自动开发；Quantum 是 Core Primary Domain，不属于 Reserved 域；其 3 项仍需按成熟度与准入门槛逐项评估 |
| 跨站边界 | Automation、Power/Cooling、Cloud/Cloud-Native、通用报告/批处理存在跨站风险 | 必须保留 network-specific 证据并完成跨站决策 |

在 Phase 0 结束前，路线图审计矩阵至少必须逐条记录：`roadmap_id`、`existing_tool_id`、`canonical_problem_id`、problem fingerprint（problem / inputs / outputs / core_logic / target_user / primary_domain）、`overlap_decision`、`gate_status`、Source / Method / Validation 证据、`cross_site_decision`、审核责任人和版本日期。当前矩阵已形成可检查的 40→200 对账产物：19 个重复项已确认并排除新开发，其余候选仍需补齐证据；Tool Admission Gate 仍不是自动通过。

Phase 0 矩阵现已建立；2026-10-08 当前状态证据见 `docs/PHASE0_CURRENT_STATUS_2026-10-08.md`。该证据记录不授予新的开发授权：

- [`docs/roadmap/PHASE0_AUDIT_MATRIX.csv`](docs/roadmap/PHASE0_AUDIT_MATRIX.csv)：200 条路线图候选主表。
- [`docs/roadmap/PHASE0_EXISTING_TOOL_CROSSWALK.csv`](docs/roadmap/PHASE0_EXISTING_TOOL_CROSSWALK.csv)：40 个 active 工具覆盖表。
- [`docs/roadmap/PHASE0_AUDIT_MATRIX_README.md`](docs/roadmap/PHASE0_AUDIT_MATRIX_README.md)：字段、状态和填表规则。

矩阵建立不等于准入通过；已确认重复项按 `EXISTING / COVERED / REJECT_DUPLICATE` 管理并排除新开发，尚未完成审计的候选继续保持 `PENDING` / `UNREVIEWED` / `NOT_STARTED`。

下一步顺序固定为：**完成 40 个现有工具映射 → 处理高风险重复族 → 补齐跨站决策与 Gate 证据 → 依据依赖/价值/成熟度重排 Phase → 才能重新评估 `NEXT`**。

---

## 1. 当前阶段目标

从“单个网络计算器集合”升级为：

**计算 → 风险分析 → 设计方案 → 工程报告/MOP → 批量处理/工作流**

优先形成几个专业工具集群：

- 数据中心网络设计
- 接入网 / OLT
- 传输网络
- 网络变更与风险
- 通信能源与机房基础设施

---

## 2. 当前开发授权状态

**当前没有获准开发的 `NEXT` 工具。** 本文件旧版的默认顺序属于历史规划，不构成当前授权；不得据此启动 MIB/OID Engine、UI、Registry 或其他工具开发。当前可执行工作仅限本文件记录的 Phase 0 未决候选审计，以及 MIB/OID 文档级前置门禁与记录准备；实际逐文件 source/acquisition/license review、网络读取及 MIB 正文采集，须先具备有效具名预授权并完成相应审核，不能由本条文字自行授权。新开发任务须待相关 Gate 证据通过、审核签署，并由用户明确授权后另行写入唯一 `NEXT`。

### 已完成的历史 NEXT（非当前授权）

### [x] PUE & Data Center Energy Efficiency Calculator
- 状态：`DONE`
- 优先级：`P0`
- 用户：数据中心、通信机房运维/规划人员
- 核心输出：PUE、IT负载、基础设施损耗、能效等级、优化提示
- 升级方向：历史对比、成本测算、节能报告、批量机房分析
- 价值：高
- 开发难度：低~中
- 开发原则：不能只做 `总能耗 ÷ IT能耗`，必须给出工程解释和改善路径

---

## 3. P1 — 高优先级队列

### [x] Telecom AC/DC Power Capacity & Breaker Sizing
- 状态：`DONE`
- 优先级：`P0`
- 原工具已存在，下一轮升级：场景、N-1、压降/保护风险与专业报告

### [x] Telecom Rectifier & DC Power Sizing
- 状态：`DONE`
- 优先级：`P0`
- 下一项深度升级：负载增长/回充峰值/模块故障场景，N-1/N-2、机框上限、环境降额与方案报告

### [x] Telecom Rectifier & DC Power Sizing — N-1/N-2 Scenario Upgrade
- 状态：`DONE`
- 优先级：`P0`
- 目标：加入负载增长、回充峰值、模块故障、N-1/N-2、机框上限和环境降额场景，并生成可追溯方案报告

### [x] UPS Capacity & Battery Runtime Calculator
- 状态：`DONE`
- 优先级：`P0`
- 下一项深度升级：负载场景、UPS旁路/故障、N+1、功率因数、放电降额、Before/After与工程报告

### [x] Data Center Cooling Load & Precision AC Sizing Calculator
- 状态：`DONE`
- 优先级：`P0`
- 下一项深度升级：IT/非IT负载分层、峰值与冗余空调、环境工况、失效场景、Before/After与工程报告

### [x] Data Center Airflow & Containment Planner
- 状态：`DONE`
- 优先级：`P0`
- 下一项深度升级：冷热通道、风量/静压、机柜峰值、封闭率、旁路气流、失效场景、Before/After与工程报告

### [ ] Power/Cooling 深度升级计划
- 状态：`PLANNED`
- 准入边界：仅作为现有工具升级任务登记，不新增重复的独立工具。
- 目标：把热负荷、气流、环境降额、静压阻力、风机能耗和 TCO 串成可追溯的机房基础设施分析工作流。
- 任务 1｜`network-rack-power-cooling-calculator`：扩展热负荷、机柜功率密度、制冷量、BTU/h、冷吨、成本和 N+1 场景联动。
- 任务 2｜`data-center-cooling-load-calculator`：补充机房级 IT/非 IT 负载分层、峰值工况、冗余制冷和环境降额。
- 任务 3｜`data-center-airflow-containment-planner`：补充风量平衡、温升（ΔT）、冷热通道、旁路气流、静压和风管阻力校核。
- 任务 4｜跨工具环境修正模型：增加海拔、温度和空气密度修正，输出通信机房设备与制冷能力降额；必须补齐 Source / Method / Validation 证据。
- 任务 5｜`pue-data-center-energy-efficiency` 联动：增加风机功率、静压、运行小时、电价、年度能耗/TCO 以及 Before/After 方案比较。
- 排序建议：先完成任务 1–3 的现有工具升级，再做任务 4 的环境修正，最后做任务 5 的跨工具能效与 TCO 联动。
- Gate 要求：每项升级必须保留 `existing_tool_id`、`canonical_problem_id`、升级范围、公式来源、验证用例和回归结果；未补齐证据前不得提升为 `NEXT` 或 `READY`。

### [x] Communication Solar Power & Battery Planner
- 状态：`DONE`
- 优先级：`P1`
- 场景：通信站点光伏供电
- 输出：负载、日耗电、光伏容量、电池容量、日照影响、冗余建议
- 协同：机房能耗、电源保障、后备电源

### [x] Generator Fuel Consumption & Backup Runtime Planner
- 状态：`DONE`
- 优先级：`P1`
- 场景：通信机房油机保障
- 输出：负载率、预计油耗、库存可支撑时长、补油时间、保障风险
- 升级：多机房批量应急保障台账

### [x] Transmission Ring Optimization & Risk Analyzer
- 状态：`DONE`
- 优先级：`P1`
- 场景：OTN/PTN/IPRAN/MSTP/SDH/分组传送网络
- 输出：环结构、容量、拥塞段、保护风险、N-1、拆环/并环建议
- 价值：极高
- 专业壁垒：极高
- 备注：应做深度工具，不做简单节点统计器

### [x] OLT Dual Uplink & Transport Resource Planner
- 状态：`DONE`
- 优先级：`P1`
- 场景：OLT双上联、传输波道、MSE端口资源规划
- 输出：上联带宽、保护、波道、端口需求、瓶颈与冗余
- 协同：接入网容量规划工具集

### [x] Network Risk / Hidden Hazard Assessment Generator
- 状态：`DONE`
- 优先级：`P1`
- 场景：机房、电源、ODF、光缆、网络设备等隐患判断
- 输出：隐患等级、风险说明、规范依据、整改建议、检查报告
- 商业化：专业模板、批量台账、报告导出

---

## 4. P2 — 专业工具集群扩展

### [x] Data Center Network Convergence & Fabric Capacity Planner
- 状态：`DONE`
- 优先级：`P2`
- 能力：Leaf-Spine、Access-Aggregation-Core、多层收敛、Spine N-1、东西/南北向流量

### [x] Switch Uplink Capacity & Oversubscription Planner
- 状态：`DONE`
- 优先级：`P2`
- 能力：接入端口、上联容量、Oversubscription、峰值利用率、冗余

### [x] Optical Power / Fiber Link Engineering Suite
- 状态：`DONE`
- 优先级：`P2`
- 方向：光功率预算、光衰、链路损耗、分光、余量、异常判断

### [x] Network Capacity Forecast Planner
- 状态：`DONE`
- 优先级：`P2`
- 输出：当前利用率、增长趋势、扩容临界点、扩容时间建议

### [x] Network Capacity Forecast Planner — Historical Trend Validation
- 状态：`DONE`
- 优先级：`P2`
- 作用：支持导入多期忙时测量数据，核验增长假设并对比预测偏差
- 验收重点：数据周期和单位校验、缺失/异常点提示、趋势说明及可追溯预测报告

### [x] Engineering Report / Batch Export Center
- 状态：`DONE`
- 优先级：`P2`
- 作用：把多个工具结果统一生成工程报告、MOP、检查表和台账
- 商业化价值：高

---

## 5. 已完成 / 已存在能力

> 开发前必须以仓库当前代码和工具注册表核验，避免重复开发。

- [x] Network Change Planner & MOP Generator
- [x] 已有网络工程计算/分析工具集合
- [x] 多语言基础
- [x] SEO / GEO 基础设施
- [x] 工具页统一化工作已持续推进
- [x] 自动审计脚本体系已建立

---

## 6. 历史默认开发顺序（不构成授权）

以下顺序为旧规划记录；其中条目不得仅因列在此处而开工，须先完成 Phase 0 对账与 Tool Admission Gate，并取得明确任务授权。

```text
PUE
↓
通信光伏与电池
↓
油机油耗与保障时长
↓
传输环优化与风险
↓
OLT双上联与传输资源
↓
隐患判定/报告
↓
专业工具集群深化
↓
批量报告与商业化能力
```

---

## 7. 完成一个工具后的操作

完成并通过 2号/3号验收后：

1. 将当前 `[ ]` 改为 `[x]`
2. 状态改为 `DONE`
3. 从 P1/P2 中选择最高价值的下一项
4. 将其状态改为 `NEXT`
5. 保证全文件始终只有一个 `NEXT`
6. 不删除已完成历史
7. 若实际仓库已有该工具，直接核验后标记 DONE，不重复开发

---

## 8. AI 调用方式

用户：

`NetEngineerLab，节约模式，开发下一个工具。`

AI：

**读 `AI_PROJECT_CONTEXT.md` → 读本 ROADMAP → 找唯一 `NEXT` → 检查仓库是否已存在 → 只读取必要文件和模板 → 开发 → 测试 → Diff 审计 → 更新 ROADMAP。**
