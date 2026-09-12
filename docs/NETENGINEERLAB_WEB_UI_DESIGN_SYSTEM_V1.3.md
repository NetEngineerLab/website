# NetEngineerLab Web UI Design System & Tool Detail Standard V1.3

**版本：V1.3**  
**冻结日期：2026-09-12**  
**视觉参考：Network Change Planner & MOP Generator**

## 1. 核心原则

所有 Tool Detail 页面必须让用户一眼识别为同一个 NetEngineerLab 产品。工具功能可以不同，但平台外壳不得出现“第 1 代 / 第 2 代 / 第 3 代页面”并存。

统一顺序：

`Header → 返回工具中心 / Breadcrumb → Hero → 主工作区 → 方法/FAQ/相关工具 → Footer`

## 2. 唯一页面轴线

- Desktop 最大内容宽度：1400px
- Desktop gutter：24px
- Tablet gutter：20px
- Mobile gutter：16px；<=420px 为 14px
- Header、Breadcrumb、Hero、Main、Supporting sections、Footer 必须共享同一水平轴线

## 3. Hero 唯一标准

Hero 视觉以 Network Change Planner 页面为参考：

- 深蓝 → 工程蓝渐变
- 28px 圆角
- 统一阴影
- Desktop 最小高度约 300px
- 46px/52px 级别内边距
- Eyebrow：13px、工程蓝高亮、大写/字距
- H1：`clamp(40px, 3.65vw, 62px)`，中文 `word-break: keep-all`
- 摘要：17px / 1.75
- Tags：统一 pill 形式；每个 Tool Detail Hero **固定 4 个简短工程标签**，不得少于或多于 4 个，也不得用长句充当标签

本地工具 CSS **禁止**定义 `.hero`、`.tool-hero`、`.hero-inner`、`.hero-tags` 等平台级选择器。

## 4. 主工作区

普通计算器：

- 输入 + 结果双栏
- `1.03fr / .97fr`
- 24px gap
- 白色卡片、22px 圆角、统一边框和阴影

复杂工具：

- ACL、Network Change Planner 等可保留专业工作区
- 但 Hero、Breadcrumb、页面轴线、卡片视觉、移动端、Header/Footer 必须服从 V1.3

## 5. Mobile

- <=1100px 主工作区单列
- <=768px Hero 缩小内边距并取消固定高度
- CTA 只允许 Header 中存在 1 个
- 触控区域 >=44px
- 不允许横向页面溢出

## 6. 强制门禁

```bash
npm run audit:ui
npm run audit:ui-v1.2
npm run audit:ui-v1.3
npm run audit2:ui-v1.3
```

任何新增 Tool Detail 页面，在以上门禁全部 PASS 前不得发布。


# V1.3.1 Source Convergence Addendum

V1.3.1 freezes source ownership, not only rendered appearance.

- Ordinary calculator DOM must be exactly: `main.tool-shell.nel-tool-grid > section.input-panel.card.nel-tool-input + section.result-panel.card.nel-tool-result`.
- Only four specialized exceptions are allowed: ACL Generator, IPv6/NAT Planner, Network Change Planner & MOP Generator, Wi-Fi Coverage & Capacity Planner.
- Every Tool Detail Hero must contain a `.hero-tags` group.
- Tool-local CSS must not define platform classes `.breadcrumbs`, `.card`, `.panel`, `.input-panel`, `.result-panel`, `.content-section`, `.start-btn`, or platform Hero selectors.
- `tool-shell-v1.9.9-03.js` is retired and must not exist.
- `npm run audit:ui-v1.3.1` and `npm run audit3:ui-v1.3.1` are release-blocking gates.


## 9号审计补充：源码、可访问性与 HTML 有效性阻断规则

V1.3.1 Audit9 在既有视觉基线之上增加以下发布阻断要求：

- 工具本地 CSS 禁止直接定义 `html`、`body`、`html, body`、通用 `.eyebrow` 或 `main#calculator`，基础排版与主轴几何只能由共享 Design System 控制。
- `website/assets/css/tool-layout.css` 只能保留 **1 个** `UI V1.3.1 — CANONICAL TOOL DETAIL BASELINE`，禁止同时保留旧 V1.2.2/V1.3 几何兼容块。
- 所有启用状态的 `input` / `select` / `textarea` 必须具有可编程访问名称（`label[for]`、包裹式 `label`、`aria-label` 或 `aria-labelledby`）。
- 公共 HTML 禁止出现 `</meta>`、`</link>` 等 void element 错误闭合标签。
- `og:title` / `og:description` 必须与当前语言的 `<title>` / meta description 同步。
- 中文、西班牙语语言菜单的辅助说明必须本地化，禁止回退为 `English / Chinese / Spanish`。
- Service Worker precache 解析器必须在**未安装 `node_modules`** 的交付 ZIP 中仍能安全验证 canonical `install → waitUntil → caches.open → addAll` 链，并拒绝注释/字符串诱饵、变量遮蔽、数组篡改和错误生命周期事件。

发布前必须运行 `npm run audit9:ui-v1.3.1` 与 `npm run test:sw-precache`。
