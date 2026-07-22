# 网站统计接入说明

## GA4 位置
Google 官方推荐将完整 Google tag 放在每个页面的 `<head>` 开始位置附近。

本项目为保持开发阶段 Lighthouse 性能，提供延迟加载器。编辑：

`js/site-config.js`

```js
analytics: {
  enabled: true,
  measurementId: "G-XXXXXXXXXX"
}
```

## 已预留事件
- `fiber_calculate`
- `fiber_copy_result`
- `fiber_save_history`
- `fiber_print_report`

## 推荐统计内容
- 页面浏览量、来源、国家/语言；
- 计算器启动率；
- 计算完成次数；
- GPON/EPON预设使用比例；
- PDF导出率；
- 英文版/中文版使用比例。

## 注意
正式启用分析前，应更新隐私政策，并根据目标地区配置 Consent Mode / CMP。
