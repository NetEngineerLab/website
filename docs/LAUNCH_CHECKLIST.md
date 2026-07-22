# NetEngineerLab V1.7.3 上线清单

## 本地自动验收

- [ ] `npm run prepare:launch`执行成功。
- [ ] 多语言验证为PASS。
- [ ] 上线审核为PASS。
- [ ] 生产验收为PASS。
- [ ] 7个计算引擎全部PASS。
- [ ] 36个正式页面全部通过本地HTTP检查。
- [ ] 8条旧地址301检查通过。
- [ ] 中英文404检查通过。

## 本地人工验收

- [ ] 英文首页。
- [ ] 中文首页。
- [ ] 英文工具中心。
- [ ] 中文工具中心。
- [ ] 六个分类筛选。
- [ ] 12个工具均可打开。
- [ ] 语言切换正常。
- [ ] Wi-Fi顶部配置区对齐。
- [ ] 手机端无横向溢出。
- [ ] 复制、CSV和打印功能正常。

## GitHub

- [ ] 未上传`website_backup`。
- [ ] 未上传ZIP文件。
- [ ] 提交到`main`。
- [ ] `Production Quality Gate`为绿色。

## Cloudflare Pages

- [ ] GitHub仓库连接正确。
- [ ] 生产分支为`main`。
- [ ] 构建命令为`npm run prepare:launch`。
- [ ] 输出目录为`website`。
- [ ] Node.js读取22.16.0。
- [ ] 自定义域名激活。
- [ ] HTTPS证书正常。
- [ ] `www`跳转到主域名。
- [ ] `pages.dev`禁止索引或跳转到主域名。

## 正式域名

- [ ] `npm run accept:remote -- --base=https://netengineerlab.com`为PASS。
- [ ] 36个Sitemap页面返回200。
- [ ] 旧`.html`地址返回301或308。
- [ ] 不存在地址返回404。
- [ ] `robots.txt`可访问。
- [ ] `sitemap.xml`可访问。
- [ ] `security.txt`可访问。

## Google

- [ ] 添加Search Console域名资源。
- [ ] 提交`https://netengineerlab.com/sitemap.xml`。
- [ ] 检查英文首页。
- [ ] 检查中文首页。
- [ ] 检查IPv6与NAT工具。
- [ ] 检查Wi-Fi覆盖与容量工具。

## 数据和广告

- [ ] GA4真实编号已确认，或继续关闭。
- [ ] AdSense保持关闭。
- [ ] 网站稳定和正常收录后再申请AdSense。
