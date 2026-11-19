const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const tools = [
  "itu-dwdm-grid-calculator",
  "edfa-ase-osnr-estimator",
  "ethernet-line-coding-calculator",
  "tcp-mathis-throughput-estimator",
  "mm1-queue-delay-calculator",
  "path-availability-calculator",
  "dc-feeder-voltage-drop-calculator",
  "pathway-fill-calculator",
  "copper-propagation-delay-calculator",
  "shannon-capacity-calculator"
];
const locales = [
  { id: "en", prefix: "" },
  { id: "zh", prefix: "zh/" },
  { id: "es", prefix: "es/" }
];
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900, kind: "desktop" },
  { name: "desktop-1280", width: 1280, height: 800, kind: "desktop" },
  { name: "mobile-390", width: 390, height: 844, kind: "mobile" },
  { name: "mobile-320", width: 320, height: 740, kind: "mobile" }
];
const shotDir = path.resolve("reports/new-ten-tools-20261119/screenshots");
const resultFile = path.resolve("reports/new-ten-tools-20261119/browser-results.json");
fs.mkdirSync(shotDir, { recursive: true });

async function primaryNumber(page) {
  const key = await page.locator("#calculator").getAttribute("data-primary");
  return page.locator(`[data-out="${key}"] .num`);
}

async function pageHealth(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.body.querySelectorAll("*")) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.right > window.innerWidth + 2 || rect.left < -2) {
        const style = getComputedStyle(el);
        if (style.position === "fixed") continue;
        if (rect.right < 0 || rect.left > window.innerWidth) continue;
        if (el.closest(".skip, .skip-link, [hidden]")) continue;
        offenders.push({
          tag: el.tagName,
          id: el.id || "",
          className: String(el.className).slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        });
      }
    }
    const value = document.querySelector(".metric .val");
    const valueStyle = value ? getComputedStyle(value) : null;
    const toc = document.querySelector("#calculator > .below > .toc");
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      pageOverflow: doc.scrollWidth > doc.clientWidth + 1,
      offenders: offenders.slice(0, 8),
      valueColor: valueStyle && valueStyle.color,
      valueWeight: valueStyle && valueStyle.fontWeight,
      valueNowrap: valueStyle && valueStyle.whiteSpace,
      tocDisplay: toc ? getComputedStyle(toc).display : "missing",
      resultState: document.getElementById("result")?.dataset.state || "",
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || "",
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((node) => node.hreflang + " " + node.href)
    };
  });
}

test.describe.configure({ mode: "serial" });

test("ten new tools, three languages, desktop and mobile", async ({ page }) => {
  test.setTimeout(45 * 60 * 1000);
  const results = [];
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedResources.push({ url: request.url(), error: request.failure()?.errorText || "failed" });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() });
  });

  for (const tool of tools) {
    for (const locale of locales) {
      for (const viewport of viewports) {
        consoleErrors.length = 0;
        failedResources.length = 0;
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const url = `/tools/${tool}/${locale.prefix}`;
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        const value = await primaryNumber(page);
        await expect(value).not.toHaveText("—", { timeout: 10000 });
        const initial = (await value.innerText()).trim();
        const probe = page.locator("[data-probe]");
        const edit = await probe.getAttribute("data-probe-edit");
        const invalid = await probe.getAttribute("data-probe-invalid");
        await probe.fill(edit);
        await probe.dispatchEvent("input");
        await expect(value).not.toHaveText(initial);
        const edited = (await value.innerText()).trim();
        await page.getByRole("button", { name: /Reset|重置|Restablecer/ }).click();
        await expect(value).toHaveText(initial);
        await probe.fill(invalid);
        await probe.dispatchEvent("input");
        await expect(page.locator("#result")).toHaveAttribute("data-state", "invalid");
        await expect(value).toHaveText("—");
        await expect(page.locator("#validation")).not.toBeEmpty();
        await page.getByRole("button", { name: /Reset|重置|Restablecer/ }).click();
        await expect(value).toHaveText(initial);
        await page.getByRole("button", { name: /Load example|载入示例|Cargar ejemplo/ }).click();
        await expect(value).not.toHaveText("—");
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", { name: /Export CSV|导出 CSV|Exportar CSV/ }).click();
        const download = await downloadPromise;
        const downloadPath = path.join(shotDir, `${tool}-${locale.id}-${viewport.name}.csv`);
        await download.saveAs(downloadPath);
        const csv = fs.readFileSync(downloadPath, "utf8");
        expect(csv).toContain(",");
        expect(csv).not.toContain("—");
        await page.locator("[data-probe]").focus();
        const focused = await page.evaluate(() => document.activeElement && document.activeElement.tagName);
        const health = await pageHealth(page);
        const shot = `${tool}-${locale.id}-${viewport.name}.png`;
        await page.screenshot({ path: path.join(shotDir, shot), fullPage: true });
        const ownFailures = failedResources.filter((item) => {
          try { return new URL(item.url).host === "127.0.0.1:4173"; } catch { return true; }
        });
        results.push({
          tool, locale: locale.id, viewport: viewport.name, kind: viewport.kind,
          http: response && response.status(),
          initial, edited, focused,
          csvBytes: csv.length,
          health,
          consoleErrors: consoleErrors.slice(),
          failedResources: failedResources.slice(),
          ownFailures,
          screenshot: shot,
          functional: ownFailures.length === 0 && health.pageOverflow === false ? "PASS" : "FAIL"
        });
        expect(response.status(), url).toBe(200);
        expect(ownFailures, url).toEqual([]);
        expect(health.pageOverflow, url + " page overflow").toBe(false);
        expect(health.tocDisplay, url + " toc").not.toBe("none");
        expect(health.valueColor.replace(/\s/g, "")).toBe("rgb(232,89,12)");
        expect(Number(health.valueWeight)).toBeLessThan(600);
        fs.writeFileSync(resultFile, JSON.stringify({ results }, null, 2));
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/itu-dwdm-grid-calculator/");
  await page.getByRole("button", { name: "Language: English" }).click();
  await page.getByRole("menuitem", { name: /简体中文/ }).click();
  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator("h1")).toContainText("ITU");
  const home = await page.goto("/");
  const homeHtml = await page.content();
  const directory = await page.goto("/tools/");
  const directoryHtml = await page.content();
  const sitemapResponse = await page.goto("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  const registration = {
    homeStatus: home && home.status(),
    directoryStatus: directory && directory.status(),
    homeToolCount: (homeHtml.match(/data-tool-count[^>]*>\s*(\d+)/) || [])[1] || "",
    homeOptical: (homeHtml.match(/data-category-count="optical"[^>]*>\s*(\d+)/) || [])[1] || "",
    directoryLinks: tools.filter((id) => directoryHtml.includes(id + "/")),
    sitemap: tools.flatMap((id) => locales.map((locale) => {
      const loc = "https://netengineerlab.com/tools/" + id + "/" + locale.prefix;
      return { url: loc, present: sitemap.includes(loc) };
    }))
  };
  fs.writeFileSync(resultFile, JSON.stringify({ results, registration }, null, 2));
  expect(registration.homeToolCount).toBe("57");
  expect(registration.homeOptical).toBe("9");
  expect(registration.directoryLinks).toEqual(tools);
  expect(registration.sitemap.every((item) => item.present)).toBe(true);
});
