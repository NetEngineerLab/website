from html.parser import HTMLParser
from pathlib import Path
class P(HTMLParser):
 def __init__(self): super().__init__(); self.on=False; self.tag=''; self.buf=''; self.items=[]
 def handle_starttag(self,t,a):
  if t in ('h1','h2','h3','p','li','td','th'): self.on=True; self.tag=t; self.buf=''
 def handle_data(self,d):
  if self.on:self.buf+=' '+d
 def handle_endtag(self,t):
  if self.on and t==self.tag:
   x=' '.join(self.buf.split()); self.items.append((t,x)); self.on=False
for f in ['website/tools/pon-splitter-loss/index.html','website/tools/optical-power-budget/index.html','website/tools/fiber-loss/index.html','website/tools/switch-uplink-oversubscription-calculator/index.html','website/guides/fiber-link-budget-guide/index.html','website/guides/pon-splitter-loss-guide/index.html','website/guides/switch-oversubscription-ratio/index.html','website/guides/48-port-switch-oversubscription/index.html']:
 print('\n---',f); p=P(); p.feed(Path(f).read_text(encoding='utf-8'))
 for t,x in p.items:
  if any(k in x.lower() for k in ['formula','example','gpon','xgs','splitter','loss','budget','48','10g','25g','n-1','lag','mlag','stack','fiber','margin','sensitivity','connector','splice','capacity','normal','failure','upstream']): print(t,x[:600])
