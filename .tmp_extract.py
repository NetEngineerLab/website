from pathlib import Path
for f in ['website/tools/optical-power-budget/index.html','website/tools/optical-power-budget/zh/index.html','website/tools/pon-splitter-loss/index.html','website/tools/pon-splitter-loss/zh/index.html']:
 print('\n---',f); s=Path(f).read_text(encoding='utf-8')
 for key in ['Worked example','GPON C+','XGS','Default standards','物理','工程案例','参考','ITU-T','G.984','G.9807','XGS-PON']:
  i=s.find(key)
  if i>=0: print(s[max(0,i-180):i+900].replace('><','>\n<'))
