# NetEngineerLab 已开发记录

本文件是项目“已经完成什么、验证到什么程度、下一步做什么”的唯一持续记录。
历史版本专项文档继续保留，但后续开发不得只写零散 README 或依赖聊天记录。

## 记录规则

每个生产批次必须按以下顺序处理：

1. 明确目标、文件、影响范围与风险。
2. 完成修改及本地测试。
3. 由 2 号验证官独立复核；未获得 `PASS` 不得继续发布。
4. 提交实现，取得不可变的 Git commit SHA。
5. 在本文件登记日期、范围、关键决策、测试、验证结论、实现提交和线上验收。
6. 提交本记录，并与实现提交一起推送。

记录状态只使用：`LOCAL PASS`、`VALIDATOR PASS`、`ONLINE PASS`。没有证据时不得提前登记为完成。

## 已完成批次

### 2026-09-01 — OTDR 事件分析器失败关闭、陈旧结果防护与 SEO/GEO

- 状态：`ONLINE PASS`。
- 页面：`website/tools/otdr-event/` 中英文版本；同步更新引擎、交互、双语内容合约、专项浏览器测试、资源哈希与 Service Worker 缓存版本。
- 输入与规则正确性：要求非空事件数组、严格对象和有限数；链路长度至少 0.1 km、双波长衰减大于 0、IOR 至少为 1；损耗/死区/容差阈值非负，反射阈值非正且顺序有效；事件类型固定为引擎支持的 8 类，不允许调用方扩展或用假值绕过。
- 派生与状态安全：事件间距、链路损耗和累计结果发生非有限数时失败关闭；正反射率、非法手工类型、缺失/乱序规则、空事件和派生溢出均有回归断言。
- 交互与导出：工程参数、阈值和事件表变化时立即清空摘要、状态、拓扑、诊断和结果表，并禁用复制、保存、CSV、打印；新增空事件、删除最后事件及所有计算失败路径统一失效，只有成功分析后恢复导出。
- 内容与 SEO/GEO：核验 6 组现有双语 FAQ，新增 ITU-T G.650.1、G.650.3、G.671 官方来源及双语可见复核日期；专项测试锁定来源、FAQ/Schema 和日期；全站覆盖达到 0 high、0 medium、21 maintain。下一批依次为 wireless-link-budget-calculator、poe-voltage-drop-calculator、network-rack-power-cooling-calculator、vlan-ip-capacity-planner、switch-uplink-oversubscription-calculator。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2757 个链接、0 errors、0 warnings；OTDR 引擎与语法测试 PASS；Chrome/Edge/Android/iPhone 中英文内容、日期和失效边界测试 16/16 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官多轮发现并推动修复规则字段/顺序/范围、事件类型绕过、空事件、超大间距、正反射率、debounce 陈旧结果、添加/删除事件失效路径和英文复核日期审计识别问题；最终确认 OTDR SEO 条目 `score: 0`、`gaps: []`，无剩余阻断，`PASS`。
- 实现提交：`f4380d12fbead3710c422a05f49db72dcab79cec`。
- 线上验收：远端 `4a742cf94508bde6d810bfb232b7ce4650f1db51` 的 Quality Gate `33457242988`、Online Monitor `33457243017`、GA4 Monitor `33457242995` 均成功；Performance Monitor `33457287820` 首次因非本批页面 `wifi-coverage-capacity-planner/zh/` 单次 LCP 4543 ms 失败，失败 Job 第 2 次运行全部通过并最终成功。正式站 otdr-event 英中页面 Chrome/Edge/Android/iPhone 内容、日期和失效边界测试 16/16 PASS。

### 2026-08-31 — V2.0 可执行目录、Schema 与 Vendor Renderer 规范适配

- 状态：`VALIDATOR PASS`（文档更新；无运行时代码、公开 URL 或正式站内容变更）。
- 分析结论：用户提供的 88 节技术规范与现有 V2.0 架构一致，采纳 Feature-driven/Core-driven、Tool Schema、Validator、ToolResult、Normalized Model、Parser、Rules、Vendor Renderer、Exporter 和三类架构验证工具路线。
- 仓库适配：明确当前 `website/tools/<slug>/`、原生 JavaScript、共享模板、Service Worker、Sitemap、canonical、hreflang 与现有 GitHub 门禁为生产事实；`src/*.ts` 等目录只作为未来迁移目标，不进行一次性重写。
- 冲突决策：严重度继续使用现行 `CRITICAL/HIGH/MEDIUM/INFO`，不引入 `LOW/WARNING` 别名；Schema 先以 JSON/JSDoc/元数据落地，不强制立即引入 TypeScript；Vendor 命令必须同时有官方依据与独立 Golden/语义回环测试。
- 新增文档：`docs/NETENGINEERLAB_V2_IMPLEMENTATION_SPEC.md`，定义接口职责、当前目录落点、新工具最小模板、验收门禁和实施顺序。
- 独立验证：2 号验证官复核链路顺序、源/生成边界、Vendor 证据、Planner 契约和总账流程，五项问题修正后 `PASS`。
- 实现提交：`60688311529e24bf178d5a2d344e2d5bc3ab229b`。
- 线上验收：本批仅修改开发规范，无需部署；后续代码批次仍须执行完整门禁。

### 2026-08-31 — PON 最大距离计算器边界正确性、失败关闭与 SEO/GEO

- 状态：`ONLINE PASS`。
- 页面：`website/tools/pon-distance/` 中英文版本；同步更新引擎、交互、内容合约、专项浏览器测试、资源哈希与 Service Worker 缓存版本。
- 正确性修复：输入必须为对象且非数组；熔接点/连接器为非负安全整数；分光比必须来自支持列表；衰减系数大于 0；系统可达距离至少 0.1 km；接收灵敏度低于过载门限；拒绝非有限数与派生溢出。
- 数值与状态：统一 `1e-9 dB` 浮点边界；计划距离超过有效上限、物理余量或接收功率越界时失败关闭；系统限制状态与失败判定使用同一 epsilon，避免边界值误报健康。
- 交互与安全：所有输入（含工程名称）在 debounce 前立即清空旧结果并禁用复制、保存、CSV、打印；无效报告导出返回空值，防止陈旧结果和旧项目元数据泄露。
- 内容与 SEO/GEO：核验并纳入内容契约的 6 组现有双语 FAQ，新增 ITU-T G.984.2/G.671/G.650.3 官方来源、可见复核日期与 3 dB 规划阈值限制说明；全站覆盖 0 high、1 medium、20 maintain，下一批依次为 otdr-event、wireless-link-budget-calculator、poe-voltage-drop-calculator、network-rack-power-cooling-calculator、vlan-ip-capacity-planner。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2751 个链接、0 errors、0 warnings；PON 引擎 PASS；Chrome/Edge/Android/iPhone 中英文边界与陈旧结果测试 16/16 PASS。
- 独立验证：2 号验证官首轮发现系统距离下限与 HTML 不一致、limiter epsilon 不一致；统一为 `>=0.1` 并补充 0.1/0.099999999/极小值及 `1e-9` 边界回归，最终 `PASS`。
- 实现提交：`b91564a0f5b0ff5687b96855d0076afe17380866`。
- 线上验收：远端 `e329ed692566faf5f87d3dbc4dcb0451417ed425` 的 Quality Gate `33401891440`、Online Monitor `33401891388`、GA4 Monitor `33401891400`、Performance Monitor `33401956195` 全部成功；正式站 pon-distance 英中页面 Chrome/Edge/Android/iPhone 内容与边界测试 16/16 PASS。

