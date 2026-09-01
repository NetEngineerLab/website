# NetEngineerLab V2.0 SEO/GEO 页面架构规范（适配冻结版）

**版本：V2.0.0-adapted**  
**制定日期：2026-09-01**  
**状态：架构冻结，渐进实施**  
**上位文档：** [`NETENGINEERLAB_V2_ARCHITECTURE_SPEC.md`](./NETENGINEERLAB_V2_ARCHITECTURE_SPEC.md)、[`NETENGINEERLAB_V2_IMPLEMENTATION_SPEC.md`](./NETENGINEERLAB_V2_IMPLEMENTATION_SPEC.md)

## 1. 必要性与采纳结论

采纳“Page Data → SEO Resolver → Metadata/Canonical/Hreflang → JSON-LD/Breadcrumb → Internal Links → Sitemap”的单一数据源方向。现有页面已经具备多数 SEO/GEO 元素，但规则分散在页面、目录、脚本和开发说明中；当页面扩展到工具、指南、参考资料、术语和主题中心后，继续手工维护会增加 canonical、hreflang、结构化数据、面包屑、内链和 Sitemap 相互不一致的风险。

本规范用于统一数据契约和发布门禁，不授权一次性重写静态站、改变公开 URL 或批量生成薄内容。当前 HTML/JavaScript 架构先通过 JSON/JSDoc、现有目录和生成脚本渐进实施；TypeScript 与 `src/` 仅是未来可选迁移目标。

## 2. 唯一来源与生成链

注册模型采用“逻辑 page-family 记录 + localized fields + 构建时按 active locale 展开”的方式，不为中英文复制两份工具清单。每个 page-family 至少提供：Schema 版本、页面类型、稳定 ID、生命周期状态（`planned`/`active`/`retired`）、是否可索引、localized 标题/描述/搜索意图/主主题/长尾问题、路由键、面包屑、结构化数据所需事实、相关内容、来源、负责人、发布日期和复核日期。构建器将 page-family 与启用语言组合，生成带 locale、最终 URL、robots、canonical、hreflang 和 Sitemap 资格的确定性页面记录。

只有 `status === active`、`indexable === true`、locale 为 active、目标存在且发布产物返回 200 的页面记录才允许输出 `index,follow` 并进入 Sitemap。`planned`、`retired`、缺少语言内容、错误页、离线页、集成页和重复状态页必须失败关闭为不可索引；撤回页面还必须明确重定向或 404/410 策略，不得仅从清单静默消失。

页面正文中的工程数据、公式、规则、单位、假设、限制和来源是事实源；SEO Metadata、JSON-LD、FAQ 标记、面包屑、内部链接和 Sitemap 是从同一事实源派生的视图，不得建立互相漂移的重复真相源。生成或审计顺序冻结为：

```text
Page Registry / Engineering Data
  → SEO Resolver
  → title + description + robots + canonical + hreflang
  → visible breadcrumb + JSON-LD
  → related content / topic links
  → canonical-only sitemap
  → CI consistency gates
```

当前权威源边界冻结如下：工具 page-family 集合及本地化字段来自 `website/data/tools-catalog.json`；基础公共路由来自 `website/data/sitemap-routes.json`；启用语言、目录策略和最终路径展开来自 `website/data/locales.json`；`website/data/seo-config.js` 只提供站点级 SEO 默认值，不得作为工具路由源。现有构建/审计脚本必须组合这些来源并验证冲突；不得为了实现本规范另建一份与工具目录脱节的页面清单。尤其不能使用 `seo-config.js` 中的通用中文 prefix 推导工具 URL，工具路由必须按 `locales.json.directoryStrategy.toolPage` 展开。

## 3. 页面类型与最小内容契约

规划页面类型为 `home`、`directory`、`tool`、`guide`、`reference`、`vendor`、`compare`、`glossary`、`hub`、`learn`、`about`、`contact`、`legal`。现有 `/tools/` 与 `/tools/zh/` 映射为 `directory`，`/privacy/`、`/terms/` 及语言对应页映射为 `legal`；未来其他静态公共页面必须先增加无歧义类型或显式映射。只有实际建立页面模板、目录映射和审计规则的类型才可启用；枚举不能被当作批量生成页面的任务清单。所有 `sitemap-routes.json` 公共路由和 active 工具 page-family 都必须能展开为唯一页面记录，未知类型或未映射路由必须阻止 Sitemap 生成。

工具页保持现行内容顺序：

```text
H1 → 问题定义/适用场景 → 输入或操作 → 核心结果
→ 公式/判断逻辑 → 假设与限制 → Engineering Notes
→ 来源与复核日期 → FAQ → Related Tools/Guides
```

每个可索引页面必须有且仅有一个可见 H1，并定义一个主要搜索意图。工具页必须能回答输入、输出、单位、计算或判断依据、适用边界、结果解释和下一步行动；参考页必须说明数据范围、来源、版本和更新方法；指南页必须有可执行步骤、前置条件和验证方式。标题和 description 以准确、独特、可读为硬要求，字符长度只作为审计提示，不设机械失败阈值。

## 4. URL、语言与索引冻结规则

当前生产 URL 是已存在的 SEO 资产，冻结为：

```text
English tool: /tools/<slug>/
Chinese tool: /tools/<slug>/zh/
English catalog: /tools/
Chinese catalog: /tools/zh/
```

