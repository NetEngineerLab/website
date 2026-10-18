const {test, expect} = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const catalog = require("../../website/data/tools-catalog.json");

const tools = catalog.filter(tool => tool.status === "active");
const siteRoot = path.join(__dirname, "../../website");

function pageExists(route) {
  const rel = route.replace(/^\//, "");
  return fs.existsSync(path.join(siteRoot, rel, "index.html"));
}

const forbidden = {
  "generator-fuel-runtime-calculator": [
    "Wet-stack risk",
    "Before / After fuel",
    "Before / After N-1 capacity",
    "Before / After runtime",
    "Low-load periods may create wet-stacking risk",
    "L/day",
    "Engineering gates & scenario comparison"
  ],
  "telecom-ac-dc-breaker-sizing": [
    "Risk: undefined",
    "Risk: <strong>undefined",
    "Engineering gates & scenarios",
    "Before / After design current",
    "Planning candidate only"
  ],
  "telecom-solar-battery-sizing-calculator": ["kWh/day", "kWh/yr", "L/yr", "min. "],
  "ups-capacity-battery-runtime-calculator": ["Before / After:", "Ah/string", "Scenarios & risk"],
  "pue-data-center-energy-efficiency": ["Enter monthly PUE values to show trend", "Near target", "Above target"]
};

test.describe("tool input chrome and localized results", () => {
  test.describe.configure({retries: 1});
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chrome-desktop", "Input chrome is covered once; other projects repeat the same pages.");
  });

  for (const tool of tools) {
    for (const locale of ["en", "zh", "es"]) {
      const route = locale === "en" ? `/tools/${tool.id}/` : `/tools/${tool.id}/${locale}/`;
      test(`${tool.id} ${locale} inputs have borders and labels`, async ({page}) => {
        test.skip(!pageExists(route), `${route} is not published`);
        const response = await page.goto(route, {waitUntil: "domcontentloaded"});
        expect(response?.status()).toBe(200);
        await page.locator("main").first().waitFor({state: "visible"});
        const problems = await page.evaluate(() => {
          const skipType = new Set(["hidden", "checkbox", "radio", "button", "submit", "reset", "file", "image", "range"]);
          const issues = [];
          for (const el of document.querySelectorAll("input, select, textarea")) {
            const type = (el.getAttribute("type") || el.tagName).toLowerCase();
            if (skipType.has(type)) continue;
            if (el.closest("details:not([open]), [hidden]")) continue;
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const rect = el.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2) continue;
            const chrome = el.closest(".input, .input-wrap") || el;
            const box = getComputedStyle(chrome);
            const width = ["Top", "Right", "Bottom", "Left"].reduce((sum, side) => sum + parseFloat(box[`border${side}Width`]) || 0, 0);
            if (!(width > 0)) issues.push(`border ${el.id || el.name || el.dataset.key || type}`);
            const named = el.labels && [...el.labels].some(label => label.textContent.replace(el.value || "", "").trim());
            const field = el.closest(".field, .form-group, .control-group, label");
            const ownLabel = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
            const labelText = (ownLabel?.textContent || field?.querySelector(":scope > label, label")?.textContent || el.closest("label")?.textContent || "").replace(el.value || "", "").trim();
            const accessible = (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "").trim();
            if (!named && !labelText && !accessible) issues.push(`label ${el.id || el.name || el.dataset.key || type}`);
          }
          return issues;
        });
        expect(problems, problems.join("\n")).toEqual([]);

        if (locale === "en" || !forbidden[tool.id]) return;
        const resultText = await page.evaluate(() => {
          const nodes = ["#result", "#engineeringExtras", "#warn", "#warnings", "#ups-report", ".result-panel", "#bars"];
          return nodes.map(selector => document.querySelector(selector)?.innerText || "").join("\n");
        });
        expect(resultText).not.toMatch(/\bundefined\b|\bNaN\b/);
        for (const phrase of forbidden[tool.id]) {
          expect(resultText, phrase).not.toContain(phrase);
        }
      });
    }
  }
});
