# SEO Growth Phase 1 Promotion Plan

目标：把已验证主题的 Google 展示从约 9,000/月扩大到 30,000/月。优先推广 ONU RX Power、PON Splitter Loss、Spanish Optical Power Budget、UPS Runtime。

## 内容批次
- ONU RX Power：What Is a Good ONU RX Power、-25 dBm 判断、GPON/EPON RX Range、OLT TX 与 ONU RX、低光功率排障。
- PON Splitter Loss：1:2、1:4、1:8、1:16、1:32、1:64 分光损耗参考。
- Spanish Optical Power Budget：预算计算、PLC 1:8 损耗、ONU RX 合理范围、OLT 到 ONU 预算与余量。
- UPS Runtime：公式、25/50/75% 负载、老化电池、VA 与 W。

## 发布与站内推广
每周发布 2 篇英文和 1 篇西语文章，连续 4 周。每篇文章在首段附近链接对应计算器，包含一个工程算例，并链接专题 Hub 和两个同主题文章。每个新 URL 同步加入专题 Hub、首页 Guide 区和 sitemap/page registry。

## 外部分发
每篇文章发布后，将算例和 canonical URL 分享到一次 GitHub README Discussion 与一次 LinkedIn 工程帖；部署后在 Google Search Console 请求编入索引。记录 7 天和 28 天的展示、点击、CTR、平均排名。

## 验收
新页面必须有独立 search intent、canonical、title、description、H1、FAQ schema 和计算器链接。发布前运行 `npm run audit:seo` 与 `npm run test:seo-schema`。低排名工具暂缓扩展，直到一个主题簇达到至少 5 个已索引页面。
