from pathlib import Path
import re
root=Path('website/tools')
h={'network-capacity-forecast-planner':'Network Capacity Forecast Planner: Busy-Hour Growth and Expansion','subnet-calculator':'IP Subnet Calculator: CIDR, VLSM and Host Capacity','generator-fuel-runtime-calculator':'Generator Fuel Consumption and Runtime Calculator','bandwidth-calculator':'Bandwidth and Transfer Time Calculator','pue-data-center-energy-efficiency':'PUE and Data Center Energy Efficiency Analyzer','wireless-link-budget-calculator':'Wireless Link Budget Calculator: RF Loss and Fade Margin','poe-power-budget-calculator':'PoE Power Budget Calculator: Switch Watts and Port Capacity','ups-capacity-battery-runtime-calculator':'UPS Capacity and Battery Runtime Calculator'}
for slug,v in h.items():
 p=root/slug/'index.html'; s=p.read_text(encoding='utf-8'); s=re.sub(r'<h1>.*?</h1>',f'<h1>{v}</h1>',s,count=1,flags=re.S); p.write_text(s,encoding='utf-8',newline='')
