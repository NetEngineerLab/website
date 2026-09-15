# NetEngineerLab V2.4 深度工具与工程工作流开发规范

**版本：V2.4**  
**定位：Engineering Decision & Workflow Platform**  
**核心原则：Don't Build Tools. Complete Jobs.**  
**中文原则：不要只做工具，要帮助工程师把事情做完。**

---

## 1. V2.4 产品目标

NetEngineerLab 下一阶段不再以“增加工具数量”为第一目标。

V2.4 正式从：

> Professional Network Engineering Tools

升级为：

> **Engineering Decision & Workflow Platform**

用户来到 NetEngineerLab，不只是为了：

- 算一个数；
- 查一个参数；
- 生成一个配置；
- 查看一个结果。

而是为了完成真实工程任务，例如：

- 设计一套 PON 网络；
- 对 OLT 扩容进行资源规划；
- 判断数据中心 Fabric 是否存在带宽瓶颈；
- 对网络变更生成完整 MOP；
- 判断传输环是否存在 N-1 风险；
- 规划 UPS、油机、电池和机房电力；
- 比较两个设计方案；
- 输出可以直接拿去讨论、实施或归档的工程成果。

---

## 2. V2.4 最高产品原则

以后所有工具开发必须通过以下问题：

> **用户完成这个页面以后，事情完成了吗？**

如果答案只是：

> “他得到了一个数。”

则不算完成。

如果答案是：

> “他知道正常还是异常。”

仍然只完成一部分。

真正的完整产品应该做到：

```text
用户问题
↓
输入真实数据
↓
工程计算
↓
状态判断
↓
原因解释
↓
风险定位
↓
方案建议
↓
方案比较
↓
故障模拟
↓
最终推荐
↓
工程交付物
↓
下一步任务
```

---

## 3. NetEngineerLab 新的产品层级

V2.4 将所有能力分成五层。

### L1 Search Utility

解决一个很具体的小问题。

主要作用：

- SEO入口；
- GEO入口；
- 长尾搜索；
- 快速解决简单问题。

例如：

- dBm ↔ mW；
- CIDR；
- MTU；
- VLAN；
- DNS TTL；
- Fiber Loss；
- PoE；
- Cable Loss。

特点：

> 高频、简单、免费。

---

## 4. L2 Engineering Calculator

不仅给结果，还需要具有完整工程模型。

最低输出：

```text
Calculation
+
Assumptions
+
Units
+
Engineering Limits
+
Pass / Warning / Fail
```

例如：

Fiber Loss 不应该只是：

> Total Loss = 17.3 dB

而应该进一步告诉用户：

```text
Total Loss
17.3 dB

Available Budget
21 dB

Engineering Margin
3.7 dB

Status
PASS

Main Loss Contributor
Splitter

Risk
Low
```

---

## 5. L3 Engineering Analyzer

Analyzer 必须回答：

> **为什么？**

基础结构：

```text
Result
↓
Diagnosis
↓
Root Cause
↓
Risk
↓
Recommendation
```

例如：

不是：

> Uplink Utilization = 94%

而是：

```text
Current Utilization
94%

Status
HIGH RISK

Primary Risk
Single-uplink utilization exceeds recommended design threshold.

N-1 Result
FAIL

If one uplink fails:
Projected utilization = 188%

Recommended Options

Option A
Upgrade 2 × 10G → 2 × 25G

Option B
Add 2 additional 10G links

Option C
Redistribute access load
```

---

## 6. L4 Engineering Planner

Planner 必须帮助用户进行：

> **设计与方案选择。**

结构：

```text
Requirement
↓
Constraints
↓
Capacity Calculation
↓
Topology
↓
Resource Requirement
↓
Redundancy
↓
Failure Simulation
↓
Alternative Designs
↓
Recommended Design
```

最终输出：

> 推荐方案。

而不是只有：

> 计算结果。

---

## 7. L5 Engineering Workflow

这是 NetEngineerLab V2.4 最核心的一层。

Workflow 的目标：

> **完成一个真实工程任务。**

例如：

```text
Plan OLT Expansion
```

不是一个工具。

而是一整套任务：

```text
Subscriber Forecast
↓
PON Capacity
↓
OLT Capacity
↓
Uplink Capacity
↓
Transport Channels
↓
MSE Ports
↓
N-1 Simulation
↓
Resource Gap
↓
Recommended Design
↓
BOM
↓
Engineering Report
```

