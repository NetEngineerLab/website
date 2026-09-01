const {test,expect}=require("@playwright/test");

for(const locale of ["en","zh"]){
 test(`OTDR invalidation and boundary guard ${locale}`,async({page})=>{
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`/tools/otdr-event/${locale==="zh"?"zh/":""}`,{waitUntil:"networkidle"});
  await expect(page.locator("#references")).toContainText(locale==="zh"?"复核日期：2026-09-01":"Last reviewed: 2026-09-01");
  await expect(page.locator("#eventCount")).toHaveText("5");
  await expect(page.locator("#copyBtn")).toBeEnabled();

  await page.locator('[id^="distance-"]').first().fill("");
  await expect(page.locator("#eventCount")).toHaveText("0");
  await expect(page.locator("#copyBtn")).toBeDisabled();
  await expect(page.locator("#exportBtn")).toBeDisabled();

  await page.locator("#sampleBtn").click();
  await expect(page.locator("#eventCount")).toHaveText("5");
  await page.locator("#addEventBtn").click();
  await expect(page.locator("#eventCount")).toHaveText("0");
  await expect(page.locator("#printBtn")).toBeDisabled();
  expect(errors).toEqual([]);
 });
}
