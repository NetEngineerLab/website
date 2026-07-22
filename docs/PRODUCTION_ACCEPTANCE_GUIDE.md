# NetEngineerLab V1.7.3 正式上线验收指南

## 一、本地验收

打开CMD或PowerShell：

```text
cd /d D:\NetEngineerLab
npm run prepare:launch
```

该命令依次执行：

```text
生成网站配置
多语言构建
多语言验证
上线静态审核
生产HTTP模拟验收
7个计算引擎测试
发布文件哈希清单
```

最终必须显示：

```text
status: PASS
```

主要报告：

```text
docs/LAUNCH_AUDIT_REPORT.json
docs/PRODUCTION_ACCEPTANCE_REPORT.json
docs/RELEASE_MANIFEST.json
```

## 二、本地人工查看

运行：

```text
npm run preview
```

检查：

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/zh/
http://127.0.0.1:4173/tools/
http://127.0.0.1:4173/tools/zh/
http://127.0.0.1:4173/tools/ipv6-nat-planner/zh/
http://127.0.0.1:4173/tools/wifi-coverage-capacity-planner/zh/
```

人工重点：

- 首页中英文显示。
- 工具分类按钮。
- 12个工具入口。
- 语言切换。
- 手机端布局。
- 计算、复制、CSV和打印。
- Wi-Fi顶部字段对齐。

## 三、上传GitHub前

确认根目录是：

```text
D:\NetEngineerLab
```

确认不要上传：

```text
website_backup\
*.zip
.vscode\
node_modules\
```

这些内容已写入`.gitignore`。

## 四、Cloudflare构建验收

配置：

```text
Production branch: main
Framework preset: None
Build command: npm run prepare:launch
Build output directory: website
Root directory: /
```

Cloudflare构建日志必须依次通过：

```text
validate:i18n: PASS
audit:launch: PASS
accept:production: PASS
release:manifest: generated
```

## 五、正式域名验收

正式部署完成后，在本地项目根目录运行：

```text
npm run accept:remote -- --base=https://netengineerlab.com
```

必须检查：

- HTTPS首页返回200。
- 36个Sitemap页面全部返回200。
- 8条旧地址返回301或308。
- 不存在地址返回404。
- 404页面包含`noindex,follow`。
- 安全响应头存在。
- Service Worker不被长期缓存。
- `security.txt`可访问。

## 六、Google收录验收

- 添加Search Console域名资源。
- 提交`sitemap.xml`。
- 检查英文首页、中文首页、IPv6工具、Wi-Fi工具。
- 新页面较多时优先提交Sitemap，不需要逐个请求收录。
- 上线后持续查看网页索引、HTTPS、Core Web Vitals和结构化数据报告。

## 七、广告和统计

初次上线：

```text
GA4：可暂时关闭
AdSense：保持关闭
```

配置真实GA4编号后：

```text
npm run prepare:launch
```

确认网站稳定、有原创内容和正常收录后，再考虑AdSense。
