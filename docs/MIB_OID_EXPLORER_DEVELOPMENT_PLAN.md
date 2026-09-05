# NetEngineerLab MIB & OID Explorer 开发计划

## 产品定位

建设面向网络工程师的可搜索、可解析、可追溯 MIB/OID 知识平台，而不是 MIB 文件堆放或“全球最全”宣传页。核心查询包括对象名、数字 OID、MIB 模块、厂商、设备场景和自然语言问题。

产品价值链：`MIB 模块 → OID 对象 → 依赖/OID Tree → 工程解释 → SNMP 示例 → 设备监控场景`。

## 必须先确定的边界

- 第一期只导入 IETF 标准 MIB 和许可明确的数据；厂商内容默认只保存元数据、版本、校验哈希和官方来源链接。
- 未核实再分发许可的厂商 MIB 不镜像、不提供本站下载；Community 与用户贡献必须明显标记来源及置信度。
- 不宣称“全球最全”，使用可审计指标展示模块、对象、通知、厂商、来源覆盖率和最后核验时间。
- 原始 MIB、解析结果和自然语言解释必须区分；解释不得改变 OID、类型、访问权限、状态或来源事实。
- 用户上传功能不进入 V1；未来启用前必须增加隔离解析、大小/资源限制、恶意文件检查、许可证声明、去重和人工审核。

## 信息架构与核心数据

建议公开路由：

- `/mib/`：搜索、标准 MIB、厂商入口、热门 OID 和覆盖指标。
- `/mib/{module}/`：模块元数据、修订、对象、通知、依赖和来源。
- `/oid/{numericOid}/`：对象名称、OID、语法、访问、状态、说明、索引、单位、父子节点及 SNMP 示例。
- 后续 `/monitoring/{scenario}/`：CPU、内存、接口、温度、风扇、电源和光模块等跨厂商监控场景。

核心实体：`mib_modules`、`mib_objects`、`mib_notifications`、`mib_dependencies`、`vendors`、`sources/licenses`。每条记录至少保留来源 URL、来源类型、许可状态、文件哈希、解析器版本和最后核验时间。

## 技术决策门

该模块的数据量、全文搜索和持续导入需求不同于现有静态计算器。在编码前单独完成 ADR，对以下方案做容量、成本、部署、备份、搜索质量和现有 Cloudflare/GitHub 流程兼容性评估：

1. 静态预构建索引 + 客户端搜索（仅适合标准 MIB 原型）。
2. Astro/Next.js 前端 + API + PostgreSQL Full Text Search。
3. 数据扩大后再评估 Meilisearch/Elasticsearch，V1 不预先引入。

MIB/SMI 解析优先选用成熟、仍维护且许可证兼容的库；不得从零实现 ASN.1/SMI 解析器。依赖选型前必须验证 SMIv1/SMIv2、IMPORTS、OBJECT-TYPE、MODULE-IDENTITY、NOTIFICATION-TYPE、错误定位和资源限制。

## 分阶段交付

### Phase 0 — 调研、许可与 ADR

- 核验 IETF、Cisco 等官方来源、许可和再分发条件。
- 制作 8–12 个标准 MIB 的代表性语料及失败样例。
- 决定数据库、API、解析器和部署边界；建立来源可信度模型。
- 输出数据字典、威胁模型、SEO 路由规则和删除/更新策略。

验收：来源与许可台账可审计；架构 ADR 通过；禁止在此门禁前批量抓取或公开文件。

### V1.0 — 标准 MIB/OID Explorer

- 导入 IETF 通用 MIB，构建确定性解析、依赖解析、去重和 OID Tree。
- 提供 OID 精确反查、对象名搜索、模块页和对象详情页。
- 中英文工程解释、SNMP 命令示例、来源和适用边界可见。
- 建立解析 Golden Fixture、重复导入幂等、错误输入、性能和搜索相关性测试。

#### 精简 V1 冻结范围（2026-09-05）

