#!/usr/bin/env node
"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('./lib/tool-v3-dom'),M=require('./migrate-tool-detail-v3');
const {validateFaqSchemaEvolution,hasApprovedProseChange,approvedInlineReplacement,approvedOriginalControls}=require('./lib/tool-v3-content-evolution');
const {visibleFaq,syncVisibleFaq}=require('./lib/seo-resolver');
const {preserveAuthoredGraph}=require('./lib/tool-v3-navigation-preserve');
const {withVersion,withoutVersion}=require('./lib/tool-engine-asset-version');
assert.equal(withVersion('../js/engine.js?mode=strict&amp;v=old&amp;units=dB#result','abcdef123456'),'../js/engine.js?mode=strict&amp;v=abcdef123456&amp;units=dB#result','engine versioning must retain business query parameters and fragment');
assert.equal(withoutVersion('../js/engine.js?mode=strict&amp;v=abcdef123456&amp;units=dB#result'),'../js/engine.js?mode=strict&amp;units=dB#result');
// A migrated explanation summary must never become a FAQ/schema question.
const fixture='<html><head></head><body><main id="calculator"><details id="methodology" class="fb-fold blk"><summary class="fb-fold-sum">How calculated</summary><p>Domain method.</p></details><div class="blk faq" id="faq"><h2>Frequently asked questions</h2><details><summary>Can I use my own measurements?</summary><p>Yes, use comparable measurements.</p></details></div></main></body></html>';
assert.deepEqual(visibleFaq(fixture).map(q=>q.name),['Can I use my own measurements?']);
assert.deepEqual(visibleFaq('<details><p>Non-question content without summary.</p></details>'+fixture).map(q=>q.name),['Can I use my own measurements?'],'FAQ matching cannot cross one details boundary to another summary');
const synced=syncVisibleFaq(fixture,'en');
const faq=D.all(D.parse(synced),n=>n.tag==='script').map(n=>JSON.parse(n.children.join(''))).find(n=>n['@type']==='FAQPage');
assert.deepEqual(faq.mainEntity.map(q=>q.name),['Can I use my own measurements?']);
// Authorized content evolution preserves old answers and requires schema/visible parity.
const evolvedFixture=fixture.replace('Yes, use comparable measurements.','Yes, use comparable measurements. Retain the source evidence.');
const evolvedSynced=syncVisibleFaq(evolvedFixture,'es');
const priorFaqScript=D.all(D.parse(synced),n=>n.tag==='script'&&D.attr(n,'data-nel-schema')==='faq')[0];
assert(validateFaqSchemaEvolution(D.render(priorFaqScript),D.parse(evolvedSynced),'bandwidth-calculator','es'));
assert.equal(validateFaqSchemaEvolution(D.render(priorFaqScript),D.parse(evolvedSynced),'bandwidth-calculator','en'),false,'unapproved locale retains byte-level schema guard');
assert.equal(validateFaqSchemaEvolution('<script>const fixedHook=1;</script>',D.parse(evolvedSynced),'bandwidth-calculator','es'),false,'FAQ authorization never exempts executable scripts');
assert.throws(()=>validateFaqSchemaEvolution(D.render(priorFaqScript),D.parse(evolvedSynced.replaceAll('Yes, use comparable measurements.','Answer removed.')),'bandwidth-calculator','es'),/original FAQ answer retained/);
const approvedErratum=require('./lib/tool-v3-approved-content-revisions.json').proseErrata.find(c=>c.route==='ups-capacity-battery-runtime-calculator/en');
assert(hasApprovedProseChange('ups-capacity-battery-runtime-calculator','en',approvedErratum.before,approvedErratum.after));
assert.equal(hasApprovedProseChange('fiber-loss','en',approvedErratum.before,approvedErratum.after),false,'prose errata are exact-route scoped');
// Deployment fingerprints may change only v on the exact managed source URL.
const managedScript='<html><head><link rel="canonical" href="https://netengineerlab.com/tools/ups-capacity-battery-runtime-calculator/"></head><body><script defer src="js/app.js?mode=strict&amp;v=old#run"></script></body></html>';
const scriptSig=html=>M.signature(D.parse(html)).scripts;
assert.deepEqual(scriptSig(managedScript),scriptSig(managedScript.replace('v=old','v=new')));
assert.notDeepEqual(scriptSig(managedScript),scriptSig(managedScript.replace('mode=strict','mode=loose')),'business query parameters remain protected');
assert.notDeepEqual(scriptSig(managedScript),scriptSig(managedScript.replace('defer ','async ')),'script attributes remain protected');
assert.notDeepEqual(scriptSig(managedScript),scriptSig(managedScript.replace('#run','#other')),'script fragments remain protected');
assert.notDeepEqual(scriptSig(managedScript),scriptSig(managedScript.replace('js/app.js','js/another-app.js')),'script source path remains protected');
assert.notDeepEqual(scriptSig('<script>calculate(1);</script>'),scriptSig('<script>calculate(2);</script>'),'unapproved inline bytes remain protected');
const inlinePair=require('./lib/tool-v3-approved-script-revisions.json').inlinePairs[0];
const ipBefore=fs.readFileSync(path.resolve(__dirname,'../artifacts/opb-v3-audit/before/website/tools/ip-camera-network-planner/index.html'),'utf8');
const ipAfter=fs.readFileSync(path.resolve(__dirname,'../website/tools/ip-camera-network-planner/index.html'),'utf8');
const oldIpScripts=scriptSig(ipBefore),nextIpScripts=scriptSig(ipAfter);
const exactOld=oldIpScripts.find(raw=>require('crypto').createHash('sha256').update(raw).digest('hex')===inlinePair.beforeSha256);
const exactNext=approvedInlineReplacement(exactOld,nextIpScripts,'ip-camera-network-planner','en');
assert.notEqual(exactNext,exactOld);
assert.throws(()=>approvedInlineReplacement(exactOld,[],'ip-camera-network-planner','en'),/exact approved inline replacement/);
assert.equal(approvedInlineReplacement(exactOld,nextIpScripts,'fiber-loss','en'),exactOld,'inline approval is exact-route scoped');
// Exact accessibility/void-tag revisions never permit machine-field drift.
const controlPair=require('./lib/tool-v3-approved-control-revisions.json').pairs[0];
const controlRoute=controlPair.route.split('/');
assert.deepEqual(approvedOriginalControls([controlPair.before],[controlPair.after],controlRoute[0],controlRoute[1]),[controlPair.after]);
assert.throws(()=>approvedOriginalControls([controlPair.before],[controlPair.after.replace('id="','data-changed-id="')],controlRoute[0],controlRoute[1]),/exact approved control revision/);
assert.throws(()=>approvedOriginalControls([controlPair.before],[controlPair.after,controlPair.after],controlRoute[0],controlRoute[1]),/exact approved control revision/);
assert.deepEqual(approvedOriginalControls([controlPair.before],[controlPair.after],'unapproved-tool','es'),[controlPair.before]);
// Generated selector metadata must never put raw > into lossless tag parsing.
const rowMetadataFixture='<html><head><link rel="canonical" href="https://netengineerlab.com/tools/fiber-loss/"></head><body class="nel-tool-detail-page nel-tool-v3 v3 has-mbar" data-nel-v3-migrated="1"><main id="calculator" data-nel-readout-rows=".result-box,.metric-card > div,.metric,.kv" > div,.metric,.kv"><input id="original" data-hook="original" value="10"><p id="sentinel">Keep authored > comparisons intact.</p></main></body></html>';
const repairedRows=M.migrate(rowMetadataFixture,'fiber-loss','en');
assert.equal(M.migrate(repairedRows,'fiber-loss','en'),repairedRows,'quoted selector repair is byte-idempotent');
const repairedMain=D.all(D.parse(repairedRows),n=>n.tag==='main')[0];
assert.equal(decodeURIComponent(D.attr(repairedMain,'data-nel-readout-rows')),require('./lib/tool-v3-component-roles').readoutRows);
assert(!D.text(repairedMain).includes('div,.metric,.kv'),'previous generated tail never leaks into page text');
assert(D.text(repairedMain).includes('Keep authored > comparisons intact.'));
assert.deepEqual(M.signature(D.parse(rowMetadataFixture)).controls,M.signature(D.parse(repairedRows)).controls,'metadata repair never changes authored controls');
const injected='<html><head></head><body><h1>Bandwidth calculation</h1><main id="calculator"></main><section class="content-section faq-section" id="faq" data-nel-faq="visible"><h2>Frequently asked questions</h2><details><summary>Can I use my own measurements?</summary><p>Yes, use comparable measurements.</p></details></section></body></html>';
const migrated=M.migrate(injected,'bandwidth-calculator','en');
assert.equal(visibleFaq(syncVisibleFaq(migrated,'en'))[0].answer,'Yes, use comparable measurements.','canonical migrated FAQ must retain legacy injected answers through SEO rebuild');
const oldGraph='<section id="nel-tool-graph"><p>Old generated workflow</p><section id="related-calculators" data-nel-v3-related="authored"><h2>Related engineering resources</h2><a href="../bandwidth-calculator/">Bandwidth method</a></section></section>';
const freshGraph='<section id="nel-tool-graph"><p>New registry workflow</p></section>';
const preserved=preserveAuthoredGraph(oldGraph,freshGraph);
assert(preserved.includes('id="related-calculators"')&&preserved.includes('Bandwidth method')&&preserved.includes('New registry workflow'));
assert.equal(preserveAuthoredGraph(preserved,preserved),preserved,'authored graph preservation must not duplicate resources');
const crumbsPage=fs.readFileSync(path.resolve(__dirname,'../website/tools/poe-voltage-drop-calculator/zh/index.html'),'utf8');
const duplicate='<div class="breadcrumbs"><a href="../../../zh/">首页</a> / <a href="../../zh/">工具</a> / 网线PoE压降计算器</div>';
const duplicateFixture=crumbsPage.replace(/(<body\b[^>]*>)/,'$1'+duplicate);
assert.equal(M.migrate(duplicateFixture,'poe-voltage-drop-calculator','zh'),crumbsPage,'rebuild must consolidate a repeated legacy breadcrumb into the canonical original navigation');
assert.throws(()=>M.migrate(duplicateFixture.replace(duplicate,duplicate.replace('class="breadcrumbs"','class="breadcrumbs" id="original-hook"')),'poe-voltage-drop-calculator','zh'),/original ID/,'original navigation hooks cannot be removed silently');
// The build replaces complete footer/header marker spans. A main relocated
// inside a footer marker would be deleted on the second build (the regression).
let pages=0;
for(const slug of M.slugs)for(const locale of ['en','zh','es']){
 const file=path.resolve(__dirname,'../website/tools',slug,locale==='en'?'':locale,'index.html');if(!fs.existsSync(file))continue;
 const html=fs.readFileSync(file,'utf8'),main=D.all(D.parse(html),n=>n.tag==='main')[0];assert(main,slug+'/'+locale+' main');
 const rebuilt=html.replace(/<!-- NEL_FOOTER_START -->[\s\S]*?<!-- NEL_FOOTER_END -->/i,'<!-- NEL_FOOTER_START --><footer>rebuilt footer</footer><!-- NEL_FOOTER_END -->');
 assert.equal(D.render(D.all(D.parse(rebuilt),n=>n.tag==='main')[0]),D.render(main),slug+'/'+locale+' footer rebuild must preserve main bytes');pages++;
}
console.log('Tool-detail V3 build regressions PASS: '+pages+' main elements survive footer replacement; explanation folds excluded from FAQ/schema.');

