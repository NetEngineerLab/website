# MIB/OID parser runtime provenance 设计

状态：`LOCAL PASS（设计阶段；未构建镜像）`  
设计日期：2026-09-08  
前置条件：parser build-input Schema、runtime approval/revocation 本地测试已 `VALIDATOR PASS`。

## Provenance 记录

候选运行时构建完成后，才允许生成 `parser-runtime.provenance/1.0.0` 记录。记录必须绑定：

- OCI repository digest、`targetOs=linux`、`targetArchitecture=amd64`。
- parser 包版本、Python/Node 工具版本、直接与传递依赖版本、依赖树 SHA-256。
- Dockerfile SHA-256、构建日志 SHA-256、parser build-input lock SHA-256、SBOM SHA-256、许可证清单 SHA-256。
- 构建命令的不可变参数、网络关闭证明、wheel/source cache 清单和构建时间范围；时间只进入审计 envelope，不进入确定性产物。

## 生成与批准顺序

1. 从已通过来源链的 lock 读取输入，离线构建候选镜像；构建失败或依赖未闭包时删除临时输出。
2. 生成 provenance 记录并逐字段重算所有 SHA-256；镜像 tag 不能代替 digest。
3. 独立验证者从 lock、Dockerfile、wheel/source cache 和 provenance 重建或核对镜像、SBOM、许可证与目标平台。
4. 只有验证通过后，按 ADR 的 runtime approval Schema 生成 `recordSha256`，再生成 `runtimeapproval-<recordSha256>`；批准 head 必须唯一且未撤回。

## 运行前复核

解析作业启动前必须重新确认：runtime approval 的 image digest、OS/架构、provenance、input lock 和 SBOM 与实际容器逐字节一致；approval 是当前 scope 的唯一 effective approved leaf；来源 review head 仍 approved；网络、挂载、用户、capability、CPU、内存、PID、tmpfs 和 stdout/stderr 限制未放宽。任一复核失败立即拒绝运行。

## 当前禁止动作

本批不下载依赖、不构建 OCI 镜像、不生成 provenance/approval、不运行 parser、不写入 MIB 字节或 Golden Fixture，不创建公开索引和页面。下一批只能先做纯本地 provenance 字段/哈希/撤回测试，且必须经过独立审计。
