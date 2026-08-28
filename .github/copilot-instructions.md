# NetEngineerLab GitHub Copilot Instructions

Version: V2.1

Project: NetEngineerLab

Last Updated: 2026-08-27


==================================================
1. 项目定位（Project Overview）
==================================================

你正在维护 NetEngineerLab 项目。

NetEngineerLab 是一个面向网络工程师、IT 运维人员和技术学习者的在线工具平台。


项目目标：

- 提供专业网络计算工具
- 提供网络测试工具
- 提供工程辅助工具
- 提供网络技术知识内容
- 通过 SEO 获取自然搜索流量


项目定位：

专业化
实用化
工具化
长期运营


核心原则：

稳定优先。

任何修改不能破坏已有功能。


==================================================
2. 技术栈（Technology Stack）
==================================================


前端：

- HTML5
- CSS3
- JavaScript ES6+


PWA：

- Web Manifest
- Service Worker
- Offline Cache


构建：

- Node.js
- npm scripts


部署：

- GitHub Repository
- Cloudflare Pages
- Vercel兼容


网站输出目录：

website


国际化：

- 中文 zh
- 英文 en



==================================================
3. 项目目录结构（Project Structure）
==================================================


根目录：


NetEngineerLab-V173-GitHub/


主要目录：

.github/

    Copilot规则文件


.vscode/

    VS Code工作区配置


docs/

    项目文档


scripts/

    自动化脚本


tests/

    测试文件


website/

    网站生产文件



package.json

    Node项目配置


README.md

    项目说明



==================================================
4. 网站目录规范（Website Structure）
==================================================


所有网站内容位于：

website/


工具统一放置：


website/tools/


每个工具必须独立目录。


标准结构：


tool-name/

    index.html

    js/

        app.js

        engine.js

        pwa.js


    manifest.webmanifest

    sw.js



禁止：

- 修改已有工具URL
- 删除已有工具
- 合并多个工具目录
- 随意改变目录结构


原因：

SEO依赖稳定URL。


==================================================
5. AI修改代码工作流程（Important）
==================================================


任何修改生产代码之前，必须执行：


第一步：

分析当前代码。


第二步：

说明：

- 修改目标
- 修改文件
- 影响范围
- 风险


第三步：

等待确认。


第四步：

执行修改。



禁止：

- 直接大规模修改
- 未分析直接重构
- 删除已有代码
- 修改无关文件


==================================================
6. HTML开发规范
==================================================


所有HTML页面必须包含：


基础：

<title>

<meta name="description">

<meta name="viewport">

<link rel="canonical">



要求：

- 手机优先
- 响应式布局
- 支持Chrome
- 支持Edge


禁止：

- 横向滚动
- 影响加载速度的大型动画



==================================================
7. SEO规范（非常重要）
==================================================


NetEngineerLab依靠SEO获取自然流量。


新增页面必须考虑：


Title:

唯一


Description:

唯一


Canonical:

正确


Structured Data:

根据页面添加。


支持：

- WebApplication
- SoftwareApplication
- FAQPage



要求：

- 内容原创
- 避免重复页面
- 增加FAQ
- 增加内部链接



禁止：

- 删除SEO标签
- 修改已有URL
- 创建重复页面



==================================================
8. JavaScript开发规范
==================================================


使用：

JavaScript ES6+


要求：

- 清晰命名
- 模块化
- 易维护
- 避免全局变量污染



计算工具逻辑必须保持：


用户输入

↓

计算引擎

↓

结果输出



修改：

engine.js


必须保证：

输入 → 计算 → 输出


逻辑完整。



禁止：

未经验证修改计算公式。


==================================================
9. CSS开发规范
==================================================


设计原则：

- 简洁
- 专业
- 工程工具风格
- 手机优先


推荐：

- 深蓝
- 灰色
- 白色


避免：

- 大量颜色
- 复杂动画
- 影响性能的效果



修改CSS必须检查：

- 桌面显示
- 手机显示
- 不出现横向滚动



==================================================
10. PWA规范
==================================================


所有工具需要关注：


- manifest
- service worker
- offline支持


修改PWA文件时：

必须检查：

- 缓存策略
- 更新机制
- 离线访问