// Registration must follow the authored script's tool root in every locale.
const pwaVm=require('node:vm');
for(const slug of ['odf-odn-resource-planner','network-risk-hidden-hazard-assessment-generator'])for(const locale of ['en','zh','es']){
 const page=path.resolve(__dirname,'../website/tools',slug,locale==='en'?'':locale,'index.html');
 const dom=D.parse(fs.readFileSync(page,'utf8'));const script=D.all(dom,n=>n.tag==='script'&&/(?:^|\/)js\/pwa\.js(?:[?#]|$)/.test(D.attr(n,'src')))[0];assert(script,slug+'/'+locale+' authored PWA script');
 const canonical='https://example.test/tools/'+slug+'/'+(locale==='en'?'':locale+'/');
 const loads=[],registered=[],on=(type,callback)=>{if(type==='load')loads.push(callback)};
 const sandbox={URL,location:{protocol:'https:',href:canonical},document:{currentScript:{src:new URL(D.attr(script,'src'),canonical).href},documentElement:{lang:locale==='zh'?'zh-CN':locale}},navigator:{serviceWorker:{register:url=>{registered.push(new URL(url,canonical).href);return Promise.resolve({});}}},window:{addEventListener:on},addEventListener:on};
 pwaVm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../website/tools',slug,'js/pwa.js'),'utf8'),sandbox);for(const load of loads)load();
 assert.deepEqual(registered,['https://example.test/tools/'+slug+'/sw.js'],slug+'/'+locale+' must register its existing tool-root worker, never a locale child404');
}
