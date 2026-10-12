# TD-01 独立准入审计：规范专题 URL 治理

- **结论：PASS（限定范围）**。准许开始 TD-01 的本地路由盘点、逐 URL 决策表和迁移清单工作；不代表迁移已实施或已验收，也不授权生产写入、发布或部署。
- **审计 Agent：**`/root/crosswalk_audit`（未参与 TD-01 方案或实现编写）
- **审计日期：**2026-10-11
- **范围：**审查原始 TD-01 工作包、专题 URL 规范、注册表、生成脚本、页面路由/sitemap、内链和只读 live HTTP 页面；本轮未编辑仓库路由或页面，未运行工程测试。

## 六项问题指纹

| 维度 | 审计结论 |
|---|---|
| 问题 | 旧内容注册表及其 stub 生成器维护的专题 slug，与正式多语言 Page Registry 路由存在分叉，导致重复入口、缺 canonical 或反链指向旧路径。TD-01 将这个明确的路由治理问题收敛为逐 URL 决策与迁移计划。 |
| 输入 | 原始 `TD-01` 行；`website/data/content-registry.json`、`website/data/sitemap-routes.json`；旧 stub 和现有 Hub；`scripts/build-topic-hubs.js`、`scripts/page-registry.js`、`scripts/build-multilingual.js`；`website/sitemap.xml`、`website/_redirects` 及相关反链。 |
| 输出 | 每个旧 URL 的保留/合并理由、规范目标、反向链接清单和本地迁移清单；外部流量/反链指标不可得时明确标记为未知并采用保守处置。 |
| 核心逻辑 | 以正式活动、可索引的 Page Registry URL 为 canonical 基准；逐 URL 核对语义范围、生成来源、现有内容及反链。只有语义等价且目标存在时才规划 301；无等价目标或主题范围不一致时保留旧 URL，不删除页面。 |
| 目标用户 | 维护 NetEngineerLab 路由和内容资产的站点维护者，以及通过专题页查找网络工程工具、指南和案例的工程师。 |
| 主要领域 | NetEngineerLab 站内内容路由、专题治理和搜索索引边界；不属于网络计算器功能，也不建立跨站路由。 |

## Source、Method 与 Validation

- **Source：PASS。**原始工作包为 `docs/roadmap/TOPIC_DEVELOPMENT_BACKLOG.json` 中 `TD-01`；规范依据为 `docs/NETENGINEERLAB_TOPIC_HUB_V2.0_SPEC.md` 第 3 节和第 6 节、专题流程 `docs/roadmap/TOPIC_AUTO_DEVELOPMENT_WORKFLOW.md`。实际资产来源包括两个注册表、旧生成器、正式 Page Registry/多语言构建脚本、stub/Hub 文件、sitemap 与 redirects。2026-10-11 对 live URL 做了只读 HEAD/GET；未读取 Search Console 或外部 backlink 分析数据。
- **Method：PASS。**对每个候选 slug 并行核对注册 ID/slug、正式 route、页面文件、生成器输出路径、规范标签、sitemap 收录、站内反链和 live 状态；按内容等价性与现存目标作保留/合并判断。外部流量数据缺失时不据此推测流量或搜索表现。
- **Validation：PASS（计划可执行；实施检查尚未运行）。**交付后的本地检查须覆盖 route 目标唯一性、别名/redirect 目标存在、redirect 无环、反链目标有效、canonical/hreflang 与 sitemap 一致、构建产物无重复 indexable URL。对纯治理任务，`calculation` 检查落实为 slug 到 canonical target 的确定性映射、唯一性及完整性核对，不得省略该项。生产 redirect 状态只能在获准发布后由线上验证；不属于本准入授权。

## Mandatory Gates

| 门禁 | 结论 | 依据/限制 |
|---|---|---|
| 问题定义 | PASS | 旧内容注册/生成链与正式路由链存在分叉，相关 URL 可逐项列明。 |
| 输入与输出明确 | PASS | 输入资产清单和逐 URL 决策表、反链清单、迁移清单均已界定。 |
| 核心逻辑定义 | PASS | 以正式活动路由为准；语义等价才合并，否则保留。 |
| Source 可核实 | PASS | 仓库路径和规范文件可直接核验；live URL 已只读请求。 |
| Method 可核实 | PASS | 注册、生成、route、sitemap、反链和 live 状态逐 URL 对账。 |
| Validation 可核实 | PASS（实现后待执行） | 已定义可执行的本地检查；当前 PASS 仅表示验证方案可复核，不表示工程测试已通过。 |
| 跨站边界 | PASS | 仅治理 `netengineerlab.com` 的英文/中文 URL、站内生成与反链。GitHub 外链不改写，不迁移其他域名，不做部署。 |

