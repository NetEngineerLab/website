# 西班牙语翻译进度 — V1.3 Launch

**状态：首批正式上线**  
**日期：2026-09-12**  
**Locale：`es` = `active`**

## 已正式上线（10/35）

- [x] fiber-loss
- [x] optical-power-budget
- [x] pon-splitter-loss
- [x] bandwidth-calculator
- [x] subnet-calculator
- [x] vlan-ip-capacity-planner
- [x] poe-power-budget-calculator
- [x] pue-data-center-energy-efficiency
- [x] ups-capacity-battery-runtime-calculator
- [x] wireless-link-budget-calculator

## V1.3 Launch 已完成

首批 10 个工具已完成西语页面级翻译与上线门禁，包括：

- 页面标题、说明、输入项、按钮、结果字段；
- FAQ、Methodology / 工程方法、限制与参考资料；
- 动态 JS 提示的西语运行层；
- `searchIntent`、`primaryTopic`、`longTailQuestions`、`reviewedAt`；
- canonical、`hreflang="es"`、FAQ JSON-LD、SEO/GEO 元数据；
- 西语 Header / Footer / Language Menu；
- 西语页面多一层目录导致的 CSS / JS / data 相对路径修复；
- Tool Registry、Workflow Registry、Page Registry、I18N、SEO/GEO 与 10 个工具计算引擎测试。

## 索引范围

本阶段采用 **Partial Locale Rollout（语言分批发布）**，不是一次性把 35 个工具全部发布为西语。

- 西语可索引 URL：16 个
  - `/es/`
  - `/es/about/`
  - `/es/contact/`
  - `/es/privacy/`
  - `/es/terms/`
  - `/tools/es/`
  - 首批 10 个 `/tools/{slug}/es/`
- `es/404.html`：继续 `noindex`。
- 其余 25 个 active tools：**不生成正式 `/es/` 发布页，不进入 sitemap，不输出西语 hreflang**。

## 下一阶段

按相同门禁继续第二批西语工具；每批必须先完成页面翻译、动态文案、SEO/GEO、资源路径、计算引擎和发布审计，再进入 sitemap/hreflang。
