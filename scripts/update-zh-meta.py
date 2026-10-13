from pathlib import Path
import re
root=Path('website/tools')
vals={
'network-capacity-forecast-planner':('网络容量增长预测规划器｜忙时增长与扩容计算','根据实测忙时需求、复合增长率、峰值余量和扩容阈值预测网络容量。'),
'subnet-calculator':('IP子网计算器｜CIDR、VLSM与主机容量规划','计算IPv4/IPv6 CIDR范围、掩码、通配符掩码、可用主机数和VLSM分配。'),
'generator-fuel-runtime-calculator':('油机油耗与应急续航计算器｜按负载曲线规划','根据厂商负载曲线和通信站点负载估算油耗、停电续航、补给和燃油储备。'),
'bandwidth-calculator':('带宽与传输时间计算器｜链路速率和数据量','按明确的比特/字节和效率假设计算传输时间、所需链路速率和数据量。'),
'pue-data-center-energy-efficiency':('数据中心PUE与能效分析器｜IT负载与节能','根据IT能耗和设施总能耗计算PUE、非IT开销、年度成本及目标PUE节能。'),
'wireless-link-budget-calculator':('无线链路预算计算器｜射频损耗、EIRP与余量','计算无线链路EIRP、自由空间路径损耗、接收电平、衰落余量和菲涅尔区净空。'),
'poe-power-budget-calculator':('PoE功率预算计算器｜交换机功率、端口与余量','按摄像机、AP和电话的功耗、电缆损耗、端口限制及工程余量估算PoE交换机预算。'),
'ups-capacity-battery-runtime-calculator':('UPS容量与电池后备时间计算器｜kW、kVA与N+1','根据关键负载、效率、老化、温度和冗余假设规划UPS容量及电池续航。')}
for slug,(title,desc) in vals.items():
 p=root/slug/'zh/index.html'; s=p.read_text(encoding='utf-8'); s=re.sub(r'<title>.*?</title>',f'<title>{title}</title>',s,count=1,flags=re.S); s=re.sub(r'(<meta[^>]+name=["\']description["\'][^>]+content=["\'])[^"\']*(["\'])',rf'\g<1>{desc}\2',s,count=1,flags=re.I); s=re.sub(r'(<meta[^>]+content=["\'])[^"\']*(["\'][^>]+name=["\']description)',rf'\g<1>{desc}\2',s,count=1,flags=re.I); p.write_text(s,encoding='utf-8',newline='')
