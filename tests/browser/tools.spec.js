const {test,expect}=require("@playwright/test");
const catalog=require("../../website/data/tools-catalog.json");

const tools=catalog.filter(tool=>tool.status==="active");
const calculationOutputs={
  "fiber-loss":["#designLoss","0.00"],
  "optical-power-budget":["#remainingBudget","0.00"],
  "pon-splitter-loss":["#remaining","0.00"],
  "onu-rx-power":["#measuredResult","0.00"],
  "pon-distance":["#effectiveMax","0.00"],
  "otdr-event":["#eventCount","0"],
  "mtu-calculator":["#statusBadge","—"],
  "subnet-calculator":["#ipv4Network",""],
  "bandwidth-calculator":["#transferHeadline","—"],
  "48v-battery-runtime":["#simpleRuntime","—"],
  "ipv6-nat-planner":["#v6ChildCount","—"],
  "wifi-coverage-capacity-planner":["#coverageApCount","—"],
  "poe-power-budget-calculator":["#required","—"],
  "sfp-qsfp-compatibility-calculator":["#rxPower","—"],
  "wireless-link-budget-calculator":["#status","—"],
  "poe-voltage-drop-calculator":["#status","—"],
  "network-rack-power-cooling-calculator":["#status","—"],
  "vlan-ip-capacity-planner":["#status","—"],
  "switch-uplink-oversubscription-calculator":["#status","—"],
  "dns-ttl-propagation-calculator":["#status","—"],
  "acl-generator-validator":["#score","—"]
};
const contentContracts={
  "poe-power-budget-calculator":{
    faqCount:5,
    references:[
      "https://www.ieee802.org/3/bt/",
      "https://www.ieee802.org/3/at/objectives.html",
      "https://ethernetalliance.org/poecert/",
      "https://www.cisco.com/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/interfaces/configuration/Hidden/b_Power_Over_Ethernet/b_Power_Over_Ethernet_chapter_00.html",
      "https://www.flukenetworks.com/blog/cabling-chronicles/bundle-or-not-bundle"
    ]
  },
  "sfp-qsfp-compatibility-calculator":{
    faqCount:5,
    references:[
      "https://members.snia.org/document/dl/25916",
      "https://www.snia.org/node/19611",
      "https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/gigabit-ethernet-gbic-sfp-modules/datasheet-c78-366584.html",
      "https://www.juniper.net/documentation/us/en/hardware/800g-optics-cables-guide/optics/topics/concept/800g-optics-faqs.html"
    ]
  },
  "vlan-ip-capacity-planner":{
    faqCount:5,
    references:[
      "https://www.rfc-editor.org/rfc/rfc1918.html",
      "https://www.rfc-editor.org/rfc/rfc4632.html",
      "https://www.rfc-editor.org/rfc/rfc3021.html"
    ]
  },
  "dns-ttl-propagation-calculator":{
    faqCount:5,
    references:[
      "https://www.rfc-editor.org/rfc/rfc1035.html",
      "https://www.rfc-editor.org/rfc/rfc2308.html",
      "https://www.rfc-editor.org/rfc/rfc8767.html",
      "https://www.rfc-editor.org/rfc/rfc9199.html"
    ]
  },
  "switch-uplink-oversubscription-calculator":{
    faqCount:5,
    references:[
      "https://standards.ieee.org/ieee/802.1AX/6768/",
      "https://datatracker.ietf.org/doc/rfc7424/",
      "https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/cisco-campus-lan-wlan-design-guide.html"
    ]
  },
  "network-rack-power-cooling-calculator":{
    faqCount:5,
    references:[
      "https://handbook.ashrae.org/Handbooks/A23/IP/A23_Ch20/a23_ch20_ip.aspx",
      "https://www.nist.gov/document/fs376-bpdf",
      "https://www.energy.gov/cmei/femp/incorporate-minimum-efficiency-requirements-heating-and-cooling-products-federal",
      "https://www.thegreengrid.org/resources/glossary?combine=pue"
    ]
  },
  "poe-voltage-drop-calculator":{
    faqCount:5,
    references:[
      "https://www.ieee802.org/3/bt/",
      "https://ethernetalliance.org/wp-content/uploads/2020/02/EthernetAlliance_Gen2PoECertProgram_techbrief-FINAL-19DEC19.pdf",
      "https://www.ieee802.org/3/bt/public/may16/stover_02_0516_rev002.pdf",
      "https://www.flukenetworks.com/blog/cabling-chronicles/upgrading-four-pair-poe-what-you-need-know"
    ]
  },
  "wireless-link-budget-calculator":{
    faqCount:5,
    references:[
      "https://www.itu.int/rec/R-REC-P.525-5-202411-I/en",
      "https://www.itu.int/rec/R-REC-P.530/en",
      "https://www.itu.int/rec/R-REC-P.676/en",
      "https://www.itu.int/rec/R-REC-P.526-16-202511-I/en"
    ]
  },
  "acl-generator-validator":{
    faqCount:5,
    references:[
      "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf",
      "https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/sec_data_acl/configuration/15-sy/sec-data-acl-15-sy-book/sec-access-list-ov.html",
      "https://www.juniper.net/documentation/us/en/software/junos/routing-policy/topics/concept/firewall-filter-qfx-series-evaluation-understanding.html",
      "https://www.iana.org/assignments/service-names-port-numbers/"
    ]
  }
};