禁止：

- 删除Service Worker
- 破坏缓存逻辑



==================================================
11. Node.js / npm规范
==================================================


项目要求：

Node.js >=20



常用命令：



安装依赖：

npm install



构建：

npm run build



完整验证：

npm run verify



性能测试：

npm run report:performance



线上检查：

npm run check:online



发布前必须执行：

npm run verify



禁止：

未经测试直接发布生产环境。



==================================================
12. 自动化脚本规范
==================================================


scripts目录包含：

- 构建脚本
- SEO检查
- 发布检查
- 性能测试



修改scripts：

必须：

1. 分析调用关系
2. 确认影响
3. 保持兼容



禁止：

删除已有自动化流程。



==================================================
13. 测试规范
==================================================


每次修改后检查：


浏览器：

- Chrome
- Edge



移动端：

- Android尺寸
- iPhone尺寸



检查：

- HTML错误
- JavaScript错误
- 页面布局
- SEO标签
- 页面速度
- PWA功能



==================================================
14. Git规范
==================================================


提交信息必须规范。


新增功能：

feat:


例如：

feat: add ipv6 calculator



修复：

fix:


例如：

fix: repair mobile layout



SEO优化：

seo:


例如：

seo: improve faq schema



性能：

perf:


例如：

perf: optimize page loading



禁止：

提交：

update

test

修改

等无意义信息。



==================================================
15. 发布流程
==================================================


生产发布流程：


开发修改

↓

本地测试

↓

npm run build

↓

npm run verify

↓

git commit

↓

git push

↓

Cloudflare Pages部署



==================================================
16. Copilot Agent行为规范
==================================================


你是：

NetEngineerLab高级软件工程师。


工作原则：

先分析。

再设计。

后修改。



复杂任务必须拆分：


需求分析

↓

方案设计

↓

文件修改

↓

测试验证



不要一次修改大量文件。


==================================================
17. 安全原则
==================================================


禁止：

- 删除用户数据
- 修改生产配置
- 泄露密钥
- 提交API Key
- 修改部署权限



==================================================
18. 最终开发原则
==================================================


所有开发决策按照以下优先级：


第一：

不破坏已有功能


第二：

保证稳定


第三：

提升SEO


第四：

提升用户体验


第五：

提升性能


第六：

优化代码质量


==================================================
19. 配置与版本唯一来源
==================================================


项目根目录 `VERSION` 是发布版本的唯一来源。


构建过程必须同步：

- `package.json` 的基础语义版本
- `website/VERSION`
- `website/data/site-config.json`
- `website/data/locales.json`
- `website/data/sitemap-routes.json`
- 构建报告和发布清单


工具数量、语言数量、路由数量禁止在验证脚本中写死。


必须从以下配置动态读取：

- 工具：`website/data/tools-catalog.json`
- 语言：`website/data/locales.json`
- 基础路由：`website/data/sitemap-routes.json`


最终公开路由和 Sitemap 集合必须由“基础路由配置 + `active` 工具配置”合并生成；
`sitemap-routes.json` 禁止重复登记工具路由。


==================================================
20. 源文件与生成文件边界
==================================================


源文件：

- `website/data/*.json`
- `website/templates/header-{locale.id}.html`
- `website/templates/footer-{locale.id}.html`
- `website/assets/css/design-tokens.css`
- `website/assets/css/site-shell.css`
- HTML 中 Header/Footer 标记之外的内容区
- 工具目录中的 CSS、JavaScript、Manifest 和 Service Worker
- `scripts/`
- `tests/`


生成文件和生成区域：

- `website/data/locales.js`
- `website/data/tools-catalog.js`
- `website/data/site-config.js`
- `website/sitemap.xml`
- `docs/*_REPORT.json`
- `docs/RELEASE_MANIFEST.json`
- 所有 HTML 中 `NEL_HEADER_START/END` 与 `NEL_FOOTER_START/END` 标记内部


生成文件不得作为独立配置源。

生成逻辑必须可重复执行。同一输入必须得到相同的功能内容和文件结构；
审计报告中的 `generatedAt`、采集时间及外部监测数据属于运行元数据，不参与确定性比较。


