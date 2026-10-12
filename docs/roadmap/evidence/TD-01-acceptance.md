# TD-01 独立最终验收报告：规范专题 URL 治理

- **结论：PASS（本地验收）**
- **实现者：**`/root`
- **独立审计者：**`/root/crosswalk_audit`（未参与实现）
- **验收日期：**2026-10-11
- **生产部署：**否。Cloudflare Pages 配置和 Wrangler 响应均为本地/隔离副本证据，不代表生产 URL、索引或响应头发生变化。

## 验收结论

TD-01 原始交付与验收范围已满足：三个旧 URL 均有保留或合并理由；本地配置明确了 switch alias 的 301、两个保留 stub 的 noindex；隔离构建核验 canonical、hreflang、sitemap、链接目标和生成器不会覆盖正式 Hub。两个保留 stub 中原先指向不存在 case 页的链接已从生成产物移除。没有创建虚构 case 页面或改动正式双语 Hub。外部 Search Console、外链和流量数据不可用，报告未推断相关指标。

## 实际差异审查

仅本任务预期实现文件出现目标差异：

| 文件 | SHA-256 | 审计结果 |
|---|---|---|
| `scripts/build-topic-hubs.js` | `dd7054cd214103688ff1274ff41225aadd6ece40951ce14b50151498db3f3632` | 仅跳过 active/indexable 正式 route，并过滤无本地 `index.html` 的资源链接；生成器日志显示规范 switch Hub 未覆盖。 |
| `website/data/content-registry.json` | `7a7afaf911c27cb76bd38506838a09ab4468f43fd23629fc174d0358aeeeee56` | 稳定 topic ID 保留，slug 指向正式 `switch-oversubscription`。 |
| `website/_redirects` | `2f9066c4c33b37f00d1b2fc4156387a45dd08d7f9f1cdfa28f3727c7de1ec7b0` | 英文旧 switch URL 到规范 URL 的单条 301。 |
| `website/_headers` | `e234046e8c95fe4bbf637ecd3fc7fb45bb5fd2df887dade8eec1ee44535abaa0` | 两个保留 stub 路径均配置 `X-Robots-Tag: noindex`。 |
| `website/topics/pon-optical/index.html` | `4b781ea4e793dda4cb3d878256ef70629b1110e89c1fd277c2121552dc0f529b` | 隔离副本生成结果；移除不存在的 PON case 链接。 |
| `website/topics/data-center-capacity/index.html` | `1d6af20b64b468621c633424c7797247b19a6c0b8637f7831ec122ea4a5ce311` | 隔离副本生成结果；移除不存在的 capacity case 链接。 |

switching 旧 stub 未重生成；Cloudflare redirect 接管旧路径。此前已有的用户未提交改动仍显示在 git status，包括首页、其他专题 Hub、工具 service worker、文档和图片；本次审查没有编辑这些文件，也未发现额外全站生成污染。队列当前仍为 `pending=40, completed=0, active=TD-01`；本报告不自行改写队列状态。

## 验证证据

`docs/roadmap/evidence/TD-01/validation-summary.json` 记录 15/15 检查通过，以下 SHA-256 均在本次审查中重新计算并与当前内容一致：

| 证据 | SHA-256 | 复核结果 |
|---|---|---|
| `validation.js` | `d85071a880aef8df4c6ab86f0888d46b95d9de9f99579db8d5c002431cc87488` | 检查定义与摘要一致；检查内容包括路由映射、host 配置、双语 canonical/hreflang、sitemap、缺失 case 和旧链接。 |
| `validation-summary.json` | `1d7c88a8e476d4821f0a4ffcdb85f1be9ef0e23f44fae6c5a84befdda80ff7b4` | 15 项全部 `pass=true`。 |
| `content.txt` | `2d53a06d5714e87519abec6287c620562e5513295f34e5ebc91b86bb01e99f19` | 稳定 ID/slug 与正式 route 唯一性通过。 |
| `calculation.txt` | `f23a61aa2f6c917bd48aeb36c3745e0463fafca3f325a8ad1516d534281e19e4` | 三路径 disposition/映射完整性与唯一性通过。 |
| `links.txt` | `82549a5d32d1d24beceef72c23a438507f49085eac975835dcdaa0d11918917c` | 两个保留 stub 的链接目标扫描无断链；旧 switch href 由独立 redirect 检查覆盖。 |
| `broken-links.txt` | `63835d52ab803f0bde9629b3ba50c5e7ba252ed8c420b418c963f2158ec16438` | 两个保留 stub 扫描无断链。 |
| `generator.txt` | `70106bdb703177dfcb4d757a3a193a6964beab2bdfbaad0b3d95c4d27be601cb` | 规范 Hub 哈希保持不变；缺失 case route 被跳过；保留 stub 输出哈希与当前产物一致。 |
| `build.txt` | `e9bcf2c437acca937ea5ea88da05fb8007832ec5bb1851bf5b0cd155a30eff7a` | 多语言构建在隔离副本 PASS；生成 166 个 sitemap URL；未部署。 |
| `redirects.txt` | `e345fa308dc779dd8fe85a67827b8e52d94f1d87a6d534d253c12e02071b1a45` | redirect 配置内容及目标通过。 |
| `wrangler-runtime.txt` | `3946f83d619f8eccacbbb7b2606fc8ea5046914ab7ee57e2a584299c0216939f` | Wrangler 4.149.0 Pages dev 在隔离副本确认旧 switch 请求 301/Location、保留 stub 200/noindex，并解析新增规则。日志同时记录一个既有双 wildcard header 被跳过的无关警告。 |
| `canonical.txt` | `3df5c5b0464992e87be55d73ff7dec83ac86c1e0991c6d5f8473d18026bef564` | 英中 canonical 与三种 hreflang 通过。 |
| `sitemap.txt` | `861b56facc86a8d0d3ef6a12c68cbd3032c6e0a2617d922a6456c79881f18667` | 规范英中 route/alternate 存在，保留 stub 不在 sitemap。 |
| `TD-01-url-governance.md` | `f7245655853d3af536a270c23fb284106a974b487bc8781276934f5d8c5a7d06` | 决策表、断链发现、措施及线上数据限制与实际差异一致。 |

准入完整性也已复核：`TD-01-admission.json` 当前 SHA-256 为 `aa6e84feebafe172451e2791026c217b5f69a1dcb090ee736423807b5ff9a443`，与队列 active admission checkpoint 一致；其中准入报告和计划的 SHA-256 分别与 `TD-01-admission.md`（`a91c57bc5321da84befeac2ffa189a1796b822fd5f4720347dbe5c5f05859903`）及 `TD-01-plan.md`（`ef12c0875589c1b38ce6e1c4390adca79d53e2db12ad99ba32b74ec12cae9b14`）当前内容一致。

验证摘要指向的隔离构建目录仍存在。本审计复核实际差异、日志内容、15 项摘要和当前 SHA-256；没有运行会重写日志/页面的构建或验证脚本。

## 限制

Wrangler 证据证明本地 Cloudflare Pages 规则行为，不证明生产 redirect、noindex、canonical 或搜索引擎索引状态。生产上线仍须后续授权和线上验收。此报告由未参与实现的 Agent 独立签署，供队列 complete 阶段引用。
