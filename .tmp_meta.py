from pathlib import Path
for f in ['website/guides/pon-splitter-loss-guide/index.html','website/zh/guides/pon-splitter-loss-guide/index.html','website/topics/pon-optical/index.html','website/zh/topics/pon-optical/index.html']:
 p=Path(f); print('\n---',f, p.exists());
 if p.exists():
  s=p.read_text(encoding='utf-8');
  for token in ['<title>','meta name="description"','canonical','robots','hreflang','application/ld+json','<h1','GPON','XGS','splitter','dB']:
   print(token, s.lower().count(token.lower()))