---

## 8. 新增核心架构：Job Graph

在现有 Tool Registry 上增加：

```text
Job Registry
```

以及：

```text
Job Graph
```

结构：

```text
JOB
│
├── Step
│   ├── Tool
│   ├── Rule
│   └── Validation
│
├── Step
│   ├── Tool
│   ├── Rule
│   └── Validation
│
└── Deliverable
```

示例：

```text
JOB:
Plan OLT Expansion

STEP 01
Traffic Requirement

STEP 02
PON Capacity

STEP 03
OLT Capacity

STEP 04
Uplink Capacity

STEP 05
Transport Capacity

STEP 06
MSE Capacity

STEP 07
N-1 Failure Simulation

STEP 08
Risk Assessment

STEP 09
Recommended Design

STEP 10
Engineering Report
```

---

## 9. V2.4 十大 Hero Tools

下一阶段暂停盲目扩张普通计算器。

优先把以下工具做到行业级深度。

### Hero Tool 01 — Network Change Planner & MOP Generator

这是当前 NetEngineerLab 最重要的产品原型。

完整流程：

```text
Running Config
↓
Parse
↓
Current State
↓
Desired Intent
↓
Semantic Diff
↓
Minimal Delta
↓
Risk Analysis
↓
Pre-check
↓
Implementation
↓
Verification
↓
Rollback
↓
Post-check
↓
MOP
```

必须新增：

#### Change Risk Score

例如：

```text
Risk Score: 72 / 100
Risk Level: HIGH
```

来源：

- 业务影响；
- 设备数量；
- 接口数量；
- 路由变化；
- VLAN变化；
- 冗余程度；
- Rollback难度；
- 维护窗口。

#### Failure Preview

提前告诉用户：

> 如果配置错误，会发生什么。

#### Blast Radius

例如：

```text
Potential Impact

2 switches
8 VLANs
124 access ports
3 uplinks
2 critical services
```

最终输出：

- MOP；
- CLI；
- Rollback；
- Verification Commands；
- Change Risk；
- PDF；
- Printable Runbook。

---

### Hero Tool 02 — OLT Dual Uplink / Transport / MSE Planner

目标：

> 从“端口计算器”升级为运营商接入扩容设计器。

输入：

- OLT数量；
- PON口；
- 用户数；
- 单用户带宽；
- 并发率；
- 上联速率；
- 上联数量；
- 传输保护模式；
- 波道容量；
- MSE端口；
- 冗余模式。

完整输出：

```text
User Traffic
↓
OLT Traffic
↓
Uplink Requirement
↓
Transport Requirement
↓
MSE Requirement
↓
N-1
↓
Bottleneck
↓
Resource Gap
↓
Recommended Architecture
```

必须增加：

#### Growth Forecast

```text
Current subscribers
6,800

12-month forecast
8,200

24-month forecast
10,100
```

告诉用户：

> 当前方案还能支撑多久。

---

### Hero Tool 03 — Transmission Ring Optimization & Risk Analyzer

必须建立：

```text
Current Ring
↓
Traffic Matrix
↓
Protection Model
↓
Link Utilization
↓
Node Risk
↓
N-1 Matrix
↓
Worst Failure
↓
Optimization
↓
Before / After
```

必须输出：

#### Worst Case Failure

```text
Failure:
Node 04 — Node 05

Affected Traffic:
16.3 Gbps

Protection Path Utilization:
112%

Result:
FAIL
```

#### Optimization Proposal

给出：

- 拆环；
- 并环；
- 调业务；
- 扩容量；
- 修改保护路径。

---

### Hero Tool 04 — Data Center Fabric Capacity Planner

定位：

> Leaf-Spine工程设计工具。

输入：

- Servers；
- NIC；
- Access Rate；
- Leaf；
- Spine；
- Uplink；
- Oversubscription；
- East-West Traffic；
- North-South Traffic。

输出：

```text
Server Capacity
↓
Leaf Capacity
↓
Spine Capacity
↓
Oversubscription
↓
East-West Load
↓
North-South Load
↓
N-1
↓
Bottleneck
↓
Expansion Point
```

必须增加：

#### Growth Planning

