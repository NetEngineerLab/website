const {test,expect}=require("@playwright/test");

// P3 items from audits/netengineerlab/PR21-22.md, checked in en/zh/es.
const BADGE={"":"✕ Outside the tolerance range","zh/":"✕ 不在容限范围内","es/":"✕ Fuera del rango de tolerancia"};
async function fill(page,id,value){await page.fill(`#${id}`,String(value));await page.locator(`#${id}`).dispatchEvent("change");}
const refsText=(page)=>page.locator("#references-title").locator("xpath=ancestor::section[1]").innerText();

for(const folder of ["","zh/","es/"]){
  const loc=folder||"en/";
  test(`P3-22a CD badge below the length window ${loc}`,async({page})=>{
    await page.goto(`/tools/chromatic-dispersion-calculator/${folder}`,{waitUntil:"networkidle"});
    await page.selectOption("#mode","manual");
    await fill(page,"manualD",17);await fill(page,"lengthKm",80);await fill(page,"compensation",2000);await fill(page,"tolerance",400);
    await expect(page.locator("#healthBadge")).toHaveText(BADGE[folder]);
  });
  test(`P3-22b/c clause numbers and IEC link ${loc}`,async({page})=>{
    await page.goto(`/tools/chromatic-dispersion-calculator/${folder}`,{waitUntil:"domcontentloaded"});
    const cd=await refsText(page);
    for(const n of ["§6.10","(6-1)","G.652.B","G.652.D","§6.5","§6.3.2.1"])expect(cd).toContain(n);
    expect(cd).not.toContain("A–D");
    expect(cd).not.toMatch(/UNVERIFIED/);
    await page.goto(`/tools/pmd-budget-calculator/${folder}`,{waitUntil:"domcontentloaded"});
    expect(await refsText(page)).toContain("§7.2");
    await expect(page.locator('a[href="https://webstore.iec.ch/en/publication/5103"]')).toHaveCount(1);
    await page.goto(`/tools/stp-path-cost-calculator/${folder}`,{waitUntil:"domcontentloaded"});
    expect(await refsText(page)).toContain("§8.10.2");
  });
  test(`P3-21a/b/c verified citations ${loc}`,async({page})=>{
    await page.goto(`/tools/fiber-loss/${folder}`,{waitUntil:"domcontentloaded"});
    const fiber=await page.locator("#standards").innerText();
    for(const n of ["A.2","V.3","52-12","52-14"])expect(fiber).toContain(n);
    expect(fiber).not.toMatch(/UNVERIFIED/);
    await page.goto(`/tools/poe-power-budget-calculator/${folder}`,{waitUntil:"domcontentloaded"});
    const poe=await page.locator("#standards").innerText();
    expect(poe).toMatch(/71[.,]3 W/);
    expect(poe).not.toMatch(/UNVERIFIED|71 W\)/);
  });
}