### 2026-08-31 — ONU 接收光功率诊断正确性、模式隔离与 SEO/GEO

- 状态：`ONLINE PASS`。
- 页面：`website/tools/onu-rx-power/` 中英文版本；同步更新引擎、双语内容合约、专项浏览器测试、资源哈希与 Service Worker 缓存版本。
- 正确性修复：输入对象/数组/类型、非有限数、非安全整数、非法分光值和派生溢出均失败关闭；要求衰减系数大于 0、疑似无光门限低于灵敏度、灵敏度低于过载门限；统一 `1e-9 dB` 浮点边界处理并保留无光/弱光/过载状态优先级。
- 模式契约：`measured` 快速诊断只依赖实测功率和接收机门限，隐藏模型字段不再阻断计算；快速模式不输出理论接收功率、偏差或推算额外损耗，报告/CSV 同步隔离；`model` 模式继续完整校验并输出模型结果。
- 交互与安全：所有公共及模型输入（含工程名称）在 debounce 前立即清空旧结果并禁用复制、保存、CSV、打印；模式切换无论计算是否成功都同步隐藏/显示模型输入与结果区域，防止陈旧结果、`Infinity` 或旧工程元数据导出。
- 内容与 SEO/GEO：新增 ITU-T G.984.2、G.671、G.650.3 官方来源、可见复核日期和 3 dB 规划阈值非统一强制说明；工具由 medium 降为 maintain，全站覆盖 0 high、2 medium、19 maintain，下一批依次为 pon-distance、otdr-event、wireless-link-budget-calculator、poe-voltage-drop-calculator、network-rack-power-cooling-calculator。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2745 个链接、0 errors、0 warnings；ONU 引擎 PASS；构建后 Chrome/Edge/Android/iPhone 中英文内容、模式、边界测试 16/16 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官连续四轮发现并推动修复快速模式模型字段隔离、公共派生溢出和无效状态结果区显示问题；最终完成 10,000 组随机公式/状态对比、模式隔离、溢出注入、报告/CSV、SW/Manifest 和独立双语四终端 8/8，最终 `PASS`。
- 实现提交：`5b6c9c0bbac23db4d193f619784762c1ac78e597`。
- 线上验收：远端 `6bf229230927e2b82713ebb277c18ae591d552ff` 的 Quality Gate `33397445310`、Online Monitor `33397445411`、GA4 Monitor `33397445299`、Performance Monitor `33397506933` 全部成功；Online Monitor 验证正式站文件与目标提交一致；正式站 onu-rx-power 英中页面 Chrome/Edge/Android/iPhone 内容、模式隔离与边界测试 16/16 PASS。

### 2026-08-31 — V2.0 工具平台架构基线文档

- 状态：`VALIDATOR PASS`（文档基线更新；无运行时代码、公开 URL 或正式站内容变更）。
- 文档：新增 `docs/NETENGINEERLAB_V2_ARCHITECTURE_SPEC.md`；在 `.github/copilot-instructions.md` 建立强制引用。
- 采纳内容：确认 NetEngineerLab 从 Calculator 网站渐进演进为 Network Engineering Toolkit；定义 Calculator、Generator、Analyzer、Planner 边界，以及 Core、Tool Schema、Validator、Exporter、Vendor、Parser、Rules、Normalized Model、Shared UI 和 Frontend First 后端边界。
- 仓库适配：保留当前 `website/tools/<slug>/`、`tools-catalog.json`、共享壳层、Service Worker、Sitemap、canonical、hreflang 和已上线 URL；`src/` 仅作为未来迁移目标，不进行一次性重写。V2.0 新工具继续使用 `/tools/<slug>/`，分类路径仅作为未来聚合页；嵌套路由必须等待完整配置驱动门禁后再启用。
- 安全与契约：沿用现行 `CRITICAL/HIGH/MEDIUM/INFO` 严重度、Evidence、确定性 Evaluator、Local Processing、失败关闭和 AI 不得改变 Finding 的规则；文档明确分析稿中的 `LOW/WARNING` 不纳入现行契约。
- 迁移路线：先建立共享契约和测试模板，新工具按 V2 开发，旧工具仅在维护/高价值重构时渐进迁移；禁止为了目录整洁一次性重写全站或提前引入大型后端。
- 独立验证：2 号验证官首轮指出分类 URL 会与当前构建门禁和分类目录混淆；修正文档为当前 `/tools/<slug>/` 及完整路由升级前置条件后，第二轮最终 `PASS`；`git diff --check` PASS。
- 实现提交：`15ebda00fcea0bc37a56110a26ff348a1f6ecf49`。
- 线上验收：本批仅修改开发规范，无需部署；后续若规范触发代码或页面变更，按普通生产批次重新执行完整门禁。

### 2026-08-31 — PON 分光损耗计算器收发窗口正确性与 SEO/GEO

