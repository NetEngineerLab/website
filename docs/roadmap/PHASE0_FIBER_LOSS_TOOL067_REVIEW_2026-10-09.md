# Phase 0 局部证据审计：`fiber-loss` ↔ `TOOL-067`

日期：2026-10-09。范围仅为这对未决候选及 `website/tools/fiber-loss/` 的直接实现与验证证据。本记录是审计输入，不是映射签署或 Tool Admission Gate 通过证明。

取证基线：`HEAD=25de581717380ec3d11d38f7d9e4bf851be92edc`。本文所有页面 `index.html` / `zh/index.html` 引文行号均按 `git show HEAD:对应路径` 核对，避免工作树并发修改使行号漂移。局部核验时 `engine.js`、`app.js`、`docs/engine-test.js`、两份 CSV、注册表及 Gate 文件相对 HEAD 均无改动。期间工作树出现外部全站变更，其中包括 `website/tools/fiber-loss/{index.html,zh/index.html,es/index.html,sw.js}`；这些变更不纳入本次审计，也不据此推断映射结论。

## 当前边界与结论

`ROADMAP.md:45,65,85,107` 规定仅继续 Phase 0 未决候选审计，整体仍为 `HOLD / NOT PASS`，没有获准开发的 `NEXT`。矩阵 `PHASE0_AUDIT_MATRIX.csv:68` 仅把 `fiber-loss` 列为 `TOOL-067` 的候选，映射信心 `MEDIUM`，`overlap_decision=UNREVIEWED`、`gate_status=NOT_STARTED`；交叉表 `PHASE0_EXISTING_TOOL_CROSSWALK.csv:2` 同样是 `HYPOTHESIS`。本轮判断：**保留 HYPOTHESIS，无法可靠确认重复，也无法确认它是不同问题**。相近的名称与光学领域提供审计线索；候选的可比较问题定义仍缺失。不得据此改为 `CONFIRMED`、`REJECT_DUPLICATE`、`PASS`、`NEXT` 或 `READY`。

## 六维问题指纹

| 维度 | 现有 `fiber-loss` 的实际证据 | `TOOL-067` 的候选证据及可比较性 |
| --- | --- | --- |
| 问题 | 计算光链路的光纤、熔接、连接器、分光及其他损耗，并检查设计余量和接收功率；注册表描述 `src/registry/tool-registry.json:3-12`，页面目标 `website/tools/fiber-loss/index.html:91-92`。 | 只有名称 `Fiber Link Loss Calculator`；`problem_statement=PENDING`（矩阵第 68 行）。名称相近，但未说明它要解决的具体工程决策。 |
| 输入 | 距离/衰减、熔接与连接器数量和单点损耗、两级分光及其他损耗、工程余量、可用预算、发射功率和接收门限；`website/tools/fiber-loss/js/engine.js:9-26`，UI 到引擎映射 `website/tools/fiber-loss/js/app.js:141-158`。 | `inputs=PENDING`（矩阵第 68 行）；不能检验输入集合是否相同。 |
| 输出 | 分项及总物理损耗、设计损耗、预算余量、估算接收功率、接收余量与三档状态；`website/tools/fiber-loss/js/engine.js:31-49`，UI 展示 `website/tools/fiber-loss/js/app.js:179-201`。 | `outputs=PENDING`（矩阵第 68 行）；不能检验输出用途和粒度。 |
| 核心逻辑 | 长度×衰减、数量×单点损耗，再累加物理损耗；加工程余量得到设计损耗，分别比较预算和接收门限，余量低于 0 判失败、低于 3 dB 判警告；`website/tools/fiber-loss/js/engine.js:29-49`。 | `core_logic=PENDING`（矩阵第 68 行）；无从确认同一计算方法或特有范围。 |
| 目标用户 | 页面面向光链路规划、复核及故障分析；正式验收仍需现场测量；`website/tools/fiber-loss/index.html:398`，页脚将站点定位于电信与网络工程师 `:415`。 | `target_user=PENDING`（矩阵第 68 行）；仅领域接近。 |
| Primary Domain | 注册表标记 `category/domain=optical`、`calculate/plan`，`src/registry/tool-registry.json:7,38-43`；页面显示光通信工程用途 `website/tools/fiber-loss/zh/index.html:91-95`。 | 矩阵给出 `B2 / Optical & Transport`（第 68 行）。领域方向吻合；注册表分类与路线图 Primary Domain 不是同一字段，不能单凭此确认语义映射。 |

## Source / Method / Validation 与缺口

现有方法可由引擎公式和页面说明直接核对：`website/tools/fiber-loss/js/engine.js:29-49`、`website/tools/fiber-loss/index.html:353-367`。页面列出工程参考与现场验收提醒，并说明 3 dB 健康阈值是本工具的规划规则而非普遍强制标准（`website/tools/fiber-loss/index.html:374-398`）；本轮未做外部来源核验，也不能把该说明当作候选 `TOOL-067` 的 Source 证明。现有引擎的本地验证脚本覆盖正常场景、无效输入、边界与状态分级（`website/tools/fiber-loss/docs/engine-test.js:7-78`）。

**单行证据缺口：**需先为 `TOOL-067` 补齐独立于现有工具名称的 problem、inputs、outputs、core_logic、target_user 定义及预期 Source / Method / Validation，之后逐维比对，才能提议 `REJECT_DUPLICATE`、`MERGE`、`KEEP` 或 `NO_OVERLAP` 并交独立审核。矩阵的 Mandatory Gate、Value Gate 和跨站决策仍为 `PENDING`（`PHASE0_AUDIT_MATRIX.csv:68`）。不填造 `canonical_problem_id`、责任人或签名。

## 局部验证与变更界限

- `node website/tools/fiber-loss/docs/engine-test.js` → `Fiber loss engine tests: PASS`（2026-10-09）。仅证明当前引擎通过现有局部用例，不证明路线图候选映射或 Gate 通过。
- 本任务只新增本审计文档；本任务没有编辑 CSV、`ROADMAP.md`、`AI_PROJECT_CONTEXT.md`、Engine、Registry 或 UI。公开 Gate 保持 `HOLD / NOT PASS`。
