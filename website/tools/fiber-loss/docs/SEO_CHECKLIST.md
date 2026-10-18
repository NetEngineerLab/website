# SEO 检查清单

本版本已加入：
- 独立 title 与 meta description；
- canonical；
- 中文/英文独立 URL 与 hreflang；
- robots meta；
- Open Graph / Twitter Card；
- WebApplication 与 BreadcrumbList JSON-LD；
- 可见方法说明与 FAQ 内容；
- robots.txt、sitemap.xml、llms.txt 示例；
- 语义化 heading、main、nav、footer；
- 移动端响应式布局。

现行发布方式是仓库根目录的静态站点（`website/`），由 `npm run build` 生成 canonical、hreflang、sitemap 和 JSON-LD。不再使用把 `site-root/` 手工复制到网站根目录的流程。

上线前仍需：
1. 跑 `npm run build`，确认本工具的 en/zh/es 页面都在 `website/sitemap.xml`；
2. 在 Google Search Console 验证域名并提交 sitemap；
3. 使用 Rich Results Test 检查结构化数据；
4. 确认生产 URL、canonical 和 hreflang 均可访问；
5. 将首页、工具中心和相关工具互相内链。