- 状态：`ONLINE PASS`。
- 页面：`website/tools/pon-splitter-loss/` 中英文版本；同步更新计算引擎、专用浏览器测试、内容合约、资源哈希与 Service Worker 缓存版本。
- 正确性修复：增加最小/最大发送功率边界；最小发送功率用于接收灵敏度与标准 ODN 预算，最大发送功率用于过载校核并输出接收功率范围；三段分光损耗必须精确来自支持列表，禁止非法值静默回退为 1:1；熔接点/连接器必须为非负安全整数，衰减系数必须大于 0，系统距离至少为 0.1 km，最小发送功率不得高于最大值，灵敏度必须低于过载门限，并拒绝非对象、数组、类型强转、非有限数和派生溢出。
- 数值与交互边界：用 `1e-9 dB` 规范理论 0 dB/3 dB 浮点边界；无效输入立即清空 `last`、结果和状态并禁用复制/保存/CSV；工程名称及全部参数在 160 ms debounce 前同步失效，自动重算后才恢复操作，防止陈旧健康结果和旧工程元数据导出。
- 内容与范围：双语页面新增最大发送功率输入、接收功率范围、ITU-T G.984.2、G.671、G.652 三个官方来源与可见复核日期；说明分光器插损值是规划值，须核对实际器件与设备规格，3 dB 是工具规划阈值而非标准统一强制值。
- SEO/GEO：pon-splitter-loss 由 medium 降为 maintain；全站覆盖为 0 high、3 medium、18 maintain。下一批依次为 onu-rx-power、pon-distance、otdr-event、wireless-link-budget-calculator、poe-voltage-drop-calculator。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2739 个链接、0 errors、0 warnings；PON 引擎测试 PASS；Chrome/Edge 双语 × 桌面/Android/iPhone 内容与边界浏览器测试 16/16 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官首轮发现 HTML `min=0.1` 与引擎仅要求大于 0 的距离下限不一致；统一引擎为 `systemReach >= 0.1` 并补充 0.1、0.099999999、极小正数回归断言后，第 2 轮最终 `PASS`；另完成 10,000 组随机公式对比、`1e-9` 浮点边界、非法输入/派生溢出故障注入、SW 校验和独立双语四终端测试。
- 实现提交：`96198facc9a8e00fe8b759cecf1bf6748a55a87f`。
- 线上验收：远端 `8461ab958a804a22d62c3475d0206f46f57629e4` 的 Quality Gate `33380696619`、Online Monitor `33380696728`、GA4 Monitor `33380696743`、Performance Monitor `33380727568` 全部成功；Online Monitor 验证正式站文件与目标提交一致；正式站 pon-splitter-loss 英中页面 Chrome/Edge/Android/iPhone 内容与边界测试 16/16 PASS。

### 2026-08-31 — 光功率预算计算器收发窗口正确性与 SEO/GEO

- 状态：`ONLINE PASS`。
- 页面：`website/tools/optical-power-budget/` 中英文版本；同步更新计算引擎、专用浏览器测试、内容合约、资源哈希与 Service Worker 缓存版本。
- 正确性修复：把单一发送功率改为最小/最大边界；最小发送功率用于接收灵敏度和标准 ODN 预算，最大发送功率用于接收过载校核，避免短链路假安全；要求光纤衰减系数大于 0、熔接点/连接器为非负安全整数、最小发送功率不高于最大值、灵敏度低于过载门限，并拒绝空对象、非有限数、类型强转及派生溢出。
- 数值与交互边界：用 `1e-9 dB` 处理理论 0 dB/3 dB 浮点边界；无效输入立即清空 `last`、数值和旧状态，预算条归零并禁用复制/保存/CSV；所有输入（含工程名称）在 debounce 前同步失效，自动重算后才恢复操作，消除陈旧健康结果和元数据导出窗口。
- 内容与范围：双语页面新增最大发送功率输入、接收功率范围、ITU-T G.984.2、ITU-T G.652、IEC 61280-4-2:2024 官方来源与可见复核日期；明确预设不能替代具体设备规格书，3 dB 是工具规划门槛而非标准统一强制值。
- SEO/GEO：optical-power-budget 由 medium 降为 maintain；全站覆盖为 0 high、4 medium、17 maintain。下一批依次为 pon-splitter-loss、onu-rx-power、pon-distance、otdr-event、wireless-link-budget-calculator。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2733 个链接、0 errors、0 warnings；核心引擎 PASS；Chrome/Edge 双语 × 桌面/Android/iPhone 内容与边界浏览器测试 16/16 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官连续三轮发现无效输入保留旧健康结果、150 ms debounce 陈旧导出窗口及只修改工程名称时的旧元数据问题；逐项失败关闭并增加双语回归测试后，第四轮最终 `PASS`。
- 实现提交：`bdc5bc44daca8f9e10f051bcf7ed69c91fcecf36`。
- 线上验收：远端 `fad7041d4d003cf8c5bdcf18c9f9a961130effe7` 的 Quality Gate `33372029966`、Online Monitor `33372029967`、GA4 Monitor `33372029986`、Performance Monitor `33372073382` 全部成功；Online Monitor 验证正式站文件和 Service Worker 与目标提交一致；正式站 optical-power-budget 英中页面 Chrome/Edge/Android/iPhone 内容与边界测试 16/16 PASS。

### 2026-08-31 — 光纤损耗计算器正确性、SEO/GEO 与全站缓存失效门禁

- 状态：`ONLINE PASS`。
- 页面：`website/tools/fiber-loss/` 中英文版本；同时修复 21 个工具的 Service Worker 本地资源缓存版本，以及 5 个旧光纤工具的计算引擎预缓存清单。
- 正确性修复：熔接点与连接器数量必须为非负安全整数；输入对象、非有限数及派生乘法溢出失败关闭；用 `1e-9 dB` 处理理论 0 dB 与 3 dB 浮点边界，不放宽真实负余量。
- 内容与范围：保留现有 6 组双语 FAQ，新增 ITU-T G.652、ITU-T G.671、IEC 61280-4-2:2024 三个官方来源与可见复核日期；明确 3 dB 是本工具规划门槛而非标准统一强制值，正式验收仍需器件规格与校准后的现场测量。
- P1 缓存修复：缓存名由共享运行时哈希扩展为“共享运行时 + 工具本地 CORE 内容”双哈希，解决 cache-first/ignoreSearch 下旧 app/engine 可能长期驻留的问题；fiber-loss、optical-power-budget、pon-splitter-loss、onu-rx-power、pon-distance 补入 `./js/engine.js`；连续两次构建的 21 个 SW 字节一致。
- 缓存门禁：精确锁定 `acorn@8.15.0`，用 AST 验证唯一顶层 CORE/A 与 `install → waitUntil → caches.open → then → addAll` 数据流、全局对象未遮蔽、缓存 Promise 未丢弃；路径必须是 website 真实部署根内的现存目标，并拒绝协议/绝对/反斜杠/越界/缺失路径及符号链接或 Windows junction 指向站外；相关故障测试接入 `npm run verify`。
- SEO/GEO：fiber-loss 由 medium 降为 maintain；全站覆盖为 0 high、5 medium、16 maintain。下一批依次为 optical-power-budget、pon-splitter-loss、onu-rx-power、pon-distance、otdr-event。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2727 个链接、0 errors、0 warnings；fiber-loss 核心 PASS；Chrome/Edge 双语 × 桌面/Android/iPhone 8/8 PASS；Service Worker 确定性重建、AST/路径故障注入及生产验收 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官先确认 fiber-loss 页面/引擎 `PASS`；缓存 P1 扩展后连续九轮发现并推动修复字符串/注释诱饵、伪 addAll、数组变异、作用域遮蔽、未等待 Promise、部署路径与真实路径绕过，最终第九轮 `PASS`。
- CI 修复：首次推送 `a7c426900f9a1bf5dc4745e800bd60ac0c47be3a` 后，GA4 成功，但 Quality/Online 因工作流未安装新增的锁定 `acorn` 依赖而失败，Performance 依赖 Online 成功条件因此跳过；Quality/Online 均已在 `prepare:launch` 前增加 `npm ci` 与 npm 缓存。干净 `npm ci`（5 packages、0 vulnerabilities）后的全量 `npm run verify` PASS，2 号验证官独立复核 `PASS`；修复提交 `4783d6b3b41119866d06e86dfe2393b5790f6994`。
- 实现提交：`1db3f75d074c0ebe5af5756145816e85b4389dab`。
- 线上验收：修复后远端 `fc9e062d4b78a5b3225ec1ba65b8487f4fe9b858` 的 Quality Gate `33354114013`、Online Monitor `33354113911`、GA4 Monitor `33354113857`、Performance Monitor `33354139614` 全部成功；Online Monitor 验证正式站文件及 21 个 Service Worker 与目标提交一致；正式站 fiber-loss 英中页面 Chrome/Edge/Android/iPhone 8/8 PASS，覆盖计算、FAQ、官方来源、响应式和运行时错误检查。

