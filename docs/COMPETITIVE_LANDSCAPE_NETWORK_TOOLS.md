# 网络工程工具平台竞品与借鉴记录

日期：2026-09-07（2026-10-09 补充公开服务站工具线索）
状态：`LOCAL PASS`
范围：公开网站与 GitHub 公共项目对标，不代表代码、数据、品牌或许可证可直接复用。

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

## 公开 IT / 网络工程服务站工具线索（2026-10-09）

本轮对象为 **CN Solution BD**。依据是用户在 2026-10-09 对其首页和公开工具页的审阅摘要，原始 URL 尚待补录；因此这里只登记可复核的产品线索，不声称已完成独立网页采集、功能测试或许可证审查。该站不是大型工具平台，而是一个以企业网络、Linux 服务器、ISP 基础设施、MikroTik/Cisco/Juniper 和 Python 网络自动化为主题的服务站。产品决策是：**不新建第 11 站**，网络工程相关能力统一归入 NetEngineerLab；不复制页面、文案、代码或配置模板。

| 公开工具 | 站点归属决策 | NetEngineerLab 处理方式 |
|---|---|---|
| IPv4 & IPv6 Subnet Calculator | NetEngineerLab | 对照现有 `subnet-calculator`，按现有工具升级和 IPv6 能力审计处理，不建立重复工具 |
| Storage RAID Calculator | DevEngineerLab 优先；若形成 Server / SysAdmin / Data Center 专题，可再做跨站评审 | NetEngineerLab 当前不立项，仅保留数据中心工具族候选线索 |
| Fiber Optic Power Budget Calculator | NetEngineerLab | 对照现有 `fiber-loss`、`optical-power-budget`、PON 工具链登记深度升级，不建立同款计算器 |
| MikroTik Config Generator | NetEngineerLab | 进入 Network Config Generator Family 候选族，先做安全边界、厂商语法和验证门禁 |
| Python Network Automation Generator | NetEngineerLab | 用户意图是网络设备自动化；Cisco IOS、MikroTik RouterOS、Juniper JUNOS 脚本生成作为网络自动化候选，不归入通用 Python 开发工具 |

优先吸收三条产品线：Fiber 工程深化、MikroTik/多厂商配置生成、Network Automation。Subnet 以现有能力增强为主；RAID 为次优先跨站候选，不影响 NetEngineerLab 当前开发队列。

### Fiber 工程级升级边界

Fiber 不应停留在 `Fiber Loss + Splice Loss + Connector Loss + Margin` 的单向算术。升级规格应覆盖 Tx/Rx Optical Budget、光纤衰耗、熔接/连接器损耗、工程余量和接收功率，并按证据成熟度评审 1310/1490/1550/1577 nm、GPON/XG-PON/XGS-PON、B+/C+/N1/N2/E1/E2 等级及 1:2–1:128 分光场景。输出至少包含 Pass / Warning / Fail、假设与限制、可追溯报告以及保存后重新打开复核；各制式、等级、波长和损耗默认值必须有 Source / Method / Validation 证据，不能把预设值当作普适标准。

### Network Config Generator Family

候选族包含 MikroTik Basic WAN/LAN、VLAN、NAT、DHCP Server、PPPoE、Firewall Rule、Static Route、OSPF、BGP、QoS / Queue、Backup / Restore，以及 Cisco IOS 和 Juniper JUNOS 配置生成。先审计并复用现有 V2 Shared Core、Schema/Validator/Vendor Renderer，再按缺口扩展，以 `acl-generator-validator` 和现有 Interface/VLAN 域为参考实现；每个成员仍需单独完成去重、厂商/版本范围、危险命令防护、幂等性和 Golden Fixture 验收。

Phase 0 必须先对账 TOOL-141–151，不能把候选名直接解释为新工具授权：

| 候选边界 | Phase 0 复用/审计要求 |
|---|---|
| TOOL-141 NETCONF RPC、142 RESTCONF Request、143 YANG Path、144 YANG Dependency、145 Config Diff | 先核对 V2 Shared Core、现有解析/差异能力和协议安全边界；无证据不得并入配置生成主链 |
| TOOL-146 VLAN、147 Interface | 优先复用已通过验收的 Interface/VLAN Canonical Model、Vendor Renderer、Parser 和语义往返夹具，不另建重复域 |
| TOOL-148 BGP Policy、150 SRv6 Config | 保持独立候选；需补齐协议语义、平台能力和失败关闭验证，不因工具族规划自动准入 |
| TOOL-149 ACL | 优先映射并复用现有 `acl-generator-validator`；在重复决策和 Gate 未完成前仍保持候选状态 |
| TOOL-151 Intent-to-Config | 先复用 `network-change-planner-mop-generator` 已有 Intent、Interface/VLAN、变更/回退、MOP 与 verification-output 链路，仅对经审计确认的缺口扩展 |

Python/Netmiko 自动化层消费经过验证的设备清单与配置意图，生成 Cisco IOS、MikroTik RouterOS、Juniper JUNOS 的可审查脚本。默认不得收集真实凭据，不得直接连接或执行生产设备命令；若未来增加在线执行，必须另立威胁模型和产品批次。

### 连续工作流目标

产品链路定义为：**算 → 配 → 自动化 → 验证**。典型路径为 `Subnet Calculator → VLAN Planner → Switch/Router Config Generator → Python/Netmiko Automation Generator → Configuration Validator`。各阶段传递结构化、带版本的中间数据，并允许用户回到上一步修改；配置与脚本输出必须保留输入摘要、设备平台/版本、生成器版本、警告和验证结果，不能把孤立代码片段作为完成状态。

现有 `network-change-planner-mop-generator` 的 Interface/VLAN、变更/回退、MOP 和 verification-output 是该链路的复用基线；新增页面名称不得成为复制已有能力的理由。TOOL-141–151 的逐项结论以 Phase 0 矩阵为准。

## MIB/OID 精简 V1 的范围影响

GitHub 对标支持当前精简 V1 范围：先做静态 MIB/OID 浏览和精确搜索，避免直接复制桌面 SNMP 浏览器的在线管理边界。实现顺序仍然是：威胁模型复核 → parser build-input lock → 隔离解析与 Golden Fixture → 静态索引 → 双语页面 → 浏览器验收。

## 来源与限制

本记录只保存项目/竞品名称、公开 GitHub 地址（如已有）、用户提供的公开页面审阅摘要、功能层面的对标结论和产品决策。CN Solution BD 的原始 URL 尚待补录；没有复制代码、数据文件、MIB 文件、界面资源或项目文本，许可证和依赖审查仍需在真正复用任何组件前单独完成。
