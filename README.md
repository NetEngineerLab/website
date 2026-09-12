# NetEngineerLab V1.7.5 生产性能自动巡检版
## Web UI 强制基线

新增或重构任何公开页面前，必须先读取 `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md`。该文件冻结全站 Header、Footer、导航、返回路径、1400px 对齐、Hero、卡片、表单、桌面/移动端布局、多语言与 UI 验收规则。


这是首批12个通信与网络工程工具的生产发布包，在V1.7.4在线可用性巡检基础上增加Lighthouse生产性能监控。

## 当前状态

- 正式工具：12个
- 正式语言：英文、简体中文
- Sitemap正式网址：36个
- 默认正式域名：`https://netengineerlab.com`
- GA4：默认关闭
- AdSense：默认关闭
- Cloudflare Pages输出目录：`website`

## V1.7.5新增

- 在生产在线巡检成功后自动运行Lighthouse CI
- 每天08:45（北京时间）独立检查正式站性能
- 4个代表页面各运行3次并采用中位代表结果
- Performance、Accessibility、Best Practices和SEO门禁
- FCP、LCP、CLS、TBT和Speed Index预算
- JavaScript、CSS、图片和总传输量预算
- 浏览器控制台错误检查
- GitHub步骤摘要、结构化报告及原始HTML/JSON报告
- 正常、性能回退及缺失审计自动测试

## V1.7.4基础能力

- GitHub推送后等待Cloudflare Pages新部署生效
- 使用本地内容哈希识别线上是否仍为旧版本
- 每天08:15（北京时间）自动巡检正式网站
- 主域名和`www`域名可用性检查
- 36个Sitemap网址在线状态与Canonical检查
- 12个工具、分类数量及24个中英文工具页面检查
- 工具目录脚本加载顺序检查
- 版本化JavaScript和CSS文件内容一致性检查
- 12个Service Worker内容及缓存响应头检查
- GitHub Actions检查摘要、失败状态和报告下载

## V1.7.3基础能力

- 本地生产环境HTTP验收
- 36个正式网址逐一访问检查
- 8条旧地址301跳转检查
- 中英文404状态与`noindex`检查
- 7个计算引擎自动测试
- 全站本地链接、锚点和重复ID检查
- 安全响应头与缓存规则模拟检查
- Service Worker强制重新验证
- Node.js 22.16.0版本锁定
- GitHub Actions生产质量门禁
- 正式上线后的远程验收命令
- 发布文件SHA-256清单
- `security.txt`
- Git仓库清理规则

## 安装位置

将本压缩包解压到：

```text
D:\NetEngineerLab\
```

正确结构：

```text
D:\NetEngineerLab\website\index.html
D:\NetEngineerLab\scripts\
D:\NetEngineerLab\docs\
D:\NetEngineerLab\package.json
D:\NetEngineerLab\.github\workflows\production-quality-gate.yml
D:\NetEngineerLab\.github\workflows\production-online-monitor.yml
D:\NetEngineerLab\.github\workflows\production-performance-monitor.yml
```

不要解压成：

```text
D:\NetEngineerLab\website\website\index.html
```

## 本地正式验收

在CMD或PowerShell运行：

```text
cd /d D:\NetEngineerLab
npm run prepare:launch
npm run preview
```

