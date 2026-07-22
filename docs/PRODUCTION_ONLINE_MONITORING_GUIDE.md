# NetEngineerLab生产环境自动巡检指南

## 作用

本系统检查“GitHub代码、Cloudflare Pages部署结果、正式域名实际内容”是否一致。它补充本地`prepare:launch`验收，主要发现以下问题：

- Cloudflare仍在提供上一个Git提交。
- HTML已经更新，但JavaScript或CSS仍为旧文件。
- 工具目录脚本加载顺序错误。
- 工具目录数量、分类数量或工具网址异常。
- Sitemap网址、301跳转、404或安全响应头异常。
- Service Worker仍在使用旧缓存文件。

## 自动运行

工作流文件：

```text
.github/workflows/production-online-monitor.yml
```

运行时机：

1. 推送到`main`分支后。
2. 每天北京时间08:15。
3. 在GitHub Actions页面手动运行。

## 部署等待机制

推送后，GitHub和Cloudflare可能不是同时完成。巡检程序会先比较正式网站资源参数与当前Git提交的内容哈希：

```text
site.js?v=当前文件SHA-256前12位
```

如果正式网站仍是旧哈希，程序每15秒重新检查一次，最多检查24次。每次就绪检查会使用独立探测参数，并核对36个Sitemap页面、8个共享资源和12个Service Worker；全部属于当前Git提交并具有正确的重新验证响应头后，才复用同一批响应执行完整巡检。这可以避免Cloudflare分节点传播期间出现新旧文件混合导致的误报。

## 检查内容

- `https://netengineerlab.com`和`https://www.netengineerlab.com`。
- 36个Sitemap网址。
- 8条旧`.html`网址301跳转。
- 中英文404状态与`noindex`。
- 12个工具及6个分类数量。
- 24个中英文工具页面的表单控件。
- 共享JavaScript和CSS的内容哈希。
- 4个首页/工具目录的脚本加载顺序。
- 12个Service Worker文件及重新验证响应头。
- `robots.txt`、`sitemap.xml`和`security.txt`。
- 基本安全响应头。

## 本地执行

先启动预览：

```text
cd /d D:\NetEngineerLab
npm run preview
```

另开一个CMD窗口运行：

```text
cd /d D:\NetEngineerLab
npm run check:online -- --base=http://127.0.0.1:4173
```

## 正式网站手动执行

```text
cd /d D:\NetEngineerLab
npm run check:online -- --base=https://netengineerlab.com
```

需要等待Cloudflare部署时：

```text
npm run check:online -- --attempts=24 --interval-ms=15000
```

## 结果

成功时最后显示：

```text
"errors": [],
"warnings": [],
"status": "PASS"
```

完整报告：

```text
docs/PRODUCTION_ONLINE_REPORT.json
```

GitHub Actions还会上传`netengineerlab-production-online-report`报告文件。

## 常见失败含义

### deployment matches checked-out asset hashes失败

Cloudflare尚未完整部署当前Git提交、部分节点仍在返回旧文件，或构建输出不是当前版本。自动任务会对全站关键文件重试，无需立即清理缓存。

### content-hashed shared asset URLs失败

某个HTML页面引用了未加版本号或版本号过期的共享资源。重新运行`npm run prepare:launch`并提交生成文件。

### tools catalog before site runtime失败

工具目录数据脚本加载顺序异常，可能导致工具中心显示0个工具。

### service workers match and revalidate失败

线上Service Worker不是当前构建文件，或Cloudflare缓存规则没有要求重新验证。

### all Sitemap pages return 200失败

一个或多个正式网址返回非200状态。查看报告中的具体路径后再修复。