## Value Gates

| 价值门禁 | 结论 | 依据 |
|---|---|---|
| 用户需求 | PASS（内部证据） | 现有 Hub 注册和 search-intent 字段、旧页反链体现用户查找专题内容的既有入口；不声称完成用户访谈或流量分析。 |
| 工程价值 | PASS | 单一 canonical 决策及明确迁移表可减少重复 stub、错误内链和生成覆盖风险。 |
| SEO 价值 | PASS（技术证据） | live 旧 stub 与正式页存在双 200 入口；旧 stub 无 canonical/robots meta，正式 `switch-oversubscription` 页面有 canonical 和 `index,follow`。不推断排名或流量损失。 |
| 内容关联价值 | PASS | 内容注册及 stub 中有专题关系和工具/指南链接；治理可将这些反链统一到确定的 URL。 |
| 回访/重复使用价值 | 未主张 | 本任务是 URL 治理，没有足够证据证明回访提升。 |
| 变现价值 | 未主张 | 无变现证据；不是本次准入所需的两个价值门禁。 |

## 旧路由处置建议与风险

2026-10-11 只读 live HTTP 结果：下列四条英文 URL 均返回 `200`。`pon-optical`、`data-center-capacity`、`switching-oversubscription` 当前 live stub 均未发现 canonical/robots meta；`switch-oversubscription` 页面存在自身 canonical，robots 为 `index,follow,max-image-preview:large,max-snippet:-1`。请求没有执行任何写入。

| 旧 URL | 建议 disposition | 理由与风险 |
|---|---|---|
| `/topics/pon-optical/` | **保留 slug**，后续可完善 Hub | 有实际工具/指南/案例资产，规范文件将其列为应补强的候选 Hub，仓库中没有等价替代 URL。风险是当前 stub 内容浅且缺 canonical；应在保留 URL 的前提下逐步补齐，不应创建第二个 PON Hub URL。 |
| `/topics/data-center-capacity/` | **保留；暂不重定向** | 旧页面标题/注册范围声称 compute、power、cooling，候选 `/topics/data-center-cooling-capacity/` 仅聚焦 cooling，语义不等价尚未被排除。无 Search Console/backlink 数据时，贸然 301 可能丢失较宽主题入口；先保留 URL，并在决策表说明需要范围裁定。 |
| `/topics/switching-oversubscription/` | **本地计划合并至 `/topics/switch-oversubscription/`，先改站内反链，再规划 301** | 两 URL live 均返回 200；旧页题名与主题意图重复，正式目标已在 Page Registry/sitemap 中定义且有 canonical。风险是外部反链/流量数据未知；保留旧路径到迁移时由 301 接收请求，不直接删除或无跳转下线。生产 redirect 需单独发布授权。 |

无 Search Console/backlink 指标时，上述“保留”或“保留旧路径并 301 到已存在等价目标”的建议是风险控制决策，不是流量判断。TD-01 清单必须保留数据未知标记；不得把本审计中的建议冒充为生产 redirect 已验证。

## 实施交付物与验收建议

1. 逐 URL 决策表：登记旧 slug、内容范围、注册/生成源、正式目标、规范标签、sitemap 状态、站内反链、live 响应、disposition、理由和未知数据。
2. 迁移清单：只列应修改的本地注册、生成、反链及 redirect 配置；每条记录修改文件、目标 URL、预期状态和回滚依据。保留项不得被删除或意外重新生成覆盖。
3. 检查并保存非空日志：`content`、`calculation`（以映射完整性/唯一性校验实现）、`links`，以及 acceptance 指定的 redirects、canonical、sitemap、断链核验。检查必须在隔离副本/可审阅工作区进行，避免全站构建覆盖用户文件。
4. 独立验收实际 diff 与输出，确认 canonical/sitemap/redirect 的目标和决策表相符，并核对当前用户改动未被覆盖。当前工作树已有未提交修改，包括 `website/topics/switch-oversubscription/index.html`、中文对应页面以及其他首页/专题文件；本审计未修改这些文件。
5. 此准入证据只允许开始本地实现。不得据此自动 commit、push、merge、部署、发布或改写线上 URL。

