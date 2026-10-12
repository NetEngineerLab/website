# TD-01 专题 URL 决策与本地迁移证据

- **交付范围：**三个旧专题 URL 的决策，以及 Cloudflare Pages 本地 redirect/noindex 配置、注册 slug 治理、旧生成器保护和两个保留 stub 的断链清理。
- **状态：**本地实现和针对性验证已运行；等待独立最终验收。没有生产写入、部署或发布。
- **观测时间：**2026-10-11。live URL 状态仅取自同日只读准入审计；Cloudflare Pages 响应来自隔离副本 Wrangler 本地服务。

## Source / Method / Validation

**Source。**依据包括 `TD-01-plan.md`、`TD-01-admission.md`、V2.0 Hub 规范、内容与 Page Registry、sitemap、旧 stub、`scripts/build-topic-hubs.js`、Cloudflare Pages 的 `website/_redirects` 与 `website/_headers`。未读取 Search Console、外部 backlink 数据或生产流量分析。

**Method。**逐项核对 slug/route 唯一性、正式双语 Hub canonical/hreflang、sitemap、旧页面反链、redirect/header 配置和实际本地 Pages 响应。构建和生成器运行均在临时副本执行；只有两份原先干净的保留 stub 输出复制回工作区。

**发现与处理。**内容注册表中登记的三个案例目标 `/cases/pon-splitter-loss-margin/`、`/cases/data-center-capacity-review/`、`/cases/campus-switch-oversubscription/` 均没有对应本地页面。生成器现在只显示实际存在的本地目标；隔离副本重生成 PON 与 data-center-capacity 保留 stub 后，两个页面不再链接到不存在的 case 页面。旧 switching stub 由 Cloudflare 301 接管，不重生成。未创建虚构 case 页面或 redirect。

## 逐 URL 决策

| 当前 URL | 观测与本地状态 | 决策 |
|---|---|---|
| `/topics/pon-optical/` | 准入时 live 200；本地保留页面，无 HTML canonical；非正式 sitemap route。Cloudflare Pages 本地请求仍为 200，并带 `X-Robots-Tag: noindex`。 | 保留 URL；待 TD-02 建设完整 Hub 后复核索引。无等价替代 Hub。 |
| `/topics/data-center-capacity/` | 准入时 live 200；本地保留页面，无 HTML canonical；非正式 sitemap route。Cloudflare Pages 本地请求仍为 200，并带 `X-Robots-Tag: noindex`。 | 保留 URL，不重定向到 cooling-only 页面；旧名称包含 compute、power 与 cooling。 |
| `/topics/switching-oversubscription/` | 准入时 live 200；本地 alias 规则返回 301 到规范 Hub。 | 将注册 slug 更新为正式目标；旧静态 href 由 301 兼容。 |
| `/topics/switch-oversubscription/` | 正式 active/indexable Page Registry route；英文与中文页面 canonical 正确，双语路由在 sitemap 中。生成器日志显示跳过正式 route。 | 保留为唯一规范 switch Hub。 |

**外部数据限制。**仓库和当前连接权限不能提供外部 backlink、搜索索引或流量数据，因此不声称流量、排名或 SEO 结果。旧 stub 的 noindex/redirect 只在本地 Cloudflare Pages emulator 验证；生产状态未验证。

## 本地验证结果

- `content.txt`：稳定 topic ID 保留并映射到规范 slug；正式 active/indexable route 唯一。
- `calculation.txt`：三个旧路径均有唯一 disposition/目标；映射无冲突。
- `redirects.txt` 与 `wrangler-runtime.txt`：Pages 解析 9 条 redirect；旧 switch URL 返回 301，Location 为 `/topics/switch-oversubscription/`。
- `canonical.txt` 与 `sitemap.txt`：英文、中文 canonical/hreflang 检查通过；构建 sitemap 共 166 个 URL，含规范双语 Hub，不含两个保留 stub。
- `links.txt` 与 `broken-links.txt`：两个保留 stub 全部内部 href 指向存在页面；case 断链已从生成输出去掉。切换旧页由已验证 redirect alias 接管。
- `generator.txt`：正式 switch Hub 被跳过且哈希不变；PON/data-center 生成器记录跳过缺失 case routes。
- `validation.js` 与 `validation-summary.json`：本地可重复验证脚本及本次 15 项检查结果。

`wrangler-runtime.txt` 记录 Wrangler 对既有 `/tools/*/images/*` 双 wildcard header 的警告；本次增加的两个 exact path noindex 规则均被解析并在运行时返回预期响应。生产 redirect、noindex 和搜索引擎索引状态均未验证。

## 交付变更

- `website/data/content-registry.json`：保留 `topic-switching-oversubscription` ID，slug 改为 `switch-oversubscription`。
- `scripts/build-topic-hubs.js`：避免覆盖已由正式 active/indexable route 管理的 Hub；生成链接前过滤不存在的本地页面目标。
- `website/_redirects`：Cloudflare Pages 英文旧 switch URL 301 规则。
- `website/_headers`：两个保留 stub 的 `X-Robots-Tag: noindex`。
- `website/topics/pon-optical/index.html` 与 `website/topics/data-center-capacity/index.html`：应用隔离副本的重新生成结果，移除失效 case 链接并使用更新后的 topic slug。

所有构建产物与响应仅代表本地验证，不代表已部署或已改变线上 URL。

