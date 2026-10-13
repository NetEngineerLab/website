from pathlib import Path
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,t,a):
  if t=='a':
   d=dict(a)
   if 'href' in d:self.links.append(d['href'])
for f in ['website/tools/pon-splitter-loss/index.html','website/tools/optical-power-budget/index.html','website/tools/fiber-loss/index.html','website/tools/switch-uplink-oversubscription-calculator/index.html','website/guides/fiber-link-budget-guide/index.html','website/guides/pon-splitter-loss-guide/index.html','website/guides/switch-oversubscription-ratio/index.html','website/guides/48-port-switch-oversubscription/index.html','website/topics/pon-optical/index.html','website/topics/switch-oversubscription/index.html']:
 p=P();p.feed(Path(f).read_text(encoding='utf-8'));print('\n',f)
 for h in p.links:
  if h.startswith('http') or h.startswith('#'):continue
  # resolve
  q=(Path(f).parent / h.split('#')[0]).resolve()
  if h.endswith('/'): q=q/'index.html'
  elif q.is_dir(): q=q/'index.html'
  print(('OK' if q.exists() else 'MISS'),h)
