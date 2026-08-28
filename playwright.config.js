const {defineConfig,devices}=require("@playwright/test");

module.exports=defineConfig({
  testDir:"./tests/browser",
  timeout:30000,
  expect:{timeout:5000},
  fullyParallel:false,
  workers:1,
  retries:0,
  reporter:[["line"],["html",{open:"never"}]],
  use:{baseURL:"http://127.0.0.1:4173",serviceWorkers:"allow",trace:"retain-on-failure",screenshot:"only-on-failure"},
  projects:[
    {name:"chrome-desktop",use:{...devices["Desktop Chrome"],deviceScaleFactor:1}},
    {name:"edge-desktop",use:{...devices["Desktop Edge"],channel:"msedge",deviceScaleFactor:1}},
    {name:"edge-android",use:{...devices["Pixel 7"],channel:"msedge",deviceScaleFactor:1}},
    {name:"edge-iphone",use:{...devices["iPhone 13"],browserName:"chromium",channel:"msedge",deviceScaleFactor:1}}
  ]
});