```text
Current
512 servers

Recommended maximum
720 servers

Expansion trigger
640 servers
```

---

### Hero Tool 05 — AI / GPU Cluster Network Planner

这是 NetEngineerLab V2.4 新的战略工具。

输入：

- GPU Type；
- GPU Count；
- GPUs / Server；
- NIC数量；
- NIC速率；
- Rail数量；
- Leaf数量；
- Spine数量；
- 400G / 800G / 1.6T；
- Oversubscription。

输出：

```text
GPU Cluster
↓
NIC Requirement
↓
Leaf Requirement
↓
Spine Requirement
↓
Port Requirement
↓
Optics
↓
Bandwidth
↓
Oversubscription
↓
N-1
↓
Recommended Fabric
```

后续逐步扩展：

- Ethernet；
- InfiniBand；
- RoCE；
- Rail Optimized；
- GPU Fabric。

---

### Hero Tool 06 — Optical / PON Design Planner

把目前分散的：

- Fiber Loss；
- Optical Power Budget；
- Splitter Loss；
- Reach；
- OLT；
- ONU；

组合起来。

最终：

```text
OLT
↓
ODN
↓
Splitter
↓
Fiber
↓
Connector
↓
Splice
↓
ONU
↓
Optical Margin
↓
Reach
↓
Risk
```

支持：

> What-if。

例如：

```text
1:64
Margin = 1.8 dB
Warning

1:32
Margin = 5.2 dB
Recommended
```

---

### Hero Tool 07 — Critical Power Planner

整合：

- PUE；
- UPS；
- Battery；
- Generator；
- Telecom DC；
- Runtime；
- Fuel；
- Solar。

输入：

```text
IT Load
Runtime
Redundancy
Battery
Generator
PUE
Fuel
```

输出：

```text
IT Load
↓
Facility Load
↓
UPS
↓
Battery
↓
Generator
↓
Fuel
↓
Runtime
↓
N+1
↓
Failure Scenario
```

最终回答：

> 这套供电系统能否支撑设计目标。

---

### Hero Tool 08 — Network Capacity & Oversubscription Planner

升级为：

```text
Traffic Model
↓
Access
↓
Aggregation
↓
Core
↓
Oversubscription
↓
Peak Traffic
↓
Growth
↓
N-1
↓
Expansion Trigger
```

最终告诉用户：

> 什么时候应该扩容。

---

### Hero Tool 09 — Routing Change Risk Analyzer

输入：

- Route Table；
- Planned Route；
- Prefix；
- Metric；
- Preference；
- Next Hop。

分析：

```text
Longest Prefix Match
↓
Conflict
↓
Overlap
↓
Blackhole
↓
Asymmetric Routing
↓
Default Route Risk
↓
Change Impact
```

最终输出：

> 可以上线 / 有风险 / 不建议上线。

---

### Hero Tool 10 — Network Design Review

用户提供：

```text
Topology
+
Capacity
+
Redundancy
+
Traffic
+
Equipment
```

输出：

```text
Architecture Score

Capacity Score
Redundancy Score
Availability Score
Scalability Score
Operations Score

↓

Critical Issues
↓

Recommended Improvements
```

最终形成：

> Network Design Review Report。

---

## 10. V2.4 五条 Hero Workflows

### Workflow 01 — FTTH / PON Network Design

入口：

> Design a PON network

步骤：

```text
Subscriber Requirement
↓
PON Port Requirement
↓
Splitter Design
↓
Optical Budget
↓
ODN Loss
↓
OLT Requirement
↓
Uplink Capacity
↓
Transport
↓
MSE
↓
N-1
↓
BOM
↓
Engineering Report
```

---

### Workflow 02 — OLT Expansion Planning

入口：

> Expand an existing OLT network

步骤：

```text
Current Capacity
↓
Current Users
↓
Traffic Growth
↓
PON Capacity
↓
OLT Capacity
↓
Uplink
↓
Transport
↓
MSE
↓
Resource Gap
↓
Upgrade Plan
```

---

### Workflow 03 — Network Change Workflow

入口：

> Plan a network change

步骤：

```text
Current Config
↓
Desired State
↓
Diff
↓
Risk
↓
Pre-check
↓
MOP
↓
CLI
↓
Rollback
↓
Verification
↓
Acceptance
```

