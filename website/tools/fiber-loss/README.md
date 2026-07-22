# Fiber Loss Calculator V2.1 — SEO / AdSense / Analytics / Lighthouse Edition

本版本基于 V2.0.1 修正版，加入：

- 中文和英文独立 URL；
- canonical、hreflang、Open Graph、Twitter Card；
- WebApplication / BreadcrumbList JSON-LD；
- FAQ和方法内容；
- AdSense双广告位预留（默认关闭）；
- GA4统计及计算事件预留（默认关闭）；
- PWA manifest、Service Worker、离线页、192/512图标；
- robots.txt、sitemap.xml、ads.txt示例、llms.txt；
- 隐私、条款、关于、联系页面模板；
- 键盘焦点、跳转链接、Reduced Motion等无障碍优化；
- Lighthouse CI配置和审计文档。

## 部署
将本目录内容复制到：

`website/tools/fiber-loss/`

将 `site-root/` 内文件复制到网站根目录 `website/`。

## 广告和统计
默认关闭。先阅读 `docs/ADSENSE_SETUP.md` 和 `docs/ANALYTICS_SETUP.md`，再修改 `js/site-config.js`。
