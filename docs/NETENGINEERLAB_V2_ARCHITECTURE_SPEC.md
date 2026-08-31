# NetEngineerLab V2.0 工具平台架构规范

**版本：V2.0.0**  
**制定日期：2026-08-31**  
**状态：正式架构基线**  
**适用范围：现有 NetEngineerLab 与后续新增工具**

## 1. 决策摘要

V2.0 采纳“从 Calculator 网站演进为 Network Engineering Toolkit”的方向，目标是让平台能够稳定支撑 30、50 乃至 100 个专业工具，同时保持已上线页面、公式、URL、离线能力和 SEO 资产稳定。

V2.0 不推翻现有网站，不一次性把静态站重写为新的 `src/` 应用，也不因架构升级提前引入数据库、账户或大型后端。采用渐进式迁移：新工具按 V2 规范建设；旧工具在发生维护或高价值重构时迁入共享核心。

核心产品链路为：

```text
Calculate → Configure → Validate → Diagnose → Plan
```

其中 Calculator、Generator、Analyzer、Planner 是工具类型；Core、Schema、Validator、Vendor、Parser、Rules、Exporter 和 Shared UI 是可复用平台资产。

## 2. 现有仓库到 V2 的映射

当前仓库是可部署的静态多语言站点，V2 采用兼容映射，不要求立即改名：

| V2 概念 | 当前仓库落点 | 迁移规则 |
| --- | --- | --- |
| Tool registry / Tool Schema | `website/data/tools-catalog.json`、各工具目录 | 先扩展元数据，再逐步补齐输入/输出 Schema；不重复建立孤立清单 |
| Tool package | `website/tools/<slug>/` 与 `zh/` | 保持现有 URL 和标准 `engine.js`、`app.js`、`pwa.js`、`sw.js` |
| Core engine | 工具 `js/engine.js`、共享生成规则包 | 新算法优先放入可测试纯函数；跨工具复用时再迁入共享 Core |
| Shared UI / shell | `website/templates/`、`website/assets/css/`、共享脚本 | 视觉和交互只通过共享壳层与设计系统演进 |
| Engineering Rules | `website/data/engineering-rules/`、生成的 rules bundle | 规则必须走已注册 Operator、Evidence 和确定性 Evaluator |
| Vendor / Parser | Tool 21 专属模块及未来 `website/assets/generated/` 相关模块 | 解析、厂商渲染和规则判断分层，禁止堆进页面或共享 Evaluator |
| Public assets | `website/` | 不为追求 `public/` 命名而移动已部署资源 |
| Tests | `tests/` 与工具 `docs/engine-test.js` | 计算、解析、规则、内容、无障碍、PWA 和生产验收均保留证据 |

建议中的 `src/tools`、`src/core`、`src/vendors` 等目录是未来迁移目标，不是 V2.0 的一次性改造任务。只有在构建链、路径、Service Worker、Sitemap、canonical 和生产验收具备等价门禁后，才允许迁移单个模块。

## 3. 工具类型边界

### Calculator

结构化输入经过 Validator 和纯函数 Engine 得到结果、公式和解释。页面不得承载核心公式；Engine 不得依赖 HTML、CSS、URL 或按钮。

### Generator

输入先进入厂商无关 Normalized Model，再由 Vendor Renderer 输出配置或命令。禁止在页面中散落 `if Cisco / Huawei / H3C / Juniper` 语法分支。

### Analyzer

严格分成 `Raw Text → Parser → Normalized IR → Rules → Findings → Recommendation`。Parser 只负责保留来源位置并读懂输入；规则才负责判断、严重度、证据和建议。

### Planner

组合多个确定性 Engine、工程规则和约束，输出可解释的规划模型、假设、风险和导出结果。Planner 不得把不确定推断伪装成确定结论。

## 4. 共享核心与数据契约

所有共享 Core 必须是纯函数优先、输入输出可序列化、无副作用、可单元测试，并能被 Calculator、Planner、Analyzer 或未来 API 调用。Core 不知道 UI、SEO、厂商页面或后端实现。

Normalized Model 不得包含厂商命令、HTML、UI 状态或展示文案。Parser 输出必须保留原始位置或字段来源；Finding 必须包含最小充分 Evidence、Rule ID、Severity 和可追溯来源。

Tool Schema 第一阶段至少描述：`id`、`type`、`category`、双语标题/描述、输入字段及单位、默认值、Engine 标识、输出字段、SEO 意图、FAQ 和来源。Schema 首先作为元数据与门禁来源，不承诺立即自动生成所有 UI。

共享 Validator 覆盖 IPv4、IPv6、CIDR、ASN、VLAN、MAC、Port、Prefix、Interface、Bandwidth、Optical Power、Distance 等常用类型；新工具应复用而不是复制同名校验。

共享 Exporter 的目标能力为 Copy、TXT、JSON、CSV；Markdown/PDF 属于后续 Planner 能力。迁移前现有工具可保留兼容实现，但新实现不得继续复制一套公共导出逻辑。

## 5. 多厂商、Parser 与规则引擎

V2 支持 Cisco、Huawei、H3C、Juniper，未来可扩展 Arista、Nokia、Fortinet、Palo Alto。统一模型与厂商 Renderer 必须可独立测试，并至少通过 Golden Fixture、语法校验和 `Generate → Parse → IR` 语义等价测试。

