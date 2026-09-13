# NetEngineerLab 产品与工程规范 V2.3.1

**文档类型：** 产品 + 工程总规范  
**版本：** V2.3.1  
**状态：** 正式冻结基线 / 最高级开发标准  
**项目：** NetEngineerLab  
**主域名：** https://netengineerlab.com  
**默认语言：** 英文  
**文档优先级：** 最高  
**适用范围：** 产品规划、首页、工具中心、技术域页面、工具页面、工程引擎、工作流、变更工程、UI/UX、SEO/GEO、i18n、PWA、Analytics、Observability、安全、测试、发布与部署  
**修订说明：** 本版本在 V2.3 基础上吸收 2 号独立审计意见，进行收敛式升级，不推翻现有架构，不另设补丁文档。

---

# 0. 文档目的与规范级别

本文件是 NetEngineerLab 当前最高优先级的产品与工程开发基线。

今后所有开发、重构、本地化、SEO/GEO、UI 修改、工程工具扩展、自动化测试、AI 辅助开发、发布与部署工作，都必须遵循本规范。

本规范的目标不是增加一份“说明文档”，而是建立一套可长期约束人工开发者、Codex、Work 及其他 AI Agent 的工程边界。

NetEngineerLab 的目标不是做普通网络计算器集合，而是建设成为：

> **专业的网络工程计算、规划、验证、诊断与变更工程平台。**

## 0.1 规范关键词

本文中的约束词统一定义如下：

### MUST / 必须
不满足即视为不符合本规范；涉及发布门禁时，不得正式上线。

### MUST NOT / 禁止
任何实现都不得违反。

### SHOULD / 应
原则上必须满足；确有例外时，必须记录原因。

### MAY / 可
可根据具体工具、阶段或工程价值选择实现。

### TARGET / 目标
属于优化目标，不一定构成发布阻断条件，除非另有说明。

---

# 1. 产品定位

## 1.1 核心定位

NetEngineerLab 应把真实网络工程输入转化为：

- 工程计算结果；
- 容量分析；
- 拓扑推理；
- 配置意图；
- 风险识别；
- 工程建议；
- 实施方案；
- 验证步骤；
- 回退方案；
- 可导出的工程成果。

核心价值链：

```text
Engineering Input
→ Canonical Model
→ Calculation / Parser / Rule Engine
→ Validation
→ Risk Analysis
→ Recommendation
→ Implementation / MOP
→ Pre-check / Post-check
→ Export / Share
```

只要某个问题可以通过确定性公式、规则或算法计算，确定性工程逻辑 MUST 优先于 AI 生成结果。

---

# 2. 核心产品原则

## 2.1 深度优先于广度

每个工具都必须先解决真实工程问题，再考虑扩展数量。

仅有：

```text
Input → One Number
```

的工具原则上不能视为完整深度工具。

## 2.2 工程逻辑优先于视觉装饰

工程正确性、边界处理、风险判断和解释优先于动画、营销视觉和装饰性 UI。

## 2.3 重要结果必须可解释

关键输出 SHOULD 回答：

```text
发生了什么？
为什么？
严重程度如何？
下一步应该怎么办？
```

## 2.4 平台能力必须复用

下列能力 MUST 平台化：

- Tool Registry；
- Canonical Model；
- Calculation Engine；
- Rule Engine；
- Parser；
- Vendor Renderer；
- Dataset Layer；
- Device Catalog；
- Workflow Engine；
- Validation / Risk Engine；
- Export Engine；
- Analytics；
- i18n；
- SEO/GEO；
- Quality Gate。

## 2.5 前端优先，后端可扩展

当前阶段继续坚持：

```text
Frontend-first
+
Cloudflare-friendly
+
Backend-ready
```

未来可逐步增加：

- Workers / API；
- Database；
- Auth；
- Workspace；
- Saved Projects；
- Team Collaboration；
- AI Gateway；
- Scheduled Jobs。

当前前端架构 MUST NOT 阻碍未来后端演进。

---

# 3. 现有仓库保护规则

这是最高优先级工程保护条款之一。

未经明确批准，任何开发人员或 AI Agent MUST NOT：

