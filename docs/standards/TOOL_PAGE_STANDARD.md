# Tool Page Standard — OPB production contract

状态：正式执行标准 v1，2026-10-30；本轮全站独立验收 **PENDING**。先读本文，再读[逐页矩阵](TOOL_PAGE_MIGRATION_MATRIX.md)。本标准整理实际 OPB 生产合同，不设计新模板，也不把历史迁移 PASS 当作本轮全站 PASS。

权威参照只有同 locale 的 [EN](https://netengineerlab.com/tools/optical-power-budget/)、[ZH](https://netengineerlab.com/tools/optical-power-budget/zh/)、[ES](https://netengineerlab.com/tools/optical-power-budget/es/)。本地 `website/tools/optical-power-budget/{index.html,zh/index.html,es/index.html}` 与冻结生产 `artifacts/opb-v3-validation/production-reference/{en,zh,es}.html`、同目录三份 CSS、`artifacts/opb-v3-audit/production-app-v3.js`、`production-interaction.json` 为可复核输入；这些路径和 SHA256 存在[机器 inventory](TOOL_PAGE_MIGRATION_MATRIX.json) 的 baselineEvidence。生产参照如与本文冲突，记录实际差异后纠正文档，不能以文档猜测覆盖生产。

原[OPB 三语基准](../NEL_OPB_V3_TRI_LOCALE_BASELINE.md)与[历史迁移进度](../OPB_V3_MIGRATION_PROGRESS.md)保留为历史证据和详细对照；本文是新任务的强制入口。本文不改变公式、fields/options/IDs、engine、FAQ 领域内容、workflow 目标或 locale 授权。设计预览、遗留副本和目录不是生产参照。

### 已确认偏差与待修边界

本轮独立 102 次 preflight 已发现实际 OPB ES 在 960/961px 的共享 header 自身存在横向溢出（960px viewport 对应 scrollWidth 1036px）。该参照缺陷不固化为标准允许行为；工程仅最小修复共享 header 响应式，保持 OPB 1180px 工作台基准。修复后需独立复测，不能由该待修记录推断已解决。共享 header、六个目标页或 SW 资源发生变化后必须重生 inventory 的源/资源 SHA，再关联新证据；未验维度仍 PENDING，不自动升 A。

PoE ES 同断点的 header 溢出亦已由独立 preflight 确认。该问题在有效源/依赖哈希绑定的 issue 输入中应列 D，而非以“待验”表示不存在问题；修后旧 issue 哈希失配只代表待复验，不代表已修复通过。801–1100px 隐藏可选 header tagline/CTA、保留主要导航，是修复已有共享 header 溢出缺陷的最小响应式策略，不是另立工作台宽度或把故障外观作为新生产基准。

## 1. DOM / page skeleton

OPB body 实际为 `nel-tool-detail-page nel-opb-v3 has-mbar v3`，含 `data-nel-template="tool-detail-v1.3.1"`；迁移工具使用 `nel-tool-v3`，不可冒用 `nel-opb-v3`。main 为 `#calculator.tool-shell.nel-tool-main.nel-tool-grid.nel-tool-primary-grid`，直接组成 tool-head、输入/结果工作区及 `.below > .toc + .prose`。保留平台 header/footer 与 skip link。隐藏 hero 为 `section.hero.nel-tool-hero[aria-hidden=true]`，工作台标题可使用 `p.tool-page-label[role=heading][aria-level=1]`。每页 ID 必须唯一，不能靠覆盖 ID 或删 hook 完成迁移。

## 2. Layout / shared shell

实际 OPB 工作台最大 1180px，桌面 main 左右 padding 28px，两栏为 `minmax(0,1fr) 440px`、gap 20px，宽度 <=960px 单栏；小屏 <=640px 主容器左右 padding 18px。正文 TOC/内容布局与正文宽度服从生产 CSS，不另增全站宽度变量。main/tool-head/below 的跨栏规则由 `website/assets/css/tool-layout.css` OPB 分支和 OPB CSS共同提供；公共迁移版由 `scripts/lib/tool-v3-styles.js` 生成，禁止直接改生成 CSS 作为唯一修复。DOM 合同通过不代表实际 CSSOM 正确：验证 main 左右边界、居中、header 内容几何和可见单一面包屑，不能用 overflow:hidden 掩盖错位。

## 3. Tokens / typography / surfaces

OPB `css/fb-v3.css` 实际 tokens：`--v3-paper:#F6F4EF`、`--v3-ink:#0F172A`、`--v3-ink-2:#334155`、`--v3-muted:#64748B`、`--v3-border-soft:#D8DEE8`、`--v3-accent:#E8590C`、`--v3-accent-soft:#FFF1E6`、`--v3-panel-bg:#EEF2FF`、`--v3-panel-bg-2:#F8FAFC`。Geist / Geist Mono / Instrument Serif 以实际三语 stylesheet URL 为准。输入白面板、浅靛结果面板、细边框、原有圆角和 spacing 来自同 CSS；不增加新色板、深色卡片或装饰层级。CSS 载入先保留工具域 style，再 OPB fb/fb-v3/fb-v3-prod 及平台依赖的实际顺序；迁移公共样式只在 `.nel-tool-v3` 作用域覆盖。

## 4. Components / interfaces / reuse boundary

以下为逻辑名到已有实现的映射，逻辑名是文档术语，不是新增函数或公共 JS API。函数位于 OPB `js/app-v3.js` IIFE，其他工具复用结构与状态契约，仍调用自己的领域 engine。

| 逻辑组件 | 真实函数 / selector | 输入接口 | 输出接口 |
| --- | --- | --- | --- |
| ToolPageShell | body/main/header/footer、`#calculator`、`.below` | locale、工具标题与域内容、平台导航 | 工作台壳、正文槽及统一容器；不接管engine |
| Hero / ToolHero | `section.hero.nel-tool-hero[aria-hidden]`、`.tool-head` | 原h1/lede与本地化标题 | 隐藏hero保留源码、工作台可见标题；不增加第二个可见主标题 |
| InputPanel / ToolInputPanel | `readValues()`、`.fb-panel`、`#projectName` 与字段 IDs | DOM 字符串/选项；数字经 `num/count` 读取 | OPB value object，见第5项 |
| Calculation | `calc()` → `eng.calculate(v)` | value object | `{ok,standard,physical,design,remain,rx,sensM,overM,fiber,splice,conn,split,st,usage,maxD,...}`；不发明跨工具统一公式 |
| ResultPanel / ToolResultPanel | `calc()`、`.readout`、`#ro-main-big` | engine result、activeMode、locale `T` | 主读数/单位、等式、分项、meter 与机器输出 |
| Status / ToolStatus / StatusBadge | `statusMeta(st)`、`syncHealthBadge()`、`[data-status]` | healthy / warning / failed / invalid | st-pass / st-marginal / st-fail 与本地化状态文字 |
| Warning / ToolWarning / explanation | `showInvalid()`、`#validation`、`#ro-reason` | 错误消息或 result 的 tightest margin | invalid 提示/字段错误，或成功结果的原因文字 |
| Recommendation / ToolRecommendation / workflow | `tightest()`、`#ro-reason`、`#nel-tool-graph` | 三项余量、工程 workflow metadata | 原因与后续工程入口；OPB没有独立 recommendation API/必备recommendations卡片 |
| Export / history | `buildReport/copyResult/saveRecord/exportCsv/shareInputs/restoreHistory`、`[data-ro-act]` | last result、原字段、locale、history index | 文本/CSV/URL/本地记录恢复；invalid 时禁用结果导出 |
| Content navigation | `openExplainTarget/bindTocScrollSpy/syncExplainFolds` | hash、viewport、summary操作 | 目标展开/滚动、active TOC、响应式fold状态 |
| TOC / ToolTOC | `.below > nav.toc`、`bindTocScrollSpy()` | 实际内容ID/本地化标题与scroll位置 | anchor列表与当前项标记 |
| Fold / ToolFold | `details.fb-fold`、`syncExplainFolds()` | 四类适用内容、viewport与用户选择 | 解释块展开态/可见态，见第9项 |
| Methodology / ToolMethodology | `details#methodology.fb-fold` | 工具自己的公式、假设、引用 | 可定位的方法正文；无新计算接口 |
| Related / ToolRelated | `#pon-toolkit`、`#nel-tool-graph`、`foldWorkflowExtras()` | 本工具locale相关链接和workflow metadata | 普通工具组/工程workflow链接及原折叠补充项 |
| FAQ / ToolFAQ | `div#faq.blk.faq > details`、FAQPage JSON-LD | 本工具自己的有序问答 | native summary/p与严格一致的schema实体 |

本轮两个目标工具现有 InputPanel 适配的真实接口为 `window.NELToolInputController={calculate():void,managesValidation:true,isValid():boolean}`：PoE 绑定原 `calc`，Wireless 绑定原 `render`，均在初次计算前设置；由既有 `assets/js/tool-shell-v1.9.9-04.js` 消费，不创建新的模块名。shell 复用输入区 `.actions`，添加 `[data-nel-action=calculate].btn.btn-primary[type=button]`，已有 `[data-nel-action=reset]` 使用 `.btn-ghost`；Reset 保留原初始化字段快照并分发 input/change。managesValidation 使通用 clearStale 不覆盖领域 invalid，isValid 门控通用 save/export；领域 copy/print/JSON/CSV 仍由原 app 控制。该接口不是要求所有旧工具立即改用同一 app，也不改变历史存储 key。

## 5. Inputs / validation

### 2026-11-02 公共校验适配接口（批次实施中，签收以实际证据为准）

复用 `window.NELToolInputController`，不在每个 app 复制 DOM 校验/禁用/提示 helper。工具保留自己的 `calculate()`、`isValid()`、`invalidate()`、私有结果和异步 epoch；实际算后调用公共安装的 `sync?.()`。公共 shell 在 DOMContentLoaded 安装并初次同步，承接此前已完成的默认计算。应用脚本与 shell 的实际加载顺序必须有浏览器实证；未加载 shell 不能据接口声明视作已适配。

适配元数据使用精确 selector：`inputControls`、`resultActions`、`resultValues`、`resultDetails`、`resultStatus`、`resultMeters`、`validation`；可指定既有 `calculateSelector/resetSelector/saveSelector/historySelector`。公共层组合领域有效性与适用原生约束，清理陈旧读数/状态/表格/图表并门控明确的结果动作，不用全页按钮 ID 正则猜测，也不隐藏整个结果面板替代清理。保留专业错误信息，只有缺少适用错误时补公共本地化提示。未生成报告的 idle、草稿及验证证据录入不是自动等同输入错误。

仅元数据所声明、当前适用且启用的字段参与检查。默认检查可见的 `inputControls`；若汇总/报告实际依赖其他标签页的 CSS 隐藏字段，可用精确 `validationInputs` 声明其逻辑依赖，并按当前模式返回适用集合。必须用跨模式实际输出证明依赖，不得全局校验所有隐藏字段；disabled、file、type=hidden 控件仍排除。与当前输出无关的隐藏模式字段、模板导入和历史操作不得误禁。显式 step 约束须验证；无 step 的旧工程小数按原引擎语义保留。确有原合法预设与 step 冲突时，只能以 `allowStepMismatchInputs` 指定具体字段并提供实证，不得全局放过。已有计算/重置/保存/CSV/历史流程优先复用，保留原 handler 与存储 key，不重复添加同义按钮或另建历史。成熟补充工具可保留原生命周期，不为统一而强接接口。

验收必须覆盖默认→无效→恢复及手动错误定位、原历史恢复、动作唯一性、状态文字与实际绘制 token、读数/表格/meter 无陈旧成功态。此适配接口不改变 OPB 的领域字段、数学、状态阈值或内容适用性，不能仅凭接口存在签收页面。

`readValues()` 返回 `{project,tx,txMax,sens,over,penalty,d,a,sc,sl,cc,cl,s1,s2,s3,other,margin}`；对应 `projectName/txPower/txMaxPower/rxSensitivity/rxOverload/opticalPenalty/distance/attenuation/spliceCount/spliceLoss/connectorCount/connectorLoss/splitter1/2/3/otherLoss/engineeringMargin`。wavelength/mode/preset 有自己的监听。`bind()` 在 input 先 `invalidate()`，150ms 后重算，在 change 立即重算；按钮 calculate/reset、preset 和 mode 保留原行为。其他工具必须保存自己的字段类型、选项、约束、默认值与单位，不复制 OPB 光学字段。有效/无效、边界及模式切换均应验证，不能只验默认计算。

## 6. Outputs / reporting

OPB DOM 输出包括 `#remainingBudget/#estimatedRx/#physicalLoss/#ro-design/#ro-sensM/#ro-overM/#ro-main-big` 与等式、component bars。主读数按 verification/distance 模式切换 dB/km，接收功率为 dBm。格式化使用原 `fmt` 与本地化文案；机器字段值、复制/CSV/打印/分享/历史记录须与 engine 结果一致。其他工具保留原输出 selector/单位和报告结构，不能通过删长单位解决换行，也不能把零值当空值。

## 7. Status / warnings / recommendations

OPB healthy→`st-pass`，warning→`st-marginal`，failed→`st-fail`；invalid 使用 `showInvalid()` 清空 last、禁用导出、显示 validation、标记字段，不显示旧成功值。`tightest(remain,sensM,overM)` 排序最紧余量解释原因；它不是新的建议评分系统。保留其他工具的既有状态词与业务阈值，仅对齐视觉/可读性。warning/failed/invalid 与恢复成功必须分别实测，状态不得只靠颜色表达。

目标 app 的领域枚举保留，同时给 badge 添加公共 `.status`：`pass/good/excellent` 语义映射 OPB `.status.st-pass`，`warning/marginal` 映射 `.status.st-marginal`，`fail/invalid` 映射 `.status.st-fail`。`scripts/lib/tool-v3-styles.js` 的 scope 仅把别名完整 selector 加入 OPB 原同一声明列表，颜色、边框、字重、padding与形状均复用原规则；不另造色板或!important，不改labels/engine/JSON枚举。必须实测各真实状态的computed tokens与同locale OPB一致，CSS引用存在或类名相似不能替代验收。

## 8. TOC / content blocks

基准顺序为 about-scope、methodology、status-rules、component-check、faq、history、references、content-review、pon-toolkit、nel-tool-graph。目标工具只有适用内容才列 TOC，不为凑数制造 OPB 专有正文。anchor ID 跨三语一致，可见标题翻译；所有链接有唯一真实目标。FAQ 为 `div.blk.faq`，单条 native details；history/references/content-review 普通 section.blk；pon-toolkit 保持 `section.content-section.nel-tool-supporting-section`；workflow 普通 `section#nel-tool-graph.content-section.nel-tool-graph[aria-labelledby]`。不将全部支持内容套 fold。

## 9. Fold / desktop and mobile interaction

只有适用的 about-scope/methodology/status-rules/component-check 使用 `details.fb-fold.blk` 与 `.fb-fold-sum/.fb-fold-title/.fb-fold-body`。生产 `syncExplainFolds()`：>=769px 设置 open=true 和 fb-desktop-open；<=768px 默认收起并尊重记录的用户选择；matchMedia change 同步断点变化。桌面点击 summary 可使 open=false，但 fb-desktop-open CSS 仍显示正文，不能要求桌面关闭即隐藏；移动关闭应真实隐藏。hash 可展开目标并滚动，TOC active需与滚动位置一致。证据为生产三语×390/768/769/1280的12次交互记录，不等于所有迁移目标已验收。

## 10. Mobile / responsive / geometry

移动 TOC 在 <=768px 必须隐藏；生产 <=960px 不显示桌面侧栏、>=961px 才显示 sticky TOC。fold 769 与 layout 961 是不同断点，不合并猜测。小屏输入/读数/按钮应在自身容器内，长单位可读、表格仅局部横滚。按用户问题增测390/768/769/960/961/1100/1101/1280/1440/2250px，记录 main/input/result/header rect、可见面包屑与 document overflow，不仅判断 scrollWidth。该尺寸矩阵是验证覆盖要求，不是新增设计断点。

## 11. i18n / route contract

EN=`/tools/{slug}/`，ZH=`/tools/{slug}/zh/`、lang zh-CN，ES=`/tools/{slug}/es/`；data-nel-locale 分别 en/zh/es。三语生产参照必须逐 locale 对照，不拿 EN 标题硬套中文。保留本地化输入、状态、单位文案、schema与workflow链接；supplemental 当前仅EN/ZH时记录ES缺失，不能凭标准发明locale或新页面。

## 12. SEO / GEO / evidence content

每个正式locale self canonical；hreflang en/zh-CN/es/x-default互指，x-default EN；生产index,follow，preview保持noindex及middleware的X-Robots-Tag。title/description/OG/Twitter按该工具locale内容与正式URL。WebApplication/WebPage/BreadcrumbList/FAQPage以实际源码为准，类型/属性白名单不得改写；FAQ schema与可见问题答案逐项顺序一致，不抓说明fold冒充问答。GEO依实际方法、适用边界、引用、review信息支持可检索回答；不声称存在OPB未有的GEO专属标签/AI排名保证，不复制其他工具引用或伪造审核日期。

## 13. Accessibility / interaction semantics

实际 OPB 有 skip link→#calculator、label/aria-label、fieldset相关结构、结果 `aria-live=polite`，native button/summary、aria-hidden装饰hero与图标。保留键盘preset Enter/Space、Tab顺序、focus可见、summary Enter/Space、TOC anchor和错误字段定位。不可用aria-hidden藏掉仍可聚焦控件；读屏状态/输入名称与可见文案一致。这里只列实际语义与验收动作，不据源码宣称完整WCAG认证；新a11y审计待执行。

## 14. Tests / reproducibility / cache

静态入口：`node scripts/tool-detail-v3-contract-test.js`、tool/pon-scenarios、jsonld-schema，原独立数学ANCHORS、engine fixtures、loader/schema顺序/权威引用断言不得削弱。browser tools/shell/各工具流程验证功能和geometry，engine hash/字段/options/inline对比确保结构修复未改领域逻辑。build后重复落盘与raw hash稳定验证必须保留。SW当前cache与精确资源版本、旧SW升级、新context首装离线及recompute都要测；不能以新?v推断旧跨scope缓存已消失。HTML相对/根路径资源请求query与precache保持同源精确一致，目录/index分别缓存；先生成CSS再计算assetVersion，最终HTML定稿后算cache hash。

## 15. Acceptance / matrix / ownership

### 用户再次确认的逐页基准门禁（2026-11-02）

用户要求：“一定要与标准页面核对正常后才能验收，我看许多页面没有完全修改对”。因此每个实际locale页面必须关联同locale OPB权威参照及实际差异核对记录，包含DOM、同种控件的computed字体/字号/行高/边框/背景、主次按钮与tabs、结果surface/状态、TOC/fold/FAQ及必需视口截图。动态增加行、切换模式和生成报告后的组件也须核对，不能只查初始静态HTML。功能通过、无overflow、脚本exit0或已引用V3样式均不等于本门禁通过。

专业内容和A/B/C方案等确有必要的构图可保留，但旧蓝色主按钮、重复input内外边框、旧标题/标签字体或错误surface/radius属于必须修复的组件差异，不得以领域构图N/A解释。真实N/A必须说明原内容适用性及证据；不得用删内容、藏面板或改比较对象让差异消失。所有阻断差异闭合、独立审计核对当前源/依赖哈希后才授A；未核对或未通过保持待验或按已证实问题记D。

先以本标准和逐页矩阵冻结范围，再实施，再由未参与实现的 independent_audit 核对实际源码与证据。用户分类原义：A=已经符合 OPB V3 标准；B=部分符合，需要局部迁移；C=旧模板，需要完整结构迁移；D=存在功能或架构问题，需要先修复。A只给当前源SHA绑定、15项适用门禁/功能/三语/响应式/SEO/a11y/cache均完成且独立签收的页面；GEOMETRY PASS只更新geometry证据，不能升级A。当前核心页B为静态部分符合的保守暂列，局部工作与verificationPending独立记录，不能凭旧记录宣称全部达标；不能只凭缺template判C或凭未验推断D。目录/辅助/offline/预览/遗留副本另以scope support/archive/preview及EXCLUDED附表列出，不占用A/B/C/D。实际draft计算器须纳core并标registry draft，不因draft字样排除。未测维度一律PENDING，不从历史记录外推。机器生成不凭shell授A，只接受下述独立输入。禁止自动commit/push/merge/deploy；报告必须给出文件范围、真实失败/skip/retry与剩余风险。

### 独立状态输入与哈希失效机制

`node scripts/generate-tool-page-matrix.js` 默认读取可选的 `docs/standards/TOOL_PAGE_STATUS_EVIDENCE.json`；独立 Agent 可提供其他真实审计文件，通过 `--status-evidence <path>` 指定。该输入由独立审计产出，本轮不创建占位 PASS。结构为 `{entries:[...]}`；每项必须有 `source`、`sourceSha256`、`status`（A或D）、`reviewer:"independent_audit"`、`verdict`（PASS或ISSUE）、`evidence`及该真实证据文件的 `evidenceSha256`，并提供当前 `dependencyFingerprint` 或完全匹配 inventory 的 `dependencies:[{source,sha256}]`。

依赖绑定涵盖 HTML 直接引用的本地 CSS/JS、CSS 的本地 @import 与该工具 SW；JSON inventory逐页列出精确集合。查询参数仍记录在资源引用数据中；依赖内容改变即令绑定失效。A还必须在 `dimensions` 明列全部15键：dom/layout/tokens/components/inputs/outputs/risk/toc/folds/mobile/i18n/seo-geo/a11y/automation/acceptance；D必须填写具体 `issue`。缺证、哈希漂移或不完整签收会在 `statusEvidence.rejected` 明列原因，核心页退B且verificationPending=true，绝不解释为缺陷已消失。工程冻结后重生，再使用新审计真实证据覆盖；没有证据时保持待验，不编造acceptance。
