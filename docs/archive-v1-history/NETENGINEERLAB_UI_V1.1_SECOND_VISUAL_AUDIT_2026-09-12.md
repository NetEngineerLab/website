# NetEngineerLab UI V1.1 第二轮视觉审计与源 CSS 清理

**日期：** 2026-09-12  
**基线：** NetEngineerLab UI Design System V1.0.1 完整项目  
**新标准：** `NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md`

## 1. 审计结论

上一轮的 43 条 legacy warning 实际涉及 **35 个工具源 CSS 文件**；部分工具同时存在旧页面宽度和旧 Footer，因此 warning 数高于文件数。

V1.1 不再接受“最终由 `tool-layout.css` 覆盖，所以视觉上没问题”的处理方式。本轮直接清理工具源 CSS，并把 UI 审计升级为 source-clean gate。

## 2. 发现的主要技术债

1. 多代工具分别使用 1160 / 1180 / 1200 / 1240 / 1280 / 1360 / 1380 / 1720 / 1740 / 1780 / 1900px 作为页面骨架宽度。
2. 历史工具 CSS 内重复维护 Header、Brand、Navigation、Language 和 Footer；共享模板升级时存在被旧页面规则反向覆盖的风险。
3. 一部分主卡片仍使用本地圆角和阴影，导致新旧工具卡片视觉层级不一致。
4. 个别工具保留 1180/1200px 的旧“桌面转单栏”断点，与当前 1100px 工具工作区断点不一致。
5. 旧审计只扫描最终结构，不要求源 CSS 本身干净，因此 43 条 warning 长期存在。

## 3. 已完成修改

- 35 个工具 `css/style.css` 逐文件清理。
- 页面主骨架宽度改为 `var(--nel-content-max, 1400px)`。
- 广告位宽度独立为 `--nel-ad-max`，避免把广告内容宽度误当页面骨架宽度。
- 长标题/说明的内部可读宽度改用 `ch`，不再借用历史页面像素宽度。
- 删除工具 CSS 对 Header/Nav/Brand/Language/Footer 的重复所有权；统一交给 `site-shell.css`。
- 主 `.card/.panel/.input-panel/.result-panel` 等使用 Design System 的 surface / border / radius / shadow token。
- 旧 1180/1200px 工作区折叠断点统一到 1100px（仅针对重复的平台级折叠规则）。
- 更新所有受影响工具页的本地 CSS cache-busting hash，避免 Cloudflare/浏览器继续命中旧样式。
- `audit:ui` 升级到 `NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1`，旧 CSS 问题从 advisory warning 提升为发布 error。

## 4. V1.1 自动门禁

`npm run audit:ui` 现在同时检查：

- Shared Header/Footer 是否存在；
- Tool Design System / Tool Layout 是否加载；
- 返回工具中心导航是否存在；
- 工具源 CSS 是否重新定义 Header/Nav/Footer；
- 主页面骨架是否仍使用 legacy numeric max-width；
- 主卡片是否仍使用旧圆角/阴影；
- 1400px Token 是否仍为唯一公共页面宽度基线。

## 5. 最终结果

- Public pages：101
- Tool Detail pages（含多语言发布页）：80
- Tool source CSS：35
- UI errors：0
- UI warnings：0
- **UI V1.1 Audit：PASS**

这意味着上一轮的 43 条 legacy warning 已经从源代码层消除，不再依赖最后一层 CSS 覆盖来维持页面一致性。
