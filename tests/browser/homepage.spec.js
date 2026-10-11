const {test,expect}=require("@playwright/test");

function captureRuntimeErrors(page){
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(`console: ${message.text()}`)});
  page.on("pageerror",error=>errors.push(`page: ${error.message}`));
  return errors;
}

test.describe("homepage",()=>{
  for(const route of ["/","/zh/","/es/"]){
    test(`${route} renders without runtime or overflow errors`,async({page})=>{
      const errors=captureRuntimeErrors(page);
      const response=await page.goto(route,{waitUntil:"networkidle"});
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/NetEngineerLab/i);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("main").first()).toBeVisible();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
      expect(overflow).toBe(false);
      expect(errors).toEqual([]);
    });
  }
});

const quickIds=["fiber-loss","subnet-calculator","poe-power-budget-calculator","wifi-coverage-capacity-planner","pue-data-center-energy-efficiency","data-center-network-convergence-fabric-capacity-planner"];
for(const route of ["/","/zh/","/es/"]){
 test(route+" has six registry quick tools and truthful navigation",async({page})=>{
  await page.goto(route,{waitUntil:"networkidle"});
  const links=page.locator("[data-home-quick-grid] .open");await expect(links).toHaveCount(6);
  for(let i=0;i<6;i++){await expect(links.nth(i)).toBeVisible();const locale=route==="/"?"en":route.slice(1,-1);const tool=require("../../website/data/tools-catalog.json").find(tool=>tool.id===quickIds[i]);const suffix=locale!=="en"&&tool.translations[locale]?locale+"/":"";const href=await links.nth(i).getAttribute("href");expect(new URL(href,page.url()).pathname).toBe("/tools/"+quickIds[i]+"/"+suffix);}
  await expect(page.locator('a[href="#methods-validation"]')).toBeVisible();await expect(page.locator("#methods-validation")).toHaveCount(1);
  await expect(page.locator('[data-category-link="transport"]')).toHaveAttribute("href",/category=transport/);
  if(route==="/es/"){for(const link of await page.locator('[data-category-link]').all()){await link.scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(requestAnimationFrame));await expect(link.locator('strong')).toBeVisible();const category=await link.getAttribute('data-category-link');expect(new URL(await link.getAttribute('href'),page.url()).pathname).toBe('/tools/');expect((await link.locator('strong').innerText()).match(/English/gi)).toHaveLength(1);expect(new URL(await link.getAttribute('href'),page.url()).searchParams.get('category')).toBe(category);}}
  await page.evaluate(()=>{scrollTo(0,0)});
  for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   const positions=await page.evaluate(()=>({search:document.querySelector('.home-search').getBoundingClientRect().bottom,quick:document.querySelector('[data-home-quick-grid] .tool-card').getBoundingClientRect().bottom,overview:document.querySelector('.overview-section').getBoundingClientRect().top,quickEnd:document.querySelector('.quick-start').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   expect(positions.search).toBeLessThan(viewport.height);expect(positions.quick).toBeLessThanOrEqual(viewport.height+8);expect(positions.overview).toBeGreaterThanOrEqual(positions.quickEnd-1);expect(positions.overflow).toBe(false);
   if(route==="/"){const reject=page.locator(".nel-cookie-reject");if(await reject.isVisible())await reject.click();}if(route==="/")await page.screenshot({path:"artifacts/homepage-"+viewport.width+"x"+viewport.height+".png",fullPage:false});
  }
 });
}

for(const route of ["/","/zh/","/es/"]){test(route+" search respects locale and empty input",async({page})=>{
 await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] button').click();await page.waitForLoadState("networkidle");await expect(page).toHaveURL(new RegExp("/tools/"+(route==="/"?"":route.slice(1))+"$"));
 await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] input').fill('fiber-loss');await page.locator('[data-home-search] button').click();await expect(page).toHaveURL(new RegExp("/tools/fiber-loss/"+(route==="/"?"":route.slice(1))+"$"));
 if(route==="/es/"){await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] input').fill('data-center-network-convergence-fabric-capacity-planner');await page.locator('[data-home-search] button').click();await expect(page).toHaveURL(/\/tools\/data-center-network-convergence-fabric-capacity-planner\/$/);}
});}

for(const route of ['/tools/','/tools/zh/','/tools/es/']){test(route+' only renders translated tools',async({page,request})=>{
 await page.goto(route,{waitUntil:'networkidle'});const links=page.locator('[data-tool-grid] .open');const locale=route==='/tools/'?'en':route.split('/')[2];const inventory=require('../../website/data/tools-catalog.json').filter(tool=>tool.status==='active'&&tool.translations[locale]);await expect(links).toHaveCount(inventory.length);for(const count of await page.locator('[data-tool-count]').all())await expect(count).toHaveText(String(inventory.length));for(const count of await page.locator('[data-category-count]').all()){const category=await count.getAttribute('data-category-count');await expect(count).toHaveText(String(category==='all'?inventory.length:inventory.filter(tool=>tool.category===category).length));}for(const href of await links.evaluateAll(nodes=>nodes.map(node=>node.href))){const response=await request.get(href);expect(response.status()).toBe(200);}
});}
