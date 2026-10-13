# TD-02 独立准入审计：PON 光网络设计与诊断 Hub

- 结论：PASS（准许本地实现；不代表发布或生产部署）。
- 方案作者：`/root`；实现 Agent：`/root/td02_implement`。
- 计划独立审计 Agent：`/root/td02_admission_audit`（不得参与实现）。
- 日期：2026-10-13。

## 范围与问题指纹

现有 `/topics/pon-optical/` 是唯一保留的 PON/光网络 Hub URL，但页面需要从简略工具清单提升为可执行的设计与故障诊断路径。仓库已有真实工具和工作流：`fiber-loss`、`pon-splitter-loss`、`optical-power-budget`、`pon-distance`、`onu-rx-power`、`otdr-event`，以及 `optical-link-design` 与 `optical-troubleshooting`。本任务不新增重复计算器、不新建第二个 PON Hub URL，也不修改冻结计算引擎。

## 真实输入与可交付物

| 输入 | 证据 |
|---|---|
| 现有英文/中文 PON Hub | `website/topics/pon-optical/index.html`、`website/zh/topics/pon-optical/index.html` |
| 工具注册与双语路由 | `src/registry/tool-registry.json`、`website/data/sitemap-routes.json`、`website/sitemap.xml` |
| 内容资产与主题归属 | `website/data/content-registry.json` |
| 设计/排障流程 | `src/registry/workflow-registry.json` |
| 规范 | `docs/NETENGINEERLAB_TOPIC_HUB_V2.0_SPEC.md`、`docs/NETENGINEERLAB_TOPIC_GROWTH_GITHUB_SYNC_STANDARD_V1.1.md` |

交付范围：增强现有英中 `/topics/pon-optical/` Hub、维护资产登记/清单、补一篇主指南（英中）或在现有主指南中形成完整设计→计算→校核与异常→定位→复测路径。所有新增内容需包含公式、变量单位、可复算案例、适用限制、FAQ、工具和指南双向内链、canonical/hreflang/CollectionPage 元数据。

## 门禁判断

- 问题定义：PASS。当前 Hub 资源入口浅，无法串联设计与诊断闭环；重复页面风险由 TD-01 决策约束为保留现有 `pon-optical` slug。
- 输入输出：PASS。以上真实注册表、页面和工作流可直接核验；交付物和验收日志已界定。
- 工程价值：PASS。设计路径把物理损耗→分光→光预算→距离/接收功率校核串起来；排障路径把 ONU 收光异常→光功率计/OTDR 事件→预算对照→现场复测串起来。
- 内容边界：PASS。GPON/XGS-PON 等参数只作来源和适用范围说明，设备功率、灵敏度、过载阈值来自部署数据表；不编造厂商参数。
- 重叠审查：PASS。继续复用既有工具和指南；P1 子项（链路预算、级联分光、ONU/OTDR 隔离）先作为 Hub 路径/主指南章节，不提前创建重复独立 URL。
- 路由与语言：PASS。沿用英 `/topics/pon-optical/` 与中 `/zh/topics/pon-optical/`，互设 canonical/hreflang；不改公开 slug，不新增空壳语言页。
- 发布边界：PASS。仅本地改文件和证据，不提交、推送、合并或部署。

## 必要检查（实现后执行）

`content`、`calculation`、`links`、`routes`、`languages`、`desktop-mobile`、`keyboard`。内容/计算检查须独立复算至少一组分光+光纤损耗+预算案例与一组 ONU/OTDR 故障决策；路由/语言检查须确认双语 canonical、hreflang、sitemap 和有效内部链接；桌面/移动/键盘检查仅针对新增或修改 Hub/指南页面。

## 风险与回滚

现有工作树包含多项未提交 SEO 修改，实施 Agent 必须仅编辑 TD-02 交付文件并保留其他 diff。回滚方式为恢复本轮修改文件到实现前哈希；不执行 reset/clean/stash。若发现工具或路由证据不足，标记具体缺口为 BLOCKED，不以占位页面或假数据补齐。
