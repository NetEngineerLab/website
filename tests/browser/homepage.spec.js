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

const featuredIds=["fiber-loss","subnet-calculator","poe-power-budget-calculator","pue-data-center-energy-efficiency"];
for(const route of ["/","/zh/","/es/"]){
 test(route+" has the specialty entry tools and truthful navigation",async({page})=>{
  await page.goto(route,{waitUntil:"networkidle"});
  const locale=route==="/"?"en":route.slice(1,-1);
  const prefix=locale==="en"?"":"../";
  for(const id of featuredIds){
   const tool=require("../../website/data/tools-catalog.json").find(tool=>tool.id===id);
   const suffix=locale!=="en"&&tool.translations[locale]?locale+"/":"";
   const link=page.locator(`#find a.hf-tool[href$="tools/${id}/${suffix}"]`);
   await expect(link).toHaveCount(1);
   await link.scrollIntoViewIfNeeded();
   await expect(link).toBeVisible();
   expect(new URL(await link.getAttribute("href"),page.url()).pathname).toBe(`/tools/${id}/${suffix}`);
  }
  await expect(page.locator("#steps h2")).toBeVisible();
  await expect(page.locator("#read h2")).toBeVisible();
  await expect(page.locator('[data-category-link="transport"]')).toHaveAttribute("href",/category=transport/);
  const categories=await page.locator("[data-category-link]").evaluateAll(nodes=>nodes.map(node=>({category:node.getAttribute("data-category-link"),title:node.querySelector("strong").textContent.replace(/\s+/g," ").trim(),href:node.getAttribute("href")})));
  expect(categories.map(item=>item.category)).toEqual(["optical","pon","maintenance","network","wireless","power","transport","operations"]);
  const directory=locale==="en"?"/tools/":`/tools/${locale}/`;
  const spanishCategoryTitles={optical:"Óptica",pon:"PON",maintenance:"Mantenimiento",network:"Redes IP",wireless:"Radio",power:"Energía",transport:"Transmisión",operations:"Operación"};
  for(const item of categories){
   const url=new URL(item.href,page.url());
   expect(url.pathname,item.category).toBe(directory);
   expect(url.searchParams.get("category"),item.category).toBe(item.category);
   if(route==="/es/")expect(item.title,item.category).toBe(spanishCategoryTitles[item.category]);
  }
  await page.evaluate(()=>{scrollTo(0,0)});
  for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   const positions=await page.evaluate(()=>({search:document.querySelector("[data-home-search]").getBoundingClientRect().bottom,quick:document.querySelector(".hf-chips a").getBoundingClientRect().bottom,grid:document.querySelector("#find").getBoundingClientRect().top,heroEnd:document.querySelector(".hf-hero").getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   expect(positions.search).toBeLessThan(viewport.height);expect(positions.quick).toBeLessThanOrEqual(viewport.height+8);expect(positions.grid).toBeGreaterThanOrEqual(positions.heroEnd-1);expect(positions.overflow).toBe(false);
   if(route==="/"){const reject=page.locator(".nel-cookie-reject");if(await reject.isVisible())await reject.click();}if(route==="/")await page.screenshot({path:"artifacts/homepage-"+viewport.width+"x"+viewport.height+".png",fullPage:false});
  }
 });
}

for(const route of ["/","/zh/","/es/"]){test(route+" search respects locale and empty input",async({page})=>{
 await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] button').click();await page.waitForLoadState("networkidle");await expect(page).toHaveURL(new RegExp("/tools/"+(route==="/"?"":route.slice(1))+"$"));
 await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] input').fill('fiber-loss');await page.locator('[data-home-search] button').click();await expect(page).toHaveURL(new RegExp("/tools/fiber-loss/"+(route==="/"?"":route.slice(1))+"$"));
 if(route==="/es/"){await page.goto(route,{waitUntil:"networkidle"});await page.locator('[data-home-search] input').fill('data-center-network-convergence-fabric-capacity-planner');await page.locator('[data-home-search] button').click();await expect(page).toHaveURL(/\/tools\/data-center-network-convergence-fabric-capacity-planner\/es\/$/);}
});}

for(const route of ['/tools/','/tools/zh/','/tools/es/']){test(route+' only renders translated tools',async({page,request})=>{
 await page.goto(route,{waitUntil:'networkidle'});const links=page.locator('[data-tool-grid] .open');const locale=route==='/tools/'?'en':route.split('/')[2];const inventory=require('../../website/data/tools-catalog.json').filter(tool=>tool.status==='active'&&tool.translations[locale]);await expect(links).toHaveCount(inventory.length);for(const count of await page.locator('[data-tool-count]').all())await expect(count).toHaveText(String(inventory.length));for(const count of await page.locator('[data-category-count]').all()){const category=await count.getAttribute('data-category-count');await expect(count).toHaveText(String(category==='all'?inventory.length:inventory.filter(tool=>tool.category===category).length));}for(const href of await links.evaluateAll(nodes=>nodes.map(node=>node.href))){const response=await request.get(href);expect(response.status()).toBe(200);}
});}
