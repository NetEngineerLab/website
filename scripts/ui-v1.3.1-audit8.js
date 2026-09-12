const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WEB = path.join(ROOT, 'website');
const TOOLS = path.join(WEB, 'tools');
const errors = [];
const toolPages = [];
const toolDirs = fs.readdirSync(TOOLS).filter(name => {
  const d=path.join(TOOLS,name); return !['zh','es'].includes(name) && fs.statSync(d).isDirectory();
});
for (const name of toolDirs) {
  const dir=path.join(TOOLS,name);
  for (const rel of ['index.html','zh/index.html','es/index.html']) {
    const f=path.join(dir,rel); if(fs.existsSync(f)) toolPages.push(f);
  }
}
function rel(f){return path.relative(ROOT,f).replace(/\\/g,'/');}
for (const f of toolPages) {
  const s=fs.readFileSync(f,'utf8');
  if (!s.includes('data-nel-template="tool-detail-v1.3.1"')) continue;
  const hero=s.match(/<section[^>]*class="[^"]*\bnel-tool-hero\b[^"]*"[^>]*>([\s\S]*?)<\/section>/);
  if(!hero){errors.push(`${rel(f)}: missing nel-tool-hero`);continue;}
  const h=hero[1];
  const eyebrow=h.indexOf('class="eyebrow"'), h1=h.indexOf('<h1');
  const closeH1=h.indexOf('</h1>'); const desc=closeH1>=0?h.indexOf('<p',closeH1):-1; const tagsAt=h.indexOf('class="hero-tags"');
  if([eyebrow,h1,desc,tagsAt].some(x=>x<0)||!(eyebrow<h1&&h1<desc&&desc<tagsAt)) errors.push(`${rel(f)}: hero order differs from MOP baseline`);
  const tags=h.match(/<div class="hero-tags">([\s\S]*?)<\/div>/);
  if(!tags){errors.push(`${rel(f)}: missing hero-tags`);continue;}
  const spans=[...tags[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim());
  if(spans.length!==4) errors.push(`${rel(f)}: hero-tags count ${spans.length}, expected exactly 4`);
  for(const t of spans) if([...t].length>32) errors.push(`${rel(f)}: hero tag too long (${[...t].length}): ${t}`);
  const cta=(s.match(/class="site-shell-context-action"/g)||[]).length;
  if(cta!==1) errors.push(`${rel(f)}: header CTA count ${cta}`);
  if(/\bstart-btn\b/.test(s)) errors.push(`${rel(f)}: legacy start-btn present`);
}
// Repository-wide legacy runtime/style markers.
function walk(d,cb){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.git'].includes(e.name))continue;const f=path.join(d,e.name);e.isDirectory()?walk(f,cb):cb(f);}}
walk(WEB,f=>{if(!/\.(css|js|html)$/.test(f)||path.basename(f).includes('audit'))return;const s=fs.readFileSync(f,'utf8');if(/\.start-btn\b/.test(s))errors.push(`${rel(f)}: forbidden legacy .start-btn`);if(/tool-detail-v1\.3(?!\.1)/.test(s))errors.push(`${rel(f)}: forbidden legacy tool-detail-v1.3 marker`);});
// Public-page local link/resource integrity: sitemap pages + localized 404 pages.
const sitemap=fs.readFileSync(path.join(WEB,'sitemap.xml'),'utf8');
const publicFiles=[];
for(const m of sitemap.matchAll(/<loc>https:\/\/netengineerlab\.com([^<]*)<\/loc>/g)){
  let p=m[1]||'/'; let f=path.join(WEB,p.replace(/^\//,''));
  if(p==='/'||p.endsWith('/')) f=path.join(f,'index.html');
  if(fs.existsSync(f)) publicFiles.push(f); else errors.push(`sitemap target missing: ${p}`);
}
for(const f of [path.join(WEB,'404.html'),path.join(WEB,'zh','404.html'),path.join(WEB,'es','404.html')])if(fs.existsSync(f))publicFiles.push(f);
for(const f of publicFiles){
  const s=fs.readFileSync(f,'utf8'); const ids=new Map();
  for(const m of s.matchAll(/\bid="([^"]+)"/g))ids.set(m[1],(ids.get(m[1])||0)+1);
  for(const [id,n] of ids)if(n>1)errors.push(`${rel(f)}: duplicate id ${id} x${n}`);
  for(const m of s.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const v=m[1]; if(/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/|#)/.test(v))continue;
    const raw=v.split('#')[0].split('?')[0]; if(!raw)continue;
    let target=raw.startsWith('/')?path.join(WEB,raw.slice(1)):path.resolve(path.dirname(f),raw);
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    else if(!fs.existsSync(target)&&!path.extname(target))target=path.join(target,'index.html');
    if(!fs.existsSync(target))errors.push(`${rel(f)}: missing local href/src ${v}`);
  }
}
// Spanish launch-page visible UI leakage that previous ES audit did not cover.
const esChecks=[
  [path.join(WEB,'es','index.html'),['TOOL CATEGORIES','Open tools by engineering category','SHARED ENGINEERING LIBRARY','Unified engineering reference library','Search: optical budget']],
  [path.join(WEB,'es','404.html'),['Page not found','The requested page does not exist','Return home','Open the tool directory']]
];
for(const [f,bad] of esChecks){if(!fs.existsSync(f)){errors.push(`${rel(f)}: missing Spanish public page`);continue;}const s=fs.readFileSync(f,'utf8');for(const x of bad)if(s.includes(x))errors.push(`${rel(f)}: Spanish UI leakage: ${x}`);}
const out={status:errors.length?'FAIL':'PASS',tools:toolDirs.length,pages:toolPages.filter(f=>fs.readFileSync(f,'utf8').includes('data-nel-template="tool-detail-v1.3.1"')).length,publicPagesChecked:new Set(publicFiles).size,errors};
console.log(JSON.stringify(out,null,2)); if(errors.length)process.exit(1);