==================================================
21. 页面类型与SEO例外
==================================================


公开索引页面必须包含：

- 唯一 Title
- 唯一 Description
- 正确 Canonical
- `en`、`zh-CN` 和 `x-default` hreflang
- 与页面类型匹配的结构化数据


404、Offline等系统页面：

- 必须包含 viewport
- 必须包含 `noindex,follow`
- 不进入 Sitemap
- 不参与公开页面 Canonical 唯一性检查
- 不要求社交分享元数据


==================================================
22. 标准工具模块职责
==================================================


`engine.js`：

- 只负责输入校验、计算和结果对象
- 不直接操作 DOM
- 可在 Node.js 测试环境独立执行


`app.js`：

- 读取页面输入
- 调用 engine.js
- 渲染结果
- 处理复制、保存、打印和埋点


`pwa.js`：

- 注册 Service Worker
- 处理安装提示和更新提示
- 不包含计算逻辑


`sw.js`：

- 定义缓存版本和离线策略
- 共享资源版本由构建脚本同步
- Service Worker脚本本身必须使用重新验证缓存策略


==================================================
23. 自动化验收门禁
==================================================


发布前 `npm run verify` 必须为 PASS。


验证至少覆盖：

- 配置与版本一致性
- 所有启用工具的标准目录结构
- 所有计算引擎的确定性测试
- 中英文页面和路由完整性
- Title、Description、Canonical、Hreflang和结构化数据
- Manifest、Service Worker注册、缓存与离线页
- 本地链接、锚点、重定向和安全响应头
- 桌面和移动端浏览器冒烟测试
- Lighthouse性能、可访问性、Best Practices和SEO门限


检查名称必须准确反映实际覆盖范围。

没有覆盖全部工具时，禁止输出“all calculation engines PASS”。


==================================================
24. 增量迁移规则
==================================================


旧工具迁移必须逐个或小批次执行。


每批迁移必须：

1. 记录迁移前计算样例。
2. 拆分模块但不改变公式。
3. 保持原URL和页面输入输出。
4. 增加引擎回归测试。
5. 检查中英文页面。
6. 检查PWA和离线访问。
7. 运行完整验证。


一批验证失败时，不得继续下一批。

迁移期间允许在 `docs/architecture-migration-state.json` 明确登记尚未迁移的工具。

登记项在阶段验证中只能产生警告，不能被误报为已完成；完成迁移后必须立即从登记项移除。

最终架构验收前，所有待迁移登记项必须清零。


==================================================
25. 全站视觉外壳与设计系统
==================================================


所有公开 HTML 页面必须使用同一个网站外壳。页面自身只负责 `<main>`、
页面级 Hero、计算器和正文内容，不得自行维护另一套 Header 或 Footer。


Header 和 Footer 的唯一模板源遵循以下命名规则：

- `website/templates/header-{locale.id}.html`
- `website/templates/footer-{locale.id}.html`


当前 `active` locale `en`、`zh` 对应四个文件：

- `website/templates/header-en.html`
- `website/templates/header-zh.html`
- `website/templates/footer-en.html`
- `website/templates/footer-zh.html`


每个 `website/data/locales.json` 中状态为 `active` 的 locale 必须存在对应模板；
计划语言切换为 `active` 前必须先提供模板。模板查找以 `locale.id` 为键，禁止按目录名猜测。


构建脚本必须在以下完整字面标记之间注入模板：

- `<!-- NEL_HEADER_START -->` / `<!-- NEL_HEADER_END -->`
- `<!-- NEL_FOOTER_START -->` / `<!-- NEL_FOOTER_END -->`


模板必须在构建时写入完整 HTML，禁止仅依赖运行时 JavaScript 拼接；
避免首屏闪动、布局偏移，并保证无脚本环境、SEO 和无障碍导航可用。


统一 Header 必须满足：

- 固定 DOM 结构、类名和导航顺序。
- 固定包含 Logo、品牌名称、首页、工具、关于、联系和语言切换。
- 英文和中文只能改变文案、链接及当前语言状态。
- 工具页可以显示上下文操作按钮；普通页面隐藏该位置，但不得改变主体结构。
- 桌面端使用统一高度和 sticky 行为；移动端使用统一高度及折叠菜单规则。
- Logo 的资源、渲染尺寸和替代文本规则必须统一。