规则严重度以当前已落地契约为准，仅允许 `CRITICAL`、`HIGH`、`MEDIUM`、`INFO`；不采用分析稿中的 `LOW/WARNING` 别名，以免破坏既有规则、评分和报告。规则不得保存或执行 JavaScript 表达式，不得使用 `eval` 或 `Function`。AI（如未来接入）不得新增、删除或改变 Finding、Severity、Evidence 或 Rule ID。

粘贴的配置、日志和命令输出均按不可信输入处理：限制大小和运行时间，转义输出，遮盖密钥，不做系统采集。V1 继续 Local Processing，不向 AI 或后端传输原始输入。

## 6. 页面、URL 与 SEO/GEO

标准工具页顺序为：

```text
H1 → 问题定义 → 输入/操作 → 核心结果 → 解释/假设 → Engineering Notes → FAQ → Related Tools
```

共享 Header、Footer、设计令牌、卡片、表单、结果、FAQ 和相关工具视觉保持一致；工具专属 CSS 只描述业务控件、图表和状态。

V2.0 当前新增工具继续使用现有 `/tools/<slug>/` 路由；`/tools/routing/`、`/tools/security/` 等分类路径只作为未来分类聚合页，不表示具体工具。只有在 `directoryStrategy.toolPage`、目录结构、PWA、Sitemap、canonical、hreflang、301 重定向和全部发布门禁完成配置驱动升级后，才允许逐工具采用 `/tools/<category>/<slug>/` 等嵌套路由。已经上线或可能被收录的旧 URL 不得直接改名；任何迁移必须保留旧 URL、配置 301、更新 Sitemap、canonical、hreflang、内链、Service Worker 和生产浏览器证据。

每个可索引页在设计阶段定义一个搜索意图、主主题词和自然长尾问题；内容必须给出输入、公式或判断逻辑、单位、假设、限制、结果含义和下一步行动。FAQ、JSON-LD、可见正文和双语表达必须逐字一致且可核验，不得堆砌关键词或制造近似页面。

## 7. 后端边界与隐私

Frontend First 继续有效。Calculator、Generator、文本 Analyzer 和 Planner 在本地完成。Live Ping、Traceroute、DNS/WHOIS/ASN 查询、端口/SSL 检查、账户、云同步、API 和 AI 分析才进入 `services/` 边界；未完成数据最小化、授权、错误处理和隐私设计前不得接入后端。

## 8. 渐进式迁移路线

### Phase A：基线与共享契约

保持现有工具正常运行；完善 Tool Schema、共享 Validator/Exporter 接口、统一 Result Model、Parser/Vendor 接口和测试模板。第 21 个 ACL 工具继续作为规则、Evidence、Parser、Vendor Renderer 的参考实现。

### Phase B：新工具按 V2 构建

新工具必须先确定类型和 Category，检查可复用 Core，创建 Schema，再实现 Engine/Parser/Rules/Renderer，最后接入共享 UI、SEO、Sitemap、PWA 和四终端浏览器门禁。

### Phase C：维护驱动迁移旧工具

旧工具仅在发生正确性修复、重大内容更新或高流量重构时迁移；迁移必须有新旧黄金样例对照、独立验证和生产回滚路径。禁止为了目录整洁一次性重写全站。

### Phase D：规模化工具组

优先 Calculator（OSPF Cost、Route Summarization），再做 Generator（VLAN、Static Route、DHCP），随后做 Parser/Analyzer（Ping、Traceroute、ACL、Routing Table），最后再做受控的完整 Config Analyzer。每个新工具以工程价值、搜索意图、复用率、开发成本和维护成本评分排序，不以工具数量作为唯一 KPI。

## 9. V2.0 强制门禁

任何新增或迁移批次必须满足：

1. 页面、Engine、Parser、Rules、Renderer 和 Exporter 职责边界清晰。
2. 结构化输入、非对象、非有限数、类型强转、边界值和派生溢出均有失败关闭测试。
3. Core/Parser/Rules 有单元或契约测试；Generator 有 Golden 与语义回环；Analyzer 有 Raw → IR → Finding 测试。
4. 中英文页面共享同一布局、来源、FAQ/Schema、可见复核日期和相关工具结构。
5. SEO/GEO 审计、Sitemap 集合、canonical/hreflang、共享资源哈希和 Service Worker 缓存全部通过。
6. 2 号验证官独立复核并明确 `PASS` 后，才可提交实现和推送。
7. `docs/DEVELOPMENT_LOG.md` 记录范围、边界、测试、验证官结论、实现 SHA、CI 和正式站验收；没有证据不得写 `ONLINE PASS`。

## 10. 版本与决策记录

架构级变化使用 Major，新增能力使用 Minor，错误修复使用 Patch。每次重要模块修改记录版本、日期、时间、变更说明和迁移影响。本文是 V2.0 架构原则；可执行的规则契约以 `.github/copilot-instructions.md`、`docs/ENGINEERING_RULES_PLATFORM_ARCHITECTURE.md` 和自动化门禁为准，若有冲突，后者的安全与失败关闭约束优先。

V2.0 成功标准不是目录看起来“全新”，而是第 50 个工具比第 20 个工具更容易复用已有 Core、Schema、Validator、Parser、Rules、Vendor、Exporter 和测试证据，同时不牺牲已上线工具的正确性、可访问性、SEO 或隐私边界。
