const {test, expect} = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const origin = process.env.HOME_STYLE_ORIGIN || "";
const routes = [
  {route: "/", locale: "en", lang: "en", tools: /\/tools\/$/, nextLang: "/zh/", nextLangCode: "zh-CN"},
  {route: "/zh/", locale: "zh", lang: "zh-CN", tools: /\/tools\/zh\/$/, nextLang: "/es/", nextLangCode: "es"},
  {route: "/es/", locale: "es", lang: "es", tools: /\/tools\/es\/$/, nextLang: "/", nextLangCode: "en"}
];
const viewports = [
  {width: 320, height: 740},
  {width: 390, height: 844},
  {width: 1280, height: 800}
];

function pageUrl(route) {
  return origin ? new URL(route, origin).href : route;
}

function capture(page) {
  const consoleErrors = [];
  const resourceErrors = [];
  const stylesheets = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => consoleErrors.push(error.message));
  page.on("requestfailed", request => {
    const url = request.url();
    if (!url.startsWith("http")) return;
    resourceErrors.push(`${request.failure()?.errorText || "failed"} ${url}`);
  });
  page.on("response", response => {
    const url = response.url();
    let host = "";
    try { host = new URL(url).host; } catch { return; }
    if (url.includes("home-fresh.css")) stylesheets.push({url, status: response.status(), type: response.headers()["content-type"] || ""});
    const sameOrigin = !origin || host === new URL(origin).host;
    const local = host === "127.0.0.1" || host === "localhost";
    if ((sameOrigin || local) && response.status() >= 400) resourceErrors.push(`${response.status()} ${url}`);
  });
  return {consoleErrors, resourceErrors, stylesheets};
}

async function dismissCookies(page) {
  const reject = page.locator(".nel-cookie-reject");
  if (await reject.count() && await reject.first().isVisible()) await reject.first().click();
}

async function measure(page) {
  return page.evaluate(() => {
    function tracks(value) {
      if (!value || value === "none") return 0;
      return value.trim().split(/\s+/).length;
    }
    function box(selector) {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        tracks: tracks(style.gridTemplateColumns),
        display: style.display,
        fontSize: style.fontSize,
        color: style.color,
        width: rect.width,
        left: rect.left,
        right: rect.right
      };
    }
    const viewport = window.innerWidth;
    const offenders = [];
    for (const element of document.querySelectorAll("body *")) {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (element.closest(".sr-only")) continue;
      if (element.matches(".hf-hero, .hf-block")) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.left < -1 || rect.right > viewport + 1) {
        offenders.push({id: element.id, cls: String(element.className).slice(0, 80), left: Math.round(rect.left), right: Math.round(rect.right), viewport});
        if (offenders.length === 6) break;
      }
    }
    return {
      viewport,
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      h1: box(".hf-hero h1"),
      caps: box(".hf-caps"),
      steps: box(".hf-steps"),
      hero: box(".hf-hero"),
      art: box(".hf-hero-art"),
      search: box(".hf-search"),
      offenders
    };
  });
}

function layoutFailures(metrics) {
  const failures = [];
  const phone = metrics.viewport <= 640;
  if (metrics.scroll > metrics.client + 1) failures.push(`horizontal scroll ${metrics.scroll}>${metrics.client}`);
  if (metrics.bodyBackground !== "rgb(244, 248, 252)") failures.push(`background ${metrics.bodyBackground}, expected rgb(244, 248, 252)`);
  if (!metrics.h1) failures.push("missing .hf-hero h1");
  else {
    const fontSize = phone ? "34px" : "48px";
    if (metrics.h1.fontSize !== fontSize) failures.push(`h1 font-size ${metrics.h1.fontSize}, expected ${fontSize}`);
    if (metrics.h1.color !== "rgb(22, 20, 15)") failures.push(`h1 color ${metrics.h1.color}, expected rgb(22, 20, 15)`);
    if (metrics.h1.left < -1 || metrics.h1.right > metrics.viewport + 1) failures.push(`h1 outside ${metrics.viewport}px viewport`);
  }
  const expected = {
    caps: phone ? 1 : 2,
    steps: phone ? 1 : 3,
    hero: phone ? 1 : 2,
    search: phone ? 1 : 2
  };
  for (const [name, count] of Object.entries(expected)) {
    if (!metrics[name]) failures.push(`missing .hf ${name}`);
    else if (metrics[name].tracks !== count) failures.push(`${name} tracks ${metrics[name].tracks}, expected ${count}`);
  }
  if (!metrics.art) failures.push("missing hero art");
  else if (phone && metrics.art.display !== "none") failures.push(`hero art display ${metrics.art.display}, expected none`);
  else if (!phone && (metrics.art.display === "none" || metrics.art.width < 80)) failures.push(`hero art display ${metrics.art.display} width ${metrics.art.width}`);
  if (metrics.offenders.length) failures.push(`overflow ${JSON.stringify(metrics.offenders)}`);
  return failures;
}

async function openMobileNav(page) {
  const toggle = page.locator(".site-shell-menu-toggle");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const tools = page.locator("#site-shell-nav a[href*='tools/']");
  await expect(tools).toBeVisible();
  const box = await tools.boundingBox();
  expect(box.width).toBeGreaterThan(40);
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
  return tools;
}

