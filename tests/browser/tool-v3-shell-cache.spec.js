const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const site=path.resolve(__dirname,'../../website');

test('shared header native controls retain the same typography tokens as the production shell',async({page})=>{
 for(const slug of ['optical-power-budget','poe-voltage-drop-calculator','wireless-link-budget-calculator'])for(const locale of ['en','zh','es']){
  await page.goto('/tools/'+slug+'/'+(locale==='en'?'':locale+'/'),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  for(const width of [390,960,1280]){
   await page.setViewportSize({width,height:900});
   const styles=await page.evaluate(()=>{
    const header=getComputedStyle(document.querySelector('.site-shell-header'));
    const tokens=selector=>{const style=getComputedStyle(document.querySelector(selector));return{family:style.fontFamily,size:parseFloat(style.fontSize),line:parseFloat(style.lineHeight)};};
    const actions=document.querySelector('.site-shell-actions').getBoundingClientRect();
    return{family:header.fontFamily,size:parseFloat(header.fontSize),line:parseFloat(header.lineHeight),language:tokens('.language-trigger'),menu:tokens('.site-shell-menu-toggle'),overflow:document.documentElement.scrollWidth>innerWidth+1,actionsRight:actions.right};
   });
   expect(styles.language.family).toBe(styles.family);expect(styles.language.size).toBe(14);
   expect(styles.menu.family).toBe(styles.family);expect(styles.menu.size).toBe(styles.size);
   expect(styles.menu.line).toBeCloseTo(styles.line,2);
   expect(styles.language.line).toBeCloseTo(styles.line/styles.size*14,2);
   expect(styles.overflow).toBe(false);expect(styles.actionsRight).toBeLessThanOrEqual(width+1);
  }
 }
});

for(const slug of ['poe-voltage-drop-calculator','wireless-link-budget-calculator'])for(const locale of ['en','zh','es']){
 test(`${slug}/${locale} has one visible breadcrumb and a centered responsive workbench`,async({page})=>{
  await page.goto('/tools/'+slug+'/'+(locale==='en'?'':locale+'/'),{waitUntil:'networkidle'});
  for(const width of [2250,1440,1280,1101,1100,961,960,900,801,769,768,390,375,320]){
   await page.setViewportSize({width,height:900});
   await expect(page.locator('.tool-head .crumbs')).toHaveCount(1);
   await expect(page.locator('.tool-head .crumbs')).toBeVisible();
   await expect(page.locator('body > .breadcrumbs:visible')).toHaveCount(0);
   const positions=await page.evaluate(()=>{
    const main=document.querySelector('main').getBoundingClientRect(),head=document.querySelector('.tool-head').getBoundingClientRect(),input=document.querySelector('.nel-tool-input').getBoundingClientRect();
    return{viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,mainCenter:main.x+main.width/2,headLeft:head.left,inputLeft:input.left,headRight:head.right};
   });
   expect(positions.scrollWidth).toBeLessThanOrEqual(width+1);
   expect(Math.abs(positions.mainCenter-width/2)).toBeLessThanOrEqual(1);
   expect(Math.abs(positions.headLeft-positions.inputLeft)).toBeLessThanOrEqual(1);
   expect(positions.headRight).toBeLessThanOrEqual(width);
  }
  const home=locale==='en'?'/':'/'+locale+'/',tools='/tools/'+(locale==='en'?'':locale+'/');
  const targets=await page.locator('.tool-head .crumbs a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname));
  expect(targets).toEqual([home,tools]);
 });
}

// A real HTTP worker update is required: page routing does not reliably
// intercept the browser's service-worker update requests on every channel.
async function fixtureServer(){
 const workerPath='/tools/poe-voltage-drop-calculator/sw.js';
 const current=fs.readFileSync(path.join(site,workerPath),'utf8');
 const currentName=current.match(/const CACHE\s*=\s*"([^"]+)"/)[1];
 const legacy=current.replace(/\n?\/\* NEL_SCOPED_CACHE_START \*\/[\s\S]*?\/\* NEL_SCOPED_CACHE_END \*\/\n?/g,'').replace(/\bnelScopedCacheMatch\s*\(/g,'caches.match(').replace(currentName,'nel-poe-voltage-drop-calculator-browser-legacy');
 let upgraded=false;
 const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');res.setHeader('Cache-Control','no-store');
  if(url.pathname===workerPath){res.setHeader('Content-Type','text/javascript');return res.end(upgraded?current:legacy);}
  let file=path.resolve(site,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(site+path.sep)){res.statusCode=403;return res.end();}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('missing');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return{origin:'http://127.0.0.1:'+server.address().port,currentName,upgrade:()=>upgraded=true,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections?.();})};
}

test('a real worker upgrade rejects another tool cache and keeps exact-version assets available offline',async({browser})=>{
 test.setTimeout(90000);
 const server=await fixtureServer(),context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1280,height:900}});
 try{
  const page=await context.newPage();await page.goto(server.origin+'/404.html');
  const poison='/* deliberately stale foreign tool fixture */ body { color: rgb(111, 1, 1); }';
  await page.evaluate(async({origin,poison})=>{const cache=await caches.open('nel-fiber-loss-browser-legacy');await cache.put(origin+'/assets/css/fb-v3-prod.css?v=legacy',new Response(poison,{headers:{'Content-Type':'text/css'}}));},{origin:server.origin,poison});
  await page.goto(server.origin+'/tools/poe-voltage-drop-calculator/zh/',{waitUntil:'load'});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  const href=await page.locator('link[href*="/assets/css/fb-v3-prod.css"]').getAttribute('href');
  expect(await page.evaluate(async href=>(await fetch(href)).text(),href)).toBe(poison);
  server.upgrade();
  await page.evaluate(async()=>{const changed=new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));const registration=await navigator.serviceWorker.getRegistration();await registration.update();await changed;});
  const expected=fs.readFileSync(path.join(site,'assets/css/fb-v3-prod.css'),'utf8');
  expect(await page.evaluate(async href=>(await fetch(href)).text(),href)).toBe(expected);
  expect(await page.evaluate(()=>caches.has('nel-fiber-loss-browser-legacy'))).toBe(true);
  // An older version in this cache is also not a valid hit for a new query.
  await page.evaluate(async({name,href,poison})=>{const cache=await caches.open(name),url=new URL(href,location.href);await cache.delete(url.href);url.search='?v=older-own-version';await cache.put(url.href,new Response(poison));},{name:server.currentName,href,poison});
  expect(await page.evaluate(async href=>(await fetch(href)).text(),href)).toBe(expected);
  // Reload immediately after installation: no extra online reload may warm
  // engine.js?v=1.9.7 or the canonical locale directory behind this assertion.
  await context.setOffline(true);await page.reload({waitUntil:'load'});
  await expect(page.locator('.tool-head .crumbs')).toBeVisible();
  await expect(page.locator('#remoteV')).not.toHaveText('—');
  const initial=await page.locator('#remoteV').textContent();await page.locator('#lengthM').fill('120');
  await expect(page.locator('#remoteV')).not.toHaveText(initial);
  await expect(page.locator('body > .breadcrumbs:visible')).toHaveCount(0);
 }finally{await context.close();await server.close();}
});