function captureRuntimeErrors(page){
  const errors=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(`console: ${message.text()}`)});
  page.on("pageerror",error=>errors.push(`page: ${error.message}`));
  return errors;
}

function sourceCanonical(html){
  const tag=[...html.matchAll(/<link\b[^>]*>/gi)].map(match=>match[0]).find(value=>/\brel=["']canonical["']/i.test(value));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1]??null;
}

test.describe("all configured tools",()=>{
  for(const tool of tools){
    for(const locale of ["en","zh"]){
      const route=`/tools/${tool.id}/${locale==="zh"?"zh/":""}`;
      test(`${tool.id} ${locale}`,async({page,request})=>{
        const errors=captureRuntimeErrors(page);
        const expectedCanonical=`https://netengineerlab.com${route}`;
        const sourceResponse=await request.get(route);
        expect(sourceResponse.status()).toBe(200);
        expect(sourceCanonical(await sourceResponse.text())).toBe(expectedCanonical);
        const response=await page.goto(route,{waitUntil:"networkidle"});
        expect(response?.status()).toBe(200);
        await expect(page.locator("main").first()).toBeVisible();
        expect((await page.title()).trim().length).toBeGreaterThan(10);
        expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(expectedCanonical);
        expect((await page.locator("body").innerText()).length).toBeGreaterThan(200);
        const contentContract=contentContracts[tool.id];
        if(contentContract){
          await expect(page.locator(".content details")).toHaveCount(contentContract.faqCount);
          for(const reference of contentContract.references){
            await expect(page.locator(`.content a[href="${reference}"]`)).toBeVisible();
          }
          const faqMatchesVisible=await page.evaluate(()=>{
            const schema=JSON.parse(document.querySelector('script[data-nel-schema="faq"]')?.textContent||"null");
            const visible=[...document.querySelectorAll(".content details")].map(item=>({
              question:item.querySelector("summary")?.textContent.trim(),
              answer:item.querySelector("p")?.textContent.trim()
            }));
            return schema?.mainEntity?.length===visible.length&&schema.mainEntity.every(entity=>visible.some(item=>
              item.question===entity.name&&item.answer===entity.acceptedAnswer?.text
            ));
          });
          expect(faqMatchesVisible).toBe(true);
        }
        const engineLoaded=await page.evaluate(()=>performance.getEntriesByType("resource").some(entry=>/\/js\/engine\.js(?:\?|$)/.test(entry.name)));
        expect(engineLoaded).toBe(true);
        const calculationOutput=calculationOutputs[tool.id];
        expect(calculationOutput,`${tool.id} must declare a calculation output`).toBeTruthy();
        const calculate=page.locator("#calculateBtn, #calculate, #analyzeBtn, #validate, button.primary-action, button[type=submit]").first();
        if(await calculate.count())await calculate.click();
        const output=page.locator(calculationOutput[0]);
        await expect(output).toBeVisible();
        await expect.poll(async()=>(await output.textContent())?.trim()??"").not.toBe(calculationOutput[1]);
        await expect(page.locator("#error")).toBeHidden();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
        expect(overflow).toBe(false);
        expect(errors).toEqual([]);
      });
    }
  }
});
