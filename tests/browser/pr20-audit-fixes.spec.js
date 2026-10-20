const {test,expect}=require("@playwright/test");

// Fixes from the PR #20 audit (CD-1, CD-2, PMD-1, ETH-1, ETH-2, AR-1, ALL-1, ALL-2), checked in en/zh/es.
const NOTES={
  "pmd-components-exceed":{"":"Components alone exceed the DGD budget","zh/":"仅器件 DGD 已超出预算","es/":"Los componentes por sí solos superan el presupuesto DGD"},
  "cd-no-length":{"":"No length fits: compensation exceeds the tolerance","zh/":"任何长度都不满足：补偿量超出容限","es/":"Ninguna longitud cumple: la compensación supera la tolerancia"}
};
const UNVERIFIED=/UNVERIFIED/;

async function fill(page,id,value){await page.fill(`#${id}`,String(value));await page.locator(`#${id}`).dispatchEvent("change");}
async function labelOf(page,id){return (await page.locator(`label[for="${id}"]`).innerText()).replace(/\s*[(（][^)）]*[)）]\s*$/,"").trim();}

for(const folder of ["","zh/","es/"]){
  const loc=folder||"en/";
  test(`CD-1/CD-2 chromatic dispersion length window and required compensation ${loc}`,async({page})=>{
    await page.goto(`/tools/chromatic-dispersion-calculator/${folder}`,{waitUntil:"networkidle"});
    await expect(page.locator("#maxLength")).toHaveText("91.63 km");
    await page.selectOption("#mode","manual");
    await fill(page,"manualD",17);await fill(page,"lengthKm",80);await fill(page,"compensation",2000);await fill(page,"tolerance",400);
    await expect(page.locator("#maxLength")).toHaveText("94.12–141.18 km");
    await fill(page,"compensation",-1000);
    await expect(page.locator("#maxLength")).toHaveText(NOTES["cd-no-length"][folder]);
    await expect(page.locator("#compensation")).toHaveAttribute("required","");
    await fill(page,"compensation","");
    const label=await labelOf(page,"compensation");
    await expect(page.locator("#validationMessage")).toContainText(label);
    await expect(page.locator("#compensation")).toHaveAttribute("aria-invalid","true");
    await expect(page.locator("#lengthKm")).toHaveAttribute("aria-invalid","false");
  });

  test(`ETH-1/ETH-2 line rate stays editable and syncs the preset ${loc}`,async({page})=>{
    await page.goto(`/tools/ethernet-serialization-delay-calculator/${folder}`,{waitUntil:"networkidle"});
    await page.selectOption("#ratePreset","1");
    await expect(page.locator("#rateGbps")).toHaveValue("1");
    expect(await page.locator("#rateGbps").evaluate(n=>n.readOnly)).toBe(false);
    await page.locator("#rateGbps").fill("7");
    await expect(page.locator("#ratePreset")).toHaveValue("custom");
    await page.locator("#rateGbps").fill("10");
    await expect(page.locator("#ratePreset")).toHaveValue("10");
    await expect(page.locator("#perHop")).toHaveText("1.214 µs");
  });

  test(`PMD-1 components-exceed note ${loc}`,async({page})=>{
    await page.goto(`/tools/pmd-budget-calculator/${folder}`,{waitUntil:"networkidle"});
    await fill(page,"componentCount",2);await fill(page,"componentPmd",8);
    await expect(page.locator("#maxLength")).toHaveText(NOTES["pmd-components-exceed"][folder]);
    await expect(page.locator("#maxLength")).not.toHaveText("0 km");
  });

  test(`AR-1 sub-MB buffer and ALL-2 named validation ${loc}`,async({page})=>{
    await page.goto(`/tools/all-reduce-traffic-estimator/${folder}`,{waitUntil:"networkidle"});
    await fill(page,"paramsBillion","0.0000001");
    await expect(page.locator("#bufferSize")).toHaveText("200 B");
    await fill(page,"ranks",1);
    await expect(page.locator("#validationMessage")).toContainText(await labelOf(page,"ranks"));
  });

  for(const [slug,field] of [["ethernet-serialization-delay-calculator","frameBytes"],["stp-path-cost-calculator","pathA"],["pmd-budget-calculator","symbolRate"]]){
    test(`ALL-2 ${slug} validation names the field ${loc}`,async({page})=>{
      await page.goto(`/tools/${slug}/${folder}`,{waitUntil:"networkidle"});
      await fill(page,field,"");
      await expect(page.locator("#validationMessage")).toContainText(await labelOf(page,field));
      await expect(page.locator(`#${field}`)).toHaveAttribute("aria-invalid","true");
    });
  }

  test(`ALL-1 references carry versions ${loc}`,async({page})=>{
    const expected={"chromatic-dispersion-calculator":["G.652 (08/2024)","G.691 (03/2006)"],"pmd-budget-calculator":["G.650.2 (08/2015)","61282-3"],"ethernet-serialization-delay-calculator":["802.3-2022","RFC 2544","1999"],"stp-path-cost-calculator":["17-3","802.1t-2001","8-5"],"all-reduce-traffic-estimator":["PERFORMANCE.md"]};
    for(const [slug,needles] of Object.entries(expected)){
      await page.goto(`/tools/${slug}/${folder}`,{waitUntil:"domcontentloaded"});
      const refs=await page.locator("#references-title").locator("xpath=ancestor::section[1]").innerText();
      for(const n of needles)expect(refs).toContain(n);
    }
    await page.goto(`/tools/chromatic-dispersion-calculator/${folder}`,{waitUntil:"domcontentloaded"});
    expect(await page.locator("#references-title").locator("xpath=ancestor::section[1]").innerText()).toMatch(UNVERIFIED);
  });
}
