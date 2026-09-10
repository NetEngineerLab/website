# NetEngineerLab 西班牙语首批上线计划

## 目标

在现有 `en + zh` 多语言生成链上增加西班牙语，不复制计算引擎，不改变工具 slug 和工作流关系。

## URL 约定

- 首页：`/es/`
- 工具：`/tools/{tool-slug}/es/`
- 页面语言：`lang="es"`
- SEO：每页生成 `canonical`、`hreflang="es"` 和西语 sitemap URL

## 首批 10 个旗舰工具

1. `fiber-loss`
2. `optical-power-budget`
3. `pon-splitter-loss`
4. `bandwidth-calculator`
5. `subnet-calculator`
6. `vlan-ip-capacity-planner`
7. `poe-power-budget-calculator`
8. `pue-data-center-energy-efficiency`
9. `ups-capacity-battery-runtime-calculator`
10. `wireless-link-budget-calculator`

## 发布门槛

- 工具名称、描述、输入项、结果项、错误提示和 FAQ 完成西语审校。
- `searchIntent`、`primaryTopic`、`longTailQuestions` 有西语版本。
- 计算引擎测试保持与英文、中文相同。
- 页面注册、hreflang、canonical、sitemap、SEO 和工作流审计全部通过。
- 其余工具在完成文案前保持 `es` 不可索引，避免发布西语 URL 配英文正文。

## 数据观察窗口

首批发布后观察 4–8 周：西语 impressions、clicks、国家来源、索引率、长尾查询和工具完成率。达到预设门槛后再扩展到全部工具。
