const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(
    "http://127.0.0.1:4173/tools/telecom-solar-battery-sizing-calculator/es/",
    { waitUntil: "networkidle" }
  );

  const ids = [
    "dailyLoad","avgLoad","netEff","requiredPV","modules","stringing",
    "battery","batteryAh","pvGap","battGap","generation","annualGen",
    "coverage","balance","supplement","extraLoad","savings","payback",
    "co2","diesel"
  ];

  for (const id of ids) {
    const info = await page.locator(`[id="${id}"]`).evaluateAll(nodes =>
      nodes.map((n,i) => ({
        i,
        tag: n.tagName,
        text: n.textContent,
        parent: n.parentElement?.outerHTML?.slice(0,500),
        section: n.closest("section")?.outerHTML?.slice(0,800)
      }))
    );

    if (info.length > 1) {
      console.log("\n===== DUPLICATE:", id, "COUNT:", info.length, "=====");
      console.dir(info, { depth: null });
    }
  }

  console.log("\n===== SCRIPTS =====");
  console.log(
    await page.evaluate(() => [...document.scripts].map(s => s.src || "[inline]"))
  );

  await browser.close();
})();
