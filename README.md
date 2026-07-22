# NetEngineerLab V1.7.3 正式上线验收版

这是首批12个通信与网络工程工具的生产发布包，基于V1.7.2显示修正版升级。

## 当前状态

- 正式工具：12个
- 正式语言：英文、简体中文
- Sitemap正式网址：36个
- 默认正式域名：`https://netengineerlab.com`
- GA4：默认关闭
- AdSense：默认关闭
- Cloudflare Pages输出目录：`website`

## V1.7.3新增

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

## 重要报告

- `docs/LAUNCH_AUDIT_REPORT.json`
- `docs/PRODUCTION_ACCEPTANCE_REPORT.json`
- `docs/RELEASE_MANIFEST.json`
- `docs/V1.7.3_FULL_AUDIT.md`
- `docs/PRODUCTION_ACCEPTANCE_GUIDE.md`
- `docs/CLOUDFLARE_PAGES_DEPLOYMENT.md`

上线前保持AdSense关闭。GA4真实编号配置完成后，再运行一次`npm run prepare:launch`。
