# NetEngineerLab 西班牙语分批上线计划 — V1.3 Launch

## 目标

在现有 `en + zh` 多语言链上正式启用 `es`，复用同一计算引擎和工具 slug，同时允许西班牙语按工具分批上线，避免未完成页面被索引。

## URL 约定

- 首页：`/es/`
- 工具目录：`/tools/es/`
- 工具：`/tools/{tool-slug}/es/`
- 页面语言：`lang="es"`
- SEO：已发布页面输出 self canonical、`hreflang="es"`、英文/中文 alternate 与 `x-default`

## 首批正式上线的 10 个旗舰工具

1. `fiber-loss`
2. `optical-power-budget`
3. `pon-splitter-loss`
4. `bandwidth-calculator`
5. `subnet-calculator`
6. `vlan-ip-capacity-planner`
7. `poe-power-budget-calculator`
8. `pue-data-center-energy-efficiency`
9. `ups-capacity-battery-runtime-calculator`
10. `wireless-link-budget-calculator`

## V1.3 发布状态

- `es.status = active`
- 10 个旗舰工具标记 `nel-translation-status=launch`
- sitemap 中包含 16 个西语正式 URL
- 首批工具 hreflang 已包含 `en / zh-CN / es / x-default`
- 其余 25 个 active tools 暂无 `/es/` 发布页，不进入西语 sitemap/hreflang
- `es/404.html` 保持 noindex

## 发布门禁

每批工具必须同时满足：

- 静态 UI、FAQ、工程方法、限制、参考资料完成西语审校；
- 动态结果、状态和复制提示通过西语运行层处理；
- `searchIntent`、`primaryTopic`、`longTailQuestions`、`reviewedAt` 有西语字段；
- 页面 canonical / hreflang / sitemap / JSON-LD / robots 正确；
- 所有 CSS、JS、manifest、data 本地资源引用可解析；
- Tool / Workflow / Page Registry 与 I18N、SEO/GEO 审计通过；
- 对应计算引擎测试通过。

## 架构升级

V1.3 将原有“active locale 必须一次覆盖全部工具”的测试假设升级为 **Partial Locale Rollout**：

- active locale 可以只发布已完成的工具；
- Page Registry 以实际存在的 locale translation 生成页面；
- 工具目录 ItemList 只列出该语言已发布工具；
- SEO/GEO Audit 只读取该工具实际可用语言；
- 未翻译工具不会被误生成西语 URL 或 hreflang。

## 后续观察

上线后可按 4–8 周窗口观察西语 impressions、clicks、国家来源、索引率、长尾查询和工具完成率，再决定第二批优先顺序。