精简 V1 只交付 8 个逐文件许可审核为 approved、且 IMPORT 完整闭合的 IETF 标准 MIB。首选闭包固定为 `SNMPv2-SMI`、`SNMPv2-TC`、`SNMPv2-CONF`、`SNMPv2-MIB`、`INET-ADDRESS-MIB`、`TCP-MIB`、`UDP-MIB`、`SNMP-FRAMEWORK-MIB`；其中 TCP/UDP 对 INET-ADDRESS-MIB 的依赖已纳入。任一项未通过时，只能从全部 10 个已审核候选中选择仍保持 8 个且依赖闭合的替代集合；无法闭合就停止，不得降级许可或使用厂商/聚合站文件。

公开功能只包括双语 `/mib/` 搜索入口、8 个模块页、获批对象的静态详情页、数字 OID 精确反查、对象名/模块名客户端搜索、来源与限制说明。页面必须复用现有 Header、Footer、设计令牌、内容顺序、Page Registry、canonical/hreflang、Sitemap 和浏览器验收；只有具备唯一已验证内容的页面可 index。

精简 V1 明确不包含厂商 MIB/设备兼容关系、文件下载、用户上传、在线解析、API、数据库、专用搜索服务、自然语言/AI 搜索、监控场景库和自动增量采集。上述能力保持 V1.1+ 或 V2/V3，不得在本批顺手加入。

执行顺序冻结为：威胁模型 → 审核全部 10 个候选并选出 8 个 approved 的闭合集合 → JSON Schema/故障测试 → parser lock/runtime approval → 隔离解析与 Golden → 静态索引/页面 → 双语四终端浏览器验收 → 推送与线上验收。每一步必须写入 `docs/DEVELOPMENT_LOG.md` 并由 2 号验证官 PASS 后才能进入下一步。

V1 完成门槛：8/8 来源链和许可 head 有效、两次构建 byte-identical、OID/IMPORT/父子关系无未裁决冲突、精确 OID 测试 100% 命中、对象名与模块名 Golden 查询 Top-1 100%、公开页无孤页/重复 canonical/错误 hreflang、`npm run verify` 与四终端双语浏览器验收全部通过。

### V1.1 — Cisco 官方索引

- 建立 Cisco 官方来源采集与版本更新流程。
- 许可不明确时只展示结构化元数据和官方链接，不本站镜像。
- 增加厂商、产品系列与 OS/版本关联，但不得推断未验证兼容性。

### V1.2 — Huawei、H3C、Juniper、ZTE

- 逐厂商小批次导入，每个厂商独立验证来源、许可、解析覆盖和版本映射。
- 每批通过独立验证后才能公开，Community 数据不得混作 Official。

### V2.0 — 自然语言 OID 搜索

- 将查询映射到已验证结构化对象；结果必须展示来源和匹配依据。
- AI 只能解释和排序，不得生成不存在的 OID 或改写标准字段。

### V3.0 — 设备型号与监控场景

- 输入设备型号，返回 CPU、内存、接口、环境、电源和光模块等建议监控项。
- 每项必须绑定厂商文档、适用 OS/版本与置信度；无法确认时明确标记未知。

## SEO/GEO 与内容质量

- 搜索意图覆盖：OID 反查、对象名查 OID、MIB 模块查询、厂商 OID、SNMP 指标解释和设备监控场景。
- 详情页必须提供直接答案、结构化字段、工程含义、采集示例、限制、来源和更新时间。
- 禁止为每个近似关键词复制薄页面；只有具备独立、已验证对象数据的 URL 才进入 Sitemap。
- JSON-LD 与页面可见数据一致；大规模页面发布前必须增加重复内容、孤立页面、canonical、索引膨胀和 Sitemap 分片门禁。

## 质量与运营指标

- 数据正确性：Golden Fixture、OID 唯一性、父子关系、依赖闭包、幂等导入和来源哈希。
- 搜索质量：精确 OID 命中率、对象名 Top-1、常见工程查询 Top-k 和零结果率。
- 覆盖指标：按 Standard/Official/Community/User-contributed 分层统计，不混合计算可信覆盖率。
- 运行指标：解析失败率、过期来源、许可未知项、更新延迟、API 延迟和索引大小。

## 与当前开发队列的关系

本计划登记为 ACL Tool 21 和既定 SEO/GEO 批次之后的新产品线，不中断当前未完成的四厂商 ACL 核心修复。真正开始实施时，第一批只能执行 Phase 0，不得直接批量采集或开发生产数据库。
