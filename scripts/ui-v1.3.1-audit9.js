const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const WEB=path.join(ROOT,'website');
const TOOLS=path.join(WEB,'tools');
const errors=[];
function rel(f){return path.relative(ROOT,f).replace(/\\/g,'/');}
function read(f){return fs.readFileSync(f,'utf8');}
function walk(d,cb){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.git'].includes(e.name))continue;const f=path.join(d,e.name);e.isDirectory()?walk(f,cb):cb(f);}}
function attr(tag,name){const m=tag.match(new RegExp('\\b'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));return m?m[1]:'';}

// 1) Tool Detail inventory + structural/runtime checks.
const toolDirs=fs.readdirSync(TOOLS).filter(name=>!['zh','es'].includes(name)&&fs.statSync(path.join(TOOLS,name)).isDirectory());
const toolPages=[];
for(const name of toolDirs){
  const dir=path.join(TOOLS,name);
  for(const r of ['index.html','zh/index.html','es/index.html']){const f=path.join(dir,r);if(fs.existsSync(f))toolPages.push(f);}
}
for(const f of toolPages){
  const s=read(f);
  if(!s.includes('data-nel-template="tool-detail-v1.3.1"')) errors.push(`${rel(f)}: missing tool-detail-v1.3.1`);
  for(const marker of ['NEL_HEADER_START','NEL_HEADER_END','NEL_FOOTER_START','NEL_FOOTER_END','NEL_TOOL_RETURN_START','NEL_TOOL_RETURN_END']){
    const n=(s.match(new RegExp(marker,'g'))||[]).length;if(n!==1)errors.push(`${rel(f)}: ${marker} count ${n}`);
  }
  const cta=s.match(/<div class="site-shell-context-action">\s*<a[^>]*href="([^"]+)"/i);
  if(!cta)errors.push(`${rel(f)}: missing header CTA`);
  else if(cta[1].startsWith('#')&&!new RegExp(`\\bid=["']${cta[1].slice(1).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`).test(s))errors.push(`${rel(f)}: CTA target ${cta[1]} missing`);
  if(/<\/(?:meta|link)>/i.test(s)) errors.push(`${rel(f)}: invalid closing tag for HTML void element`);

  // Accessible names for active form controls. Existing wrapped labels and label[for] are accepted.
  const labels=new Set([...s.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]));
  const controlRe=/<(?:input|select|textarea)\b[^>]*>/gi;
  let m;
  while((m=controlRe.exec(s))){
    const tag=m[0];
    if(/\bhidden(?:\s|=|>)/i.test(tag)||/\bdisabled(?:\s|=|>)/i.test(tag)||/\btype=["'](?:hidden|submit|button|reset)["']/i.test(tag))continue;
    const id=attr(tag,'id');
    if(/\baria-(?:label|labelledby)\s*=/i.test(tag)||(id&&labels.has(id)))continue;
    const before=s.slice(0,m.index);
    const lastOpen=before.lastIndexOf('<label');
    const lastClose=before.lastIndexOf('</label>');
    if(lastOpen>lastClose)continue;
    errors.push(`${rel(f)}: active ${tag.match(/^<([a-z]+)/i)?.[1]||'control'} ${id?`#${id}`:''} has no accessible name`);
  }
}

// 2) Source convergence: local tool CSS cannot own platform/body geometry.
const forbiddenExact=/^(?:html|body|html\s*,\s*body|body\s*,\s*html|\.eyebrow|main#calculator)$/i;
for(const d of toolDirs){
  const root=path.join(TOOLS,d);
  walk(root,f=>{
    if(path.extname(f)!=='.css')return;
    const raw=read(f).replace(/\/\*[\s\S]*?\*\//g,'');
    // Rule starts at file start or immediately after a closing/opening brace (covers nested @media blocks too).
    for(const mm of raw.matchAll(/(?:^|[{}])\s*([^{}]+?)\s*\{/g)){
      const selector=mm[1].trim().replace(/\s+/g,' ');
      if(forbiddenExact.test(selector))errors.push(`${rel(f)}: forbidden platform selector ${selector}`);
    }
  });
}
const layoutFile=path.join(WEB,'assets/css/tool-layout.css');
const layout=read(layoutFile);
if((layout.match(/UI V1\.3\.1 — CANONICAL TOOL DETAIL BASELINE/g)||[]).length!==1)errors.push('website/assets/css/tool-layout.css: canonical baseline marker must appear exactly once');
if(/UI V1\.2\.2 — TRUE TOOL DETAIL TEMPLATE/.test(layout))errors.push('website/assets/css/tool-layout.css: duplicate legacy V1.2.2 geometry block remains');

// 3) Public page markup + OpenGraph parity + local resource/anchor integrity.
const sitemap=read(path.join(WEB,'sitemap.xml'));
const publicFiles=[];
for(const m of sitemap.matchAll(/<loc>https:\/\/netengineerlab\.com([^<]*)<\/loc>/g)){
  const p=m[1]||'/'; let f=path.join(WEB,p.replace(/^\//,''));
  if(p==='/'||p.endsWith('/'))f=path.join(f,'index.html');
  if(!fs.existsSync(f)){errors.push(`sitemap target missing: ${p}`);continue;} publicFiles.push(f);
}
for(const f of [path.join(WEB,'404.html'),path.join(WEB,'zh','404.html'),path.join(WEB,'es','404.html')])if(fs.existsSync(f))publicFiles.push(f);
for(const f of publicFiles){
  const s=read(f);
  if(/<\/(?:meta|link)>/i.test(s))errors.push(`${rel(f)}: invalid </meta> or </link>`);
  const ids=new Map();for(const m of s.matchAll(/\bid=["']([^"']+)["']/g))ids.set(m[1],(ids.get(m[1])||0)+1);
  for(const [id,n] of ids)if(n>1)errors.push(`${rel(f)}: duplicate id ${id} x${n}`);
  for(const m of s.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
    const v=m[1];if(/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/|#)/i.test(v))continue;
    const raw=v.split('#')[0].split('?')[0];if(!raw)continue;
    let target=raw.startsWith('/')?path.join(WEB,raw.slice(1)):path.resolve(path.dirname(f),raw);
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    else if(!fs.existsSync(target)&&!path.extname(target))target=path.join(target,'index.html');
    if(!fs.existsSync(target))errors.push(`${rel(f)}: missing local href/src ${v}`);
  }
  const title=(s.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/<[^>]+>/g,'').trim()||'';
  const descTag=(s.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i)||[])[0]||'';
  const desc=attr(descTag,'content');
  const ogTitleTag=(s.match(/<meta\b[^>]*\bproperty=["']og:title["'][^>]*>/i)||[])[0]||'';
  const ogDescTag=(s.match(/<meta\b[^>]*\bproperty=["']og:description["'][^>]*>/i)||[])[0]||'';
  if(title&&attr(ogTitleTag,'content')!==title)errors.push(`${rel(f)}: og:title differs from localized <title>`);
  if(desc&&attr(ogDescTag,'content')!==desc)errors.push(`${rel(f)}: og:description differs from localized meta description`);
}

// 4) Active locale menu must not leak English secondary labels into zh/es UI.
for(const f of publicFiles){
  const s=read(f); const lang=(s.match(/<html\b[^>]*\blang=["']([^"']+)/i)||[])[1]||'';
  if(lang==='es'&&/<small>(?:English|Chinese|Spanish)<\/small>/i.test(s))errors.push(`${rel(f)}: Spanish language menu secondary labels are not localized`);
  if(lang==='zh-CN'&&/<small>(?:English|Chinese|Spanish)<\/small>/i.test(s))errors.push(`${rel(f)}: Chinese language menu secondary labels are not localized`);
}

const out={status:errors.length?'FAIL':'PASS',tools:toolDirs.length,toolDetailPages:toolPages.length,publicPagesChecked:new Set(publicFiles).size,errors};
console.log(JSON.stringify(out,null,2));if(errors.length)process.exit(1);
