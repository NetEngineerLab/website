# NetEngineerLab V1.7.5 生产性能自动巡检版

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

## 重要报告

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