- 更换现有主要框架；
- 重建整个项目目录；
- 大规模迁移技术栈；
- 删除已有正式工具；
- 修改已有正式生产 URL；
- 随意修改 Tool Registry Schema；
- 随意修改共享 Engine 公共行为；
- 随意修改公共接口；
- 改变现有部署模式；
- 为了“更干净”而重新搭建整站；
- 在无迁移方案的情况下替换已有组件系统。

默认开发策略 MUST 是：

> **在现有架构上增量开发、局部重构、兼容升级。**

---

# 4. 架构变更门禁

以下变化属于 Architecture Change，必须单独评审：

- 框架更换；
- 路由体系重构；
- Registry Schema 破坏性修改；
- Canonical Model 破坏性修改；
- 公共 Engine API 破坏性修改；
- 部署平台切换；
- 数据持久化模型重构；
- 多语言 URL 规则改变；
- Tool URL 改变；
- 核心 Design System 替换。

Architecture Change MUST 包含：

```text
Current State
→ Proposed Change
→ Why
→ Compatibility Impact
→ Migration Plan
→ Rollback Plan
→ Test Plan
```

没有迁移与回退方案，不得实施破坏性架构调整。

---

# 5. 目标用户与核心任务

主要用户：

- 网络工程师；
- 通信工程师；
- NOC / 运维人员；
- 实施工程师；
- 解决方案架构师；
- 售前工程师；
- 数据中心工程师；
- 无线 / 光网络 / 安全工程师；
- 网络技术学习者；
- 工程管理人员。

核心任务模式：

```text
Learn
Calculate
Analyze
Validate
Plan
Configure
Troubleshoot
Change
Document
Export
```

---

# 6. 技术域规划

## 6.1 核心技术域

- Routing
- Switching
- Optical
- Wireless
- Security
- Data Center
- Telecom Access
- Transmission
- IP / MPLS
- Cloud Networking
- Network Operations

## 6.2 新兴技术域

- AI Infrastructure
- GPU Networking
- RDMA / RoCE
- SmartNIC / DPU
- Edge Computing
- Private 5G
- IPv6
- Segment Routing
- EVPN / VXLAN
- Intent-based Networking
- Network Automation
- Quantum Networking
- Green ICT / Energy Efficiency

新技术域 MUST 遵循同样的工程深度标准。

---

# 7. 信息架构与语言路由

稳定目录：

```text
/
├─ tools/
├─ domains/
├─ workflows/
├─ articles/
├─ docs/
├─ about/
├─ contact/
├─ privacy/
├─ terms/
├─ zh/
└─ es/
```

语言规则：

```text
EN: /
ZH: /zh/
ES: /es/
```

英文继续作为默认 canonical 根语言。

未来新增语言 MUST 使用语言前缀方式，MUST NOT 破坏现有 URL。

---

# 8. 核心页面标准

## 8.1 首页

首页第一屏 SHOULD 明确：

- NetEngineerLab 是什么；
- 面向谁；
- 解决什么工程问题；
- 有哪些技术域；
- 有哪些代表性深度工具；
- 为什么不同于普通计算器网站。

推荐模块：

```text
Hero
Engineering Domains
Featured Deep Tools
Engineering Workflows
Recently Updated
Methodology / Trust
Learning Resources
Search
Related Discovery
```

## 8.2 Tools Center

必须支持：

- 技术域筛选；
- Capability 筛选；
- 搜索；
- 最近更新；
- 热门工具；
- 工作流发现；
- 相关工具推荐。

Tool Card SHOULD 展示：

- 名称；
- 工程用途；
- Domain；
- Capability；
- 复杂度；
- 当前版本。

Tools Center MUST NOT 退化成无结构图标宫格。

## 8.3 Domain 页面

Domain 页面同时承担：

- 产品导航；
- SEO/GEO 主题聚合。

应包含：

- 技术域概述；
- 工程问题；
- 工具分组；
- 工作流；
- 技术概念；
- FAQ；
- 相关文章；
- 相关技术域。

## 8.4 Tool Detail 页面

推荐主结构：

```text
Hero
↓
Problem Statement
↓
Input Panel
↓
Result Panel
↓
Engineering Interpretation
↓
Risk / Warning
↓
Recommendation
↓
Scenario / Example
↓
Methodology
↓
Related Tools
↓
FAQ
```

Result 区 SHOULD 预留合理空间，避免明显 CLS。