test.describe("homepage style contract", () => {
  for (const item of routes) {
    test(`${item.route} computed layout, resources, and key interactions`, async ({page}) => {
      test.setTimeout(60000);
      const seen = capture(page);
      const response = await page.goto(pageUrl(item.route), {waitUntil: "networkidle"});
      expect(response.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", item.lang);
      await dismissCookies(page);
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        const failures = layoutFailures(await measure(page));
        expect(failures, failures.join("\n")).toEqual([]);
      }

      await page.setViewportSize(viewports[0]);
      const tools = await openMobileNav(page);
      await tools.click();
      await expect(page).toHaveURL(item.tools);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();

      await page.goto(pageUrl(item.route), {waitUntil: "networkidle"});
      await dismissCookies(page);
      await page.setViewportSize(viewports[1]);
      await openMobileNav(page);
      await page.locator(".site-shell-menu-toggle").click();
      await expect(page.locator(".site-shell-menu-toggle")).toHaveAttribute("aria-expanded", "false");
      await page.locator(".language-trigger").click();
      const language = page.locator(`.language-option[hreflang="${item.nextLangCode}"]`);
      await expect(language).toBeVisible();
      const languageBox = await language.boundingBox();
      expect(languageBox.x).toBeGreaterThanOrEqual(-1);
      expect(languageBox.x + languageBox.width).toBeLessThanOrEqual(390 + 1);
      await language.click();
      await expect(page).toHaveURL(url => new URL(url).pathname === item.nextLang);
      await expect(page.locator("html")).toHaveAttribute("lang", item.nextLangCode);

      await page.goto(pageUrl(item.route), {waitUntil: "networkidle"});
      await dismissCookies(page);
      await page.setViewportSize(viewports[2]);
      await page.locator("[data-category-link='optical']").click();
      await expect(page).toHaveURL(url => {
        const parsed = new URL(url);
        return parsed.searchParams.get("category") === "optical" && item.tools.test(parsed.pathname);
      });
      const visibleCategories = await page.locator(".tool-card[data-category]").evaluateAll(nodes => nodes.filter(node => !node.hidden).map(node => node.dataset.category));
      expect(visibleCategories.length).toBeGreaterThan(0);
      expect([...new Set(visibleCategories)]).toEqual(["optical"]);

      await page.goto(pageUrl(item.route), {waitUntil: "networkidle"});
      await dismissCookies(page);
      await page.setViewportSize(viewports[1]);
      await page.locator("[data-home-search] input").fill("fiber-loss");
      await page.locator("[data-home-search] button").click();
      await expect(page).toHaveURL(new RegExp(`/tools/fiber-loss/${item.locale === "en" ? "" : `${item.locale}/`}$`));
      await expect(page.locator("h1")).toHaveCount(1);

      const fresh = seen.stylesheets.filter(sheet => sheet.url.includes("home-fresh.css"));
      expect(fresh.length).toBeGreaterThan(0);
      expect(fresh.every(sheet => sheet.status === 200 && sheet.type.includes("text/css"))).toBe(true);
      expect(seen.consoleErrors).toEqual([]);
      expect(seen.resourceErrors).toEqual([]);
    });
  }

  test("obsolete homepage CSS fails computed layout", async ({page}) => {
    await page.route("**/home-fresh.css*", route => route.fulfill({
      status: 200,
      contentType: "text/css",
      body: fs.readFileSync(path.join(__dirname, "../../website/assets/css/home-mobile-layout.css"), "utf8")
    }));
    await page.setViewportSize(viewports[0]);
    await page.goto(pageUrl("/"), {waitUntil: "domcontentloaded"});
    const failures = layoutFailures(await measure(page));
    expect(failures.length).toBeGreaterThan(0);
    expect(failures.join("\n")).toMatch(/background|font-size|tracks/);
  });

  test("phone rules replaced by two columns fail the 320px contract", async ({page}) => {
    const broken = fs.readFileSync(path.join(__dirname, "../../website/assets/css/home-fresh.css"), "utf8")
      .replace(".hf-search{grid-template-columns:minmax(0,1fr)}", ".hf-search{grid-template-columns:repeat(2,minmax(0,1fr))}");
    await page.route("**/home-fresh.css*", route => route.fulfill({status: 200, contentType: "text/css", body: broken}));
    await page.setViewportSize(viewports[0]);
    await page.goto(pageUrl("/"), {waitUntil: "domcontentloaded"});
    const failures = layoutFailures(await measure(page));
    expect(failures.some(failure => failure.includes("caps tracks"))).toBe(true);
    expect(failures.some(failure => failure.includes("search tracks"))).toBe(true);
  });

  test("a missing homepage stylesheet fails computed layout and resource health", async ({page}) => {
    const seen = capture(page);
    await page.route("**/home-fresh.css*", route => route.abort());
    await page.setViewportSize(viewports[1]);
    await page.goto(pageUrl("/zh/"), {waitUntil: "domcontentloaded"});
    const failures = layoutFailures(await measure(page));
    expect(failures.some(failure => failure.startsWith("background"))).toBe(true);
    expect(failures.some(failure => failure.includes("h1 font-size"))).toBe(true);
    expect(seen.resourceErrors.some(error => error.includes("home-fresh.css"))).toBe(true);
  });
});
