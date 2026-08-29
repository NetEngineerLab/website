const {test,expect}=require("@playwright/test");
const catalog=require("../../website/data/tools-catalog.json");

const tools=catalog.filter(tool=>tool.status==="active");
const calculationOutputs={
  "fiber-loss":["#designLoss","0.00"],
  "optical-power-budget":["#remainingBudget","0.00"],
  "pon-splitter-loss":["#remaining","0.00"],
  "onu-rx-power":["#measuredResult","0.00"],
  "pon-distance":["#effectiveMax","0.00"],
  "otdr-event":["#eventCount","0"],
  "mtu-calculator":["#statusBadge","—"],
  "subnet-calculator":["#ipv4Network",""],
  "bandwidth-calculator":["#transferHeadline","—"],
  "48v-battery-runtime":["#simpleRuntime","—"],
  "ipv6-nat-planner":["#v6ChildCount","—"],
  "wifi-coverage-capacity-planner":["#coverageApCount","—"],
  "poe-power-budget-calculator":["#required","—"],
  "sfp-qsfp-compatibility-calculator":["#rxPower","—"],
  "wireless-link-budget-calculator":["#status","—"],
  "poe-voltage-drop-calculator":["#status","—"],
  "network-rack-power-cooling-calculator":["#status","—"],
  "vlan-ip-capacity-planner":["#status","—"],
  "switch-uplink-oversubscription-calculator":["#status","—"],
  "dns-ttl-propagation-calculator":["#status","—"]
};

function captureRuntimeErrors(page){
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(`console: ${message.text()}`)});
  page.on("pageerror",error=>errors.push(`page: ${error.message}`));
  return errors;
}

function sourceCanonical(html){
  const tag=[...html.matchAll(/<link\b[^>]*>/gi)].map(match=>match[0]).find(value=>/\brel=["']canonical["']/i.test(value));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1]??null;
}

test.describe("all configured tools",()=>{
  for(const tool of tools){
    for(const locale of ["en","zh"]){
      const route=`/tools/${tool.id}/${locale==="zh"?"zh/":""}`;
      test(`${tool.id} ${locale}`,async({page,request})=>{
        const errors=captureRuntimeErrors(page);
        const expectedCanonical=`https://netengineerlab.com${route}`;
        const sourceResponse=await request.get(route);
        expect(sourceResponse.status()).toBe(200);
        expect(sourceCanonical(await sourceResponse.text())).toBe(expectedCanonical);
        const response=await page.goto(route,{waitUntil:"networkidle"});
        expect(response?.status()).toBe(200);
        await expect(page.locator("main").first()).toBeVisible();
        expect((await page.title()).trim().length).toBeGreaterThan(10);
        expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(expectedCanonical);
        expect((await page.locator("body").innerText()).length).toBeGreaterThan(200);
        if(tool.id==="vlan-ip-capacity-planner"){
          await expect(page.locator(".content details")).toHaveCount(5);
          await expect(page.locator('.content a[href="https://www.rfc-editor.org/rfc/rfc1918.html"]')).toBeVisible();
          await expect(page.locator('.content a[href="https://www.rfc-editor.org/rfc/rfc4632.html"]')).toBeVisible();
          await expect(page.locator('.content a[href="https://www.rfc-editor.org/rfc/rfc3021.html"]')).toBeVisible();
          const faqMatchesVisible=await page.evaluate(()=>{
            const schema=JSON.parse(document.querySelector('script[data-nel-schema="faq"]')?.textContent||"null");
            const visible=[...document.querySelectorAll(".content details")].map(item=>({
              question:item.querySelector("summary")?.textContent.trim(),
              answer:item.querySelector("p")?.textContent.trim()
            }));
            return schema?.mainEntity?.length===visible.length&&schema.mainEntity.every(entity=>visible.some(item=>
              item.question===entity.name&&item.answer===entity.acceptedAnswer?.text
            ));
          });
          expect(faqMatchesVisible).toBe(true);
        }
        const engineLoaded=await page.evaluate(()=>performance.getEntriesByType("resource").some(entry=>/\/js\/engine\.js(?:\?|$)/.test(entry.name)));
        expect(engineLoaded).toBe(true);
        const calculationOutput=calculationOutputs[tool.id];
        expect(calculationOutput,`${tool.id} must declare a calculation output`).toBeTruthy();
        const calculate=page.locator("#calculateBtn, #calculate, #analyzeBtn, button.primary-action, button[type=submit]").first();
        if(await calculate.count())await calculate.click();
        const output=page.locator(calculationOutput[0]);
        await expect(output).toBeVisible();
        await expect.poll(async()=>(await output.textContent())?.trim()??"").not.toBe(calculationOutput[1]);
        await expect(page.locator("#error")).toBeHidden();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
        expect(overflow).toBe(false);
        expect(errors).toEqual([]);
      });
    }
  }
});