---

### Workflow 04 — Data Center Fabric Design

入口：

> Design a data center network

步骤：

```text
Servers
↓
Traffic
↓
Access
↓
Leaf
↓
Spine
↓
Oversubscription
↓
N-1
↓
Optics
↓
Ports
↓
Expansion
↓
BOM
```

---

### Workflow 05 — Critical Power & Resilience Design

入口：

> Design backup power

步骤：

```text
IT Load
↓
Facility Load
↓
UPS
↓
Battery
↓
Generator
↓
Fuel
↓
Runtime
↓
N+1
↓
Failure Scenario
↓
Recommended Design
```

---

## 11. 深度工具统一的 8 层价值模型

### Level 1 — Input

必须让用户容易输入真实工程情况。

禁止：

- 参数含义不清；
- 单位不清；
- 默认值无来源。

### Level 2 — Calculate

必须：

- 可重复；
- 可验证；
- 单位正确；
- 公式明确。

### Level 3 — Diagnose

结果必须分类：

```text
PASS
WARNING
FAIL
INCONCLUSIVE
```

### Level 4 — Explain

解释：

> 为什么得到这个结果。

### Level 5 — Recommend

告诉用户：

> 应该怎么办。

必须区分：

```text
Recommended
Alternative
Not Recommended
```

### Level 6 — Simulate

至少支持一种：

```text
What-if
Scenario Comparison
Failure Simulation
Growth Simulation
N-1
```

### Level 7 — Deliver

至少生成一种真正能用的工程成果：

- PDF；
- CSV；
- MOP；
- BOM；
- Configuration；
- Report；
- Runbook；
- Checklist。

### Level 8 — Continue

任何 Hero Tool 都不允许成为死胡同。

必须明确：

```text
Next Recommended Step
```

---

## 12. 统一结果页面结构

### 01 Executive Result

第一页最上面必须直接回答：

> 行不行？

### 02 Key Numbers

只显示 5～8 个最关键数字。

### 03 Diagnosis

告诉用户：

> 问题在哪里。

### 04 Why

解释原因。

### 05 Risk

告诉用户：

> 不处理会怎样。

### 06 Recommendation

明确建议。

### 07 Alternatives

显示 A/B/C 方案。

### 08 Simulation

展示：

> 如果改，会怎样。

### 09 Deliverable

允许：

> Download / Print / Export。

### 10 Next Step

告诉用户：

> 下一步做什么。

---

## 13. Engineering Evidence

所有重要结果都必须能够回答：

> 你凭什么这么判断？

增加：

```text
Engineering Evidence
```

内容包括：

- Formula；
- Assumption；
- Rule；
- Threshold；
- Standard；
- Vendor reference；
- Last reviewed。

禁止 AI 凭空生成工程判断。

---

## 14. Deterministic First

NetEngineerLab 核心原则：

> **确定性工程规则优先，AI辅助解释。**

结构：

```text
User Input
↓
Canonical Model
↓
Calculation Engine
↓
Rule Engine
↓
Simulation Engine
↓
Structured Result
↓
AI Explanation
```

AI可以：

- 解释；
- 总结；
- 报告；
- 自然语言输入；
- 下一步建议。

AI不能替代：

- 数学；
- 容量计算；
- 协议逻辑；
- N-1；
- Rule判断。

---

## 15. 新增 Outcome Engine

V2.4 底层建议增加：

```text
Tool Registry
+
Job Registry
+
Workflow Registry
+
Rule Engine
+
Simulation Engine
+
Recommendation Engine
+
Deliverable Engine
```

最终成为：

```text
Outcome Engine
```

---

## 16. Tool Registry 新增字段

建议增加：

```text
toolLevel

utility
calculator
analyzer
planner
workflow
```

增加：

```text
supportedJobs[]
```

例如：

```text
supportedJobs:
- design-pon
- expand-olt
```

增加：

```text
nextTools[]
inputContext[]
outputContext[]
```

---

## 17. Workflow Context

用户输入一次：

```text
Project Context
```

例如：

```text
Project
Nanning FTTH Expansion

Subscribers
8200

Growth
15%

OLT Vendor
Huawei

Uplink
10G

Redundancy
Dual
```

以后进入其他工具：

> 自动读取这些数据。