---

# 9. UI / UX 强制规则

以下为 MUST 级要求：

1. Calculator / Planner / Analyzer 页面必须保持清晰的 Input → Result 主路径。
2. Result 的视觉与内容优先级必须高于 SEO 长文内容。
3. 首屏不得被大面积营销文案占据而影响工具使用。
4. Mobile 下主要 CTA 必须容易发现和点击。
5. Engineering Warning 与普通 Info 必须视觉区分。
6. 风险状态不得只依赖颜色表达。
7. 不得为了视觉简洁隐藏关键工程参数。
8. 不得产生横向溢出。
9. 结果区、表格和主要操作必须在移动端可用。
10. 公共状态组件应统一：Empty / Loading / Success / Warning / Error。

Design Token MUST 统一管理：

```text
color
spacing
radius
shadow
typography
breakpoints
container widths
motion
z-index
```

---

# 10. 工具能力分类

工具必须声明 Capability：

```text
calculator
planner
analyzer
validator
generator
converter
diagnostic
simulator
parser
optimizer
workflow
reference
```

Capability MUST 用于：

- Tool Registry；
- 搜索；
- 筛选；
- Related Tools；
- Analytics；
- Structured Data；
- 导航。

---

# 11. Tool Registry

所有正式工具 MUST 注册到统一 Tool Registry。

最小概念模型：

```ts
interface ToolDefinition {
  id: string
  slug: string
  version: string
  status: "draft" | "internal" | "beta" | "stable" | "deprecated"

  domain: string
  subdomain?: string

  capabilities: ToolCapability[]

  title: LocalizedText
  description: LocalizedText

  inputs: InputSchema[]
  outputs: OutputSchema[]

  engine: string
  workflow?: string[]

  seo: ToolSEOConfig
  analytics: ToolAnalyticsConfig

  relatedTools?: string[]
}
```

Registry 是以下内容的唯一权威来源：

- 路由；
- 工具元数据；
- 导航；
- sitemap；
- Related Tools；
- 多语言覆盖；
- 发布状态；
- 发布校验。

任何正式工具 MUST NOT 绕过 Tool Registry。

---

# 12. 工具生命周期

统一生命周期：

```text
draft
→ internal
→ beta
→ stable
→ deprecated
```

定义：

### draft
开发中；不得进入正式 sitemap。

### internal
仅开发或内部验证环境可见。

### beta
可公开访问，但必须显示 Beta 状态；允许规则和 UI 调整。

### stable
正式生产状态，要求完整通过发布门禁。

### deprecated
停止主推，保留访问，并明确推荐替代工具。

---

# 13. Deprecated 工具治理

工具进入 deprecated 后 MUST 明确：

- 老 URL 是否保留；
- canonical 如何处理；
- 是否继续进入 sitemap；
- Related Tools 如何迁移；
- 替代工具是什么；
- 什么时候可以归档；
- 是否需要 301。

原则：

> 有真实外链、书签或历史搜索价值的正式 URL，不得无理由直接删除。

---

# 14. Canonical Engineering Model

平台必须把工程语义与厂商展示分离。

架构：

```text
User Input
↓
Canonical Model
↓
Engineering Logic
↓
Vendor Renderer / Output Adapter
```

逐步建立：

- Interface；
- VLAN；
- LAG；
- Device；
- Port；
- Route；
- BGP；
- OSPF；
- Optical Link；
- Transmission Ring；
- Leaf-Spine Fabric；
- OLT Uplink。

Vendor Syntax MUST NOT 直接嵌入核心工程计算逻辑。

---

# 15. Calculation Engine

Calculation Engine MUST 与 UI 解耦。

要求：

- 可确定性计算的必须确定性计算；
- 单位安全；
- 边界可测试；
- 与 i18n 解耦；
- 可复用；
- 有版本；
- 有说明。

每个重要公式 MUST 定义：

- 变量；
- 单位；
- 假设；
- 有效范围；
- 限制。

Calculation Engine MUST NOT 静默修正非法工程输入。

---

# 16. 数值精度与单位规范

内部计算精度 MUST 与 UI 显示精度分离。

标准流程：

```text
Raw Input
→ Normalized Unit
→ Full Precision Calculation
→ Result Object
→ Display Formatter
```

