# OPB V3 本地迁移进度（2026-10-30）

**状态：本轮本地迁移专项 PASS。** [唯一独立最终审计](../artifacts/opb-v3-audit/FINAL_AUDIT.md)已于 2026-10-30 签收；当前没有未解决的迁移专项阻断。此结论覆盖本地冻结产物，不表示已发布或全站门禁全绿。

## 范围与结果

**后续修复已完成（2026-10-30）：** 本文历史验收中记录的西语首页与两份设计预览 FAQ schema 共三项既有问题，已按用户后续授权修复并通过复测和独立审计。见[三项修复记录](THREE_ISSUE_FOLLOWUP_2026-10-30.md)及[独立报告](../artifacts/three-issue-followup/INDEPENDENT_AUDIT.md)；下文保留迁移专项结束时的原始测试记录。

唯一依据为 [NEL OPB 三语生产基准](NEL_OPB_V3_TRI_LOCALE_BASELINE.md)，逐 locale 对照 EN / ZH / ES。46 个 active registry 工具的 138 页，加 5 个 supplemental 工具现有 EN / ZH 的 10 页，共 **51 个工具、148 页**。其中 **50 个工具、145 页完成迁移，OPB 三语参照 3 页保留**；没有新增 supplemental ES。fiber-latency 因误用 OPB 专属 class 纳入公共作用域修复，桌面解释 fold 默认展开不是错误。

生产 HTML、CSS 与 app-v3.js 已读取核对；静态无 open 与运行时默认状态明确区分。只有 about-scope / methodology / status-rules / component-check 使用解释 fold，>=769px 默认展开、<=768px 默认收起，用户操作/resize/hash 与生产一致。FAQ、历史、依据、复核、工具组与 workflow 保持对应普通块语义。

## 实现与可复验入口

1. `scripts/migrate-tool-detail-v3.js` 幂等迁移现存页面，保存原字段、options、ID/hooks、计算脚本、领域正文、公式、FAQ 与工具自己的 workflow；实际构造 below / toc / prose、解释 fold 与普通内容块。
2. `scripts/lib/tool-v3-styles.js` 从生产一致的 OPB 源生成共享 `fb-v3.css` / `fb-v3-prod.css`，限定 `nel-tool-v3`；去除旧 Fieldbook primary shell，保留同生产字体依赖，不向无关工具加 OPB 领域 class。
3. `tool-v3-navigation.js` 实现生产同型 fold、TOC、hash 行为；原导航运行时仅对新迁移标记提前退出并更新缓存 hash。全部计算 engine 保持未改。
4. 多语构建在布局修复后、precache 指纹前调用迁移器；原作者 related 资源跨 navigation 重建保留。46 个 SW 缓存现存 locale 的目录和 index 路由及新壳资源，locale 资产顺序固定。
5. `npm run migrate:tool-v3`、`npm run test:tool-v3` 提供迁移/合同/回归入口；`test:tool-v3` 已接入默认 `npm test`。静态场景与 JSON-LD 测试按真实 DOM 适配，原数学、fixtures、引用、链接、问答数量/顺序/唯一性断言保留。

## 最终验证证据

| 检查 | 最终结果 |
| --- | --- |
| 源码 / SEO / 块类型 / FAQ / 正文 / inline | 148 页零未解释问题；53 个原 native 问答在修复的 11 页进入 canonical FAQ，原题与完整答案保留。见[最终静态状态](../artifacts/opb-v3-audit/final-static-status.json)。 |
| 计算与绑定 | 50 个相关 engine-test suite 零失败；51 个已捕获 engine.js 哈希不变，原非 JSON-LD inline JS、字段属性/options 与 ID/hooks 保留。见[独立最终审计](../artifacts/opb-v3-audit/FINAL_AUDIT.md)。 |
| 全范围浏览器 / 工具流程 | 444 个视口检查通过（原 ACL 点击超时已低并发补测通过）；30 个 supplemental 全流程与 18 个 subnet 模式场景通过，计算输出与基线一致。 |
| 修后布局 / 可读性 | 54 个受影响视口通过；hub 左右差 0、间距 28px；OSPF 短整数保持单行、KV 文字可读。最后 Solar 三语×390/1280 六例单位各为单一 Range，原读数不变；统计 summary 仅影响三组，其他 hero 排除。见[最后六例](../artifacts/opb-v3-audit/solar-summary-audit.json)。 |
| 真离线 | 9 个代表页新 context 首装后直接离线 reload、修改输入并重算，9/9 与相同输入在线结果一致。见[离线实证](../artifacts/opb-v3-audit/offline-audit.json)。 |
| 构建 / 缓存 / 幂等 | 最后完整构建及重复落盘构建 PASS；646 份相关 HTML/CSS/JS/SW raw SHA 完全相同、0 变化，含全部 145 个迁移 HTML。46 个 SW 使用当前资源 hash 与 canonical locale 路由。见[冻结核验](../artifacts/opb-v3-audit/final-freeze-audit.json)、[最后合同](../artifacts/opb-v3-validation/contract-summary-unit-final.log)。 |

