const {test,expect}=require("@playwright/test");
const fs=require("fs");const path=require("path");

const slugs=["fiber-loss","subnet-calculator","poe-power-budget-calculator"];
// Locale-independent output ids per tool; PoE "required" uses locale grouping so it is checked on en only.
const LOCALE_SAFE={"fiber-loss":["designLoss","budgetRemaining","estimatedRxPower"],"subnet-calculator":["ipv4Cidr","ipv4Broadcast"],"poe-power-budget-calculator":["maximum"]};
const EN_ONLY={"poe-power-budget-calculator":["required"]};

for(const slug of slugs){
  const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,"../../website/tools",slug,"docs/scenarios-fixtures.json"),"utf8"));
  for(const folder of ["","zh/","es/"]){
    test(`${slug} scenarios block ${folder||"en/"}`,async({page})=>{
      await page.goto(`/tools/${slug}/${folder}`,{waitUntil:"networkidle"});
      await expect(page.locator("#scenarios .nel-scenario-card")).toHaveCount(fixtures.length);
      await expect(page.locator("#standards .nel-standards-list li").first()).toBeVisible();
    });
    for(const f of fixtures){
      test(`${slug} scenario ${f.id} ${folder||"en/"}`,async({page})=>{
        const errors=[];
        page.on("pageerror",error=>errors.push(error.message));
        const response=await page.goto(`/tools/${slug}/${folder}?scenario=${f.id}#calculator`,{waitUntil:"networkidle"});
        expect(response.status()).toBe(200);
        const ids=[...LOCALE_SAFE[slug],...(folder===""?(EN_ONLY[slug]||[]):[])];
        for(const id of ids)await expect(page.locator(`#${id}`)).toHaveText(f.checks[id]);
        await expect(page.locator(`[data-scenario-id="${f.id}"]`)).toHaveAttribute("aria-current","true");
        expect(errors).toEqual([]);
      });
    }
  }
}