禁止要求用户重复填写。

---

## 18. Project Workspace

后期增加：

```text
Project
│
├── Inputs
├── Designs
├── Scenarios
├── Results
├── Reports
├── MOP
├── BOM
└── History
```

---

## 19. Scenario Compare

所有 Planner 类工具必须尽量支持：

```text
Scenario A
Scenario B
Scenario C
```

比较：

- Capacity；
- N-1；
- Growth；
- Cost；
- Complexity；
- Risk。

最后：

> Recommended Scenario。

---

## 20. Risk Score Framework

建议建立统一：

```text
0–20    Low
21–40   Moderate
41–60   Elevated
61–80   High
81–100  Critical
```

每个 Domain 拥有自己的 Risk Model。

---

## 21. Before / After

所有优化类工具必须尽量显示：

```text
Current
vs
Recommended
```

例如：

```text
Current

Peak Utilization
96%

N-1
FAIL

Growth Headroom
4 months


Recommended

Peak Utilization
51%

N-1
PASS

Growth Headroom
36 months
```

---

## 22. “So What?” 强制规则

任何输出后必须经过：

> So What Test

错误：

```text
PUE = 1.57
```

正确：

```text
PUE
1.57

Status
Acceptable

Facility Overhead
57%

Largest Opportunity
Cooling efficiency

If improved to 1.40
Estimated facility power reduction:
10.8%
```

---

## 23. “What Next?” 强制规则

页面结束前必须回答：

> What should I do next?

例如：

```text
Next Recommended Actions

1. Check N-1 resilience
2. Compare upgrade options
3. Generate engineering report
```

---

## 24. Hero Tool 质量标准

每一个 Hero Tool 必须达到：

- Functional；
- Engineering；
- Decision；
- Recommendation；
- Simulation；
- Deliverable；
- Workflow；
- SEO；
- GEO；
- Mobile；
- Accessibility。

---

## 25. Hero Tool 用户价值评分

### Problem Value — 20分
### Result Value — 20分
### Decision Value — 15分
### Action Value — 15分
### Engineering Depth — 15分
### Deliverable Value — 10分
### Workflow Value — 5分

发布标准：

```text
<80
不得列为 Hero Tool

80–89
可以发布

90–94
重点工具

≥95
Flagship Tool
```

---

## 26. 用户行为指标

必须统计：

```text
Tool View
↓
Tool Start
↓
Input Complete
↓
Calculation
↓
Diagnosis Viewed
↓
Recommendation Viewed
↓
Scenario Compared
↓
Export
↓
Next Step
↓
Return Visit
```

---

## 27. 核心指标

NetEngineerLab 新的北极星指标：

# Completed Engineering Jobs

辅助指标：

```text
Task Start Rate
Task Completion Rate
Recommendation View Rate
Scenario Compare Rate
Export Rate
Next-Step Rate
Return Rate
```

---

## 28. 首页重构原则

首页第一问题：

# What are you trying to do?

下面：

```text
Design a Network
Plan Capacity
Troubleshoot a Problem
Prepare a Network Change
Design Fiber / PON
Plan Data Center Fabric
Plan Backup Power
```

同时保留：

> Browse individual tools

形成任务入口 + 工具入口双入口。

---

## 29. 内容战略

文章重点围绕：

```text
Engineering Question
+
Tool
+
Real Example
+
Decision
```

例如不要只写：

> What Is Oversubscription?

而写：

> How Much Oversubscription Is Safe in a Leaf-Spine Network?

文章中：

解释  
↓  
Example  
↓  
Calculator  
↓  
Planner。

---

## 30. SEO 页面战略

形成：

```text
Topic
↓
Guide
↓
Calculator
↓
Planner
↓
Workflow
```

例如：

```text
PON Optical Budget Guide
↓
Optical Budget Calculator
↓
PON Design Planner
↓
FTTH Design Workflow
```

---

## 31. GEO / AI Search

每个 Hero 页面必须明确包含：

```text
What this tool does
When to use it
Inputs
Outputs
Engineering formula
Assumptions
Example
Limits
FAQ
Sources
Last reviewed
```

---

## 32. 商业化结构

### Free

- Utility；
- Calculator；
- 基本 Analyzer；
- 简单 Scenario；
- 基本结果。

### Engineer Pro