分析稿中的 `/zh/tools/<slug>/` 不适用于当前站点，不得作为本轮 URL 冻结结果。未来若统一为语言前缀路由，必须先完成配置驱动目录策略、旧 URL 逐条 301、canonical/hreflang、站内链接、Sitemap、Manifest、Service Worker、PWA 安装、离线缓存、搜索索引影响和正式站浏览器验收；缺少任一门禁不得迁移。

可索引页必须使用自引用 canonical；同一基础页面必须具有精确的 `en`、`zh-CN`、`x-default` 双向 hreflang 集合。查询参数只表示当前页计算状态时，canonical 指向无参数基础页；只有在产品明确实现可分享且具有独立长期价值的页面时，才能另行设计索引策略。测试页、集成页、离线页、错误页和重复状态页不得进入 Sitemap。

## 5. Metadata、JSON-LD 与可见内容

SEO Resolver 的输出至少覆盖 title、description、robots、canonical、hreflang、Open Graph 和 Twitter metadata。页面不得依赖仅在客户端晚加载的脚本补齐索引关键标签；构建产物中的最终 HTML 必须可审计。

JSON-LD 必须描述页面真实可见的主内容，并与 title、description、canonical、语言、面包屑、FAQ、来源和功能一致。基础策略为：站点级 `Organization`/`WebSite`，工具页 `WebPage` + 合适的 `WebApplication` 或 `SoftwareApplication` + `BreadcrumbList`，指南页 `Article`，术语页 `DefinedTerm`。只有页面确实提供可下载、可描述的数据集时才使用 `Dataset`；不得伪造评分、评论、作者、价格、功能或数据集。

`WebApplication` 与 `SoftwareApplication` 是页面语义选择，不因 SEO 理由强制批量互换。FAQ 必须是可见、真实、页面相关且答案自包含的工程问题；`FAQPage` 可以保留作语义标记，但不得把 Google FAQ 富结果当作一般工具站的承诺或验收 KPI。结构化数据通过不等于获得富结果。

面包屑必须同时可见且机器可读，两者名称、顺序和 URL 一致。JSON-LD 不得替代正文；任何仅为机器生成、用户不可见的重要声明都视为失败。

## 6. 内链、主题集群与长尾问题

采用“Hub/目录 → Tool → Guide/Reference/Glossary → 相邻 Tool”的主题集群。每页相关内容由注册数据和明确规则解析，优先链接上级主题、前置知识、下一步工具和能解释当前结果的资料；禁止随机互链、全站重复同一组链接或使用无语义的“点击这里”。

长尾问题来自工程师的真实任务、故障现象、设备/协议、单位、限制和结果解释。关键词必须自然分布在标题、H1、导语、字段说明、示例、方法、FAQ 和相关内容中；不得隐藏、堆砌或为替换一个词建立近似页面。中文和英文分别按本地查询习惯编写，不做机械逐字翻译。

## 7. GEO 与爬虫边界

GEO 的执行目标是让工程结论易于理解、核验和引用：提供直接答案、确定性计算过程、可见来源、明确假设/限制、复核日期和稳定锚点。当前不要求所谓“AI 专用 Schema”，也不把额外文件作为搜索展示保证；基础技术 SEO、可访问的文本内容、语义化 HTML、内链和与可见内容一致的结构化数据仍是共同门禁。

`OAI-SearchBot` 用于 ChatGPT 搜索发现，应在公开内容策略允许时保持可访问并纳入 robots 审计；`GPTBot` 是独立的训练抓取控制，是否允许必须单独决策，不能与搜索可见性绑定。`ChatGPT-User`、Googlebot 及其他爬虫同样按各自用途和公开内容边界配置。当前 `website/robots.txt` 已明确允许 OAI-SearchBot，后续修改必须通过自动化回归检查。

## 8. Sitemap 与发布门禁

Sitemap 只收录发布、可索引、返回 200、使用生产 HTTPS 绝对地址且与 self-canonical 完全一致的 URL。实际 Sitemap 集合必须与页面注册源的期望集合做双向比较，禁止只比较数量。语言对、canonical、hreflang、JSON-LD URL、可见面包屑、内链目标和 PWA 路径必须共同通过一致性检查。

每个新增或迁移页面至少通过以下门禁：

1. Schema/注册数据完整、稳定 ID 无重复且 locale 配对完整。
2. title、description、H1、canonical、hreflang、robots、OG/Twitter 和 JSON-LD 与可见内容一致。
3. Sitemap 仅含 canonical 可索引 200 页，且内链无断链、自链接滥用或孤儿页。
4. 工程内容、公式、单位、来源、FAQ、日期和双语表达经人工准确性复核。
5. `npm run verify`、浏览器验收、2 号验证官 `PASS` 和 `docs/DEVELOPMENT_LOG.md` 证据齐全后才可发布。

## 9. 渐进实施顺序

第一阶段只补充统一 Page Schema/Registry 字段和审计规则，不改 URL、页面布局和现有计算。第二阶段让 SEO Resolver 生成或核验 Metadata、canonical、hreflang、JSON-LD 与面包屑。第三阶段建立确定性的主题集群和内部链接解析。第四阶段在 Guide、Reference、Glossary 或 Hub 页面真实上线时逐类启用模板与 Schema。旧页面仅在维护或高价值重构时迁入，必须保持前后输出、URL 和索引信号等价。

本规范不取代工程正确性、设计系统、PWA、安全、隐私和发布规范；发生冲突时，以“不破坏现有功能与 URL、事实准确、失败关闭、可验证证据”为优先原则。
