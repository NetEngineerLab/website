# PON Splitter Loss Calculator V1.0 Professional

## 功能
- 一级、二级、三级分光级联
- 1:2 至 1:128 分光比
- 总分光比自动计算
- 理论分光损耗与实际插入损耗对比
- 额外插入损耗
- 光纤、熔接、连接器、其他损耗
- 设备发送功率、接收灵敏度、过载门限
- 剩余预算、预计ONU接收功率、最大距离
- 健康 / 风险 / 超限诊断
- 中英文独立页面
- 保存记录、复制、CSV、打印/PDF
- SEO、PWA、GA4、AdSense预留

## 安装目录
website/tools/pon-splitter-loss/

## 默认测试
1:16，10 km，0.30 dB/km，6个熔接点，4个连接器，3 dB工程余量：
- 总分光比：1:16
- 分光器损耗：13.80 dB
- 理论分光损耗：12.04 dB
- 物理链路损耗：18.60 dB
- 总设计损耗：21.60 dB
- 剩余预算：6.90 dB
- 预计接收功率：-17.10 dBm

## V1.0.1 corrections
- English page fully reviewed and translated.
- English metadata, JSON-LD, accessibility labels, FAQ and related-tool text corrected.
- Primary and secondary splitter defaults set to 1:8 where applicable.
- English PWA manifest and offline page added.

## V1.0.2 engineering correction
- Primary splitter remains 1:8.
- Secondary splitter remains 1:8.
- Default system profile changed to GPON C+.
- Default transmit power: +3 dBm.
- Default receiver sensitivity: -30 dBm.
- Default optical path penalty: 1 dB.
- Default 1490 nm attenuation: 0.25 dB/km (editable engineering typical value).
- Added 20 km editable system reach cap.
- Standard ODN budget and effective maximum distance are calculated separately.
