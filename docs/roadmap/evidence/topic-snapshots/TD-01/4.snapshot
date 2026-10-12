'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(process.argv[2] || process.cwd());
const built = path.resolve(process.argv[3]);
const ev = path.join(root, 'docs/roadmap/evidence/TD-01');
const read = p => fs.readFileSync(p, 'utf8');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const checks = [];
function record(name, pass, detail) { checks.push({name, pass, detail}); }
const registry = JSON.parse(read(path.join(root,'website/data/content-registry.json')));
const topic = registry.topics.find(t=>t.id==='topic-switching-oversubscription');
const routes = JSON.parse(read(path.join(root,'website/data/sitemap-routes.json'))).routes;
const canonicalRoute = routes.filter(r=>r.route.replace(/^\/+|\/+$/g,'')==='topics/switch-oversubscription'&&r.status==='active'&&r.indexable);
record('content registry stable ID/slug', !!topic&&topic.slug==='switch-oversubscription', JSON.stringify(topic));
record('official route unique', canonicalRoute.length===1, `active/indexable matches=${canonicalRoute.length}`);
const dispositions=[{id:'topic-pon-optical',source:'/topics/pon-optical/',destination:'/topics/pon-optical/'},{id:'topic-data-center-capacity',source:'/topics/data-center-capacity/',destination:'/topics/data-center-capacity/'},{id:'topic-switching-oversubscription',source:'/topics/switching-oversubscription/',destination:'/topics/switch-oversubscription/'}];
const actualMap=dispositions.map(d=>{const item=registry.topics.find(t=>t.id===d.id);return {...d,registeredSlug:item?.slug,registeredRoute:`/topics/${item?.slug}/`};});
const mappingValid=actualMap.length===3&&new Set(actualMap.map(x=>x.id)).size===3&&new Set(actualMap.map(x=>x.source)).size===3&&new Set(actualMap.map(x=>x.destination)).size===3&&actualMap.every(x=>x.registeredRoute===x.destination)&&!actualMap.some(x=>x.source!==x.destination&&actualMap.find(y=>y.source===x.destination));
record('mapping completeness and uniqueness',mappingValid,JSON.stringify(actualMap));
const redirects = read(path.join(root,'website/_redirects')).split(/\r?\n/).map(l=>l.trim().split(/\s+/)).filter(a=>a.length===3&&!a[0].startsWith('#'));
const redirect = redirects.filter(a=>a[0]==='/topics/switching-oversubscription/');
record('Cloudflare redirect config', redirect.length===1&&redirect[0][1]==='/topics/switch-oversubscription/'&&redirect[0][2]==='301', JSON.stringify(redirect));
const headers = read(path.join(root,'website/_headers'));
for(const route of ['/topics/pon-optical/','/topics/data-center-capacity/']) {
  const escaped=route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const match=headers.match(new RegExp('(?:^|\\n)'+escaped+'\\s*\\n\\s*X-Robots-Tag:\\s*noindex','i'));
  record(`Cloudflare noindex config ${route}`, !!match, match?'exact path maps to X-Robots-Tag: noindex':'rule missing');
}
const generatedPage=path.join(built,'website/topics/switch-oversubscription/index.html');
const generatedZh=path.join(built,'website/zh/topics/switch-oversubscription/index.html');
for(const [locale,file,url] of [['en',generatedPage,'https://netengineerlab.com/topics/switch-oversubscription/'],['zh',generatedZh,'https://netengineerlab.com/zh/topics/switch-oversubscription/']]) {
  const html=read(file);
  record(`canonical ${locale}`,new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`, 'i').test(html), `expected ${url}`);
  const altLinks=[...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi)].map(m=>[m[1],m[2]]);
  const expectedAlts=[['en','https://netengineerlab.com/topics/switch-oversubscription/'],['zh-CN','https://netengineerlab.com/zh/topics/switch-oversubscription/'],['x-default','https://netengineerlab.com/topics/switch-oversubscription/']];
  record(`hreflang ${locale}`,expectedAlts.every(pair=>altLinks.some(actual=>actual[0]===pair[0]&&actual[1]===pair[1])),`found ${altLinks.length} expected alternates`);
}
const sitemap=read(path.join(built,'website/sitemap.xml'));
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const paths=locs.map(x=>new URL(x).pathname);
record('sitemap excludes retained stubs',!paths.includes('/topics/pon-optical/')&&!paths.includes('/topics/data-center-capacity/'),`URLs=${locs.length}`);
record('sitemap contains canonical bilingual routes',paths.includes('/topics/switch-oversubscription/')&&paths.includes('/zh/topics/switch-oversubscription/'),'EN/ZH canonical routes found');
record('sitemap bilingual alternates',sitemap.includes('hreflang="zh-CN" href="https://netengineerlab.com/zh/topics/switch-oversubscription/"')&&sitemap.includes('hreflang="x-default" href="https://netengineerlab.com/topics/switch-oversubscription/"'),'zh-CN and x-default sitemap alternates found');
const legacyFiles=['website/topics/pon-optical/index.html','website/topics/data-center-capacity/index.html'];
const missingCaseRoutes=['cases/pon-splitter-loss-margin/','cases/data-center-capacity-review/'];
const retainedHtml=legacyFiles.map(rel=>read(path.join(built,rel))).join('\n');
record('missing case links omitted',missingCaseRoutes.every(route=>!fs.existsSync(path.join(built,'website',route,'index.html')))&&!retainedHtml.includes('/cases/'),'the two missing case targets are absent and not linked from retained stubs');
const broken=[]; let scanned=0; const routeTargets=new Set(['/topics/pon-optical/','/topics/data-center-capacity/','/topics/switch-oversubscription/']);
for(const rel of legacyFiles){const p=path.join(built,rel); if(!fs.existsSync(p))continue; scanned++;const html=read(p); for(const m of html.matchAll(/href=["']([^"']+)["']/gi)){const href=m[1]; if(/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(href))continue; let pathname;try{pathname=new URL(href,'https://netengineerlab.com/').pathname}catch{broken.push(`${rel}: invalid ${href}`);continue;} if(pathname==='/topics/switching-oversubscription/'){if(!redirect.some(a=>a[1]==='/topics/switch-oversubscription/'&&a[2]==='301'))broken.push(`${rel}: old alias lacks redirect`);continue;} let target=path.join(built,'website',pathname.replace(/^\//,'')); if(pathname.endsWith('/'))target=path.join(target,'index.html'); if(!fs.existsSync(target)&&!routeTargets.has(pathname))broken.push(`${rel}: ${href} -> ${pathname}`); }}
record('legacy HTML link targets',broken.length===0,`scanned=${scanned}, broken=${broken.length}; switch stub is served through verified 301 alias`);
fs.writeFileSync(path.join(ev,'validation-summary.json'),JSON.stringify({builtAt:new Date().toISOString(),root,built,checks,pass:checks.every(c=>c.pass)},null,2)+'\n');
const groups={content:checks.filter(c=>c.name.startsWith('content')||c.name==='official route unique'),calculation:checks.filter(c=>c.name==='mapping completeness and uniqueness'),redirects:checks.filter(c=>c.name.startsWith('Cloudflare redirect')),canonical:checks.filter(c=>c.name.startsWith('canonical')||c.name.startsWith('hreflang')),sitemap:checks.filter(c=>c.name.startsWith('sitemap')),links:checks.filter(c=>c.name==='legacy HTML link targets'),brokenlinks:checks.filter(c=>c.name==='legacy HTML link targets')};
for(const [name,items] of Object.entries(groups))fs.writeFileSync(path.join(ev,`${name}.txt`),items.map(c=>`${c.pass?'PASS':'FAIL'}: ${c.name}: ${c.detail}`).join('\n')+'\n');
fs.writeFileSync(path.join(ev,'broken-links.txt'),broken.length?broken.join('\n')+'\n':`PASS: no broken href targets in the two retained HTML stubs (${scanned} scanned); the switching stub is served through the separately verified Cloudflare 301 alias.\n`);
console.log(JSON.stringify({pass:checks.every(c=>c.pass),checks},null,2));
if(checks.some(c=>!c.pass))process.exitCode=1;
