# Optical Power Budget Calculator V1.0 Professional

## 核心功能
- 链路预算验证与最大传输距离估算
- 最小发送功率、接收灵敏度、过载门限
- 光纤、熔接、连接器、三级分光器及其他损耗
- 工程余量、预计接收功率、灵敏度余量、过载余量
- 健康 / 风险 / 超限判断与工程诊断
- 复制结果、保存历史、导出 CSV、打印/PDF
- 中文和英文独立页面
- SEO、PWA、GA4、AdSense预留
- 手机端响应式

## 安装目录
`website/tools/optical-power-budget/`

## 说明
预设参数属于可编辑的工程参考值。正式工程必须以设备规格书、企业标准和现场测试数据为准。

## V1.0.1 corrections
- English page fully reviewed and translated.
- English metadata, JSON-LD, accessibility labels, FAQ and related-tool text corrected.
- Primary and secondary splitter defaults set to 1:8 where applicable.
- English PWA manifest and offline page added.

## V1.0.2 ITU standards correction
- Primary splitter remains 1:8.
- Secondary splitter remains 1:8.
- Default profile changed from GPON B+ to GPON C+.
- Added editable optical path penalty.
- Standard ODN budget is now calculated as Tx/Rx window minus optical path penalty.
- Default result: 32.00 dB ODN budget, 28.80 dB design loss, 3.20 dB remaining.

## V1.0.3 interface correction
- Removed the long default standards explanation block below the preset.
- Shortened preset labels to avoid horizontal overflow.
- Default and Reset remain GPON C+ with primary 1:8 and secondary 1:8.