必须明确：

- base unit；
- unit conversion；
- internal precision；
- display precision；
- rounding rule；
- tolerance；
- percentage representation。

禁止因 UI 显示 2 位小数而在中间计算过程提前截断。

浮点比较 SHOULD 使用合理 tolerance，而不是直接依赖绝对相等。

同一公式在不同页面 MUST 共享相同计算函数或相同测试向量。

---

# 17. Rule Engine

Rule Engine 用于：

- 阈值；
- 约束；
- 风险；
- 工程建议。

例如：

```text
IF oversubscription > threshold
THEN risk = high

IF optical_budget_margin < 3 dB
THEN warning = insufficient_margin
```

Rule MUST：

- 显式；
- 可测试；
- 可解释；
- 有版本；
- 与页面文案解耦。

用户必须能理解警告为何出现。

---

# 18. Parser

Parser 应支持未来输入：

- Running Config；
- CLI Output；
- Inventory；
- CSV；
- JSON；
- Topology Data；
- 复制的设备输出。

处理链：

```text
Raw Input
→ Parser
→ Normalized Data
→ Canonical Model
→ Rules / Calculations
```

Parser MUST NOT 直接生成最终工程结论。

---

# 19. Vendor Renderer

支持方向：

- Cisco；
- Huawei；
- H3C；
- Juniper；
- Nokia；
- ZTE；
- Arista。

架构：

```text
Canonical Intent
→ Vendor Renderer
→ Vendor CLI / Config
```

同一 Canonical Model SHOULD 尽量复用到多个 Vendor Renderer。

---

# 20. Dataset 与 Device Catalog

结构化数据 MAY 包含：

- vendor；
- model；
- device family；
- slot architecture；
- card type；
- port count；
- port speed；
- breakout；
- power；
- interface naming rules。

每条关键工程数据 SHOULD 记录：

```text
sourceType
sourceUrl
vendor
documentVersion
retrievedAt
verifiedAt
verifiedBy
confidence
status
```

信息来源优先级：

```text
Vendor Official Documentation / Datasheet
>
Official Technical Note
>
Standards / RFC
>
Trusted Technical Reference
>
Community Content
>
AI-generated Content
```

AI 生成内容 MUST NOT 作为设备参数事实来源。

不确定数据必须明确标识，MUST NOT 冒充已验证事实。

---

# 21. Validation 与 Risk Engine

复杂工具 SHOULD 把计算结果进一步转成：

```text
Result
→ Validation
→ Risk Level
→ Engineering Explanation
→ Recommendation
```

Risk SHOULD 至少支持：

```text
info
low
medium
high
critical
```

如采用不同等级体系，必须全站一致。

---

# 22. Workflow Engine

工具应逐步连接为工作流：

```text
Capacity Planning
→ Topology Design
→ Risk Validation
→ Config Generation
→ Pre-check
→ Change Plan
→ Post-check
→ Rollback
```

Workflow SHOULD 定义：

- stages；
- required inputs；
- outputs；
- dependencies；
- validation rules；
- completion state。

---

# 23. Network Change Engineering

这是 NetEngineerLab 长期核心差异化方向。

目标链路：

```text
Intent
→ Current State
→ Target State
→ Delta
→ Risk
→ MOP
→ Pre-check
→ Change Commands
→ Post-check
→ Rollback
```

关键输出包括：

- Minimal Delta；
- Risk Score；
- Change Sequence；
- Rollback Conditions；
- Validation Commands；
- Runbook。

平台研发优先级 SHOULD 逐步从普通 Calculator 向：

```text
Analyzer
Planner
Validator
Workflow
Change Engineering
```

倾斜。

---

# 24. 工程工具深度标准

深度工具根据适用性 SHOULD 包含：

1. 工程场景；
2. 输入校验；
3. 核心计算；
4. 多维结果；
5. 工程解释；
6. 阈值预警；
7. 风险等级；
8. 推荐动作；
9. 示例；
10. Edge Case；
11. 方法与公式；
12. Related Tools；
13. Copy / Export；
14. Responsive UI；
15. SEO/GEO；
16. Analytics；
17. 自动测试。

复杂工具推荐结构：

