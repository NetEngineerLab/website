const {test, expect} = require("@playwright/test");

test("cookie banner stays within a quarter of a phone viewport", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.addInitScript(() => localStorage.removeItem("nel_cookie_consent_v1"));
  await page.goto("/", {waitUntil: "load"});
  const banner = page.locator(".nel-cookie-banner");
  await expect(banner).toBeVisible();
  const box = await banner.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {position: style.position, top: rect.top, height: rect.height, bottom: rect.bottom};
  });
  expect(box.position).toBe("fixed");
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(844 + 1);
  expect(box.height).toBeLessThanOrEqual(110);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await banner.locator(".nel-cookie-reject").focus();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("fresh guide load keeps the cookie banner in view without scrolling", async ({page}) => {
  await page.addInitScript(() => localStorage.removeItem("nel_cookie_consent_v1"));
  await page.goto("/guides/fiber-link-budget-guide/", {waitUntil: "load"});
  const banner = page.locator(".nel-cookie-banner");
  await expect(banner).toBeVisible();
  const presentation = await banner.evaluate(element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      position: style.position,
      background: style.backgroundColor,
      paddingTop: parseFloat(style.paddingTop),
      top: box.top,
      bottom: box.bottom,
      width: box.width
    };
  });
  expect(presentation.position).toBe("fixed");
  expect(presentation.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(presentation.paddingTop).toBeGreaterThan(8);
  expect(presentation.top).toBeGreaterThanOrEqual(0);
  expect(presentation.bottom).toBeLessThanOrEqual(page.viewportSize().height + 1);
  expect(presentation.width).toBeLessThan(page.viewportSize().width);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

const hubReturnSamples = [
  "/tools/optical-power-budget/zh/",
  "/tools/subnet-calculator/",
  "/tools/pon-fiber-calculators/",
  "/topics/switch-oversubscription/",
  "/topics/data-center-capacity/",
  "/zh/topics/data-center-capacity/"
];

async function hubReturnAlignment(page) {
  return page.evaluate(() => {
    const hub = document.querySelector(".hub-return");
    if (!hub) return {error: "missing hub-return"};
    const hubBox = hub.getBoundingClientRect();
    const selectors = [
      "body > .content-section",
      "main.calculator-hub .hub-faq details",
      "main .topic-tools",
      "main.nel-tool-grid > .card"
    ];
    const cards = selectors
      .flatMap(selector => [...document.querySelectorAll(selector)])
      .filter(node => node !== hub && !hub.contains(node));
    cards.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width);
    const card = cards[0];
    if (!card) return {error: "missing neighbouring card"};
    const cardBox = card.getBoundingClientRect();
    const next = hub.nextElementSibling;
    const gap = next ? next.getBoundingClientRect().top - hubBox.bottom : null;
    return {
      left: Math.abs(hubBox.left - cardBox.left),
      right: Math.abs(hubBox.right - cardBox.right),
      gap,
      toolPage: document.body.classList.contains("nel-tool-detail-page")
    };
  });
}

for (const width of [1280, 390]) {
  test(`hub return lines up with the neighbouring card at ${width}px`, async ({page}) => {
    await page.addInitScript(() => localStorage.setItem("nel_cookie_consent_v1", "false"));
    await page.setViewportSize({width, height: 900});
    for (const url of hubReturnSamples) {
      await page.goto(url, {waitUntil: "load"});
      const alignment = await hubReturnAlignment(page);
      expect(alignment.error, url).toBeUndefined();
      expect(alignment.left, `${url} left`).toBeLessThanOrEqual(1);
      expect(alignment.right, `${url} right`).toBeLessThanOrEqual(1);
      if (alignment.toolPage) expect(alignment.gap, `${url} gap below hub return`).toBeGreaterThanOrEqual(20);
    }
  });
}

test("generator and breaker calculator inputs stay inside main and calculate", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem("nel_cookie_consent_v1", "false"));
  await page.goto("/tools/generator-fuel-runtime-calculator/es/", {waitUntil: "load"});
  const placed = await page.evaluate(() => {
    const main = document.querySelector("main");
    const ids = ["beforeGeneratorCount", "afterGeneratorCount", "ambientTempC", "requiredGenerators", "startFailurePct"];
    return {
      inside: ids.every(id => main.contains(document.getElementById(id))),
      gatesOutside: false,
      hubInside: main.contains(document.querySelector(".hub-return")),
      hubLeft: document.querySelector(".hub-return").getBoundingClientRect().left
    };
  });
  expect(placed.inside).toBe(true);
  expect(placed.hubInside).toBe(true);
  expect(placed.hubLeft).toBeGreaterThan(12);
  const before = await page.locator("#engineeringExtras").innerText();
  await page.locator("#beforeGeneratorCount").fill("8");
  await page.locator("#calculate").click();
  await expect(page.locator("#engineeringExtras")).not.toHaveText(before);

  await page.goto("/tools/telecom-ac-dc-breaker-sizing/es/", {waitUntil: "load"});
  const gates = await page.evaluate(() => document.querySelector("main").contains(document.getElementById("engineering-gates")));
  expect(gates).toBe(true);
  const designBefore = await page.locator("#acdesign").innerText();
  await page.locator("#engineering-gates #ambientC").fill("50");
  await page.locator("#calculate").click();
  await expect(page.locator("#acdesign")).not.toHaveText(designBefore);
});