### 2026-08-31 — SFP/QSFP 兼容性计算器正确性修复与 SEO/GEO 内容

- 状态：`ONLINE PASS`。
- 页面：`website/tools/sfp-qsfp-compatibility-calculator/` 中英文版本；计算引擎、浏览器测试与 Service Worker 同步更新。
- 正确性修复：光预算改为分别计算 A→B、B→A；最小发射功率用于接收灵敏度/设计余量，最大发射功率用于接收过载，页面增加两端 Maximum Tx 输入和预设值；连接器不匹配升级为硬失败。
- 失败关闭与数值边界：数值只接受有限 number 或严格十进制/科学计数字符串；枚举只接受原始字符串且不会执行对象 `toString()`；校验必填项、合法枚举、波长 800–2000 nm、功率 -200–200 dBm、安全整数计数、模块固有 lane 数、派生结果有限性及最小聚合速率 0.1 Gbps；用 `1e-9 dB` 明确容差把理论零余量规范为 0，不放宽真实负余量。
- 内容与范围：增加 5 组双语 FAQ、可见复核日期及 SNIA SFF-8472/SFP-QSFP 规范入口、Cisco 平台支持表、Juniper form-factor 兼容说明；明确工具不验证精确料号/厂商支持矩阵、EEPROM、FEC、breakout，也不把同名波长比较扩展为 BiDi/WDM 配对结论。
- SEO/GEO：该工具由 high 降为 maintain；全站覆盖为 0 high、6 medium、15 maintain。下一批依次为 fiber-loss、optical-power-budget、pon-splitter-loss、onu-rx-power、pon-distance。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2721 个链接、0 errors、0 warnings；核心引擎 PASS；Chrome/Edge 双语 × 桌面/Android/iPhone 定向 Playwright 16/16 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官连续九轮故障注入，依次发现空值/类型强转、非法连接器、波长与安全整数、模块 lane、数值范围/派生溢出、连接器状态、枚举对象、浮点零边界及最小速率契约问题；逐项修复并增加回归测试后，第九轮最终 `PASS`。
- 实现提交：`7f8da6d2912c8f4db275dbe2d6152f3674750c5c`。
- 线上验收：提交 `471935364bd66acee4cf251af39c396992f30bb5` 对应 Quality Gate `33349327907`、Online Monitor `33349327915`、GA4 Monitor `33349327909`、Performance Monitor `33349364853` 全部成功；正式站 SFP/QSFP 英中页面 Chrome/Edge/Android/iPhone 16/16 PASS，覆盖双向预算、5 FAQ、4 个来源、响应式与运行时错误检查。

### 2026-08-30 — Engineering Rules 基础契约与失败关闭门禁

- 状态：`ONLINE PASS`
- 范围：Rule JSON Schema、Severity Policy、Operator Registry、契约测试与 `npm run verify`；当前仍为 20 个生产工具、0 条生产规则，不新增页面或运行时规则引擎。
- 完成内容：建立双语 Rule/Evidence/Fixture 契约、四级严重度和五维评分策略；注册 6 个基础 Operator，并按精确参数名、类型和适用 domain 失败关闭；扫描所有 domain 的 `rules.json`，拒绝全局重复 ID 和目录/domain 错配。
- 安全与边界：拒绝可执行字段、未知字段/locale/Operator、LOW、非法来源类型、非 HTTPS 或无主机来源、空 Evidence、路径穿越 Fixture、缺少英中 Field Experience Note；预校准 Policy 固定 `passThreshold: null`、不显示 PASS/FAIL、INFO 不扣分。
- 自动化：真实执行 Rule Schema 关键字；用临时双 domain 目录验证跨目录重复 ID；结构化验证 Operator Registry 与 Severity Policy 两个信任根，并覆盖五维完整性、扣分顺序、Score cap 和根因去重上限。
- 本地验证：`npm run verify` PASS；规则契约为 6 operators/0 production rules；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2581 个链接、0 errors、0 warnings；`git diff --check` PASS。
- 独立验证：2 号验证官前三轮发现 Schema/手写验证不一致、路径与额外参数绕过、空来源、跨目录重复 ID、信任根及策略语义缺口；逐项修复后第四轮最终 `PASS`。
- 实现提交：`6c24995834f894ac20dae863435dcc300e0bc2fd`。
- 线上验收：远端 `8ec86ffc06a741316517ef170b516f74ee1e7130` 的 Quality Gate、Online Monitor、GA4 Monitor 和 Performance Monitor 全部成功；性能工作流完成 Lighthouse 采集与断言；本批无新增公开页面。

### 2026-08-30 — 工程规则驱动平台架构规范

