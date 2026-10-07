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

## 0.1 长期工具规模路线图：200 Tools Master Roadmap

NetEngineerLab 将 **200 个工具**作为长期规划上限，以“**100 个高质量核心工具 + 100 个细分/长尾工具**”作为成熟站的规划结构。100 个左右代表成熟规模；200 个是长期容量上限，不是交付期限，也不是要求为了达标而新增工具。当前基线按本路线图确认时约 **37 个工具**，正式推进前仍须依据仓库工具注册表核实实际数量，并剔除重复或已废弃条目。

运营检查节点为：

```text
37 → 50 → 75 → 100 → 150 → 200
```

每个节点都是一次组合审计和规划复核，不是数量配额或发布门槛。达到节点后，按实际工具清单检查重复工具、低价值工具、SEO价值、工程价值和维护成本；根据结果决定继续扩展、合并、重做或暂停。若新增候选无法通过质量判断，可以停留在当前节点。

200 个工具的目标组合按每个工具一个主要类别统计，避免重复计数：

| 主要类别 | 规划数量 |
| --- | ---: |
| 核心工程工具 | 60 |
| 专业专项工具 | 40 |
| 设计与规划工具 | 30 |
| 诊断与验证工具 | 30 |
| 长尾 SEO 工具 | 40 |
| **合计** | **200** |

该规模路线图服从 V2.4“先深后广”的产品原则：优先把已有工具升级为完整工程任务流程，并复用共享 Engine；只有具备明确用户问题、工程价值或搜索需求，且通过重复性、维护成本及质量审查的候选，才进入开发队列。工具数量不构成独立立项理由；SEO 长尾工具也必须准确、可维护并解决具体问题。100 个和 200 个均为规划定位，不覆盖本文件“用户价值 > 工具数量；深度工具 > 普通计算器”的原则。

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

## 2. NEXT

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

## 6. 默认开发顺序

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
