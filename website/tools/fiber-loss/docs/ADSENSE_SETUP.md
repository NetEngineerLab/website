# AdSense 接入说明

## 推荐位置
本项目预留两个手动广告位：

1. `afterCalculator`：计算器和结果区之后。用户完成主要任务后再看到广告，不干扰输入和计算按钮。
2. `afterMethodology`：计算方法、FAQ之后，页脚之前。

不建议把广告放在：
- “计算链路”“复制结果”“导出 PDF”等按钮旁边；
- 输入框与计算结果卡片内部；
- 顶部导航、语言切换或下载链接附近；
- 首屏占据主要内容的位置。

广告位必须清楚标注为“广告”或“Advertisement”，不得伪装成工具卡片、推荐结果或导航。

## 启用步骤
编辑 `js/site-config.js`：

```js
adsense: {
  enabled: true,
  client: "ca-pub-你的发布商ID",
  slots: {
    afterCalculator: "你的广告单元ID",
    afterMethodology: "你的广告单元ID"
  }
}
```

将 `site-root/ads.txt.example` 改名为 `ads.txt`，替换发布商ID后复制到网站根目录。

## 隐私与同意
如果向 EEA、英国或瑞士用户展示个性化广告，需要使用 Google 认证、集成 IAB TCF 的 CMP。可在 AdSense 的“隐私权和消息”中配置 Google CMP。

## 性能
启用真实 AdSense 后会增加第三方请求，Lighthouse Performance 分数可能下降。应分别测试：
- 广告关闭的基础页面；
- 广告开启的生产页面。
