from bs4 import BeautifulSoup, Tag
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'website' / 'tools'
LOCALES = [('index.html','en'), ('zh/index.html','zh'), ('es/index.html','es')]
IGNORE={'es','zh'}

labels={
 'en': {'input':'Engineering inputs','input_desc':'Set the engineering assumptions and design parameters.','result':'Engineering results','result_desc':'Review calculated capacity, limits and design checks.'},
 'zh': {'input':'工程输入与参数','input_desc':'设置工程假设、设备参数与设计边界。','result':'工程计算结果','result_desc':'查看计算容量、限制因素与设计校核结果。'},
 'es': {'input':'Entradas de ingeniería','input_desc':'Configure supuestos, parámetros y límites de diseño.','result':'Resultados de ingeniería','result_desc':'Revise capacidad, límites y verificaciones de diseño.'},
}

def classes(tag): return tag.get('class',[]) if tag else []
def addcls(tag,*cs):
    old=classes(tag)
    for c in cs:
        if c and c not in old: old.append(c)
    tag['class']=old

def canonical_title(soup, panel, kind, locale):
    if not panel or panel.find(class_='section-title', recursive=False): return False
    l=labels.get(locale,labels['en'])
    div=soup.new_tag('div'); div['class']=['section-title','nel-generated-section-title']; div['data-nel-generated']='v1.2.2'
    icon=soup.new_tag('span'); icon['class']=['section-icon']; icon.string='☷' if kind=='input' else '▥'
    text=soup.new_tag('div')
    h2=soup.new_tag('h2'); h2.string=l[kind]
    p=soup.new_tag('p'); p.string=l[kind+'_desc']
    text.append(h2); text.append(p); div.append(icon); div.append(text)
    panel.insert(0,div)
    return True

def migrate_page(file, locale):
    raw=file.read_text(encoding='utf-8')
    soup=BeautifulSoup(raw,'html.parser')
    body=soup.body; main=soup.find('main')
    if not body or not main: return None
    before=str(main)
    body_classes=classes(body)
    if 'nel-tool-detail-page' not in body_classes: body_classes.append('nel-tool-detail-page')
    body['class']=body_classes; body['data-nel-template']='tool-detail-v1.2.2'

    # Canonical main identity, preserving legacy classes only as compatibility hooks.
    addcls(main,'tool-shell','nel-tool-main')

    # Identify a historical primary wrapper and flatten it into main.
    first_tag=next((x for x in main.children if isinstance(x,Tag)),None)
    wrapper=None
    if first_tag and any(c in classes(first_tag) for c in ('nel-tool-primary-grid','grid','tool-layout','layout','panel-layout')):
        wrapper=first_tag
    if wrapper:
        # Only flatten wrappers that actually contain the primary tool UI.
        has_primary=wrapper.find(class_=lambda c: c and any(x in (c if isinstance(c,list) else str(c).split()) for x in ('nel-tool-input','input-panel','config-panel','nel-tool-result','result-panel','analysis-panel')))
        if has_primary:
            for child in list(wrapper.contents):
                if isinstance(child,Tag) or str(child).strip(): wrapper.insert_before(child.extract())
            wrapper.decompose()

    # Primary cards.
    input_panel=main.find(class_=lambda c: c and any(x in (c if isinstance(c,list) else str(c).split()) for x in ('nel-tool-input','input-panel','config-panel')), recursive=False)
    result_panel=main.find(class_=lambda c: c and any(x in (c if isinstance(c,list) else str(c).split()) for x in ('nel-tool-result','result-panel','analysis-panel')), recursive=False)
    if input_panel and result_panel:
        addcls(main,'nel-tool-grid','nel-tool-primary-grid')
        if 'nel-tool-specialized' in classes(main): classes(main).remove('nel-tool-specialized')
        addcls(input_panel,'input-panel','card','nel-tool-input')
        addcls(result_panel,'result-panel','card','nel-tool-result')
        canonical_title(soup,input_panel,'input',locale)
        canonical_title(soup,result_panel,'result',locale)
    else:
        addcls(main,'nel-tool-specialized')

    # Supporting sections should not live inside the calculator workspace.
    trailing=[]
    if input_panel and result_panel:
        for child in list(main.find_all(recursive=False)):
            if child is input_panel or child is result_panel: continue
            # Anything after primary cards is supporting content, not calculator geometry.
            addcls(child,'nel-tool-supporting-section','content-section')
            trailing.append(child.extract())
        for child in reversed(trailing):
            main.insert_after(child)

    # Canonical hero hook and inner geometry.
    hero=None
    for sec in body.find_all(['section','div'], recursive=False):
        cs=classes(sec)
        if 'hero' in cs or 'tool-hero' in cs or 'nel-tool-hero' in cs:
            hero=sec; break
    if hero:
        addcls(hero,'hero','nel-tool-hero')
        inner=hero.find(class_='hero-inner',recursive=False)
        if not inner:
            inner=soup.new_tag('div'); inner['class']=['hero-inner']
            for child in list(hero.contents): inner.append(child.extract())
            hero.append(inner)

    # Shared footer/header/breadcrumb remain build-owned. Ensure version stamp is truthful.
    changed=(str(main)!=before or body.get('data-nel-template')!='tool-detail-v1.2')
    file.write_text(str(soup),encoding='utf-8')
    return {
      'file':str(file.relative_to(ROOT)).replace('\\','/'),
      'locale':locale,
      'grid': bool(input_panel and result_panel),
      'specialized': not bool(input_panel and result_panel),
      'generated_titles': sum(1 for x in (input_panel,result_panel) if x and x.find(attrs={'data-nel-generated':'v1.2.2'},recursive=False)),
      'moved_supporting':len(trailing)
    }

results=[]
for tool in sorted([p for p in TOOLS.iterdir() if p.is_dir() and p.name not in IGNORE]):
    for rel,loc in LOCALES:
        f=tool/rel
        if f.exists():
            r=migrate_page(f,loc)
            if r: results.append(r)

report={
 'version':'UI V1.2.2',
 'pages':len(results),
 'grid_pages':sum(r['grid'] for r in results),
 'specialized_pages':sum(r['specialized'] for r in results),
 'generated_section_titles':sum(r['generated_titles'] for r in results),
 'moved_supporting_sections':sum(r['moved_supporting'] for r in results),
 'files':results
}
(ROOT/'docs'/'UI_V1.2.2_REAL_TEMPLATE_MIGRATION_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False,indent=2))
