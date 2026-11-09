"use strict";
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
// Scope the production baseline's selectors, including nested media rules.
// Declarations and keyframes are preserved. No OPB class is put on other tools.
function scope(css){
 css=css.replace(/\/\*[\s\S]*?\*\//g,'');let out='',pos=0;
 while(pos<css.length){const open=css.indexOf('{',pos);if(open<0){out+=css.slice(pos);break;}const pre=css.slice(pos,open);let i=open+1,depth=1,quote='';for(;i<css.length&&depth;i++){const c=css[i];if(quote){if(c===quote&&css[i-1]!=='\\')quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='{')depth++;else if(c==='}')depth--;}
  const inner=css.slice(open+1,i-1),s=pre.trim();if(s.startsWith('@'))out+=pre+'{'+(/^@(?:media|supports|layer|container)/.test(s)?scope(inner):inner)+'}';else{out+=pre.split(',').flatMap(sel=>{
   // Domain enums retain their meaning while sharing the canonical OPB rule.
   // Expand complete selectors, not :is(...), because this scoper splits commas.
   const aliases={"st-pass":["pass","good","excellent","healthy"],"st-marginal":["warning","marginal","review"],"st-fail":["fail","failed","invalid"]};
   const state=sel.match(/\.status\.(st-pass|st-marginal|st-fail)(?![\w-])/);
   let selectors=state?[sel,...aliases[state[1]].map(alias=>sel.replace(state[0],'.status.'+alias))]:[sel];
   if(/\.inp\s+u\b/.test(sel))selectors.push(sel.replace(/\.inp\s+u\b/,'.inp > span'));
   if(/\.f(?![\w-])/.test(sel))selectors.push(sel.replace(/\.f(?![\w-])/g,'.field'));
   if(/\.tabs button\.on(?![\w-])/.test(sel))for(const active of ['.active','[aria-selected="true"]','[aria-pressed="true"]','[aria-current="step"]'])selectors.push(sel.replace(/\.tabs button\.on(?![\w-])/,'.tabs button'+active));
   // Wizard navigation keeps native disabled conditions and borrows the actual OPB disabled primitive.
   if(sel.trim()==='[data-ro-act]:disabled')selectors.push('nav.steps.tabs button:disabled');
   return selectors;
  }).map(sel=>{sel=sel.trim().replace(/nel-opb-v3/g,'nel-tool-v3').replace(/\.grp\s+\.row\s+span(?![\w-])/g,'.grp .row span:not([data-nel-readout-role]):not([data-nel-health-status])').replace(/\.ro-acts button(?![\w-])/g,'.ro-acts button:not(.btn)');if(sel.includes(':root'))return sel.replace(/:root/g,'body.nel-tool-v3');if(/^html/.test(sel))return sel.replace(/^html(?:\.nel-tool-v3)?/,'html:has(body.nel-tool-v3)');if(/^body/.test(sel))return sel.replace(/^body(?!\.nel-tool-v3)/,'body.nel-tool-v3');return 'body.nel-tool-v3 '+sel;}).join(',\n')+'{'+inner+'}';}pos=i;
 }return out;
}
// Shared OPB tabs/actions were authored for short labels and four actions.
// Domain tools retain longer localized labels and different action counts.
const inputFocus=`
/* Match OPB .inp:focus-within. Put the ring outside input-wrap's clipping
   boundary, and leave the existing .inp focus owner in charge of its inputs. */
body.nel-tool-v3 main .input-wrap:not(.inp):focus-within{
 border-color:var(--v3-blue);
 box-shadow:0 0 0 3px rgba(59,130,246,.16);
}
body.nel-tool-v3 main :is(input,select,textarea):not(.input-wrap *):not(.inp *):focus-visible{
 outline:3px solid rgba(59,130,246,.45);
 outline-offset:2px;
}
`;
const narrowComponents=`
@media(max-width:768px){
 body.nel-tool-v3 main .tabs{display:flex;flex-wrap:wrap;max-width:100%;min-width:0}
 body.nel-tool-v3 main .tabs > button{flex:1 1 120px;min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere}
 body.nel-tool-v3 main .ro-acts{grid-template-columns:repeat(auto-fit,minmax(min(100%,112px),1fr))}
 body.nel-tool-v3 main .ro-acts > button{min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere}
}
`;
// These two domain tools use .field/.input-wrap instead of OPB .f/.inp.
// Keep the adaptation local until other domains have their own acceptance.
const domainOwner='body.nel-tool-v3:has(#nel-tool-graph:is([data-tool-id="poe-voltage-drop-calculator"],[data-tool-id="wireless-link-budget-calculator"]))';
const domainComponents=`
/* OPB fb.css .inp/.inp input/.inp u and fb-v3.css validation/surface tokens.
   The domain wrapper owns the chrome; its control stays transparent. */
${domainOwner} main .input-wrap{display:flex;align-items:center;height:40px;border:1px solid var(--v3-border-soft);border-radius:8px;background:#fff;padding:0 10px 0 12px;font:500 14.5px var(--mono);color:var(--ink)}
${domainOwner} main .input-wrap:focus-within{border-color:var(--v3-blue);box-shadow:0 0 0 3px rgba(59,130,246,.16)}
${domainOwner} main .input-wrap input,${domainOwner} main .input-wrap select{all:unset;flex:1;min-width:0;max-width:100%;width:100%;font:500 15px var(--mono);color:var(--ink)}
${domainOwner} main .input-wrap select{cursor:pointer;appearance:none;font:500 14.5px var(--mono);color:var(--v3-ink)}
${domainOwner} main .input-wrap:has(select)::after{content:"⌄";margin-left:8px;color:var(--faint);font-size:14px;transform:translateY(-3px);pointer-events:none;flex:0 0 auto}
${domainOwner} main .input-wrap span{padding:0;margin-left:auto;font:12px var(--mono);color:var(--faint);flex-shrink:0}
${domainOwner} main .field label{font:500 14px/1.6 var(--sans);color:var(--ink-2)}
html[lang^="zh"] ${domainOwner} main .field label{line-height:1.7}
${domainOwner} main .actions button.btn{height:40px;min-height:40px;padding:0 16px;border:1px solid transparent;border-radius:10px;font:inherit;color:var(--ink);background:#fff}
${domainOwner} main .actions button.btn-primary{background:linear-gradient(180deg,#F06A1E,var(--v3-accent));border-color:transparent;color:#fff;box-shadow:0 8px 18px -10px rgba(232,89,12,.55)}
${domainOwner} main .actions button.btn-ghost{border-color:var(--v3-border-soft)}
${domainOwner} main #error{margin:0 0 12px;padding:10px 12px;border-radius:10px;background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-size:13.5px}
${domainOwner} main .readout{border-radius:14px;background:radial-gradient(520px 280px at 100% 0%,rgba(59,130,246,.07),transparent 55%),linear-gradient(165deg,var(--v3-panel-bg) 0%,var(--v3-panel-bg-2) 60%,#F1F5F9 100%)}
`;
function write(file,text){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)fs.writeFileSync(file,text);}
function generate(){
 const base=path.join(root,'website/tools/optical-power-budget/css');
 const banner='/* Generated by scripts/lib/tool-v3-styles.js from the production OPB baseline.\n   All selectors are scoped to migrated tool-detail pages. Do not edit this generated file. */\n';
 write(path.join(root,'website/assets/css/fb-v3.css'),banner+scope(fs.readFileSync(path.join(base,'fb.css'),'utf8'))+'\n'+scope(fs.readFileSync(path.join(base,'fb-v3.css'),'utf8')));
 const layout=fs.readFileSync(path.join(root,'website/assets/css/tool-layout.css'),'utf8');
 const shell=layout.slice(layout.indexOf('body.nel-opb-v3 > .nel-tool-hero')).replace(/nel-opb-v3/g,'nel-tool-v3');
 write(path.join(root,'website/assets/css/fb-v3-prod.css'),banner+scope(fs.readFileSync(path.join(base,'fb-v3-prod.css'),'utf8'))+'\n'+shell+`\n
/* Existing calculators use several field/result layouts; preserve their domain
   hierarchy while giving all of them the baseline workbench surfaces. */
body.nel-tool-v3 > main.tool-shell{width:100%;margin:0 auto;max-width:1180px;padding:0 28px 40px;min-width:0}
body.nel-tool-v3 > main > .tool-head{display:block}
body.nel-tool-v3 .tool-head .tool-page-label{max-width:100%;margin:0;color:var(--v3-ink);font-size:40px;line-height:1.1}
body.nel-tool-v3 .tool-head .tool-lede{font-size:16px;max-width:760px}
body.nel-tool-v3 .fb-panel:not(:has(> .fb-panel)){background:#fff;border:1px solid var(--v3-border-soft);border-radius:16px;padding:24px;box-shadow:0 1px 0 rgba(15,23,42,.03)}
body.nel-tool-v3 .readout:not(:has(> .readout)){padding:24px;border:1px solid var(--v3-border-soft);border-radius:14px;background:radial-gradient(520px 280px at 100% 0%,rgba(59,130,246,.07),transparent 55%),linear-gradient(165deg,var(--v3-panel-bg) 0%,var(--v3-panel-bg-2) 60%,#F1F5F9 100%);min-width:0}
/* Existing Fieldbook panels already distribute spacing to .panel-h/.fs and
   .ro-main. Keep that real component composition instead of adding an inset. */
body.nel-tool-v3 .fb-panel:has(> .fs),body.nel-tool-v3 .readout:has(> .ro-main){padding:0}
body.nel-tool-v3 .nel-generated-section-title{display:none}
body.nel-tool-v3 .f input:not([type=checkbox]):not([type=radio]):not(.inp *),body.nel-tool-v3 .f select:not(.inp *),body.nel-tool-v3 .f textarea{max-width:100%;font:500 14px var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 .f > input:not([type=checkbox]):not([type=radio]),body.nel-tool-v3 .f > select,body.nel-tool-v3 .f > textarea{width:100%;min-height:42px;border:1px solid var(--v3-border-soft);border-radius:8px;background:#fff;padding:9px 11px}
body.nel-tool-v3 .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
body.nel-tool-v3 .f{min-width:0}
body.nel-tool-v3 .f label{font:500 14px/1.6 var(--sans);color:var(--ink-2)}
body.nel-tool-v3 .prose .fb-fold-body > h2:first-child,body.nel-tool-v3 .prose .fb-fold-body > h3:first-child{margin:0 0 16px;font-size:20px}
body.nel-tool-v3 .prose .content,body.nel-tool-v3 .prose .content-section{width:auto;max-width:none;margin:0;padding:0;border:0;background:transparent;box-shadow:none}
body.nel-tool-v3 .fb-fold-body{overflow-wrap:anywhere}
body.nel-tool-v3 .fb-fold-body table{display:block;max-width:100%;overflow-x:auto}
body.nel-tool-v3 [hidden]{display:none!important}
body.nel-tool-v3 .below [id]{scroll-margin-top:90px}
body.nel-tool-v3 .below{min-width:0;grid-column:1 / -1}
body.nel-tool-v3 .readout .big > span{color:inherit}
body.nel-tool-v3{--green:#1F7A4D}
body.nel-tool-v3 .readout .result-hero strong,body.nel-tool-v3 .readout .metric-value,body.nel-tool-v3 .readout .metric strong{color:var(--v3-ink)}
body.nel-tool-v3 main input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]):not(.inp *),body.nel-tool-v3 main select:not(.inp *),body.nel-tool-v3 main textarea{min-width:0;max-width:100%;min-height:42px;border:1px solid var(--v3-border-soft);border-radius:8px;background:#fff;padding:9px 11px;font:500 15px var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main label{font:500 14px/1.6 var(--sans);color:var(--ink-2)}
html[lang^="zh"] body.nel-tool-v3 main label{line-height:1.7}
body.nel-tool-v3 main nav.steps{display:flex;flex-flow:row wrap;gap:8px;margin-bottom:20px}
body.nel-tool-v3 main nav.steps button{flex:0 1 auto;max-width:100%;white-space:normal;font-family:var(--sans)}
body.nel-tool-v3 main .actions{display:flex;flex-wrap:wrap;gap:8px}
body.nel-tool-v3 main .actions button{max-width:100%;white-space:normal;height:auto;min-height:38px}
body.nel-tool-v3 main button.btn,body.nel-tool-v3 main button.primary{max-width:100%;white-space:normal;height:auto;min-height:40px;justify-content:center;text-align:center}
body.nel-tool-v3 .readout .summary-card{display:block}
body.nel-tool-v3 .readout .summary-card > div{min-width:0;width:100%}
body.nel-tool-v3 .readout .summary-card strong{font-size:clamp(28px,3vw,40px);line-height:1.15;overflow-wrap:normal;word-break:normal}
body.nel-tool-v3 main[id] .readout .metrics,body.nel-tool-v3 main[id] .readout .metric-grid,body.nel-tool-v3 main[id] .readout .summary:has(> .metric),body.nel-tool-v3 main[id] .readout > .grid,body.nel-tool-v3 #calculator .readout .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:12px;min-width:0}
body.nel-tool-v3 .readout .metric{min-width:0}
body.nel-tool-v3 .readout .metric strong{white-space:normal;word-break:normal;overflow-wrap:anywhere}
/* Statistics with complete engineering units need at least 129px of text
   space plus 30px card chrome. A 180px track also keeps phones single-column;
   balancing normal word breaks preserves a whole kWh/day, kWh/día or kWh/天. */
body.nel-tool-v3 main[id] .readout .summary:has(> .metric){grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))}
body.nel-tool-v3 .readout .summary:has(> .metric) .metric strong{overflow-wrap:normal;word-break:keep-all;text-wrap:balance}
body.nel-tool-v3 .readout .kv b{color:var(--v3-ink)}
body.nel-tool-v3 .readout .kv span{color:var(--v3-muted)}
body.nel-tool-v3 main[id] > .mode-tabs{grid-column:1 / -1;order:-1;display:flex;flex-wrap:wrap;gap:8px;width:100%;max-width:100%;margin:0 0 16px;padding:0}
body.nel-tool-v3 .tool-head .crumbs{display:flex;flex-wrap:wrap;gap:6px;max-width:100%;padding:0;margin:0 0 14px;font:400 12px/1.4 var(--sans);color:var(--v3-muted);background:transparent;border:0}
/* Match the production workbench heading hierarchy, retaining all authored
   heading/help text and hiding only the superseded decorative blue glyph. */
body.nel-tool-v3 main[id] .nel-tool-input > .section-title,body.nel-tool-v3 main[id] .nel-tool-result > .section-title{display:block;padding:0;margin:0 0 18px;border:0;background:transparent;min-height:0}
body.nel-tool-v3 main[id] .nel-tool-input > .section-title .section-icon,body.nel-tool-v3 main[id] .nel-tool-result > .section-title .section-icon{display:none}
body.nel-tool-v3 main[id] .nel-tool-input > .section-title h2,body.nel-tool-v3 main[id] .nel-tool-input > h2{margin:0;color:var(--v3-ink);font:600 15px/1.4 var(--sans);letter-spacing:-.01em}
body.nel-tool-v3 main[id] .nel-tool-result > .section-title h2,body.nel-tool-v3 main[id] .nel-tool-result > h2{margin:0;color:var(--v3-muted);font:600 13px/normal var(--sans);letter-spacing:0}
body.nel-tool-v3 main[id] .nel-tool-input > .section-title p,body.nel-tool-v3 main[id] .nel-tool-result > .section-title p{margin:6px 0 0;color:var(--v3-muted);font:400 13px/1.5 var(--sans);max-width:100%}
@media(max-width:768px){body.nel-tool-v3 > main.tool-shell{padding:0 18px 40px}body.nel-tool-v3 .fields{grid-template-columns:minmax(0,1fr)}body.nel-tool-v3 .tool-head .tool-page-label{font-size:30px}body.nel-tool-v3 .fb-panel:not(:has(> .fb-panel)):not([data-nel-panel-layout="domain"]),body.nel-tool-v3 .readout:not(:has(> .readout)){padding:18px}body.nel-tool-v3 .below > .toc{display:none!important}}
/* Canonical components must outrank domain ID-scoped legacy paint. */
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input label{font:500 14px/1.6 var(--sans);color:var(--ink-2)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input label{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input > h2.panel-h{margin:0 0 18px;padding:0;border:0;display:block;color:var(--ink);font:600 15px/1.6 var(--sans);letter-spacing:-.01em}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input > h2.panel-h{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) > .nel-tool-result.readout{border:1px solid var(--v3-border-soft);border-radius:14px;background:radial-gradient(520px 280px at 100% 0%,rgba(59,130,246,.07),transparent 55%),linear-gradient(165deg,var(--v3-panel-bg) 0%,var(--v3-panel-bg-2) 60%,#F1F5F9 100%)}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]):not(.inp *){height:40px;min-height:40px;border:1px solid var(--v3-border-soft);border-radius:8px;background:#fff;padding:0 12px;font:500 15px var(--mono);color:var(--ink)}
body.nel-tool-v3 main:is(#calculator,main) .inp :is(input,select){all:unset;flex:1;min-width:0;max-width:100%;width:100%;font:500 15px var(--mono);color:var(--ink)}
body.nel-tool-v3 main:is(#calculator,main) button.btn-primary{background:linear-gradient(180deg,#F06A1E,var(--v3-accent));border:1px solid transparent;border-radius:10px;color:#fff;box-shadow:0 8px 18px -10px rgba(232,89,12,.55)}
body.nel-tool-v3 main:is(#calculator,main){color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) > .nel-tool-input.fb-panel{border-color:var(--v3-border-soft);border-radius:16px;background:#fff;color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input :is(.panel-h h2,h2.panel-h){color:var(--ink);font:600 15px/1.6 var(--sans);letter-spacing:-.01em}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input :is(.panel-h h2,h2.panel-h){line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) button.btn-primary{font:400 15.5px/1.6 var(--sans);padding:0 16px;height:40px}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) button.btn-primary{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) .faq summary{line-height:1.6}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .faq summary{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) .inp select{font:500 14.5px var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) .inp > span{padding:0;margin-left:auto;font:12px var(--mono);color:var(--faint);flex-shrink:0}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input .card-heading h2{font:600 15px/1.6 var(--sans);color:var(--ink);letter-spacing:-.01em}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input .card-heading h2{line-height:1.7}
/* ODF A/B/C dynamic plans keep their layout and share the same field chrome. */
body.nel-tool-v3 main:is(#calculator,main) .odn-card label{font:500 14px/1.6 var(--sans);color:var(--ink-2)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .odn-card label{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) .odn-card :is(input,select){height:40px;min-height:40px;border:1px solid var(--v3-border-soft);border-radius:8px;background:#fff;padding:0 12px;font:500 15px var(--mono);color:var(--ink)}
body.nel-tool-v3 main:is(#calculator,main) .odn-card select{font-size:14.5px;color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) .odn-card.nel-tool-input > h2{margin:0 0 18px;padding:0;border:0;font:600 15px/1.6 var(--sans);color:var(--ink);letter-spacing:-.01em}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .odn-card.nel-tool-input > h2{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) button.btn{font:400 15.5px/1.6 var(--sans);border:1px solid transparent;border-radius:10px;padding:0 16px;height:40px;color:var(--ink);background:#fff}
body.nel-tool-v3 main:is(#calculator,main) button.btn-primary{background:linear-gradient(180deg,#F06A1E,var(--v3-accent));color:#fff}
body.nel-tool-v3 main:is(#calculator,main) button.btn-ghost{border-color:var(--v3-border-soft)}
body.nel-tool-v3 main:is(#calculator,main) .inp > :is(span,u){padding:0;background:transparent;border:0}
body.nel-tool-v3 main:is(#calculator,main) .inp:has(> input) > select{flex:0 1 auto;width:auto;max-width:45%}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input > h2.panel-h{padding:0;border:0;color:var(--ink)}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input > select{height:40px;font:500 14.5px var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) .faq summary{padding:0}
body.nel-tool-v3 main:is(#calculator,main) .odn-card .actions button:not(.btn-primary){font:400 15.5px/1.6 var(--sans);height:40px;padding:0 16px;border:1px solid var(--v3-border-soft);border-radius:10px;background:#fff;color:var(--ink)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .odn-card .actions button:not(.btn-primary){line-height:1.7}
body.nel-tool-v3 main .input-actions{grid-template-columns:repeat(2,minmax(0,1fr))}
body.nel-tool-v3 main .input-actions button{min-width:0;overflow-wrap:anywhere}
/* Dynamic controls share the baseline by kind, including table and mode rows. */
body.nel-tool-v3 main:is(#calculator,main) input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]):not([type=color]):not(.inp *){height:40px;min-height:40px;border:1px solid var(--v3-border-soft);border-radius:8px;padding:0 12px;font:500 15px var(--mono);color:var(--ink);background:#fff}
body.nel-tool-v3 main:is(#calculator,main) select:not([multiple]):not([size]):not(.inp *){height:40px;min-height:40px;border:1px solid var(--v3-border-soft);border-radius:8px;padding:0 12px;font:500 14.5px var(--mono);color:var(--v3-ink);background:#fff}
body.nel-tool-v3 main:is(#calculator,main) .inp input{font:500 15px var(--mono);color:var(--ink)}
body.nel-tool-v3 main:is(#calculator,main) .inp select{font:500 14.5px var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input .subheading{font:600 12.5px var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--faint);margin:0 0 12px;display:flex;gap:10px;align-items:center}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input .subheading:after{content:"";flex:1;height:1px;background:var(--line)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) button.btn{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input h2{font:600 15px/1.6 var(--sans);color:var(--ink);letter-spacing:-.01em}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) .nel-tool-input h2{line-height:1.7}
/* Explicit generated groups use the actual OPB .grp surface, not another bounded card. */
body.nel-tool-v3 main:is(#calculator,main) [data-nel-group-surface]{border:0;border-top:1px solid var(--v3-navy-line);border-radius:0;background:transparent;box-shadow:none;padding:14px 18px 6px}
body.nel-tool-v3 main:is(#calculator,main) [data-nel-result-region] [data-nel-readout-role="secondary"]{font:500 17px/normal var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main) [data-nel-result-region] [data-nel-readout-role="label"]{font:400 14.5px/1.6 var(--sans);color:var(--v3-readout-mute)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) [data-nel-result-region] [data-nel-readout-role="label"]{line-height:1.7}
/* Native history record roles borrow the actual OPB record, meta and summary components. */
body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-record{border:1px solid var(--v3-border-soft);border-radius:12px;padding:12px 14px;background:#fff}
body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-summary{font:400 12.5px/1.6 var(--sans);color:var(--v3-muted)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-summary{line-height:1.7}
body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-date{font:400 12px/normal var(--mono);color:var(--v3-muted)}
/* Native project history titles alias the actual OPB history title typography. */
body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-title{font:700 14.5px/1.6 var(--sans);color:var(--v3-ink)}
html[lang^="zh"] body.nel-tool-v3 main:is(#calculator,main) #historyList .nel-history-title{line-height:1.7}
/* Compact result toolbars and small history actions are distinct OPB families. */
body.nel-tool-v3 main:is(#calculator,main) .ro-acts button:not(.btn){border-radius:0}
body.nel-tool-v3 main:is(#calculator,main) button.btn.btn-sm{height:34px;min-height:34px;padding:0 12px;border-radius:8px}
body.nel-tool-v3 main:is(#calculator,main) .nel-tool-result h2.ro-h{margin:0 0 18px;padding:0;border:0;font:600 13px/normal var(--sans);letter-spacing:0;color:var(--v3-muted)}
/* Existing strong/small value slots alias the canonical .grp .row b/span roles. */
body.nel-tool-v3 main .readout .grp .row strong{font:500 17px var(--mono);color:var(--v3-ink);white-space:normal;text-align:right}
body.nel-tool-v3 main .readout .grp .row strong > span{font:inherit;color:inherit}
body.nel-tool-v3 main .readout .grp .row > small{font:400 14.5px/1.6 var(--sans);color:var(--v3-readout-mute)}
body.nel-tool-v3 main .readout .grp .row strong small{font:400 13px var(--mono);color:var(--v3-readout-mute);margin-left:3px}
/* Explicit canonical health enums keep their authored domain enum and OPB badge family. */
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .status[data-nel-health-status]{display:inline-flex;align-items:center;gap:7px;margin-left:auto;font:600 13.5px/normal var(--sans);letter-spacing:0;text-transform:none;border-radius:999px;padding:4px 11px;border:1px solid}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .status[data-nel-health-status].st-pass{background:rgba(16,185,129,.12);color:#059669;border-color:rgba(16,185,129,.28)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .status[data-nel-health-status].st-marginal{background:rgba(245,158,11,.12);color:#B45309;border-color:rgba(245,158,11,.28)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .status[data-nel-health-status].st-fail{background:rgba(239,68,68,.10);color:#DC2626;border-color:rgba(239,68,68,.28)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .readout [data-nel-readout-role="explanation"]{font:400 14.5px/1.5 var(--sans);color:var(--v3-ink-2)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .status[data-nel-neutral-status]{display:inline-flex;align-items:center;gap:7px;margin-left:auto;font:600 13.5px/normal var(--sans);letter-spacing:0;text-transform:none;border-radius:999px;padding:4px 11px;border:1px solid var(--v3-border-soft);background:var(--v3-panel-bg-2);color:var(--v3-muted)}
/* Reviewed professional heading aliases reuse OPB panel-h, ro-h and grp h3. */
body.nel-tool-v3 main:is(#calculator,main) [data-nel-heading-role="result-group"]{font:600 12.5px/normal var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--v3-muted);margin:0 0 4px}
/* Source-reviewed scalar aliases of OPB .grp .row b, .eqn and readout code. */
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .readout [data-nel-readout-role="secondary"]{font:500 17px/normal var(--mono);color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .readout [data-nel-readout-role="identifier"],body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] .readout [data-nel-readout-role="annotation"]{font:500 13.5px/1.5 var(--mono);color:var(--v3-ink);white-space:normal;overflow-wrap:anywhere;word-break:normal}
body.nel-tool-v3 main[data-nel-readout-state="healthy"] .readout .ro-main .big{color:#059669}
body.nel-tool-v3 main[data-nel-readout-state="warning"] .readout .ro-main .big{color:#B45309}
body.nel-tool-v3 main[data-nel-readout-state="failed"] .readout .ro-main .big{color:#DC2626}
/* Canonical code, command output and native text-area input share OPB Geist Mono. */
body.nel-tool-v3.v3 main:is(#calculator,main) :is(code,pre,textarea){font-family:var(--mono)}
/* Reviewed prose conclusions and address classifications are not numeric KPIs. */
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] [data-nel-readout-role="explanation"]{font:400 14.5px/1.5 var(--sans);letter-spacing:0;color:var(--v3-ink-2)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] [data-nel-readout-role="classification"],body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] [data-nel-readout-role="classificationBadge"]{font:500 13.5px/normal var(--sans);letter-spacing:0;color:var(--v3-ink)}
body.nel-tool-v3 main:is(#calculator,main)[data-nel-readout-roles] [data-nel-readout-role="classificationBadge"]{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--v3-border-soft);border-radius:999px;padding:4px 11px;background:var(--v3-panel-bg-2)}
/* Summary headlines reuse the real OPB numeric role, with no status-colored surface. */
body.nel-tool-v3 main .readout .summary-card:is(:has(> .ro-main),.ro-main){min-height:0;padding:0;border:0;border-radius:0;background:none}
body.nel-tool-v3 main .readout .summary-card .ro-main{padding:16px 18px 18px}
body.nel-tool-v3 main .readout .summary-card .lbl{margin:0;font:400 14.5px/1.6 var(--sans);color:var(--v3-readout-mute)}
body.nel-tool-v3 main .readout .summary-card strong.big{display:block;font:500 48px/1 var(--mono);letter-spacing:-.05em;margin-top:8px;white-space:nowrap;color:var(--v3-ink)}
body.nel-tool-v3 main .readout .summary-card strong.big small{font-size:20px;font-weight:500;letter-spacing:0;margin-left:6px;color:var(--v3-readout-mute)}
body.nel-tool-v3 main .readout .big small[data-nel-readout-unit]{margin-left:0}
body.nel-tool-v3 main .readout .ro-main .big[data-nel-readout-format="duration"]{white-space:normal;overflow-wrap:anywhere}
body.nel-tool-v3 main .readout .big[data-nel-readout-format="duration"] small[data-nel-readout-unit]{display:inline-block;max-width:100%;white-space:normal;line-height:1.4;vertical-align:baseline}
@media(max-width:640px){body.nel-tool-v3 main .readout .summary-card strong.big{font-size:40px}}
${narrowComponents}
${inputFocus}
${domainComponents}
`);
 // Shared platform chrome must opt out for this genuine migrated shell too.
 for(const name of ['tool-layout.css','tool-design-system.css','mobile-branding.css']){const file=path.join(root,'website/assets/css',name),old=fs.readFileSync(file,'utf8');write(file,old.replace(/:not\(\.nel-opb-v3\)(?!:not\(\.nel-tool-v3\))/g,':not(.nel-opb-v3):not(.nel-tool-v3)'));}
}
module.exports={scope,generate,narrowComponents,inputFocus,domainComponents};
