const {test,expect}=require("@playwright/test");
const fs=require("fs");const path=require("path");

// PON cluster one-click scenarios and toolkit links, en/zh/es.
for(const slug of ["pon-splitter-loss","onu-rx-power","pon-distance"]){
  const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,"../../website/tools",slug,"docs/scenarios-fixtures.json"),"utf8"));
  for(const folder of ["","zh/","es/"]){
    for(const f of fixtures){
      test(`${slug} scenario ${f.id} ${folder||"en/"}`,async({page})=>{
        const errors=[];page.on("pageerror",e=>errors.push(e.message));
        const response=await page.goto(`/tools/${slug}/${folder}?scenario=${f.id}#calculator`,{waitUntil:"networkidle"});
        expect(response.status()).toBe(200);
        for(const [id,value] of Object.entries(f.checks))await expect(page.locator(`#${id}`)).toHaveText(value);
        await expect(page.locator(`[data-scenario-id="${f.id}"]`)).toHaveAttribute("aria-current","true");
        expect(errors).toEqual([]);
      });
    }
  }
}
for(const slug of ["pon-splitter-loss","onu-rx-power","pon-distance","optical-power-budget","fiber-loss"]){
  for(const folder of ["","zh/","es/"]){
    test(`${slug} PON toolkit links resolve ${folder||"en/"}`,async({page,request})=>{
      await page.goto(`/tools/${slug}/${folder}`,{waitUntil:"domcontentloaded"});
      const hrefs=await page.locator("#pon-toolkit a").evaluateAll(a=>a.map(x=>x.href));
      expect(hrefs.length).toBeGreaterThanOrEqual(7);
      for(const href of hrefs)expect((await request.get(href)).status(),href).toBe(200);
    });
  }
}