```text
Scenario
Inputs
Topology / Data Model
Calculation
Result Summary
Detailed Metrics
Bottleneck
Risk
Recommendation
N-1 / Failure Case
Implementation Guidance
Validation
Export
Related Workflow
```

---

# 25. Tool 开发生命周期与 Definition of Done

统一流程：

```text
Admission
→ Engineering Problem Definition
→ Product Scope
→ Input Model
→ Canonical Model
→ Calculation / Rule Design
→ UI Design
→ Implementation
→ Unit Test
→ Engineering Validation
→ i18n
→ SEO/GEO
→ Analytics
→ E2E
→ Quality Gate
→ Production
```

正式 Definition of Done：

- 工程逻辑已验证；
- Edge Case 已覆盖；
- Mobile 已验证；
- i18n 完整；
- Metadata 完整；
- Analytics 完成；
- 测试通过；
- 性能达标；
- Quality Gate 通过；
- 文档已更新。

---

# 26. 新工具准入标准

新工具至少应满足以下一项：

1. 解决真实工程问题；
2. 有明确搜索需求；
3. 强化某技术域；
4. 补齐工作流；
5. 有明显专业价值；
6. 有差异化能力。

禁止仅为增加 Tool Count 而开发低价值页面。

建议按以下维度排序：

```text
Engineering Value
Search Demand
Differentiation
Implementation Cost
Workflow Leverage
Monetization Potential
Maintenance Cost
```

其中 Engineering Value 与 Differentiation 应拥有更高权重。

---

# 27. i18n

英文是默认 canonical 语言。

```text
EN: /
ZH: /zh/
ES: /es/
```

业务逻辑 MUST NOT 硬编码可翻译 UI 文本。

Translation Key 应使用语义命名：

```text
tool.calculate
result.warning
navigation.tools
```

禁止使用：

```text
button1
text2
label3
```

多语言覆盖 MUST 自动审计。

---

# 28. Canonical / Hreflang

规则：

- canonical 指向当前语言正式 URL；
- hreflang 相互引用所有已发布语言；
- x-default 指向站点默认语言 canonical URL，目前为英文根目录；
- 废弃重复 URL 必须按规划进行 301 或归档处理。

---

# 29. SEO / GEO / Structured Data

SEO 必须由平台 Metadata 驱动。

每个工具 SHOULD 定义：

- title；
- meta description；
- canonical；
- Open Graph；
- Twitter metadata；
- breadcrumb；
- structured data；
- internal links；
- localized metadata。

Sitemap MUST 只包含合法的正式 canonical URL。

GEO 内容 SHOULD 包含：

- 直接定义；
- 公式；
- 假设；
- 工程解释；
- FAQ；
- 比较；
- 决策逻辑；
- 示例。

Structured Data 仅在语义匹配时使用，例如：

- WebSite；
- WebPage；
- BreadcrumbList；
- FAQPage；
- Article；
- SoftwareApplication；
- WebApplication；
- HowTo。

Structured Data MUST 与可见页面内容一致。

---

# 30. 内链与内容网络

每个工具 SHOULD 连接：

```text
Tool
↔ Related Tool
↔ Domain Page
↔ Workflow
↔ Article
```

MUST 尽量避免孤立工具页。

内容策略优先服务于工程场景：

- Engineering Concept；
- Methodology；
- Design Guide；
- Troubleshooting Guide；
- Comparison；
- Configuration Example；
- Workflow Tutorial。

---

# 31. Analytics

Product Analytics 衡量用户行为，不等同于 Engineering Observability。

核心事件：

```text
page_view
tool_view
tool_start
input_change
calculate
result_generated
validation_error
copy_result
export_result
related_tool_click
workflow_start
workflow_complete
language_switch
```

建议附带：

- tool_id；
- version；
- domain；
- locale；
- capability；
- device type。

不得收集不必要的敏感数据。

核心漏斗：

```text
Landing
→ Tool View
→ Tool Start
→ Successful Result
→ Engineering Action
→ Related Tool / Workflow
→ Return Visit
```

---

# 32. Engineering Observability

平台 SHOULD 逐步监控：

- runtime exception；
- build failure；
- worker error；
- API latency；
- calculation failure；
- parser failure；
- unexpected validation failure；
- release regression。

Product Analytics 与 Observability MUST 分开设计。

前者回答：