正文审计记录以下三处通用 UI 标题归一；它们不是领域公式、问答、字段或工具目标丢失，不能据此声称所有文字逐字相同。见[独立分类](../artifacts/opb-v3-audit/prose-dispositions.json)。

| 工具 / locale | 原通用 UI 标题 | 分类 |
| --- | --- | --- |
| fiber-latency / EN | How it’s calculated · methods & formulas | 方法/导航标题归一；公式与工程说明保留 |
| fiber-latency / ES | Cómo se calcula · métodos y fórmulas | 方法/导航标题归一；公式与工程说明保留 |
| ip-camera-network-planner / EN | Related pages | 通用相关入口标题归一；原领域链接保留 |

## 全站测试边界

主代理 592 例初跑为 525 passed、52 flaky（重试后通过）、13 failed、2 skipped。随后串行与独立 fresh browser 补测解决所有迁移相关失败，累计 **589 项成功（其中 52 项曾 retry）、2 项 skip**；唯一仍失败的是已证明的旧 ES 首页问题。保留并发 browser 关闭及 ACL 初次超时的原始记录，不抹除 retry 事实，也不宣称重新完整跑了一轮全部 592 例。

- 旧 ES 首页 quick-card：HEAD 与当前均为 842.0625px，超过测试 776px 阈值；不属于本轮工具迁移，未扩大修复。见[HEAD/当前对照](../artifacts/opb-v3-audit/homepage-head-compare.json)。
- 默认 `npm test` 的迁移合同、静态场景与相关 engine 检查已通过；最终仍有两份旧 design/fieldbook preview 可见 FAQ 缺 FAQPage。见[JSON-LD 复核](../artifacts/opb-v3-validation/jsonld-postfix-reviewed.log)。不能据本专项 PASS 宣称全站全绿。
- 较早全折叠/始终关闭的错误假设、失败构建、被替代截图和缓存检查仅保留作诊断历史；最终验收以唯一 FINAL_AUDIT 及其最新证据为准。

## 逐工具清单

| 工具 | 现存 locale | 状态 |
| --- | --- | --- |
| fiber-loss | EN / ZH / ES | 已完成 · 独立验收 PASS |
| optical-power-budget | EN / ZH / ES | 参照保留 · 验证 PASS |
| pon-splitter-loss | EN / ZH / ES | 已完成 · 独立验收 PASS |
| onu-rx-power | EN / ZH / ES | 已完成 · 独立验收 PASS |
| pon-distance | EN / ZH / ES | 已完成 · 独立验收 PASS |
| otdr-event | EN / ZH / ES | 已完成 · 独立验收 PASS |
| mtu-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| subnet-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| bandwidth-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| 48v-battery-runtime | EN / ZH / ES | 已完成 · 独立验收 PASS |
| ipv6-nat-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| wifi-coverage-capacity-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| poe-power-budget-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| sfp-qsfp-compatibility-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| wireless-link-budget-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| poe-voltage-drop-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| network-rack-power-cooling-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| vlan-ip-capacity-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| switch-uplink-oversubscription-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| dns-ttl-propagation-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| acl-generator-validator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| network-change-planner-mop-generator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| pue-data-center-energy-efficiency | EN / ZH / ES | 已完成 · 独立验收 PASS |
| telecom-solar-battery-sizing-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| generator-fuel-runtime-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| telecom-rectifier-dc-power-sizing | EN / ZH / ES | 已完成 · 独立验收 PASS |
| telecom-ac-dc-breaker-sizing | EN / ZH / ES | 已完成 · 独立验收 PASS |
| ups-capacity-battery-runtime-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| data-center-cooling-load-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| dc-plant-efficiency-load-sharing | EN / ZH / ES | 已完成 · 独立验收 PASS |
| data-center-airflow-containment-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| generator-ups-transfer-ride-through-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| transmission-ring-optimization-risk-analyzer | EN / ZH / ES | 已完成 · 独立验收 PASS |
| olt-dual-uplink-transport-mse-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| data-center-network-convergence-fabric-capacity-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| network-risk-hidden-hazard-assessment-generator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| odf-odn-resource-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| ospf-cost-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| network-capacity-forecast-planner | EN / ZH / ES | 已完成 · 独立验收 PASS |
| engineering-report-batch-export-center | EN / ZH / ES | 已完成 · 独立验收 PASS |
| fiber-latency-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| chromatic-dispersion-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| pmd-budget-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| ethernet-serialization-delay-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| stp-path-cost-calculator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| all-reduce-traffic-estimator | EN / ZH / ES | 已完成 · 独立验收 PASS |
| ip-camera-network-planner | EN / ZH | 已完成 · 独立验收 PASS |
| application-bandwidth-analyzer | EN / ZH | 已完成 · 独立验收 PASS |
| data-center-architecture-decision-workshop | EN / ZH | 已完成 · 独立验收 PASS |
| network-asset-lifecycle-tracker | EN / ZH | 已完成 · 独立验收 PASS |
| oob-network-design-planner | EN / ZH | 已完成 · 独立验收 PASS |

## 交付边界

本轮已完成本地迁移及独立专项验收。未执行 git commit、push、merge 或部署；生产发布不在本轮交付内。生产 robots、preview noindex、canonical/hreflang 与原计算职责保持。