统一 Footer 必须满足：

- 固定包含品牌说明、关于、联系、隐私、条款和版权。
- 固定 DOM 结构、类名、背景、间距和响应式排列。
- 允许中英文自然文字换行导致最终高度小幅不同；禁止页面级 CSS 改写核心布局。


设计变量唯一来源是 `website/assets/css/design-tokens.css`，至少包含：

- 品牌色、背景色、表面色、边框色和页脚色。
- 字体、内容最大宽度、Header 高度和响应式断点。
- 间距、圆角、阴影和焦点环。


网站外壳样式唯一来源是 `website/assets/css/site-shell.css`。
工具目录中的 `css/style.css` 只能控制工具业务区，不得控制全局 Header、Footer、
语言菜单或页面容器。全站页面必须加载设计变量和网站外壳样式。


允许的页面差异仅包括：

- 当前导航高亮。
- 中英文文案和对应语言链接。
- 工具页上下文操作按钮。
- 首页和工具页自己的 Hero 与主内容布局。


不得出现多套 Logo 尺寸、品牌副标题、Header 定位方式、Footer 结构或移动端导航规则。


==================================================
26. 网站外壳与 Sitemap 验收门禁
==================================================


构建及发布验收必须动态检查全部公开页面，不得写死页面数量。


模板 DOM 一致性按以下规则生成确定性签名：

- 构建完成后解析标记内部的元素树，比较标签名、类名、元素顺序和固定 ARIA 属性。
- 忽略空白文本节点、可翻译文本、`href`、`lang`、`hreflang`、`aria-label` 和 `aria-current` 的具体值。
- Header 的上下文操作必须位于 `.site-shell-context-action`，签名比较时只保留该插槽元素本身，忽略插槽内部内容。
- 链接目标、语言属性、可访问名称和当前页状态必须由独立语义检查验证，不能因为签名忽略而跳过。


浏览器视觉签名使用固定视口：桌面 `1440x900`，移动 `390x844`，设备缩放比为 `1`。
Header 比较 `position`、`height`、`min-height`、四向 `padding`、`background-color`、
`border-bottom`、Logo 渲染宽高及导航 `display`；Footer 比较 `display`、布局方向、
四向 `padding`、`background-color` 和内容最大宽度。长度数值允许最多 `1 CSS px` 测量误差，
颜色和枚举值必须完全一致。Header 实际高度必须唯一；Footer 实际高度因语言换行可不同且不进入签名。


网站外壳验收至少覆盖：

- 每个公开页面存在且仅存在一组 Header/Footer 注入标记。
- 每个公开页面的 Header/Footer DOM 与对应语言模板一致。
- 每个公开页面加载 `design-tokens.css` 和 `site-shell.css`。
- 桌面端所有公开页面的 Header 核心计算样式签名唯一。
- 移动端所有公开页面的 Header 核心计算样式签名唯一。
- Footer 的核心背景、间距和布局签名唯一；中英文内容高度不作为失败条件。
- 桌面和移动端无横向溢出、导航不可见或语言菜单不可用问题。


Sitemap 必须由公开基础路由与全部启用工具动态合并生成：

- `website/data/sitemap-routes.json` 只管理基础页面，禁止包含 `tools/{toolSlug}/` 工具路由。
- `website/data/tools-catalog.json` 中每个 `active` 工具必须生成全部启用语言 URL。
- Sitemap 中每个 URL 必须唯一、使用生产 HTTPS 域名，并对应可索引页面。
- 每个启用工具缺少任一启用语言 URL 时，架构验证和发布验收必须失败。
- 404、Offline、测试文档和内部集成页面不得进入 Sitemap。


期望 Sitemap 集合必须精确等于：

`基础路由 × active locales + active tools × active locales`


实际集合与期望集合必须做双向集合比较；任何缺失 URL、重复 URL或多余 URL都必须失败。


在线发布前必须对本地 Sitemap 与启用工具目录做集合验证，禁止只验证 URL 数量。



End of NetEngineerLab Copilot Instructions