- 状态：`ONLINE PASS`
- 范围：平台设计规范与 Copilot 强制开发规则；不修改现有 20 个工具、公式、URL 或运行时资源。
- 完成内容：正式确定 `Calculate → Configure → Validate → Diagnose` 路线，以确定性 Engineering Rules Engine 为共享核心；定义 Parser、厂商无关 IR、Rule、Evidence、Score、Presentation 与可选 AI 的职责边界；定义第 21 个工具 Multi-Vendor ACL Generator & Validator 的 V1 范围和分批交付顺序。
- 关键边界：AI 不得裁决 Finding/Severity/Evidence；规则严重度只允许 CRITICAL/HIGH/MEDIUM/INFO；规则禁止可执行表达式；V1 配置完全本地处理；校准前 Score 不显示 PASS/FAIL；现有计算公式只在黄金样例对照和独立验证后迁移判断层。
- 构建设计：规则源位于 `website/data/engineering-rules/**/*.json`；运行时生成物固定为 `website/assets/generated/rules-engine/rules-bundle.<sha256-12>.js`，必须通过确定性哈希、版本兼容、源 JSON 禁直连、页面/SW/Release Manifest 同哈希门禁。
- 本地验证：设计路径及现行工具结构、PWA/离线、共享资源哈希和四厂商 Generator 闭环测试门禁设计已复核；`git diff --check` PASS；无运行时代码或运行测试变化。
- 独立验证：2 号验证官前三轮发现标准工具结构、共享缓存、Generator 测试、AI/Score 边界、模块归属及生成物路径问题；逐项修订后第四轮最终 `PASS`。
- 实现提交：`423e498225b8cd90cb2291216ce0b24a53ad0574`。
- 线上验收：设计规范已随远端 `8ec86ffc06a741316517ef170b516f74ee1e7130` 推送；Quality Gate、Online Monitor、GA4 Monitor 和 Performance Monitor 全部成功。

### 2026-08-29 — 全站 SEO/GEO 覆盖盘点与自动化门禁

- 状态：`ONLINE PASS`
- 范围：`website/data/tools-catalog.json` 中 20 个 active 工具的 40 个中英文工具页；不修改页面、计算公式、URL 或部署配置。
- 完成内容：新增配置驱动的 SEO/GEO 内容覆盖审计，逐页记录双语搜索意图、目标主题、可见 FAQ 长尾问题、内容负责人、复核日期、内容长度、章节、FAQPage、外部来源和正文内链；生成 `docs/SEO_GEO_COVERAGE_REPORT.json`，并接入 `npm run verify`。
- 关键决策：优先级是透明的内容缺口评分，不是排名、流量或转化预测；未发现正式可见复核日期时保持 `null`，不得虚构；外部来源数量仅作可核验性代理，来源质量仍需人工复核；Header、Footer、导航和面包屑不计入正文内链。
- 盘点结论：20 个工具、40 个双语页面全部纳入；2 个 high、6 个 medium、12 个 maintain。下一批前五项依次为 PoE 功率预算、SFP/QSFP 兼容性、光纤损耗、光功率预算、PON 分光器损耗；前两项同时缺 1 个 FAQ、3 个外部权威来源和可见复核日期。
- 自动化：新增成功/薄内容评分、替代 `directoryStrategy.toolPage`、动态 active locale 与 `catalogKey`、inactive/planned 排除、同分稳定排序、相对正文内链、自链接排除、Header/Footer/Nav/精确 breadcrumb token 排除、连字符伪 breadcrumb 保留、正文伪 FAQPage 拒绝、嵌套 JSON-LD FAQPage 和中英文复核日期测试。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2581 个链接、0 errors、0 warnings；SEO/GEO 覆盖报告为 20 tools/40 pages、2 high/6 medium/12 maintain；`git diff --check` PASS。
- 独立验证：2 号验证官前三轮分别发现硬编码路由/壳层内链/伪 Schema/日期矛盾、`div.breadcrumbs` 漏排除及连字符 class 误匹配；逐项修复并增加故障注入测试后，第四轮最终 `PASS`。
- 实现提交：`16af9f227037a84f4e8c6819c12419d4af11731e`。
- 线上验收：审计实现已随远端 `8ec86ffc06a741316517ef170b516f74ee1e7130` 推送；Quality Gate、Online Monitor、GA4 Monitor 和 Performance Monitor 全部成功；本批未修改正式站页面内容。

### 2026-08-29 — 无线链路预算计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/wireless-link-budget-calculator/` 中英文版本。
- 完成内容：补充 2.4/5/6/11/24/60 GHz 点对点链路的可靠性、目标调制、气候、多径、雨衰、氧气吸收、法规与现场勘测长尾场景；增加 5 组双语 FAQ 和 FAQPage；引用 ITU-R P.525、P.530、P.676 与 P.526。
- 关键边界：FSPL 仅描述无遮挡自由空间；附加损耗是手动合并值；10/20 dB 是规划筛选门槛而非可用率保证；60% 菲涅耳净空只检查所填位置；EIRP 结果不是法规合规结论；接收灵敏度应匹配目标调制、带宽和吞吐量。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个完整 ITU URL 与可见 FAQ/Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2581 个链接、0 errors、0 warnings；无线链路引擎 PASS；Chrome/Edge 双语多视口 8/8 PASS。
- 独立验证：2 号验证官最终 `PASS`；独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`566af0906d5d82b450debd934820bd43e6a3e918`。
- 线上验收：提交 `1a2a6ebd0122fe283bc41eebb124e85fb5475f13` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认英中内容已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个 ITU 来源、FAQ 展开、计算结果、响应式溢出与运行时错误检查全部通过。

### 2026-08-29 — PoE 压降计算器正确性修复与 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/poe-voltage-drop-calculator/` 中英文版本；计算引擎与测试同步更新。
- 完成内容：补充摄像头、无线 AP、PTZ、门禁与大功率 PD 的线径、通道长度、接触电阻、线束温升和启动长尾场景；增加 5 组双语 FAQ 和 FAQPage；引用 IEEE 802.3bt、Ethernet Alliance 与 Fluke Networks。
- 正确性修复：线损比例分母由“设备有效负载 + 线损”改为“远端 PoE 输入功率 + 线损”，与源端功率一致；为 10%/20% 状态门槛加入 `1e-9` 浮点容差，修复理论恰好 20% 被误判失败的问题。
- 关键边界：设备功率指 PD 转换器后的有效直流负载；若输入已在 PD 网口测得应使用 100% 效率；四线对模型假设理想均流，不模拟直流电阻不平衡；线缆温度不等于环境温度；稳态压降通过不能证明检测、分类、浪涌或设备启动成功。
- 自动化：新增精确 1Ω 回路的独立能量守恒测试，验证 `50V × 5A = 225W + 25W`，并覆盖 10%、刚超 10%、20%、刚超 20% 四个状态边界；浏览器内容合约覆盖 5 个 FAQ、4 个完整来源 URL 与可见 FAQ/Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2573 个链接、0 errors、0 warnings；PoE 引擎 PASS；Chrome/Edge 双语多视口 8/8 PASS。
- 独立验证：2 号验证官首轮因状态边界测试不足判定 `FAIL`；补齐测试并修复浮点边界后最终 `PASS`，独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`536887355926adda4408f99ce48516e3bd0257a1`。
- 线上验收：提交 `01ed48f3707021325a684065ca33e43664b39912` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认英中内容与引擎已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个权威来源、FAQ 展开、无溢出与无运行时错误；线上 1Ω 边界输入确认 10% 为通过、刚超 20% 为不通过。

