#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path');
const {stableFileHash}=require('./stable-text-hash');
const D=require('./lib/tool-v3-dom');
const roles=require('./lib/tool-v3-component-roles');
const managedFingerprintPaths=new Set(require('./lib/tool-v3-approved-script-revisions.json').deploymentPaths);
const root=path.resolve(__dirname,'..');
function write(file,html){for(let attempt=0;;attempt++)try{fs.writeFileSync(file,html);return;}catch(error){if(attempt>=8)throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,40);}}
const preserved=new Set(['optical-power-budget']);
const slugs=[...new Set([...require('../src/registry/tool-registry.json').filter(t=>t.status==='active').map(t=>t.id),...require('./lib/supplemental-tool-slugs')])];
const labels={en:['On this page','Engineering workflow','About & applicability','How it’s calculated','Status rules','Component check','FAQ','Recent calculations','Official references','Content review','PON toolkit'],zh:['本页导航','工程工作流','关于与适用范围','计算方法','状态规则','分项核对','问答','最近计算','官方依据','内容复核','PON 工具组'],es:['En esta página','Flujo de ingeniería','Acerca de y aplicabilidad','Cómo se calcula','Reglas de estado','Comprobación de componentes','Preguntas frecuentes','Cálculos recientes','Referencias oficiales','Revisión de contenido','Kit PON']};
const anchors=['about-scope','methodology','status-rules','component-check','faq','history','references','content-review','pon-toolkit','nel-tool-graph'];
const foldAnchors=new Set(anchors.slice(0,4));
function normalizeBreadcrumbs(dom){
 const body=D.all(dom,n=>n.tag==='body')[0],head=D.all(body,n=>D.has(n,'tool-head'))[0];
 const canonical=head&&D.all(head,n=>D.has(n,'crumbs'))[0];if(!canonical)return;
 const links=node=>D.all(node,n=>n.tag==='a').map(n=>D.text(n));
 for(const duplicate of body.children.filter(n=>typeof n!=='string'&&D.has(n,'breadcrumbs')&&!D.has(n,'tool-return-nav'))){
  // These authored navigation copies repeat the canonical return path. Remove
  // only matching navigation labels; the canonical shell also corrects the
  // stale Spanish copy's pre-locale relative paths. Distinct text is reviewed.
  if(D.text(duplicate)!==D.text(canonical)||JSON.stringify(links(duplicate))!==JSON.stringify(links(canonical)))throw Error('Distinct legacy breadcrumb requires explicit preservation');
  if(D.attr(duplicate,'id')||D.all(duplicate,n=>D.attr(n,'id')).length)throw Error('Legacy breadcrumb has an original ID');
  D.remove(body,duplicate);
 }
}
function normalizeDocs(dom){
 for(const block of D.all(dom,n=>anchors.includes(D.attr(n,'id'))&&D.attr(n,'id')!=='nel-tool-graph')){
  if(D.attr(block,'data-nel-v3-title-normalized')==='1')continue;
  const id=D.attr(block,'id'),body=block.children.find(n=>typeof n!=='string'&&D.has(n,'fb-fold-body'));if(!body)continue;
  const generatedTitle=block.children.find(n=>typeof n!=='string'&&(n.tag==='summary'||(n.tag==='h2'&&D.all(n,c=>D.has(c,'fb-fold-title')).length)));
  const originalHeading=body.children.find(n=>typeof n!=='string'&&['h2','h3'].includes(n.tag));
  if(foldAnchors.has(id)){D.set(block,'open',null);if(generatedTitle&&originalHeading){D.remove(body,originalHeading);originalHeading.tag='span';originalHeading.start=originalHeading.start.replace(/^<h[23]/,'<span');originalHeading.end='</span>';D.add(originalHeading,'fb-fold-title');generatedTitle.children=[originalHeading];}}
  else{const tag=id==='faq'?'div':'section';block.tag=tag;block.start=block.start.replace(/^<[^\s>]+/,'<'+tag);block.end='</'+tag+'>';D.set(block,'class',id==='faq'?'blk faq':id==='pon-toolkit'?'content-section nel-tool-supporting-section':'blk');D.set(block,'open',null);if(id==='pon-toolkit')D.set(block,'aria-labelledby','pon-toolkit-title');if(generatedTitle&&originalHeading){D.remove(block,generatedTitle);D.remove(body,originalHeading);block.children.unshift(originalHeading);}}
  D.set(block,'data-nel-v3-title-normalized','1');
 }
}
function normalizePanels(dom,slug){
 const body=D.all(dom,n=>n.tag==='body')[0];
 const main=D.all(body,n=>n.tag==='main')[0];if(roles.readoutRoles[slug])D.set(main,'data-nel-readout-roles',encodeURIComponent(JSON.stringify(roles.readoutRoles[slug])));if(!roles.identifierTools.includes(slug))D.set(main,'data-nel-readout-rows',encodeURIComponent(roles.readoutRows));for(const tabs of [...body.children].filter(n=>typeof n!=='string'&&D.has(n,'mode-tabs'))){D.remove(body,tabs);main.children.splice(1,0,tabs);}
 if(roles.professionalOutputs[slug])D.set(main,'data-nel-professional-outputs',encodeURIComponent(JSON.stringify(roles.professionalOutputs[slug])));
 for(const owner of roles.resultPanelOwners[slug]||[])for(const panel of D.all(main,n=>n.tag===owner.tag&&D.has(n,owner.className)&&D.attr(n,'aria-live')===owner.ariaLive))D.add(panel,'nel-tool-result','readout');
 // Classify authored secondary input/result panels without moving domain layout.
 for(const card of D.all(main,n=>D.has(n,'input-card')||D.has(n,'result-card')||D.has(n,'builder')||D.has(n,'odn-card'))){
  const fields=D.all(card,n=>['input','select','textarea'].includes(n.tag)).length;
  if(D.has(card,'input-card')||(D.has(card,'builder')&&fields)||D.all(card,n=>D.attr(n,'id')==='plans').length)D.add(card,'nel-tool-input','fb-panel');
  else if(D.has(card,'result-card')||D.all(card,n=>D.attr(n,'id')==='generatedOutput').length)D.add(card,'nel-tool-result','readout');
 }
 const combined=D.all(main,n=>D.attr(n,'id')==='panel-summary')[0];if(combined)for(const card of D.all(combined,n=>D.has(n,'card')))D.add(card,'nel-tool-result','readout');
 for(const panel of D.all(main,n=>D.has(n,'nel-tool-input')||D.has(n,'nel-tool-result'))){const h=D.all(panel,n=>n.tag==='h2')[0];if(h)D.add(h,D.has(panel,'nel-tool-input')?'panel-h':'ro-h');}
 // Adopt OPB component classes on the existing DOM rather than overlaying a
 // second input skin. Textareas and non-text widgets keep their domain layout.
 const supportedControl=n=>n.tag==='select'&&!/\smultiple(?:\s|=|>)/i.test(n.start)&&!(Number(D.attr(n,'size'))>1)||n.tag==='input'&&!['checkbox','radio','range','file','hidden','color','button','submit','reset','image'].includes(D.attr(n,'type').toLowerCase());
 for(const field of D.all(main,n=>D.has(n,'field')||D.has(n,'form-group')||D.has(n,'f'))){
  D.add(field,'f');
  const directControls=field.children.filter(n=>typeof n!=='string'&&supportedControl(n));
  if(directControls.length!==1||field.children.some(n=>typeof n!=='string'&&n.tag==='button'))continue;
  for(const control of directControls){
   const at=field.children.indexOf(control),wrapper=D.el('div',{class:'inp input-wrap'+(control.tag==='select'?' sel':'')},[control]);field.children.splice(at,1,wrapper);
  }
 }
 for(const wrapper of D.all(main,n=>D.has(n,'input-wrap'))){const controls=D.all(wrapper,n=>['input','select','textarea'].includes(n.tag));if(controls.length>0&&controls.length<=2&&controls.every(supportedControl)){D.add(wrapper,'inp');if(controls[0].tag==='select')D.add(wrapper,'sel');}}
 for(const button of D.all(main,n=>n.tag==='button')){
  const id=D.attr(button,'id');
  if(roles.primaryActions.includes(id)||['primary','primary-action'].some(c=>D.has(button,c)))D.add(button,'btn','btn-primary');
  else if(['resetBtn','reset'].includes(id)||['secondary','secondary-action'].some(c=>D.has(button,c)))D.add(button,'btn','btn-ghost');
 }
 // Full-size workflow actions keep authored handlers and distinct draft/template roles.
 for(const group of D.all(main,n=>roles.ghostGroups.some(c=>D.has(n,c))&&!D.has(n,'ro-acts')&&!D.has(n,'result-actions')&&!D.has(n,'export-actions'))){for(const button of group.children.filter(n=>typeof n!=='string'&&n.tag==='button'))if(!D.has(button,'btn-primary'))D.add(button,'btn','btn-ghost');}
 // Editor additions are full ghost actions; row removal is compact ghost.
 for(const button of D.all(main,n=>n.tag==='button'&&roles.ghostActions.includes(D.attr(n,'id'))))D.add(button,'btn','btn-ghost');
 for(const panel of D.all(main,n=>D.has(n,'nel-tool-result')))for(const heading of D.all(panel,n=>n.tag==='h2')){
  const parent=[panel,...D.all(panel,()=>true)].find(n=>n.children.includes(heading)),grand=[panel,...D.all(panel,()=>true)].find(n=>n.children.includes(parent));
  if(parent===panel||D.has(parent,'panel')||['section-heading','result-head'].some(c=>D.has(parent,c)||D.has(grand,c)))D.add(heading,'ro-h');
 }
 for(const button of D.all(main,n=>n.tag==='button'&&roles.compactHistory.includes(D.attr(n,'id'))))D.add(button,'btn','btn-ghost','btn-sm');
 for(const tabs of D.all(main,n=>D.has(n,'mode-tabs')||(roles.stepNavigation.includes(slug)&&n.tag==='nav'&&D.has(n,'steps'))))D.add(tabs,'tabs');
 for(const presets of D.all(main,n=>D.has(n,'preset-bar')))D.add(presets,'presets');
 for(const toggle of D.all(main,n=>n.tag==='button'&&D.has(n,'advanced-toggle')))D.add(toggle,'btn','btn-ghost','btn-sm');
 for(const result of D.all(main,n=>D.has(n,'nel-tool-result')||D.has(n,'readout')))for(const actions of D.all(result,n=>D.has(n,'result-actions')||D.has(n,'export-actions')))D.add(actions,'ro-acts');
 for(const panel of D.all(body,n=>D.has(n,'nel-tool-input')||D.has(n,'nel-tool-result'))){const result=D.has(panel,'nel-tool-result');for(const title of panel.children.filter(n=>typeof n!=='string'&&(D.has(n,'section-title')||n.tag==='h2')))D.add(title,result?'ro-h':'panel-h');}
 // Result toolbar actions use OPB's compact family, not full input action chrome.
 for(const toolbar of D.all(main,n=>D.has(n,'ro-acts')))for(const button of D.all(toolbar,n=>n.tag==='button'&&!D.has(n,'btn-primary'))){D.set(button,'class',D.attr(button,'class').split(/\s+/).filter(c=>c&&!['btn','btn-ghost','btn-sm'].includes(c)).join(' ')||null);}
 // Reviewed professional card-heading owners; retain their domain layout and hooks.
 if(slug==='network-change-planner-mop-generator'){
  for(const panel of D.all(main,n=>['runbook-card','verification-card','mop-document'].some(c=>D.has(n,c)))){
   const input=D.has(panel,'verification-card');D.add(panel,input?'nel-tool-input':'nel-tool-result');
   for(const h of D.all(panel,n=>n.tag==='h2'))D.add(h,input?'panel-h':'ro-h');
  }
  for(const panel of D.all(main,n=>D.has(n,'result-card')))for(const h of D.all(panel,n=>n.tag==='h3'))D.set(h,'data-nel-heading-role','result-group');
 }
 if(slug==='network-risk-hidden-hazard-assessment-generator'){
  for(const panel of D.all(main,n=>n.tag==='section'&&D.has(n,'card'))){D.add(panel,'nel-tool-input','fb-panel');D.set(panel,'data-nel-panel-layout','domain');for(const h of panel.children.filter(n=>typeof n!=='string'&&n.tag==='h2'))D.add(h,'panel-h');}
  for(const panel of D.all(main,n=>n.tag==='aside'&&D.has(n,'card')))for(const h of D.all(panel,n=>n.tag==='h3'))D.set(h,'data-nel-heading-role','result-group');
 }
 // Headline summaries and supporting metrics have different OPB readout roles.
 // Keep authored values/hooks and multi-headline engineering meaning intact.
 const headlineIds=new Set([...roles.numericHeadlines,...roles.durationHeadlines,...roles.ratioHeadlines]);
 for(const summary of D.all(main,n=>D.has(n,'summary-card'))){
  D.add(summary,'ro-l1');
  for(const block of summary.children.filter(n=>typeof n!=='string'&&n.tag==='div')){
   const value=block.children.find(n=>typeof n!=='string'&&n.tag==='strong'),label=block.children.find(n=>typeof n!=='string'&&n.tag==='p');
   if(!value||!label||![value,...D.all(value,()=>true)].some(n=>headlineIds.has(D.attr(n,'id'))))continue;D.add(block,'ro-main');D.add(value,'big');D.add(label,'lbl');const slot=[value,...D.all(value,()=>true)].find(n=>headlineIds.has(D.attr(n,'id')));if(slot&&!D.all(slot,n=>D.attr(n,'id')).length)D.set(slot,'data-nel-readout-number','1');if(roles.durationHeadlines.includes(D.attr(slot,'id')))D.set(slot,'data-nel-readout-format','duration');
  }
 }
 // Explicit mode headlines and OTDR loss KPIs; event counts remain secondary.
 for(const id of roles.modeHeadlines){
  const value=D.all(main,n=>D.attr(n,'id')===id)[0];if(!value)continue;const block=[main,...D.all(main,()=>true)].find(n=>n.children.includes(value)),label=block.children.find(n=>typeof n!=='string'&&n.tag==='small');if(!label)continue;D.add(block,'ro-main');D.add(label,'lbl');D.add(value,'big');D.set(value,'data-nel-readout-number','1');if(roles.durationHeadlines.includes(id))D.set(value,'data-nel-readout-format','duration');
 }
 for(const id of roles.opticalLossHeadlines){
  const value=D.all(main,n=>D.attr(n,'id')===id)[0];if(!value)continue;const strong=[main,...D.all(main,()=>true)].find(n=>n.children.includes(value)),card=[main,...D.all(main,()=>true)].find(n=>n.children.includes(strong));if(strong.tag!=='strong'||!D.has(card,'summary-card'))continue;D.add(card,'ro-main');D.add(strong,'big');const label=card.children.find(n=>typeof n!=='string'&&n.tag==='small');if(label)D.add(label,'lbl');strong.children=strong.children.map(n=>typeof n==='string'&&/\bdB\b/.test(n)?D.el('small',{},[n]):n);
 }
 for(const id of roles.additionalHeadlines[slug]||[]){
  const slot=D.all(main,n=>D.attr(n,'id')===id)[0];if(!slot)continue;const parent=[main,...D.all(main,()=>true)].find(n=>n.children.includes(slot)),value=D.has(parent,'big')||parent.tag==='strong'?parent:slot,block=[main,...D.all(main,()=>true)].find(n=>n.children.includes(value));D.add(value,'big');D.set(slot,'data-nel-readout-number','1');const label=block.children.find(n=>typeof n!=='string'&&n!==value&&['small','p'].includes(n.tag));if(label)D.add(label,'lbl');if(D.has(block,'summary-card')){const at=block.children.indexOf(value),wrapper=D.el('div',{class:'ro-main'},[...(label?[label]:[]),value]);D.remove(block,value);if(label)D.remove(block,label);block.children.splice(Math.max(0,at-(label?1:0)),0,wrapper);}else D.add(block,'ro-main');value.children=value.children.map(n=>typeof n==='string'&&/kW/.test(n)?D.el('small',{},[n]):n);
 }
 for(const id of roles.readoutRoles[slug]?.explanation||[]){const note=D.all(main,n=>D.attr(n,'id')===id)[0];if(note){D.add(note,'reason');const parent=[main,...D.all(main,()=>true)].find(n=>n.children.includes(note));D.add(parent,'ro-l1');}}
 const resultPanels=D.all(body,n=>D.has(n,'nel-tool-result'));
 for(const panel of resultPanels){if(resultPanels.some(parent=>parent!==panel&&D.all(parent,n=>n===panel).length))continue;const regions=[panel,...D.all(panel,()=>true)];if(regions.some(n=>['polite','assertive'].includes(D.attr(n,'aria-live'))||(D.attr(n,'aria-live')!=='off'&&['status','alert','log'].includes(D.attr(n,'role')))))continue;if(regions.some(n=>D.attr(n,'aria-live')==='off'))throw Error('Result aria-live=off requires explicit accessibility review');D.set(panel,'aria-live','polite');}
 for(const wrapper of D.all(body,n=>n.tag==='div'&&/(?:^|\s)(?:(?:abw|architecture|asset|oob)-wrap|workshop|tracker)(?:\s|$)/.test(D.attr(n,'class'))))if(!D.all(wrapper,()=>true).length&&!D.text(wrapper))D.remove(body,wrapper);
}
function normalizeSupporting(dom,locale){
 const body=D.all(dom,n=>n.tag==='body')[0],prose=D.all(body,n=>D.has(n,'prose'))[0];if(!prose)return;
 const parentOf=node=>[body,...D.all(body,()=>true)].find(p=>p.children.includes(node));
 let faq=D.all(prose,n=>D.attr(n,'id')==='faq')[0];
 const outside=D.all(prose,n=>n.tag==='details'&&!D.has(n,'fb-fold')).filter(n=>{const summary=n.children.find(c=>typeof c!=='string'&&c.tag==='summary');return summary&&/[?？]\s*$/.test(D.text(summary))&&(!faq||!D.all(faq,c=>c===n).length);});
 if(outside.length){
  const groups=[...new Set(outside.map(parentOf))];
  for(const parent of groups){const questions=outside.filter(n=>parent.children.includes(n));if(!questions.length)continue;
   const dedicated=parent.tag==='div'&&D.has(parent,'faq')&&parent.children.every(n=>typeof n==='string'||['details','h2','h3'].includes(n.tag));
   if(!faq&&dedicated&&!D.attr(parent,'id')){D.remove(body,parent);faq=parent;D.set(faq,'id','faq');D.add(faq,'blk');}
   else{if(!faq)faq=D.el('div',{class:'blk faq',id:'faq'});const first=parent.children.indexOf(questions[0]);const title=parent.children.slice(0,first).reverse().find(n=>typeof n!=='string'&&['h2','h3'].includes(n.tag)&&/faq|preguntas|常见|问答|常見/i.test(D.text(n)));if(title){D.remove(body,title);title.tag='h2';title.start=title.start.replace(/^<h[23]/,'<h2');title.end='</h2>';faq.children.push(title);}for(const q of questions){D.remove(body,q);faq.children.push(q);}}
  }
  if(!D.all(faq,n=>n.tag==='h2').length)faq.children.unshift(D.el('h2',{},[labels[locale][6]]));
  if(!prose.children.includes(faq)){let at=prose.children.findIndex(n=>typeof n!=='string'&&anchors.indexOf(D.attr(n,'id'))>anchors.indexOf('faq'));if(at<0)at=prose.children.length;if(prose.children.slice(0,at).some(n=>typeof n==='string'&&n.includes('<!-- NEL_TOOL_GRAPH_START -->')))at=prose.children.findIndex(n=>typeof n==='string'&&n.includes('<!-- NEL_TOOL_GRAPH_START -->'));prose.children.splice(at,0,faq);}
  const toc=D.all(body,n=>D.has(n,'toc'))[0];if(toc&&!D.all(toc,n=>n.tag==='a'&&D.attr(n,'href')==='#faq').length){let at=toc.children.findIndex(n=>typeof n!=='string'&&n.tag==='a'&&anchors.indexOf(D.attr(n,'href').slice(1))>anchors.indexOf('faq'));if(at<0)at=toc.children.length;toc.children.splice(at,0,D.el('a',{href:'#faq'},[labels[locale][6]]));}
 }
 // The accepted domain FAQ is a plain block, with native questions as direct
 // children. Unwrap former fold/layout containers without rewriting content.
 if(faq){
  // Anonymous legacy layout wrappers may be removed, but authored IDs, data
  // hooks, roles and labelled regions remain owned by the domain document.
  const pureLayout=node=>['div','section'].includes(node.tag)&&
   !/\s(?:id|data-[\w-]+|aria-[\w-]+|role|style|on[\w-]+)\s*(?:=|>)/i.test(node.start)&&
   !D.all(node,n=>['table','figure','canvas','svg','img','aside'].includes(n.tag)).length;
  const unwrap=node=>node.children.flatMap(child=>typeof child!=='string'&&pureLayout(child)?unwrap(child):[child]);
  faq.children=unwrap(faq);
 }
 // The production return line belongs to the document column immediately
 // before the workflow, not the old full-width body/calculator grid column.
 const graph=D.all(prose,n=>D.attr(n,'id')==='nel-tool-graph')[0],hubs=D.all(body,n=>D.has(n,'hub-return'));if(!graph||!hubs.length)return;
 const elements=prose.children.filter(n=>typeof n!=='string'),atGraph=elements.indexOf(graph),prior=elements.slice(atGraph-hubs.length,atGraph);
 if(prior.length===hubs.length&&prior.every((n,i)=>n===hubs[i]))return;
 for(const hub of hubs)D.remove(body,hub);let at=prose.children.findIndex(n=>typeof n==='string'&&n.includes('<!-- NEL_TOOL_GRAPH_START -->'));if(at<0)at=prose.children.indexOf(graph);prose.children.splice(at,0,...hubs);
}
function semantic(title,id){
 if(anchors.includes(id))return id;
 if(/faq|questions|asked|preguntas|问答|常见|問題/.test(title.toLowerCase()))return 'faq';
 if(/\breview\b|\brevisi[oó]n\b|复核|审核|审阅/.test(title.toLowerCase()))return 'content-review';
 if(/reference|sources|standards|referencias|fuentes|normas|依据|参考|标准|来源|权威资料/.test(title.toLowerCase()))return 'references';
 if(/status|reglas|状态|判定|健康/.test(title.toLowerCase()))return 'status-rules';
 if(/component|breakdown|desglose|componentes|分项|分解/.test(title.toLowerCase()))return 'component-check';
 if(/method|calculat|formula|how |built|estimate|c[oó]mo\b|c[aá]lculo|m[eé]todo|计算|公式|方法|如何|使用说明|估算.*建立/.test(title.toLowerCase()))return 'methodology';
 if(/about|scope|applicab|limits|acerca|l[ií]mites|适用|范围|边界|限制/.test(title.toLowerCase()))return 'about-scope';
 if(id==='review')return 'content-review';if(['examples','scenarios'].includes(id))return 'component-check';if(id==='limits')return 'about-scope';return '';
}
function graphFor(slug,locale,strings,dom){
 const graph=require('../website/data/tool-graph.json'),node=graph.tools[slug];const section=D.el('section',{class:'content-section nel-tool-graph',id:'nel-tool-graph','aria-labelledby':'nel-tool-graph-title','data-tool-id':slug},[D.el('h2',{id:'nel-tool-graph-title'},[strings[1]])]);
 if(node){D.set(section,'data-primary-workflow',node.primaryWorkflow||'');const flow=graph.workflows[node.primaryWorkflow]?.translations?.[locale];if(flow)section.children.push(D.el('p',{},[flow.name]),D.el('p',{},[flow.description]));const ids=[...new Set([node.previous,node.next,...node.related].filter(Boolean))];const cards=D.el('div',{class:'nel-tool-graph-related'});for(const id of ids){const t=graph.tools[id];if(t)cards.children.push(D.el('a',{class:'nel-tool-graph-card',href:t.routes[locale==='zh'?'zh-CN':locale]},[D.el('strong',{},[t.translations[locale]?.name||id]),D.el('span',{class:'nel-tool-graph-description'},[t.translations[locale]?.description||''])]));}section.children.push(cards);
 }else{const links=D.all(dom,n=>n.tag==='a'&&D.attr(n,'href')&&!D.attr(n,'href').startsWith('#')).filter(n=>!D.has(n,'language-option'));const unique=new Set();for(const a of links){const href=D.attr(a,'href');let url;try{url=new URL(href,'https://netengineerlab.com/tools/'+slug+'/'+(locale==='en'?'':locale+'/'));}catch{continue;}const target=url.pathname.match(/^\/tools\/([^/]+)\//)?.[1];if(!target||target===slug||!slugs.includes(target)||unique.has(target))continue;unique.add(target);section.children.push(D.el('a',{class:'nel-tool-graph-card',href},[...a.children]));if(unique.size===4)break;}
  // These two planners have no pre-existing cross-tool links. Preserve their
  // own domain guide/topic or cited engineering source as the next resource.
  if(!unique.size)for(const a of links){const href=D.attr(a,'href');let url;try{url=new URL(href,'https://netengineerlab.com/tools/'+slug+'/'+(locale==='en'?'':locale+'/'));}catch{continue;}if(!(url.hostname==='netengineerlab.com'?/\/(?:topics|guides)\/[^/]+\//.test(url.pathname):/^https:/.test(url.protocol))||unique.has(href))continue;unique.add(href);section.children.push(D.el('a',{class:'nel-tool-graph-card',href},[...a.children]));if(unique.size===4)break;}}
 return section;
}
function controlSignature(node){if(node.tag!=='button')return node.start;const copy={...node},classes=D.attr(copy,'class').split(/\s+/).filter(c=>c&&!['btn','btn-primary','btn-ghost','btn-sm'].includes(c));D.set(copy,'class',classes.length?classes.join(' '):null);return copy.start.replace(/\s+>$/, '>');}
function signature(dom){const canonical=D.all(dom,n=>n.tag==='link'&&D.attr(n,'rel')==='canonical')[0],base=D.attr(canonical,'href')||'https://netengineerlab.com/';return {ids:D.all(dom,n=>D.attr(n,'id')).map(n=>D.attr(n,'id')).sort(),controls:D.all(dom,n=>['input','select','textarea','button'].includes(n.tag)).map(controlSignature).sort(),scripts:D.all(dom,n=>n.tag==='script'&&!D.attr(n,'src').includes('tool-v3-navigation.js')).map(n=>{const copy=D.parse(D.render(n)).children[0],src=D.attr(n,'src');let url;try{url=new URL(src,base);}catch{}if(src&&url&&(/^\/tools\/[^/]+\/js\/engine\.js$/.test(url.pathname)||/^\/tools\/(?:poe-voltage-drop-calculator|wireless-link-budget-calculator)\/js\/app\.js$/.test(url.pathname)||url.pathname==='/assets/js/tool-shell-v1.9.9-04.js'||managedFingerprintPaths.has(url.pathname)))D.set(copy,'src',require('./lib/tool-engine-asset-version').withoutVersion(src));return D.render(copy).replace(/(tool-detail-v3\.js)\?v=[^"'\s>]*/g,'$1?v=CONTENT_HASH');})};}
function sameInvariant(a,b){for(const k of ['ids','controls','scripts']){if(k==='ids'){const before=new Map();for(const x of a.ids)before.set(x,(before.get(x)||0)+1);for(const x of b.ids)before.set(x,(before.get(x)||0)-1);for(const [id,n]of before)if(n>0)throw Error('lost ID '+id);}else{let next=b[k];if(k==='scripts'&&!a.scripts.some(s=>s.includes('/tool-shell-v1.9.9-04.js'))){const added=next.filter(s=>s.includes('/tool-shell-v1.9.9-04.js'));if(added.length===1)next=next.filter(s=>s!==added[0]);}if(JSON.stringify(a[k])!==JSON.stringify(next))throw Error('changed '+k);}}}
function repairGeneratedReadoutMetadata(html){
 // Earlier generated raw selectors contained a quoted >, which the lossless
 // tokenizer treats as a tag boundary. Repair only this exact owned metadata
 // and its known duplicated tail; authored controls/text/scripts are untouched.
 const legacy=' data-nel-readout-rows="'+roles.readoutRows+'"',tail=' > div,.metric,.kv"';
 const safe=' data-nel-readout-rows="'+encodeURIComponent(roles.readoutRows)+'"';
 let at=html.indexOf(legacy);
 while(at>=0){let end=at+legacy.length;while(html.startsWith(tail,end))end+=tail.length;html=html.slice(0,at)+safe+html.slice(end);at=html.indexOf(legacy,at+safe.length);}
 return html;
}
function migrate(html,slug,locale){
 if(preserved.has(slug))return html;
 html=repairGeneratedReadoutMetadata(html);
 const isMigrated=/<body\b[^>]*\bdata-nel-v3-migrated=["']1["']/.test(html);
 const dom=D.parse(isMigrated?html:html.replace(/<!-- NEL_TOOL_GRAPH_(?:START|END) -->/g,'')),before=signature(dom),body=D.all(dom,n=>n.tag==='body')[0],head=D.all(dom,n=>n.tag==='head')[0],main=D.all(body,n=>n.tag==='main')[0];if(!main)throw Error(slug+': missing main');
 // A generated page may be revisited after the multilingual builder refreshes
 // assets/navigation. Always normalize assets; construct the skeleton just once.
 D.set(body,'class',D.attr(body,'class').split(/\s+/).filter(c=>c&&!['nel-opb-v3','nel-fieldbook'].includes(c)).join(' '));
 D.add(body,'nel-tool-detail-page','nel-tool-v3','has-mbar','v3');D.set(body,'data-nel-template','tool-detail-v1.3.1');
 D.set(body,'data-nel-offline-worker',fs.existsSync(path.join(root,'website/tools',slug,'sw.js'))?'1':null);
 const baselineHead=D.all(D.parse(fs.readFileSync(path.join(root,'website/tools/optical-power-budget/index.html'),'utf8')),n=>n.tag==='head')[0];
 const baselineFonts=D.all(baselineHead,n=>n.tag==='link'&&/^https:\/\/fonts\.(?:googleapis|gstatic)\.com/.test(D.attr(n,'href')));
 for(const source of baselineFonts){const href=D.attr(source,'href'),isCss=D.attr(source,'rel')==='stylesheet';const existingFonts=D.all(head,n=>n.tag==='link'&&(isCss?D.attr(n,'rel')==='stylesheet'&&D.attr(n,'href').startsWith('https://fonts.googleapis.com/'):D.attr(n,'rel')==='preconnect'&&D.attr(n,'href')===href));let link=existingFonts.shift();if(!link){link=D.parse(D.render(source)).children[0];head.children.push('\n',link);}else if(D.attr(link,'href').replace(/&amp;/g,'&')!==href.replace(/&amp;/g,'&'))D.set(link,'href',href);for(const duplicate of existingFonts)D.remove(head,duplicate);}
 for(const n of D.all(dom,n=>n.tag==='link'&&!D.attr(n,'href').startsWith('/assets/css/fb-v3')&&/(?:fieldbook|\/fb(?:-v3(?:-prod)?)?)\.css(?:\?|$)/.test(D.attr(n,'href'))))D.remove(dom,n);
 for(const name of ['fb-v3.css','fb-v3-prod.css']){const file=path.join(root,'website/assets/css',name),hash=stableFileHash(file,12);let link=D.all(head,n=>n.tag==='link'&&D.attr(n,'href').startsWith('/assets/css/'+name))[0];if(!link){link=D.el('link',{rel:'stylesheet'});head.children.push('\n',link);}D.set(link,'href','/assets/css/'+name+'?v='+hash);}
 let navigation=D.all(head,n=>n.tag==='script'&&D.attr(n,'src').includes('tool-v3-navigation.js'))[0];if(!navigation){navigation=D.el('script',{defer:''});head.children.push('\n',navigation);}const navigationHash=stableFileHash(path.join(root,'website/assets/js/tool-v3-navigation.js'),12);D.set(navigation,'src','/assets/js/tool-v3-navigation.js?v='+navigationHash);
 const shellScripts=D.all(dom,n=>n.tag==='script'&&D.attr(n,'src').includes('/tool-shell-v1.9.9-04.js'));
 if(shellScripts.length>1)throw Error(slug+': duplicate tool shell');
 if(!shellScripts.length)body.children.push('\n',D.el('script',{defer:'',src:'/assets/js/tool-shell-v1.9.9-04.js?v='+stableFileHash(path.join(root,'website/assets/js/tool-shell-v1.9.9-04.js'),12)}));
 for(const script of D.all(dom,n=>n.tag==='script'&&/\/tool-detail-v3\.js(?:\?|$)/.test(D.attr(n,'src'))))D.set(script,'src',D.attr(script,'src').split('?')[0]+'?v='+stableFileHash(path.join(root,'website/assets/js/tool-detail-v3.js'),12));
 for(const name of ['mobile-branding.css','tool-design-system.css','tool-layout.css'])for(const link of D.all(dom,n=>n.tag==='link'&&D.attr(n,'href').split('?')[0].endsWith('/'+name)))D.set(link,'href',D.attr(link,'href').split('?')[0]+'?v='+stableFileHash(path.join(root,'website/assets/css',name),12));
 const canonicalUrl=D.attr(D.all(head,n=>n.tag==='link'&&D.attr(n,'rel')==='canonical')[0],'href')||'https://netengineerlab.com/tools/'+slug+'/';
 for(const script of D.all(dom,n=>n.tag==='script'&&D.attr(n,'src'))){const source=D.attr(script,'src'),url=new URL(source.replace(/&amp;/g,'&'),canonicalUrl);if(url.origin!=='https://netengineerlab.com'||!managedFingerprintPaths.has(url.pathname))continue;const asset=path.join(root,'website',...url.pathname.split('/').filter(Boolean));if(!fs.existsSync(asset))throw Error('Missing managed application asset '+url.pathname);D.set(script,'src',require('./lib/tool-engine-asset-version').withVersion(source,stableFileHash(asset,12)));}
 let theme=D.all(head,n=>n.tag==='meta'&&D.attr(n,'name')==='theme-color')[0];if(!theme){theme=D.el('meta',{name:'theme-color'});head.children.push(theme);}D.set(theme,'content','#176ff2');
 if(D.attr(body,'data-nel-v3-migrated')==='1'){normalizeBreadcrumbs(dom);normalizeDocs(dom);normalizePanels(dom,slug);normalizeSupporting(dom,locale);const output=D.render(dom);sameInvariant(before,signature(D.parse(output)));return output;}
 const strings=labels[locale];
 // Supplemental workshops may place main in a width wrapper. Make the same
 // page-shell hierarchy without changing the workshop's internal steps/forms.
 const originalContainer=[body,...D.all(body,()=>true)].find(n=>n.children.includes(main));
 const wrapperDocs=originalContainer!==body?originalContainer.children.filter(n=>typeof n!=='string'&&['section','details'].includes(n.tag)):[];
 if(!body.children.includes(main)){D.remove(body,main);const footerMarker=body.children.findIndex(n=>typeof n==='string'&&n.includes('<!-- NEL_FOOTER_START -->')),footer=footerMarker>=0?footerMarker:body.children.findIndex(n=>typeof n!=='string'&&n.tag==='footer');body.children.splice(footer<0?body.children.length:footer,0,main);}
 D.add(main,'tool-shell','nel-tool-main');
 let hero=D.all(body,n=>n.tag==='section'&&(D.has(n,'hero')||D.has(n,'nel-tool-hero')))[0];
 let heading=D.all(body,n=>n.tag==='h1')[0];
 if(!hero){hero=D.el('section',{class:'hero nel-tool-hero'});if(heading){D.remove(body,heading);hero.children.push(heading);}body.children.splice(body.children.indexOf(main),0,hero);}
 if(main.children.includes(hero)){D.remove(main,hero);body.children.splice(body.children.indexOf(main),0,hero);}
 D.add(hero,'hero','nel-tool-hero');D.set(hero,'aria-hidden','true');heading=heading||D.all(hero,n=>n.tag==='h1')[0];
 if(!D.all(main,n=>D.has(n,'tool-head')).length){const label=heading?D.el('p',{class:'tool-page-label',role:'heading','aria-level':'1'},[...heading.children]):D.el('p',{class:'tool-page-label'},[slug]);const lede=D.all(hero,n=>n.tag==='p'&&!D.has(n,'eyebrow'))[0];const toolHead=D.el('div',{class:'tool-head'},[label,...(lede?[D.el('p',{class:'tool-lede'},[...lede.children])]:[])]);main.children.unshift(toolHead);}
 if(originalContainer!==body){const toolHead=D.all(main,n=>D.has(n,'tool-head'))[0];for(const n of [...originalContainer.children])if(typeof n!=='string'&&['p','a','nav'].includes(n.tag)){D.remove(originalContainer,n);if(n.tag==='nav'){D.add(n,'crumbs');toolHead.children.unshift(n);}else toolHead.children.push(n);}}
 const toolHead=D.all(main,n=>D.has(n,'tool-head'))[0];if(!D.all(toolHead,n=>D.has(n,'crumbs')).length){const nav=D.all(body,n=>D.has(n,'tool-return-nav')||D.has(n,'breadcrumbs'))[0];if(nav){const crumbs=D.parse(D.render(nav)).children[0];D.set(crumbs,'class','crumbs');for(const n of [crumbs,...D.all(crumbs,()=>true)])D.set(n,'id',null);toolHead.children.unshift(crumbs);}}
 // Gather actual supporting content only. In specialized tools, controls and
 // result sections stay in their original workspace hierarchy.
 const supporting=[...wrapperDocs];const candidates=D.all(body,n=>n.tag==='section'&&(D.has(n,'content')||D.has(n,'content-section')||D.has(n,'nel-tool-supporting-section')||['methodology','faq','history','references','content-review','pon-toolkit','standards','examples','limits','review-and-related'].includes(D.attr(n,'id'))));
 for(const node of candidates){if(candidates.some(p=>p!==node&&D.all(p,n=>n===node).length)||supporting.includes(node))continue;supporting.push(node);}
 // Any document section after main (including supplemental wrapper sections).
 for(const p of [body,...D.all(body,n=>n.tag==='div'&&!D.has(n,'site-shell-header-inner'))]){const mi=p.children.indexOf(main);if(mi>=0)for(const n of p.children.slice(mi+1))if(typeof n!=='string'&&['section','details'].includes(n.tag)&&!supporting.includes(n))supporting.push(n);}
 // Supplemental main has actual parameter/results followed by explanatory cards.
 if(require('./lib/supplemental-tool-slugs').has(slug))for(const n of [...main.children])if(typeof n!=='string'&&n.tag==='section'&&!D.all(n,x=>['input','select','textarea','button'].includes(x.tag)).length&&!D.attr(n,'aria-live')&&!['result','summary'].includes(D.attr(n,'id'))&&!D.has(n,'tool-head')&&!D.all(n,x=>['bandwidth','metrics'].includes(D.attr(x,'id'))).length){if(!supporting.includes(n))supporting.push(n);}
 let below=D.all(body,n=>D.has(n,'below'))[0];if(below){const prose=D.all(below,n=>D.has(n,'prose'))[0];for(const n of (prose||below).children)if(typeof n!=='string'&&!D.has(n,'toc')&&!supporting.includes(n)&&!supporting.some(p=>D.all(n,x=>x===p).length)&&!['script'].includes(n.tag))supporting.push(n);D.remove(body,below);}
 for(let i=supporting.length-1;i>=0;i--)if(supporting.some((p,j)=>j!==i&&D.all(p,n=>n===supporting[i]).length))supporting.splice(i,1);
 // Interactive presets remain before the workbench, like the baseline scenarios.
 for(let i=supporting.length-1;i>=0;i--){const n=supporting[i];if(D.attr(n,'id')==='scenarios'&&D.all(n,x=>x.tag==='button'||D.attr(x,'data-scenario')).length){D.remove(body,n);D.add(n,'scenario-section');main.children.splice(1,0,n);supporting.splice(i,1);}}
 for(const n of [...body.children])if(typeof n!=='string'&&(D.has(n,'tabs')||D.has(n,'mode-tabs'))){D.remove(body,n);main.children.splice(1,0,n);}
 // Older pages combine several real h2 document sections in one wrapper.
 // Split only direct headings, retaining every original node and its copy.
 for(let i=0;i<supporting.length;i++){const n=supporting[i];if(n.tag==='details'||D.attr(n,'id')==='nel-tool-graph')continue;const hs=n.children.filter(c=>typeof c!=='string'&&c.tag==='h2');if(hs.length<2||D.all(n,c=>['input','select','textarea','button'].includes(c.tag)).length)continue;const children=[...n.children],parts=[];let group=[];for(const c of children){if(typeof c!=='string'&&c.tag==='h2'&&group.some(x=>typeof x!=='string'&&x.tag==='h2')){parts.push(group);group=[];}group.push(c);}parts.push(group);n.children=parts[0];const rest=parts.slice(1).map(cs=>D.el('section',{class:'content-section'},cs));supporting.splice(i+1,0,...rest);i+=rest.length;}
 below=D.el('div',{class:'below'});const toc=D.el('nav',{class:'toc','aria-label':strings[0]},[D.el('h4',{},[strings[0]])]),prose=D.el('div',{class:'prose'});below.children=[toc,prose];
 const nativeFaq=[];for(let i=supporting.length-1;i>=0;i--){const node=supporting[i],summary=node.tag==='details'&&!D.has(node,'fb-fold')?node.children.find(n=>typeof n!=='string'&&n.tag==='summary'):null;if(summary&&/[?？]\s*$/.test(D.text(summary))){D.remove(body,node);if(D.attr(node,'id')==='faq')D.set(node,'id',null);nativeFaq.unshift(node);supporting.splice(i,1);}}
 const related=[];for(let i=supporting.length-1;i>=0;i--){const node=supporting[i],h=D.all(node,n=>['h2','h3','summary'].includes(n.tag))[0];if(D.attr(node,'id')!=='pon-toolkit'&&(/\bdata-nel-editorial-links(?:\s|=|>)/.test(node.start)||/^(?:related\b|相关|recursos relacionados|p[aá]ginas relacionadas|herramientas relacionadas)/i.test(D.text(h||'')))){D.remove(body,node);if(node.tag==='details'){node.tag='section';node.start=node.start.replace(/^<details/,'<section');node.end='</section>';D.set(node,'class','content-section');if(h?.tag==='summary'){h.tag='h3';h.start='<h3>';h.end='</h3>';}}related.unshift(node);supporting.splice(i,1);}}
 const existing=new Set(D.all(dom,n=>D.attr(n,'id')).map(n=>D.attr(n,'id')));const used=new Set();const blocks=[];let extra=0;
 for(const section of supporting){D.remove(body,section);const h=D.all(section,n=>['h2','h3','summary'].includes(n.tag))[0];if(!h){prose.children.push(section);continue;}let id=D.attr(section,'id');const originalId=id,rawTitle=D.text(h),mapped=semantic(rawTitle,id);if(id!=='nel-tool-graph')id=mapped||'about-scope';used.add(id);existing.add(id);
  if(id==='nel-tool-graph'){if(section.tag!=='section'){section.tag='section';section.start=section.start.replace(/^<[^\s>]+/,'<section');section.end='</section>';D.set(section,'class','content-section nel-tool-graph');if(h.tag==='summary'){h.tag='div';h.start='<div class="section-heading">';h.end='</div>';}}D.add(section,'content-section','nel-tool-graph');D.set(section,'aria-labelledby','nel-tool-graph-title');if(!D.all(section,n=>D.attr(n,'id')==='nel-tool-graph-title').length)section.children.unshift(D.el('h2',{id:'nel-tool-graph-title'},[strings[1]]));blocks.push({id,node:section,title:strings[1]});continue;}
  const standard=anchors.indexOf(id);const title=standard>=0?strings[standard+2]:rawTitle;
  if(id==='faq')for(const n of [section,...D.all(section,()=>true)])if(/\bdata-nel-faq(?:\s|=|>)/.test(n.start))D.set(n,'data-nel-faq',null);
  if(section.tag==='details'&&D.has(section,'fb-fold')){D.set(section,'open',null);if(originalId!==id){D.set(section,'id',id);if(originalId)section.children.push(D.el('span',{id:originalId}));}const previous=blocks.find(b=>b.id===id);if(previous){D.set(section,'id',null);section.tag='div';section.start=section.start.replace(/^<details/,'<div');section.end='</div>';D.set(section,'class','fb-merged-section');h.tag='div';h.start='<div class="fb-merged-title">';h.end='</div>';D.all(previous.node,n=>D.has(n,'fb-fold-body'))[0].children.push(section);}else blocks.push({id,node:section,title});continue;}
  const fold=D.el('details',{class:'fb-fold blk',id});if(!originalId||originalId===id)D.set(section,'id',null);D.remove(section,h);const sum=D.el('summary',{class:'fb-fold-sum'},[D.el('span',{class:'fb-fold-title'},[title])]);
  // Retain heading IDs/i18n attributes inside the fold body so runtime lookups
  // still target the original node, while the fold summary stays locale-stable.
  const foldBody=D.el('div',{class:'fb-fold-body'},[h,section]);fold.children=[sum,foldBody];const previous=blocks.find(b=>b.id===id);if(previous)D.all(previous.node,n=>D.has(n,'fb-fold-body'))[0].children.push(...foldBody.children);else blocks.push({id,node:fold,title});
 }
 // Supplemental pages have related editorial links, rather than a registry
 // workflow. Use those existing links as the workflow content, with no OPB data.
 if(nativeFaq.length){const faq=blocks.find(b=>b.id==='faq');if(faq){const target=D.all(faq.node,n=>D.has(n,'fb-fold-body'))[0]||faq.node;target.children.push(...nativeFaq);}else blocks.push({id:'faq',title:strings[6],node:D.el('div',{class:'blk faq',id:'faq'},[D.el('h2',{},[strings[6]]),...nativeFaq])});}
 if(!blocks.some(b=>b.id==='nel-tool-graph'))blocks.push({id:'nel-tool-graph',node:graphFor(slug,locale,strings,D.parse(html)),title:strings[1]});
 for(const node of related)D.set(node,'data-nel-v3-related','authored');blocks.find(b=>b.id==='nel-tool-graph').node.children.push(...related);
 const rank=id=>anchors.includes(id)?anchors.indexOf(id):8.5;
 blocks.sort((a,b)=>rank(a.id)-rank(b.id));for(const b of blocks){toc.children.push(D.el('a',{href:'#'+b.id},[b.title]));if(!foldAnchors.has(b.id)&&b.node.tag==='details'){const tag=b.id==='faq'?'div':'section';b.node.tag=tag;b.node.start=b.node.start.replace(/^<details/,'<'+tag);b.node.end='</'+tag+'>';D.set(b.node,'class',b.id==='faq'?'blk faq':b.id==='pon-toolkit'?'content-section nel-tool-supporting-section':'blk');const sum=b.node.children.find(n=>typeof n!=='string'&&n.tag==='summary');if(sum){sum.tag='h2';sum.start='<h2>';sum.end='</h2>';}}if(b.id==='nel-tool-graph')prose.children.push('<!-- NEL_TOOL_GRAPH_START -->',b.node,'<!-- NEL_TOOL_GRAPH_END -->');else prose.children.push(b.node);}main.children.push(below);
 // Adapt shared input/result surfaces without moving any form/result controls.
 for(const n of D.all(main,n=>D.has(n,'nel-tool-input')||D.has(n,'input-panel'))){D.add(n,'fb-panel');}
 for(const n of D.all(main,n=>D.has(n,'nel-tool-result')||D.has(n,'result-panel'))){D.add(n,'readout');}
 for(const n of D.all(main,n=>D.has(n,'field')||D.has(n,'form-group')))D.add(n,'f');
 for(const n of D.all(main,n=>D.has(n,'form-grid')))D.add(n,'fields');
 for(const n of main.children.filter(n=>typeof n!=='string'&&n.tag==='section'&&D.has(n,'card'))){if(D.attr(n,'id')==='result'||D.attr(n,'aria-live')||D.has(n,'result-card')||D.has(n,'metrics'))D.add(n,'readout','nel-tool-result');else if(D.all(n,c=>['input','select','textarea'].includes(c.tag)).length)D.add(n,'fb-panel','nel-tool-input');}
 if(require('./lib/supplemental-tool-slugs').has(slug)&&main.children.some(n=>typeof n!=='string'&&D.has(n,'nel-tool-result')))D.add(main,'nel-tool-grid','nel-tool-primary-grid');
 D.set(body,'data-nel-v3-migrated','1');normalizeBreadcrumbs(dom);normalizeDocs(dom);normalizePanels(dom,slug);normalizeSupporting(dom,locale);const output=D.render(dom);sameInvariant(before,signature(D.parse(output)));return output;
}
function run(){require('./lib/tool-v3-styles').generate();let changed=0,pages=0;for(const slug of slugs)for(const locale of ['en','zh','es']){const file=path.join(root,'website/tools',slug,locale==='en'?'':locale,'index.html');if(!fs.existsSync(file)){if(require('./lib/supplemental-tool-slugs').has(slug))continue;throw Error('Missing locale '+file);}pages++;const html=fs.readFileSync(file,'utf8'),next=migrate(html,slug,locale);if(next!==html){write(file,next);changed++;}}console.log(JSON.stringify({tools:slugs.length,pages,changed,preserved:[...preserved]}));}
module.exports={migrate,run,slugs,preserved,anchors,foldAnchors,signature};if(require.main===module)run();
