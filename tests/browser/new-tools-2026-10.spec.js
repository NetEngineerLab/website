const {test,expect}=require("@playwright/test");

const cases=[
  ["chromatic-dispersion-calculator","#residualCd","1396.8 ps/nm","#maxLength","91.63 km"],
  ["pmd-budget-calculator","#meanDgd","1.800 ps","#allowedDgd","9.70 ps"],
  ["ethernet-serialization-delay-calculator","#perHop","1.214 µs","#totalDelay","3.643 µs"],
  ["stp-path-cost-calculator","#totalA","4,000","#totalB","20,000"],
  ["all-reduce-traffic-estimator","#perRank","24.500 GB","#fabricTraffic","196.000 GB"]
];

async function expectQuantity(page, selector, labeled){
  const node=page.locator(selector);
  const parts=await node.evaluate(element=>{
    const host=element.closest("strong")||element;
    const small=[...host.children].find(child=>child.tagName==="SMALL");
    if(!small) return null;
    const owner=element===host?host:element;
    return {
      number:[...owner.childNodes].filter(child=>child.nodeType===3).map(child=>child.textContent).join("").trim(),
      unit:small.textContent.trim()
    };
  });
  if(!parts){
    await expect(node).toHaveText(labeled);
    return;
  }
  const match=/^([\d.,]+)\s+(.+)$/.exec(labeled);
  expect(parts.number, selector).toBe(match[1]);
  expect(parts.unit, selector).toBe(match[2]);
}

function watchPage(page){
  const errors=[];
  const failed=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
  page.on("pageerror",error=>errors.push(error.message));
  page.on("response",response=>{if(response.status()>=400)failed.push(`${response.status()} ${response.url()}`);});
  return {errors,failed};
}

for(const [slug,firstId,firstValue,secondId,secondValue] of cases){
  for(const folder of ["","zh/","es/"]){
    test(`${slug} default reference case ${folder||"en/"}`,async({page})=>{
      const {errors,failed}=watchPage(page);
      const route=`/tools/${slug}/${folder}`;
      const response=await page.goto(route,{waitUntil:"networkidle"});
      expect(response?.status(),route).toBe(200);
      await expectQuantity(page, firstId, firstValue);
      await expectQuantity(page, secondId, secondValue);
      await expect(page.locator("#validationMessage")).toHaveText("");
      expect(failed,route).toEqual([]);
      expect(errors,route).toEqual([]);
    });
  }
}

test("invalid input clears results and shows a message",async({page})=>{
  await page.goto("/tools/ethernet-serialization-delay-calculator/",{waitUntil:"networkidle"});
  await page.locator("#frameBytes").fill("10");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#perHop")).toHaveText("—");
  await expect(page.locator("#validationMessage")).not.toHaveText("");
});

test("STP short method rejects speeds above 10G",async({page})=>{
  await page.goto("/tools/stp-path-cost-calculator/",{waitUntil:"networkidle"});
  await page.locator("#method").selectOption("short");
  await page.locator("#pathA").fill("100000");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#totalA")).toHaveText("—");
  await expect(page.locator("#validationMessage")).toContainText("10000");
});

test("chromatic dispersion datasheet mode uses the manual coefficient",async({page})=>{
  await page.goto("/tools/chromatic-dispersion-calculator/",{waitUntil:"networkidle"});
  await page.locator("#mode").selectOption("manual");
  await page.locator("#manualD").fill("4.5");
  await page.locator("#lengthKm").fill("100");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#fiberCd")).toHaveText("450.0 ps/nm");
  await expect(page.locator("#wavelength")).toBeHidden();
});
