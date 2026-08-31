# NetEngineerLab V2.0 可执行实现规范（适配版）

**版本：V2.0.0-adapted**  
**制定日期：2026-08-31**  
**状态：Approved for Implementation**  
**上位文档：** [`NETENGINEERLAB_V2_ARCHITECTURE_SPEC.md`](./NETENGINEERLAB_V2_ARCHITECTURE_SPEC.md)

## 1. 分析结论

用户提供的“目录结构 + Tool Schema + Vendor Renderer 接口规范”与现有 V2.0 架构方向一致，尤其适合后续 OSPF Cost Calculator、VLAN Config Generator、Ping Analyzer 三个架构验证工具。它把“页面、核心逻辑、Schema、Validator、Parser、Rules、Vendor Renderer、Exporter、测试”职责和依赖方向具体化，可作为新工具的开发模板。

但不能原样覆盖当前仓库：当前项目是已上线的静态多语言站，运行时以 `website/tools/<slug>/`、原生 JavaScript、共享模板、Service Worker、Sitemap 和 GitHub 门禁为准。一次性迁移到 `src/*.ts` 会破坏 URL、缓存和发布链。因此本文件采用“规范采纳 + 仓库适配”的执行方式。

## 2. 已采纳的强制契约

新工具开发必须按工具类型选择链路，不得把 Analyzer 的 Rules 顺序套用到所有工具：

```text
Calculator：UI → Controller → Validator → Core → ToolResult → Exporter
Generator：UI → Controller → Validator → Normalized Model → Capability Check → Vendor Renderer → ToolResult → Exporter
Analyzer：Raw Text → Parser → Normalized IR → Rules → Findings → Recommendation → ToolResult → Exporter
Planner：Requirements → Validator → 多个 Core → Planning Rules → Planning Model → ToolResult → Exporter
```

- Tool ID 使用全球唯一的 lowercase kebab-case；上线后不随意改名。
- Tool Type 仅允许 `calculator`、`generator`、`analyzer`、`planner`；工具名称中的 checker、builder 等不是底层类型。
- Schema 描述工具元数据、输入、输出、Engine、SEO、FAQ、来源和能力；Schema 不承载匿名函数或业务计算。
- Core 优先为纯函数、可序列化、确定性、无 UI/SEO/厂商依赖的模块。
- Validator 统一返回 `{ valid, code?, message? }`；非法对象、数组、类型强转、非有限数、边界值和派生溢出必须失败关闭。
- Generator 使用厂商无关 Normalized Model，再由 `VendorRenderer` 输出配置；页面不得堆叠 Cisco/Huawei/H3C/Juniper 分支。
- Parser 只负责识别、拆分、保留来源位置并归一化；Rule Engine 才负责 Finding、严重度、Evidence 和建议。
- Exporter 只接受已验证的 ToolResult；复制、TXT、JSON、CSV 等导出不得泄露旧结果或密钥。
- 新增 Core、Parser、Rules、Renderer 必须配套单元、契约、Golden 或语义回环测试。

## 3. 当前仓库落点

| 规范概念 | 当前实现位置 | 执行要求 |
| --- | --- | --- |
| Tool package / Page | `website/tools/<slug>/`、`zh/` | 保持线上 URL；页面只做交互和展示 |
| Registry / Schema | `website/data/tools-catalog.json`、工具 integration 元数据 | 先扩展现有注册源，不建立第二份孤立清单 |
| Core | 工具 `js/engine.js` 或共享 `website/assets/js/` | 跨工具复用时再抽入共享 Core；`generated/` 仅放构建产物 |
| Controller | 工具 `js/app.js` | 只编排输入、Core、结果和导出，不承载公式/厂商语法 |
| Vendor / Parser / Rules | 工具专属模块或 `website/assets/js/` 源模块 | `website/assets/generated/` 只能存构建产物，禁止作为独立配置源 |
| Shared UI | `website/templates/`、`website/assets/css/` | 统一 Header/Footer、设计令牌和可访问性 |
| Tests | `tests/`、工具 `docs/engine-test.js` | 必须进入现有 `npm run verify` 或等价门禁 |

建议的 `src/`、TypeScript、独立 `schemas/`、`vendors/`、`parsers/` 目录属于未来迁移目标；只有构建、路径、PWA、Sitemap、canonical、hreflang 和生产验收具备等价门禁时，才允许逐模块迁移。

## 4. 接口与模型适配决策

规范中的 `ToolSchema`、`ToolResult<T>`、`ToolError`、`ToolWarning`、`Parser<T>`、`VendorRenderer<T>` 和 Normalized Model 作为设计接口；当前 JavaScript 实现可先用 JSDoc/JSON 约束，不强制立即引入 TypeScript。

严重度沿用仓库已经落地的 `CRITICAL`、`HIGH`、`MEDIUM`、`INFO` 契约，不采用规范示例中的 `LOW`、`WARNING` 别名。任何规则、评分、Evidence 和报告不得因迁移改变既有严重度。

Vendor ID 采用操作系统级标识（如 `cisco-ios`、`huawei-vrp`、`h3c-comware`、`juniper-junos`）；厂商语法必须同时有可核验的官方文档依据和独立 Golden/语义回环测试。缺少任一证据时必须失败关闭并标记 Unsupported Feature，不得猜测命令。

## 5. 新工具最小交付模板

每个新工具在实现前必须写清：`id/type/category`、输入/输出 Schema、默认值、Engine 或 Parser、Rules、Vendor 能力、SEO 主意图、长尾问题、FAQ/来源、Related Tools 和测试计划。普通 Calculator 的最小交付为“Schema + Core + Page + Tests”；Generator 额外需要 Normalized Model + Renderer；Analyzer 额外需要 Parser + Rules + Findings。

## 6. 验收与迁移门禁

1. 运行既有全站门禁，旧工具和旧 URL 无回归。
2. 对结构化输入、非法对象/数组、非有限数、类型强转、最小/最大边界和派生溢出做失败关闭测试。
3. 中英文页面共享布局、FAQ/Schema、来源、可见复核日期和 Related Tools 结构。
4. 通过 SEO/GEO、Sitemap、canonical/hreflang、资源哈希和 Service Worker 检查。
5. 由 2 号验证官独立 `PASS` 后才提交和推送。
6. `docs/DEVELOPMENT_LOG.md` 必须登记分析决策、测试证据、验证结论、Commit SHA、CI 和正式站验收；无证据不得写 `ONLINE PASS`。

## 7. 实施顺序

以下只是架构验证路线，不自动改变 `docs/DEVELOPMENT_LOG.md` 的唯一正式开发队列；启动任一项前必须先在总账登记目标、插队原因和验证计划。第一阶段不重写全站，先用现有静态架构完成共享契约和三个验证工具：

1. OSPF Cost Calculator（Calculator）
2. VLAN Config Generator（Generator）
3. Ping Analyzer（Analyzer）

三者通过架构验收后，再按工程价值、搜索意图、复用率和维护成本扩展工具。该规范不能绕过现有 V2.0 文档、`.github/copilot-instructions.md` 或自动化安全门禁。