浏览器访问：

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/zh/
http://127.0.0.1:4173/tools/
http://127.0.0.1:4173/tools/zh/
```

## Cloudflare Pages配置

```text
Production branch: main
Framework preset: None
Build command: npm run prepare:launch
Build output directory: website
Root directory: /
Node.js: 22.16.0（已由.node-version锁定）
```

## 正式上线后远程验收

```text
npm run accept:remote -- --base=https://netengineerlab.com
```

验收结果生成在：

```text
docs/REMOTE_ACCEPTANCE_REPORT.json
```

## 生产环境自动巡检

手动运行一次完整在线检查：

```text
npm run check:online -- --base=https://netengineerlab.com
```

等待Cloudflare新部署生效并自动重试：

```text
npm run check:online -- --attempts=24 --interval-ms=15000
```

巡检结果生成在：

```text
docs/PRODUCTION_ONLINE_REPORT.json
```

## 生产性能自动巡检

本地检查性能策略（无需Chrome）：

```text
npm run test:performance-monitor
```

GitHub Actions会在生产在线巡检成功后运行完整Lighthouse，并生成：

```text
docs/PRODUCTION_PERFORMANCE_REPORT.json
artifacts/lighthouse/
```

## 重要文档和报告

- `docs/DEVELOPMENT_LOG.md`（已开发总账与下一步队列）
- `docs/LAUNCH_AUDIT_REPORT.json`
- `docs/PRODUCTION_ACCEPTANCE_REPORT.json`
- `docs/RELEASE_MANIFEST.json`
- `docs/PRODUCTION_ONLINE_REPORT.json`
- `docs/PRODUCTION_PERFORMANCE_REPORT.json`
- `docs/V1.7.5_CHANGELOG.md`
- `docs/PRODUCTION_PERFORMANCE_MONITORING_GUIDE.md`
- `docs/V1.7.4_CHANGELOG.md`
- `docs/PRODUCTION_ONLINE_MONITORING_GUIDE.md`
- `docs/V1.7.3_FULL_AUDIT.md`
- `docs/PRODUCTION_ACCEPTANCE_GUIDE.md`
- `docs/CLOUDFLARE_PAGES_DEPLOYMENT.md`

上线前保持AdSense关闭。GA4真实编号配置完成后，再运行一次`npm run prepare:launch`。
### UI Design System release gate

Before shipping any new or materially refactored public page, read `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md` and run:

```bash
npm run build:i18n
npm run audit:ui
```

`audit:ui` is also part of `prepare:launch`. Tool pages must keep the shared Header/Footer, 1400px page grid, localized Back-to-Tools breadcrumb, responsive mobile shell and final `tool-layout.css` compliance layer.


## Mandatory Tool Detail UI template

Before creating or refactoring any Tool Detail page, read `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md` and `docs/NETENGINEERLAB_UI_V1.2_TOOL_PAGE_TEMPLATE_UNIFICATION_AUDIT_2026-09-12.md`. All Tool Detail pages must pass `npm run audit:ui-v1.2`.


## UI V1.3 强制基线

Tool Detail 开发前必须读取 `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.3.md`。视觉以 Network Change Planner & MOP Generator 为参考；发布前必须运行 `npm run audit:ui-v1.3` 与 `npm run audit2:ui-v1.3`。


## UI Baseline — V1.3.1 Source Convergence (2026-09-12)

Tool Detail UI development must read `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.3.md` before changing or adding pages. V1.3.1 makes source convergence release-blocking: every Tool Detail Hero has tags, ordinary calculators use one canonical input/result DOM, tool-local CSS cannot redefine platform shell/card classes, and the retired V1.9.9-03 tool-shell runtime is removed. Run `npm run audit:ui-v1.3.1` and `npm run audit3:ui-v1.3.1` before release.

## UI Audit4 Final Source Gate — V1.3.1 (2026-09-12)

Tool Detail 页面发布前除 V1.3 / V1.3.1 门禁外，还必须运行 `npm run audit4:ui-v1.3.1`。Audit4 是最终源代码级阻断门禁：Header/Footer/Breadcrumb/Hero/H1/Header CTA 必须唯一；Hero 必须直接采用 MOP 基准结构，不允许额外 wrapper；Hero 标签只允许 `hero-tags > span`；工具本地 CSS 禁止重新定义平台级 Header/Footer/Breadcrumb/Hero/Main/Card/CTA；普通计算器必须使用统一 Input → Result 直接双栏 DOM；复杂工具必须显式标记 `nel-tool-specialized`。该门禁已加入 `prepare:launch`。

## UI V1.3.1 Audit6 final production baseline (2026-09-12)

The 6th independent audit is the final freeze gate for the UI V1.3.1 production baseline. It adds repository/package completeness checks on top of the UI, multilingual, SEO and engine gates. The final package must include Git/GitHub/Node baseline files (including dotfiles), pass `npm run audit6:ui-v1.3.1`, and still pass Launch Audit after a clean rebuild and after re-extraction from the delivered ZIP.

## UI V1.3.1 Audit8 final gate

The production baseline now includes `npm run audit8:ui-v1.3.1`. This gate independently verifies all 80 Tool Detail pages against the MOP visual baseline, requires exactly four concise Hero tags, rejects legacy CTA/template markers, checks local href/src integrity across all public pages, detects duplicate IDs, and blocks visible Spanish UI leakage on the Spanish home and 404 pages. It is part of `prepare:launch`.


## UI V1.3.1 Audit9 full-source / accessibility / HTML validity gate

Audit9 extends the production baseline beyond visual convergence. It blocks tool-local ownership of shared body/eyebrow/main geometry, requires one canonical `tool-layout.css` baseline, requires accessible names for active form controls, rejects malformed HTML void-element closing tags, verifies localized OpenGraph parity and localized language-menu secondary labels, and validates the Service Worker precache fallback without bundled `node_modules`. Before release run:
Production Acceptance is also Page Registry-backed for partial-locale rollout, and Header shell comparison normalizes only the generated language-menu payload so legitimate locale availability differences do not count as UI drift.


```bash
npm run audit9:ui-v1.3.1
npm run test:sw-precache
```

Both commands are part of the production release gate.
