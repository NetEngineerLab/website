const {test, expect} = require("@playwright/test");

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
