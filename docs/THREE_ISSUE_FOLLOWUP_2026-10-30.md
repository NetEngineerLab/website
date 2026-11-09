# 剩余三项修复记录（2026-10-30）

范围：用户在 OPB V3 工具迁移专项完成后，单独授权修复西语首页布局及两个设计预览 FAQ schema。本轮不提交、不 push、不上线。

1. 西语首页：缩小快速入口区标题，并在桌面将卡片图标与标题并排。完整保留原有西语文案、六个工具入口及导航。选择器仅作用于西语 homepage。
2. Fiber Link Budget 设计预览：补齐与原文顺序匹配的 2 条 FAQ 问答 JSON-LD。
3. Optical Power Budget V3 设计预览：补齐与原文顺序匹配的 7 条 FAQ 问答 JSON-LD。

两个预览保留原可见正文及 noindex,nofollow。原测试断言不放宽。历史工具迁移审计保留原结论及当时状态；本记录用于后续三项修复。

最终状态：三项修复全部完成，构建、最终复测及独立审计 PASS；本轮剩余项为 0。未提交、push 或上线。[独立审计报告](../artifacts/three-issue-followup/INDEPENDENT_AUDIT.md)。

验收分工和证据目录：[本轮计划](../artifacts/three-issue-followup/PLAN.md)。

## 最终文件复测

| 检查 | 结果与证据 |
| --- | --- |
| 完整默认测试 | `npm test` 在最终构建后 exit 0；[最终日志](../artifacts/three-issue-followup/npm-test-final.log) |
| 原首页浏览器测试 | 12/12 PASS，三语布局、搜索、快捷工具、目录语言筛选；[日志](../artifacts/three-issue-followup/homepage-browser-final.log) |
| 构建与保真 | `build:i18n` PASS；三个首页 body 逐字不变，1,063 个工具文件 SHA-256 零变化；[构建](../artifacts/homepage-layout-fix/build.log)、[保真](../artifacts/homepage-layout-fix/preservation.json)、[主代理复核](../artifacts/three-issue-followup/tools-after-check.json) |
| 工程六视口 | EN/ZH/ES ×1366/390 均通过；ES 首卡底部为 744.5625px /788.609375px，原阈值为 776px /852px；[实测](../artifacts/homepage-layout-fix/after.json) |

最初默认浏览器 runner 因 4173 端口被占用而未启动测试，未终止该已有服务；改用本轮专用 4175 服务，临时配置只覆盖 baseURL 和输出位置，测试文件与断言保持原样。未重跑全部 592 个浏览器用例，不将本轮定向通过表述为全浏览器门禁全绿。
