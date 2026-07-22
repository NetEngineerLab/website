# Cloudflare Pages部署——NetEngineerLab V1.7.3

## 一、推荐项目设置

```text
Production branch: main
Framework preset: None
Build command: npm run prepare:launch
Build output directory: website
Root directory: /
```

项目根目录已包含：

```text
.node-version = 22.16.0
```

建议使用Cloudflare Pages V3构建系统。V1.7.3不依赖第三方npm包。

## 二、连接GitHub

仓库：

```text
NetEngineerLab/website
```

使用Git集成后，每次推送到生产分支都会自动构建。正式创建项目前应确定使用Git集成还是Direct Upload，因为Git集成项目不能直接切换成Direct Upload项目。

## 三、正式域名

正式域名：

```text
netengineerlab.com
```

在Cloudflare：

```text
Workers & Pages
→ 选择项目
→ Custom domains
→ Set up a domain
```

顶级域名使用Cloudflare Pages时，需要域名位于同一Cloudflare账户并使用Cloudflare名称服务器。

## 四、www跳转

建议通过Cloudflare Bulk Redirects或Redirect Rules将：

```text
www.netengineerlab.com
```

301跳转到：

```text
https://netengineerlab.com
```

不要在`_redirects`中做跨域名跳转。

## 五、pages.dev处理

`website/_headers`已经为以下地址增加：

```text
X-Robots-Tag: noindex
```

范围：

```text
项目.pages.dev
分支.项目.pages.dev
```

正式域名启用后，还可以在Cloudflare Bulk Redirects中将生产`pages.dev`地址301跳转到正式域名，并保留路径和查询参数。

## 六、部署后检查

```text
https://netengineerlab.com/
https://netengineerlab.com/zh/
https://netengineerlab.com/tools/
https://netengineerlab.com/tools/zh/
https://netengineerlab.com/robots.txt
https://netengineerlab.com/sitemap.xml
https://netengineerlab.com/.well-known/security.txt
```

然后运行：

```text
npm run accept:remote -- --base=https://netengineerlab.com
```

## 七、Cloudflare构建失败时

依次检查：

- Root directory是否为`/`。
- Build command是否为`npm run prepare:launch`。
- Output directory是否为`website`。
- Node版本是否读取`.node-version`。
- GitHub仓库是否包含`scripts`、`package.json`和`website`。
- 构建日志中哪个阶段不是PASS。
