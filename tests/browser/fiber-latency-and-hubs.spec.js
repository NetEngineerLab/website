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

for (const [locale, route] of calculatorLocales) {
  test(`invalid fiber latency input clears the previous result ${locale}`, async ({page}) => {
    const {errors, failed} = watchPage(page);
    await page.goto(route, {waitUntil: "networkidle"});
    await page.locator("#serializationHops").fill("0");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#oneWay")).toHaveText("489.67 µs");
    await expect(page.locator("#copyBtn")).toBeEnabled();
    await expect(page.locator("#saveBtn")).toBeEnabled();
    await expect(page.locator("#csvBtn")).toBeEnabled();
    await page.locator("#distance").fill("-50");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#oneWay")).toHaveText("—");
    await expect(page.locator("#rtt")).toHaveText("—");
    await expect(page.locator("#mbar-val")).toHaveText("—");
    await expect(page.locator("#validationMessage")).not.toHaveText("");
    await expect(page.locator("#distance")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#copyBtn")).toBeDisabled();
    await expect(page.locator("#saveBtn")).toBeDisabled();
    await expect(page.locator("#csvBtn")).toBeDisabled();
    await expect(page.locator("#printBtn")).toBeEnabled();
    await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });
    await page.locator("#printBtn").click();
    expect(await page.evaluate(() => window.__printed)).toBe(1);
    await page.locator("#resetBtn").click();
    await expect(page.locator("#copyBtn")).toBeEnabled();
    await expect(page.locator("#saveBtn")).toBeEnabled();
    await expect(page.locator("#csvBtn")).toBeEnabled();
    for (const [id, value] of Object.entries({
      projectName: {en:"DCI Fiber Link", zh:"DCI 光纤链路", es:"Enlace de fibra DCI"}[locale],
      distance:"100", distanceUnit:"km", routeFactor:"1.0", groupIndexPreset:"1.468", groupIndex:"1.468",
      equipmentCount:"0", equipmentDelay:"0", packetSize:"1500", linkRate:"10", serializationHops:"1"
    })) await expect(page.locator("#" + id)).toHaveValue(value);
    await expect(page.locator("#validationMessage")).toHaveText("");
    expect(failed).toEqual([]);
    expect(errors).toEqual([]);
  });
}

const csvHeaders = {
  en: ["Field","Value","Unit"],
  zh: ["字段","数值","单位"],
  es: ["Campo","Valor","Unidad"],
};
const csvFields = {
  en: ["Project","Route distance","Distance unit","Route factor","Group index preset","Group index n_g","Active devices","Delay per device","Packet size","Line rate","Store-and-forward hops","Fiber length","Propagation","Equipment","Serialization","One-way latency","Round-trip time","Propagation per km","Speed in fiber","Fraction of c","Delay versus vacuum","Fiber","Vacuum / free-space laser","Microwave / radio in air","Hollow-core fiber","Copper twisted pair (NVP 0.70)","Copper twisted pair (NVP 0.65)"],
  zh: ["项目","路由距离","距离单位","路由系数","群折射率预设","群折射率 n_g","路径中的有源设备","单台时延","报文长度","线路速率","存储转发跳数","纤长","传播时延","设备时延","串行化时延","单向时延","往返时间","每公里传播时延","光纤中的速度","相对光速","相对真空的时延增幅","光纤","真空 / 自由空间激光","空气中的微波 / 无线","空芯光纤","铜双绞线（NVP 0.70）","铜双绞线（NVP 0.65）"],
  es: ["Proyecto","Distancia de ruta","Unidad de distancia","Factor de ruta","Preajuste del índice de grupo","Índice de grupo n_g","Dispositivos activos","Retardo por dispositivo","Tamaño de paquete","Velocidad de línea","Saltos de almacenamiento y reenvío","Longitud de fibra","Propagación","Equipos","Serialización","Latencia de ida","Tiempo de ida y vuelta","Propagación por km","Velocidad en la fibra","Fracción de c","Retardo frente al vacío","Fibra","Vacío / láser en espacio libre","Microondas / radio en aire","Fibra de núcleo hueco","Par trenzado de cobre (NVP 0,70)","Par trenzado de cobre (NVP 0,65)"],
};