### 2026-08-29 — 网络机柜功耗与制冷计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/network-rack-power-cooling-calculator/` 中英文版本。
- 完成内容：增加交换机机柜、边缘计算机柜、通信机房和小型数据中心长尾场景；解释连接功率、实际 IT 负载、设计 kW、VA、单相/三相电流、BTU/h、冷吨、COP、PUE 与成本范围；增加 5 组双语 FAQ 和 FAQPage；引用 ASHRAE、NIST、美国能源部和 The Green Grid。
- 关键边界：冗余百分比只是乘法规划余量，不代表 N+1、2N 或 A/B 故障转移设计；三相公式假设负载平衡并输入线电压；80% 是工具规划门槛而非通用电气规范；月耗电与电费只含实际 IT 负载，不含制冷、UPS/PDU 损耗和其他设施能耗。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个完整权威来源 URL，以及可见 FAQ 与 Schema 的逐字一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2565 个链接、0 errors、0 warnings；机柜功耗与制冷引擎 PASS；Chrome/Edge 双语多视口定向测试 8/8 PASS。
- 独立验证：2 号验证官最终 `PASS`；独立 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，`git diff --check` PASS。
- 实现提交：`369512864ffd32636e101a6c8a28ff560bc404ef`。
- 线上验收：提交 `f587c3610029a4706a64112272a3c4777c2a05a6` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；缓存绕过检查确认正式站英中内容已部署；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，HTTP 200、5 个 FAQ、4 个权威来源、FAQ 展开、计算结果、响应式溢出与控制台错误检查全部通过。

### 2026-08-29 — 交换机上联带宽与超售比计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/switch-uplink-oversubscription-calculator/` 中英文版本。
- 完成内容：增加线速超售比与忙时需求区别、园区接入与服务器场景、正常与故障拓扑重算、5 组双语 FAQ 和 FAQPage；引用 IEEE 802.1AX、IETF RFC 7424 及 Cisco Campus LAN and Wireless LAN Design Guide。
- 关键边界：只统计实际参与转发且可被流量利用的上联；备用或阻塞链路不计入当前容量；LAG 汇总容量不代表单流带宽，哈希和流量组合会影响成员链路均衡。
- 自动化：浏览器内容合约改用完整来源 URL，并覆盖该工具的 5 个 FAQ、3 个权威来源和可见 FAQ 与 Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2557 个链接、0 errors、0 warnings；交换机上联引擎 PASS；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`46ae1145c02dc6c133fd41e87add3d40b12c0d08`。
- 线上验收：提交 `da3d73438d5f20262fea1a24d8dd547f798b3af2` 对应 Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；正式站点已出现中英文新内容；生产 Edge 双语 × 桌面/Android/iPhone 6/6 PASS，5 个 FAQ、3 个权威来源、计算结果、响应式溢出与控制台错误检查全部通过。

### 2026-08-29 — DNS TTL 传播计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`
- 页面：`website/tools/dns-ttl-propagation-calculator/` 中英文版本。
- 完成内容：增加 DNS 迁移流程、正向/否定缓存、serve-stale、TTL 与查询负载边界、5 组双语 FAQ 和 FAQPage；引用 RFC 1035、2308、8767、9199。
- 关键边界：正 TTL 的理论刷新率使用 `86400 / TTL`；TTL 为 0 时页面明确为不可跨事务缓存，工具的 86400/日仅是每秒一次的建模上限，实际流量取决于查询率。
- 自动化：浏览器内容合约覆盖 5 个 FAQ、4 个 RFC 链接以及可见 FAQ 与 Schema 一致性。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2551 个链接、0 errors、0 warnings；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`fce678f7d97ef3a02c8e8a5bdc04bf95205c96be`。
- 线上验收：Quality Gate、Online Monitor、GA4 Monitor、Performance Monitor 全部成功；生产 Edge 6/6 PASS。

### 2026-08-29 — VLAN/IP 容量规划器 SEO/GEO 内容与 FAQ 门禁

- 状态：`ONLINE PASS`
- 页面：`website/tools/vlan-ip-capacity-planner/` 中英文版本。
- 完成内容：增加办公网/园区网场景、容量与增长边界、RFC 1918/3021/4632 依据、5 组双语 FAQ 和 FAQPage。
- 关键边界：前缀按计算所得每 VLAN 实际需求选择，不把“每 VLAN 目标主机数”误写成固定前缀容量。
- 自动化：SEO 审计要求标记的可见 FAQ 与 FAQPage 数量、问答集合和类型完全一致；递归识别 `@graph` 内嵌 Schema；新增嵌套 FAQPage 故障注入测试并纳入 `npm run verify`。
- 本地验证：`npm run verify` PASS；54 个 HTML 页面、52 个 Sitemap URL、20 个引擎、2543 个链接、0 errors、0 warnings；Edge 双语 × 桌面/Android/iPhone 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`ceb3d0498d339680bb0b913e4c7c8ee257f99778`。
- 线上验收：四条 GitHub 生产工作流全部成功；生产 Edge 6/6 PASS。

### 2026-08-29 — GA4 正式站监控配置驱动修复

- 状态：`ONLINE PASS`
- 完成内容：GA4 在线监控从 `website/data/site-config.json` 读取正式域名与 Measurement ID，保留环境变量覆盖；拒绝不安全或非根路径 origin；增加成功、重定向、禁用、错误 ID、重复保护等回归测试。
- 本地验证：`npm run verify` PASS，0 errors、0 warnings。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`9db3922d79b99bab38e5b2ef9ab5d91b154d3d8f`。
- 线上验收：GA4、Quality、Online、Performance 四条工作流全部成功。

### 2026-08-29 — Wi-Fi 覆盖与容量规划器无障碍修复

- 状态：`ONLINE PASS`
- 完成内容：修复 Tab 的 ARIA 角色与关联、键盘导航、颜色对比、本地资源哈希和 Service Worker 精确缓存匹配。
- 本地验证：Lighthouse Accessibility 从 0.87 提升到 1.00；浏览器测试 136 passed、2 skipped，定向测试 6/6 PASS。
- 独立验证：2 号验证官最终 `PASS`。
- 实现提交：`ddcab10dd9dbe0e992559017996daed3527e3bb5`。
- 线上验收：Quality、Online、Performance 工作流成功。

### 2026-08-30 — 共享工程规则运行时