## 补充：建议的最小本地实现范围（审计建议，未实施）

审计 Agent `/root/crosswalk_audit` 仅提供范围建议，不承担实现工作。实现与最终验收须由不同 Agent 完成。建议的最小可审阅 diff：

1. `website/data/content-registry.json`：保留稳定 topic ID `topic-switching-oversubscription`，把其 slug 改为正式规范 slug `switch-oversubscription`。`related_topics` 保留稳定 ID，不另造重复 topic。
2. `scripts/build-topic-hubs.js`：生成前识别 `website/data/sitemap-routes.json` 中 active/indexable 正式 route；若生成目标已由正式 Page Registry 拥有则跳过，防止旧生成器将完整规范 Hub 覆盖成 stub。通过临时 fixture 证明规范目标不被覆盖、未注册的旧 stub 目标仍可按原有方式处理。
3. `website/_redirects`：添加英文别名 `/topics/switching-oversubscription/` 到 `/topics/switch-oversubscription/` 的 301 规则。仓库和只读 live 证据中不存在 `/zh/topics/switching-oversubscription/` 旧 URL，因此不添加该规则。此文件是待部署的本地 host 配置；不发布、不部署。
4. `website/_headers`：对仍保留但当前仅为薄 stub、且未进入正式 sitemap route registry 的 `/topics/pon-optical/` 与 `/topics/data-center-capacity/` 设置暂时 `X-Robots-Tag: noindex`。保留 URL 可访问，不将 stub 加入 sitemap。待 TD-02 或后续范围治理为其提供完整正式路由和语言页面后再复核索引状态。不要为保留的 noindex stub 同时配置 self-canonical。
5. 不改 `website/data/sitemap-routes.json`：规范交换机 Hub `/topics/switch-oversubscription/` 和 cooling Hub 已在正式双语 routes/sitemap；旧 PON、广义 data-center stub 不是完整的正式双语 page family，硬加 route 会触发页面/translation 要求并扩大到 Hub 建设。
6. 本地迁移采用 301 兼容现有静态 stub 中的旧 switch href；稳定 topic ID/slug 更新生成关系所用 URL。若验收要求静态旧 href 全部改写为零旧引用，则必须把 stub HTML 或构建改写器纳入实现范围，超出本次“只改配置/脚本、不改网站产品页”的约束，须先调整范围，不能声称已完成该项。

建议在隔离临时副本应用上述变更并运行 registry contract、multilingual build 和链接/路由检查，验明：规范英文/中文 route 唯一；正式 canonical Hub 不被旧生成器覆盖；旧 switch URL 产生正确 301 且无环；两个保留 stub 可访问但返回 noindex 且不在 sitemap；内部链接均指向存在的页面或受支持的 redirect。然后对照真实工作区的原有 dirty 页面哈希/差异，确认实现过程未覆盖未提交用户修改。临时构建与配置验证证明本地迁移产物；因用户暂不自动上线，不声称生产 301 或索引状态已改变。

## 2026-10-11 补充复核：修订实施范围

应用户澄清，本任务的目标托管平台为 Cloudflare Pages；实施配置应放在 `website/_redirects` 与 `website/_headers`，`vercel.json` 不属于本任务改动。独立审核者 `/root/crosswalk_audit` 只读复核了修订计划，结论 PASS。

隔离链接盘点进一步发现，三个旧 stub 分别引用了没有本地页面的案例路径：`/cases/pon-splitter-loss-margin/`、`/cases/data-center-capacity-review/`、`/cases/campus-switch-oversubscription/`。独立审核者确认只重生成两个保留且原先干净的 PON 与 data-center-capacity stub，并由生成器跳过缺失页面链接，属于修复 TD-01 断链验收；switching stub 由 301 alias 接管，不重生成。计划明确不创建虚构案例页/重定向，不覆盖正式 Hub 或已有用户脏页。该范围扩展复核结论 PASS，仍需依据实际产物与日志做最终验收。

审核者建议用 Wrangler Pages 本地服务对带尾斜杠路径检查 301 Location、两个 `X-Robots-Tag: noindex` 响应，并验证保留页面仍可访问；不得把本地结果说成生产状态。最终验收另行独立完成。
