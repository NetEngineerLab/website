const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(
    "http://127.0.0.1:4173/tools/telecom-solar-battery-sizing-calculator/es/",
    { waitUntil: "networkidle" }
  );

  const result = await page.evaluate(() => {
    const ids = [
      "dailyLoad","avgLoad","netEff","requiredPV","modules","stringing",
      "battery","batteryAh","pvGap","battGap","generation","annualGen",
      "coverage","balance","supplement","extraLoad","savings","payback",
      "co2","diesel"
    ];

    return ids.map(id => {
      const nodes = [...document.querySelectorAll(`[id="${id}"]`)];
      return {
        id,
        count: nodes.length,
        nodes: nodes.map((n, index) => ({
          index,
          tag: n.tagName,
          text: n.textContent,
          parentClass: n.parentElement?.className || "",
          sectionId: n.closest("section")?.id || "",
          sectionClass: n.closest("section")?.className || "",
          html: n.outerHTML.slice(0, 300)
        }))
      };
    }).filter(x => x.count > 1);
  });

  console.dir(result, { depth: null });

  const scripts = await page.evaluate(() =>
    [...document.scripts]
      .map(s => s.src || "[inline]")
  );

  console.log("\n=== PAGE SCRIPTS ===");
  console.log(scripts.join("\n"));

  await browser.close();
})();