- 状态：`ONLINE PASS`。
- 完成内容：实现确定性 Evaluator、Evidence Formatter、Score Policy、双语 Report 与内容哈希规则包；增加运行时/规则包/评分策略版本兼容性门禁。
- 安全与确定性：拒绝缺失 Evidence；自动及显式脱敏密码、令牌、通用 key 与 camel/snake/kebab 形式密钥；禁止覆盖内置 operator/selector；报告时间固定为空，规则包文件名由内容 SHA-256 决定。
- 集成：5 个共享运行时资源与唯一规则包进入全部 20 个 active 工具 Service Worker；构建、生产验收、线上检查与 Release Manifest 同步校验。
- 测试：覆盖自定义 selector、中文 Finding/Report、不兼容版本拒绝、旧 bundle 精确清理；`npm run verify` PASS：54 个 HTML、52 个 Sitemap URL、20 个引擎、2581 个链接、0 errors、0 warnings。
- 独立验证：2 号验证官首轮发现 3 项阻断；修复后最终 `PASS`，并独立重跑专项测试及完整 `npm run verify`。
- 实现提交：`fa89de6630ee7a28174c9486334b5e4043bcb01d`。
- 线上验收：提交 `9fba1eda1e3ee4c20ef5444303e8624cab0e4d99` 对应 Quality Gate `33289329401`、Online Monitor `33289329395`、GA4 Monitor `33289329394`、Performance Monitor `33289367036` 全部成功。
- 范围边界：仍为 6 operators、0 production rules；未新增 Tool 21 页面，未修改现有页面、公式或工具引擎。

### 2026-08-30 — Tool 21 ACL IR 与 Cisco IOS 核心

- 状态：`ONLINE PASS`（核心代码已部署，Tool 21 页面仍未公开）。
- 范围：新增 `website/tools/acl-generator-validator/` 的厂商无关 IPv4 ACL IR、Cisco IOS 命名扩展 ACL Parser/Generator、DOM-free engine、Golden Fixture 与专项测试；未加入工具目录或 Sitemap。
- 工程边界：V1 本批仅支持 Cisco IOS 命名扩展 ACL、`ip/tcp/udp/icmp`、any/host/network、数值目标端口与 log；命名端口、混合显式/隐式 sequence、多 ACL 及其他语法明确拒绝或进入 unparsed，禁止静默视为已验证。
- 安全与确定性：配置限制为 100 KiB/2000 行并拒绝 NUL；保留 sourceLine/raw/unparsed；严格拒绝错误类型、非安全整数和不兼容 IR version/domain/family；不执行粘贴内容。
- 自动化：Golden Fixture、语法解析、Generate → Parse → IR 语义等价、通配符边界、恶意输入、输入限制、版本与类型故障注入已接入 `npm run verify`。
- 本地验证：`npm run verify` PASS；54 个 HTML、52 个 Sitemap URL、20 个现有引擎、2581 个链接、0 errors、0 warnings；ACL 核心专项 PASS。
- 独立验证：2 号验证官经过三轮故障注入发现并推动修复布尔强转、端口自证、混合序号、宽松类型/IR 兼容性及超大整数问题，最终 `PASS`。
- 实现提交：`807e342704e49d5ee63c98a27811a5f15abf7531`。
- 线上验收：提交 `6aaf70fc490602558d7ee6729cf969c91f77f025` 对应 Quality Gate `33300333363`、Online Monitor `33300333364`、GA4 Monitor `33300333317`、Performance Monitor `33300350070` 全部成功。

### 2026-08-30 — Tool 21 四厂商 ACL Parser/Generator 核心

- 状态：`ONLINE PASS`（核心代码已部署，页面仍未公开）。
- 范围：在 Cisco IOS 基础上新增 Huawei VRP、H3C Comware、Juniper Junos Parser/Generator、厂商 Golden Fixture 和四厂商 `Generate → Parse → IR` 语义等价测试。
- 厂商边界：Huawei 使用 `acl name … advance`；H3C rule-id 限定 `0–65534`；Junos 采用受限 `set firewall family inet filter` 语法，任意 IPv4 省略 protocol 条件，并要求 `rule-N` 首次出现顺序严格递增。
- 失败关闭：未知语法进入 `unparsed`；Junos 重复或冲突条件、term 逆序、多 filter 均拒绝；厂商序号范围由 Parser 与 Generator 双向验证，避免同源自证。
- 浏览器兼容：全部新增 factory、Parser、Generator 使用 UMD，VM 无 `module/require` 环境可加载完整四厂商 engine 链。
- 本地验证：`npm run verify` PASS；54 个 HTML、52 个 Sitemap URL、20 个现有引擎、2581 个链接、0 errors、0 warnings；四厂商 ACL 专项 PASS。
- 独立验证：2 号验证官经过三轮发现并推动修复 Huawei/Junos 真实语法、UMD、Junos 顺序与重复条件、H3C rule-id 上限问题，最终 `PASS`。
- 实现提交：`b85e8ef8bed2ddf50c7f9f4b0972a40c76884a4e`。
- 线上验收：提交 `86498cd1fc1b5767ffeed415c1abe6aec29c3382` 对应 Quality Gate `33304557631`、Online Monitor `33304557646`、GA4 Monitor `33304557628`、Performance Monitor `33304572111` 全部成功。

### 2026-08-30 — Tool 21 ACL 生产规则层

- 状态：`ONLINE PASS`（规则与运行时已部署，本批不公开 Tool 21 页面）。
- 范围：新增 ACL-001 至 ACL-010 共 10 条双语生产规则，覆盖无限制 IPv4/TCP/UDP 放行、Telnet、SSH/SNMP 任意源、异动作遮蔽、精确重复、无 permit ACL、可达 deny-all 非末尾；适用于 Cisco IOS、Huawei VRP、H3C Comware、Juniper Junos。
- 来源与证据：规则引用 NIST、CISA、IANA、Cisco 与 Juniper 权威资料；每条规则具备正/负/边界 Fixture 和最小充分 Evidence；deny-only 明示 `permitCount: 0`、deny 数量及完整序号，联合遮蔽保留所有实际首匹配规则证据。
- 正确性边界：按 first-match 语义计算 source × destination × port 联合覆盖，并保守处理 protocol；支持多规则、混合 permit/deny 和源/目的地址分片遮蔽；同动作冗余不误报 HIGH，终止 deny 与 shadow Finding 共享根因；不可达 deny-all 不作为后续不可达根因；复杂度超限显式失败，禁止静默视为可达。
- 运行时兼容：新增版本绑定的 `acl-policy-check@1.0.0` descriptor；规则包 Registry 与加载 handler 版本不一致时失败关闭；生成 10-rule 内容哈希 bundle 并刷新 20 个工具 Service Worker。
- 自动化：新增 ACL 生产规则专项测试，并将规则契约、运行时、ACL core 与 ACL rules 全部接入 `npm run verify`；覆盖双 /1 联合、混合动作、目的地址联合、同动作 superset、重复、根因去重、Evidence 完整性、复杂度上限和版本失配注入。
- 本地验证：最终 `npm run verify` PASS；10 production rules、7 operators、54 个 HTML、52 个 Sitemap URL、20 个现有引擎、2581 个链接、0 errors、0 warnings；`git diff --check` PASS。
- 独立验证：2 号验证官连续五轮发现并推动修复联合覆盖、同动作误报、Evidence、版本绑定、混合动作/目的维度、复杂度 fail-open、首匹配动作、快速路径及不可达 deny-all 因果问题；第五轮最终 `PASS`。
- 实现提交：`d363fc7aa50d82524952660567ec4bc57394af40`。
- 线上验收：远端 `279ad363d2b35d3ef7b668c60ad65ec101f57474` 的 Quality Gate `33318530133`、Online Monitor `33318530260`、GA4 Monitor `33318530146`、Performance Monitor `33318562424` 全部成功；Performance 完成 Lighthouse 采集和断言；本批无新增公开 URL。