未来提供：

- Projects；
- History；
- Scenario Library；
- Advanced Simulation；
- PDF；
- BOM；
- Full MOP；
- Config Export；
- Engineering Report。

### Team

未来提供：

- Team Workspace；
- Approval；
- Template；
- Company Logo；
- Shared Projects；
- Audit Trail；
- Client Report。

---

## 33. 开发优先顺序

### Phase 1

完成：

1. Job Registry；
2. Tool Level；
3. Next Step；
4. Workflow Context；
5. Unified Result Layout。

### Phase 2

升级10个 Hero Tools。

第一优先：

1. Network Change Planner；
2. OLT Planner；
3. Transmission Ring；
4. Data Center Fabric；
5. Optical / PON。

### Phase 3

建立前三条 Hero Workflow：

1. FTTH / PON Design；
2. OLT Expansion；
3. Network Change。

### Phase 4

建立：

4. Data Center Design；
5. Critical Power Design。

### Phase 5

Project Workspace：

```text
Project
+
Scenario
+
History
+
Report
```

---

## 34. 暂停事项

V2.4阶段以下事项降级：

### 暂停为了数量开发工具

不能因为：

> “现在34个，我们做到50个。”

而开发。

### 暂停重复工具

如果已有 Engine 能够复用：

> 不重新开发。

### 暂停低价值AI Generator

如果普通 ChatGPT 能够直接替代：

> 不做独立工具。

### 暂停只有一个数字的Hero页面

可以保留 Utility。

但不能列为：

> Flagship。

---

## 35. V2.4最终架构

```text
NetEngineerLab

┌───────────────────────────────┐
│          JOB LAYER            │
│                               │
│ Design / Plan / Diagnose      │
│ Change / Optimize / Validate  │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│       WORKFLOW ENGINE         │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│        HERO TOOL LAYER        │
│ Planner / Analyzer / Doctor   │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│      ENGINEERING ENGINE       │
│                               │
│ Calculation                   │
│ Rule                          │
│ Simulation                    │
│ Risk                          │
│ Recommendation                │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│        UTILITY LAYER          │
│ Existing calculators/tools    │
└───────────────────────────────┘
```

---

## 36. NetEngineerLab V2.4 产品价值公式

```text
User Value

=
Problem Importance
×
Result Accuracy
×
Decision Support
×
Actionability
×
Workflow Completion
```

工具数量不进入这个公式。

---

## 37. 最高验收标准

以后开发团队、2号审核员、3号验收员、4号总工都统一问：

1. 这个工具解决的是不是一个真实工程问题？
2. 结果准确吗？
3. 用户知道结果好不好吗？
4. 用户知道为什么吗？
5. 用户知道怎么改吗？
6. 用户可以比较不同方案吗？
7. 最终有没有形成可以直接使用的成果？
8. 用户完成之后，还知道下一步做什么吗？

如果前五问不能全部回答：

> 不能算深度工具。

如果前七问全部回答：

> 可以列为 Hero Tool。

如果八问全部回答：

> 可以进入 Hero Workflow。

---

## 38. V2.4 最终产品定义

NetEngineerLab 不再定义为：

> 一个拥有大量网络计算器的网站。

正式定义为：

> **一个帮助网络、通信和数据中心工程师进行设计、计算、诊断、风险分析、方案比较、变更规划和工程交付的专业工程工作平台。**

用户进入 NetEngineerLab 后，

我们的目标不是让他说：

> “这个计算器很好。”

而是让他说：

> **“我的设计做完了。”**

或者：

> **“我的问题找到原因了。”**

或者：

> **“我的变更方案已经可以实施了。”**

或者：

> **“我的工程报告已经可以交付了。”**

---

## 39. 冻结原则

从 V2.4 起：

> **Deep First. Workflow Second. Breadth Third.**

中文：

> **先做深度，再做工作流，最后扩广度。**

同时冻结：

> **30 Hero Tools > 300 ordinary tools**

以及：

> **10 Hero Workflows > 100 isolated calculators**

最终：

> **用户价值 > 工具数量 > 页面数量。**

---

## 40. NetEngineerLab V2.4 产品总原则

> **Calculate less. Decide better. Complete the job.**

> **不只是算得更多，而是帮助工程师做出更好的决定，并把工作真正完成。**
