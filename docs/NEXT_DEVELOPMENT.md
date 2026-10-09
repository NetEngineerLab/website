# UI 基线（所有后续页面开发前强制读取）

从 2026-09-12 起，新增或重构任何公开网页前，必须先读取：

- `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.1.md`
- `website/assets/css/design-tokens.css`
- `website/assets/css/site-shell.css`
- `website/assets/css/tool-design-system.css`
- `website/assets/css/tool-layout.css`

Header、Footer、导航、返回工具中心/面包屑、1400px 页面基准、Hero、卡片、桌面双栏、移动端单列、语言切换和可访问性均不得由单个工具页自行另起一套。

---

# V1.7.5完成后的下一阶段

V1.7.5生产性能自动巡检上线后，执行：

1. 确认Quality Gate、Online Monitor和Performance Monitor均为绿色通过。
2. 连续观察7天、至少7次定时Lighthouse结果。
3. 使用各页面中位数建立稳定基线，不根据单次最高分调整预算。
4. 优先修复重复出现的LCP、CLS、TBT或资源体积问题。
5. 稳定后逐步收紧性能预算，再开展工具页内容与SEO增强。

V1.7.5不修改12个工具的计算公式。生产性能基线稳定后再进入下一阶段产品开发。

## 产品线候选：Network Calculator → Config → Automation → Validation

2026-10-09 的公开工具对标已写入 `COMPETITIVE_LANDSCAPE_NETWORK_TOOLS.md`。结论是不新建第 11 站：Subnet、Fiber、MikroTik 配置生成和 Python/Netmiko 网络自动化均由 NetEngineerLab 承接；RAID 暂留 DevEngineerLab / 数据中心专题做跨站评审。

该方向当前为 `PLANNED`，不替代 ROADMAP 的“当前没有获准开发的 NEXT 工具”。执行顺序为：先完成现有 Subnet/Fiber 覆盖与升级边界审计，再完成 TOOL-141–151 Phase 0 对账，并审计、复用或按缺口扩展现有 V2 Shared Core、Schema/Validator/Vendor Renderer，以 `acl-generator-validator` 和 Interface/VLAN 为参考实现；随后评审单厂商 Golden Fixture 与 Python/Netmiko 生成层，最后验收 `Subnet → VLAN → Config → Automation → Validator` 的保存、重开、验证与报告链路。TOOL-146/147、149、151 必须分别优先复用 Interface/VLAN、`acl-generator-validator`、`network-change-planner-mop-generator` 及其 verification-output；TOOL-141–145、148、150 保持独立边界审计。任何阶段在 Phase 0 去重、跨站结论、Source / Method / Validation、危险命令防护、厂商版本范围和回归证据未通过前，不得进入开发。


## UI V1.2 mandatory Tool Detail template

All new/refactored Tool Detail pages MUST follow `NETENGINEERLAB_UI_V1.2_TOOL_PAGE_TEMPLATE_UNIFICATION_AUDIT_2026-09-12.md` and pass `npm run audit:ui-v1.2` before merge.


## UI V1.3 强制基线

Tool Detail 开发前必须读取 `docs/NETENGINEERLAB_WEB_UI_DESIGN_SYSTEM_V1.3.md`。视觉以 Network Change Planner & MOP Generator 为参考；发布前必须运行 `npm run audit:ui-v1.3` 与 `npm run audit2:ui-v1.3`。