> 用户怎么用？

后者回答：

> 系统是否正常？

---

# 33. 性能与 Core Web Vitals

目标：

```text
Performance ≥ 90
Accessibility ≥ 95
Best Practices ≥ 95
SEO ≥ 95
```

关键页面可争取 Lighthouse 95+。

重点监控：

- LCP；
- INP；
- CLS。

Result 区应尽量预留空间。

明显由 Result、广告、图片或延迟组件引起的布局跳动必须修复。

---

# 34. PWA

可逐步支持：

- manifest；
- icons；
- installability；
- offline-safe shell；
- cache strategy；
- update handling。

动态工程数据 MUST NOT 被错误长期缓存。

---

# 35. Cloudflare 与前后端边界

当前部署原则：

```text
Static-first
+
Edge-friendly
+
Cloudflare-friendly
```

决策边界：

### 浏览器可安全完成
优先 Client-side：

- 确定性计算；
- 本地单位转换；
- 本地规则判断；
- 不涉及 Secret 的轻量解析。

### 必须 Server-side / Worker
包括：

- API Key；
- AI Provider Secret；
- CORS Proxy；
- 受限第三方 API；
- 敏感凭据；
- 需要持久化的业务逻辑。

Secret MUST NOT 进入浏览器 Bundle。

---

# 36. 安全与输入威胁模型

最低安全要求：

- 禁止在前端存放 Secret；
- API Key 不得提交仓库；
- 安全响应头；
- CSP（适用时）；
- URL 输入校验；
- 文件输入校验；
- 安全渲染；
- 依赖漏洞检查；
- 禁止任意代码执行。

未来 Parser、CSV、JSON、URL、Config 输入必须考虑：

- XSS；
- HTML Injection；
- CSV Formula Injection；
- Path Injection；
- Oversized Input；
- Regex DoS；
- Malformed Config；
- External URL Abuse。

任何用户输入 MUST 被视为不可信。

---

# 37. 隐私

默认不收集用户网络配置和工程数据。

若未来上传或发送到后端 / 外部服务，必须明确：

- 发送什么；
- 发送到哪里；
- 如何处理；
- 保存多久；
- 如何删除。

---

# 38. 依赖治理

第三方依赖 SHOULD 遵循：

- 有维护；
- 非必要不引入；
- 不为一个简单函数引入大型依赖；
- 定期检查安全漏洞；
- Lockfile 必须提交；
- Major Upgrade 与业务功能开发尽量分离；
- 升级前必须评估 breaking change；
- 可由原生能力实现的简单功能优先原生实现。

---

# 39. 测试体系

## 39.1 Unit Test

MUST 覆盖：

- formulas；
- parser core；
- rules；
- conversions；
- canonical transformations。

## 39.2 Integration Test

SHOULD 覆盖：

- engine pipeline；
- parser → model → rule；
- registry loading；
- localization fallback；
- export pipeline。

## 39.3 E2E

关键路径 MUST 覆盖：

- page render；
- input；
- calculate；
- validation；
- result；
- copy / export；
- localized routes；
- core navigation。

---

# 40. 发布质量门禁

## 40.1 Blocking Gate

以下失败 MUST 阻断正式发布：

```text
TypeScript Error > 0
Critical Build Error > 0
Unit Test Failure > 0
Critical E2E Failure > 0
Broken Production Route > 0
Broken Canonical > 0
Invalid hreflang graph > 0
Duplicate production slug > 0
Missing required Registry field > 0
Critical structured-data error > 0
Critical accessibility error > 0
Known secret exposure > 0
```

CLS：

```text
CLS > 0.25
```

在核心页面上 SHOULD 视为阻断问题。

## 40.2 Warning Gate

以下问题允许在有记录的情况下发布，但必须进入修复队列：

- Lighthouse 未达到 Target；
- 非关键页面轻微 UI 偏差；
- 非核心 Structured Data 警告；
- 非关键辅助文本未完成优化。

## 40.3 Release Pipeline

```text
typecheck
↓
lint
↓
unit test
↓
registry validation
↓
dataset validation
↓
i18n audit
↓
SEO audit
↓
canonical / hreflang audit
↓
structured data validation
↓
accessibility audit
↓
CLS / Web Vitals audit
↓
Playwright E2E
↓
production build
```

