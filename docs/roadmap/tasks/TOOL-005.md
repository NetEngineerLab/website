# TOOL-005 — N-1 Uplink Oversubscription Calculator

- **阶段 / 状态：** ADMISSION / BLOCKED
- **负责人：** `/root`（总工）；实现与准入尚未开始。
- **阻塞原因：** 原始矩阵的 problem_statement、inputs、outputs、core_logic、target_user 均为 `PENDING`；跨工具交叉表共享前置也未关闭。
- **当前判断：** 暂无足够权威范围来界定 N-1 故障模式、活动上联/端口参数、输出指标及验证方法。不得从标题、邻近 TOOL-003 或现有计算器反推候选需求。
- **下一诊断动作：** 获取 TOOL-005 权威问题指纹与来源（问题、输入、输出、核心逻辑、目标用户、Source/Method/Validation）；随后独立审核重叠及准入证据。满足后运行 `node scripts/development-queue.js unblock TOOL-005` 并从准入重新开始。
- **实现：** 未开始；没有更改工具页面或计算引擎。
- **部署：** 未部署；未 push、未合并。
- **队列行为：** 当前项记录在 `DEVELOPMENT_QUEUE_STATE.json` 的 `blocked` 中并被跳过，下一候选按优先级排序为 TOOL-019；此状态不等于完成或重复排除。

