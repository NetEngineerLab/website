# TD-01 本地实现计划

范围：盘点三个旧专题 URL，交付决策表并实施最小本地 URL 治理变更。仅修改内容注册 slug、旧 stub 生成保护、Cloudflare redirect/noindex 配置、两个保留 stub 的生成产物及本任务证据；不改正式 Hub 或其他用户 dirty 页面，不部署或发布。外部 backlink/索引数据不可用，保持未知。

## 决策基线

| 旧 URL | 本地现状 | 处置 | 理由 |
|---|---|---|---|
| `/topics/pon-optical/` | 线上返回 200；注册表保留；非 sitemap 规范项；简单生成页，无 canonical | 保留该 slug，后续补强 Hub 时沿用 | 现有 V2.0 规范将其列为应建设的 PON 候选；仓库没有内容等价的替代 Hub。 |
| `/topics/data-center-capacity/` | 线上返回 200；注册表保留；非 sitemap 规范项；简单生成页，无 canonical | 保留旧 URL，暂不重定向 | 名称覆盖计算、供电和制冷，当前替代页只覆盖制冷；范围不等价，缺少将全部旧内容迁走的依据。 |
| `/topics/switching-oversubscription/` | 线上返回 200；注册表与生成器保留；非 sitemap 规范项；简单生成页，无 canonical | 规划合并到 `/topics/switch-oversubscription/` | 规范目标已在 Page Registry/sitemap 登记并有 canonical；两页主题意图重复。先更新注册 slug/生成关系；静态旧 href 作为 redirect alias 兼容。 |

规范目标 `/topics/switch-oversubscription/` 与 `/topics/data-center-cooling-capacity/` 均线上返回 200，且在 sitemap 登记 EN/ZH/x-default；线上 switch 目标有 canonical。旧 URL 的外部链接、搜索索引与流量不在仓库或当前连接权限内，本计划不声称已查得这些数据。保留的两个旧 URL 不做删除或 301。

## 最小本地实施清单（Cloudflare Pages，独立复核 PASS）

1. `website/data/content-registry.json`：保留 ID `topic-switching-oversubscription`，slug 更新为正式目标 `switch-oversubscription`。
2. `scripts/build-topic-hubs.js`：生成前识别 `website/data/sitemap-routes.json` 中 active/indexable 的正式 route；目标已被 Page Registry 拥有时跳过。生成链接时仅包含本地目标页面文件存在的资源；缺失 route 不生成断链。用隔离副本验证正式 Hub 不被覆盖、两个保留 stub 重生成且无断链，并记录被跳过的缺失 case route。
3. `website/_redirects`：新增英文 `/topics/switching-oversubscription/ /topics/switch-oversubscription/ 301`。无证据表明存在中文旧 switch URL，不虚构规则。该文件是 Cloudflare Pages 待部署配置，不代表生产已生效。
4. `website/_headers`：为 `/topics/pon-optical/` 与 `/topics/data-center-capacity/` 添加 `X-Robots-Tag: noindex`。保留 URL 可访问，不添加 self-canonical，不加入正式 route/sitemap；待完整 Hub/语言路由建设后复审索引状态。
5. 不改 `website/data/sitemap-routes.json`、正式 Hub 或用户已有 dirty 页面。更新注册 slug/生成关系中的源 slug；在隔离副本重生成两个保留 stub，仅将这两份干净的本地输出应用到工作区，以去掉无目标 case 资源链接。旧 switch stub HTML 保持为 redirect alias，由 301 接管，不要求其内容 href 归零。
6. 在隔离临时副本构建并检查 Cloudflare Pages 配置语法/匹配：验证 redirect source、destination、301；两个 headers path 对应的 noindex 规则；生成后的 `website/sitemap.xml` 不含两个保留 stub；规范双语 canonical/hreflang 与 sitemap 一致；链接目标有效；正式 Hub 不被生成器覆盖。Cloudflare 本地静态构建不能证明线上响应头或 redirect 已生效。检查重点包括两个保留 stub 的输出链接均指向存在的路由，未生成的 case route 作为明确跳过项记录。真实工作区 dirty 页面不运行会覆盖它们的构建。
7. 更新决策表说明本地实施证据与线上状态边界；保存 content、calculation（映射唯一性）、links、redirects、canonical、sitemap、broken-link 日志；由未参与实现者独立审计实际 diff、哈希和日志。

不得称为生产 redirect、noindex 或索引状态已改变；这些 Cloudflare Pages 配置只在隔离副本本地核对，生产行为未验证。

## 验证方法

- `content`：对照注册表、生成器、页面注册表、sitemap、旧页与规范页，确认每个旧 URL 都有唯一处置及依据。
- `calculation`：以 slug→canonical 映射的完整性、唯一性及无环检查实现；不是网络工程计算。
- `links`：枚举旧 slug 反链并确认所有链接可解析或有 Cloudflare Pages 301 兼容；HTML 扫描排除本证据目录。生产 redirect 响应不在本地验收范围。

## 负责人及审计

- 计划作者/总工：`/root`
- 独立准入审核：`/root/crosswalk_audit`，结论 PASS，仅限本地决策表和迁移方案，见 `TD-01-admission.md`。
- 实际实现 Agent：`/root`（队列认领已按实际实施者重绑定）
- 生产部署：否；已授权的本地规则不代表线上状态变化。
