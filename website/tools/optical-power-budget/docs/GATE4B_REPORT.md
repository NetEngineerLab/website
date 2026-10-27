# 任务：NEL-OPB-V3-GATE4B

**执行日期**：2026-10-27（Asia/Shanghai）  
**预览**：https://netengineerlab.com/design/fieldbook/tool-optical-power-budget-v3（保持 noindex）  
**正式目标 URL**：https://netengineerlab.com/tools/optical-power-budget/  
**分支**：`nel/opb-v3-gate4b`（**未合并 main**；合并即 Cloudflare Pages 生产部署，须等用户回复「上线」）

## 原则

老版内容与功能不丢失；V3 负责布局与视觉；公式沿用 `js/engine.js`（未改）；SEO 头 / hreflang / JSON-LD / 站点壳从正式旧页完整保留。

## Gate 结果摘要

| # | 项 | 结果 |
|---|---|---|
| 1 | 旧版内容保留 | **PASS**（EN：V3 正文+Workflow；zh/es：计算器 V3 + 旧版本地化说明/FAQ/标准/Workflow） |
| 2 | 计算正确性 | **PASS**（`tests/gate4b-engine.test.js` + Playwright Case A/B/C） |
| 3 | 最大距离模式 | **PASS** |
| 4 | 320/375/768/1440 | **PASS**（无横向溢出；参数/结果可用） |
| 5 | SEO | **PASS**（正式页 index,follow + canonical + hreflang + WebApplication/FAQPage/BreadcrumbList/WebPage；预览仍 noindex） |
| 6 | GEO | **PASS**（公式/分项/FAQ/标准/审阅保留；FAQ 可见文与 schema 同源旧正式文案） |
| 7 | 中英西多语言 | **PASS**（三语 200；同算例 25.80；状态文案本地化；语言菜单保留） |
| 8 | 历史记录及导出 | **PASS**（Save/CSV/Copy/Print；非法输入禁用导出；history key=`opticalBudgetHistory`） |

## P0 / P1

- **P0 数量：0**
- **P1 数量：0**（本轮已修：`#component-check` 锚点展开+滚动；整数 `1.5` 校验；正式 SEO 交接；zh/es 正文回接旧版本地化）

### P2（记录，不阻断）

- zh/es 计算器 chrome 为翻译映射，长说明用旧版区块；与 EN Fieldbook 折叠交互不完全同构。
- Clear history 无 confirm 对话框。
- 正式页仍加载旧 `css/style.css` + Fieldbook CSS，存在少量样式叠加冗余（视觉以 V3 为主）。

## 自动化证据

- Engine：`node website/tools/optical-power-budget/tests/gate4b-engine.test.js` → ALL PASSED  
  - A：25.80 / 28.80 / 32 / 3.20 / −22.80 / healthy  
  - B：d=11 → 26.10 / 2.90 / −23.10 / warning  
  - C：GPON B+ → remain −0.80 / failed  
  - maxD、3 dB 边界、过载用 txMax、margin 不从 rx 扣除、非法小数/负数
- UI：`/workspace/fieldbook-v3c-polish/run-gate4b-ui.mjs` → FAILS 0（见 `gate4b-ui.json`）

## 修改文件（主要）

- `website/tools/optical-power-budget/index.html`（+ `index.v2-legacy.html` 回滚副本）
- `website/tools/optical-power-budget/zh/index.html`（+ legacy 副本）
- `website/tools/optical-power-budget/es/index.html`（+ legacy 副本）
- `website/tools/optical-power-budget/js/app-v3.js`（Fieldbook UI + i18n + hash scroll）
- `website/tools/optical-power-budget/css/fb.css`, `fb-v3.css`, `fb-v3-prod.css`
- `website/tools/optical-power-budget/tests/gate4b-engine.test.js`
- `website/design/fieldbook/fb-v3-opb.js`（预览 hash scroll 同步）
- `website/design/fieldbook/MERGE_SEO_CHECKLIST.md`, `MERGE_TO_PRODUCTION_CHECKLIST.md`

## 回滚方案

1. 不合并本 PR → 生产不变。  
2. 若已合并：将 `index.html` / `zh/index.html` / `es/index.html` 恢复为同目录 `*.v2-legacy.html`，或 `git revert` 本 PR squash commit；保留 `js/engine.js` 不动即可恢复旧 UI。  
3. 预览页始终独立 noindex，不受正式回滚影响。

## 最终裁决

**READY_TO_DEPLOY**

上线建议：审核 PR → 用户明确回复「上线」→ squash merge 到 `main`（Cloudflare Pages）→ 强刷正式 URL 复核 robots/hreflang/Case A 与 `#component-check` → 预览继续 noindex。

**当前未部署生产**（分支未合并）。
