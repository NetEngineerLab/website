# Lighthouse 目标与测试方法

## 目标
在不加载真实 AdSense / GA4 的基础页面上，目标为：
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

PWA：当前 Lighthouse 的 PWA 类别已弃用，但本项目仍提供 manifest、192/512 图标、Service Worker 和离线页，以满足基本可安装性。

## 为什么不能承诺固定 95 分
Lighthouse 分数会随设备、网络、Chrome版本、服务器响应、缓存、广告和分析脚本变化。必须在公开 HTTPS 页面上重复测试。

## Chrome 测试
1. 打开生产页面；
2. F12 → Lighthouse；
3. 选择 Mobile 与 Desktop 分别测试；
4. 使用隐身窗口，关闭扩展；
5. 测试至少 3 次，关注中位数。

## CLI / Lighthouse CI
项目附带 `tests/lighthouse/fiber-loss.lighthouserc.json` 和 `package.json`。安装 Node.js 后运行：

```bash
npm install
npm run audit
```

## 启用广告后
真实 AdSense 会增加第三方网络和 JavaScript 成本。建议把“无广告基准分”和“广告生产分”分别记录。
