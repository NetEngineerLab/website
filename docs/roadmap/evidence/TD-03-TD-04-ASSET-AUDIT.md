# Switch Capacity & Telecom Power Topic Asset Audit

审计日期：2026-10-13。范围：只读盘点 TD-04 交换机超售比专题和 TD-03 通信电源专题；不修改页面或资产注册表，不代表发布验收。

## Switch Uplink & Capacity Planning (TD-04)

**主边界：** 二层/园区交换机接入上联带宽、收敛比、LAG流量分布、忙时容量与链路/设备 N-1。区别于 TD-21 OLT/传输承载规划和数据中心 fabric 叶脊容量；可以通过相关链接衔接，但不要将其并入同一搜索主意图。

**现有资产**

| 类型 | 资产 | 状态 |
|---|---|---|
| EN/ZH Hub | `/topics/switch-oversubscription/`、`/zh/topics/switch-oversubscription/` | canonical/hreflang、索引、Sitemap 已登记 |
| 主指南 | `/guides/switch-oversubscription-ratio/` | EN/ZH 有路由，含公式和规划流程 |
| 场景指南 | `/guides/48-port-switch-oversubscription/`、`/guides/48-port-switch-2x10g-enough/` | EN/ZH 已登记，含48口上联对比 |
| 故障指南 | `/guides/switch-oversubscription-n-1/` | EN/ZH 已登记，含故障态容量 |
| 工具 | `/tools/switch-uplink-oversubscription-calculator/` | EN/ZH，已补正常/N-1及LAG/MLAG场景 |
| 额外场景 | LACP member congestion guide | Hub中有入口，需确认登记完整性 |

**缺口/治理风险：**

- `website/topics/switching-oversubscription/index.html` 仍有旧 stub 文件；未见 canonical、robots、语言配对或 Sitemap 入口。应作为 TD-01 URL治理遗留风险处理，不把它作为第二个 Hub 推广或收录。
- `content-registry.json` 的主主题 ID 是 `topic-switching-oversubscription`，而 `sitemap-routes.json` 使用 `topic-switch-oversubscription`；需要统一 ID/映射，避免专题聚合与站点路由断连。
- 三篇场景/故障指南已在 Hub 和路由中出现，但 content registry 未全部登记；需要一次治理修复，资产清单应以真实发布资源为准。
- Registry 仍提到 `/cases/campus-switch-oversubscription/`，本地未找到对应 HTML。Hub 当前未将其当作已发布案例，但该 registry 项需修正为待建设或真实路由，避免生成死链。

**成熟度判断：** 页面内容接近 Workflow：理解、计算、48口案例、N-1 与下一步工具闭环齐备；本次只完成资产/边界审计，不提升正式成熟度，也不判定 Authority。

## Network Infrastructure & Power (TD-03 scope)

**主边界：** 通信站点 -48 V DC 供电与续航：整流、负载与回充、蓄电池、油机燃油、通信太阳能与站点运行保障。数据中心 UPS/PUE 属相邻但独立的供配电/能效主题；PoE 属终端接入供电主题，不并入通信站点电源主流程。

**现有资产**

| 类型 | 资产 | 状态 |
|---|---|---|
| EN/ZH Hub | `/topics/telecom-power-energy/`、`/zh/topics/telecom-power-energy/` | canonical/hreflang、索引、Sitemap 已登记 |
| 整流 | `telecom-rectifier-dc-power-sizing` 工具及整流配置指南 | 有工具、指南、N+1/回充路径 |
| 电池 | `48v-battery-runtime` 工具 | Hub有入口；暂无独立电池自治指南 |
| 油机 | `generator-fuel-runtime-calculator` 工具及燃油规划指南 | Hub有入口；燃油曲线/边界说明存在 |
| 太阳能 | `telecom-solar-battery-sizing-calculator` | Hub有入口；地区日照和恶劣条件资料是后续内容价值点 |
| 切换保障 | `generator-ups-transfer-ride-through-planner` | Registry归属该专题，但 EN/ZH Hub 未列入；需审核其通信站点场景适配后再决定归属或跨链 |
| 相邻专题 | UPS容量/电池续航、PUE、PoE预算 | 应保留边界和说明，不作为 TD-03 核心资产重复呈现 |

**缺口/治理风险：**

- EN meta/OG description 使用 “site energy efficiency”，可能与 Data Center PUE 重叠；建议明确为 telecom-site energy/resilience。
- Registry归属 generator/UPS transfer 工具但 Hub 无入口，存在登记与可见资产不一致；需判断为通信站点交接保障资产还是数据中心 UPS 资产。
- 现有路径覆盖整流→电池→油机→太阳能，缺少独立电池设计/自治指南，以及温度/老化、增长负载、交流输入/配电架构等深度教程；这些是后续深度内容候选，不因此新建工具。

**成熟度判断：** Foundation 至 Workflow 之间。任务分流和主要工具已在 Hub，但电池/现场案例资产薄弱，且 transfer planner 归属未闭环；本次只审计边界与资产，不升级正式成熟度。

## 审计边界

- 依据：现有 Hub HTML、`website/data/content-registry.json`、`website/data/sitemap-routes.json`、`website/sitemap.xml` 及相关工具/指南文件存在性。
- 未核验生产环境 HTTP 状态、搜索控制台流量、外部 GitHub 文件现状或真实客户案例数据。
- 下一步治理顺序：先统一 switch topic ID/缺失 registry/phantom case/旧 stub；再决定 generator-UPS transfer planner 归属和 telecom-power description；之后才进入各专题内容增强与独立验收。
