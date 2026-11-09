from pathlib import Path
t = Path("index.html").read_text(encoding="utf-8")
# print a focused excerpt around formula/result splice
i = t.find("formula-block")
print(t[i-80:i+900])
print("\n==== around below ====")
j = t.find('class="below"')
print(t[j-200:j+120])