function parseCsv(text){
  const src = String(text).replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i += 1){
    const ch = src[i];
    if (quoted){
      if (ch === "\""){
        if (src[i + 1] === "\""){ cell += "\""; i += 1; }
        else quoted = false;
      } else cell += ch;
    } else if (ch === "\"") quoted = true;
    else if (ch === ","){ row.push(cell); cell = ""; }
    else if (ch === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length){ row.push(cell); rows.push(row); }
  return rows;
}

async function clickVisiblePreset(page, preset){
  const wide = await page.evaluate(() => window.innerWidth > 960);
  const selector = wide
    ? `.scenario-card[data-preset='${preset}']`
    : `.presets-mobile [data-preset='${preset}']`;
  await page.locator(selector).click();
}

for (const [locale, route] of calculatorLocales) {
  test(`fiber latency preset edit, share, csv, copy and save restore ${locale}`, async ({page}) => {
    const {errors, failed} = watchPage(page);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(route, {waitUntil: "networkidle"});
    await page.locator("#groupIndex").fill("1.55");
    await expect(page.locator("#groupIndexPreset")).toHaveValue("custom");
    await expect(page.locator(".scenario-card[data-preset='custom']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".presets-mobile [data-preset='custom']")).toHaveAttribute("aria-pressed", "true");
    await clickVisiblePreset(page, "1.4677");
    await expect(page.locator("#groupIndex")).toHaveValue("1.4677");
    await expect(page.locator("#groupIndexPreset")).toHaveValue("1.4677");
    await expect(page.locator(".scenario-card[data-preset='1.4677']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".presets-mobile [data-preset='1.4677']")).toHaveAttribute("aria-pressed", "true");
    await clickVisiblePreset(page, "custom");
    await expect(page.locator("#groupIndex")).toHaveValue("1.4677");
    await expect(page.locator("#groupIndexPreset")).toHaveValue("custom");
    await expect(page.locator(".scenario-card[data-preset='custom']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".presets-mobile [data-preset='custom']")).toHaveAttribute("aria-pressed", "true");
    const originalViewport = page.viewportSize();
    await page.setViewportSize({width: 390, height: 900});
    await page.locator(".presets-mobile [data-preset='1.003']").click();
    await expect(page.locator("#groupIndex")).toHaveValue("1.003");
    await expect(page.locator("#groupIndexPreset")).toHaveValue("1.003");
    await expect(page.locator(".scenario-card[data-preset='1.003']")).toHaveAttribute("aria-pressed", "true");
    await page.locator(".presets-mobile [data-preset='custom']").click();
    await expect(page.locator("#groupIndex")).toHaveValue("1.003");
    await expect(page.locator("#groupIndexPreset")).toHaveValue("custom");
    await page.setViewportSize(originalViewport);
    await page.locator("#groupIndexPreset").selectOption("1.003");
    await expect(page.locator("#groupIndex")).toHaveValue("1.003");
    await page.locator("#groupIndex").fill("1.61");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#groupIndex")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#copyBtn")).toBeDisabled();
    await page.locator("#groupIndex").fill("1.6");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#groupIndex")).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator("#copyBtn")).toBeEnabled();

    const project = "West, \"A\" line";
    await page.locator("#projectName").fill(project);
    const newlineCell = await page.evaluate((value) => window.NELFiberLatency.csvCell(value), "West, \"A\"\nline");
    expect(newlineCell).toBe("\"West, \"\"A\"\"\nline\"");
    await page.locator("#distance").fill("80");
    await page.locator("#distanceUnit").selectOption("km");
    await page.locator("#routeFactor").fill("1");
    await page.locator("#groupIndexPreset").selectOption("1.468");
    await page.locator("#equipmentCount").fill("2");
    await page.locator("#equipmentDelay").fill("5");
    await page.locator("#packetSize").fill("1500");
    await page.locator("#linkRate").fill("10");
    await page.locator("#serializationHops").fill("1");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#oneWay")).toHaveText("402.94 µs");
    await expect(page.locator("#rtt")).toHaveText("805.88 µs");

    await page.locator("#copyBtn").click();
    await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText())).toContain("402.94 µs");

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#csvBtn").click();
    const download = await downloadPromise;
    const raw = require("fs").readFileSync(await download.path(), "utf8");
    const rows = parseCsv(raw);
    const table = Object.fromEntries(rows.slice(1).map((row) => [row[0], row.slice(1)]));
    expect(rows[0]).toEqual(csvHeaders[locale]);
    expect(rows).toHaveLength(csvFields[locale].length + 1);
    for (const row of rows) expect(row).toHaveLength(3);
    expect(rows.slice(1).map(([field]) => field)).toEqual(csvFields[locale]);
    const field = name => table[csvFields[locale][csvFields.en.indexOf(name)]];
    expect(field("Project")[0]).toBe(project);
    expect(field("Route distance")).toEqual(["80", "km"]);
    expect(field("Distance unit")[0]).toBe("km");
    expect(field("Route factor")[0]).toBe("1");
    expect(field("Group index n_g")[0]).toBe("1.468");
    expect(field("Active devices")[0]).toBe("2");
    expect(field("Delay per device")).toEqual(["5", "µs"]);
    expect(field("Packet size")).toEqual(["1500", "B"]);
    expect(field("Line rate")).toEqual(["10", "Gbps"]);
    expect(field("Store-and-forward hops")[0]).toBe("1");
    expect(field("One-way latency")[0]).toBe("402.94 µs");
    expect(field("Round-trip time")[0]).toBe("805.88 µs");
    expect(field("Fiber")[1]).toBe("µs/km");
    expect(raw).toContain("\"West, \"\"A\"\" line\"");

    await page.locator("#saveBtn").click();
    await page.locator("#resetBtn").click();
    await expect(page.locator("#distance")).toHaveValue("100");
    await page.locator("#historyList .history-item").first().click();
    await expect(page.locator("#projectName")).toHaveValue(project);
    await expect(page.locator("#distance")).toHaveValue("80");
    await expect(page.locator("#equipmentCount")).toHaveValue("2");
    await expect(page.locator("#oneWay")).toHaveText("402.94 µs");

    if (originalViewport.width <= 640) await page.setViewportSize({width: 1280, height: 900});
    await page.locator("#btn-share").click();
    const shared = new URL(await page.evaluate(() => location.href));
    expect(shared.searchParams.get("project")).toBe(project);
    expect(shared.searchParams.get("distance")).toBe("80");
    expect(shared.searchParams.get("unit")).toBe("km");
    expect(shared.searchParams.get("factor")).toBe("1");
    expect(shared.searchParams.get("ng")).toBe("1.468");
    expect(shared.searchParams.get("preset")).toBe("1.468");
    expect(shared.searchParams.get("devices")).toBe("2");
    expect(shared.searchParams.get("delay")).toBe("5");
    expect(shared.searchParams.get("bytes")).toBe("1500");
    expect(shared.searchParams.get("rate")).toBe("10");
    expect(shared.searchParams.get("hops")).toBe("1");
    expect(shared.hash).toBe("#result");
    await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText())).toBe(shared.href);
    const reopened = await page.context().newPage();
    const reopenEvents = watchPage(reopened);
    const response = await reopened.goto(shared.href, {waitUntil: "domcontentloaded"});
    expect(response?.status()).toBe(200);
    await expect(reopened.locator("#oneWay")).toHaveText("402.94 µs");
    await expect(reopened.locator("#projectName")).toHaveValue(project);
    await expect(reopened.locator("#distance")).toHaveValue("80");
    await expect(reopened.locator("#distanceUnit")).toHaveValue("km");
    await expect(reopened.locator("#routeFactor")).toHaveValue("1");
    await expect(reopened.locator("#groupIndex")).toHaveValue("1.468");
    await expect(reopened.locator("#groupIndexPreset")).toHaveValue("1.468");
    await expect(reopened.locator(".scenario-card[data-preset='1.468']")).toHaveAttribute("aria-pressed", "true");
    await expect(reopened.locator("#equipmentCount")).toHaveValue("2");
    await expect(reopened.locator("#equipmentDelay")).toHaveValue("5");
    await expect(reopened.locator("#packetSize")).toHaveValue("1500");
    await expect(reopened.locator("#linkRate")).toHaveValue("10");
    await expect(reopened.locator("#serializationHops")).toHaveValue("1");
    await expect(reopened.locator("#rtt")).toHaveText("805.88 µs");
    expect(reopenEvents.failed).toEqual([]);
    expect(reopenEvents.errors).toEqual([]);
    expect(failed).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const [locale, route] of calculatorLocales) {
  test(`fiber latency long-haul regression ${locale}`, async ({page}) => {
    await page.goto(route, {waitUntil: "networkidle"});
    await page.locator("#distance").fill("1000");
    await page.locator("#routeFactor").fill("1.3");
    await page.locator("#groupIndexPreset").selectOption("1.468");
    await page.locator("#equipmentCount").fill("0");
    await page.locator("#equipmentDelay").fill("0");
    await page.locator("#serializationHops").fill("0");
    await page.locator("#calculateBtn").click();
    await expect(page.locator("#oneWay")).toHaveText("6.366 ms");
    await expect(page.locator("#rtt")).toHaveText("12.731 ms");
  });
}

for (const [locale, route, shareLabel, opticalPath, opticalName] of [
  ["en", "/tools/fiber-latency-calculator/", "Share inputs", "/topics/pon-optical/", "Optical"],
  ["zh", "/tools/fiber-latency-calculator/zh/", "分享输入", "/zh/topics/pon-optical/", "光网络"],
  ["es", "/tools/fiber-latency-calculator/es/", "Compartir entradas", "/topics/pon-optical/", "Óptica"]
]){
  test(`fiber latency OPB actions ${locale}`, async ({page}) => {
    await page.goto(route, {waitUntil: "networkidle"});
    await expect(page.locator("#btn-share")).toHaveText(shareLabel);
    const crumb = page.locator(".crumbs a", {hasText: opticalName});
    await expect(crumb).toHaveText(opticalName);
    await expect(crumb).toBeVisible();
    const resolved = await crumb.evaluate((el) => new URL(el.getAttribute("href"), location.href).pathname);
    expect(resolved).toBe(opticalPath);
    await expect(page.locator("#csvBtn")).toBeEnabled();
    await expect(page.locator("#printBtn")).toBeEnabled();
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", `https://netengineerlab.com${route}`);
  });
}

const viewports = [320, 375, 390, 640, 641, 768, 960, 961, 1440];
for (const [locale, route] of calculatorLocales){
  for (const width of viewports){
    test(`fiber latency viewport ${locale} ${width}`, async ({page}, testInfo) => {
      const dir = process.env.FIBER_LATENCY_SHOTS || testInfo.outputDir;
      require("fs").mkdirSync(dir, {recursive: true});
      await page.setViewportSize({width, height: 900});
      await page.goto(route, {waitUntil: "networkidle"});
      await page.waitForFunction(() => [...document.styleSheets].some((sheet) => (sheet.href || "").includes("fb-v3.css")));
      await expect(page.locator("#oneWay")).not.toHaveText("—");
      expect(await page.evaluate(() => window.innerWidth)).toBe(width);
      const columns = await page.locator(".ro-acts").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(columns).toBe(width <= 640 ? 2 : 4);
      const actions = page.locator(".ro-acts button");
      await expect(actions).toHaveCount(4);
      expect(await actions.evaluateAll(buttons => buttons.map(button => button.id))).toEqual(["copyBtn", "saveBtn", "csvBtn", "printBtn"]);
      for (const button of await actions.all()){
        const rect = await button.boundingBox();
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(width + 1);
      }
      await expect(page.locator(".presets-mobile")).toHaveCount(1);
      if (width <= 960) await expect(page.locator(".presets-mobile")).toBeVisible();
      else await expect(page.locator(".presets-mobile")).toBeHidden();
      if (width > 960) await expect(page.locator(".latency-presets .scenario-grid")).toBeVisible();
      else await expect(page.locator(".latency-presets .scenario-grid")).toBeHidden();
      if (width <= 640) await expect(page.locator("#btn-share")).toBeHidden();
      else await expect(page.locator("#btn-share")).toBeVisible();
      await expect(page.locator("#copyBtn")).toBeVisible();
      await expect(page.locator("#saveBtn")).toBeVisible();
      await expect(page.locator("#csvBtn")).toBeVisible();
      await expect(page.locator("#printBtn")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow, `${locale} ${width}`).toBe(false);
      await page.screenshot({path: `${dir}/${testInfo.project.name}-${locale}-${width}.png`});
      const opbRoute = route.replace("fiber-latency-calculator", "optical-power-budget");
      await page.goto(opbRoute, {waitUntil: "networkidle"});
      const baselineColumns = await page.locator(".ro-acts").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(columns).toBe(baselineColumns);
      await testInfo.attach("result-action-columns", {body: JSON.stringify({locale, width, columns, baselineColumns}), contentType: "application/json"});
    });
  }
}

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
