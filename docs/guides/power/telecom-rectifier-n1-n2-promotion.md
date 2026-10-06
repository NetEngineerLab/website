# 通信整流器容量怎么配：回充峰值、N-1/N-2 与故障校核

通信整流系统不能只看今天的负载。负载增长、蓄电池回充峰值和模块故障叠加后，直流母线是否仍能维持服务，才是扩容评审要回答的问题。

NetEngineerLab 的通信整流器容量计算器把增长、回充、环境降额、N-1/N-2 和机框边界放进同一份工程校核，并可导出 JSON、CSV 与 BOM 风格清单。

## 核心公式

I_required = (I_load + I_recharge) × (1 + headroom)

I_planning,module = I_module × derating × U_target

N_recommended = ceil(I_required / I_planning,module) + N_redundancy

分别检查增长、回充峰值以及“增长 + 回充”叠加工况，避免单项通过而组合超限。

## N-1/N-2 与机框边界

N-1 capacity = (N_installed - 1) × I_module × derating；N-2 capacity = (N_installed - 2) × I_module × derating。故障校核使用环境降额后的物理容量，再单独检查目标利用率余量。

高温、海拔、机框最大模块数和已安装槽位都应在初算阶段录入。工具会识别模块不足、机框超限、槽位不足，并给出扩容模块数和回充限流建议。

## 180 A 负载示例

假设通信负载 180 A、回充电流 60 A、工程余量 15%，负载增长 15%，回充峰值增幅 25%。增长与回充叠加工况为：

(180 × 1.15 + 60 × 1.25) × 1.15 = 324.3 A

仅按当前 240 A 选型会低估未来峰值。还需将 50 A 模块、目标利用率、温度/海拔降额和 N-1/N-2 余量代入计算。

## 把方案交给评审

报告包含输入、假设、场景、故障余量、扩容数量、槽位边界和生成时间。厂家降额曲线、母线电压、保护配合、电池恢复时间及现场测量仍需单独复核。

开始校核：https://netengineerlab.com/tools/telecom-rectifier-dc-power-sizing/

内容复核日期：2026-10-04。