### 2026-08-30 — Tool 21 ACL Generator & Validator 双语页面

- 状态：`ONLINE PASS`。
- 页面：`website/tools/acl-generator-validator/` 中英文版本；正式 URL 为 `https://netengineerlab.com/tools/acl-generator-validator/` 与 `/zh/`。
- 完成内容：公开四厂商 ACL 验证、转换与参数生成页面，支持 Cisco IOS、Huawei VRP、H3C Comware、Juniper Junos；接入 10 条生产规则、确定性评分、双语 Finding、规则证据和语义往返校验。
- 设计与内容：复用统一 Header/Footer、设计令牌和页面风格；提供本地处理隐私说明、5 组双语 FAQ、FAQPage、NIST/Cisco/Juniper/IANA 权威来源、canonical/hreflang、长尾场景内容与更新时间。
- 安全与失败关闭：粘贴内容不执行；整体解析失败或被拒绝的非法/恶意输入必须清空旧 score、Finding 与输出，禁止失败后继续展示此前成功结果；部分不支持语法须明确显示覆盖不完整，结果仅适用于已解析规则；转换与参数生成必须通过 Generate → Parse → IR 语义等价校验。
- PWA 与运行时：页面资源进入离线缓存；构建会清理所有旧规则包 URL；21 个 Service Worker 均只缓存一个当前规则包，文件名哈希与查询哈希一致；共享 classic script 使用块级作用域避免顶层 `const` 冲突。
- 自动化：新增 ACL 页面双语浏览器测试，并将工具纳入目录、Sitemap、SEO/GEO 覆盖、通用内容合约、生产验收和 Release Manifest。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2703 个链接、0 errors、0 warnings；ACL 专项 Chrome/Edge/Android/iPhone 8/8 PASS；规则运行时与 ACL 核心专项 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官首轮发现错误输入仍保留旧结果；修复后最终 `PASS`，独立确认双语四终端 8/8、通用页面 8/8、无障碍、PWA 单一规则包哈希及完整 `npm run verify` 全部通过。
- 实现提交：`02a7efeda4cfcca4d1e857c8d1b9393957210ede`。
- 线上验收：提交 `addd66649a18f9207785ef34d88cc85a7853170c` 对应 Quality Gate `33327420495`、Online Monitor `33327420512`、GA4 Monitor `33327420492`、Performance Monitor `33327454020` 全部成功；正式站英中页面 Chrome/Edge/Android/iPhone 8/8 PASS，覆盖验证、Finding、Junos 转换、参数生成、恶意输入不执行、错误后旧结果清理、响应式溢出及控制台错误检查。

### 2026-08-31 — PoE 功率预算计算器 SEO/GEO 内容

- 状态：`ONLINE PASS`。
- 页面：`website/tools/poe-power-budget-calculator/` 中英文版本。
- 完成内容：增加第 5 个双语长尾 FAQ 与 FAQPage；补充 IEEE 802.3bt、IEEE 802.3at、Ethernet Alliance、Cisco 和 Fluke Networks 共 5 个工程来源；增加可见内容复核日期与来源浏览器契约。
- 正确性边界：明确 20% 至 25% 余量只是项目初始假设，不是 IEEE 强制值；网线损耗百分比只是规划输入，不是完整 IEEE 信道仿真；最终设计仍需核对 PSE/PD 等级、协商功率、电源与冗余状态、线缆信道、成束温升和设备启动行为。
- SEO/GEO 结果：该工具由 `high` 降为 `maintain`，评分 0、无缺口；全站优先级变为 1 high、6 medium、14 maintain，下一项为 SFP/QSFP 兼容性工具。
- 本地验证：`npm run verify` PASS；56 个 HTML 页面、54 个 Sitemap URL、21 个引擎、2713 个链接、0 errors、0 warnings；PoE 双语 Chrome/Edge/Android/iPhone 8/8 PASS；`git diff --check` PASS。
- 独立验证：2 号验证官最终 `PASS`；确认技术内容与引擎一致、5 个来源有效、可见 FAQ 与 FAQPage 精确一致、四项目全站无障碍 8/8、独立完整验证通过。
- 实现提交：`8db85687f8235cf0d172500baa7e588be1c20f3c`。
- 线上验收：提交 `f2b18e69c3761739e124c45e5ea7f1c128551a93` 对应 Quality Gate `33328719167`、Online Monitor `33328719188`、GA4 Monitor `33328719268` 全部成功；Performance Monitor `33328740464` 首次因未改动英文首页单次 TBT 738 ms 超过 600 ms 门槛失败，在不降低门槛的情况下重跑成功；正式站 PoE 英中页面 Chrome/Edge/Android/iPhone 8/8 PASS，覆盖计算、5 FAQ、5 来源、响应式溢出与控制台错误。

## 下一步队列

按“小批次、验证通过后再继续”的顺序执行：

1. 继续 SEO/GEO 队列：wireless-link-budget-calculator、poe-voltage-drop-calculator、network-rack-power-cooling-calculator、vlan-ip-capacity-planner、switch-uplink-oversubscription-calculator。
2. MIB/OID Explorer Phase 0：按 `docs/MIB_OID_EXPLORER_DEVELOPMENT_PLAN.md` 完成来源许可调研、解析器选型、数据字典、威胁模型与技术 ADR；不得在门禁前批量抓取或公开厂商 MIB。

任何新发现的 P0/P1 稳定性或正确性问题，优先级高于上述 SEO/GEO 队列，并必须在本文件说明插队原因。
