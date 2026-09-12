# NetEngineerLab UI V1.3 — 全站视觉模板收敛

日期：2026-09-12  
参考页：`/tools/network-change-planner-mop-generator/`  
状态：完成，进入正式 UI 基线

## 为什么升级到 V1.3

V1.2.2 已经把 Tool Detail 的外层 HTML 迁移到统一语义结构，但视觉仍受历史工具本地 CSS 影响。用户现场截图显示：Fabric、SFP/QSFP、OLT 双上联、传输环、Network Change Planner 仍表现出明显不同的 Hero、卡片、间距与页面节奏。

根因不是一个 CSS 值，而是“平台视觉层”和“工具业务层”长期混在各工具本地 `style.css` 中。34 个工具仍含 `.hero/.tool-hero/.hero-inner/.hero-tags` 等平台级选择器，因此即使 HTML 结构统一，视觉仍会分叉。

## V1.3 决策

以 Network Change Planner & MOP Generator 为视觉参考页，冻结全站 Tool Detail 的平台层：

`Shared Header → Return/Breadcrumb → Gradient Hero → Main Workspace → Supporting Sections → Shared Footer`

统一内容：

- 1400px 页面轴线
- Return/Breadcrumb 高度与留白
- Hero 渐变、圆角、阴影、标题/摘要/标签样式
- 普通工具输入/结果双栏
- 卡片边框、圆角、阴影与主标题层级
- 平板/手机断点
- EN/ZH/ES 同构

保留差异：

- 工具本身的字段、图表、拓扑、工作流、MOP、结果模型
- Network Change Planner 的四步导引、状态条等业务组件
- ACL 等复杂工具的专业工作区

## 源代码清理

- 80 个 Tool Detail 页面全部切换到 `data-nel-template="tool-detail-v1.3"`
- Hero class 统一为 `hero nel-tool-hero`
- Hero 内部容器统一为 `hero-inner`
- `tags/chips/hero-tags` 统一为 `hero-tags`
- 34 个工具本地 CSS 中的平台 Hero 选择器已删除
- 平台视觉只允许由共享 `tool-layout.css` 定义

## 发布门禁

新增：

```bash
npm run audit:ui-v1.3
npm run audit2:ui-v1.3
```

第一道门禁检查 35 工具 / 80 页面结构、CTA、Hero、Breadcrumb、Footer 与本地 CSS 越权。
第二道门禁由“2号审核员”按不同规则独立复核页面顺序、SEO canonical、viewport、Hero 结构和共享 CSS 不变量。

## 结论

V1.3 的目标不是“所有工具长得一模一样”，而是“所有工具属于同一个产品”。业务内容允许不同，平台外壳、视觉语言、移动端与导航不再允许出现多代模板。
