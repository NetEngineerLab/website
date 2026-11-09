from pathlib import Path
t = Path("index.html").read_text(encoding="utf-8")
# check multiply/divide chars in formula
i = t.find("Payload rate")
chunk = t[i:i+120]
print([hex(ord(c)) for c in chunk if ord(c)>127 or c in "×÷"])
print(chunk)
