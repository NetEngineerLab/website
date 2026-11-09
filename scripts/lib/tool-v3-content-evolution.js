'use strict';
const assert=require('assert/strict'),D=require('./tool-v3-dom'),{visibleFaq}=require('./seo-resolver'),approved=require('./tool-v3-approved-content-revisions.json');
const scriptRevisions=require('./tool-v3-approved-script-revisions.json'),crypto=require('crypto');
const scriptSha=raw=>crypto.createHash('sha256').update(raw).digest('hex');
const normalize=text=>String(text||'').replace(/\s+/g,' ').trim();
function validateFaqSchemaEvolution(script,nextDom,slug,locale){
 const route=slug+'/'+locale;if(!approved.faqLocales.includes(route))return false;
 const oldScript=D.all(D.parse(script),n=>n.tag==='script')[0];if(!oldScript||D.attr(oldScript,'data-nel-schema')!=='faq')return false;
 const old=JSON.parse(oldScript.children.join(''));if(old['@type']!=='FAQPage')return false;
 const nextScripts=D.all(nextDom,n=>n.tag==='script'&&D.attr(n,'data-nel-schema')==='faq');assert.equal(nextScripts.length,1,route+' authorized FAQ has exactly one schema owner');
 const next=JSON.parse(nextScripts[0].children.join(''));assert.equal(next['@type'],'FAQPage');
 const entities=next.mainEntity.map(q=>{assert.equal(q['@type'],'Question');assert.equal(q.acceptedAnswer['@type'],'Answer');return{name:normalize(q.name),answer:normalize(q.acceptedAnswer.text)}});
 assert.deepEqual(entities,visibleFaq(D.render(nextDom)).map(q=>({name:normalize(q.name),answer:normalize(q.answer)})),route+' evolved FAQ schema must match every visible question/answer in order');
 for(const question of old.mainEntity){const retained=entities.find(q=>q.name===normalize(question.name));assert(retained,route+' original FAQ question retained: '+question.name);assert(retained.answer.includes(normalize(question.acceptedAnswer.text)),route+' original FAQ answer retained: '+question.name);}
 return true;
}
function hasApprovedProseChange(slug,locale,before,currentText){return approved.proseErrata.some(change=>change.route===slug+'/'+locale&&normalize(change.before)===normalize(before)&&currentText.includes(normalize(change.after)));}
function approvedInlineReplacement(script,nextScripts,slug,locale){
 const pair=scriptRevisions.inlinePairs.find(p=>p.route===slug+'/'+locale&&p.beforeSha256===scriptSha(script));
 if(!pair)return script;
 const matches=nextScripts.filter(raw=>scriptSha(raw)===pair.afterSha256);
 assert.equal(matches.length,1,slug+'/'+locale+' exact approved inline replacement must occur once');
 return matches[0];
}
function approvedOriginalControls(before,after,slug,locale){
 const pairs=require('./tool-v3-approved-control-revisions.json').pairs.filter(pair=>pair.route===slug+'/'+locale);
 return before.map(raw=>{const pair=pairs.find(pair=>pair.before===raw);if(!pair)return raw;assert.equal(after.filter(raw=>raw===pair.after).length,1,slug+'/'+locale+' exact approved control revision '+pair.id);return pair.after;}).sort();
}
module.exports={validateFaqSchemaEvolution,hasApprovedProseChange,approvedInlineReplacement,approvedOriginalControls};