---

# 41. 自动审计要求

## 41.1 Registry Audit

检查：

- duplicate slug；
- missing title；
- missing locale；
- missing engine；
- invalid related tool；
- invalid domain；
- missing version；
- missing SEO metadata；
- invalid URL。

## 41.2 i18n Audit

检查：

- 未翻译文本；
- 非默认语言页面英文泄漏；
- missing translation key；
- invalid localized URL；
- canonical 错误；
- hreflang 不完整。

## 41.3 SEO Audit

检查：

- duplicate title；
- missing description；
- canonical mismatch；
- missing hreflang；
- orphan page；
- broken internal link；
- sitemap inconsistency；
- noindex error；
- structured data mismatch。

## 41.4 UI Regression Audit

检查：

- overflow；
- broken card；
- mobile input usability；
- abnormal result height；
- CLS；
- header/footer inconsistency；
- language switcher；
- critical CTA visibility。

---

# 42. Export Layer

适合的工具 SHOULD 支持：

- Copy；
- CSV；
- JSON；
- Markdown；
- Printable Report；
- PDF；
- Configuration Text；
- MOP。

Export MUST 基于标准 Result Object，不得通过抓取 UI 文本拼接结果。

---

# 43. 错误处理与 No Silent Magic

错误信息 SHOULD 说明：

```text
问题是什么
为什么
怎么恢复
```

禁止：

- 静默修改单位；
- 静默 clamp；
- 静默丢弃拓扑；
- 静默忽略非法值；
- 静默改变厂商假设。

任何 Normalize 行为必须可见或有明确说明。

---

# 44. 版本与变更管理

每个正式工具 MUST 有版本号。

影响工程逻辑的修改必须记录：

- version；
- modification date；
- change description。

Breaking Change MUST：

- 升级版本；
- 执行 Regression Test；
- 评估兼容性；
- 更新文档。

---

# 45. AI 辅助开发规则

AI Agent 可以用于：

- 样板代码；
- UI；
- 测试；
- 翻译；
- 代码审计；
- 工程解释草稿；
- 重复组件重构。

AI Agent 未经验证 MUST NOT 独立修改：

- 工程公式；
- 阈值；
- Canonical Model；
- Vendor Syntax；
- Release Gate；
- Registry 核心 Schema；
- 生产 URL。

推荐分工：

```text
Chief Engineer
→ Main Engineering Agent
→ Batch / Mechanical Agent
→ Independent Audit Agent
```

重大修改必须通过独立审计后再合并。

---

# 46. AI 产品层

AI 是增强层，不是核心工程引擎。

未来可增加：

- Engineering Explanation Assistant；
- Configuration Interpretation；
- Troubleshooting Assistant；
- Topology Explanation；
- MOP Drafting；
- Log Summarization。

AI 结果必须与确定性 Engine 结果明确区分。

存在确定性答案时，Deterministic Engine 拥有最终权威。

---

# 47. 商业化准备

架构 MAY 支持：

```text
Free
Professional
Team
Enterprise
```

未来可商业化：

- Saved Projects；
- Advanced Export；
- Batch Analysis；
- Vendor Packs；
- Advanced Workflow；
- MOP Packages；
- Team Workspace；
- API；
- AI Assistant；
- Enterprise Deployment。

免费工具仍应承担搜索获客和品牌建立功能。

---

# 48. 规模化原则：50 / 100 / 200 工具

工具数量增加后，以下能力 MUST 集中管理：

- Registry；
- Navigation；
- Metadata；
- Localization；
- Analytics；
- Structured Data；
- Page Template；
- UI Primitive；
- Calculation Utility；
- Dataset；
- Testing；
- Quality Gate。

MUST NOT 把 200 个工具维护成 200 套孤立实现。

---

# 49. 文档体系

推荐：

```text
/docs
├─ master/
│  └─ NETENGINEERLAB-PRODUCT-ENGINEERING-SPEC-V2.3.1.md
│
├─ architecture/
│  ├─ PLATFORM-ARCHITECTURE-V2.3.md
│  ├─ TOOL-REGISTRY-V2.3.md
│  ├─ CANONICAL-MODEL-V2.3.md
│  ├─ RULE-ENGINE-V2.3.md
│  └─ WORKFLOW-ENGINE-V2.3.md
│
├─ standards/
│  ├─ ENGINEERING-TOOL-DEPTH-STANDARD-V2.3.md
│  ├─ UI-UX-STANDARD-V2.3.md
│  ├─ SEO-GEO-I18N-STANDARD-V2.3.md
│  └─ RELEASE-QUALITY-GATE-V2.3.md
│
└─ tools-spec/
   ├─ ...
```

