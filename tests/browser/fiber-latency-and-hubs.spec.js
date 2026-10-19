const {test,expect}=require("@playwright/test");

const calculatorLocales=[
  ["en","/tools/fiber-latency-calculator/"],
  ["zh","/tools/fiber-latency-calculator/zh/"],
  ["es","/tools/fiber-latency-calculator/es/"]
];
const hubSlugs=[
  "pon-fiber-calculators",
  "switching-bandwidth-calculators",
  "datacenter-power-calculators"
];
const hubLocales=["","zh/","es/"];

function watchPage(page){
  const errors=[];
  const failed=[];
  page.on("console",message=>{
    if(message.type()==="error")errors.push(message.text());
  });
  page.on("pageerror",error=>errors.push(error.message));
  page.on("requestfailed",request=>{
    const failure=request.failure();
    if(failure&&/ERR_ABORTED/.test(failure.errorText||""))return;
    failed.push(`${request.method()} ${request.url()} ${failure?.errorText||"failed"}`);
  });
  page.on("response",response=>{
    if(response.status()>=400)failed.push(`${response.status()} ${response.url()}`);
  });
  return {errors,failed};
}

for(const [locale,route] of calculatorLocales){
  test(`fiber latency reference case ${locale}`,async({page})=>{
    const {errors,failed}=watchPage(page);
    const response=await page.goto(route,{waitUntil:"networkidle"});
    expect(response?.status(),route).toBe(200);
    await expect(page.locator("#distance")).toHaveValue("100");
    await expect(page.locator("#distanceUnit")).toHaveValue("km");
    await expect(page.locator("#routeFactor")).toHaveValue("1.0");
    await expect(page.locator("#groupIndex")).toHaveValue("1.468");
    await expect(page.locator("#equipmentCount")).toHaveValue("0");
    // The published form default includes one 1500-byte hop (+1.2 µs).
    // The 100 km reference row is propagation only.
    await page.locator("#serializationHops").fill("0");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#oneWay")).toHaveText("489.67 µs");
    await expect(page.locator("#rtt")).toHaveText("979.34 µs");
    await expect(page.locator("#validationMessage")).toHaveText("");
    expect(failed,route).toEqual([]);
    expect(errors,route).toEqual([]);
  });
}

test("invalid fiber latency input clears the previous result", async ({page}) => {
  const {errors, failed} = watchPage(page);
  await page.goto("/tools/fiber-latency-calculator/", {waitUntil: "networkidle"});
  await page.locator("#serializationHops").fill("0");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#oneWay")).toHaveText("489.67 µs");
  await page.locator("#distance").fill("-50");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#oneWay")).toHaveText("—");
  await expect(page.locator("#rtt")).toHaveText("—");
  await expect(page.locator("#validationMessage")).not.toHaveText("");
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});

test("invalid fiber loss input clears the previous result", async ({page}) => {
  await page.goto("/tools/fiber-loss/", {waitUntil: "networkidle"});
  await page.locator("#calculateBtn").click();
  const before = await page.locator("#designLoss").innerText();
  expect(before).not.toBe("—");
  await page.locator("#distance").fill("-5");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#designLoss")).toHaveText("—");
  await expect(page.locator("#fiberLoss")).toHaveText("—");
});

for(const slug of hubSlugs){
  for(const locale of hubLocales){
    const route=`/tools/${slug}/${locale}`;
    test(`${slug} ${locale||"en"} links resolve`,async({page,request})=>{
      const {errors,failed}=watchPage(page);
      const response=await page.goto(route,{waitUntil:"networkidle"});
      expect(response?.status(),route).toBe(200);
      const cards=page.locator("a.hub-tool-card");
      const workflow=page.locator("ol.hub-workflow a");
      expect(await cards.count()).toBeGreaterThan(0);
      expect(await workflow.count()).toBe(await cards.count());
      const hrefs=await page.locator("a.hub-tool-card, ol.hub-workflow a").evaluateAll(nodes=>[...new Set(nodes.map(node=>node.getAttribute("href")).filter(Boolean))]);
      expect(hrefs.length).toBeGreaterThan(0);
      for(const href of hrefs){
        const target=new URL(href,page.url());
        expect(target.origin,href).toBe(new URL(page.url()).origin);
        const linked=await request.get(target.pathname+target.search);
        expect(linked.status(),`${route} -> ${target.pathname}`).toBe(200);
      }
      expect(failed,route).toEqual([]);
      expect(errors,route).toEqual([]);
      const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href") || ""));
      expect(styles.some(href => href.includes("site.css")), route).toBe(true);
      const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
      expect(font.toLowerCase(), route).not.toContain("times");
    });
  }
}
