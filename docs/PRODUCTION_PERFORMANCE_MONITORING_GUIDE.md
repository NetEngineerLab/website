# NetEngineerLab V1.7.5 生产性能巡检指南

## 目标

V1.7.5在V1.7.4在线可用性巡检之后运行Lighthouse CI，持续检查正式网站的速度、可访问性、最佳实践、SEO、关键加载指标和资源体积。它不修改12个工具的计算公式。

## 代表页面

每个页面运行3次，使用Lighthouse中位代表结果降低网络和CPU波动：

1. `https://netengineerlab.com/`
2. `https://netengineerlab.com/zh/`
3. `https://netengineerlab.com/tools/`
4. `https://netengineerlab.com/tools/wifi-coverage-capacity-planner/zh/`

这4个页面分别覆盖英文首页、中文首页、工具目录和资源最多的复杂工具页面。

## 初始生产预算

- Performance：至少75分。
- Accessibility：至少90分。
- Best Practices：至少90分。
- SEO：至少90分。
- FCP：不超过3000毫秒。
- LCP：不超过4000毫秒。
- CLS：不超过0.1。
- TBT：不超过600毫秒。
- Speed Index：不超过5000毫秒。
- 页面总传输量：不超过500 KiB。
- JavaScript：不超过250 KiB。
- CSS：不超过128 KiB。
- 图片：不超过256 KiB。
- 控制台错误：0。

初始阈值用于防止明显回退。收集稳定基线后可以在后续版本逐步收紧，不应根据单次最高分立即提高门槛。

## 自动运行时机

- 每次`main`推送触发的`Production Online Monitor`成功后自动运行，确保Cloudflare已经完整部署当前提交。
- 每天北京时间08:45独立运行。
- GitHub Actions页面手动运行。

## 文件

- 工作流：`.github/workflows/production-performance-monitor.yml`
- Lighthouse配置：`tests/lighthouse/production.lighthouserc.json`
- 汇总脚本：`scripts/production-performance-report.js`
- 策略测试：`scripts/production-performance-test.js`
- 机器报告：`docs/PRODUCTION_PERFORMANCE_REPORT.json`
- 原始报告：`artifacts/lighthouse/`

机器报告和原始报告由GitHub Actions上传为`netengineerlab-production-performance-report`构件，不提交到Git仓库。

## 本地策略验收

不需要安装Chrome：

```text
npm run test:performance-monitor
```

此测试验证正式配置、正常样本、性能回退样本和缺失审计样本。

## 本地运行完整Lighthouse

需要Node.js 22及Chrome：

```text
npm install --global @lhci/cli@0.15.1
lhci collect --config=tests/lighthouse/production.lighthouserc.json
lhci upload --config=tests/lighthouse/production.lighthouserc.json
npm run report:performance
lhci assert --config=tests/lighthouse/production.lighthouserc.json
```

## 成功标准

- 4个代表页面均有3次有效结果。
- 所有硬预算通过。
- `errors`为空。
- `status`为`PASS`。