本 V2.3.1 总规范是最高级文档。

---

# 50. 文档治理与强制阅读

冲突优先级：

```text
V2.3.1 Master Specification
>
Architecture Standard
>
Domain Standard
>
Tool Specification
>
Implementation Notes
```

任何开发人员或 AI Agent 修改 NetEngineerLab 前，至少必须阅读：

```text
1. NetEngineerLab 产品与工程规范 V2.3.1
2. 当前相关 Domain / Tool Specification
3. 当前 Registry / Architecture 文档
4. 当前 Release Quality Gate
```

禁止仅依据一条孤立 Prompt 对大型功能直接实施破坏性修改。

---

# 51. 最终平台架构

```text
NetEngineerLab
│
├─ Engineering Domains
│
├─ Tool Registry
│
├─ Canonical Models
│
├─ Calculation Engine
│
├─ Parser Engine
│
├─ Rule Engine
│
├─ Dataset Layer
│
├─ Device Catalog
│
├─ Validation Engine
│
├─ Risk Engine
│
├─ Vendor Renderer
│
├─ Workflow Engine
│
├─ Change Engineering
│  ├─ Diff
│  ├─ Minimal Delta
│  ├─ MOP
│  ├─ Pre-check
│  ├─ Post-check
│  └─ Rollback
│
├─ Export Engine
├─ SEO / GEO Engine
├─ i18n
├─ Analytics
├─ Observability
├─ PWA
├─ Quality Gate
│
└─ Future Backend / AI Layer
```

---

# 52. 战略方向

NetEngineerLab 不应主要竞争：

> 谁的计算器更多？

真正应该竞争：

> **谁能把真实网络工程问题转化成结构化、已验证、可解释、可执行的工程结果。**

长期护城河：

```text
Engineering Depth
+
Reusable Canonical Models
+
Professional Workflows
+
Vendor-aware Output
+
Change Engineering
+
Explainability
+
Search / GEO Distribution
+
High-quality Tool Network
```

平台研发资源 SHOULD 逐渐从普通 Calculator 向：

```text
Analyzer
Planner
Validator
Workflow
Change Engineering
```

倾斜。

---

# 53. V2.3.1 正式冻结声明

自 V2.3.1 起，正式冻结以下原则：

1. 现有架构优先增量升级，不反复推倒重建。
2. 任何重大架构变更必须通过 Architecture Change Gate。
3. 新工具必须进入 Tool Registry。
4. 新技术域必须遵循工程深度标准。
5. Canonical Model 与 Vendor Renderer 必须分离。
6. Deterministic Engineering Engine 优先于 AI。
7. English `/`、Chinese `/zh/`、Spanish `/es/` 继续作为正式多语言基线。
8. SEO、GEO、i18n、Analytics、Observability、Quality Gate 都属于平台能力。
9. Cloudflare-friendly、Frontend-first、Backend-ready 继续作为当前部署路线。
10. Secret 不得进入浏览器。
11. Dataset / Device Catalog 必须可溯源。
12. 关键工程公式必须遵循统一精度与单位规范。
13. 正式发布必须通过 Blocking Quality Gate。
14. 工具数量不是独立成功指标。
15. 工程价值、工作流价值与实际用户使用价值优先。

---

# 54. 最终开发标准

NetEngineerLab 的标准开发顺序统一为：

```text
理解工程问题
→ 正确建模
→ 正确计算
→ 验证
→ 风险判断
→ 解释
→ 推荐动作
→ 接入工作流
→ 导出
→ SEO / GEO / i18n
→ 自动测试
→ 发布门禁
→ 安全上线
```

最终定位：

> **NetEngineerLab 是一个深度优先、工程优先、可验证、可扩展的网络工程平台，而不是浅层计算器集合。**

---

**《NetEngineerLab 产品与工程规范 V2.3.1》结束**
