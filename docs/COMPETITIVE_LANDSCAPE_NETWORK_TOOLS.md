# 网络工程工具平台竞品与借鉴记录

日期：2026-09-07
状态：`LOCAL PASS`
范围：GitHub 公共项目对标，不代表代码、数据、品牌或许可证可直接复用。

## 对标结论

目前没有发现与 NetEngineerLab 完全相同的 GitHub 项目。最接近的项目是 NetDash Toolkit；MIB Beacon、SNMP MIB Browser 和 snmp-browser 更适合作为 MIB/OID 与 SNMP 方向的功能参考；nmlinux 和 NetSentinel 属于更宽泛的本机网络诊断工具。

## 重点项目

| 项目 | GitHub | 可借鉴能力 | 与 NetEngineerLab 的边界 |
|---|---|---|---|
| NetDash Toolkit | https://github.com/sunnypatell/netdash-toolkit | 浏览器网络工程工作台、工具注册表、子网/VLSM/MTU/带宽/光纤/VLAN/ACL/无线工具集中组织 | 对方约 48 个工具并同时提供 Electron；NetEngineerLab 保持 22 个双语工具、静态 Cloudflare Pages 和工程解释优先 |
| MIB Beacon | https://github.com/LibreStatic/mib-beacon | MIB 导入、OID 树、名称/OID/描述搜索、跨平台界面 | 对方是 SNMP 工具套件；NetEngineerLab 的 MIB/OID Explorer 先做可审计静态数据，不做在线查询、用户上传或监控 |
| SNMP MIB Browser | https://github.com/Willow-Browser/SNMP-MIB-Browser | MIB 浏览和 OID 管理的桌面交互参考 | Wails/Vue 桌面应用，面向 SNMP Agent 开发，不作为站点架构模板 |
| snmp-browser | https://github.com/snmpware/snmp-browser | MIB 浏览、SNMP 查询、Trap、监控和多格式导出功能参考 | 功能范围包含凭据、轮询和 Trap 管理；这些能力不进入 NetEngineerLab 精简 V1 |
| nmlinux | https://github.com/thongor77/nmlinux | 子网、DNS、Ping、端口扫描、SNMP 等本机诊断工具的组合方式 | Linux/PySide6 桌面工具，依赖本机网络能力，与浏览器本地计算站定位不同 |

## 对 NetEngineerLab 的产品启示

1. 继续使用注册表驱动的工具目录，把工具数量、分类、路由、语言和工作流关系保持在单一事实源中。
2. 继续强化工作流串联，让 IP、VLAN、MTU、光模块、DNS 和变更 MOP 形成连续的工程任务路径。
3. MIB/OID Explorer 优先实现精确 OID 反查、对象名/模块名搜索、模块页、对象详情、来源和限制说明。
4. 继续保持双语、浏览器本地计算、来源可见、复核日期和失败关闭，这些是 NetEngineerLab 与通用工具集合的主要差异。
5. 不引入在线 SNMP 查询、用户上传、凭据管理、Trap 接收、数据库或 AI 搜索，除非建立新的威胁模型和独立产品批次。

## MIB/OID 精简 V1 的范围影响

GitHub 对标支持当前精简 V1 范围：先做静态 MIB/OID 浏览和精确搜索，避免直接复制桌面 SNMP 浏览器的在线管理边界。实现顺序仍然是：威胁模型复核 → parser build-input lock → 隔离解析与 Golden Fixture → 静态索引 → 双语页面 → 浏览器验收。

## 来源与限制

本记录只保存项目名称、公开 GitHub 地址、功能层面的对标结论和产品决策。没有复制代码、数据文件、MIB 文件、界面资源或项目文本；许可证和依赖审查仍需在真正复用任何组件前单独完成。
